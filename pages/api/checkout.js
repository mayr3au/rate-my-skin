import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, planId } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing userId.' });

  const isPack = planId === 'pack';
  const amount = isPack ? 499 : 299;
  const credits = isPack ? 5 : 1;
  const name = isPack ? '5 Facial Analyses — Rate My Skin' : '1 Facial Analysis — Rate My Skin';

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
              description: 'Full AI-powered aesthetic analysis across 8 facial metrics.',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: userId,
      metadata: { credits: String(credits) },
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session.' });
  }
}
