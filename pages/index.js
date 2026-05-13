import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo, { Flower } from '../components/Logo';
import { useLang } from '../lib/LangContext';

const FREE_LIMIT = 2;

/* ── Warm palette ── */
/* ── Luxury Gilded Palette ── */
const C = {
  dark:        '#0F0F0F',
  gold:        '#C5A028',
  goldLight:   '#D4B34B',
  bg:          '#FFFFFF',
  surface:     '#FFFFFF',
  surfaceAlt:  '#FBF9F4',
  border:      '#E8E4DA',
  borderStrong:'#D8D0C4',
  textMid:     '#5A5550',
  textLight:   '#8A8580',
  textFaint:   '#B5B0AA',
};

function getUserId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('rms_user_id');
  if (!id) {
    id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('rms_user_id', id);
  }
  return id;
}

async function compressImage(file) {
  if (file.size <= 4 * 1024 * 1024) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const maxDim = 1920;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio); height = Math.round(height * ratio);
      }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.85);
    };
    img.src = url;
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Language toggle ── */
function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {['en', 'fr'].map((l, i) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {i > 0 && <span style={{ color: C.border, fontSize: 11 }}>|</span>}
          <button onClick={() => setLang(l)} style={{
            background: 'none', border: 'none', fontSize: 10.5,
            fontWeight: lang === l ? 700 : 400,
            color: lang === l ? C.dark : C.textFaint,
            cursor: 'pointer', padding: '2px 6px',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

/* ── Botanical corner SVGs ── */
function BotanicalBottomLeft() {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, pointerEvents: 'none', zIndex: 0, animation: 'botanicalDrift 26s ease-in-out infinite' }}>
    <svg
      width="220" height="220"
      viewBox="0 0 220 220"
      fill="none"
      style={{ opacity: 0.055, display: 'block' }}
    >
      {/* Main stem */}
      <path d="M 5,215 C 30,185 55,160 70,125 C 82,98 88,78 92,55" stroke={C.dark} strokeWidth="1" strokeLinecap="round"/>
      {/* Leaf 1 — lower left */}
      <path d="M 38,168 C 24,152 12,146 18,132 C 30,138 40,152 38,168 Z" stroke={C.dark} strokeWidth="0.7" strokeLinejoin="round"/>
      {/* Leaf 2 — mid right */}
      <path d="M 72,122 C 60,107 64,92 76,98 C 74,108 73,116 72,122 Z" stroke={C.dark} strokeWidth="0.65" strokeLinejoin="round"/>
      {/* Leaf 3 — upper left */}
      <path d="M 88,68 C 73,60 68,46 78,40 C 82,51 86,61 88,68 Z" stroke={C.dark} strokeWidth="0.6" strokeLinejoin="round"/>
      {/* Small bud */}
      <circle cx="92" cy="52" r="3.5" stroke={C.dark} strokeWidth="0.6"/>
      <path d="M 88,52 C 88,46 92,42 92,42 C 92,42 96,46 96,52" stroke={C.dark} strokeWidth="0.5" strokeLinecap="round"/>
      {/* Tiny leaf off stem */}
      <path d="M 58,144 C 45,138 42,128 50,126 C 54,132 57,139 58,144 Z" stroke={C.dark} strokeWidth="0.5" strokeLinejoin="round"/>
    </svg>
    </div>
  );
}

function BotanicalTopRight() {
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, pointerEvents: 'none', zIndex: 0, animation: 'botanicalDrift 30s ease-in-out infinite reverse' }}>
    <svg
      width="220" height="220"
      viewBox="0 0 220 220"
      fill="none"
      style={{ position: 'fixed', top: 0, right: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.05 }}
    >
      {/* Main stem from top-right */}
      <path d="M 215,5 C 190,30 168,55 152,82 C 138,106 130,128 126,152" stroke={C.dark} strokeWidth="1" strokeLinecap="round"/>
      {/* Leaf 1 — upper */}
      <path d="M 188,26 C 200,14 214,16 210,30 C 200,30 193,28 188,26 Z" stroke={C.dark} strokeWidth="0.7" strokeLinejoin="round"/>
      {/* Leaf 2 — mid */}
      <path d="M 158,70 C 168,57 180,57 177,70 C 170,72 163,72 158,70 Z" stroke={C.dark} strokeWidth="0.65" strokeLinejoin="round"/>
      {/* Leaf 3 — lower left */}
      <path d="M 136,106 C 122,98 120,84 132,85 C 134,94 136,101 136,106 Z" stroke={C.dark} strokeWidth="0.6" strokeLinejoin="round"/>
      {/* Tiny accent leaves */}
      <path d="M 172,48 C 178,38 188,40 185,50 C 179,50 175,49 172,48 Z" stroke={C.dark} strokeWidth="0.5" strokeLinejoin="round"/>
      <path d="M 143,88 C 133,82 130,72 140,72 C 141,79 142,85 143,88 Z" stroke={C.dark} strokeWidth="0.5" strokeLinejoin="round"/>
    </svg>
    </div>
  );
}

