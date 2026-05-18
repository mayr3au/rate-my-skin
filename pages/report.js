import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import BeautyReport from '../components/BeautyReport';
import Logo from '../components/Logo';
import { useLang } from '../lib/LangContext';

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
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

export default function Report() {
  const router = useRouter();
  const { t } = useLang();

  const [data, setData] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [userId, setUserId] = useState(null);
  const [paidUnlocks, setPaidUnlocks] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    // 1. Read from sessionStorage
    const stored = sessionStorage.getItem('rms_report');
    if (!stored) { setNotFound(true); return; }
    try {
      setData(JSON.parse(stored));
    } catch {
      setNotFound(true);
      return;
    }

    const storedAnalysisId = sessionStorage.getItem('rms_analysis_id');
    if (storedAnalysisId) setAnalysisId(storedAnalysisId);

    const storedIsPaid = sessionStorage.getItem('rms_is_paid');
    if (storedIsPaid === 'true') setIsPaid(true);

    // 2. Fetch identity + paid_unlocks
    fetch('/api/identity')
      .then(r => r.json())
      .then(({ userId: uid, paidUnlocks: unlocks }) => {
        setUserId(uid);
        if (unlocks > 0) setPaidUnlocks(unlocks);
      })
      .catch(() => {});
  }, []);

  // 3. Handle payment=success query param
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.payment !== 'success') return;

    const storedAnalysisId = sessionStorage.getItem('rms_analysis_id');
    if (!storedAnalysisId) return;

    setCheckingPayment(true);
    // Remove query param from URL
    router.replace('/report', undefined, { shallow: true });

    // Poll analysis status — up to 10 attempts × 2s = 20s coverage for slow webhooks
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch(`/api/analysis-status?id=${storedAnalysisId}`);
        const { isPaid: paid } = await res.json();
        if (paid) {
          sessionStorage.setItem('rms_is_paid', 'true');
          setIsPaid(true);
          setCheckingPayment(false);
          return;
        }
      } catch {}
      attempts++;
      if (attempts < 10) {
        setTimeout(poll, 2000);
      } else {
        setCheckingPayment(false);
      }
    };

    poll();
  }, [router.isReady, router.query.payment]);

  // 4. handleUnlock: calls checkout, redirects to Stripe
  const handleUnlock = async (planId) => {
    if (!userId || !analysisId) return;
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, analysisId, planId }),
      });
      const { url, error: err } = await res.json();
      if (err) throw new Error(err);
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err.message);
    }
  };

  if (notFound) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif", gap: 16,
      }}>
        <p style={{ fontSize: 14, color: '#aaa' }}>{t('noReportFound')}</p>
        <button
          onClick={() => router.push('/')}
          style={{
            background: '#0d0d0d', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 24px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {t('startNewAnalysis')}
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('reportTitle')}</title>
        <meta name="description" content={t('reportMetaDesc')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* Payment checking overlay */}
      {checkingPayment && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(253,250,247,0.97)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, gap: 16,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            width: 32, height: 32,
            border: '2px solid #0d0d0d', borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          }}/>
          <p style={{ fontSize: 14, color: '#0d0d0d' }}>{t('checkingPayment')}</p>
        </div>
      )}

      {/* Sticky frosted-glass nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(247,247,245,0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '13px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        animation: 'slideDown 0.55s ease',
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {paidUnlocks > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, rgba(197,160,40,0.08), rgba(212,165,116,0.06))',
              border: '1px solid rgba(197,160,40,0.28)',
              borderRadius: 20, padding: '4px 11px',
            }}>
              <span style={{ fontSize: 7, color: '#C5A028', fontWeight: 700 }}>✦</span>
              <span style={{ fontSize: 11, color: '#8C6A3A', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                {paidUnlocks} report{paidUnlocks !== 1 ? 's' : ''} left
              </span>
            </div>
          )}
          <LangToggle />
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none', border: '1px solid #E8E8E4', borderRadius: 10,
              padding: '9px 18px', fontSize: 12, color: '#888', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {t('newAnalysis')}
          </button>
        </div>
      </div>

      <BeautyReport data={data} isPaid={isPaid} onUnlock={handleUnlock} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
