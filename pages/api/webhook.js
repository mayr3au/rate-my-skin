import Stripe from 'stripe';
import { createAdminClient } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Must disable Next.js body parser — Stripe needs the raw bytes to verify the signature
export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // Health-check: GET /api/webhook
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    });
  }

  if (req.method !== 'POST') return res.status(405).end();

  // Guard: env vars present?
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[webhook] STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Stripe key not configured' });
  }

  console.log('[webhook] POST received —', new Date().toISOString());

  const rawBody = await readRawBody(req);
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[webhook] no stripe-signature header');
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('[webhook] ✅ signature verified — event.type:', event.type, '| event.id:', event.id);
  } catch (err) {
    console.error('[webhook] ❌ signature verification failed:', err.message);
    console.error('[webhook] sig header (first 60):', sig?.substring(0, 60));
    return res.status(400).json({ error: `Webhook signature error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const analysisId = session.metadata?.analysisId;
    const product_type = session.metadata?.product_type;
    const paymentStatus = session.payment_status;

    console.log('[webhook] checkout.session.completed ——————————————');
    console.log('[webhook]   session.id:', session.id);
    console.log('[webhook]   userId (client_reference_id):', userId || 'NULL ⚠️');
    console.log('[webhook]   analysisId (metadata):', analysisId || 'NULL ⚠️');
    console.log('[webhook]   product_type:', product_type);
    console.log('[webhook]   payment_status:', paymentStatus);

    if (paymentStatus !== 'paid') {
      console.warn('[webhook] payment_status is not "paid":', paymentStatus, '— skipping');
      return res.status(200).json({ received: true });
    }

    const supabase = createAdminClient();

    // ── 1. Mark analysis as paid (CRITICAL — runs regardless of user state) ──
    if (analysisId) {
      console.log('[webhook] Step 1: fetching analysis row id:', analysisId);

      const { data: existingAnalysis, error: fetchAnalysisErr } = await supabase
        .from('analyses')
        .select('id, is_paid, user_id')
        .eq('id', analysisId)
        .single();

      if (fetchAnalysisErr) {
        console.error('[webhook] ❌ could not fetch analysis:', fetchAnalysisErr.message, '| code:', fetchAnalysisErr.code);
      } else {
        console.log('[webhook]   found analysis:', existingAnalysis);
      }

      console.log('[webhook] Step 1: running UPDATE analyses SET is_paid=true WHERE id=', analysisId);
      const { data: updatedRow, error: analysisUpdateErr } = await supabase
        .from('analyses')
        .update({ is_paid: true })
        .eq('id', analysisId)
        .select('id, is_paid')
        .single();

      if (analysisUpdateErr) {
        console.error('[webhook] ❌ analysis update failed:', analysisUpdateErr.message,
          '| code:', analysisUpdateErr.code,
          '| details:', analysisUpdateErr.details,
          '| hint:', analysisUpdateErr.hint);
      } else {
        console.log('[webhook] ✅ analysis is_paid set to TRUE:', updatedRow);
      }
    } else {
      console.error('[webhook] ❌ analysisId missing from Stripe metadata — cannot mark analysis as paid');
    }

    // ── 2. Credit user paid_unlocks (best-effort — failure does NOT block step 1) ──
    if (userId) {
      console.log('[webhook] Step 2: crediting paid_unlocks for user:', userId);

      const { data: user, error: fetchUserErr } = await supabase
        .from('users')
        .select('paid_unlocks')
        .eq('id', userId)
        .single();

      if (fetchUserErr) {
        console.error('[webhook] ❌ could not fetch user:', fetchUserErr.message, '| code:', fetchUserErr.code);
        console.warn('[webhook]   user credits NOT updated, but analysis was already marked paid above');
      } else {
        const unlocksToAdd = product_type === 'five_analyses' ? 5 : 1;
        const newUnlocks = (user.paid_unlocks || 0) + unlocksToAdd;
        console.log('[webhook]   paid_unlocks:', user.paid_unlocks, '→', newUnlocks);

        const { error: updateUserErr } = await supabase
          .from('users')
          .update({ paid_unlocks: newUnlocks, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (updateUserErr) {
          console.error('[webhook] ❌ failed to update paid_unlocks:', updateUserErr.message);
        } else {
          console.log('[webhook] ✅ paid_unlocks updated to', newUnlocks);
        }
      }
    } else {
      console.warn('[webhook] no client_reference_id — user credits not updated');
    }

    console.log('[webhook] ————————————————————————————————————————');

  } else {
    console.log('[webhook] ignoring event type:', event.type);
  }

  return res.status(200).json({ received: true });
}
