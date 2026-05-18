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

const buildSystemPrompt = (lang, availableProducts) => `You are a senior dermatologist and aesthetic skin specialist with 20 years of clinical experience. You analyse skin photographs with the precision of a clinical assessment, using professional dermatological terminology throughout.

Respond entirely in ${lang === 'fr' ? 'French' : 'English'}.

━━━ STEP 1 — FACE VALIDATION (mandatory first check) ━━━
Examine the image. Determine: does it show a human face clearly enough for dermatological skin analysis?

If NO face is detected, respond with this exact JSON and nothing else:
{ "error": "no_face", "message": "<describe in 1 sentence what the image shows instead, e.g. 'The image shows a landscape, not a face.'>" }

If YES, proceed to Step 2.

━━━ STEP 2 — CLINICAL ANALYSIS ━━━
ANALYSIS PRIORITY:
1. PRIMARY — Visual evidence in the photograph: what you clinically observe in the skin, pores, pigmentation, texture, and structure.
2. SECONDARY — User's stated concern (provided after the image): use only to add context or confirm what the photo already shows. Never let the stated concern override visual evidence.

Write like a dermatologist documenting findings:
- Describe what you see: "The periorbital region shows..." not "You have dark circles"
- Use clinical language: seborrheic activity, transepidermal water loss, post-inflammatory hyperpigmentation, comedonal acne, periorbital hyperpigmentation, etc.
- Be precise: "Grade II comedonal acne concentrated in the T-zone" not "some pimples"
- Strengths and improvements must reference specific visible features, not generic advice

AVAILABLE PRODUCTS WITH AFFILIATE LINKS:
${JSON.stringify(availableProducts, null, 2)}

Respond ONLY with RAW JSON (no markdown, no code blocks). Return EXACTLY this structure:
{
  "overall": <integer 0-100>,
  "summary": "<1 authoritative sentence describing the primary clinical finding visible in the photo, e.g. 'Periorbital hyperpigmentation and mild sebaceous hyperactivity are the dominant findings in this analysis.'>",
  "faceShape": "<clinical descriptor, e.g. 'Oval', 'Square', 'Heart'>",
  "eyeColor": "<colour>",
  "skinTone": "<Fitzpatrick scale + descriptor, e.g. 'Type III — Medium Beige'>",
  "free_version": {
    "mainProblems": [
      { "title": "<clinical term for issue>", "description": "<2 sentences: what the photo shows clinically, then why it matters>", "severity": "mild" },
      { "title": "...", "description": "...", "severity": "moderate" },
      { "title": "...", "description": "...", "severity": "significant" }
    ],
    "basicSummary": "<2-3 sentences in expert voice: overall skin health assessment based on photo, referencing visible evidence. Mention that the full report includes metric scores, a targeted routine, and matched product recommendations.>"
  },
  "paid_version": {
    "metrics": [
      { "label": "Hydration", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "<clinical observation, e.g. 'Surface desquamation and tightness lines indicate compromised barrier function and reduced NMF levels.'>" },
      { "label": "Pores", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Radiance", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Acne", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Dark Spots", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Under-Eye", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Symmetry", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Harmony", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." }
    ],
    "strengths": [
      { "title": "<specific visible strength>", "desc": "<clinical explanation of why this is a strength, referencing the photo>" },
      { "title": "...", "desc": "..." }
    ],
    "improvements": [
      { "title": "<specific improvement area>", "desc": "<clinical rationale and what targeted intervention would achieve>" },
      { "title": "...", "desc": "..." }
    ],
    "routine": {
      "morning": ["<Step 1: specific product type with clinical rationale>", "<Step 2>", "<Step 3>"],
      "evening": ["<Step 1>", "<Step 2>", "<Step 3>"],
      "weekly": ["<Treatment 1 with frequency>", "<Treatment 2 with frequency>"]
    },
    "productRecommendations": [
      {
        "skinProblem": "<matches detected issue>",
        "productName": "<exact product name from AVAILABLE PRODUCTS>",
        "description": "<2 sentences: clinical reason this product addresses the specific finding visible in the photo>",
        "amazonLink": "<exact link from AVAILABLE PRODUCTS>",
        "sephoraLink": "<exact link from AVAILABLE PRODUCTS>",
        "price": "<price from AVAILABLE PRODUCTS>"
      }
    ]
  }
}

CRITICAL RULES:
- mainProblems MUST have EXACTLY 3 items; severity values: mild | moderate | significant
- metrics MUST have EXACTLY 8 items in the exact label order listed above
- productRecommendations MUST use product names, links, and prices EXACTLY as listed in AVAILABLE PRODUCTS — no invented URLs
- Match products to the skin problems visible in the photo
- routine steps must be specific (e.g. "Apply niacinamide serum to address visible sebaceous hyperactivity") not generic
- Do NOT wrap output in markdown code blocks
- User's stated concern is context only — analysis must be grounded in what the photo shows`;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  // Env-var health check — visible in Vercel function logs
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  console.log('[analyze] START — SUPABASE_URL:', hasUrl, '| SERVICE_KEY:', hasServiceKey, '| ANTHROPIC:', hasAnthropicKey);

  if (!hasServiceKey) {
    console.error('[analyze] ❌ FATAL: SUPABASE_SERVICE_ROLE_KEY is not set — DB inserts will fail');
  }
  if (!hasUrl) {
    console.error('[analyze] ❌ FATAL: NEXT_PUBLIC_SUPABASE_URL is not set');
  }

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

    // 2. Call Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3500,
      system: [{ type: 'text', text: buildSystemPrompt(lang, formattedProducts) }],
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: skinConcern
            ? `User's stated skin concern (secondary context only): ${skinConcern}`
            : 'No stated skin concern — base analysis entirely on the photo.' },
        ]
      }]
    });

    const raw = message.content[0].text;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Invalid JSON response from Claude');
    const analysisData = JSON.parse(raw.substring(start, end + 1));

    // Handle face-validation rejection from Claude
    if (analysisData.error === 'no_face') {
      console.log('[analyze] no face detected —', analysisData.message);
      return res.status(422).json({ error: 'no_face', message: analysisData.message });
    }

    // Inject product image URLs server-side (don't trust Claude to supply URLs)
    if (analysisData.paid_version?.productRecommendations) {
      analysisData.paid_version.productRecommendations =
        analysisData.paid_version.productRecommendations.map(rec => ({
          ...rec,
          imageUrl: imageByName[rec.productName?.toLowerCase()] || null,
        }));
    }

    // 3. Generate IDs
    const analysisId = crypto.randomUUID();
    const effectiveUserId = userId || crypto.randomUUID();
    console.log('[analyze] userId from client:', userId || 'null (server-generated)', '| effectiveUserId:', effectiveUserId);

    // 4. Read existing user (need paid_unlocks before touching the row)
    const { data: existingUser } = await supabase
      .from('users')
      .select('analyses_used, paid_unlocks')
      .eq('id', effectiveUserId)
      .single();

    const currentPaidUnlocks = existingUser?.paid_unlocks || 0;
    console.log('[analyze] user exists:', !!existingUser, '| paid_unlocks:', currentPaidUnlocks);

    // 5. Persist user row — update analyses_used only (never touch paid_unlocks here)
    let userSaved = false;
    if (existingUser) {
      const { error: updateErr } = await supabase
        .from('users')
        .update({ analyses_used: (existingUser.analyses_used || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', effectiveUserId);
      userSaved = !updateErr;
      if (updateErr) console.error('[analyze] ❌ user update failed:', updateErr.message, updateErr.code);
      else console.log('[analyze] ✅ user updated:', effectiveUserId);
    } else {
      const { error: insertErr } = await supabase
        .from('users')
        .insert({ id: effectiveUserId, analyses_used: 1, paid_credits: 0, paid_unlocks: 0 });
      userSaved = !insertErr;
      if (insertErr) console.error('[analyze] ❌ user insert failed:', insertErr.message, insertErr.code, insertErr.hint);
      else console.log('[analyze] ✅ user created:', effectiveUserId);
    }

    // 6. Insert analysis row (is_paid starts false; may be upgraded below)
    const analysisUserId = userSaved ? effectiveUserId : null;
    console.log('[analyze] inserting analysis — id:', analysisId, '| user_id:', analysisUserId);

    const { error: analysisInsertErr } = await supabase
      .from('analyses')
      .insert({
        id: analysisId,
        user_id: analysisUserId,
        skin_concern: skinConcern || null,
        report_json: analysisData,
        is_paid: false,
      });

    if (analysisInsertErr) {
      console.error('[analyze] ❌ analysis insert failed:', analysisInsertErr.message,
        '| code:', analysisInsertErr.code, '| hint:', analysisInsertErr.hint);
    } else {
      console.log('[analyze] ✅ analysis saved — id:', analysisId);
    }

    // 7. Auto-unlock if user has paid_unlocks remaining
    let isPaidOnCreate = false;
    let paidUnlocksLeft = currentPaidUnlocks;

    if (currentPaidUnlocks > 0 && !analysisInsertErr) {
      console.log('[analyze] auto-unlock: paid_unlocks available =', currentPaidUnlocks);
      const { error: unlockErr } = await supabase
        .from('analyses')
        .update({ is_paid: true })
        .eq('id', analysisId);

      if (unlockErr) {
        console.error('[analyze] ❌ auto-unlock failed:', unlockErr.message);
      } else {
        const { error: decrErr } = await supabase
          .from('users')
          .update({ paid_unlocks: currentPaidUnlocks - 1 })
          .eq('id', effectiveUserId);
        if (decrErr) {
          console.error('[analyze] ❌ paid_unlocks decrement failed:', decrErr.message);
        } else {
          isPaidOnCreate = true;
          paidUnlocksLeft = currentPaidUnlocks - 1;
          console.log('[analyze] ✅ auto-unlocked, paid_unlocks remaining:', paidUnlocksLeft);
        }
      }
    }

    return res.status(200).json({ data: analysisData, analysisId, userId: effectiveUserId, isPaid: isPaidOnCreate, paidUnlocksLeft });

  } catch (err) {
    console.error('[analyze] error:', err.message);
    return res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
}