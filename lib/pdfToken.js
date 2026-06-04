import crypto from 'crypto';

export function signPdfToken() {
  const secret = process.env.PDF_SECRET || 'fallback-local-dev-secret-key-123456';
  const expiresAt = Date.now() + 60 * 1000; // 1 minute expiry
  const body = JSON.stringify({ authorized: true, expiresAt });
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const tokenObj = { body, signature };
  return Buffer.from(JSON.stringify(tokenObj)).toString('base64url');
}

export function verifyPdfToken(token) {
  if (!token) return false;
  const secret = process.env.PDF_SECRET || 'fallback-local-dev-secret-key-123456';
  try {
    const tokenObj = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    const { body, signature } = tokenObj;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (signature !== expectedSignature) {
      return false;
    }
    const { authorized, expiresAt } = JSON.parse(body);
    if (!authorized) {
      return false;
    }
    if (Date.now() > expiresAt) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
