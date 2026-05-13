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
Focus primarily on skin quality, condition, and health — not general facial aesthetics.
The overall score should reflect skin health above all else.
Use this exact structure:
{
  "overall": <number 0-100>,
  "summary": "<2 sentence honest summary focused on skin health and condition>",
  "faceShape": "<e.g. Oval, Round, Square>",
  "eyeColor": "<e.g. Brown, Blue-Grey>",
  "skinTone": "<e.g. Fair / Fitzpatrick Type II>",
  "metrics": [
    { "label": "Skin Hydration & Plumpness", "score": <0-100>, "grade": "<A/B/C+/etc>", "detail": "<1-2 sentence analysis of moisture levels, plumpness, and dehydration signs>" },
    { "label": "Pore Size & Texture", "score": <0-100>, "grade": "...", "detail": "<assess visible pore size, skin texture smoothness, and roughness>" },
    { "label": "Evenness & Radiance", "score": <0-100>, "grade": "...", "detail": "<assess skin tone uniformity, glow, and dullness>" },
    { "label": "Blemishes & Acne", "score": <0-100>, "grade": "...", "detail": "<assess active breakouts, blackheads, scarring from acne>" },
    { "label": "Dark Spots & Hyperpigmentation", "score": <0-100>, "grade": "...", "detail": "<assess sun spots, post-inflammatory marks, melasma, or uneven pigmentation>" },
    { "label": "Under-Eye & Fatigue Signs", "score": <0-100>, "grade": "...", "detail": "<assess dark circles, puffiness, fine lines under eyes, and signs of tiredness>" },
    { "label": "Facial Symmetry", "score": <0-100>, "grade": "...", "detail": "<secondary metric: brief assessment of facial symmetry>" },
    { "label": "Overall Harmony", "score": <0-100>, "grade": "...", "detail": "<secondary metric: brief assessment of facial balance and proportion>" }
  ],
  "strengths": [
    { "title": "...", "desc": "..." },
    { "title": "...", "desc": "..." },
    { "title": "...", "desc": "..." }
  ],
  "improvements": [
    { "title": "...", "desc": "..." },
    { "title": "...", "desc": "..." },
    { "title": "...", "desc": "..." }
  ],
  "recommendations": [
    { "category": "Morning Routine", "priority": "HIGH", "items": ["<specific product type or ingredient, e.g. Vitamin C serum>", "<SPF 30-50 broad-spectrum sunscreen>", "..."] },
    { "category": "Evening Routine", "priority": "HIGH", "items": ["<e.g. gentle double cleanse>", "<e.g. retinol or retinoid>", "..."] },
    { "category": "Treatments & Actives", "priority": "MEDIUM", "items": ["<e.g. AHA/BHA exfoliant 2x per week>", "<targeted serum for identified concern>", "..."] },
    { "category": "Lifestyle & Diet", "priority": "MEDIUM", "items": ["<e.g. increase water intake>", "<e.g. reduce sugar for acne>", "..."] }
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
              `Write ALL text fields in ${lang === 'fr' ? 'French' : 'English'}.`,
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
  function metricToProblem(label) {
    const l = label.toLowerCase();
    if (l.includes('hydrat') || l.includes('plump')) return 'dryness';
    if (l.includes('pore'))                           return 'pores';
    if (l.includes('acne') || l.includes('blemish')) return 'acne';
    if (l.includes('dark spot') || l.includes('hyperpigment') || l.includes('pigment')) return 'hyperpigmentation';
    if (l.includes('under-eye') || l.includes('fatigue') || l.includes('dark circle')) return 'dark_circles';
    if (l.includes('radianc') || l.includes('even')) return 'radiance';
    if (l.includes('texture'))                        return 'texture';
    return null;
  }

  const problemKeys = [...new Set(
    (analysisData.metrics || [])
      .filter(m => metricToProblem(m.label) && m.score < 80)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(m => metricToProblem(m.label))
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
