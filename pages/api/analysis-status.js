import { createAdminClient } from '../../lib/supabase';
import Stripe from 'stripe';
import Anthropic from '@anthropic-ai/sdk';
import { sanitizeReport } from '../../lib/textSanitizer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const fetchProducts = async (supabase) => {
  const { data: products } = await supabase.from('products').select('*');
  const safeProducts = products || [];
  const formattedProducts = safeProducts.map(p => ({
    skin_problem: p.skin_problem,
    product_name: p.product_name,
    description: p.product_description,
    amazon_link: p.amazon_affiliate_link,
    sephora_link: p.sephora_affiliate_link,
    price_range: p.price_range
  }));
  const imageByName = {};
  safeProducts.forEach(p => {
    if (p.product_name && p.product_image_url) {
      imageByName[p.product_name.toLowerCase()] = p.product_image_url;
    }
  });
  return { formattedProducts, imageByName };
};

const buildPremiumSystemPrompt = (lang, availableProducts, freeSummary) => {
  const isFr = lang === 'fr';

  if (isFr) {
    return `Tu es un spécialiste de la peau chaleureux et expert. Tu as déjà rédigé le bilan d'analyse de base suivant : "${freeSummary}".
Maintenant, génère la version premium complète de ce rapport en analysant la photo de peau fournie pour les détails cliniques (scores, routine, recommandations de produits).

RÉPONDS ENTIÈREMENT EN FRANÇAIS. TOUS les textes générés, routines et recommandations de produits doivent être rédigés en français fluide, chaleureux et simple. Sois extrêmement direct, concis et va droit au but. Évite toute phrase de remplissage ou généralité inutile.

PRODUITS DISPONIBLES ET LIENS D'AFFILIATION :
${JSON.stringify(availableProducts, null, 2)}

Réponds UNIQUEMENT avec du JSON BRUT respectant EXACTEMENT cette structure :
{
  "paid_version": {
    "metrics": [
      { "label": "Hydratation", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant. Utilise 'mild' si le score est >= 78, 'moderate' si 65-77, 'significant' si < 65>", "detail": "<1 courte phrase concise (12 mots max) décrivant uniquement ce qui est visible à l'image (ex: 'Légères ridules de déshydratation sur le front.')>" },
      { "label": "Pores", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 courte phrase concise (12 mots max) localisant précisément l'état des pores visible sur la photo (ex: 'Pores légèrement dilatés sur la zone T.')>" },
      { "label": "Éclat", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 courte phrase concise (12 mots max) décrivant l'éclat observé (ex: 'Teint terne nécessitant un boost de luminosité.')>" },
      { "label": "Acné", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 courte phrase concise (12 mots max) décrivant l'acné/imperfections (ex: 'Quelques imperfections localisées sur le menton.')>" },
      { "label": "Taches", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 courte phrase concise (12 mots max) décrivant la pigmentation (ex: 'Pigmentation homogène, aucune tache pigmentaire majeure visible.')>" },
      { "label": "Cernes", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 courte phrase concise (12 mots max) décrivant le dessous de l'œil (ex: 'Cernes légèrement marqués avec présence de ridules.')>" },
      { "label": "Symétrie", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 courte phrase (10 mots max) bienveillante (ex: 'Excellente symétrie et équilibre des traits du visage.')>" },
      { "label": "Harmonie", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 courte phrase (10 mots max) bienveillante (ex: 'Harmonie faciale naturelle très équilibrée.')>" }
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
      "morning": ["<Étape 1 du matin courte (10 mots max)>", "<Étape 2>", "<Étape 3>"],
      "evening": ["<Étape 1 du soir courte (10 mots max)>", "<Étape 2>", "<Étape 3>"],
      "weekly": ["<Soin hebdomadaire court (ex : Exfolier doucement 1x/semaine)>", "<Soin 2 court>"]
    },
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
- metrics doit avoir EXACTEMENT 8 éléments avec les libellés exacts indiqués ci-dessus.
- SÉLECTION UNIQUE ET FIABLE DES PRODUITS : Tu ne dois proposer QUE des produits présents dans le tableau PRODUITS DISPONIBLES ci-dessus.
- CONCISION ABSOLUE : Rédige des phrases extrêmement courtes. Supprime tout bavardage inutile, introduction ou explication longue.
- Ne pas envelopper la réponse dans des blocs de code markdown.`;
  } else {
    return `You are a friendly yet expert skin specialist. You have already written the following basic skin summary: "${freeSummary}".
Now, generate the complete premium version of this report by analysing the provided skin photo for detailed metrics, custom skincare routines, and specific product recommendations.

RESPOND ENTIRELY IN ENGLISH. ALL text, routines, and recommendations must be in fluent, simple English. Be extremely direct, concise, and straight to the point.

AVAILABLE PRODUCTS:
${JSON.stringify(availableProducts, null, 2)}

Respond ONLY with RAW JSON matching EXACTLY this structure:
{
  "paid_version": {
    "metrics": [
      { "label": "Hydration", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant. Use 'mild' if score >= 78, 'moderate' if 65-77, 'significant' if < 65>", "detail": "<1 short concise sentence (max 12 words) describing only what is visible on the image (e.g. 'Fine dehydration lines visible on the forehead.')>" },
      { "label": "Pores", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 short concise sentence (max 12 words) locating precisely the pore status on the photo (e.g. 'Slightly visible pores in the T-zone.')>" },
      { "label": "Radiance", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 short concise sentence (max 12 words) describing radiance (e.g. 'Dull complexion needing a brightness boost.')>" },
      { "label": "Acne", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 short concise sentence (max 12 words) describing acne (e.g. 'Minor breakouts visible on the chin area.')>" },
      { "label": "Dark Spots", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 short concise sentence (max 12 words) describing pigmentation (e.g. 'Even pigmentation with no major dark spots.')>" },
      { "label": "Under-Eye", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 short concise sentence (max 12 words) describing under-eyes (e.g. 'Mild dark circles with slight fine lines.')>" },
      { "label": "Symmetry", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 short sentence (max 10 words) reassuring (e.g. 'Excellent facial symmetry and balanced traits.')>" },
      { "label": "Harmony", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1 short sentence (max 10 words) reassuring (e.g. 'Naturally well-proportioned and balanced features.')>" }
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
      "morning": ["<Short morning step 1 (max 10 words)>", "<Step 2>", "<Step 3>"],
      "evening": ["<Short evening step 1 (max 10 words)>", "<Step 2>", "<Step 3>"],
      "weekly": ["<Short weekly treatment (e.g. Exfoliate gently 1x/week)>", "<Short treatment 2>"]
    },
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
- metrics MUST have EXACTLY 8 items in the exact label order listed above.
- STRICT AND EXCLUSIVE PRODUCT MATCHING: You must ONLY recommend products that are present in the AVAILABLE PRODUCTS list.
- ABSOLUTE BREVITY: Write extremely short sentences. Remove any unnecessary explanations or fluff.
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
      
      // Verify metadata matching, completion status and payment status
      if (
        session &&
        session.metadata?.analysisId === id &&
        session.status === 'complete' &&
        (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')
      ) {
        console.log(`[analysis-status] Verification success via Stripe API for analysis ${id}. Setting is_paid=true.`);
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
  const { data, error } = await supabase
    .from('analyses')
    .select('is_paid, report_json')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ isPaid: false });

  let report = data.report_json;
  const isPaid = data.is_paid;

  // Lazy premium generation: if paid but paid_version is not yet generated
  if (isPaid && report && !report.paid_version) {
    const context = report._input_context;
    if (context && context.imageBase64) {
      try {
        console.log(`[analysis-status] Lazily generating premium report for analysis ID: ${id}`);
        const { formattedProducts, imageByName } = await fetchProducts(supabase);
        const activeLang = context.lang || queryLang;

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: [{ type: 'text', text: buildPremiumSystemPrompt(activeLang, formattedProducts, report.summary || '') }],
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
          premiumData = sanitizeReport(premiumData, activeLang);

          // Inject image URLs server-side
          if (premiumData.paid_version?.productRecommendations) {
            premiumData.paid_version.productRecommendations =
              premiumData.paid_version.productRecommendations.map(rec => ({
                ...rec,
                imageUrl: imageByName[rec.productName?.toLowerCase()] || null,
              }));
          }

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

  return res.status(200).json({ isPaid, report });
}
