import { createAdminClient } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId.' });

  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('analyses_used, paid_credits')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(200).json({ analysesUsed: 0, paidCredits: 0 });
    }
    return res.status(500).json({ error: 'Database error.' });
  }

  return res.status(200).json({
    analysesUsed: user.analyses_used,
    paidCredits: user.paid_credits,
  });
}
