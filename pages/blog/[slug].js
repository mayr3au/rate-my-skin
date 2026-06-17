import Head from 'next/head';
import Link from 'next/link';
import Logo from '../../components/Logo';
import { useLang } from '../../lib/LangContext';
import { articles, getArticleBySlug } from '../../lib/blogData';

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

function ContentBlock({ block }) {
  const bodyStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15, color: '#3A2E26', lineHeight: 1.75,
    margin: '0 0 16px',
  };

  switch (block.type) {
    case 'h2':
      return (
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 600,
          color: '#2C241D', margin: '36px 0 14px', lineHeight: 1.3,
        }}>{block.text}</h2>
      );
    case 'h3':
      return (
        <h3 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, fontWeight: 700,
          color: '#2C241D', margin: '24px 0 10px', lineHeight: 1.4,
          textTransform: 'none',
        }}>{block.text}</h3>
      );
    case 'p':
      return <p style={bodyStyle} dangerouslySetInnerHTML={{ __html: block.html }} />;
    case 'ul':
      return (
        <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
          {block.items.map((item, i) => (
            <li key={i} style={{
              ...bodyStyle, margin: '0 0 8px',
              paddingLeft: 4,
            }} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
    case 'highlight':
      return (
        <div style={{
          background: 'rgba(197,160,40,0.08)',
          border: '1px solid rgba(197,160,40,0.22)',
          borderRadius: 14, padding: '14px 18px',
          margin: '20px 0',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: '#5A4A2E', lineHeight: 1.65,
        }} dangerouslySetInnerHTML={{ __html: block.html }} />
      );
    case 'product':
      return (
        <a href={block.link} target="_blank" rel="noopener noreferrer nofollow" style={{ textDecoration: 'none', display: 'block', margin: '20px 0' }}>
          <div className="card-blur" style={{
            borderRadius: 18, padding: '18px 20px',
            display: 'flex', gap: 14, alignItems: 'flex-start',
            cursor: 'pointer', transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(197,160,40,0.15), rgba(168,116,73,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, fontWeight: 700, color: '#2C241D', margin: 0,
                }}>{block.name}</p>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: WARM,
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                }}>{block.price}</span>
              </div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12, color: '#6F6156', lineHeight: 1.55, margin: '0 0 8px',
              }}>{block.description}</p>
              <span style={{
                fontSize: 11, fontWeight: 600, color: WARM,
                fontFamily: "'DM Sans', sans-serif",
              }}>Voir sur Amazon.fr →</span>
            </div>
          </div>
        </a>
      );
    case 'cta':
      return (
        <div className="card-blur" style={{
          borderRadius: 24, padding: '32px 24px', textAlign: 'center',
          margin: '40px 0 8px',
        }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: WARM, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 10,
          }}>{block.kicker || 'Analyse gratuite'}</p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 400,
            color: '#2C241D', margin: '0 0 10px', lineHeight: 1.3,
          }}>{block.title || 'Testez votre peau gratuitement'}</p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: '#8C7A6B', margin: '0 0 20px', lineHeight: 1.65,
          }}>{block.desc || 'Importez une photo et obtenez votre score de peau + 3 problèmes prioritaires en 30 secondes. 100% gratuit.'}</p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #3A2E26, #5A4035)',
              color: '#fff', border: 'none', borderRadius: 16,
              padding: '14px 28px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>{block.buttonText || 'Analyser ma peau → ratemyskin.co'}</button>
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default function ArticlePage({ article, relatedArticles }) {
  const { lang, t } = useLang();
  if (!article) return null;

  const dateLabel = new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const articleUrl = `https://ratemyskin.co/blog/${article.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    url: articleUrl,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { '@type': 'Organization', name: 'Rate My Skin', url: 'https://ratemyskin.co' },
    publisher: { '@type': 'Organization', name: 'Rate My Skin', url: 'https://ratemyskin.co' },
    keywords: article.keyword,
    inLanguage: 'fr',
  };

  return (
    <>
      <Head>
        <title>{article.metaTitle}</title>
        <meta name="description" content={article.metaDescription} />
        <meta name="keywords" content={article.keyword} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={article.metaTitle} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:image" content="https://ratemyskin.co/og-image.png" />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.metaTitle} />
        <meta name="twitter:description" content={article.metaDescription} />
        <meta name="twitter:image" content="https://ratemyskin.co/og-image.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 8px', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo height={32} />
          </Link>
          <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 16px)' }}>
            <LangToggle />
            <Link href="/technologie" style={{
              fontSize: 12, color: '#8C7A6B', textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: '0.02em', whiteSpace: 'nowrap'
            }}>
              {lang === 'fr' ? 'Technologie' : 'Our Tech'}
            </Link>
            <Link href="/" style={{
              fontSize: 12, color: WARM, textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              letterSpacing: '0.02em', whiteSpace: 'nowrap'
            }}>
              {lang === 'fr' ? 'Analyser ma peau' : 'Analyze my skin'}
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <input type="checkbox" id="mobile-nav-toggle-checkbox" className="mobile-nav-toggle" />
          <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: 14 }}>
            <LangToggle />
            <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-toggle-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C241D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </label>
          </div>

          {/* Mobile Navigation Drawer Backdrop Overlay */}
          <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-overlay" />

          {/* Mobile Drawer Content */}
          <div className="mobile-nav-drawer" style={{ textAlign: 'left' }}>
            <div className="mobile-nav-drawer-header">
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}>
                <Logo height={28} />
              </Link>
              <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-drawer-close">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C241D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </label>
            </div>
            <div className="mobile-nav-drawer-links">
              <Link href="/technologie" className="mobile-nav-drawer-link" style={{ display: 'block', textDecoration: 'none' }} onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}>
                {t('techNav')}
              </Link>
              <Link href="/blog" className="mobile-nav-drawer-link" style={{ display: 'block', textDecoration: 'none' }} onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}>
                {t('blogNav')}
              </Link>
              <Link href="/mes-rapports" className="mobile-nav-drawer-link" style={{ display: 'block', textDecoration: 'none' }} onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}>
                {t('myReportsNav')}
              </Link>
            </div>
            <div className="mobile-nav-drawer-cta">
              <Link href="/" style={{ textDecoration: 'none' }}>
                <button
                  onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3D2914 0%, #281B0D 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px 20px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    boxShadow: '0 4px 14px rgba(61, 41, 20, 0.15)'
                  }}
                >
                  {lang === 'fr' ? 'Analyser ma peau' : 'Analyze my skin'}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav style={{ padding: '16px 0 0', marginBottom: 8 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A2968B' }}>
            <Link href="/" style={{ color: '#A2968B', textDecoration: 'none' }}>Accueil</Link>
            {' '}&rsaquo;{' '}
            <Link href="/blog" style={{ color: '#A2968B', textDecoration: 'none' }}>Blog</Link>
            {' '}&rsaquo;{' '}
            <span style={{ color: '#6F6156' }}>{article.category}</span>
          </span>
        </nav>

        {/* Article header */}
        <header style={{ padding: '24px 0 32px', borderBottom: '1px solid rgba(168,116,73,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: WARM, background: 'rgba(168,116,73,0.1)', borderRadius: 20,
              padding: '3px 10px', fontFamily: "'DM Sans', sans-serif",
            }}>{article.category}</span>
            <span style={{ fontSize: 11, color: '#A2968B', fontFamily: "'DM Sans', sans-serif" }}>
              {article.readingTime} min de lecture
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 400,
            color: '#2C241D', lineHeight: 1.2, margin: '0 0 14px',
          }}>{article.title}</h1>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: '#A2968B',
          }}>Publié le {dateLabel}</p>
        </header>

        {/* Article body */}
        <article style={{ padding: '32px 0' }}>
          {article.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(168,116,73,0.12)', paddingTop: 36 }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22, fontWeight: 400, color: '#2C241D',
              margin: '0 0 20px',
            }}>Articles liés</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {relatedArticles.map(rel => (
                <Link key={rel.slug} href={`/blog/${rel.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card-blur" style={{
                    borderRadius: 16, padding: '16px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', transition: 'transform 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: WARM, fontFamily: "'DM Sans', sans-serif",
                      }}>{rel.category}</span>
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13, fontWeight: 600, color: '#2C241D',
                        margin: '4px 0 0',
                      }}>{rel.title}</p>
                    </div>
                    <span style={{ color: WARM, fontSize: 16, flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to blog */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/blog" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: WARM, fontWeight: 600,
            }}>← Tous les articles</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: articles.map(a => ({ params: { slug: a.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return { notFound: true };

  const relatedArticles = articles
    .filter(a => a.slug !== params.slug)
    .slice(0, 3)
    .map(({ slug, title, category }) => ({ slug, title, category }));

  return {
    props: { article, relatedArticles },
  };
}
