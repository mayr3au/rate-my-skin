import Stripe from 'stripe';
import { createAdminClient } from '../../lib/supabase';
import { validateEmail } from '../../lib/security';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, analysisId, planId, email } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing userId.' });
  if (!analysisId) return res.status(400).json({ error: 'Missing analysisId.' });

  const isPack = planId === 'pack';
  const amount = isPack ? 499 : 199;
  const product_type = isPack ? 'five_analyses' : 'single_analysis';
  const productId = isPack 
    ? (process.env.STRIPE_PRODUCT_5_PACK || 'prod_UW0urukCJLR5yF')
    : (process.env.STRIPE_PRODUCT_1_PACK || 'prod_UW0u9y5xXSSwK4');

  // Save email to the analysis row so it's retrievable via /mes-rapports
  if (email && validateEmail(email) && analysisId) {
    try {
      const supabase = createAdminClient();
      await supabase
        .from('analyses')
        .update({ email: email.trim().toLowerCase() })
        .eq('id', analysisId);
    } catch (err) {
      console.error('[checkout] failed to save email to analysis:', err.message);
    }
  }

  const origin = `https://${req.headers.host}`;
  const customerEmail = email && validateEmail(email) ? email.trim().toLowerCase() : undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product: productId,
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: userId,
      metadata: {
        product_type,
        analysisId,
      },
      success_url: `${origin}/report?payment=success`,
      cancel_url: `${origin}/report`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session.' });
  }
}
