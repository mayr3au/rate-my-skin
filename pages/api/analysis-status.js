import { createAdminClient } from '../../lib/supabase';
import Stripe from 'stripe';
import Anthropic from '@anthropic-ai/sdk';
import { sanitizeReport } from '../../lib/textSanitizer';
import { getDetectedConcerns, filterRelevantProducts, buildRoutineFilters, findCandidatesForSlot, validateSlotMatch, deduplicateSlots } from '../../lib/productFilter';
import { STATIC_PRODUCTS } from '../../lib/catalog';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const fetchProducts = async (supabase) => {
  let dbProducts = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    if (error) {
      console.error('[fetchProducts] Supabase error:', error.message);
    } else if (data && data.length > 0) {
      dbProducts = data;
    }
  } catch (err) {
    console.error('[fetchProducts] DB query exception:', err.message);
  }

  // Format products consistently — using actual Supabase column names
  const formattedProducts = dbProducts.map(p => ({
    id: p.id,
    brand: p.brand || "",
    name: p.product_name || "",
    product_name: p.product_name || "",
    productName: p.product_name || "",
    description: p.description_fr || p.description_en || "",
    description_fr: p.description_fr || "",
    description_en: p.description_en || "",
    amazon_link: p.amazon_affiliate_link || "",
    amazonLink: p.amazon_affiliate_link || "",
    sephora_link: p.sephora_affiliate_link || "",
    sephoraLink: p.sephora_affiliate_link || "",
    price_range: p.price_range || "",
    price: p.price_range || "",
    imageUrl: p.product_image_url || p.image_url || "",
    image_url: p.product_image_url || p.image_url || "",
    product_image_url: p.product_image_url || p.image_url || "",
    skinTypes: p.skin_types || [],
    skin_types: p.skin_types || [],
    concerns: p.concerns || (p.skin_problem ? [p.skin_problem] : []),
    routineStep: p.routine_step || "",
    routine_step: p.routine_step || "",
    actives: p.actives || [],
    actives_en: p.actives_en || p.actives || [],
    rating: p.rating ? parseFloat(p.rating) : 4.5,
    count: p.review_count || "1k+",
    efficacyLabel_fr: p.efficacy_label_fr || "",
    efficacyLabel_en: p.efficacy_label_en || "",
    skin_problem: p.skin_problem || (p.concerns && p.concerns[0]) || "general"
  }));

  // Fallback to static catalog if no products in DB (e.g. local environment setup)
  if (formattedProducts.length === 0) {
    console.warn('[fetchProducts] No products found in DB. Falling back to STATIC_PRODUCTS.');
    return {
      formattedProducts: STATIC_PRODUCTS.map(p => ({
        id: p.id,
        brand: p.brand,
        name: p.name,
        product_name: p.productName,
        productName: p.productName,
        description: p.description_fr,
        description_fr: p.description_fr,
        description_en: p.description_en,
        amazon_link: p.amazonLink,
        amazonLink: p.amazonLink,
        sephora_link: p.sephoraLink,
        sephoraLink: p.sephoraLink,
        price_range: p.price || p.price_range,
        price: p.price || p.price_range,
        imageUrl: p.imageUrl,
        image_url: p.imageUrl,
        skinTypes: p.skinTypes,
        skin_types: p.skinTypes,
        concerns: p.concerns,
        routineStep: p.routineStep,
        routine_step: p.routineStep,
        actives: p.actives,
        actives_en: p.actives_en || p.actives,
        rating: p.rating,
        count: p.count,
        efficacyLabel_fr: p.efficacyLabel_fr,
        efficacyLabel_en: p.efficacyLabel_en,
        skin_problem: p.concerns[0] || 'general'
      })),
      imageByName: STATIC_PRODUCTS.reduce((acc, p) => {
        acc[(p.productName || '').toLowerCase()] = p.imageUrl;
        return acc;
      }, {})
    };
  }

  const imageByName = {};
  formattedProducts.forEach(p => {
    const name = (p.product_name || '').toLowerCase();
    const imgUrl = p.imageUrl;
    if (name && imgUrl) {
      imageByName[name] = imgUrl;
    }
  });

  return { formattedProducts, imageByName };
};

