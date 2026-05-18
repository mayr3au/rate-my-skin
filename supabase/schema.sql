-- Run this in the Supabase SQL editor

-- ── Users (usage tracking) ──────────────────────────────────
create table if not exists public.users (
  id text primary key,
  analyses_used integer not null default 0,
  paid_credits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- ── Newsletter (email capture) ───────────────────────────────
create table if not exists public.newsletter (
  id bigserial primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter enable row level security;

-- Service role key bypasses RLS automatically.
-- This policy covers the anon/public key as a fallback.
create policy "allow_insert_newsletter"
  on public.newsletter for insert
  with check (true);

-- ── Freemium v2 migration ──────────────────────────────────────
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS paid_unlocks integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.analyses (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text         REFERENCES public.users(id),
  skin_concern text,
  report_json  jsonb,
  is_paid     boolean      NOT NULL DEFAULT false,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- ── RLS policies (run these in Supabase SQL editor) ──────────────────────────
-- Service role bypasses RLS automatically, but explicit policies ensure
-- inserts work even in edge cases and show clearly in the policy list.

-- Allow service role full access to users
CREATE POLICY IF NOT EXISTS "service_role_users_all"
  ON public.users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow service role full access to analyses
CREATE POLICY IF NOT EXISTS "service_role_analyses_all"
  ON public.analyses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── My Reports: add email column to analyses ─────────────────────────────────
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS email text;
CREATE INDEX IF NOT EXISTS analyses_email_idx ON public.analyses (email) WHERE email IS NOT NULL;

-- ── FK safety: drop the FK constraint on analyses.user_id ────────────────────
-- This prevents a failed user-row insert from cascading into a failed
-- analysis insert. analyses.user_id remains a text column; we just lose
-- the DB-level referential integrity check (acceptable for this use case).
--
-- Run this if analyses rows are still not saving:
--
--   ALTER TABLE public.analyses DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;
--
-- After dropping the FK, inserts with user_id = NULL or any text value will work.
