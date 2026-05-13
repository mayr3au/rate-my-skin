const ALLOWED_ORIGIN =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : (process.env.ALLOWED_ORIGIN || 'https://rate-my-skin.vercel.app');

// ── CORS ─────────────────────────────────────────────────────────────────────
// Returns true if the request was an OPTIONS preflight (caller should return).
export function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

// ── Client IP ─────────────────────────────────────────────────────────────────
export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// ── Rate limiting (Supabase-backed) ──────────────────────────────────────────
// Returns true if the IP is over the limit (caller should block).
// Fails open on DB errors so a Supabase outage never blocks legit users.
export async function checkRateLimit(supabase, ip, limit = 5, windowMs = 60 * 60 * 1000) {
  try {
    const windowCutoff = new Date(Date.now() - windowMs).toISOString();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('rate_limits')
      .select('count, window_start')
      .eq('ip', ip)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[rate_limit] db read error:', error.message);
      return false; // fail open
    }

    if (!data || data.window_start < windowCutoff) {
      // No record or expired window → start fresh
      await supabase
        .from('rate_limits')
        .upsert({ ip, count: 1, window_start: now }, { onConflict: 'ip' });
      return false;
    }

    if (data.count >= limit) return true; // over limit

    await supabase
      .from('rate_limits')
      .update({ count: data.count + 1 })
      .eq('ip', ip);

    return false;
  } catch (err) {
    console.error('[rate_limit] unexpected error:', err.message);
    return false; // fail open
  }
}

// ── reCAPTCHA v3 ─────────────────────────────────────────────────────────────
// Skipped silently if RECAPTCHA_SECRET_KEY is not set (dev / unconfigured).
// Returns true = OK, false = blocked.
export async function verifyCaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // not configured — skip
  if (!token)  return false;

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const data = await response.json();
    // score >= 0.5 is the recommended threshold for v3
    return data.success === true && (data.score ?? 1) >= 0.5;
  } catch (err) {
    console.error('[captcha] verification error:', err.message);
    return true; // fail open on network error
  }
}

// ── Image validation ──────────────────────────────────────────────────────────
// Returns an error string, or null if valid.
export function validateImage(imageBase64, mimeType) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!mimeType || !allowed.includes(mimeType)) {
    return 'Invalid file type. Only JPG, PNG, and WebP are accepted.';
  }
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return 'Missing image data.';
  }
  // 10 MB decoded ≈ 13.4 MB base64
  if (imageBase64.length > 13_500_000) {
    return 'Image too large. Maximum 10 MB.';
  }
  // Verify base64 magic bytes match the declared MIME type
  const header = imageBase64.slice(0, 12);
  const sigMap = {
    'image/jpeg': ['/9j/'],
    'image/png':  ['iVBOR'],
    'image/webp': ['UklGR'],
  };
  const sigs = sigMap[mimeType] || [];
  if (sigs.length && !sigs.some(s => header.startsWith(s))) {
    return 'File content does not match the declared image type.';
  }
  return null;
}

// ── Email validation ──────────────────────────────────────────────────────────
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email.trim());
}

// ── Text sanitisation ─────────────────────────────────────────────────────────
export function sanitiseText(str, maxLen = 500) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

// ── Security event logging ────────────────────────────────────────────────────
export async function logSecurityEvent(supabase, { ip, event, details = {} }) {
  try {
    await supabase.from('security_logs').insert({
      ip,
      event,
      details,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal — never let logging break a request
  }
}
