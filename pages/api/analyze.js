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
Analyze the uploaded face photo and respond ONLY with a valid JSON object.
No markdown, no explanation, just raw JSON.

IMPORTANT: Provide ALL descriptive text fields in BOTH English ("en") and French ("fr").

Use this exact structure:
{
  "overall": <number 0-100>,
  "summary": { "en": "...", "fr": "..." },
  "faceShape": { "en": "...", "fr": "..." },
  "eyeColor": { "en": "...", "fr": "..." },
  "skinTone": { "en": "...", "fr": "..." },
  "metrics": [
    { 
      "key": "hydration",
      "label": { "en": "Skin Hydration & Plumpness", "fr": "Hydratation & Rebond de la peau" },
      "score": <0-100>, 
      "grade": "...", 
      "detail": { "en": "...", "fr": "..." }
    },
    { 
      "key": "pores",
      "label": { "en": "Pore Size & Texture", "fr": "Taille des Pores & Texture" },
      "score": <0-100>, "grade": "...", "detail": { "en": "...", "fr": "..." } 
    },
    { 
      "key": "radiance",
      "label": { "en": "Evenness & Radiance", "fr": "Uniformité & Éclat" },
      "score": <0-100>, "grade": "...", "detail": { "en": "...", "fr": "..." } 
    },
    { 
      "key": "acne",
      "label": { "en": "Blemishes & Acne", "fr": "Imperfections & Acné" },
      "score": <0-100>, "grade": "...", "detail": { "en": "...", "fr": "..." } 
    },
    { 
      "key": "hyperpigmentation",
      "label": { "en": "Dark Spots & Hyperpigmentation", "fr": "Taches Brunes & Hyperpigmentation" },
      "score": <0-100>, "grade": "...", "detail": { "en": "...", "fr": "..." } 
    },
    { 
      "key": "under_eye",
      "label": { "en": "Under-Eye & Fatigue Signs", "fr": "Regard & Signes de Fatigue" },
      "score": <0-100>, "grade": "...", "detail": { "en": "...", "fr": "..." } 
    },
    { 
      "key": "symmetry",
      "label": { "en": "Facial Symmetry", "fr": "Symétrie Faciale" },
      "score": <0-100>, "grade": "...", "detail": { "en": "...", "fr": "..." } 
    },
    { 
      "key": "harmony",
      "label": { "en": "Overall Harmony", "fr": "Harmonie Globale" },
      "score": <0-100>, "grade": "...", "detail": { "en": "...", "fr": "..." } 
    }
  ],
  "strengths": [
    { "title": { "en": "...", "fr": "..." }, "desc": { "en": "...", "fr": "..." } }
  ],
  "improvements": [
    { "title": { "en": "...", "fr": "..." }, "desc": { "en": "...", "fr": "..." } }
  ],
  "recommendations": [
    { "category": { "en": "Morning Routine", "fr": "Routine du Matin" }, "priority": "HIGH", "items": [ { "en": "...", "fr": "..." } ] },
    { "category": { "en": "Evening Routine", "fr": "Routine du Soir" }, "priority": "HIGH", "items": [ { "en": "...", "fr": "..." } ] },
    { "category": { "en": "Treatments & Actives", "priority": "MEDIUM", "items": [ { "en": "...", "fr": "..." } ] },
    { "category": { "en": "Lifestyle & Diet", "priority": "MEDIUM", "items": [ { "en": "...", "fr": "..." } ] }
  ]
}`;

export default async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────────────────────
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const ip = getClientIp(req);
  const supabase = createAdminClient();

  // ── Rate limiting: 5 analyses per IP per hour ───────────────────────────────
  const limited = await checkRateLimit(supabase, ip, 5);
  if (limited) {
    await logSecurityEvent(supabase, { ip, event: 'rate_limit', details: { path: '/api/analyze' } });
    console.warn('[analyze] rate limited:', ip);
    return res.status(429).json({ error: 'Too many requests. Please wait before trying again.' });
  }

  // ── Input validation ────────────────────────────────────────────────────────
  const { userId, imageBase64, mimeType, lang, skinConcern, captchaToken } = req.body;

  if (!userId || typeof userId !== 'string' || userId.length > 128) {
    return res.status(400).json({ error: 'Invalid request.' });
  }

  const imageError = validateImage(imageBase64, mimeType);
  if (imageError) {
    await logSecurityEvent(supabase, { ip, event: 'invalid_input', details: { reason: imageError, userId } });
    console.warn('[analyze] invalid image from', ip, '—', imageError);
    return res.status(400).json({ error: imageError });
  }

  const cleanSkinConcern = sanitiseText(skinConcern, 500);

  // ── reCAPTCHA ───────────────────────────────────────────────────────────────
  const captchaOk = await verifyCaptcha(captchaToken);
  if (!captchaOk) {
    await logSecurityEvent(supabase, { ip, event: 'captcha_fail', details: { userId } });
    console.warn('[analyze] captcha failed for', ip);
    return res.status(403).json({ error: 'Request blocked. Please refresh and try again.' });
  }

  // ── Anthropic API key ───────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[analyze] ANTHROPIC_API_KEY missing');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  console.log('[analyze] userId:', userId, '| ip:', ip, '| mimeType:', mimeType);

  // ── Supabase: get or create user ────────────────────────────────────────────
  let { data: user, error: fetchError } = await supabase
    .from('users')
    .select('analyses_used, paid_credits')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code === 'PGRST116') {
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ id: userId, analyses_used: 0, paid_credits: 0 })
      .select()
      .single();
    if (createError) {
      console.error('[analyze] failed to create user:', createError);
      return res.status(500).json({ error: 'Failed to initialise user.' });
    }
    user = newUser;
  } else if (fetchError) {
    console.error('[analyze] Supabase fetch error:', fetchError);
    return res.status(500).json({ error: 'Database error.' });
  }

  // ── Quota check ─────────────────────────────────────────────────────────────
  const totalAllowed = FREE_LIMIT + user.paid_credits;
  if (user.analyses_used >= totalAllowed) {
    await logSecurityEvent(supabase, { ip, event: 'quota_exceeded', details: { userId, analyses_used: user.analyses_used } });
    console.log('[analyze] quota exceeded — userId:', userId);
    return res.status(402).json({
      error: 'No analyses remaining.',
      analysesUsed: user.analyses_used,
      paidCredits: user.paid_credits,
    });
  }

  // ── Call Claude ─────────────────────────────────────────────────────────────
  console.log('[analyze] calling Anthropic API...');
  const claudeStart = Date.now();
  let rawText;
  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageBase64 },
          },
          {
            type: 'text',
            text: [
              'Analyze this face photo and return the JSON report.',
              'Fill ALL descriptive text fields in BOTH English ("en") and French ("fr") as per the schema.',
              cleanSkinConcern
                ? `The user's stated skin concern is: "${cleanSkinConcern}". Factor this throughout your analysis: reference it explicitly in the summary, weight the most relevant metrics accordingly, and make sure the improvements and recommendations directly address this concern.`
                : '',
            ].filter(Boolean).join('\n\n'),
          },
        ],
      }],
    });
    rawText = message.content[0].text;
    console.log('[analyze] Anthropic responded in', Date.now() - claudeStart, 'ms');
  } catch (err) {
    console.error('[analyze] Anthropic error after', Date.now() - claudeStart, 'ms:', err.message);
    return res.status(500).json({ error: 'AI analysis failed. Please try again.' });
  }

  // ── Parse JSON ──────────────────────────────────────────────────────────────
  let analysisData;
  try {
    const cleaned = rawText.replace(/^```(?:json)?\n?|\n?```$/g, '').trim();
    analysisData = JSON.parse(cleaned);
    console.log('[analyze] parsed — overall score:', analysisData.overall);
  } catch (parseErr) {
    console.error('[analyze] JSON parse error:', parseErr.message);
    return res.status(500).json({ error: 'Could not parse analysis. Please try again.' });
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
