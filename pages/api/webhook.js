import Stripe from 'stripe';
import { createAdminClient } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Must disable Next.js body parser so we can validate the raw Stripe signature
export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('[webhook] received request');

  const rawBody = await readRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('[webhook] signature verified, event type:', event.type);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    console.log('[webhook] checkout.session.completed — userId:', userId, '| session id:', session.id);

    if (!userId) {
      console.error('[webhook] no client_reference_id on session — cannot credit user');
      return res.status(200).json({ received: true });
    }

    const supabase = createAdminClient();

    // Fetch the existing user so we only touch paid_credits
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('paid_credits, analyses_used')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('[webhook] failed to fetch user:', fetchError.message);
      // Still return 200 so Stripe doesn't retry — log for manual fix
      return res.status(200).json({ received: true });
    }

    console.log('[webhook] user found — current paid_credits:', user.paid_credits);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        paid_credits: user.paid_credits + 5,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[webhook] failed to update paid_credits:', updateError.message);
    } else {
      console.log('[webhook] paid_credits updated to', user.paid_credits + 5, 'for user:', userId);
    }
  } else {
    console.log('[webhook] ignoring event type:', event.type);
  }

  return res.status(200).json({ received: true });
}
