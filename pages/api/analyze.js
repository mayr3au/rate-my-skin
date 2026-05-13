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

const FREE_LIMIT = 2;

const SYSTEM_PROMPT = `You are an expert skin analyst.
Analyze the photo and respond ONLY with a RAW JSON object.
Focus on skin quality and health.

Structure:
{
  "overall": 85,
  "summary": "...",
  "faceShape": "...",
  "eyeColor": "...",
  "skinTone": "...",
  "metrics": [
    { "label": "Hydration", "score": 80, "grade": "B", "detail": "..." },
    { "label": "Pores", "score": 75, "grade": "B", "detail": "..." },
    { "label": "Radiance", "score": 90, "grade": "A", "detail": "..." },
    { "label": "Acne", "score": 95, "grade": "A", "detail": "..." },
    { "label": "Dark Spots", "score": 85, "grade": "A", "detail": "..." },
    { "label": "Under-Eye", "score": 70, "grade": "C", "detail": "..." },
    { "label": "Symmetry", "score": 80, "grade": "B", "detail": "..." },
    { "label": "Harmony", "score": 82, "grade": "B", "detail": "..." }
  ],
  "strengths": [{ "title": "...", "desc": "..." }],
  "improvements": [{ "title": "...", "desc": "..." }],
  "recommendations": [
    { "category": "Morning Routine", "priority": "HIGH", "items": ["Item 1", "Item 2"] }
  ]
}`;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const ip = getClientIp(req);
  const supabase = createAdminClient();
  const { userId, imageBase64, mimeType, lang, skinConcern, captchaToken } = req.body;

  try {
    // 1. Quota check
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    const limit = FREE_LIMIT + (user?.paid_credits || 0);
    if (user && user.analyses_used >= limit) {
      return res.status(402).json({ error: 'Quota exceeded' });
    }

    // 2. Call Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: [{ type: 'text', text: SYSTEM_PROMPT }],
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: `Analyze skin in ${lang === 'fr' ? 'French' : 'English'}. Concern: ${skinConcern || 'none'}.` }
        ]
      }]
    });

    const raw = message.content[0].text;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    const analysisData = JSON.parse(raw.substring(start, end + 1));

    // 3. Simple product matching
    const problemKeys = (analysisData.metrics || [])
      .filter(m => m.score < 80)
      .map(m => {
        const l = m.label.toLowerCase();
        if (l.includes('hydrat')) return 'dryness';
        if (l.includes('pore')) return 'pores';
        if (l.includes('acne') || l.includes('blemish')) return 'acne';
        return null;
      }).filter(Boolean);

    const { data: products } = await supabase.from('products').select('*').in('skin_problem', problemKeys.slice(0, 2));

    // 4. Update usage
    await supabase.from('users').update({ analyses_used: (user?.analyses_used || 0) + 1 }).eq('id', userId);

    return res.status(200).json({
      data: analysisData,
      productRecommendations: products || [],
      analysesUsed: (user?.analyses_used || 0) + 1,
      paidCredits: user?.paid_credits || 0
    });

  } catch (err) {
    console.error('[analyze] error:', err.message);
    return res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
}
