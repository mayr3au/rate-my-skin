import { createClient } from '@supabase/supabase-js';

// Server-side admin client — never expose SUPABASE_SERVICE_ROLE_KEY to the browser
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
