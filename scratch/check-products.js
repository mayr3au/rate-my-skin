const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProducts() {
  console.log("Supabase URL:", env.NEXT_PUBLIC_SUPABASE_URL);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Error querying products table:", error);
  } else {
    console.log("Successfully queried products table. First row keys:", data.length > 0 ? Object.keys(data[0]) : "No rows found");
    console.log("First row data:", data[0]);
  }
}

checkProducts();
