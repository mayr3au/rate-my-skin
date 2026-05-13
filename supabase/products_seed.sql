-- ── Products table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  skin_problem          text NOT NULL,
  product_name          text NOT NULL,
  product_description   text,
  amazon_affiliate_link text,
  sephora_affiliate_link text,
  price_range           text,
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON products FOR SELECT USING (true);

-- ── Seed data ────────────────────────────────────────────────────────────────
-- Replace the placeholder affiliate tags (tag=YOURTAG) with your real Amazon
-- Associates tag before going live.

INSERT INTO products
  (skin_problem, product_name, product_description, amazon_affiliate_link, sephora_affiliate_link, price_range)
VALUES

-- ACNE / BLEMISHES
('acne', 'CeraVe SA Cleanser',
 'Salicylic acid + ceramides — gently unclogs pores without stripping moisture.',
 'https://www.amazon.fr/dp/B00U1YCGVQ?tag=YOURTAG',
 'https://www.sephora.com/product/cerave-sa-smoothing-cleanser',
 '€10–16'),

('acne', 'Paula''s Choice 2% BHA Exfoliant',
 'Leave-on liquid exfoliant that clears blackheads and visibly shrinks pores.',
 'https://www.amazon.fr/dp/B00949CTQQ?tag=YOURTAG',
 'https://www.sephora.com/product/paulas-choice-skin-perfecting-2-bha-liquid-exfoliant',
 '€30–38'),

-- HYPERPIGMENTATION / DARK SPOTS
('hyperpigmentation', 'The Ordinary Alpha Arbutin 2%',
 'Brightens dark spots and post-blemish marks without irritation.',
 'https://www.amazon.fr/dp/B071WNRQJY?tag=YOURTAG',
 'https://www.sephora.com/product/the-ordinary-alpha-arbutin-2-ha',
 '€8–12'),

('hyperpigmentation', 'SkinCeuticals C E Ferulic',
 'Gold-standard vitamin C serum — brightens, protects from UV damage, evens tone.',
 'https://www.amazon.fr/dp/B000FGDQAS?tag=YOURTAG',
 'https://www.sephora.com/product/skinceuticals-c-e-ferulic-with-15-l-ascorbic-acid',
 '€155–185'),

-- DRYNESS / HYDRATION
('dryness', 'CeraVe Moisturising Cream',
 'Ceramides + hyaluronic acid in a rich, non-greasy formula for lasting hydration.',
 'https://www.amazon.fr/dp/B00TTD9BRC?tag=YOURTAG',
 'https://www.sephora.com/product/cerave-moisturizing-cream',
 '€12–18'),

('dryness', 'Laneige Water Sleeping Mask',
 'Overnight gel mask that restores the skin barrier and quenches dehydrated skin.',
 'https://www.amazon.fr/dp/B07HCP72JV?tag=YOURTAG',
 'https://www.sephora.com/product/laneige-water-sleeping-mask-lavender',
 '€25–32'),

-- PORES / TEXTURE
('pores', 'The Ordinary Niacinamide 10% + Zinc 1%',
 'Minimises pore appearance, controls excess sebum, and smooths uneven texture.',
 'https://www.amazon.fr/dp/B07PG5VDF4?tag=YOURTAG',
 'https://www.sephora.com/product/the-ordinary-niacinamide-10-zinc-1',
 '€5–8'),

('pores', 'Sunday Riley Saturn Sulfur Spot Treatment',
 'Sulphur-based mask that deep-cleans pores and reduces their visible size.',
 'https://www.amazon.fr/dp/B07QVCLHFW?tag=YOURTAG',
 'https://www.sephora.com/product/sunday-riley-saturn-sulfur-acne-treatment-mask',
 '€55–70'),

-- DARK CIRCLES / UNDER-EYE
('dark_circles', 'The Inkey List Caffeine Eye Cream',
 'Caffeine + peptides to visibly reduce puffiness and dark circles overnight.',
 'https://www.amazon.fr/dp/B08JH2JH7Y?tag=YOURTAG',
 'https://www.sephora.com/product/the-inkey-list-caffeine-eye-cream',
 '€10–14'),

('dark_circles', 'Kiehl''s Creamy Eye Treatment with Avocado',
 'Rich avocado + beta-carotene formula that firms and brightens the eye area.',
 'https://www.amazon.fr/dp/B000G0WVKA?tag=YOURTAG',
 'https://www.sephora.com/product/kiehls-creamy-eye-treatment-with-avocado',
 '€28–36'),

-- RADIANCE / EVENNESS
('radiance', 'Glow Recipe Watermelon Glow Niacinamide Dew Drops',
 'Lightweight serum that delivers an immediate dewy glow while evening skin tone.',
 'https://www.amazon.fr/dp/B07YCY4K31?tag=YOURTAG',
 'https://www.sephora.com/product/glow-recipe-watermelon-glow-niacinamide-dew-drops',
 '€38–48'),

('radiance', 'Drunk Elephant C-Firma Fresh Day Serum',
 '15% vitamin C + ferulic acid for brightening, firming, and UV protection.',
 'https://www.amazon.fr/dp/B00LKCWF4O?tag=YOURTAG',
 'https://www.sephora.com/product/drunk-elephant-c-firma-fresh-day-serum',
 '€78–95'),

-- TEXTURE
('texture', 'Paula''s Choice 8% AHA Gel Exfoliant',
 'Glycolic + lactic acid blend that resurfaces rough texture and fades fine lines.',
 'https://www.amazon.fr/dp/B000FGDQAS?tag=YOURTAG',
 'https://www.sephora.com/product/paulas-choice-skin-perfecting-8-aha-gel-exfoliant',
 '€32–40');
