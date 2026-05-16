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

const buildSystemPrompt = (lang) => `You are an expert skin analyst.
Analyze the photo and respond ONLY with a RAW JSON object (no markdown, no code block).
Respond entirely in ${lang === 'fr' ? 'French' : 'English'}.
Focus on skin quality and health.

Return EXACTLY this structure:
{
  "overall": <integer 0-100>,
  "summary": "<one concise sentence>",
  "faceShape": "<shape>",
  "eyeColor": "<color>",
  "skinTone": "<tone>",
  "free_version": {
    "mainProblems": [
      { "title": "...", "description": "1-2 sentences", "severity": "mild" },
      { "title": "...", "description": "...", "severity": "moderate" },
      { "title": "...", "description": "...", "severity": "significant" }
    ],
    "basicSummary": "2-3 sentence general assessment"
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
    "recommendations": [
      { "category": "Morning Routine", "priority": "HIGH", "items": ["...", "..."] },
      { "category": "Evening Routine", "priority": "HIGH", "items": ["...", "..."] },
      { "category": "Weekly Treatments", "priority": "MEDIUM", "items": ["...", "..."] }
    ],
    "products": [
      { "skinProblem": "...", "productName": "...", "description": "why it helps", "price": "€XX-XX" },
      { "skinProblem": "...", "productName": "...", "description": "...", "price": "€XX-XX" },
      { "skinProblem": "...", "productName": "...", "description": "...", "price": "€XX-XX" }
    ]
  }
}

RULES:
- mainProblems MUST have EXACTLY 3 items. severity must be one of: mild, moderate, significant.
- metrics MUST have EXACTLY 8 items in the order listed above.
- products must have 3-5 items. Use real, well-known European skincare products available on Amazon.fr and Sephora.fr.
- Do NOT wrap the JSON in markdown code blocks.`;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createAdminClient();
  const { userId, imageBase64, mimeType, lang, skinConcern, captchaToken } = req.body;

  try {
    // 1. Call Claude with new freemium prompt
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system: [{ type: 'text', text: buildSystemPrompt(lang) }],
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: `Analyze this skin photo. Skin concern: ${skinConcern || 'none specified'}.` }
        ]
      }]
    });

    const raw = message.content[0].text;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Invalid JSON response from Claude');
    const analysisData = JSON.parse(raw.substring(start, end + 1));

    // 2. Generate analysis ID
    const analysisId = crypto.randomUUID();

    // 3. Upsert user and insert analysis row (skip if no userId)
    if (userId) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('analyses_used')
        .eq('id', userId)
        .single();

      if (existingUser) {
        await supabase
          .from('users')
          .update({
            analyses_used: existingUser.analyses_used + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      } else {
        await supabase
          .from('users')
          .insert({ id: userId, analyses_used: 1, paid_credits: 0, paid_unlocks: 0 });
      }

      await supabase.from('analyses').insert({
        id: analysisId,
        user_id: userId,
        skin_concern: skinConcern || null,
        report_json: analysisData,
        is_paid: false,
      });
    }

    return res.status(200).json({ data: analysisData, analysisId });

  } catch (err) {
    console.error('[analyze] error:', err.message);
    return res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
}
