import { createAdminClient } from '../../lib/supabase';

// GET /api/debug-db — diagnose Supabase connectivity and env vars
// REMOVE THIS FILE AFTER DEBUGGING IS COMPLETE
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const report = {
    env: {
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      // Show partial key so you can verify it's the right one
      SERVICE_ROLE_KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) + '…' || 'NOT SET',
      SUPABASE_URL_VALUE: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    },
    tests: {},
  };

  const supabase = createAdminClient();

  // Test 1: read from products (no RLS)
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    report.tests.products_read = error ? `❌ ${error.message} (${error.code})` : `✅ ok (${data?.length} row)`;
  } catch (e) {
    report.tests.products_read = `❌ threw: ${e.message}`;
  }

  // Test 2: read from users (RLS — needs service role)
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    report.tests.users_read = error ? `❌ ${error.message} (${error.code})` : `✅ ok (${data?.length} rows)`;
  } catch (e) {
    report.tests.users_read = `❌ threw: ${e.message}`;
  }

  // Test 3: read from analyses (RLS — needs service role)
  try {
    const { data, error } = await supabase.from('analyses').select('id').limit(1);
    report.tests.analyses_read = error ? `❌ ${error.message} (${error.code})` : `✅ ok (${data?.length} rows)`;
  } catch (e) {
    report.tests.analyses_read = `❌ threw: ${e.message}`;
  }

  // Test 4: write a test user row then delete it
  const testId = 'debug-test-' + Date.now();
  try {
    const { error: insErr } = await supabase
      .from('users')
      .insert({ id: testId, analyses_used: 0, paid_credits: 0, paid_unlocks: 0 });
    if (insErr) {
      report.tests.users_insert = `❌ ${insErr.message} (${insErr.code}) — details: ${insErr.details}`;
    } else {
      await supabase.from('users').delete().eq('id', testId);
      report.tests.users_insert = '✅ insert + delete ok';
    }
  } catch (e) {
    report.tests.users_insert = `❌ threw: ${e.message}`;
  }

  // Test 5: write a test analysis row (requires test user to exist due to FK)
  const testUserId = 'debug-fk-' + Date.now();
  const testAnalysisId = crypto.randomUUID();
  try {
    // Insert temp user first
    await supabase.from('users').insert({ id: testUserId, analyses_used: 0, paid_credits: 0, paid_unlocks: 0 });
    const { error: insErr } = await supabase
      .from('analyses')
      .insert({ id: testAnalysisId, user_id: testUserId, report_json: { test: true }, is_paid: false });
    if (insErr) {
      report.tests.analyses_insert = `❌ ${insErr.message} (${insErr.code}) — details: ${insErr.details}`;
    } else {
      await supabase.from('analyses').delete().eq('id', testAnalysisId);
      report.tests.analyses_insert = '✅ insert + delete ok';
    }
    await supabase.from('users').delete().eq('id', testUserId);
  } catch (e) {
    report.tests.analyses_insert = `❌ threw: ${e.message}`;
  }

  return res.status(200).json(report);
}
