import { createAdminClient } from '../../lib/supabase';

const COOKIE_NAME = 'rms_uid';
const MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  let userId = req.cookies[COOKIE_NAME];

  if (!userId) {
    userId = crypto.randomUUID();
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${userId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`
    );
  }

  // Fetch paid_unlocks so the client can display the counter without a second request
  let paidUnlocks = 0;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('users')
      .select('paid_unlocks')
      .eq('id', userId)
      .single();
    paidUnlocks = data?.paid_unlocks || 0;
  } catch {}

  return res.status(200).json({ userId, paidUnlocks });
}
