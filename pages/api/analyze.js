import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '../../lib/supabase';
import {
  applyCors, getClientIp,
  checkRateLimit, verifyCaptcha,
  validateImage, sanitiseText,
} from '../../lib/security';
import { sanitizeReport } from '../../lib/textSanitizer';
import { getDetectedConcerns, filterRelevantProducts } from '../../lib/productFilter';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

// Curated fallback catalog — used when the products table is empty or unreachable.
// These are the exact same products seeded in supabase/products_seed.sql.
const FALLBACK_PRODUCTS = [
  { skin_problem: 'acne', product_name: 'CeraVe SA Cleanser', description: 'Salicylic acid + ceramides — gently unclogs pores without stripping moisture.', amazon_link: 'https://www.amazon.fr/dp/B00U1YCGVQ?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/cerave-sa-smoothing-cleanser', price_range: '€10–16', image_url: 'https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'acne', product_name: "Paula's Choice 2% BHA Exfoliant", description: 'Leave-on liquid exfoliant that clears blackheads and visibly shrinks pores.', amazon_link: 'https://www.amazon.fr/dp/B00949CTQQ?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/paulas-choice-skin-perfecting-2-bha-liquid-exfoliant', price_range: '€30–38', image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'hyperpigmentation', product_name: 'The Ordinary Alpha Arbutin 2%', description: 'Brightens dark spots and post-blemish marks without irritation.', amazon_link: 'https://www.amazon.fr/dp/B071WNRQJY?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/the-ordinary-alpha-arbutin-2-ha', price_range: '€8–12', image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'hyperpigmentation', product_name: 'SkinCeuticals C E Ferulic', description: 'Gold-standard vitamin C serum — brightens, protects from UV damage, evens tone.', amazon_link: 'https://www.amazon.fr/dp/B000FGDQAS?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/skinceuticals-c-e-ferulic-with-15-l-ascorbic-acid', price_range: '€155–185', image_url: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'dryness', product_name: 'CeraVe Moisturising Cream', description: 'Ceramides + hyaluronic acid in a rich, non-greasy formula for lasting hydration.', amazon_link: 'https://www.amazon.fr/dp/B00TTD9BRC?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/cerave-moisturizing-cream', price_range: '€12–18', image_url: 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'dryness', product_name: 'Laneige Water Sleeping Mask', description: 'Overnight gel mask that restores the skin barrier and quenches dehydrated skin.', amazon_link: 'https://www.amazon.fr/dp/B07HCP72JV?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/laneige-water-sleeping-mask-lavender', price_range: '€25–32', image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'pores', product_name: 'The Ordinary Niacinamide 10% + Zinc 1%', description: 'Minimises pore appearance, controls excess sebum, and smooths uneven texture.', amazon_link: 'https://www.amazon.fr/dp/B07PG5VDF4?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/the-ordinary-niacinamide-10-zinc-1', price_range: '€5–8', image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'dark_circles', product_name: 'The Inkey List Caffeine Eye Cream', description: 'Caffeine + peptides to visibly reduce puffiness and dark circles overnight.', amazon_link: 'https://www.amazon.fr/dp/B08JH2JH7Y?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/the-inkey-list-caffeine-eye-cream', price_range: '€10–14', image_url: 'https://images.unsplash.com/photo-1629732047847-50b7ecf0cbf1?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'dark_circles', product_name: "Kiehl's Creamy Eye Treatment with Avocado", description: 'Rich avocado + beta-carotene formula that firms and brightens the eye area.', amazon_link: 'https://www.amazon.fr/dp/B000G0WVKA?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/kiehls-creamy-eye-treatment-with-avocado', price_range: '€28–36', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'radiance', product_name: 'Glow Recipe Watermelon Glow Niacinamide Dew Drops', description: 'Lightweight serum that delivers an immediate dewy glow while evening skin tone.', amazon_link: 'https://www.amazon.fr/dp/B07YCY4K31?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/glow-recipe-watermelon-glow-niacinamide-dew-drops', price_range: '€38–48', image_url: 'https://images.unsplash.com/photo-1590156546746-c22224b69cd1?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'radiance', product_name: 'Drunk Elephant C-Firma Fresh Day Serum', description: '15% vitamin C + ferulic acid for brightening, firming, and UV protection.', amazon_link: 'https://www.amazon.fr/dp/B00LKCWF4O?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/drunk-elephant-c-firma-fresh-day-serum', price_range: '€78–95', image_url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=240&auto=format&fit=crop' },
  { skin_problem: 'texture', product_name: "Paula's Choice 8% AHA Gel Exfoliant", description: 'Glycolic + lactic acid blend that resurfaces rough texture and fades fine lines.', amazon_link: 'https://www.amazon.fr/dp/B000FGDQAS?tag=ratemyskin-21', sephora_link: 'https://www.sephora.com/product/paulas-choice-skin-perfecting-8-aha-gel-exfoliant', price_range: '€32–40', image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=240&auto=format&fit=crop' },
];

const fetchProducts = async (supabase) => {
  const { data: products } = await supabase.from('products').select('*');
  // Use fallback catalog if the table is empty or unreachable
  const safeProducts = (products && products.length > 0) ? products : FALLBACK_PRODUCTS.map(p => ({
    skin_problem: p.skin_problem,
    product_name: p.product_name,
    product_description: p.description,
    amazon_affiliate_link: p.amazon_link,
    sephora_affiliate_link: p.sephora_link,
    price_range: p.price_range,
    product_image_url: p.image_url,
    concerns: [p.skin_problem],
    skin_types: ['normal', 'dry', 'oily', 'combination', 'sensitive'],
    routine_step: 'cleanser',
    time_of_day: 'any',
    actives: []
  }));
  const formattedProducts = safeProducts.map(p => ({
    skin_problem: p.skin_problem,
    product_name: p.product_name,
    description: p.product_description,
    amazon_link: p.amazon_affiliate_link,
    sephora_link: p.sephora_affiliate_link,
    price_range: p.price_range,
    concerns: p.concerns || [],
    skin_types: p.skin_types || [],
    routine_step: p.routine_step || '',
    time_of_day: p.time_of_day || '',
    actives: p.actives || []
  }));
  const imageByName = {};
  safeProducts.forEach(p => {
    const name = (p.product_name || '').toLowerCase();
    const imgUrl = p.product_image_url || p.image_url;
    if (name && imgUrl) {
      imageByName[name] = imgUrl;
    }
  });
  return { formattedProducts, imageByName };
};

const buildAnalysisSystemPrompt = (lang) => {
  const isFr = lang === 'fr';

  if (isFr) {
    return `Tu es un spécialiste de la peau chaleureux et expert — imagine un dermatologue compétent qui sait s'adresser à de vraies personnes de manière simple et accessible. Tu analyses les photographies de peau avec précision et bienveillance, puis tu expliques tes observations dans un ton chaleureux, clair, encourageant et TRÈS SIMPLE que tout le monde peut comprendre sans bagage médical.

RÉPONDS ENTIÈREMENT EN FRANÇAIS. TOUS les textes générés, titres et descriptions doivent être rédigés en français fluide, chaleureux et simple. N'utilise pas d'anglais ni de jargon médical complexe.

━━━ ÉTAPE 1 — VALIDATION DU VISAGE (vérification obligatoire) ━━━
Examine l'image. Détermine : montre-t-elle un visage humain de manière assez claire pour une analyse de peau ?

Si NON, réponds uniquement avec ce JSON exact et rien d'autre :
{ "error": "no_face", "message": "<décris en 1 phrase simple en français ce que montre l'image à la place, ex : 'L\\'image montre un paysage, pas un visage.'>" }

Si OUI, passe à l'étape 2.

━━━ ÉTAPE 2 — ANALYSE DE LA PEAU ━━━
PRIORITY D'ANALYSE :
1. PRIMAIRE — Preuves visuelles sur la photo : ce que tu observes sur la peau (pores, pigmentation, texture, ridules).
2. SECONDAIRE — Préoccupations de l'utilisateur : utilise-les uniquement comme contexte. Ne laisse jamais la préoccupation déclarée contredire les preuves visuelles de la photo.

TON ET SIMPLICITÉ DES EXPLICATIONS — RÈGLES CRUCIALES :
- Vulgarise au maximum. Évite TOUT jargon médical ou scientifique trop complexe.
- Écris comme un ami bienveillant : chaleureux, motivant et rassurant.
- Adresse-toi directement à la personne : "Votre peau montre...", "Vous avez..."

Réponds UNIQUEMENT avec du JSON BRUT (pas de blocs de code markdown, pas de texte avant ou après). Respecte EXACTEMENT cette structure :
{
  "overall": <entier de 0 à 100>,
  "summary": "<1 phrase chaleureuse et simple résumant l'observation principale, ex : 'Votre peau est en pleine forme globale, avec juste de légers cernes et une petite déshydratation à hydrater.'>",
  "faceShape": "<forme du visage en français simple, ex : 'Ovale', 'Carré', 'Rond', 'Cœur', 'Rectangle'>",
  "skinType": "<type de peau en français : 'Normale', 'Sèche', 'Grasse', 'Mixte', ou 'Sensible'>",
  "skinTone": "<teint de la peau en français, ex : 'Teint Clair / Type II' ou 'Teint Mat / Type IV'>",
  "mainProblems": [
    { "title": "<nom ultra simple en français du problème, ex : 'Cernes', 'Pores dilatés', 'Légères rougeurs'>", "description": "<2 phrases en français simple : ce que tu observes concrètement de façon rassurante + pourquoi cela arrive de façon simple>", "severity": "mild" },
    { "title": "...", "description": "...", "severity": "moderate" },
    { "title": "...", "description": "...", "severity": "significant" }
  ]
}

RÈGLES CRUCIALES :
- mainProblems doit avoir EXACTEMENT 3 éléments. Valeurs de severity : mild | moderate | significant.
- Ne pas envelopper la réponse dans des blocs de code markdown.`;
  } else {
    return `You are a friendly yet expert skin specialist — think of a knowledgeable dermatologist who also knows how to talk to real people. You analyse skin photographs with accuracy and care, then explain your findings in a warm, clear, reassuring, and VERY SIMPLE tone that anyone can understand.

RESPOND ENTIRELY IN ENGLISH. ALL text, titles, and descriptions must be in fluent, simple English. Avoid complex medical jargon.

━━━ STEP 1 — FACE VALIDATION (mandatory first check) ━━━
Examine the image. Determine: does it show a human face clearly enough for skin analysis?

If NO face is detected, respond with this exact JSON and nothing else:
{ "error": "no_face", "message": "<describe in 1 simple sentence what the image shows instead, e.g. 'The image shows a landscape, not a face.'>" }

If YES, proceed to Step 2.

━━━ STEP 2 — SKIN ANALYSIS ━━━
ANALYSIS PRIORITY:
1. PRIMARY — Visual evidence in the photograph: what you observe in the skin, pores, pigmentation, texture, and structure.
2. SECONDARY — User's stated concern: use only to add context.

TONE, SIMPLICITY & WRITING STYLE — CRITICAL INSTRUCTIONS:
- Simplify everything. Avoid academic medical jargon. Use very simple, everyday words.
- Write like a trusted friend: warm, encouraging, clear, and personal.
- Address the user directly: "Your skin shows...", "You have..."

Respond ONLY with RAW JSON (no markdown, no code blocks). Return EXACTLY this structure:
{
  "overall": <integer 0-100>,
  "summary": "<1 warm and simple sentence summarising the main finding, e.g. 'Your skin is in great overall shape, with some light dark circles and slight dehydration to address.'>",
  "faceShape": "<face shape in simple English, e.g. 'Oval', 'Square', 'Round', 'Heart', 'Rectangle'>",
  "skinType": "<skin type in English: 'Normal', 'Dry', 'Oily', 'Combination', or 'Sensitive'>",
  "skinTone": "<skin tone in English, e.g. 'Light Skin / Type II' or 'Medium Skin / Type III'>",
  "mainProblems": [
    { "title": "<very simple name in English, e.g. 'Dark Circles', 'Enlarged Pores', 'Mild Redness'>", "description": "<2 very simple sentences in English: what you see + why it happens in a reassuring, easy-to-understand way>", "severity": "mild" },
    { "title": "...", "description": "...", "severity": "moderate" },
    { "title": "...", "description": "...", "severity": "significant" }
  ]
}

CRITICAL RULES:
- mainProblems MUST have EXACTLY 3 items; severity values: mild | moderate | significant.
- Do NOT wrap output in markdown code blocks.`;
  }
};

const buildRecommendationSystemPrompt = (lang, availableProducts, skinAnalysis) => {
  const isFr = lang === 'fr';

  if (isFr) {
    return `Tu es un spécialiste de la peau chaleureux et expert. Tu as déjà effectué l'analyse de peau suivante :
${JSON.stringify(skinAnalysis, null, 2)}

PRODUITS DISPONIBLES (DÉJÀ FILTRÉS ET VALIDÉS POUR LE PROFIL DE L'UTILISATEUR) :
${JSON.stringify(availableProducts, null, 2)}

En te basant sur l'analyse ci-dessus, sélectionne EXACTEMENT 3 produits parmi les PRODUITS DISPONIBLES pour composer la recommandation idéale pour cette personne. Rédige également un court bilan/résumé de santé de la peau (basicSummary).

RÉPONDS ENTIÈREMENT EN FRANÇAIS. TOUS les textes, descriptions, résumés et routines doivent être rédigés en français fluide, chaleureux et simple. N'utilise pas d'anglais ni de jargon médical complexe.

Réponds UNIQUEMENT avec du JSON BRUT (pas de blocs de code markdown, pas de texte avant ou après). Respecte EXACTEMENT cette structure :
{
  "productRecommendations": [
    {
      "skinProblem": "<nom du problème en français, ex : 'Déshydratation'>",
      "productName": "<nom exact du produit extrait des PRODUITS DISPONIBLES>",
      "description": "<1 phrase courte (max 15 mots) liant le produit à l'état de sa peau>",
      "amazonLink": "<lien exact amazon extrait des PRODUITS DISPONIBLES>",
      "sephoraLink": "<lien exact sephora extrait des PRODUITS DISPONIBLES>",
      "price": "<prix exact extrait des PRODUITS DISPONIBLES>"
    }
  ],
  "basicSummary": "<2-3 phrases chaleureuses et simples en français dressant un bilan général rassurant de la santé de la peau basé sur l'analyse. Termine en mentionnant que le rapport complet débloque des scores détaillés, une routine sur mesure et des produits adaptés.>"
}

RÈGLES CRUCIALES :
- productRecommendations doit avoir EXACTEMENT 3 éléments choisis parmi les PRODUITS DISPONIBLES.
- Ne propose QUE des produits présents dans la liste PRODUITS DISPONIBLES ci-dessus (qui sont déjà pré-vettés).
- Ne pas envelopper la réponse dans des blocs de code markdown.`;
  } else {
    return `You are a friendly yet expert skin specialist. You have already performed the following skin analysis:
${JSON.stringify(skinAnalysis, null, 2)}

AVAILABLE PRODUCTS (PRE-VETTED AND VETTED FOR THIS USER'S PROFILE):
${JSON.stringify(availableProducts, null, 2)}

Based on the analysis above, select EXACTLY 3 products from the AVAILABLE PRODUCTS list to build the ideal recommendation for this user. Also write a short skin health summary (basicSummary).

RESPOND ENTIRELY IN ENGLISH. ALL text, descriptions, summaries must be in fluent, simple English. Avoid complex medical jargon.

Respond ONLY with RAW JSON (no markdown, no code blocks). Return EXACTLY this structure:
{
  "productRecommendations": [
    {
      "skinProblem": "<skin problem, e.g. 'Dehydration'>",
      "productName": "<exact product name from AVAILABLE PRODUCTS>",
      "description": "<1 short sentence (max 15 words) linking product to skin status>",
      "amazonLink": "<exact link from AVAILABLE PRODUCTS>",
      "sephoraLink": "<exact link from AVAILABLE PRODUCTS>",
      "price": "<exact price from AVAILABLE PRODUCTS>"
    }
  ],
  "basicSummary": "<2-3 warm and simple sentences in English providing a skin health overview based on the analysis. End by mentioning that the full report unlocks detailed scores, a custom routine, and matched product picks.>"
}

CRITICAL RULES:
- productRecommendations MUST have EXACTLY 3 items selected from AVAILABLE PRODUCTS.
- ONLY recommend products present in the AVAILABLE PRODUCTS list (which are already pre-vetted).
- Do NOT wrap output in markdown code blocks.`;
  }
};

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createAdminClient();
  const { userId, imageBase64, mimeType, lang, skinConcern, age, climate, allergies, captchaToken, email } = req.body;
  const normalizedEmail = email && typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? email.trim().toLowerCase()
    : null;

  let analysisData;
  try {
    const { formattedProducts, imageByName } = await fetchProducts(supabase);

    // 1. Call Claude for Free report snapshot (Vision Call to analyze skin)
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: [{ type: 'text', text: buildAnalysisSystemPrompt(lang) }],
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          {
            type: 'text', text: `Additional Context (secondary only):
- Stated concern: ${skinConcern || 'None'}
- Age: ${age || 'Unknown'}
- Climate/Environment: ${climate || 'Unknown'}
- Allergies/Sensitivities: ${allergies || 'None'}`
          },
        ]
      }]
    });

    const raw = message.content[0].text;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Invalid JSON response from Claude');
    
    let baseAnalysis;
    try {
      baseAnalysis = JSON.parse(raw.substring(start, end + 1));
    } catch (parseErr) {
      console.error('[analyze] ❌ Base JSON parse failed:', parseErr.message);
      throw new Error('Analysis response was malformed. Please try again.');
    }

    // Handle face-validation rejection from Claude
    if (baseAnalysis.error === 'no_face') {
      console.log('[analyze] no face detected —', baseAnalysis.message);
      return res.status(422).json({ error: 'no_face', message: baseAnalysis.message });
    }

    // Step 2: Smart Filter products based on detected skinType and mainProblems
    const detectedConcerns = getDetectedConcerns(baseAnalysis.mainProblems, skinConcern);
    const filteredProducts = filterRelevantProducts(formattedProducts, baseAnalysis.skinType, detectedConcerns, 25);

    // Step 3: Recommendation Call (Text Call to Claude)
    const recMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: [{ type: 'text', text: buildRecommendationSystemPrompt(lang, filteredProducts, baseAnalysis) }],
      messages: [{
        role: 'user',
        content: `Generate recommendations and basic summary.`
      }]
    });

    const rawRec = recMessage.content[0].text;
    const startRec = rawRec.indexOf('{');
    const endRec = rawRec.lastIndexOf('}');
    if (startRec === -1 || endRec === -1) throw new Error('Invalid JSON response from Claude during recommendation generation');
    
    let recData;
    try {
      recData = JSON.parse(rawRec.substring(startRec, endRec + 1));
    } catch (parseErr) {
      console.error('[analyze] ❌ Recommendation JSON parse failed:', parseErr.message);
      throw new Error('Recommendation response was malformed. Please try again.');
    }

    // Assemble final analysisData object
    analysisData = {
      overall: baseAnalysis.overall,
      summary: baseAnalysis.summary,
      faceShape: baseAnalysis.faceShape,
      skinType: baseAnalysis.skinType,
      skinTone: baseAnalysis.skinTone,
      free_version: {
        mainProblems: baseAnalysis.mainProblems,
        productRecommendations: recData.productRecommendations || [],
        basicSummary: recData.basicSummary || ''
      },
      catalog: formattedProducts.map(p => ({
        ...p,
        productName: p.product_name || p.productName,
        amazonLink: p.amazon_link || p.amazonLink,
        sephoraLink: p.sephora_link || p.sephoraLink,
        imageUrl: imageByName[(p.product_name || p.productName || '').toLowerCase()] || null
      }))
    };

    analysisData = sanitizeReport(analysisData, lang);

    // Inject image URLs server-side
    if (analysisData.free_version?.productRecommendations) {
      analysisData.free_version.productRecommendations =
        analysisData.free_version.productRecommendations.map(rec => ({
          ...rec,
          imageUrl: imageByName[rec.productName?.toLowerCase()] || null,
        }));
    }

    // Inject original context (photo and parameters) so we can do premium generation on checkout/unlock
    analysisData._input_context = {
      imageBase64,
      mimeType,
      skinConcern,
      age,
      climate,
      allergies
    };

    // 2. Generate IDs
    const analysisId = crypto.randomUUID();

    // 3. Find existing user — prefer email lookup to avoid duplicates
    let existingUser = null;
    let effectiveUserId = userId || crypto.randomUUID();

    if (normalizedEmail) {
      const { data: byEmail } = await supabase
        .from('users')
        .select('id, analyses_used, paid_unlocks, is_premium')
        .eq('email', normalizedEmail)
        .maybeSingle();
      if (byEmail) {
        existingUser = byEmail;
        effectiveUserId = byEmail.id; // reuse the canonical id for this email
      }
    }

    if (!existingUser) {
      const { data: byId } = await supabase
        .from('users')
        .select('id, analyses_used, paid_unlocks, is_premium')
        .eq('id', effectiveUserId)
        .maybeSingle();
      if (byId) existingUser = byId;
    }

    const currentPaidUnlocks = existingUser?.paid_unlocks || 0;
    const isPremium = existingUser?.is_premium || false;

    // 4. Persist user row (upsert on id to be safe)
    let userSaved = false;
    if (existingUser) {
      const { error: updateErr } = await supabase
        .from('users')
        .update({ analyses_used: (existingUser.analyses_used || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', effectiveUserId);
      userSaved = !updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from('users')
        .insert({ id: effectiveUserId, email: normalizedEmail || null, analyses_used: 1, paid_credits: 0, paid_unlocks: 0 });
      userSaved = !insertErr;
    }

    // 5. Insert analysis row (starts is_paid = false)
    const analysisUserId = userSaved ? effectiveUserId : null;
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

    // 6. Auto-unlock if user has paid_unlocks remaining or is premium
    let isPaidOnCreate = false;
    let paidUnlocksLeft = currentPaidUnlocks;

    if ((isPremium || currentPaidUnlocks > 0) && !analysisInsertErr) {
      const { error: unlockErr } = await supabase
        .from('analyses')
        .update({ is_paid: true })
        .eq('id', analysisId);

      if (!unlockErr) {
        if (isPremium) {
          isPaidOnCreate = true;
        } else {
          const { error: decrErr } = await supabase
            .from('users')
            .update({ paid_unlocks: currentPaidUnlocks - 1 })
            .eq('id', effectiveUserId);
          if (!decrErr) {
            isPaidOnCreate = true;
            paidUnlocksLeft = currentPaidUnlocks - 1;
          }
        }
      }
    }

    return res.status(200).json({ data: analysisData, analysisId, userId: effectiveUserId, isPaid: isPaidOnCreate, paidUnlocksLeft });

  } catch (err) {
    console.error('[analyze] error:', err.message);
    return res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
}