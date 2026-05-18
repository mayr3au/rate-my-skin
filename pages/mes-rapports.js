import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '../components/Logo';
import { useLang } from '../lib/LangContext';

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
    sessionStorage.setItem('rms_is_paid', 'true');
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
        <title>{lang === 'fr' ? 'Mes rapports — Rate My Skin' : 'My Reports — Rate My Skin'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(247,247,245,0.92)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '13px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LangToggle />
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none', border: '1px solid #E8E8E4', borderRadius: 10,
              padding: '9px 18px', fontSize: 12, color: '#888', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            }}
          >
            {t('newAnalysis')}
          </button>
        </div>
      </div>

      <main style={{
        minHeight: 'calc(100vh - 60px)',
        fontFamily: "'DM Sans', sans-serif",
        padding: '48px 20px 80px',
        maxWidth: 560,
        margin: '0 auto',
      }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#B0885E', fontWeight: 600, marginBottom: 10,
          }}>
            {lang === 'fr' ? 'Accès à vos analyses' : 'Access your analyses'}
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
              border: 'none', borderRadius: 14,
              padding: '13px 18px', fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              background: 'rgba(245, 240, 235, 0.7)', color: '#3A2E26',
              boxShadow: 'inset 0 2px 6px rgba(180,160,140,0.1)',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: '0 0 auto',
              background: '#2C241D', color: '#fff', border: 'none',
              borderRadius: 14, padding: '13px 22px',
              fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              opacity: loading ? 0.7 : 1,
              whiteSpace: 'nowrap',
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
                background: 'rgba(245,240,235,0.5)', borderRadius: 20,
                border: '1px solid rgba(212,165,116,0.15)',
              }}>
                <p style={{ fontSize: 14, color: '#8C7A6B', margin: 0 }}>
                  {t('myReportsEmpty')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 12, color: '#B9AC9E', margin: '0 0 4px' }}>
                  {reports.length} {lang === 'fr' ? `rapport${reports.length > 1 ? 's' : ''} trouvé${reports.length > 1 ? 's' : ''}` : `report${reports.length !== 1 ? 's' : ''} found`}
                </p>
                {reports.map((report) => (
                  <div
                    key={report.id}
                    style={{
                      background: '#FDFBF8',
                      border: '1px solid rgba(212,165,116,0.18)',
                      borderRadius: 18,
                      padding: '18px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      boxShadow: '0 2px 12px rgba(168,116,73,0.04)',
                    }}
                  >
                    {report.score !== null && <ScoreBadge score={report.score} />}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 11, color: '#B9AC9E', margin: '0 0 4px',
                        letterSpacing: '0.04em',
                      }}>
                        {formatDate(report.createdAt)}
                        {report.faceShape ? ` · ${report.faceShape}` : ''}
                        {report.skinTone ? ` · ${report.skinTone}` : ''}
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
                      style={{
                        flexShrink: 0,
                        background: '#2C241D', color: '#fff', border: 'none',
                        borderRadius: 10, padding: '9px 16px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: 'nowrap',
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
