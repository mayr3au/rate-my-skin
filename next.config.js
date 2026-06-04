/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'm.media-amazon.com',
      'media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'images.unsplash.com',
      'ratemyskin.co'
    ],
  },
};

module.exports = nextConfig;
