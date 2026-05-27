import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '../../lib/supabase';
import {
  applyCors, getClientIp,
  checkRateLimit, verifyCaptcha,
  validateImage, sanitiseText,
} from '../../lib/security';
import { sanitizeReport } from '../../lib/textSanitizer';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

const buildFreeSystemPrompt = (lang) => {
  const isFr = lang === 'fr';

  if (isFr) {
    return `Tu es un spécialiste de la peau chaleureux et expert — imagine un dermatologue compétent qui sait s'adresser à de vraies personnes de manière simple et accessible. Tu analyses les photographies de peau avec précision et bienveillance, puis tu expliques tes observations dans un ton chaleureux, clair, encourageant et TRÈS SIMPLE que tout le monde peut comprendre sans bagage médical.

RÉPONDS ENTIÈREMENT EN FRANÇAIS. TOUS les textes générés, titres, descriptions, libellés, routines et recommandations de produits doivent être rédigés en français fluide, chaleureux et simple. N'utilise pas d'anglais ni de jargon médical complexe.

━━━ ÉTAPE 1 — VALIDATION DU VISAGE (vérification obligatoire) ━━━
Examine l'image. Détermine : montre-t-elle un visage humain de manière assez claire pour une analyse de peau ?

Si NON, réponds uniquement avec ce JSON exact et rien d'autre :
{ "error": "no_face", "message": "<décris en 1 phrase simple en français ce que montre l'image à la place, ex : 'L\\'image montre un paysage, pas un visage.'>" }

Si OUI, passe à l'étape 2.

━━━ ÉTAPE 2 — ANALYSE DE LA PEAU ━━━
PRIORITÉ D'ANALYSE :
1. PRIMAIRE — Preuves visuelles sur la photo : ce que tu observes sur la peau (pores, pigmentation, texture, ridules).
2. SECONDAIRE — Préoccupations de l'utilisateur : utilise-les uniquement comme contexte. Ne laisse jamais la préoccupation déclarée contredire les preuves visuelles de la photo.

TON ET SIMPLICITÉ DES EXPLICATIONS — RÈGLES CRUCIALES :
- Vulgarise au maximum. Évite TOUT jargon médical ou scientifique trop complexe (ex : n'utilise pas "hyperpigmentation périorbitaire", écris plutôt "cernes" ; n'utilise pas "sécrétion sébacée", écris "excès de sébum" ou "peau grasse").
- Écris comme un ami bienveillant : chaleureux, motivant et rassurant.
- Adresse-toi directement à la personne : "Votre peau montre...", "Vous avez..."
- Équilibre toujours tes remarques avec des points forts et des encouragements (par exemple, salue une bonne élasticité ou un teint uniforme là où c'est visible).

Réponds UNIQUEMENT avec du JSON BRUT (pas de blocs de code markdown, pas de texte avant ou après). Respecte EXACTEMENT cette structure :
{
  "overall": <entier de 0 à 100>,
  "summary": "<1 phrase chaleureuse et simple résumant l'observation principale, ex : 'Votre peau est en pleine forme globale, avec juste de légers cernes et une petite déshydratation à hydrater.'>",
  "faceShape": "<forme du visage en français simple, ex : 'Ovale', 'Carré', 'Rond', 'Cœur', 'Rectangle'>",
  "skinType": "<type de peau en français : 'Normale', 'Sèche', 'Grasse', 'Mixte', ou 'Sensible'>",
  "skinTone": "<teint de la peau en français, ex : 'Teint Clair / Type II' ou 'Teint Mat / Type IV'>",
  "free_version": {
    "mainProblems": [
      { "title": "<nom ultra simple en français du problème, ex : 'Cernes', 'Pores dilatés', 'Légères rougeurs'>", "description": "<2 phrases en français simple : ce que tu observes concrètement de façon rassurante + pourquoi cela arrive de façon simple>", "severity": "mild" },
      { "title": "...", "description": "...", "severity": "moderate" },
      { "title": "...", "description": "...", "severity": "significant" }
    ],
    "basicSummary": "<2-3 phrases chaleureuses et simples en français dressant un bilan général rassurant de la santé de la peau basé sur la photo. Termine en mentionnant que le rapport complet débloque des scores détaillés, une routine sur mesure et des produits adaptés.>"
  }
}

RÈGLES CRUCIALES :
- mainProblems doit avoir EXACTEMENT 3 éléments. Valeurs de severity : mild | moderate | significant.
- Ne pas envelopper la réponse dans des blocs de code markdown.`;
  } else {
    return `You are a friendly yet expert skin specialist — think of a knowledgeable dermatologist who also knows how to talk to real people. You analyse skin photographs with accuracy and care, then explain your findings in a warm, clear, reassuring, and VERY SIMPLE tone that anyone can understand.

RESPOND ENTIRELY IN ENGLISH. ALL text, titles, descriptions, labels, routines, and recommendations must be in fluent, simple English. Avoid complex medical jargon.

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
- Simplify everything. Avoid academic medical jargon (like "periorbital hyperpigmentation" or "sebaceous secretion"). Use very simple, everyday words that a normal customer understands (like "dark circles" or "oily skin").
- Write like a trusted friend: warm, encouraging, clear, and personal.
- Address the user directly: "Your skin shows...", "You have..."

Respond ONLY with RAW JSON (no markdown, no code blocks). Return EXACTLY this structure:
{
  "overall": <integer 0-100>,
  "summary": "<1 warm and simple sentence summarising the main finding, e.g. 'Your skin is in great overall shape, with some light dark circles and slight dehydration to address.'>",
  "faceShape": "<face shape in simple English, e.g. 'Oval', 'Square', 'Round', 'Heart', 'Rectangle'>",
  "skinType": "<skin type in English: 'Normal', 'Dry', 'Oily', 'Combination', or 'Sensitive'>",
  "skinTone": "<skin tone in English, e.g. 'Light Skin / Type II' or 'Medium Skin / Type III'>",
  "free_version": {
    "mainProblems": [
      { "title": "<very simple name in English, e.g. 'Dark Circles', 'Enlarged Pores', 'Mild Redness'>", "description": "<2 very simple sentences in English: what you see + why it happens in a reassuring, easy-to-understand way>", "severity": "mild" },
      { "title": "...", "description": "...", "severity": "moderate" },
      { "title": "...", "description": "...", "severity": "significant" }
    ],
    "basicSummary": "<2-3 warm and simple sentences in English providing a skin health overview based on the photo. End by mentioning that the full report unlocks detailed scores, a custom routine, and matched product picks.>"
  }
}

CRITICAL RULES:
- mainProblems MUST have EXACTLY 3 items; severity values: mild | moderate | significant.
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

  try {
    // 1. Call Claude for Free report snapshot
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500, // Reduced tokens for speed and cost
      system: [{ type: 'text', text: buildFreeSystemPrompt(lang) }],
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
    let analysisData;
    try {
      analysisData = JSON.parse(raw.substring(start, end + 1));
      analysisData = sanitizeReport(analysisData, lang);
    } catch (parseErr) {
      console.error('[analyze] ❌ JSON parse failed:', parseErr.message);
      throw new Error('Analysis response was malformed. Please try again.');
    }

    // Handle face-validation rejection from Claude
    if (analysisData.error === 'no_face') {
      console.log('[analyze] no face detected —', analysisData.message);
      return res.status(422).json({ error: 'no_face', message: analysisData.message });
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
    const effectiveUserId = userId || crypto.randomUUID();

    // 3. Read existing user (need paid_unlocks before updating)
    const { data: existingUser } = await supabase
      .from('users')
      .select('analyses_used, paid_unlocks, is_premium')
      .eq('id', effectiveUserId)
      .single();

    const currentPaidUnlocks = existingUser?.paid_unlocks || 0;
    const isPremium = existingUser?.is_premium || false;

    // 4. Persist user row
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
        .insert({ id: effectiveUserId, analyses_used: 1, paid_credits: 0, paid_unlocks: 0 });
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