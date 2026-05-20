import { articles } from '../lib/blogData';

export default function Sitemap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const lastmod = new Date().toISOString().split('T')[0];

  const pages = [
    { url: 'https://ratemyskin.co/', priority: '1.0', changefreq: 'daily' },
    { url: 'https://ratemyskin.co/note-ma-peau', priority: '0.9', changefreq: 'monthly' },
    { url: 'https://ratemyskin.co/mes-rapports', priority: '0.8', changefreq: 'weekly' },
    { url: 'https://ratemyskin.co/report', priority: '0.5', changefreq: 'monthly' },
    { url: 'https://ratemyskin.co/blog', priority: '0.8', changefreq: 'weekly' },
    ...articles.map(a => ({
      url: `https://ratemyskin.co/blog/${a.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ url, priority, changefreq }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();

  return { props: {} };
}
