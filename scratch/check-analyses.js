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
    env[key] = value.trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAnalyses() {
  console.log("Querying latest analyses...");
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (error) {
    console.error("Error querying analyses table:", error);
  } else {
    console.log(`Found ${data.length} analyses.`);
    data.forEach((row, i) => {
      console.log(`\n--- Analysis #${i + 1} ---`);
      console.log("ID:", row.id);
      console.log("Is Paid:", row.is_paid);
      console.log("Created At:", row.created_at);
      console.log("Email:", row.email);
      console.log("Skin Concern:", row.skin_concern);
      console.log("Report JSON keys:", row.report_json ? Object.keys(row.report_json) : "null");
      if (row.report_json) {
        console.log("Overall Score:", row.report_json.overall);
        console.log("Skin Type:", row.report_json.skinType);
        console.log("Skin Tone:", row.report_json.skinTone);
        console.log("Free version keys:", row.report_json.free_version ? Object.keys(row.report_json.free_version) : "null");
        if (row.report_json.free_version) {
          console.log("Recommendations Count:", row.report_json.free_version.productRecommendations?.length);
          console.log("Problems:", JSON.stringify(row.report_json.free_version.mainProblems));
        }
        console.log("Paid version keys:", row.report_json.paid_version ? Object.keys(row.report_json.paid_version) : "null");
        if (row.report_json.paid_version) {
          console.log("Paid Recommendations Count:", row.report_json.paid_version.productRecommendations?.length);
        }
        console.log("Catalog length:", row.report_json.catalog ? row.report_json.catalog.length : "null");
      }
    });
  }
}

checkAnalyses();
