import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '../components/Logo';
import { useLang } from '../lib/LangContext';
import NavBar from '../components/NavBar';

const GOLD = '#C5A028';

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {['en', 'fr'].map((l, i) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {i > 0 && <span style={{ color: '#ddd', fontSize: 11, lineHeight: 1 }}>|</span>}
          <button
            onClick={() => setLang(l)}
            style={{
              background: 'none', border: 'none',
              fontSize: 11, fontWeight: lang === l ? 700 : 400,
              color: lang === l ? '#0d0d0d' : '#bbb',
              cursor: 'pointer', padding: '2px 5px',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 75 ? '#4CAF7D' : score >= 50 ? GOLD : '#C07050';
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${color}14`,
    }}>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'DM Sans', sans-serif" }}>
        {score}
      </span>
    </div>
  );
}

export default function MesRapports() {
  const router = useRouter();
  const { lang, t } = useLang();

  const [email, setEmail] = useState('');
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-fill from localStorage (same device)
    const stored = localStorage.getItem('rms_user_email') || localStorage.getItem('rms_email');
    if (stored) { setEmail(stored); return; }
    // Fallback: try httpOnly cookie via identity endpoint (e.g. cleared localStorage)
    fetch('/api/identity')
      .then(r => r.json())
      .then(({ email: cookieEmail }) => { if (cookieEmail) setEmail(cookieEmail); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setReports(null);

    try {
      const res = await fetch('/api/my-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed.');
      setReports(json.reports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openReport = (report) => {
    sessionStorage.setItem('rms_report', JSON.stringify(report.reportJson));
    sessionStorage.setItem('rms_analysis_id', report.id);
    sessionStorage.setItem('rms_is_paid', report.isPaid ? 'true' : 'false');
    router.push('/report');
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <>
      <Head>
        <title>{t('myReportsPageTitle')}</title>
        <meta name="description" content={lang === 'fr' ? "Retrouvez tous vos rapports d'analyse de peau payés en entrant votre email." : "Access all your paid skin analysis reports by entering your email."} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="canonical" href="https://ratemyskin.co/mes-rapports" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ratemyskin.co/mes-rapports" />
        <meta property="og:title" content={t('myReportsPageTitle')} />
        <meta property="og:description" content={lang === 'fr' ? "Retrouvez tous vos rapports d'analyse de peau payés en entrant votre email." : "Access all your paid skin analysis reports by entering your email."} />
        <meta property="og:image" content="https://ratemyskin.co/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('myReportsPageTitle')} />
        <meta name="twitter:description" content={lang === 'fr' ? "Retrouvez tous vos rapports d'analyse de peau payés en entrant votre email." : "Access all your paid skin analysis reports by entering your email."} />
        <meta name="twitter:image" content="https://ratemyskin.co/og-image.png" />
      </Head>

      {/* New unified nav */}
      <NavBar ctaLabel={lang === 'fr' ? 'Nouvelle analyse' : 'New analysis'} ctaHref="/" />
      {false && (
      <div className="nav-blur" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        padding: 'calc(13px + env(safe-area-inset-top, 0px)) 26px 13px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Logo />
        </div>
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LangToggle />
          <button
            onClick={() => router.push('/technologie')}
            style={{
              background: 'none', border: 'none',
              padding: '2px 4px', fontSize: 12, color: '#8C7A6B', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: '0.02em',
              marginRight: 6
            }}
          >
            {t('techNav')}
          </button>
          <button
            onClick={() => router.push('/blog')}
            style={{
              background: 'none', border: 'none',
              padding: '2px 4px', fontSize: 12, color: '#8C7A6B', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: '0.02em',
              marginRight: 6
            }}
          >
            {t('blogNav')}
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'rgba(255, 255, 255, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.55)',
              borderRadius: 10,
              padding: '9px 18px', fontSize: 12, color: '#6F6156', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 12px rgba(180, 160, 140, 0.05)',
            }}
          >
            {t('newAnalysis')}
          </button>
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
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-drawer-header">
            <div 
              onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/'); }} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Logo height={28} />
            </div>
            <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-drawer-close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C241D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </label>
          </div>
          <div className="mobile-nav-drawer-links">
            <button className="mobile-nav-drawer-link" onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/technologie'); }}>
              {t('techNav')}
            </button>
            <button className="mobile-nav-drawer-link" onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/blog'); }}>
              {t('blogNav')}
            </button>
            <button className="mobile-nav-drawer-link" onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/mes-rapports'); }}>
              {t('myReportsNav')}
            </button>
          </div>
          <div className="mobile-nav-drawer-cta">
            <button
              onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/'); }}
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
              {t('newAnalysis')}
            </button>
          </div>
        </div>
      </div>
      )}

      <main style={{
        minHeight: 'calc(100vh - 60px)',
        fontFamily: "'DM Sans', sans-serif",
        padding: '48px 20px 80px',
        maxWidth: 560,
        margin: '0 auto',
        background: 'linear-gradient(180deg, #FBF6EE 0%, #F8F1E5 50%, #F5EBDB 100%)',
      }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#B0885E', fontWeight: 600, marginBottom: 10,
          }}>
            {t('myReportsAccessLabel')}
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 400,
            color: '#3A2E26', margin: '0 0 12px', lineHeight: 1.2,
          }}>
            {t('myReportsTitle')}
          </h1>
          <p style={{ fontSize: 13, color: '#8C7A6B', margin: 0, lineHeight: 1.6 }}>
            {t('myReportsDesc')}
          </p>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoFocus
            style={{
              flex: '1 1 220px',
              border: '1px solid rgba(255, 255, 255, 0.45)', borderRadius: 14,
              padding: '13px 18px', fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              background: 'rgba(255, 255, 255, 0.35)', color: '#3A2E26',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 4px 12px rgba(180, 160, 140, 0.04)',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-liquid-glass-dark"
            style={{
              flex: '0 0 auto',
              borderRadius: 14, padding: '13px 22px',
              fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
              border: 'none',
            }}
          >
            {loading ? t('myReportsLoading') : t('myReportsButton')}
          </button>
        </form>

        {/* Error */}
        {error && (
          <p style={{ marginTop: 12, fontSize: 13, color: '#c0392b', textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Results */}
        {reports !== null && (
          <div style={{ marginTop: 36 }}>
            {reports.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 24px',
                background: 'rgba(255, 255, 255, 0.45)', borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(168, 116, 73, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              }}>
                <p style={{ fontSize: 14, color: '#8C7A6B', margin: 0 }}>
                  {t('myReportsEmpty')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 12, color: '#B9AC9E', margin: '0 0 4px' }}>
                  {t('myReportsFound', reports.length)}
                </p>
                {reports.map((report) => (
                  <div
                    key={report.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.55)',
                      borderRadius: 18,
                      padding: '18px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      boxShadow: '0 8px 32px rgba(168, 116, 73, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(20px) saturate(140%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                    }}
                  >
                    {report.score !== null && <ScoreBadge score={report.score} />}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 11, color: '#B9AC9E', margin: '0 0 4px',
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '4px 6px',
                      }}>
                        <span>{formatDate(report.createdAt)}</span>
                        {report.faceShape ? <span> · {report.faceShape}</span> : ''}
                        {report.skinTone ? <span> · {report.skinTone}</span> : ''}
                        {report.isPaid ? (
                          <span style={{ padding: '1px 6px', background: 'rgba(201,169,97,0.12)', border: '1px solid rgba(201,169,97,0.22)', color: '#A87449', borderRadius: 10, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Premium
                          </span>
                        ) : (
                          <span style={{ padding: '1px 6px', background: 'rgba(140,122,107,0.08)', border: '1px solid rgba(140,122,107,0.18)', color: '#8C7A6B', borderRadius: 10, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {lang === 'fr' ? 'Gratuit' : 'Free'}
                          </span>
                        )}
                      </p>
                      <p style={{
                        fontSize: 13, color: '#4A3C32', margin: 0,
                        lineHeight: 1.5, overflow: 'hidden',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {report.summary || report.skinConcern || '—'}
                      </p>
                    </div>

                    <button
                      onClick={() => openReport(report)}
                      className="btn-liquid-glass-dark"
                      style={{
                        flexShrink: 0,
                        borderRadius: 10, padding: '9px 16px',
                        fontSize: 12, fontWeight: 600,
                        whiteSpace: 'nowrap',
                        border: 'none',
                      }}
                    >
                      {t('myReportsViewReport')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
