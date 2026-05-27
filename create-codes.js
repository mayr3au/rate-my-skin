const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCalvinCodes() {
  // Crée le coupon 100% off
  const coupon = await stripe.coupons.create({
    percent_off: 100,
    duration: 'once',
    name: 'Calvin Founding Partner',
  });

  console.log('Coupon created:', coupon.id);

  // Crée 30 codes uniques
  for (let i = 1; i <= 30; i++) {
    const code = `CALVIN${String(i).padStart(2, '0')}`;
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: code,
      max_redemptions: 1,
    });
    console.log(`Code créé: ${code}`);
  }

  console.log('✅ 30 codes créés avec succès');
}

createCalvinCodes().catch(console.error);
