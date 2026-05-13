-- ── Rate limits ─────────────────────────────────────────────────────────────
-- One row per IP. Resets when window_start is older than 1 hour.
CREATE TABLE IF NOT EXISTS rate_limits (
  ip           text        PRIMARY KEY,
  count        int         NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- No public policy — service role only.
CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits (window_start);

-- ── Security logs ─────────────────────────────────────────────────────────────
-- Append-only log of blocked / suspicious requests.
-- event values: 'rate_limit' | 'captcha_fail' | 'invalid_input' | 'quota_exceeded' | 'cors_violation'
CREATE TABLE IF NOT EXISTS security_logs (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip         text,
  event      text,
  details    jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
-- No public policy — service role only.
CREATE INDEX IF NOT EXISTS security_logs_ip_idx  ON security_logs (ip);
CREATE INDEX IF NOT EXISTS security_logs_evt_idx ON security_logs (event);
CREATE INDEX IF NOT EXISTS security_logs_ts_idx  ON security_logs (created_at DESC);
