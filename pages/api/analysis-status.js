import { createAdminClient } from '../../lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { id, session_id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id.' });

  const supabase = createAdminClient();

  // If a Stripe session ID is provided, query Stripe directly as a bulletproof webhook fallback
  if (session_id && session_id.startsWith('cs_')) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      // Verify metadata matching, completion status and payment status
      if (
        session &&
        session.metadata?.analysisId === id &&
        session.status === 'complete' &&
        (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')
      ) {
        console.log(`[analysis-status] Verification success via Stripe API for analysis ${id}. Setting is_paid=true.`);
        await supabase
          .from('analyses')
          .update({ is_paid: true })
          .eq('id', id);
          
        // Sync email from Stripe customer details if empty
        const stripeEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase() || null;
        if (stripeEmail) {
          await supabase
            .from('analyses')
            .update({ email: stripeEmail })
            .eq('id', id)
            .is('email', null);
        }
      }
    } catch (stripeErr) {
      console.error('[analysis-status] Stripe retrieval error:', stripeErr.message);
    }
  }

  const { data, error } = await supabase
    .from('analyses')
    .select('is_paid, report_json')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ isPaid: false });
  return res.status(200).json({ isPaid: data.is_paid, report: data.report_json });
}
