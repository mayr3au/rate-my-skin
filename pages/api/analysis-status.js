// GET /api/analysis-status?id=<analysisId>
// Returns { isPaid: bool }
import { createAdminClient } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id.' });
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('analyses').select('is_paid').eq('id', id).single();
  if (error || !data) return res.status(404).json({ isPaid: false });
  return res.status(200).json({ isPaid: data.is_paid });
}
