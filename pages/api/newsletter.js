import { createAdminClient } from '../../lib/supabase';
import { applyCors, getClientIp, checkRateLimit } from '../../lib/security';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const { email, userId } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  console.log('[newsletter] subscribing:', cleanEmail, '| userId:', userId || 'none');
  console.log('[newsletter] Supabase URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('[newsletter] service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const supabase = createAdminClient();

  const ip = getClientIp(req);
  const isLimited = await checkRateLimit(supabase, ip, 5, 60 * 60 * 1000);
  if (isLimited) {
    return res.status(429).json({ error: 'Too many subscription attempts. Please try again later.' });
  }

  const { error: insertError } = await supabase
    .from('newsletter')
    .upsert({ email: cleanEmail }, { onConflict: 'email' });

  if (insertError) {
    console.error('[newsletter] insert error — code:', insertError.code);
    console.error('[newsletter] insert error — message:', insertError.message);
    console.error('[newsletter] insert error — details:', insertError.details);
    console.error('[newsletter] insert error — hint:', insertError.hint);

    if (insertError.code !== '23505') {
      return res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
    }
    // Duplicate email — already subscribed, continue to bonus credit step
    console.log('[newsletter] duplicate email, continuing to bonus credit');
  } else {
    console.log('[newsletter] email saved:', cleanEmail);
  }

  // Link email to user row so /mes-rapports can find analyses via cookie userId
  const cookieUserId = req.cookies['rms_uid'];
  if (cookieUserId) {
    try {
      await supabase
        .from('users')
        .update({ email: cleanEmail })
        .eq('id', cookieUserId);
      console.log('[newsletter] email linked to userId:', cookieUserId);
    } catch (err) {
      console.error('[newsletter] failed to link email to user:', err.message);
    }
  }

  return res.status(200).json({
    message: 'Subscribed successfully.',
  });
}