const buildPremiumSystemPrompt = (lang, routineSlotsCandidatesPrompt, freeSummary, preCalculatedScoresContext) => {
  const isFr = lang === 'fr';

  if (isFr) {
    return `Tu es un spécialiste de la peau chaleureux et expert. Tu as déjà rédigé le bilan d'analyse de base suivant : "${freeSummary}".
Maintenant, génère la version premium complète de ce rapport en analysant la photo de peau fournie pour les détails cliniques (routine, recommandations de produits).

RÉPONDS ENTIÈREMENT EN FRANÇAIS. TOUS les textes générés, routines et recommandations de produits doivent être rédigés en français fluide, chaleureux et simple. Sois extrêmement direct, concis et va droit au but. Évite toute phrase de remplissage ou généralité inutile.

SCORES ÉVALUÉS À L'ÉTAPE PRÉCÉDENTE (tu dois concevoir tes explications detail en accord avec ces notes) :
${preCalculatedScoresContext}

SLOTS DE ROUTINE ET PRODUITS CANDIDATS DISPONIBLES :
${routineSlotsCandidatesPrompt}

Réponds UNIQUEMENT avec du JSON BRUT respectant EXACTEMENT cette structure :
{
  "paid_version": {
    "metrics": [
      { "label": "Hydratation", "detail": "<1 courte phrase concise (12 mots max) décrivant uniquement ce qui est visible à l'image (ex: 'Légères ridules de déshydratation sur le front.')>" },
      { "label": "Pores", "detail": "<1 courte phrase concise (12 mots max) localisant précisément l'état des pores visible sur la photo (ex: 'Pores légèrement dilatés sur la zone T.')>" },
      { "label": "Éclat", "detail": "<1 courte phrase concise (12 mots max) décrivant l'éclat observé (ex: 'Teint terne nécessitant un boost de luminosité.')>" },
      { "label": "Acné", "detail": "<1 courte phrase concise (12 mots max) décrivant l'acné/imperfections (ex: 'Quelques imperfections localisées sur le menton.')>" },
      { "label": "Taches", "detail": "<1 courte phrase concise (12 mots max) décrivant la pigmentation (ex: 'Pigmentation homogène, aucune tache pigmentaire majeure visible.')>" },
      { "label": "Cernes", "detail": "<1 courte phrase concise (12 mots max) décrivant le dessous de l'œil (ex: 'Cernes légèrement marqués avec présence de ridules.')>" },
      { "label": "Texture", "detail": "<1 courte phrase (12 mots max) décrivant le grain de peau / les irrégularités visibles (ex: 'Texture légèrement irrégulière avec quelques rugosités sur les joues.')>" },
      { "label": "Rougeurs", "detail": "<1 courte phrase (12 mots max) décrivant les rougeurs / la sensibilité visibles (ex: 'Rougeurs diffuses localisées autour du nez et des joues.')>" }
    ],
    "strengths": [
      { "title": "<point fort court en français, ex : 'Élasticité de la peau'>", "desc": "<1 phrase courte expliquant pourquoi (12 mots max)>" },
      { "title": "...", "desc": "..." }
    ],
    "improvements": [
      { "title": "<point à améliorer court, ex : 'Hydrater le front'>", "desc": "<1 phrase de conseil pratique court (12 mots max)>" },
      { "title": "...", "desc": "..." }
    ],
    "routine": {
      "morning": [
        { "stepText": "Nettoyer en douceur", "productId": "<ID du produit choisi parmi les candidats du slot morning.cleanser>", "whyItHelps": "<1 phrase: en quoi CE produit répond au problème précis observé sur SA peau (cite l'actif ou la préoccupation)>", "applicationTip": "<1 phrase: comment l'appliquer concrètement (quantité, moment, geste)>" },
        { "stepText": "Appliquer un sérum ciblé", "productId": "<ID du produit choisi parmi les candidats du slot morning.serum>", "whyItHelps": "<1 phrase personnalisée à sa peau>", "applicationTip": "<1 phrase concrète d'application>" },
        { "stepText": "Hydrater avec une crème adaptée", "productId": "<ID du produit choisi parmi les candidats du slot morning.moisturizer>", "whyItHelps": "<1 phrase personnalisée à sa peau>", "applicationTip": "<1 phrase concrète d'application>" },
        { "stepText": "Protéger avec un SPF50+", "productId": "<ID du produit choisi parmi les candidats du slot morning.sunscreen>", "whyItHelps": "<1 phrase personnalisée à sa peau>", "applicationTip": "<1 phrase concrète d'application>" }
      ],
      "evening": [
        { "stepText": "Première étape : démaquillant huileux", "productId": "<ID du produit choisi parmi les candidats du slot evening.oil_cleanser ou null>", "whyItHelps": "<1 phrase personnalisée à sa peau>", "applicationTip": "<1 phrase concrète d'application>" },
        { "stepText": "Deuxième étape : nettoyant doux", "productId": "<ID du produit choisi parmi les candidats du slot evening.cleanser>", "whyItHelps": "<1 phrase personnalisée à sa peau>", "applicationTip": "<1 phrase concrète d'application>" },
        { "stepText": "Appliquer un traitement ciblé", "productId": "<ID du produit choisi parmi les candidats du slot evening.treatment>", "whyItHelps": "<1 phrase personnalisée à sa peau>", "applicationTip": "<1 phrase concrète (fréquence, précautions)>" },
        { "stepText": "Crème hydratante nuit", "productId": "<ID du produit choisi parmi les candidats du slot evening.moisturizer>", "whyItHelps": "<1 phrase personnalisée à sa peau>", "applicationTip": "<1 phrase concrète d'application>" }
      ],
      "weekly": [
        { "stepText": "Exfolier 1-2x par semaine", "productId": "<ID du produit choisi parmi les candidats du slot weekly.exfoliant>", "whyItHelps": "<1 phrase personnalisée à sa peau>", "applicationTip": "<1 phrase concrète (fréquence, jamais le même soir que le rétinol)>" }
      ]
    },
    "productRecommendations": [
      {
        "skinProblem": "<nom du problème en français, ex : 'Acné' ou 'Déshydratation'>",
        "productName": "<nom exact de l'un des produits choisis dans ta routine ci-dessus>",
        "description": "<1 phrase courte (max 15 mots) liant ce produit à l'état spécifique observé sur sa peau>"
      }
    ],
    "lifestyle": {
      "diet": { "title": "<titre court, ex: 'Acides gras essentiels'>", "desc": "<1 phrase courte (max 15 mots) sans fioritures>" },
      "sleep": { "title": "<titre court>", "desc": "<1 phrase courte (max 15 mots)>" },
      "stress": { "title": "<titre court>", "desc": "<1 phrase courte (max 15 mots)>" },
      "hygiene": { "title": "<titre court>", "desc": "<1 phrase courte (max 15 mots)>" },
      "sun": { "title": "<titre court>", "desc": "<1 phrase courte (max 15 mots)>" },
      "exercise": { "title": "<titre court>", "desc": "<1 phrase courte (max 15 mots)>" },
      "temperature": { "title": "<titre court>", "desc": "<1 phrase courte (max 15 mots)>" }
    },
    "progression": [
      { "week": 1, "title": "<titre court>", "desc": "<1 phrase d'action simple>" },
      { "week": 2, "title": "<titre court>", "desc": "<1 phrase d'action simple>" },
      { "week": 3, "title": "<titre court>", "desc": "<1 phrase d'action simple>" },
      { "week": 4, "title": "<titre court>", "desc": "<1 phrase d'action simple>" }
    ]
  }
}

RÈGLES CRUCIALES :
- metrics doit avoir EXACTEMENT 8 éléments avec les libellés exacts dans cet ordre : Hydratation, Pores, Éclat, Acné, Taches, Cernes, Texture, Rougeurs.
- Pour severity : 'mild' si le score pré-calculé correspondant est >= 78, 'moderate' si 65-77, 'significant' si < 65.
- N'utilise JAMAIS de tiret cadratin (—) ni de tiret long (–). Remplace-les par des virgules, des points ou des parenthèses. Les traits d'union des mots composés restent autorisés.
- SÉLECTION UNIQUE ET STRICTE DES PRODUITS : Pour chaque étape de la routine, tu DOIS choisir EXACTEMENT UN produit de la liste de candidats fournie pour ce slot précis, et mettre son ID dans le champ "productId". Ne modifie pas la valeur "stepText". Si la liste de candidats est vide (ou pour le slot optionnel si aucun ne convient), renvoie null pour "productId". Tu ne dois INVENTER aucun nom ou ID de produit.
- productRecommendations doit comporter EXACTEMENT 3-4 éléments correspondant à des produits sélectionnés dans la routine ci-dessus, avec leur description.
- Pour CHAQUE étape de routine, "whyItHelps" et "applicationTip" sont OBLIGATOIRES et doivent être PERSONNALISÉS à SA peau (la préoccupation/le score observé) et au produit choisi, jamais une phrase générique réutilisable. Maximum 18 mots chacun.
- CONCISION ABSOLUE : Rédige des phrases extrêmement courtes. Supprime tout bavardage inutile, introduction ou explication longue.
- Conseils cosmétiques uniquement. Aucune allégation médicale ni promesse de traitement. Pour une affection persistante ou sévère, recommander de consulter un professionnel de santé.
- Ne pas envelopper la réponse dans des blocs de code markdown.`;
  } else {
    return `You are a friendly yet expert skin specialist. You have already written the following basic skin summary: "${freeSummary}".
Now, generate the complete premium version of this report by analysing the provided skin photo for detailed custom skincare routines, and specific product recommendations.

RESPOND ENTIRELY IN ENGLISH. ALL text, routines, and recommendations must be in fluent, simple English. Be extremely direct, concise, and straight to the point.

SCORES EVALUATED IN THE PREVIOUS STEP (align your detail explanations with these scores):
${preCalculatedScoresContext}

ROUTINE SLOTS AND AVAILABLE CANDIDATE PRODUCTS:
${routineSlotsCandidatesPrompt}

Respond ONLY with RAW JSON matching EXACTLY this structure:
{
  "paid_version": {
    "metrics": [
      { "label": "Hydration", "detail": "<1 short concise sentence (max 12 words) describing only what is visible on the image (e.g. 'Fine dehydration lines visible on the forehead.')>" },
      { "label": "Pores", "detail": "<1 short concise sentence (max 12 words) locating precisely the pore status on the photo (e.g. 'Slightly visible pores in the T-zone.')>" },
      { "label": "Radiance", "detail": "<1 short concise sentence (max 12 words) describing radiance (e.g. 'Dull complexion needing a brightness boost.')>" },
      { "label": "Acne", "detail": "<1 short concise sentence (max 12 words) describing acne (e.g. 'Minor breakouts visible on the chin area.')>" },
      { "label": "Dark Spots", "detail": "<1 short concise sentence (max 12 words) describing pigmentation (e.g. 'Even pigmentation with no major dark spots.')>" },
      { "label": "Under-Eye", "detail": "<1 short concise sentence (max 12 words) describing under-eyes (e.g. 'Mild dark circles with slight fine lines.')>" },
      { "label": "Texture", "detail": "<1 short concise sentence (max 12 words) describing visible skin texture / unevenness (e.g. 'Slightly uneven texture with minor roughness on the cheeks.')>" },
      { "label": "Redness", "detail": "<1 short concise sentence (max 12 words) describing visible redness / sensitivity (e.g. 'Diffuse redness around the nose and cheeks.')>" }
    ],
    "strengths": [
      { "title": "<short strength, e.g. 'Skin elasticity'>", "desc": "<1 short sentence explaining why (max 12 words)>" },
      { "title": "...", "desc": "..." }
    ],
    "improvements": [
      { "title": "<short improvement area, e.g. 'Hydrate cheeks'>", "desc": "<1 short sentence of practical advice (max 12 words)>" },
      { "title": "...", "desc": "..." }
    ],
    "routine": {
      "morning": [
        { "stepText": "Cleanse gently", "productId": "<product ID chosen from morning.cleanser candidates>", "whyItHelps": "<1 sentence: how THIS product addresses the specific concern seen on THEIR skin (name the active or concern)>", "applicationTip": "<1 sentence: how to apply it concretely (amount, timing, gesture)>" },
        { "stepText": "Apply a targeted serum", "productId": "<product ID chosen from morning.serum candidates>", "whyItHelps": "<1 sentence personalized to their skin>", "applicationTip": "<1 concrete application sentence>" },
        { "stepText": "Hydrate with a suitable cream", "productId": "<product ID chosen from morning.moisturizer candidates>", "whyItHelps": "<1 sentence personalized to their skin>", "applicationTip": "<1 concrete application sentence>" },
        { "stepText": "Protect with SPF50+", "productId": "<product ID chosen from morning.sunscreen candidates>", "whyItHelps": "<1 sentence personalized to their skin>", "applicationTip": "<1 concrete application sentence>" }
      ],
      "evening": [
        { "stepText": "Step one: oil-based makeup remover", "productId": "<product ID chosen from evening.oil_cleanser candidates or null>", "whyItHelps": "<1 sentence personalized to their skin>", "applicationTip": "<1 concrete application sentence>" },
        { "stepText": "Step two: gentle cleanser", "productId": "<product ID chosen from evening.cleanser candidates>", "whyItHelps": "<1 sentence personalized to their skin>", "applicationTip": "<1 concrete application sentence>" },
        { "stepText": "Apply a targeted treatment", "productId": "<product ID chosen from evening.treatment candidates>", "whyItHelps": "<1 sentence personalized to their skin>", "applicationTip": "<1 concrete sentence (frequency, precautions)>" },
        { "stepText": "Overnight hydrating cream", "productId": "<product ID chosen from evening.moisturizer candidates>", "whyItHelps": "<1 sentence personalized to their skin>", "applicationTip": "<1 concrete application sentence>" }
      ],
      "weekly": [
        { "stepText": "Exfoliate 1-2x per week", "productId": "<product ID chosen from weekly.exfoliant candidates>", "whyItHelps": "<1 sentence personalized to their skin>", "applicationTip": "<1 concrete sentence (frequency, never same night as retinol)>" }
      ]
    },
    "productRecommendations": [
      {
        "skinProblem": "<skin problem, e.g. 'Acne' or 'Dehydration'>",
        "productName": "<exact name of one of the products selected in your routine above>",
        "description": "<1 short sentence (max 15 words) linking product to skin status>"
      }
    ],
    "lifestyle": {
      "diet": { "title": "<short title, e.g. 'Essential Fatty Acids'>", "desc": "<1 short recommendation sentence (max 15 words) without fluff>" },
      "sleep": { "title": "<short title>", "desc": "<1 short sentence (max 15 words)>" },
      "stress": { "title": "<short title>", "desc": "<1 short sentence (max 15 words)>" },
      "hygiene": { "title": "<short title>", "desc": "<1 short sentence (max 15 words)>" },
      "sun": { "title": "<short title>", "desc": "<1 short sentence (max 15 words)>" },
      "exercise": { "title": "<short title>", "desc": "<1 short sentence (max 15 words)>" },
      "temperature": { "title": "<short title>", "desc": "<1 short sentence (max 15 words)>" }
    },
    "progression": [
      { "week": 1, "title": "<short title>", "desc": "<1 simple action sentence>" },
      { "week": 2, "title": "<short title>", "desc": "<1 simple action sentence>" },
      { "week": 3, "title": "<short title>", "desc": "<1 simple action sentence>" },
      { "week": 4, "title": "<short title>", "desc": "<1 simple action sentence>" }
    ]
  }
}

CRITICAL RULES:
- metrics MUST have EXACTELY 8 items in the exact label order: Hydration, Pores, Radiance, Acne, Dark Spots, Under-Eye, Texture, Redness.
- NEVER use em-dashes (—) or en-dashes (–). Replace them with commas, periods, or parentheses. Hyphens in compound words remain allowed.
- STRICT AND EXCLUSIVE PRODUCT MATCHING: For each routine step, you MUST choose EXACTLY ONE product from the candidates list provided for that slot and set its "productId". Do not modify "stepText". If the candidate list is empty (or for the optional slot if none is suitable), return null for "productId". Do NOT invent any product name or ID.
- productRecommendations must contain EXACTLY 3-4 items matching products selected in the routine above, with their description.
- For EVERY routine step, "whyItHelps" and "applicationTip" are MANDATORY and must be PERSONALIZED to their skin (the observed concern/score) and the chosen product, never a generic reusable sentence. Max 18 words each.
- ABSOLUTE BREVITY: Write extremely short sentences. Remove any unnecessary explanations or fluff.
- Cosmetic advice only. No medical claims or treatment promises. For persistent or severe conditions, recommend consulting a healthcare professional.
- Do NOT wrap output in markdown code blocks.`;
  }
};


