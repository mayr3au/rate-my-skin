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

RÉPONDS ENTIÈREMENT EN FRANÇAIS. TOUS les textes générés, routines et recommandations de produits doivent être rédigés en français fluide, chaleureux et simple. N'utilise pas d'anglais ni de jargon médical complexe.

PRODUITS DISPONIBLES ET LIENS D'AFFILIATION :
${JSON.stringify(availableProducts, null, 2)}

Réponds UNIQUEMENT avec du JSON BRUT respectant EXACTEMENT cette structure :
{
  "paid_version": {
    "metrics": [
      { "label": "Hydratation", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant. Utilise 'mild' si le score est >= 78, 'moderate' si 65-77, 'significant' si < 65>", "detail": "<1-2 phrases très personnalisées basées obligatoirement sur l'image : décris ce que tu vois précisément à des zones ciblées comme des stries de déshydratation sur le front ou les joues, ou au contraire une peau lisse et bien rebondie à ces endroits, et donne un conseil ciblé>" },
      { "label": "Pores", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 phrases très personnalisées basées obligatoirement sur l'image : indique précisément où les pores sont visibles sur la photo (ex: sur les ailes du nez, les joues, ou le menton) et donne une astuce pour les purifier ou les resserrer>" },
      { "label": "Éclat", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 phrases très personnalisées basées obligatoirement sur l'image : décris la luminosité observée sur les zones clés comme le front, les pommettes ou les joues (teint terne, ou au contraire glow lumineux naturel) et comment booster cet éclat>" },
      { "label": "Acné", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 phrases très personnalisées basées obligatoirement sur l'image : mentionne précisément l'état des zones (ex: rougeurs sur les joues, imperfections sur le menton/front, ou si la peau de ces zones est tout à fait nette)>" },
      { "label": "Taches", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 phrases très personnalisées basées obligatoirement sur l'image : localise précisément s'il y a de petites taches solaires sur les pommettes ou le front, ou si la pigmentation est uniforme>" },
      { "label": "Cernes", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 phrases très personnalisées basées obligatoirement sur l'image : analyse précisément le dessous des yeux sur la photo et propose une action ciblée>" },
      { "label": "Symétrie", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 phrases très personnalisées basées obligatoirement sur l'image : décris l'alignement de ses traits visibles de façon très bienveillante>" },
      { "label": "Harmonie", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 phrases très personnalisées basées obligatoirement sur l'image : analyse l'équilibre des proportions faciales>" }
    ],
    "strengths": [
      { "title": "<point fort de la peau en français simple, ex : 'Excellente élasticité'>", "desc": "<pourquoi c'est génial, en français simple>" },
      { "title": "...", "desc": "..." }
    ],
    "improvements": [
      { "title": "<zone d'amélioration en français simple, ex : 'Hydrater les joues'>", "desc": "<conseil pratique en français simple>" },
      { "title": "...", "desc": "..." }
    ],
    "routine": {
      "morning": ["<Étape 1 du matin en français simple>", "<Étape 2>", "<Étape 3>"],
      "evening": ["<Étape 1 du soir en français simple>", "<Étape 2>", "<Étape 3>"],
      "weekly": ["<Soin hebdomadaire avec fréquence>"],
      "weekly": ["<Soin hebdomadaire avec fréquence, ex : Exfolier en douceur 1 fois par semaine>", "<Soin 2>"]
    },
    "productRecommendations": [
      {
        "skinProblem": "<nom du problème en français, ex : 'Cernes', 'Déshydratation'>",
        "productName": "<nom exact du produit extrait des PRODUITS DISPONIBLES>",
        "description": "<2 phrases simples en français expliquant pourquoi ce produit est parfait pour ce que tu as observé sur la photo>",
        "amazonLink": "<lien exact amazon extrait des PRODUITS DISPONIBLES>",
        "sephoraLink": "<lien exact sephora extrait des PRODUITS DISPONIBLES>",
        "price": "<prix exact extrait des PRODUITS DISPONIBLES>"
      }
    ],
    "lifestyle": {
      "diet": { "title": "<recommandation alimentation en français simple, ex : 'Plus d'oméga-3 pour hydrater'>", "desc": "<2-3 phrases détaillées en français>" },
      "sleep": { "title": "<recommandation sommeil ciblée>", "desc": "<2-3 phrases détaillées>" },
      "stress": { "title": "<recommandation stress ciblée>", "desc": "<2-3 phrases détaillées>" },
      "hygiene": { "title": "<recommandation hygiène très concrète>", "desc": "<2-3 phrases détaillées>" },
      "sun": { "title": "<recommandation protection solaire>", "desc": "<2-3 phrases détaillées>" },
      "exercise": { "title": "<conseil sport et sueur>", "desc": "<2-3 phrases détaillées>" },
      "temperature": { "title": "<conseil température de l'eau>", "desc": "<2-3 phrases détaillées>" }
    },
    "progression": [
      { "week": 1, "title": "<titre semaine 1 en français simple>", "desc": "<action principale semaine 1>" },
      { "week": 2, "title": "<titre semaine 2>", "desc": "<action semaine 2>" },
      { "week": 3, "title": "<titre semaine 3>", "desc": "<action semaine 3>" },
      { "week": 4, "title": "<titre semaine 4>", "desc": "<action semaine 4>" }
    ]
  }
}

RÈGLES CRUCIALES :
- metrics doit avoir EXACTEMENT 8 éléments avec les libellés exacts indiqués ci-dessus.
- SÉLECTION UNIQUE ET FIABLE DES PRODUITS : Tu ne dois proposer QUE des produits présents dans le tableau PRODUITS DISPONIBLES ci-dessus. Il est strictement interdit d'inventer des produits ou de modifier leur nom.
- Ne pas envelopper la réponse dans des blocs de code markdown.`;
  } else {
    return `You are a friendly yet expert skin specialist. You have already written the following basic skin summary: "${freeSummary}".
Now, generate the complete premium version of this report by analysing the provided skin photo for detailed metrics, custom skincare routines, and specific product recommendations.

RESPOND ENTIRELY IN ENGLISH. ALL text, routines, and recommendations must be in fluent, simple English. Avoid complex medical jargon.

AVAILABLE PRODUCTS:
${JSON.stringify(availableProducts, null, 2)}

Respond ONLY with RAW JSON matching EXACTLY this structure:
{
  "paid_version": {
    "metrics": [
      { "label": "Hydration", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant. Use 'mild' if score >= 78, 'moderate' if 65-77, 'significant' if < 65>", "detail": "<1-2 highly personalized sentences in English based on the image: describe precisely what you see at targeted zones and a targeted advice>" },
      { "label": "Pores", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 highly personalized sentences in English based on the image: indicate precisely where pores are visible on the photo and how to purify/minimize them>" },
      { "label": "Radiance", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 highly personalized sentences in English based on the image: describe the glow observed on key areas and how to boost it>" },
      { "label": "Acne", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 highly personalized sentences in English based on the image: report precisely the condition of specific zones>" },
      { "label": "Dark Spots", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 highly personalized sentences in English based on the image: note precisely if there are small sun spots or freckles, or if the pigmentation is uniform>" },
      { "label": "Under-Eye", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 highly personalized sentences in English based on the image: analyze the under-eye area on the photo and give targeted care>" },
      { "label": "Symmetry", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 highly personalized sentences in English based on the image: comment on the alignment of visible features in a highly encouraging way>" },
      { "label": "Harmony", "score": <0-100>, "grade": "<A|B|C|D>", "severity": "<mild|moderate|significant>", "detail": "<1-2 highly personalized sentences in English based on the image: evaluate the balance of facial proportions>" }
    ],
    "strengths": [
      { "title": "<visible strength in simple English, e.g. 'Great elasticity'>", "desc": "<why this is positive for skin health, in simple encouraging tone>" },
      { "title": "...", "desc": "..." }
    ],
    "improvements": [
      { "title": "<improvement area in simple English, e.g. 'Hydrate cheeks'>", "desc": "<simple practical motivating advice in English>" },
      { "title": "...", "desc": "..." }
    ],
    "routine": {
      "morning": ["<Step 1 morning in simple English>", "<Step 2>", "<Step 3>"],
      "evening": ["<Step 1 evening in simple English>", "<Step 2>", "<Step 3>"],
      "weekly": ["<Weekly treatment with frequency, e.g. Gentle exfoliant once a week>", "<Treatment 2>"]
    },
    "productRecommendations": [
      {
        "skinProblem": "<skin problem in simple English, e.g. 'Dark Circles'>",
        "productName": "<exact product name from AVAILABLE PRODUCTS>",
        "description": "<2 simple sentences in English explaining why this product is perfect for what you see in the photo>",
        "amazonLink": "<exact link from AVAILABLE PRODUCTS>",
        "sephoraLink": "<exact link from AVAILABLE PRODUCTS>",
        "price": "<price from AVAILABLE PRODUCTS>"
      }
    ],
    "lifestyle": {
      "diet": { "title": "<diet tip, e.g. 'More Omega-3s'>", "desc": "<2-3 detailed sentences in English>" },
      "sleep": { "title": "<sleep recommendation>", "desc": "<2-3 detailed sentences>" },
      "stress": { "title": "<stress management>", "desc": "<2-3 detailed sentences>" },
      "hygiene": { "title": "<hygiene and habits>", "desc": "<2-3 detailed sentences>" },
      "sun": { "title": "<sun and UV advice>", "desc": "<2-3 detailed sentences>" },
      "exercise": { "title": "<post-workout skin hygiene>", "desc": "<2-3 detailed sentences>" },
      "temperature": { "title": "<water temperature recommendation>", "desc": "<2-3 detailed sentences>" }
    },
    "progression": [
      { "week": 1, "title": "<week 1 title in simple English>", "desc": "<main action week 1>" },
      { "week": 2, "title": "<week 2 title>", "desc": "<action week 2>" },
      { "week": 3, "title": "<week 3 title>", "desc": "<action week 3>" },
      { "week": 4, "title": "<week 4 title>", "desc": "<action week 4>" }
    ]
  }
}

CRITICAL RULES:
- metrics MUST have EXACTLY 8 items in the exact label order listed above.
- STRICT AND EXCLUSIVE PRODUCT MATCHING: You must ONLY recommend products that are present in the AVAILABLE PRODUCTS list.
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
          max_tokens: 6500,
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
