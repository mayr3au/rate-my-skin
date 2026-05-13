import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '../../lib/supabase';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const FREE_LIMIT = 1;

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
  if (req.method !== 'POST') return res.status(405).end();

  console.log('[analyze] request received');

  // Check API key early so a missing env var gives a clear error
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[analyze] ANTHROPIC_API_KEY is undefined — check .env.local');
    return res.status(500).json({ error: 'Server configuration error: missing API key.' });
  }
  console.log('[analyze] API key present, length:', apiKey.length);

  const { userId, imageBase64, mimeType } = req.body;

  if (!userId || !imageBase64) {
    console.error('[analyze] missing fields — userId:', !!userId, 'imageBase64:', !!imageBase64);
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  console.log('[analyze] userId:', userId, '| mimeType:', mimeType, '| imageBase64 length:', imageBase64.length);

  const supabase = createAdminClient();

  // Get or create user record
  console.log('[analyze] fetching user from Supabase...');
  let { data: user, error: fetchError } = await supabase
    .from('users')
    .select('analyses_used, paid_credits')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code === 'PGRST116') {
    console.log('[analyze] user not found, creating new record...');
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
    console.log('[analyze] new user created');
  } else if (fetchError) {
    console.error('[analyze] Supabase fetch error:', fetchError);
    return res.status(500).json({ error: 'Database error.' });
  } else {
    console.log('[analyze] user found — analyses_used:', user.analyses_used, '| paid_credits:', user.paid_credits);
  }

  const totalAllowed = FREE_LIMIT + user.paid_credits;
  if (user.analyses_used >= totalAllowed) {
    console.log('[analyze] quota exceeded for user:', userId);
    return res.status(402).json({
      error: 'No analyses remaining.',
      analysesUsed: user.analyses_used,
      paidCredits: user.paid_credits,
    });
  }

  // Call Claude
  console.log('[analyze] calling Anthropic API...');
  const claudeStart = Date.now();
  let rawText;
  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Analyze this face photo and return the JSON report.',
            },
          ],
        },
      ],
    });

    rawText = message.content[0].text;
    console.log('[analyze] Anthropic responded in', Date.now() - claudeStart, 'ms | response length:', rawText.length);
  } catch (err) {
    console.error('[analyze] Anthropic API error after', Date.now() - claudeStart, 'ms:', err.message, err.status ?? '');
    return res.status(500).json({ error: 'AI analysis failed. Please try again.' });
  }

  // Parse — strip accidental markdown fences if present
  console.log('[analyze] parsing JSON response...');
  let analysisData;
  try {
    const cleaned = rawText.replace(/^```(?:json)?\n?|\n?```$/g, '').trim();
    analysisData = JSON.parse(cleaned);
    console.log('[analyze] JSON parsed successfully, overall score:', analysisData.overall);
  } catch (parseErr) {
    console.error('[analyze] JSON parse error:', parseErr.message, '\nRaw text:', rawText);
    return res.status(500).json({ error: 'Could not parse analysis. Please try again.' });
  }

  // Increment usage
  console.log('[analyze] updating usage count...');
  const { error: updateError } = await supabase
    .from('users')
    .update({ analyses_used: user.analyses_used + 1, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (updateError) {
    console.error('[analyze] usage update error (non-fatal):', updateError);
  } else {
    console.log('[analyze] usage updated to', user.analyses_used + 1);
  }

  console.log('[analyze] done, sending response');
  return res.status(200).json({
    data: analysisData,
    analysesUsed: user.analyses_used + 1,
    paidCredits: user.paid_credits,
  });
}
