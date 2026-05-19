import Head from 'next/head';
import Link from 'next/link';
import Logo from '../../components/Logo';
import { useLang } from '../../lib/LangContext';
import { articles } from '../../lib/blogData';

const GOLD = '#C5A028';
const WARM = '#A87449';

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {['en', 'fr'].map((l, i) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {i > 0 && <span style={{ color: '#E0DDD8', fontSize: 11 }}>|</span>}
          <button onClick={() => setLang(l)} style={{
            background: 'none', border: 'none',
            fontSize: 11, fontWeight: lang === l ? 700 : 400,
            color: lang === l ? '#2C241D' : '#B9AC9E',
            cursor: 'pointer', padding: '2px 5px',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>{l.toUpperCase()}</button>
        </span>
      ))}
    </div>
  );
}

function ArticleCard({ article }) {
  const readingLabel = `${article.readingTime} min de lecture`;
  const dateLabel = new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Link href={`/blog/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card-blur" style={{
        borderRadius: 24,
        padding: '28px 28px 24px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        height: '100%',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(168,116,73,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: WARM, background: 'rgba(168,116,73,0.1)', borderRadius: 20,
            padding: '3px 10px', fontFamily: "'DM Sans', sans-serif",
          }}>{article.category}</span>
          <span style={{ fontSize: 11, color: '#A2968B', fontFamily: "'DM Sans', sans-serif" }}>{readingLabel}</span>
        </div>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(17px, 2.5vw, 21px)', fontWeight: 600,
          color: '#2C241D', lineHeight: 1.3, margin: 0,
        }}>{article.title}</h2>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, color: '#6F6156', lineHeight: 1.65,
          margin: 0, flexGrow: 1,
        }}>{article.excerpt}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: '#A2968B', fontFamily: "'DM Sans', sans-serif" }}>{dateLabel}</span>
          <span style={{
            fontSize: 12, color: WARM, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em',
          }}>Lire l'article →</span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogIndex() {
  return (
    <>
      <Head>
        <title>Blog Skincare — Conseils Peau & Routine | Rate My Skin</title>
        <meta name="description" content="Conseils skincare d'experts, routines, ingrédients actifs et guides peau rédigés par des passionnés de dermatologie. Gratuit et sans jargon." />
        <meta name="keywords" content="blog skincare, conseils peau, routine skincare, ingrédients actifs, type de peau" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://ratemyskin.co/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ratemyskin.co/blog" />
        <meta property="og:title" content="Blog Skincare — Conseils Peau & Routine | Rate My Skin" />
        <meta property="og:description" content="Conseils skincare d'experts, routines, ingrédients actifs et guides peau rédigés par des passionnés de dermatologie." />
        <meta property="og:image" content="https://ratemyskin.co/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog Skincare — Conseils Peau & Routine | Rate My Skin" />
        <meta name="twitter:description" content="Conseils skincare d'experts, routines, ingrédients actifs et guides peau." />
        <meta name="twitter:image" content="https://ratemyskin.co/og-image.png" />
      </Head>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 8px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo height={32} />
          </Link>
          <LangToggle />
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '48px 0 40px' }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: WARM, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 12,
          }}>Blog Skincare</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 400,
            color: '#2C241D', lineHeight: 1.2, margin: '0 0 16px',
          }}>Conseils peau par des passionnés</h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, color: '#8C7A6B', lineHeight: 1.7,
            maxWidth: 520, margin: '0 auto',
          }}>Guides skincare fondés sur la science, sans jargon inutile. Pour comprendre votre peau et en prendre soin efficacement.</p>
        </div>

        {/* Articles grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {articles.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        {/* CTA */}
        <div className="card-blur" style={{
          borderRadius: 28, padding: '36px 28px', textAlign: 'center',
          marginTop: 56, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22, fontWeight: 400, color: '#2C241D', margin: '0 0 8px',
          }}>Découvrez votre score de peau</p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: '#8C7A6B', margin: '0 0 20px', lineHeight: 1.6,
          }}>Analyse IA gratuite en 30 secondes. Vos 3 problèmes de peau prioritaires, identifiés.</p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #3A2E26, #5A4035)',
              color: '#fff', border: 'none', borderRadius: 16,
              padding: '13px 28px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>Tester ma peau gratuitement →</button>
          </Link>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