/* ── Trust signal row ── */
function TrustSignals({ t, visible }) {
  const signals = [
    { num: t('trust2Num'), label: t('trust2Label') },
  ];
  return (
    <div style={{
      display: 'flex', gap: 10, flexWrap: 'wrap',
      justifyContent: 'center', marginBottom: 44,
    }}>
      {signals.map(({ num, label }, i) => (
        <div
          key={i}
          style={{
            flex: '1 1 140px', maxWidth: 170,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: '20px 14px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(14px)',
            transition: `all 0.7s cubic-bezier(0.4,0,0.2,1) ${0.58 + i * 0.12}s`,
          }}
        >
          <div style={{
            fontSize: 24, fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400, color: C.gold, letterSpacing: '-0.01em',
            marginBottom: 4, lineHeight: 1,
          }}>
            {num}
          </div>
          <div style={{
            fontSize: 10, color: C.textMid, lineHeight: 1.5,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.08em',
            textTransform: 'uppercase', fontWeight: 500,
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Skin concern field ── */
function SkinConcernField({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          border: `1px solid ${focused ? C.gold : C.border}`,
          borderRadius: 16,
          padding: '18px 20px',
          fontSize: 13.5,
          fontFamily: "'DM Sans', sans-serif",
          color: C.dark,
          background: C.surface,
          outline: 'none',
          resize: 'none',
          lineHeight: 1.7,
          transition: 'all 0.3s ease',
          boxSizing: 'border-box',
          display: 'block',
          boxShadow: focused ? `0 0 0 4px rgba(197, 160, 40, 0.08)` : '0 2px 12px rgba(0,0,0,0.02)',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const { lang, t } = useLang();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [skinConcern, setSkinConcern] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysesUsed, setAnalysesUsed] = useState(0);
  const [paidCredits, setPaidCredits] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoneHover, setZoneHover] = useState(false);
  const [hoverUpload, setHoverUpload] = useState(false);
  const [hoverSelfie, setHoverSelfie] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [gateEmail, setGateEmail] = useState('');
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const [gateError, setGateError] = useState(null);
  const [gateEmailFocused, setGateEmailFocused] = useState(false);

  const remaining = Math.max(0, FREE_LIMIT + paidCredits - analysesUsed);

  const refreshUsage = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await fetch(`/api/usage?userId=${userId}`);
      if (!res.ok) return;
      const { analysesUsed: used, paidCredits: credits } = await res.json();
      setAnalysesUsed(used); setPaidCredits(credits);
      localStorage.setItem('rms_analyses_used', String(used));
      localStorage.setItem('rms_paid_credits', String(credits));
    } catch {}
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    setAnalysesUsed(parseInt(localStorage.getItem('rms_analyses_used') || '0'));
    setPaidCredits(parseInt(localStorage.getItem('rms_paid_credits') || '0'));
    if (router.query.payment === 'success') {
      setPaymentSuccess(true);
      router.replace('/', undefined, { shallow: true });
    }
    refreshUsage();
  }, [router.query.payment]);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError(t('invalidFile')); return; }
    if (f.size > 20 * 1024 * 1024) { setError(t('fileTooLarge')); return; }
    setFile(f); setError(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const compressed = await compressImage(file);
      const base64 = await fileToBase64(compressed);
      const userId = getUserId();
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, imageBase64: base64.split(',')[1], mimeType: compressed.type, lang, skinConcern: skinConcern.trim() }),
      });
      const json = await res.json();
      if (res.status === 402) { setShowPaywall(true); return; }
      if (!res.ok) throw new Error(json.error || t('analysisFailed'));
      localStorage.setItem('rms_analyses_used', String(json.analysesUsed));
      localStorage.setItem('rms_paid_credits', String(json.paidCredits));
      setAnalysesUsed(json.analysesUsed); setPaidCredits(json.paidCredits);
      sessionStorage.setItem('rms_report', JSON.stringify(json.data));
      sessionStorage.setItem('rms_products', JSON.stringify(json.productRecommendations || []));
      if (json.analysesUsed === 1 && !localStorage.getItem('rms_email_captured')) {
        setShowEmailGate(true);
      } else {
        router.push('/report');
      }
    } catch (err) {
      setError(err.message || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const userId = getUserId();
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const { url, error: err } = await res.json();
      if (err) throw new Error(err);
      window.location.href = url;
    } catch (err) {
      setError(err.message || t('failedCheckout'));
      setCheckingOut(false);
    }
  };

  const handleEmailGateSubmit = async (e) => {
    e.preventDefault();
    setGateSubmitting(true); setGateError(null);
    try {
      const userId = getUserId();
      const res = await fetch('/api/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gateEmail, userId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || t('pleaseRetry')); }
      const data = await res.json();
      localStorage.setItem('rms_email_captured', '1');
      if (data.paidCredits !== undefined) {
        setPaidCredits(data.paidCredits);
        localStorage.setItem('rms_paid_credits', String(data.paidCredits));
      }
      setShowEmailGate(false);
      router.push('/report');
    } catch (err) {
      setGateError(err.message);
    } finally {
      setGateSubmitting(false);
    }
  };

  const appear = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.85s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.85s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
  });

  const darkBtn = (active = true) => ({
    background: active
      ? `linear-gradient(135deg, ${C.dark} 0%, #2A2A2A 50%, ${C.dark} 100%)`
      : C.border,
    backgroundSize: '200% 100%',
    animation: active ? 'shimmer 6s ease infinite' : 'none',
    color: active ? '#FFFFFF' : C.textLight,
    border: active ? `1px solid rgba(197, 160, 40, 0.3)` : 'none',
    borderRadius: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontSize: 12,
    cursor: active ? 'pointer' : 'not-allowed',
    boxShadow: active ? '0 10px 40px rgba(0,0,0,0.12)' : 'none',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  });

  const modalOverlay = {
    position: 'fixed', inset: 0,
    background: 'rgba(26,21,16,0.45)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  };

  const modalCard = {
    background: C.surface, borderRadius: 28,
    padding: '50px 40px', maxWidth: 410, width: '100%', textAlign: 'center',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 32px 100px rgba(26,21,16,0.18)',
    animation: 'scaleIn 0.32s cubic-bezier(0.34,1.56,0.64,1)',
  };

  return (
    <>
      <Head>
        <title>Rate My Skin — AI Skin Analysis</title>
        <meta name="description" content="Upload a photo and get an AI-powered skin analysis in seconds." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* ── Botanical decorations ── */}
      <BotanicalBottomLeft />
      <BotanicalTopRight />

      {/* ── Loading overlay ── */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(253,250,247,0.97)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, gap: 28,
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1.2, 2.4].map((delay, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 110 + i * 24, height: 110 + i * 24,
                borderRadius: '50%',
                border: `1px solid rgba(26,21,16,0.1)`,
                animation: `ringOut 2.8s ease-out ${delay}s infinite`,
                pointerEvents: 'none',
              }}/>
            ))}
            <Flower width={56} height={56} speed={7}/>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: 26, color: C.dark, fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300, marginBottom: 10, letterSpacing: '0.02em',
            }}>
              {t('analysingFeatures')}
            </p>
            <p style={{
              fontSize: 11.5, color: C.textLight, fontFamily: "'DM Sans', sans-serif",
              animation: 'pulse 2s ease infinite', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              {t('analysisTime')}
            </p>
          </div>
        </div>
      )}

      {/* ── Email gate modal ── */}
      {showEmailGate && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
              <Flower width={38} height={38} speed={12}/>
            </div>
            <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.textFaint, fontWeight: 600, marginBottom: 14 }}>
              {t('reward')}
            </p>
            <h2 style={{
              fontSize: 28, fontWeight: 300, marginBottom: 12, color: C.dark,
              fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.01em',
            }}>
              {t('unlock2ndFree')}
            </h2>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.85, marginBottom: 30 }}>
              {t('emailGateDesc')}
            </p>
            <form onSubmit={handleEmailGateSubmit}>
              <input
                type="email" value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                onFocus={() => setGateEmailFocused(true)}
                onBlur={() => setGateEmailFocused(false)}
                placeholder="your@email.com" required
                style={{
                  width: '100%', border: `1.5px solid ${gateEmailFocused ? C.dark : C.border}`,
                  borderRadius: 12, padding: '14px 16px', fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  color: C.dark, background: C.surfaceAlt,
                  transition: 'border-color 0.2s ease',
                  marginBottom: 10, boxSizing: 'border-box',
                }}
              />
              {gateError && <p style={{ fontSize: 12, color: '#B94040', marginBottom: 10, textAlign: 'left' }}>{gateError}</p>}
              <button type="submit" disabled={gateSubmitting} style={{
                ...darkBtn(!gateSubmitting),
                width: '100%', padding: '15px', fontSize: 13, marginBottom: 14,
              }}>
                {gateSubmitting ? t('saving') : t('claimFreeAnalysis')}
              </button>
            </form>
            <button onClick={() => {
              localStorage.setItem('rms_email_captured', 'skipped');
              setShowEmailGate(false); router.push('/report');
            }} style={{ background: 'none', border: 'none', color: C.textFaint, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {t('skipToResults')}
            </button>
          </div>
        </div>
      )}

      {/* ── Paywall modal ── */}
      {showPaywall && (
        <div style={modalOverlay}>
          <div style={{ ...modalCard, maxWidth: 430 }}>
            <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.textFaint, fontWeight: 600, marginBottom: 14 }}>
              {t('freeAnalysesUsed')}
            </p>
            <h2 style={{
              fontSize: 32, fontWeight: 300, marginBottom: 12, color: C.dark,
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              {t('unlockMoreReports')}
            </h2>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.85, marginBottom: 28, whiteSpace: 'pre-line' }}>
              {t('paywallDesc', FREE_LIMIT)}
            </p>
            <div style={{
              background: `linear-gradient(160deg, ${C.dark} 0%, #2A241E 100%)`,
              borderRadius: 20, padding: '30px 26px', marginBottom: 18, textAlign: 'left',
              boxShadow: '0 12px 48px rgba(26,21,16,0.28)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
                <span style={{ fontSize: 44, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#FDF9F4', letterSpacing: '-0.02em' }}>
                  €4.99
                </span>
                <span style={{ fontSize: 10.5, color: '#5A5048', letterSpacing: '0.08em' }}>{t('fiveAnalyses')}</span>
              </div>
              {[t('feature1'), t('feature2'), t('feature3')].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6A6058', marginBottom: 10 }}>
                  <span style={{ color: '#4A4038', fontSize: 7 }}>✦</span>{f}
                </div>
              ))}
            </div>
            <button onClick={handleCheckout} disabled={checkingOut} style={{
              ...darkBtn(!checkingOut), width: '100%', padding: '16px', fontSize: 13, marginBottom: 14,
            }}>
              {checkingOut ? t('redirecting') : t('continueToPayment')}
            </button>
            <button onClick={() => setShowPaywall(false)} style={{
              background: 'none', border: 'none', color: C.textFaint, fontSize: 12,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              {t('maybeLater')}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ HEADER ══════════════ */}
      <header className="mobile-padding" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? C.borderStrong : C.border}`,
        padding: '10px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        animation: 'slideDown 0.55s ease',
        boxShadow: scrolled ? '0 6px 32px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <LangToggle />
          <div style={{ width: 1, height: 26, background: C.border }} />
          <div style={{ textAlign: 'right' }}>
            <div className="mobile-hide" style={{ fontSize: 9, color: C.textFaint, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>
              {t('analysesLeft')}
            </div>
            <div style={{ fontSize: 24, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, color: remaining > 0 ? C.gold : C.textFaint, fontWeight: 300 }}>
              {remaining}
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════ MAIN ══════════════ */}
      <main className="mobile-padding" style={{ maxWidth: 560, margin: '0 auto', padding: '60px 22px 96px', position: 'relative', zIndex: 1 }}>

        {/* Hidden inputs moved to top level for reliability */}
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}/>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}/>

        {/* Payment success */}
        {paymentSuccess && (
          <div style={{
            ...appear(0),
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: '14px 20px', marginBottom: 36, fontSize: 13, color: C.textMid,
            fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 2px 16px rgba(26,21,16,0.06)',
          }}>
            <span style={{ fontSize: 9, color: C.dark }}>✦</span>
            {t('paymentSuccess')}
          </div>
        )}

        {/* ══ HERO ══ */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>

          {/* Minimal hero mark */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 36,
            opacity: mounted ? 1 : 0, transition: 'opacity 1.1s ease 0.05s',
          }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true"
              style={{ animation: 'breathe 5s ease-in-out infinite' }}>
              <circle cx="19" cy="19" r="17.5" stroke={C.gold} strokeWidth="0.5"/>
              <circle cx="19" cy="19" r="1.3" fill={C.gold}/>
            </svg>
          </div>

          {/* Label + hairline */}
          <div style={{ ...appear(0.2), display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.border})` }}/>
            <span style={{
              fontSize: 8, letterSpacing: '0.36em', textTransform: 'uppercase',
              color: C.textLight, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
            }}>
              {t('facialAestheticsAnalysis')}
            </span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }}/>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300, margin: '0 0 28px',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <span style={{
              ...appear(0.28),
              display: 'block',
              fontSize: 'clamp(27px, 6.3vw, 41px)', lineHeight: 1.12,
              color: C.dark, letterSpacing: '-0.015em',
            }}>
              {t('heroLine1')}
            </span>
            <span style={{
              ...appear(0.44),
              display: 'block',
              fontSize: 'clamp(20px, 4.6vw, 31px)', lineHeight: 1.18,
              color: C.dark, letterSpacing: '-0.01em',
            }}>
              {t('heroLine2')}
            </span>
            <span style={{
              ...appear(0.62),
              display: 'block',
              fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: 1.4,
              color: C.textMid, fontStyle: 'italic', letterSpacing: '0.005em',
              marginTop: 8,
            }}>
              {t('heroLine3')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mobile-compact-text" style={{
            ...appear(0.76),
            fontSize: 12.5, color: C.textLight, lineHeight: 1.8,
            maxWidth: 280, margin: '0 auto 44px',
            fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.01em',
          }}>
            {t('heroDesc')}
          </p>

          {/* Trust signals */}
          <TrustSignals t={t} visible={mounted} />
        </div>

        {/* ══ UPLOAD ZONE ══ */}
        <div style={appear(0.72)}>
          <div style={{
            background: `linear-gradient(150deg, ${C.borderStrong}, ${C.border}, ${C.borderStrong})`,
            padding: dragging ? 2 : 1.5,
            borderRadius: 24,
            transition: 'all 0.3s ease',
            marginBottom: 14,
            boxShadow: zoneHover && !preview
              ? '0 14px 50px rgba(26,21,16,0.10)'
              : '0 3px 20px rgba(26,21,16,0.05)',
          }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onMouseEnter={() => setZoneHover(true)}
              onMouseLeave={() => setZoneHover(false)}
              style={{
                borderRadius: 23, background: dragging ? C.surfaceAlt : C.surface,
                overflow: 'hidden', transition: 'background 0.2s ease',
              }}
            >
              {preview ? (
                <div style={{ padding: '26px', textAlign: 'center' }}>
                  <div style={{ borderRadius: 18, overflow: 'hidden', display: 'inline-block', boxShadow: '0 10px 40px rgba(26,21,16,0.12)', marginBottom: 20 }}>
                    <img src={preview} alt="Your photo" style={{ maxHeight: 320, maxWidth: '100%', display: 'block', objectFit: 'cover' }}/>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {[{ label: t('changePhoto'), ref: fileInputRef }, { label: t('retakeSelfie'), ref: cameraInputRef }].map(({ label, ref }) => (
                      <button key={label} onClick={() => ref.current?.click()} style={{
                        background: 'none', border: `1px solid ${C.border}`, borderRadius: 10,
                        padding: '9px 18px', fontSize: 12, color: C.textMid, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                      }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '50px 28px 36px' }}>
                  <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    {/* Droplet icon in zone */}
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: `linear-gradient(150deg, ${C.surfaceAlt}, ${C.border})`,
                      border: `1px solid ${C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 4px 16px rgba(26,21,16,0.07)',
                    }}>
                      <Flower width={26} height={26} speed={10}/>
                    </div>
                    <p style={{ fontSize: 15.5, color: C.dark, fontWeight: 500, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                      {t('dragDrop')}
                    </p>
                    <p style={{ fontSize: 12, color: C.textFaint, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.03em' }}>
                      {t('fileTypes')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.border})` }}/>
                    <span style={{ fontSize: 8.5, color: C.textFaint, letterSpacing: '0.26em', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                      {t('or')}
                    </span>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }}/>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      onMouseEnter={() => setHoverUpload(true)}
                      onMouseLeave={() => setHoverUpload(false)}
                      style={{
                        flex: 1, border: `1px solid ${hoverUpload ? C.gold : C.border}`,
                        borderRadius: 14, padding: '16px 10px',
                        fontSize: 13, fontWeight: 600,
                        color: hoverUpload ? C.gold : C.textMid,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        background: hoverUpload ? C.surfaceAlt : C.surface,
                        transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: hoverUpload ? '0 4px 20px rgba(197, 160, 40, 0.12)' : 'none',
                      }}
                    >
                      <UploadIcon />{t('uploadPhoto')}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                      onMouseEnter={() => setHoverSelfie(true)}
                      onMouseLeave={() => setHoverSelfie(false)}
                      style={{
                        flex: 1, border: `1px solid ${hoverSelfie ? C.gold : C.border}`,
                        borderRadius: 14, padding: '16px 10px',
                        fontSize: 13, fontWeight: 600,
                        color: hoverSelfie ? C.gold : C.textMid,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        background: hoverSelfie ? C.surfaceAlt : C.surface,
                        transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: hoverSelfie ? '0 4px 20px rgba(197, 160, 40, 0.12)' : 'none',
                      }}
                    >
                      <CameraIcon />{t('takeASelfie')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skin concern textarea */}
        <div style={appear(0.78)}>
          <SkinConcernField
            value={skinConcern}
            onChange={setSkinConcern}
            placeholder={t('skinConcernPlaceholder')}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF7F5', border: '1px solid #F0D8D0', borderRadius: 12,
            padding: '13px 18px', marginBottom: 14, fontSize: 13, color: '#8C3020',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <div style={appear(0.84)}>
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            style={{
              ...darkBtn(!!file),
              width: '100%', padding: '18px',
              fontSize: 14, borderRadius: 14, marginBottom: 24,
              transform: (ctaHovered && !!file) ? 'translateY(-3px)' : 'translateY(0)',
              boxShadow: (ctaHovered && !!file)
                ? '0 16px 48px rgba(26,21,16,0.32)'
                : '0 6px 28px rgba(26,21,16,0.20)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
          >
            {remaining <= 0 ? t('getMoreAnalyses') : t('analyseNow')}
          </button>
        </div>

        {/* Footer trust row */}
        <div style={{ ...appear(0.9), display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {[
            t('analysisRemaining', remaining),
            t('noAccountNeeded'),
            t('resultsIn20s'),
          ].map(txt => (
            <span key={txt} style={{
              fontSize: 11, color: C.textFaint,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.03em',
            }}>
              <span style={{ fontSize: 7 }}>✦</span>{txt}
            </span>
          ))}
        </div>

        {/* Out-of-credits upsell */}
        {remaining <= 0 && (
          <div style={{
            ...appear(0.9),
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 22, padding: '36px', marginTop: 40, textAlign: 'center',
            boxShadow: '0 6px 32px rgba(26,21,16,0.07)',
          }}>
            <p style={{ fontSize: 27, fontFamily: "'Cormorant Garamond', serif", color: C.dark, fontWeight: 300, marginBottom: 10 }}>
              {t('readyForMore')}
            </p>
            <p style={{ fontSize: 13, color: C.textMid, marginBottom: 24, lineHeight: 1.8 }}>
              {t('upsellDesc')}
            </p>
            <button onClick={() => setShowPaywall(true)} style={{
              ...darkBtn(true), padding: '13px 34px', fontSize: 13,
            }}>
              {t('get5For499')}
            </button>
          </div>
        )}
      </main>
    </>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 9V2M7 2L4.5 4.5M7 2L9.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 10.5V11.5C2 12.05 2.45 12.5 3 12.5H11C11.55 12.5 12 12.05 12 11.5V10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none">
      <path d="M5.5 1.5H9.5L10.5 3H13C13.55 3 14 3.45 14 4V11C14 11.55 13.55 12 13 12H2C1.45 12 1 11.55 1 11V4C1 3.45 1.45 3 2 3H4.5L5.5 1.5Z" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round"/>
      <circle cx="7.5" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.15"/>
    </svg>
  );
}
