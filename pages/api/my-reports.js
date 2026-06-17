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

  // Path 1 — email stored directly on the analysis row (analyses created after the fix)
  const { data: directRows, error: directErr } = await supabase
    .from('analyses')
    .select('id, created_at, report_json, skin_concern, is_paid')
    .eq('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(50);

  if (directErr) {
    console.error('[my-reports] direct query error:', directErr.message);
    return res.status(500).json({ error: 'Failed to fetch reports.' });
  }

  // Path 2 — email linked to users row (via newsletter email gate, covers older analyses)
  let viaUserRows = [];
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (userRow?.id) {
    const { data: userAnalyses } = await supabase
      .from('analyses')
      .select('id, created_at, report_json, skin_concern, is_paid')
      .eq('user_id', userRow.id)
      .order('created_at', { ascending: false })
      .limit(50);
    viaUserRows = userAnalyses || [];
  }

  // Merge + deduplicate by id, sort newest first
  const byId = new Map();
  [...(directRows || []), ...viaUserRows].forEach(r => byId.set(r.id, r));
  const allRows = [...byId.values()].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const reports = allRows.map(row => ({
    id: row.id,
    createdAt: row.created_at,
    score: row.report_json?.overall ?? null,
    summary: row.report_json?.summary ?? null,
    skinConcern: row.skin_concern ?? null,
    faceShape: row.report_json?.faceShape ?? null,
    skinTone: row.report_json?.skinTone ?? null,
    isPaid: !!row.is_paid,
    reportJson: row.report_json,
  }));

  return res.status(200).json({ reports });
}
