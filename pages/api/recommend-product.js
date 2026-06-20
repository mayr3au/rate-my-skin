import { createAdminClient } from '../../lib/supabase';

/* Maps a report metric id to the DB `concerns` vocabulary so we only ever
   surface real products from the Supabase catalog that match the need. */
const CONCERN_MAP = {
  hydration: ['dehydration', 'dryness'],
  acne: ['acne', 'oily'],
  pores: ['pores', 'oily'],
  texture: ['pores', 'dullness'],
  dark_spots: ['hyperpigmentation'],
  radiance: ['dullness'],
  redness: ['redness', 'sensitivity'],
  dark_circles: ['sensitivity', 'redness'],
};

const FIELDS =
  'product_name,brand,price,product_image_url,actives,amazon_link,sephora_link,product_description,concerns,routine_step';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { concern, step = 'cleanser' } = req.body || {};
  const supabase = createAdminClient();
  if (!supabase) return res.status(200).json({ product: null }); // no DB in this env

  const dbConcerns = CONCERN_MAP[concern] || [];

  try {
    // 1) product for this step whose concerns overlap the need
    let product = null;
    if (dbConcerns.length) {
      const { data } = await supabase
        .from('products')
        .select(FIELDS)
        .eq('routine_step', step)
        .overlaps('concerns', dbConcerns)
        .limit(1);
      product = (data && data[0]) || null;
    }
    // 2) fallback: any product for this step (still a real DB product)
    if (!product) {
      const { data } = await supabase
        .from('products')
        .select(FIELDS)
        .eq('routine_step', step)
        .limit(1);
      product = (data && data[0]) || null;
    }
    return res.status(200).json({ product });
  } catch (err) {
    console.error('[recommend-product]', err.message);
    return res.status(200).json({ product: null });
  }
}