export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { id, session_id } = req.query;
  const queryLang = req.query.lang || 'fr';
  if (!id) return res.status(400).json({ error: 'Missing id.' });

  const supabase = createAdminClient();

  // If a Stripe session ID is provided, query Stripe directly as a webhook fallback
  if (session_id && session_id.startsWith('cs_')) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (
        session &&
        session.metadata?.analysisId === id &&
        session.status === 'complete' &&
        (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')
      ) {
        console.log('[analysis-status] Verification success via Stripe API for analysis ' + id + '. Setting is_paid=true.');
        await supabase
          .from('analyses')
          .update({ is_paid: true })
          .eq('id', id);
          
        // Sync email from Stripe customer details if empty
        const stripeEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase() || null;
        if (stripeEmail) {
          await supabase
            .from('analyses')
            .update({ email: stripeEmail })
            .eq('id', id)
            .is('email', null);
        }
      }
    } catch (stripeErr) {
      console.error('[analysis-status] Stripe retrieval error:', stripeErr.message);
    }
  }

  // Fetch the current state of the analysis
  let { data, error } = await supabase
    .from('analyses')
    .select('is_paid, report_json, ga_purchase_fired')
    .eq('id', id)
    .single();

  if (error) {
    console.warn('[analysis-status] Error fetching analysis with ga_purchase_fired. Retrying with basic columns...', error.message);
    const retry = await supabase
      .from('analyses')
      .select('is_paid, report_json')
      .eq('id', id)
      .single();
    if (!retry.error && retry.data) {
      data = { ...retry.data, ga_purchase_fired: false };
      error = null;
    }
  }

  if (error || !data) return res.status(404).json({ isPaid: false });

  let report = data.report_json;
  const isPaid = data.is_paid;
  const gaPurchaseFired = data.ga_purchase_fired || false;

  if (report && !report.catalog) {
    try {
      const { formattedProducts, imageByName } = await fetchProducts(supabase);
      report.catalog = formattedProducts.map(p => ({
        ...p,
        productName: p.product_name || p.productName,
        amazonLink: p.amazon_link || p.amazonLink,
        sephoraLink: p.sephora_link || p.sephoraLink,
        imageUrl: imageByName[(p.product_name || p.productName || '').toLowerCase()] || null
      }));
    } catch (err) {
      console.error('[analysis-status] Failed to inject catalog:', err.message);
    }
  }

  // Lazy premium generation: if paid but paid_version is not yet generated
  if (isPaid && report && !report.paid_version) {
    const context = report._input_context;
    if (context && context.imageBase64) {
      try {
        console.log(`[analysis-status] Lazily generating premium report for analysis ID: ${id}`);
        const { formattedProducts, imageByName } = await fetchProducts(supabase);
        const activeLang = context.lang || queryLang;

        // Smart filter products based on report's skinType and mainProblems
        const mainProblems = report.free_version?.mainProblems || [];
        const detectedConcerns = getDetectedConcerns(mainProblems, context.skinConcern);

        // Build routine filters & candidates
        const routineFilters = buildRoutineFilters(detectedConcerns, report.skinType);
        
        // Phase 1: resolve candidates for each slot (before deduplication)
        let resolvedSlots = {};
        const allCandidatesMap = new Map();
        
        for (const [timeOfDay, slots] of Object.entries(routineFilters)) {
          resolvedSlots[timeOfDay] = slots.map(slot => {
            console.log(`[SLOT: ${slot.slot} | ${timeOfDay}] Querying with filters:`, JSON.stringify(slot.filters));
            const candidates = findCandidatesForSlot(slot, formattedProducts);
            console.log(`[SLOT: ${slot.slot} | ${timeOfDay}] Found ${candidates.length} candidates:`,
              candidates.map(c => ({ id: c.id, brand: c.brand, name: c.product_name || c.productName, routine_step: c.routine_step }))
            );
            candidates.forEach(c => allCandidatesMap.set(c.id, c));
            return { ...slot, candidates };
          });
        }

        // Phase 2: cross-morning/evening deduplication
        resolvedSlots = deduplicateSlots(resolvedSlots);
        
        // Format the slots and candidates for the prompt
        const formatCandidatesForPrompt = (slotsObj) => {
          let promptStr = "";
          for (const [timeOfDay, slots] of Object.entries(slotsObj)) {
            promptStr += `=== ${timeOfDay.toUpperCase()} ROUTINE SLOTS ===\n`;
            slots.forEach(slot => {
              promptStr += `- Slot: "${slot.slot}" | stepText: "${slot.stepText}"${slot.optional ? " (Optional)" : ""}\n`;
              promptStr += `  Candidates:\n`;
              if (slot.candidates.length === 0) {
                promptStr += `    No matching products found.\n`;
              } else {
                slot.candidates.forEach(c => {
                  promptStr += `    * ID: ${c.id} | Name: ${c.product_name || c.productName || c.name} | Brand: ${c.brand} | Actives: ${(c.actives || []).join(', ')}\n`;
                });
              }
            });
          }
          return promptStr;
        };
        
        const routineSlotsCandidatesPrompt = formatCandidatesForPrompt(resolvedSlots);

        // Fetch stored scores or use fallbacks for backward compatibility
        const storedScores = report?.scores || {
          Hydration: 80,
          Pores: 80,
          Radiance: 80,
          Acne: 80,
          'Dark Spots': 80,
          'Under-Eye': 80,
          Texture: 80,
          Redness: 80
        };
        const preCalculatedScoresContext = JSON.stringify(storedScores, null, 2);

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 3500,
          system: [{ type: 'text', text: buildPremiumSystemPrompt(activeLang, routineSlotsCandidatesPrompt, report.summary || '', preCalculatedScoresContext) }],
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: context.mimeType, data: context.imageBase64 } },
              {
                type: 'text', text: `Additional Context (secondary only):
- Stated concern: ${context.skinConcern || 'None'}
- Age: ${context.age || 'Unknown'}
- Climate/Environment: ${context.climate || 'Unknown'}
- Allergies/Sensitivities: ${context.allergies || 'None'}`
              },
            ]
          }]
        });

        const raw = message.content[0].text;
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          let premiumData = JSON.parse(raw.substring(start, end + 1));

          // Post-generation: merge scores/grades programmatically
          const getGrade = (score) => {
            if (score >= 88) return 'A';
            if (score >= 78) return 'B';
            if (score >= 65) return 'C';
            return 'D';
          };

          if (premiumData.paid_version && premiumData.paid_version.metrics) {
            premiumData.paid_version.metrics = premiumData.paid_version.metrics.map(m => {
              const labelLower = m.label.toLowerCase();
              let key = 'Hydration';
              if (labelLower.includes('hydratation') || labelLower.includes('hydration')) key = 'Hydration';
              else if (labelLower.includes('pore')) key = 'Pores';
              else if (labelLower.includes('éclat') || labelLower.includes('radiance')) key = 'Radiance';
              else if (labelLower.includes('acné') || labelLower.includes('acne')) key = 'Acne';
              else if (labelLower.includes('tache') || labelLower.includes('dark spot') || labelLower.includes('spot')) key = 'Dark Spots';
              else if (labelLower.includes('cerne') || labelLower.includes('under-eye') || labelLower.includes('eye')) key = 'Under-Eye';
              else if (labelLower.includes('texture')) key = 'Texture';
              else if (labelLower.includes('rougeur') || labelLower.includes('redness')) key = 'Redness';

              const score = storedScores[key] ?? 80;
              const grade = getGrade(score);
              const severity = score >= 78 ? 'mild' : score >= 65 ? 'moderate' : 'significant';

              return {
                label: m.label,
                score,
                grade,
                severity,
                detail: m.detail || ''
              };
            });
          }

          premiumData = sanitizeReport(premiumData, activeLang);

          // ── Post-generation: hard slot validation, dedup & logging ────────
          const validatedRoutine = { morning: [], evening: [], weekly: [] };
          const logs = [];
          // Track product IDs already assigned (for post-selection deduplication).
          // Cleanser is the ONLY step allowed to repeat morning + evening.
          const ALLOW_DUPLICATE_STEPS = new Set(['cleanser']);
          const usedProductIds = new Set();
          
          for (const timeOfDay of ['morning', 'evening', 'weekly']) {
            const steps = premiumData.paid_version?.routine?.[timeOfDay] || [];
            const slots = resolvedSlots[timeOfDay] || [];
            
            slots.forEach((slot, idx) => {
              const stepData = steps[idx] || {};
              const candidates = slot.candidates || [];
              
              // Optional slot with zero candidates → skip entirely
              if (slot.optional && candidates.length === 0) {
                console.log(`[SLOT: ${slot.slot} | ${timeOfDay}] Skipped (optional, 0 candidates).`);
                logs.push({ slot: slot.slot, timeOfDay, validation: 'skipped_optional_no_candidates' });
                return;
              }
              
              // Find the product the AI chose (by ID)
              const chosenProductId = stepData.productId || stepData.product_id || null;
              const aiChosen = allCandidatesMap.get(chosenProductId) ||
                               formattedProducts.find(p => p.id === chosenProductId) ||
                               null;
              
              console.log(`[SLOT: ${slot.slot} | ${timeOfDay}] AI selected productId=${chosenProductId}`,
                aiChosen
                  ? `→ ${aiChosen.brand} ${aiChosen.product_name || aiChosen.productName} (routine_step=${aiChosen.routine_step})`
                  : '→ not found in candidates or DB'
              );

              // HARD VALIDATION: routine_step must match expectedRoutineStep
              let validated = validateSlotMatch(slot, aiChosen, candidates);

              // ── POST-SELECTION DEDUP ──────────────────────────────────────
              // If the validated product was already assigned to a previous slot
              // AND this slot type doesn't allow duplicates, find an alternative.
              const allowDuplicate = ALLOW_DUPLICATE_STEPS.has(slot.expectedRoutineStep || slot.slot);
              
              console.log(`[DEDUP CHECK] Slot: ${slot.slot} | ${timeOfDay}, expectedStep: ${slot.expectedRoutineStep}`);
              console.log(`[DEDUP CHECK] AI selected product: ${validated?.id} (${validated?.brand} ${validated?.product_name || validated?.productName})`);
              console.log(`[DEDUP CHECK] usedProductIds so far:`, Array.from(usedProductIds));
              console.log(`[DEDUP CHECK] allowDuplicate: ${allowDuplicate}, alreadyUsed: ${validated ? usedProductIds.has(validated.id) : false}`);

              if (validated && usedProductIds.has(validated.id) && !allowDuplicate) {
                const expectedStep = slot.expectedRoutineStep || slot.filters?.routine_step;
                // Find the first candidate not yet used and with correct routine_step
                const alternative = candidates.find(c =>
                  !usedProductIds.has(c.id) &&
                  (c.routine_step === expectedStep || c.routineStep === expectedStep ||
                   (slot.slot === 'exfoliant' && (c.routine_step === 'toner' || c.routine_step === 'exfoliant')))
                );
                if (alternative) {
                  console.log(
                    `[DEDUP] Slot "${slot.slot}" | ${timeOfDay}: ` +
                    `replacing duplicate ${validated.brand} ${validated.product_name || validated.productName} ` +
                    `→ ${alternative.brand} ${alternative.product_name || alternative.productName}`
                  );
                  validated = alternative;
                } else {
                  console.warn(
                    `[DEDUP] Slot "${slot.slot}" | ${timeOfDay}: ` +
                    `no unused alternative found for ${validated.brand} ${validated.product_name || validated.productName}. Keeping duplicate.`
                  );
                }
              }

              const finalId    = validated ? validated.id : null;
              const finalName  = validated ? (validated.productName || validated.product_name) : null;
              const finalBrand = validated ? validated.brand : null;
              const validationNote = !aiChosen ? 'ai_returned_null'
                : (validated?.id !== aiChosen?.id && !usedProductIds.has(validated?.id ?? '')) ? 'mismatch_or_dedup_fallback'
                : 'ok';

              // Register product as used (even if duplicate allowed, to detect further clashes)
              if (finalId) usedProductIds.add(finalId);

              console.log(`[SLOT: ${slot.slot} | ${timeOfDay}] Final product: ${finalBrand} ${finalName} | validation=${validationNote}`);

              validatedRoutine[timeOfDay].push({
                stepText: slot.stepText,
                // Carry the AI's per-step personalized advice through to the report
                whyItHelps: stepData.whyItHelps || stepData.why_it_helps || null,
                applicationTip: stepData.applicationTip || stepData.application_tip || null,
                productId: finalId,
                productName: finalName,
                brand: finalBrand,
                // Carry the full product object so the frontend uses exactly
                // what the server chose (respecting dedup + correct image URL)
                productData: validated ? {
                  id: validated.id,
                  brand: validated.brand,
                  product_name: validated.product_name || validated.productName,
                  productName: validated.product_name || validated.productName,
                  description: validated.description,
                  description_fr: validated.description_fr,
                  description_en: validated.description_en,
                  amazon_link: validated.amazon_link || validated.amazonLink,
                  amazonLink: validated.amazon_link || validated.amazonLink,
                  sephora_link: validated.sephora_link || validated.sephoraLink,
                  sephoraLink: validated.sephora_link || validated.sephoraLink,
                  price: validated.price || validated.price_range,
                  price_range: validated.price || validated.price_range,
                  // Image: use all available field names so ProductCard always finds it
                  product_image_url: validated.imageUrl || validated.image_url || validated.product_image_url || null,
                  imageUrl: validated.imageUrl || validated.image_url || validated.product_image_url || null,
                  image_url: validated.imageUrl || validated.image_url || validated.product_image_url || null,
                  routine_step: validated.routine_step || validated.routineStep,
                  routineStep: validated.routine_step || validated.routineStep,
                  skin_types: validated.skin_types || validated.skinTypes,
                  skinTypes: validated.skin_types || validated.skinTypes,
                  concerns: validated.concerns,
                  actives: validated.actives,
                  actives_en: validated.actives_en || validated.actives,
                  rating: validated.rating,
                  count: validated.count,
                  efficacyLabel_fr: validated.efficacyLabel_fr,
                  efficacyLabel_en: validated.efficacyLabel_en,
                } : null,
              });

              logs.push({
                slot: slot.slot,
                timeOfDay,
                stepText: slot.stepText,
                expectedRoutineStep: slot.expectedRoutineStep,
                requested_filters: slot.filters,
                candidates_count: candidates.length,
                candidates: candidates.map(c => ({ id: c.id, brand: c.brand, name: c.product_name || c.productName, routine_step: c.routine_step })),
                ai_selected_id: chosenProductId,
                ai_selected_name: aiChosen ? `${aiChosen.brand} ${aiChosen.product_name || aiChosen.productName}` : null,
                ai_selected_routine_step: aiChosen ? aiChosen.routine_step : null,
                final_product_id: finalId,
                final_product_name: finalName ? `${finalBrand} ${finalName}` : null,
                validation: validationNote,
              });
            });
          }
          
          // Re-populate routine
          premiumData.paid_version.routine = validatedRoutine;

          // ── Image URL audit ──────────────────────────────────────────────
          // Logs visible in Vercel: confirms product_image_url travels with steps
          console.log('[image-audit] Routine steps and their image URLs:');
          for (const [tod, steps] of Object.entries(validatedRoutine)) {
            steps.forEach((step, i) => {
              const imgUrl = step.productData?.imageUrl || step.productData?.image_url || step.productData?.product_image_url || null;
              console.log(
                `[image-audit] ${tod}[${i}] ${step.brand || ''} ${step.productName || '(no product)'} →`,
                imgUrl ? `image: ${imgUrl.substring(0, 80)}` : 'image: NULL (will show Unsplash fallback)'
              );
            });
          }

          // Re-populate and map productRecommendations
          if (premiumData.paid_version?.productRecommendations) {
            premiumData.paid_version.productRecommendations =
              premiumData.paid_version.productRecommendations.map(rec => {
                // Find matching product in all candidates or formattedProducts
                const nameLower = (rec.productName || '').toLowerCase().trim();
                let matched = null;
                if (nameLower) {
                  matched = formattedProducts.find(p => 
                    (p.product_name || p.productName || '').toLowerCase().trim() === nameLower ||
                    (p.name || '').toLowerCase().trim() === nameLower
                  );
                }
                
                // Fallback to top treatment if name mismatch
                if (!matched) {
                  matched = allCandidatesMap.values().next().value || formattedProducts[0];
                }
                
                return {
                  skinProblem: rec.skinProblem || 'Soin ciblé',
                  productName: matched ? (matched.product_name || matched.productName) : rec.productName,
                  brand: matched ? matched.brand : '',
                  description: rec.description || '',
                  amazonLink: matched ? (matched.amazon_link || matched.amazonLink) : '',
                  sephoraLink: matched ? (matched.sephora_link || matched.sephoraLink) : '',
                  price: matched ? (matched.price_range || matched.price) : '',
                  imageUrl: matched ? matched.imageUrl : null
                };
              });
          }

          // Structured Logging for monitoring
          console.log('[recommendations-log]', JSON.stringify({
            analysisId: id,
            profile: {
              concerns: detectedConcerns,
              skinType: report.skinType
            },
            slots: logs
          }, null, 2));

          // Merge premium data back into the report
          report.paid_version = premiumData.paid_version;

          // Clean up large Base64 photo context from the database
          delete report._input_context;

          // Update database row
          const { error: saveError } = await supabase
            .from('analyses')
            .update({ report_json: report })
            .eq('id', id);

          if (saveError) {
            console.error('[analysis-status] ❌ Failed to save premium report:', saveError.message);
          } else {
            console.log('[analysis-status] ✅ Premium report successfully generated and saved.');
          }
        }
      } catch (genError) {
        console.error('[analysis-status] ❌ Lazy premium generation failed:', genError.message);
        // Fall back gracefully to return what we have (client will retry or display error)
      }
    }
  }

  // Get count of analyses in the last 7 days
  let analysesCount = 142;
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());
    if (count !== null && count !== undefined) {
      analysesCount = count + 120;
    }
  } catch (err) {
    console.error('[analysis-status] Failed to fetch weekly count:', err.message);
  }

  if (report && report.paid_version && report.paid_version.routine) {
    console.log('[API] === ROUTINE BEING SENT TO FRONTEND ===');
    for (const [timeOfDay, steps] of Object.entries(report.paid_version.routine)) {
      steps.forEach((step, i) => {
        console.log(`[API] Step ${timeOfDay}_${i}: ${step.productName}`);
        console.log(`[API]   productData exists:`, !!step.productData);
        console.log(`[API]   product_image_url:`, step.productData?.product_image_url || 'MISSING');
      });
    }
  }

  let should_fire_purchase = false;
  if (isPaid && !gaPurchaseFired) {
    should_fire_purchase = true;
    try {
      await supabase
        .from('analyses')
        .update({ ga_purchase_fired: true })
        .eq('id', id);
      console.log(`[analysis-status] Marked ga_purchase_fired=true for analysis ${id}`);
    } catch (dbErr) {
      console.error('[analysis-status] Failed to update ga_purchase_fired:', dbErr.message);
    }
  }

  return res.status(200).json({ isPaid, report, analysesCount, should_fire_purchase });
}
