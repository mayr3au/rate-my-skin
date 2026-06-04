// ─────────────────────────────────────────────────────────────────────────────
// /pages/api/image-proxy.js
//
// Server-side image proxy that bypasses anti-hotlinking protection on
// Amazon (m.media-amazon.com) and Sephora product image CDNs.
//
// Usage:  /api/image-proxy?url=<encoded-image-url>
// Cache:  1 year, immutable (images are content-addressable by URL)
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  api: {
    // Allow large images (up to 5 MB) through the proxy
    responseLimit: '5mb',
  },
};

// Domains we are willing to proxy. Prevents open-proxy abuse.
// To discover ALL domains in use: SELECT DISTINCT substring(product_image_url FROM 'https?://([^/]+)')
// FROM products WHERE product_image_url IS NOT NULL;
const ALLOWED_DOMAINS = [
  // Amazon
  'm.media-amazon.com',
  'images-na.ssl-images-amazon.com',
  'images.amazon.com',
  // Sephora
  'sephora.com',
  'media.sephora.com',
  'sephora.fr',
  'media.sephora.fr',
  // French parapharmacies
  'nocibe.fr',
  'media.nocibe.fr',
  'static.nocibe.fr',
  'img.nocibe.fr',
  'marionnaud.fr',
  'media.marionnaud.fr',
  'static.marionnaud.fr',
  'pharmacie-en-ligne.com',
  'beautycoiffeuse.com',
  // General e-commerce CDNs
  'cdn.shopify.com',
  'shopify.com',
  'res.cloudinary.com',
  'static.beautytocare.com',
  // Retailer CDNs
  'i5.walmartimages.com',
  'cdn-images.kiehls.com',
  'media.loccitane.com',
  'www.clarins.fr',
  'media.clarins.com',
  'www.lancome.fr',
  'media.lancome.com',
  'www.nuxe.com',
  'shop.nuxe.com',
  'images.ctfassets.net',
  'cdn.powerreviews.com',
  // Unsplash (fallback, no hotlink protection needed but listed for completeness)
  'images.unsplash.com',
  'plus.unsplash.com',
];

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // ── Domain allowlist check ────────────────────────────────────────────────
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const isAllowed = ALLOWED_DOMAINS.some(domain =>
    parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
  );

  if (!isAllowed) {
    console.warn(`[image-proxy] BLOCKED domain not in allowlist: ${parsedUrl.hostname} | full url: ${url.substring(0, 120)}`);
    return res.status(403).json({ error: 'Domain not allowed', domain: parsedUrl.hostname });
  }

  console.log(`[image-proxy] Proxying: ${parsedUrl.hostname}${parsedUrl.pathname.substring(0, 60)}`);
  // ── Proxy the image ───────────────────────────────────────────────────────
  try {
    const response = await fetch(url, {
      headers: {
        // Mimic a real browser to bypass hotlink protection
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        // Set referer to the origin of the image domain so the server thinks
        // the request is coming from their own site
        'Referer': parsedUrl.origin + '/',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'no-cache',
      },
      // 8-second timeout to avoid hanging requests
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(`[image-proxy] Upstream ${response.status} for: ${url}`);
      // Return a 404 so the client falls back to the placeholder
      return res.status(404).json({ error: `Upstream returned ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Guard against proxying non-image responses (e.g. HTML error pages)
    if (!contentType.startsWith('image/') && !contentType.startsWith('application/octet-stream')) {
      console.error(`[image-proxy] Non-image content-type "${contentType}" for: ${url}`);
      return res.status(422).json({ error: 'Not an image' });
    }

    const buffer = await response.arrayBuffer();

    // ── Cache headers (aggressive: images are immutable at a given URL) ────
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.byteLength);
    // 1 year CDN + browser cache, immutable tells browsers never to revalidate
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Prevent browsers from sniffing the content type
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      console.error(`[image-proxy] Timeout fetching: ${url}`);
      return res.status(504).json({ error: 'Image fetch timed out' });
    }
    console.error('[image-proxy] Error:', err.message, 'url:', url);
    return res.status(500).json({ error: 'Failed to proxy image' });
  }
}
