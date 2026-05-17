import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '../../lib/supabase';
import {
  applyCors, getClientIp,
  checkRateLimit, verifyCaptcha,
  validateImage, sanitiseText,
} from '../../lib/security';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

const buildSystemPrompt = (lang, availableProducts) => `You are an expert skin analyst optimizing skincare recommendations for conversion.
Analyze the photo AND the user's stated skin concern, then respond ONLY with RAW JSON (no markdown).
Respond entirely in ${lang === 'fr' ? 'French' : 'English'}.

AVAILABLE PRODUCTS WITH AFFILIATE LINKS:
${JSON.stringify(availableProducts, null, 2)}

Return EXACTLY this structure:
{
  "overall": <integer 0-100>,
  "summary": "<one compelling sentence that sells the problem>",
  "faceShape": "<shape>",
  "eyeColor": "<color>",
  "skinTone": "<tone>",
  "free_version": {
    "mainProblems": [
      { "title": "...", "description": "1-2 sentences - make it URGENT", "severity": "mild" },
      { "title": "...", "description": "...", "severity": "moderate" },
      { "title": "...", "description": "...", "severity": "significant" }
    ],
    "basicSummary": "2-3 sentence assessment that teases the paid version"
  },
  "paid_version": {
    "metrics": [
      { "label": "Hydration", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Pores", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Radiance", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Acne", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Dark Spots", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Under-Eye", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Symmetry", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Harmony", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." }
    ],
    "strengths": [{ "title": "...", "desc": "..." }, { "title": "...", "desc": "..." }],
    "improvements": [{ "title": "...", "desc": "..." }, { "title": "...", "desc": "..." }],
    "routine": {
      "morning": ["Product 1", "Product 2", "Product 3"],
      "evening": ["Product 1", "Product 2", "Product 3"],
      "weekly": ["Treatment 1", "Treatment 2"]
    },
    "productRecommendations": [
      {
        "skinProblem": "acne",
        "productName": "...",
        "description": "...",
        "amazonLink": "https://amazon.fr/dp/...",
        "sephoraLink": "https://sephora.fr/...",
        "price": "€XX-XX"
      }
    ]
  }
}

CRITICAL RULES:
- mainProblems MUST have EXACTLY 3 items with severity: mild, moderate, or significant
- metrics MUST have EXACTLY 8 items in exact order listed
- productRecommendations MUST directly match detected skin problems from available products list
- ALWAYS use real product names, descriptions, AND affiliate links from AVAILABLE PRODUCTS
- Match products to skinProblems: if acne detected, recommend acne products; if dry_skin, recommend hydrating products
- Links MUST be exactly as provided (include affiliate tags)
- Make descriptions persuasive but honest (why THIS product solves THEIR problem)
- Do NOT wrap JSON in markdown code blocks
- ALWAYS consider the user's stated skin concern in recommendations
- If a product perfectly matches their concern, recommend it with its real link`;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  // Env-var health check — visible in Vercel function logs
  console.log('[analyze] env check — SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    '| SERVICE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    '| ANTHROPIC:', !!process.env.ANTHROPIC_API_KEY);

  const supabase = createAdminClient();
  const { userId, imageBase64, mimeType, lang, skinConcern, captchaToken } = req.body;

  try {
    // 1. Query available products from Supabase
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.error('[analyze] products query error:', productsError.message, productsError.code);
      // Don't hard-fail — continue with empty products so analysis still works
      console.warn('[analyze] continuing without products due to query error');
    }

    // Format products for Claude (clean structure)
    const safeProducts = products || [];
    const formattedProducts = safeProducts.map(p => ({
      skin_problem: p.skin_problem,
      product_name: p.product_name,
      description: p.product_description,
      amazon_link: p.amazon_link,
      sephora_link: p.sephora_link,
      price_range: p.price
    }));

    // Build image lookup map for server-side injection after Claude responds
    const imageByName = {};
    safeProducts.forEach(p => {
      if (p.product_name && p.product_image_url) {
        imageByName[p.product_name.toLowerCase()] = p.product_image_url;
      }
    });

    // 2. Call Claude with new optimized prompt + products
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system: [{ type: 'text', text: buildSystemPrompt(lang, formattedProducts) }],
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: `Analyze this skin photo thoroughly. User's stated skin concern: ${skinConcern || 'none specified'}. Recommend products from the available list that match their specific problems.` }
        ]
      }]
    });

    const raw = message.content[0].text;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Invalid JSON response from Claude');
    const analysisData = JSON.parse(raw.substring(start, end + 1));

    // Inject product image URLs server-side (don't trust Claude to supply URLs)
    if (analysisData.paid_version?.productRecommendations) {
      analysisData.paid_version.productRecommendations =
        analysisData.paid_version.productRecommendations.map(rec => ({
          ...rec,
          imageUrl: imageByName[rec.productName?.toLowerCase()] || null,
        }));
    }

    // 3. Generate analysis ID
    const analysisId = crypto.randomUUID();

    // 4. Resolve userId — fall back to server-generated UUID if client didn't send one
    const effectiveUserId = userId || crypto.randomUUID();
    console.log('[analyze] userId from client:', userId, '| effectiveUserId:', effectiveUserId);

    // 5. Upsert user row
    const { data: existingUser, error: fetchUserError } = await supabase
      .from('users')
      .select('analyses_used')
      .eq('id', effectiveUserId)
      .single();

    if (fetchUserError && fetchUserError.code !== 'PGRST116') {
      // PGRST116 = row not found, which is fine for new users
      console.error('[analyze] error fetching user:', fetchUserError.message, fetchUserError.code);
    }

    if (existingUser) {
      const { error: updateErr } = await supabase
        .from('users')
        .update({
          analyses_used: (existingUser.analyses_used || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', effectiveUserId);
      if (updateErr) console.error('[analyze] error updating user analyses_used:', updateErr.message);
    } else {
      const { error: insertUserErr } = await supabase
        .from('users')
        .insert({ id: effectiveUserId, analyses_used: 1, paid_credits: 0, paid_unlocks: 0 });
      if (insertUserErr) console.error('[analyze] error inserting new user:', insertUserErr.message, insertUserErr.code);
    }

    // 6. Insert analysis row
    console.log('[analyze] inserting analysis — id:', analysisId, 'user_id:', effectiveUserId);
    const { error: analysisInsertErr } = await supabase.from('analyses').insert({
      id: analysisId,
      user_id: effectiveUserId,
      skin_concern: skinConcern || null,
      report_json: analysisData,
      is_paid: false,
    });

    if (analysisInsertErr) {
      console.error('[analyze] ❌ analysis insert failed:', analysisInsertErr.message, '| code:', analysisInsertErr.code, '| details:', analysisInsertErr.details);
    } else {
      console.log('[analyze] ✅ analysis saved — id:', analysisId);
    }

    return res.status(200).json({ data: analysisData, analysisId, userId: effectiveUserId });

  } catch (err) {
    console.error('[analyze] error:', err.message);
    return res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
}