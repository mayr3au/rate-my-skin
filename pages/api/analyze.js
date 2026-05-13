import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '../../lib/supabase';
import {
  applyCors, getClientIp,
  checkRateLimit, verifyCaptcha,
  validateImage, sanitiseText,
  logSecurityEvent,
} from '../../lib/security';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

const FREE_LIMIT = 2;

const SYSTEM_PROMPT = `You are an expert skin analyst and dermatology advisor.
Analyze the uploaded face photo and respond ONLY with a RAW JSON object.
No markdown backticks, no introduction, no explanation.

IMPORTANT: Provide ALL descriptive text fields in BOTH English ("en") and French ("fr").

Use this exact JSON structure:
{
  "overall": 82,
  "summary": { "en": "Example summary.", "fr": "Résumé d'exemple." },
  "faceShape": { "en": "Oval", "fr": "Ovale" },
  "eyeColor": { "en": "Brown", "fr": "Marron" },
  "skinTone": { "en": "Fair", "fr": "Claire" },
  "metrics": [
    { 
      "key": "hydration",
      "label": { "en": "Skin Hydration & Plumpness", "fr": "Hydratation & Rebond" },
      "score": 85, 
      "grade": "A", 
      "detail": { "en": "English detail.", "fr": "Détail en français." }
    },
    { "key": "pores", "label": { "en": "Pore Size & Texture", "fr": "Pores & Texture" }, "score": 70, "grade": "B", "detail": { "en": "...", "fr": "..." } },
    { "key": "radiance", "label": { "en": "Evenness & Radiance", "fr": "Éclat" }, "score": 75, "grade": "B", "detail": { "en": "...", "fr": "..." } },
    { "key": "acne", "label": { "en": "Blemishes & Acne", "fr": "Acné" }, "score": 90, "grade": "A", "detail": { "en": "...", "fr": "..." } },
    { "key": "hyperpigmentation", "label": { "en": "Dark Spots", "fr": "Taches" }, "score": 80, "grade": "A-", "detail": { "en": "...", "fr": "..." } },
    { "key": "under_eye", "label": { "en": "Under-Eye", "fr": "Regard" }, "score": 65, "grade": "C", "detail": { "en": "...", "fr": "..." } },
    { "key": "symmetry", "label": { "en": "Symmetry", "fr": "Symétrie" }, "score": 88, "grade": "A", "detail": { "en": "...", "fr": "..." } },
    { "key": "harmony", "label": { "en": "Harmony", "fr": "Harmonie" }, "score": 85, "grade": "A", "detail": { "en": "...", "fr": "..." } }
  ],
  "strengths": [
    { "title": { "en": "Title", "fr": "Titre" }, "desc": { "en": "Desc", "fr": "Description" } }
  ],
  "improvements": [
    { "title": { "en": "Title", "fr": "Titre" }, "desc": { "en": "Desc", "fr": "Description" } }
  ],
  "recommendations": [
    { "category": { "en": "Routine", "fr": "Routine" }, "priority": "HIGH", "items": [ { "en": "Item", "fr": "Article" } ] }
  ]
}`;

export default async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────────────────────
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const ip = getClientIp(req);
  const supabase = createAdminClient();

  // ── Rate limiting ───────────────────────────────────────────────────────────
  const limited = await checkRateLimit(supabase, ip, 5);
  if (limited) return res.status(429).json({ error: 'Too many requests.' });

  const { userId, imageBase64, mimeType, skinConcern, captchaToken } = req.body;

  if (!userId) return res.status(400).json({ error: 'Invalid request.' });
  const imageError = validateImage(imageBase64, mimeType);
  if (imageError) return res.status(400).json({ error: imageError });

  const cleanSkinConcern = sanitiseText(skinConcern, 500);

  const captchaOk = await verifyCaptcha(captchaToken);
  if (!captchaOk) return res.status(403).json({ error: 'Captcha failed.' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Config error.' });

  let { data: user, error: fetchError } = await supabase.from('users').select('*').eq('id', userId).single();
  if (!user) {
    const { data: n } = await supabase.from('users').insert({ id: userId }).select().single();
    user = n;
  }

  if (user.analyses_used >= (FREE_LIMIT + user.paid_credits)) {
    return res.status(402).json({ error: 'Quota exceeded' });
  }

  // ── Call Claude ─────────────────────────────────────────────────────────────
  let rawText;
  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2500,
      system: [{ type: 'text', text: SYSTEM_PROMPT }],
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: `Analyze the photo. User concern: ${cleanSkinConcern || 'none'}. Return dual-language JSON.` }
        ]
      }]
    });
    rawText = message.content[0].text;
  } catch (err) {
    return res.status(500).json({ error: 'AI analysis failed.' });
  }

  // ── Parse JSON ──────────────────────────────────────────────────────────────
  let analysisData;
  try {
    // Robust extraction: find the first { and last }
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found');
    const jsonStr = rawText.substring(start, end + 1);
    analysisData = JSON.parse(jsonStr);
  } catch (parseErr) {
    console.error('[analyze] Parse error. Raw content:', rawText);
    return res.status(500).json({ error: 'Could not parse analysis.' });
  }

  // ── Increment usage ─────────────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('users')
    .update({ analyses_used: user.analyses_used + 1, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (updateError) console.error('[analyze] usage update error (non-fatal):', updateError);

  // ── Match weak metrics → products ───────────────────────────────────────────
  function metricToProblem(key) {
    const k = (key || '').toLowerCase();
    if (['hydration', 'plumpness'].includes(k)) return 'dryness';
    if (k === 'pores')                          return 'pores';
    if (['acne', 'blemishes'].includes(k))      return 'acne';
    if (['hyperpigmentation', 'dark_spots'].includes(k)) return 'hyperpigmentation';
    if (['under_eye', 'fatigue'].includes(k))   return 'dark_circles';
    if (['radiance', 'evenness'].includes(k))   return 'radiance';
    if (k === 'texture')                        return 'texture';
    return null;
  }

  const problemKeys = [...new Set(
    (analysisData.metrics || [])
      .filter(m => metricToProblem(m.key) && m.score < 80)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(m => metricToProblem(m.key))
      .filter(Boolean)
  )];

  let productRecommendations = [];
  if (problemKeys.length > 0) {
    const { data: rows, error: productErr } = await supabase
      .from('products')
      .select('skin_problem, product_name, product_description, amazon_affiliate_link, sephora_affiliate_link, price_range')
      .in('skin_problem', problemKeys);
    
    if (productErr) {
      console.error('[analyze] products query error (non-fatal):', productErr);
    } else {
      productRecommendations = (rows || []).map(row => ({
        problem_name: row.skin_problem,
        product_name: row.product_name,
        description: row.product_description,
        price_range: row.price_range,
        affiliate_links: {
          amazon: row.amazon_affiliate_link,
          sephora: row.sephora_affiliate_link
        }
      }));
    }
  }

  console.log('[analyze] done');
  return res.status(200).json({
    data: analysisData,
    productRecommendations,
    analysesUsed: user.analyses_used + 1,
    paidCredits: user.paid_credits,
  });
}
