import { createAdminClient } from '../../lib/supabase';
import { validateEmail } from '../../lib/security';

const UID_COOKIE = 'rms_uid';
const EMAIL_COOKIE = 'rms_email_id';
const MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function makeCookie(name, value) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`;
}

export default async function handler(req, res) {
  // POST /api/identity { email } — persist email to cookie + users table
  if (req.method === 'POST') {
    const { email } = req.body || {};
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    const normalizedEmail = email.trim().toLowerCase();

    let userId = req.cookies[UID_COOKIE];
    const cookies = [];

    if (!userId) {
      userId = crypto.randomUUID();
      cookies.push(makeCookie(UID_COOKIE, userId));
    }
    cookies.push(makeCookie(EMAIL_COOKIE, normalizedEmail));
    res.setHeader('Set-Cookie', cookies);

    try {
      const supabase = createAdminClient();
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingUser) {
        await supabase.from('users').update({ email: normalizedEmail }).eq('id', userId);
      } else {
        await supabase.from('users').insert({
          id: userId,
          analyses_used: 0,
          paid_credits: 0,
          paid_unlocks: 0,
          email: normalizedEmail,
        });
      }
    } catch (error) {
      console.error('❌ Email sync failed:', error);
    }

    return res.status(200).json({ ok: true, userId, email: normalizedEmail });
  }

  if (req.method !== 'GET') return res.status(405).end();

  // GET — issue/read userId cookie, read email cookie, return both + paidUnlocks
  let userId = req.cookies[UID_COOKIE];
  const emailFromCookie = req.cookies[EMAIL_COOKIE]
    ? decodeURIComponent(req.cookies[EMAIL_COOKIE])
    : null;

  const cookies = [];
  if (!userId) {
    userId = crypto.randomUUID();
    cookies.push(makeCookie(UID_COOKIE, userId));
  }
  if (cookies.length) res.setHeader('Set-Cookie', cookies);

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

  return res.status(200).json({ userId, paidUnlocks, email: emailFromCookie });
}
