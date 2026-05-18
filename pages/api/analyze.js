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

const buildSystemPrompt = (lang, availableProducts) => `You are a friendly yet expert skin specialist — think of a knowledgeable dermatologist who also knows how to talk to real people. You analyse skin photographs with accuracy and care, then explain your findings in a warm, clear, and reassuring tone that anyone can understand.

Respond entirely in ${lang === 'fr' ? 'French' : 'English'}.

━━━ STEP 1 — FACE VALIDATION (mandatory first check) ━━━
Examine the image. Determine: does it show a human face clearly enough for skin analysis?

If NO face is detected, respond with this exact JSON and nothing else:
{ "error": "no_face", "message": "<describe in 1 sentence what the image shows instead, e.g. 'The image shows a landscape, not a face.'>" }

If YES, proceed to Step 2.

━━━ STEP 2 — SKIN ANALYSIS ━━━
ANALYSIS PRIORITY:
1. PRIMARY — Visual evidence in the photograph: what you observe in the skin, pores, pigmentation, texture, and structure.
2. SECONDARY — User's stated concern (provided after the image): use only to add context or confirm what the photo already shows. Never let the stated concern override visual evidence.

TONE & WRITING STYLE — this is the most important instruction:
- Write like a trusted expert talking to a friend: confident, clear, never condescending
- Address the person directly: "Your skin shows...", "You have great..." — not cold clinical third-person ("The periorbital region shows...")
- Use plain language first, then add the expert term in parentheses when it adds value: "dark circles (periorbital hyperpigmentation)" not just the jargon alone
- Be specific about what you see, but explain WHY it matters in everyday terms
- Always balance observations with encouragement — mention what's working well alongside areas to improve
- Routine steps should read like advice from a knowledgeable friend: practical, motivating, easy to follow
- Product descriptions should explain benefits in plain terms: "helps fade dark spots and even skin tone" not "inhibits melanogenesis"

AVAILABLE PRODUCTS WITH AFFILIATE LINKS:
${JSON.stringify(availableProducts, null, 2)}

Respond ONLY with RAW JSON (no markdown, no code blocks). Return EXACTLY this structure:
{
  "overall": <integer 0-100>,
  "summary": "<1 warm yet authoritative sentence summarising the main finding, e.g. 'Your skin is in great overall shape, with some dark circles and slight dehydration to address.'>",
  "faceShape": "<descriptor, e.g. 'Oval', 'Square', 'Heart'>",
  "skinType": "<skin type inferred from photo: 'Normal', 'Dry', 'Oily', 'Combination', or 'Sensitive'>",
  "skinTone": "<Fitzpatrick scale + plain descriptor, e.g. 'Type III — Medium Beige'>",
  "free_version": {
    "mainProblems": [
      { "title": "<short, clear name for the issue — avoid pure jargon>", "description": "<2 sentences: what you see in plain terms + why it matters and what causes it>", "severity": "mild" },
      { "title": "...", "description": "...", "severity": "moderate" },
      { "title": "...", "description": "...", "severity": "significant" }
    ],
    "basicSummary": "<2-3 sentences in a warm expert voice: honest skin health overview based on the photo, referencing what you can see. End by mentioning the full report includes detailed scores, a personalised routine, and matched product picks.>"
  },
  "paid_version": {
    "metrics": [
      { "label": "Hydration", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "<1-2 sentences: what you observe + what it means for the person, in plain language>" },
      { "label": "Pores", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Radiance", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Acne", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Dark Spots", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Under-Eye", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Symmetry", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." },
      { "label": "Harmony", "score": <0-100>, "grade": "<A|B|C|D>", "detail": "..." }
    ],
    "strengths": [
      { "title": "<specific visible strength, plain words>", "desc": "<why this is great and what it means for skin health, in an encouraging tone>" },
      { "title": "...", "desc": "..." }
    ],
    "improvements": [
      { "title": "<clear improvement area>", "desc": "<what to do about it and what result to expect, in practical motivating terms>" },
      { "title": "...", "desc": "..." }
    ],
    "routine": {
      "morning": ["<Step 1: what to use + why in one clear sentence>", "<Step 2>", "<Step 3>"],
      "evening": ["<Step 1>", "<Step 2>", "<Step 3>"],
      "weekly": ["<Treatment 1 with frequency, explained simply>", "<Treatment 2 with frequency>"]
    },
    "productRecommendations": [
      {
        "skinProblem": "<matches detected issue, plain words>",
        "productName": "<exact product name from AVAILABLE PRODUCTS>",
        "description": "<2 sentences: why this product helps for what you see, explained in plain accessible language>",
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
  const { userId, imageBase64, mimeType, lang, skinConcern, age, climate, allergies, captchaToken, email } = req.body;
  const normalizedEmail = email && typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? email.trim().toLowerCase()
    : null;
  console.log('[analyze] email received:', normalizedEmail || 'none');

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
      max_tokens: 8000,
      system: [{ type: 'text', text: buildSystemPrompt(lang, formattedProducts) }],
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          {
            type: 'text', text: `Additional Context (secondary only, use to inform clinical rationale but never override visual evidence):
- Stated concern: ${skinConcern || 'None'}
- Age: ${age || 'Unknown'}
- Climate/Environment: ${climate || 'Unknown'}
- Allergies/Sensitivities: ${allergies || 'None'}`
          },
        ]
      }]
    });

    const raw = message.content[0].text;
    console.log('[analyze] stop_reason:', message.stop_reason, '| output tokens:', message.usage?.output_tokens);
    if (message.stop_reason === 'max_tokens') {
      console.error('[analyze] ❌ response truncated — increase max_tokens');
      throw new Error('Analysis response was truncated. Please try again.');
    }

    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Invalid JSON response from Claude');
    let analysisData;
    try {
      analysisData = JSON.parse(raw.substring(start, end + 1));
    } catch (parseErr) {
      console.error('[analyze] ❌ JSON parse failed:', parseErr.message);
      console.error('[analyze] raw length:', raw.length, '| snippet at error:', raw.substring(Math.max(0, raw.length - 200)));
      throw new Error('Analysis response was malformed. Please try again.');
    }

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
        email: normalizedEmail,
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