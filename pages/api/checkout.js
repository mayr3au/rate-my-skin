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
  const name = isPack
    ? '5 Full Skin Reports — Rate My Skin'
    : '1 Full Skin Report — Rate My Skin';
  const product_type = isPack ? 'five_analyses' : 'single_analysis';

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

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name,
              description: 'Full AI-powered skin analysis: 8 metrics, personalised routine & product recommendations.',
            },
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
