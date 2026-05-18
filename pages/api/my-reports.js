import { createAdminClient } from '../../lib/supabase';
import { getClientIp, checkRateLimit, validateEmail } from '../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const supabase = createAdminClient();
  const ip = getClientIp(req);

  const limited = await checkRateLimit(supabase, ip, 10, 60 * 60 * 1000);
  if (limited) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from('analyses')
    .select('id, created_at, report_json, skin_concern')
    .eq('email', normalizedEmail)
    .eq('is_paid', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[my-reports] query error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch reports.' });
  }

  const reports = (data || []).map(row => ({
    id: row.id,
    createdAt: row.created_at,
    score: row.report_json?.overall ?? null,
    summary: row.report_json?.summary ?? null,
    skinConcern: row.skin_concern ?? null,
    faceShape: row.report_json?.faceShape ?? null,
    skinTone: row.report_json?.skinTone ?? null,
    reportJson: row.report_json,
  }));

  return res.status(200).json({ reports });
}
