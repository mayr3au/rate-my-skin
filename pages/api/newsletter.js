import { createAdminClient } from '../../lib/supabase';

export default async function handler(req, res) {
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

  const { error: insertError } = await supabase
    .from('newsletter')
    .insert({ email: cleanEmail });

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

  // No bonus credit granted anymore
  return res.status(200).json({
    message: 'Subscribed successfully.',
  });
}
