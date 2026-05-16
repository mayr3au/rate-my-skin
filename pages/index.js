import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo, { CreamDrop, LuxuryFlower } from '../components/Logo';
import { useLang } from '../lib/LangContext';

const SKIN_CONCERN_MAX = 200;
const GOLD = '#C5A028';

/* ── Language toggle ── */
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

/* ── Main page ── */
export default function Home() {
  const router = useRouter();
  const { lang, t } = useLang();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [emailCaptured, setEmailCaptured] = useState(false);
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [skinConcern, setSkinConcern] = useState('');
  const [activeChip, setActiveChip] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const captured = localStorage.getItem('rms_email_captured') === '1';
    setEmailCaptured(captured);
    setOverlayVisible(!captured);
    fetch('/api/identity')
      .then(r => r.json())
      .then(({ userId: uid }) => setUserId(uid))
      .catch(() => {});
  }, []);

  /* ── Email submit ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {}
    localStorage.setItem('rms_email_captured', '1');
    localStorage.setItem('rms_email', email.trim());
    setEmailCaptured(true);
    setTimeout(() => setOverlayVisible(false), 650);
    setEmailLoading(false);
  };

  /* ── File handling ── */
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError(t('invalidFile')); return; }
    if (file.size > 20 * 1024 * 1024) { setError(t('fileTooLarge')); return; }
    setError('');
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  /* ── Skin concern chips ── */
  const quickConcerns = [
    { key: 'Acne', label: t('quickConcernAcne') },
    { key: 'Dryness', label: t('quickConcernDryness') },
    { key: 'Sensitivity', label: t('quickConcernSensitivity') },
    { key: 'Oily', label: t('quickConcernOily') },
    { key: 'Aging', label: t('quickConcernAging') },
  ];

  const handleChip = (key, label) => {
    if (activeChip === key) {
      setActiveChip(null);
      setSkinConcern('');
    } else {
      setActiveChip(key);
      setSkinConcern(label);
    }
  };

  /* ── Analyse ── */
  const handleAnalyse = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    try {
      // Convert File to base64 (chunked to avoid stack overflow on large files)
      const arrayBuffer = await image.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunk = 8192;
      for (let i = 0; i < uint8.length; i += chunk) {
        binary += String.fromCharCode(...uint8.subarray(i, i + chunk));
      }
      const imageBase64 = btoa(binary);
      const mimeType = image.type;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          userId: userId || null,
          lang,
          skinConcern: skinConcern.trim() || null,
        }),
      });
      const json = await res.json();

      if (!res.ok || json.error) throw new Error(json.error || t('analysisFailed'));

      sessionStorage.setItem('rms_report', JSON.stringify(json.data));
      sessionStorage.setItem('rms_analysis_id', json.analysisId);
      sessionStorage.setItem('rms_is_paid', 'false');
      router.push('/report');
    } catch (err) {
      setError(err.message || t('analysisFailed'));
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Rate My Skin — AI Skin Analysis</title>
        <meta name="description" content="Upload a photo for your instant AI skin score. Free analysis, full details from €1.99." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* ── Sticky nav ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(255, 253, 250, 0.55)',
        backdropFilter: 'blur(24px) saturate(1.2)', WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 4px 20px rgba(180, 160, 140, 0.04)',
        padding: '13px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo />
        <LangToggle />
      </div>

      {/* ── Main content (always rendered; blurred behind overlay) ── */}
      <main
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{
          minHeight: 'calc(100vh - 60px)',
          background: 'transparent',
          fontFamily: "'DM Sans', sans-serif",
          filter: emailCaptured ? 'none' : 'blur(1.5px)',
          pointerEvents: emailCaptured ? 'auto' : 'none',
          transition: 'filter 0.65s ease',
          userSelect: emailCaptured ? 'auto' : 'none',
        }}
      >
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '52px 24px 8px' }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#B0885E', fontWeight: 600, marginBottom: 14,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {t('facialAestheticsAnalysis')}
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 400,
            color: '#3A2E26', lineHeight: 1.18, margin: 0,
          }}>
            {t('heroLine1')}<br />
            <em>{t('heroLine2')}</em>
          </h1>
          <p style={{ fontSize: 13, color: '#888', margin: '14px 0 0', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
            {t('heroLine3')}
          </p>
          <p style={{
            fontSize: 13, color: '#aaa', margin: '6px auto 0',
            maxWidth: 420, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif",
          }}>
            {t('heroDesc')}
          </p>
        </div>

        {/* Trust row (Three separate bubbles) */}
        <div style={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'stretch',
          gap: 12,
          flexWrap: 'wrap',
          maxWidth: 600,
          margin: '24px auto 0'
        }}>
          {[
            { num: t('trust1Num'), label: t('trust1Label') },
            { num: t('trust2Num'), label: t('trust2Label') },
            { num: t('trust3Num'), label: t('trust3Label') },
          ].map(({ num, label }) => (
            <div key={label} style={{ 
              flex: '1 1 110px',
              textAlign: 'center',
              padding: '12px 14px',
              background: 'rgba(255, 253, 251, 0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 165, 116, 0.2)',
              borderRadius: 24,
              boxShadow: '0 4px 16px rgba(168, 116, 73, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ 
                fontSize: 22, 
                fontWeight: 500, 
                fontFamily: "'Cormorant Garamond', serif",
                background: 'linear-gradient(90deg, #A87449 0%, #D4A574 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {num}
              </div>
              <div style={{ 
                fontSize: 9, 
                color: '#8C7A6B', 
                letterSpacing: '0.06em', 
                textTransform: 'uppercase', 
                marginTop: 2, 
                fontFamily: "'DM Sans', sans-serif", 
                fontWeight: 600,
                lineHeight: 1.3
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Upload + skin concern */}
        <div style={{ maxWidth: 480, margin: '32px auto 0', padding: '0 20px 60px' }}>

          {/* Upload zone */}
          <div
            onClick={() => !imageUrl && fileInputRef.current?.click()}
            style={{
              border: 'none',
              boxShadow: dragOver 
                ? 'inset 0 0 0 2px #C5A028, inset 0 4px 12px rgba(0,0,0,0.02)' 
                : 'inset 0 4px 16px rgba(0,0,0,0.05), 0 2px 0 rgba(255,255,255,0.8)',
              borderRadius: 24,
              padding: imageUrl ? 0 : '40px 24px',
              textAlign: 'center',
              cursor: imageUrl ? 'default' : 'pointer',
              background: dragOver ? 'rgba(197,160,40,0.03)' : '#FCFAF6',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              overflow: 'hidden',
            }}
          >
            {imageUrl ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={imageUrl} alt="Preview"
                  style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block', borderRadius: 16 }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  style={{
                    position: 'absolute', bottom: 12, right: 12,
                    background: 'rgba(13,13,13,0.75)', color: '#fff',
                    border: 'none', borderRadius: 8, padding: '7px 14px',
                    fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {t('changePhoto')}
                </button>
              </div>
            ) : (
              <>
                <CreamDrop width={110} height={55} />
                <p style={{ margin: '14px 0 4px', fontSize: 14, color: '#555', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                  {t('dragDrop')}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#bbb', fontFamily: "'DM Sans', sans-serif" }}>{t('fileTypes')}</p>
                <p style={{ margin: '16px 0 0', fontSize: 11, color: '#ccc', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
                  {t('or')}
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    style={btnStyle}
                  >
                    {t('uploadPhoto')}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    style={{ ...btnStyle, background: 'none', color: '#555', border: '1.5px solid #E0DDD8', boxShadow: 'none' }}
                  >
                    {t('takeASelfie')}
                  </button>
                </div>
              </>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => processFile(e.target.files[0])} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }}
            onChange={(e) => processFile(e.target.files[0])} />

          {/* Skin concern */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
              <label style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 17, color: '#2a2a2a', fontWeight: 500,
              }}>
                {t('skinConcernLabel')}
              </label>
              <span style={{ fontSize: 11, color: '#bbb', fontFamily: "'DM Sans', sans-serif" }}>{t('skinConcernOptional')}</span>
            </div>

            {/* Quick-select chips */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
              {quickConcerns.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleChip(key, label)}
                  style={{
                    border: activeChip === key ? `1.5px solid ${GOLD}` : '1.5px solid rgba(224,221,216,0.6)',
                    background: activeChip === key ? 'rgba(197,160,40,0.06)' : '#FCFAF6',
                    color: activeChip === key ? '#8B6914' : '#887E75',
                    borderRadius: 30, padding: '6px 16px',
                    fontSize: 12, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: activeChip === key ? 600 : 400,
                    boxShadow: activeChip === key ? '0 2px 8px rgba(197,160,40,0.15)' : 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                value={skinConcern}
                onChange={(e) => {
                  if (e.target.value.length <= SKIN_CONCERN_MAX) {
                    setSkinConcern(e.target.value);
                    setActiveChip(null);
                  }
                }}
                placeholder={t('skinConcernPlaceholder')}
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: 'none', borderRadius: 18,
                  padding: '16px 18px 32px', fontSize: 13, color: '#3A2E26',
                  fontFamily: "'DM Sans', sans-serif",
                  resize: 'vertical', outline: 'none',
                  background: 'rgba(255, 255, 255, 0.45)',
                  boxShadow: 'inset 0 2px 6px rgba(180, 160, 140, 0.12), 0 1px 0 rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  lineHeight: 1.6,
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = 'inset 0 2px 6px rgba(197, 160, 40, 0.2), 0 0 0 2px rgba(197, 160, 40, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.65)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'inset 0 2px 6px rgba(180, 160, 140, 0.12), 0 1px 0 rgba(255, 255, 255, 0.8)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.45)';
                }}
              />
              <span style={{
                position: 'absolute', bottom: 9, right: 12,
                fontSize: 11, color: skinConcern.length >= SKIN_CONCERN_MAX ? '#c0392b' : '#ccc',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {t('skinConcernCounter', skinConcern.length, SKIN_CONCERN_MAX)}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ margin: '12px 0 0', fontSize: 13, color: '#c0392b', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
          )}

          {/* CTA */}
          <button
            onClick={handleAnalyse}
            disabled={!image || loading}
            style={{
              width: '100%', marginTop: 20,
              background: image && !loading ? '#2C241D' : '#D5CFC9',
              color: '#fff', border: 'none', borderRadius: 30,
              padding: '16px 24px', fontSize: 15, fontWeight: 600,
              cursor: image && !loading ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.01em',
              boxShadow: image && !loading ? '0 8px 24px rgba(44,36,29,0.2)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LuxuryFlower width={22} height={22} />
                {t('analysingFeatures')}
              </span>
            ) : t('analyseNow')}
          </button>

          {loading && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 10, fontFamily: "'DM Sans', sans-serif" }}>
              {t('analysisTime')}
            </p>
          )}

          {/* Footer trust */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            {[t('noAccountNeeded'), t('resultsIn20s')].map((txt) => (
              <span key={txt} style={{ fontSize: 11, color: '#ccc', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
                <span style={{ color: GOLD }}>✓</span> {txt}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* ── Email gate overlay (always in DOM, fades away after submit) ── */}
      {overlayVisible && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(255, 253, 248, 0.4)',
          backdropFilter: 'blur(16px) saturate(1.1)', WebkitBackdropFilter: 'blur(16px) saturate(1.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
          opacity: emailCaptured ? 0 : 1,
          pointerEvents: emailCaptured ? 'none' : 'auto',
          transition: 'opacity 0.65s ease',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: 32,
            padding: 'clamp(32px, 6vw, 48px)',
            maxWidth: 420, width: '100%',
            boxShadow: '0 32px 80px rgba(130, 100, 80, 0.12), inset 0 2px 0 rgba(255, 255, 255, 1)',
            transform: emailCaptured ? 'translateY(16px) scale(0.97)' : 'translateY(0) scale(1)',
            transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <CreamDrop width={120} height={60} />
            </div>

            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: GOLD, fontWeight: 500, margin: '0 0 10px',
            }}>
              {t('reward')}
            </p>

            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 400,
              color: '#0d0d0d', margin: '0 0 10px', lineHeight: 1.2,
            }}>
              {t('unlock2ndFree')}
            </h2>

            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: '#888', lineHeight: 1.6,
              margin: '0 0 24px',
            }}>
              {t('emailGateDesc')}
            </p>

            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                style={{
                  border: 'none', borderRadius: 16,
                  padding: '14px 18px', fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none', width: '100%', boxSizing: 'border-box',
                  background: 'rgba(245, 240, 235, 0.6)', color: '#3A2E26',
                  boxShadow: 'inset 0 2px 6px rgba(180, 160, 140, 0.08), 0 1px 0 rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = 'inset 0 2px 6px rgba(197, 160, 40, 0.15), 0 0 0 2px rgba(197, 160, 40, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'inset 0 2px 6px rgba(180, 160, 140, 0.08), 0 1px 0 rgba(255, 255, 255, 0.6)';
                  e.target.style.background = 'rgba(245, 240, 235, 0.6)';
                }}
              />
              <button
                type="submit"
                disabled={emailLoading}
                style={{
                  background: '#0d0d0d', color: '#fff', border: 'none',
                  borderRadius: 11, padding: '14px 20px',
                  fontSize: 14, fontWeight: 600,
                  cursor: emailLoading ? 'wait' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.01em',
                  transition: 'opacity 0.2s',
                  opacity: emailLoading ? 0.7 : 1,
                }}
              >
                {emailLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <LuxuryFlower width={22} height={22} />
                    {t('saving')}
                  </span>
                ) : t('claimFreeAnalysis')}
              </button>
            </form>

            <p style={{ marginTop: 14, fontSize: 11, color: '#ccc', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
              {t('heroLine3')}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes logoShimmer {
          0% { background-position: 100% 50%; }
          50% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </>
  );
}

const btnStyle = {
  background: '#2C241D', color: '#fff', border: 'none',
  borderRadius: 30, padding: '10px 20px',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  boxShadow: '0 4px 12px rgba(44,36,29,0.15)',
  transition: 'all 0.25s ease',
};
