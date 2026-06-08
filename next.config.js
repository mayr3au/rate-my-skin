/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'm.media-amazon.com',
      'media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'images.unsplash.com',
      'ratemyskin.co',
      'sephora.com',
      'media.sephora.com',
      'sephora.fr',
      'media.sephora.fr',
      'media.sephora.eu'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
