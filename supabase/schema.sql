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
