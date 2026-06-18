import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '../components/Logo';
import { useLang } from '../lib/LangContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

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

      <div style={{
        background: 'linear-gradient(180deg, #FBF6EE 0%, #F8F1E5 50%, #F5EBDB 100%)',
        minHeight: 'calc(100vh - 60px)',
        padding: '0 0 80px',
      }}>
      <main style={{
        fontFamily: "'DM Sans', sans-serif",
        padding: '64px 20px 0',
        maxWidth: 640,
        margin: '0 auto',
      }}>
        {/* Editorial heading */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ color: '#C9A961', fontSize: 14, opacity: 0.7, marginBottom: 14 }}>✦</div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: '#C9A961', fontWeight: 700, marginBottom: 14,
          }}>
            {lang === 'fr' ? 'Accède à tes analyses' : 'Access your analyses'}
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 400,
            color: '#2C2416', margin: '0 0 14px', lineHeight: 1.05,
            letterSpacing: '-0.015em',
          }}>
            {lang === 'fr' ? (<>Tes rapports, <em style={{ color: '#B0885E', fontStyle: 'italic' }}>retrouvés.</em></>) : (<>Your reports, <em style={{ color: '#B0885E', fontStyle: 'italic' }}>found.</em></>)}
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 16, color: '#5C4A3A', lineHeight: 1.5,
            margin: '0 auto', maxWidth: 460,
          }}>
            {lang === 'fr'
              ? "Entre l'email utilisé lors de tes analyses pour retrouver tous tes diagnostics."
              : "Enter the email used for your analyses to access all your diagnoses."}
          </p>
        </div>

        {/* Email form — premium card */}
        <div style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFAF4 100%)',
          border: '1px solid rgba(201,169,97,0.25)',
          borderRadius: 22,
          padding: 22,
          boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 16px 40px rgba(94,71,47,0.06)',
        }}>
          <label style={{
            display: 'block',
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#B0885E', fontWeight: 700, marginBottom: 10,
          }}>
            {lang === 'fr' ? 'Ton email' : 'Your email'}
          </label>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              required
              autoFocus
              style={{
                flex: '1 1 220px',
                border: '1px solid rgba(201,169,97,0.28)',
                borderRadius: 100,
                padding: '14px 20px', fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                background: '#FFFFFF',
                color: '#2C2416',
                boxShadow: 'inset 0 1px 2px rgba(168,116,73,0.04)',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(201,169,97,0.6)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(201,169,97,0.28)'}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: '0 0 auto',
                background: 'linear-gradient(180deg, #3A2F22 0%, #2C2416 50%, #1A1410 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 100,
                padding: '14px 24px',
                fontSize: 11.5, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif",
                cursor: loading ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset, 0 8px 20px rgba(44,36,22,0.22)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ color: '#C9A961', fontSize: 10 }}>✦</span>
              {loading ? t('myReportsLoading') : t('myReportsButton')}
            </button>
          </form>
          <p style={{
            fontSize: 11.5, color: '#8A7A6B', marginTop: 14, marginBottom: 0,
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
            textAlign: 'center',
          }}>
            {lang === 'fr'
              ? "Nous ne stockons jamais ta photo, uniquement les rapports liés à ton email."
              : "We never store your photo, only the reports linked to your email."}
          </p>
        </div>

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

        {/* Première analyse CTA (visible quand pas de reports chargés) */}
        {reports === null && (
          <div style={{
            marginTop: 48,
            padding: 28,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FDF5E8 100%)',
            border: '1px solid rgba(201,169,97,0.32)',
            borderRadius: 22,
            textAlign: 'center',
            boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 16px 40px rgba(168,116,73,0.08)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
              width: 60, height: 2,
              background: 'linear-gradient(90deg, transparent, #C9A961, transparent)',
            }} />
            <p style={{
              fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: '#C9A961', fontWeight: 700, marginTop: 6, marginBottom: 10,
            }}>
              {lang === 'fr' ? 'Premier passage ?' : 'First time?'}
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 400,
              color: '#2C2416', margin: '0 0 10px', lineHeight: 1.15,
              letterSpacing: '-0.005em',
            }}>
              {lang === 'fr' ? (<>Aucune analyse <em style={{ color: '#B0885E', fontStyle: 'italic' }}>encore</em></>) : (<>No analysis <em style={{ color: '#B0885E', fontStyle: 'italic' }}>yet</em></>)}
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
              fontSize: 15, color: '#5C4A3A', lineHeight: 1.5,
              margin: '0 auto 18px', maxWidth: 360,
            }}>
              {lang === 'fr'
                ? "Lance ta première analyse en 30 secondes, gratuite et sans inscription."
                : "Start your first analysis in 30 seconds — free, no signup."}
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'linear-gradient(180deg, #3A2F22 0%, #2C2416 50%, #1A1410 100%)',
                color: '#fff', border: 'none',
                borderRadius: 100,
                padding: '14px 28px',
                fontSize: 12, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
                boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset, 0 10px 22px rgba(44,36,22,0.22)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ color: '#C9A961', fontSize: 11 }}>✦</span>
              {lang === 'fr' ? 'Lancer mon analyse' : 'Start my analysis'}
            </button>
          </div>
        )}

        {/* Comment ça marche */}
        <div style={{ marginTop: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{
              fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: '#B0885E', fontWeight: 700, marginBottom: 10,
            }}>
              {lang === 'fr' ? 'Bon à savoir' : 'Good to know'}
            </p>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 400,
              color: '#2C2416', margin: 0, letterSpacing: '-0.005em',
            }}>
              {lang === 'fr' ? <>Comment <em style={{ color: '#B0885E', fontStyle: 'italic' }}>ça marche</em></> : <>How <em style={{ color: '#B0885E', fontStyle: 'italic' }}>it works</em></>}
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}>
            {[
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2" /><circle cx="12" cy="12.5" r="3" /><path d="M9 6V4h6v2" /></svg>,
                title: lang === 'fr' ? 'Tu scannes' : 'You scan',
                desc: lang === 'fr' ? 'Photo de ta peau, en 30 secondes' : 'Photo of your skin, in 30 seconds'
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 6H2v12h20z" /><path d="M10 12h.01M14 12h.01" /><path d="M6 10v4" /><path d="M18 10v4" /></svg>,
                title: lang === 'fr' ? 'Tu reçois' : 'You receive',
                desc: lang === 'fr' ? 'Ton rapport envoyé sur ton email' : 'Your report sent to your email'
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>,
                title: lang === 'fr' ? 'Tu y retournes' : 'You come back',
                desc: lang === 'fr' ? 'Accès à vie via cet email' : 'Lifetime access via this email'
              },
            ].map((step, i) => (
              <div key={i} style={{
                padding: '20px 18px',
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(201,169,97,0.18)',
                borderRadius: 16,
                textAlign: 'center',
                boxShadow: '0 6px 18px rgba(168,116,73,0.04)',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(201,169,97,0.16) 0%, rgba(201,169,97,0.04) 100%)',
                  border: '1px solid rgba(201,169,97,0.25)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#8B6E26', marginBottom: 12,
                }}>
                  <div style={{ width: 18, height: 18 }}>{step.icon}</div>
                </div>
                <h4 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 18, fontWeight: 500, color: '#2C2416',
                  margin: '0 0 4px', letterSpacing: '-0.005em',
                }}>{step.title}</h4>
                <p style={{
                  fontSize: 12.5, color: '#5C4A3A', lineHeight: 1.5, margin: 0,
                }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer help */}
        <p style={{
          textAlign: 'center', marginTop: 36, fontSize: 11.5, color: '#8A7A6B',
          fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
        }}>
          {lang === 'fr'
            ? "Pas d'email reçu ? Vérifie tes spams ou contacte hello@ratemyskin.co"
            : "No email received? Check spam or contact hello@ratemyskin.co"}
        </p>
      </main>
      <Footer />
      </div>
    </>
  );
}
