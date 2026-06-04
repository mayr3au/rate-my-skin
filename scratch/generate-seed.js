const fs = require('fs');
const path = require('path');

// Read catalog.js and convert ES module export to CommonJS format
const catalogPath = path.resolve('lib/catalog.js');
let catalogContent = fs.readFileSync(catalogPath, 'utf-8');
catalogContent = catalogContent.replace('export const STATIC_PRODUCTS =', 'module.exports =');

// Temporarily write CJS catalog to scratch
const tempCatalogPath = path.resolve('scratch/temp-catalog.js');
fs.writeFileSync(tempCatalogPath, catalogContent);

const STATIC_PRODUCTS = require('./temp-catalog.js');

// Function to escape single quotes in SQL
function esc(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

// Function to convert array to PostgreSQL array literal
function arr(array) {
  if (!array || array.length === 0) return 'NULL';
  const escapedItems = array.map(item => `"${item.replace(/"/g, '\\"')}"`);
  return `'\{${escapedItems.join(',')}\}'`;
}

let sql = `-- SQL migration and seed file for Supabase products table
-- Run this in the Supabase SQL editor to create the table and populate it with 25+ products

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand                 text,
  name                  text,
  product_name          text NOT NULL,
  description_fr        text,
  description_en        text,
  amazon_affiliate_link text,
  sephora_affiliate_link text,
  price_range           text,
  image_url             text,
  skin_types            text[],
  concerns              text[],
  routine_step          text,
  actives               text[],
  actives_en            text[],
  rating                numeric,
  review_count          text,
  efficacy_label_fr     text,
  efficacy_label_en     text,
  skin_problem          text,
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON products FOR SELECT USING (true);

INSERT INTO products (
  brand,
  name,
  product_name,
  description_fr,
  description_en,
  amazon_affiliate_link,
  sephora_affiliate_link,
  price_range,
  image_url,
  skin_types,
  concerns,
  routine_step,
  actives,
  actives_en,
  rating,
  review_count,
  efficacy_label_fr,
  efficacy_label_en,
  skin_problem
) VALUES
`;

const values = STATIC_PRODUCTS.map(p => {
  const brand = esc(p.brand);
  const name = esc(p.name);
  const productName = esc(p.productName);
  const descFr = esc(p.description_fr);
  const descEn = esc(p.description_en);
  const amazon = esc(p.amazonLink);
  const sephora = esc(p.sephoraLink);
  const price = esc(p.price || p.price_range);
  const imageUrl = esc(p.imageUrl);
  const skinTypes = arr(p.skinTypes);
  const concerns = arr(p.concerns);
  const routineStep = esc(p.routineStep);
  const actives = arr(p.actives);
  const activesEn = arr(p.actives_en || p.actives);
  const rating = p.rating || 4.5;
  const reviewCount = esc(p.count);
  const effFr = esc(p.efficacyLabel_fr);
  const effEn = esc(p.efficacyLabel_en);
  const skinProblem = esc(p.concerns[0] || 'general');

  return `(${brand}, ${name}, ${productName}, ${descFr}, ${descEn}, ${amazon}, ${sephora}, ${price}, ${imageUrl}, ${skinTypes}, ${concerns}, ${routineStep}, ${actives}, ${activesEn}, ${rating}, ${reviewCount}, ${effFr}, ${effEn}, ${skinProblem})`;
});

sql += values.join(',\n') + ';\n';

// Clean up temporary catalog
fs.unlinkSync(tempCatalogPath);

// Write to products_seed.sql
const outputPath = path.resolve('supabase/products_seed.sql');
fs.writeFileSync(outputPath, sql);

console.log("✅ Successfully generated supabase/products_seed.sql");
