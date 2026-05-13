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

  // Grant 1 bonus credit as reward for submitting email
  let paidCredits = null;
  if (userId) {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('paid_credits')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('[newsletter] failed to fetch user for bonus credit:', fetchError.message);
    } else {
      const newCredits = user.paid_credits + 1;
      const { error: updateError } = await supabase
        .from('users')
        .update({ paid_credits: newCredits, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('[newsletter] failed to grant bonus credit:', updateError.message);
      } else {
        paidCredits = newCredits;
        console.log('[newsletter] bonus credit granted — paid_credits now:', paidCredits, 'for user:', userId);
      }
    }
  }

  return res.status(200).json({
    message: 'Subscribed successfully.',
    ...(paidCredits !== null && { paidCredits }),
  });
}
