import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '../components/Logo';

const FREE_LIMIT = 1;

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
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          URL.revokeObjectURL(url);
        },
        'image/jpeg',
        0.85
      );
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

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [gateEmail, setGateEmail] = useState('');
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const [gateError, setGateError] = useState(null);
  const [gateEmailFocused, setGateEmailFocused] = useState(false);

  const remaining = Math.max(0, FREE_LIMIT + paidCredits - analysesUsed);

  const refreshUsage = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await fetch(`/api/usage?userId=${userId}`);
      if (!res.ok) return;
      const { analysesUsed: used, paidCredits: credits } = await res.json();
      setAnalysesUsed(used);
      setPaidCredits(credits);
      localStorage.setItem('rms_analyses_used', String(used));
      localStorage.setItem('rms_paid_credits', String(credits));
    } catch {}
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

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, or WebP).');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('Image must be under 20MB.');
      return;
    }
    setFile(f);
    setError(null);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!file) return;
    if (remaining <= 0) { setShowPaywall(true); return; }
    setLoading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const base64 = await fileToBase64(compressed);
      const imageBase64 = base64.split(',')[1];
      const userId = getUserId();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, imageBase64, mimeType: compressed.type }),
      });
      const json = await res.json();
      if (res.status === 402) { setShowPaywall(true); return; }
      if (!res.ok) throw new Error(json.error || 'Analysis failed. Please try again.');
      localStorage.setItem('rms_analyses_used', String(json.analysesUsed));
      localStorage.setItem('rms_paid_credits', String(json.paidCredits));
      setAnalysesUsed(json.analysesUsed);
      setPaidCredits(json.paidCredits);
      sessionStorage.setItem('rms_report', JSON.stringify(json.data));
      // After the 1st analysis, intercept with email gate to reward a 2nd free analysis
      if (json.analysesUsed === 1 && !localStorage.getItem('rms_email_captured')) {
        setShowEmailGate(true);
      } else {
        router.push('/report');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const userId = getUserId();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const { url, error: err } = await res.json();
      if (err) throw new Error(err);
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Failed to open checkout. Please try again.');
      setCheckingOut(false);
    }
  };

  const handleEmailGateSubmit = async (e) => {
    e.preventDefault();
    setGateSubmitting(true);
    setGateError(null);
    try {
      const userId = getUserId();
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gateEmail, userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Please try again.');
      }
      const data = await res.json();
      localStorage.setItem('rms_email_captured', '1');
      // Apply the bonus credit returned by the API
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

  // Staggered fade-in helper
  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  return (
    <>
      <Head>
        <title>Rate My Skin — AI Facial Aesthetics</title>
        <meta name="description" content="Upload a photo and get an AI-powered facial aesthetics analysis in seconds." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ── Loading overlay ── */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(250,250,250,0.97)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, gap: 22,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            border: '1.5px solid #e8e8e8', borderTopColor: '#0d0d0d',
            animation: 'spin 0.85s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 22, color: '#0d0d0d', fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, marginBottom: 6 }}>
              Analysing your features
            </p>
            <p style={{ fontSize: 12, color: '#bbb', fontFamily: "'DM Sans', sans-serif", animation: 'pulse 2s ease infinite' }}>
              This usually takes 15–20 seconds
            </p>
          </div>
        </div>
      )}

      {/* ── Email gate modal ── */}
      {showEmailGate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '40px 32px',
            maxWidth: 380, width: '100%', textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#bbb', fontWeight: 600, marginBottom: 14 }}>
              Reward
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 300, color: '#0d0d0d', marginBottom: 10, fontFamily: "'Cormorant Garamond', serif" }}>
              Unlock a 2nd free analysis
            </h2>
            <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.75, marginBottom: 28 }}>
              Enter your email to claim a free second report — plus weekly skin tips delivered to your inbox.
            </p>
            <form onSubmit={handleEmailGateSubmit}>
              <input
                type="email"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                onFocus={() => setGateEmailFocused(true)}
                onBlur={() => setGateEmailFocused(false)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%', border: `1px solid ${gateEmailFocused ? '#0d0d0d' : '#e0e0e0'}`,
                  borderRadius: 10, padding: '13px 16px', fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  color: '#0d0d0d', background: '#fafafa',
                  transition: 'border-color 0.18s ease',
                  marginBottom: 10, boxSizing: 'border-box',
                }}
              />
              {gateError && (
                <p style={{ fontSize: 12, color: '#c00', marginBottom: 10, textAlign: 'left' }}>{gateError}</p>
              )}
              <button
                type="submit"
                disabled={gateSubmitting}
                style={{
                  width: '100%', background: '#0d0d0d', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '14px', fontSize: 13, fontWeight: 600,
                  cursor: gateSubmitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.06em', marginBottom: 10,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {gateSubmitting ? 'Saving…' : 'Claim free analysis →'}
              </button>
            </form>
            <button
              onClick={() => {
                localStorage.setItem('rms_email_captured', 'skipped');
                setShowEmailGate(false);
                router.push('/report');
              }}
              style={{ background: 'none', border: 'none', color: '#ccc', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              Skip — go to results
            </button>
          </div>
        </div>
      )}

      {/* ── Paywall modal ── */}
      {showPaywall && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '40px 32px',
            maxWidth: 380, width: '100%', textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <p style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#bbb', fontWeight: 600, marginBottom: 14 }}>
              Free analyses used
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: '#0d0d0d', marginBottom: 10, fontFamily: "'Cormorant Garamond', serif" }}>
              Unlock More Reports
            </h2>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.75, marginBottom: 28 }}>
              You've used your {FREE_LIMIT} complimentary analyses.<br />Get 5 more with a one-time payment.
            </p>
            <div style={{ background: '#0d0d0d', borderRadius: 16, padding: '24px 20px', marginBottom: 16, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                <span style={{ fontSize: 36, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#fff' }}>€4.99</span>
                <span style={{ fontSize: 11, color: '#666' }}>5 analyses · one-time</span>
              </div>
              {['Full 8-metric breakdown', 'Strengths & improvement plan', 'Personalised care routine'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#999', marginBottom: 8 }}>
                  <span style={{ color: '#555', fontSize: 9 }}>✦</span> {f}
                </div>
              ))}
            </div>
            <button onClick={handleCheckout} disabled={checkingOut} style={{
              width: '100%', background: '#0d0d0d', color: '#fff', border: 'none',
              borderRadius: 10, padding: '14px', fontSize: 13, fontWeight: 600,
              cursor: checkingOut ? 'not-allowed' : 'pointer', letterSpacing: '0.06em', marginBottom: 10,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {checkingOut ? 'Redirecting…' : 'Continue to Payment →'}
            </button>
            <button onClick={() => setShowPaywall(false)} style={{
              background: 'none', border: 'none', color: '#ccc', fontSize: 12, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* ── Sticky frosted-glass header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,250,250,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #ebebeb',
        padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: '#ccc', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            Analyses left
          </div>
          <div style={{ fontSize: 20, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1, color: remaining > 0 ? '#0d0d0d' : '#999' }}>
            {remaining}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 540, margin: '0 auto', padding: '60px 20px 88px' }}>

        {/* Payment success notice */}
        {paymentSuccess && (
          <div style={{
            ...fadeIn(0),
            background: '#f8f8f8', border: '1px solid #e8e8e8', borderRadius: 12,
            padding: '13px 18px', marginBottom: 32, fontSize: 13, color: '#444',
            fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 10 }}>✦</span>
            Payment successful — 5 analyses added to your account.
          </div>
        )}

        {/* Hero */}
        <div style={{ ...fadeIn(0), marginBottom: 52, textAlign: 'center' }}>
          <p style={{
            fontSize: 9.5, letterSpacing: '0.26em', textTransform: 'uppercase',
            color: '#ccc', fontWeight: 600, marginBottom: 16,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Facial Aesthetics Analysis
          </p>
          <h1 style={{
            fontSize: 50, fontWeight: 300, color: '#0d0d0d',
            fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.08, marginBottom: 18,
            letterSpacing: '-0.01em',
          }}>
            Your Report Awaits
          </h1>
          <p style={{
            fontSize: 14, color: '#aaa', lineHeight: 1.8, maxWidth: 340,
            margin: '0 auto', fontFamily: "'DM Sans', sans-serif",
          }}>
            Upload a clear, front-facing photo for a full aesthetic analysis across 8 facial metrics.
          </p>
        </div>

        {/* ── Upload zone ── */}
        <div style={{ ...fadeIn(0.12) }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onMouseEnter={() => setZoneHover(true)}
            onMouseLeave={() => setZoneHover(false)}
            style={{
              border: `1px dashed ${dragging ? '#0d0d0d' : zoneHover && !preview ? '#aaa' : '#d8d8d8'}`,
              borderRadius: 20,
              background: dragging ? '#f7f7f7' : '#fff',
              transition: 'border-color 0.2s ease, background 0.2s ease',
              marginBottom: 14,
              overflow: 'hidden',
            }}
          >
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {preview ? (
              /* ── Photo selected state ── */
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <img
                  src={preview}
                  alt="Your photo"
                  style={{
                    maxHeight: 300, maxWidth: '100%', borderRadius: 14,
                    objectFit: 'cover', display: 'block', margin: '0 auto 18px',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'none', border: '1px solid #e8e8e8', borderRadius: 8,
                      padding: '8px 16px', fontSize: 12, color: '#777', cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    }}
                  >
                    Change photo
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      background: 'none', border: '1px solid #e8e8e8', borderRadius: 8,
                      padding: '8px 16px', fontSize: 12, color: '#777', cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    }}
                  >
                    Retake selfie
                  </button>
                </div>
              </div>
            ) : (
              /* ── Empty state ── */
              <div style={{ padding: '44px 24px 28px' }}>
                {/* Drag indicator */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    border: '1px solid #ebebeb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', fontSize: 17, color: '#ccc',
                  }}>
                    ↑
                  </div>
                  <p style={{ fontSize: 15, color: '#1a1a1a', fontWeight: 500, marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>
                    Drag & drop your photo here
                  </p>
                  <p style={{ fontSize: 12, color: '#ccc', fontFamily: "'DM Sans', sans-serif" }}>
                    JPG, PNG, WebP · up to 20MB
                  </p>
                </div>

                {/* OR divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
                  <span style={{ fontSize: 9, color: '#ccc', letterSpacing: '0.18em', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                    OR
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
                </div>

                {/* Two side-by-side action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={() => setHoverUpload(true)}
                    onMouseLeave={() => setHoverUpload(false)}
                    style={{
                      flex: 1,
                      border: `1px solid ${hoverUpload ? '#0d0d0d' : '#e0e0e0'}`,
                      borderRadius: 12, padding: '13px 10px',
                      fontSize: 13, fontWeight: 500,
                      color: hoverUpload ? '#0d0d0d' : '#666',
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      background: '#fff',
                      transition: 'border-color 0.18s ease, color 0.18s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    }}
                  >
                    <UploadIcon />
                    Upload Photo
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    onMouseEnter={() => setHoverSelfie(true)}
                    onMouseLeave={() => setHoverSelfie(false)}
                    style={{
                      flex: 1,
                      border: `1px solid ${hoverSelfie ? '#0d0d0d' : '#e0e0e0'}`,
                      borderRadius: 12, padding: '13px 10px',
                      fontSize: 13, fontWeight: 500,
                      color: hoverSelfie ? '#0d0d0d' : '#666',
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      background: '#fff',
                      transition: 'border-color 0.18s ease, color 0.18s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    }}
                  >
                    <CameraIcon />
                    Take a Selfie
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fff', border: '1px solid #eee', borderRadius: 10,
            padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#c00',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {error}
          </div>
        )}

        {/* Primary CTA */}
        <div style={{ ...fadeIn(0.25) }}>
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            style={{
              width: '100%',
              background: file ? '#0d0d0d' : '#ececec',
              color: file ? '#fff' : '#bbb',
              border: 'none', borderRadius: 12, padding: '17px',
              fontSize: 14, fontWeight: 600,
              cursor: file ? 'pointer' : 'not-allowed',
              letterSpacing: '0.06em',
              transition: 'background 0.22s ease',
              marginBottom: 22,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {remaining <= 0 ? 'Get More Analyses →' : 'Analyse Now →'}
          </button>
        </div>

        {/* Footer trust row */}
        <div style={{ ...fadeIn(0.35), display: 'flex', justifyContent: 'center', gap: 22, flexWrap: 'wrap' }}>
          {[
            `${remaining} ${remaining === 1 ? 'analysis' : 'analyses'} remaining`,
            'No account needed',
            'Results in ~20s',
          ].map(t => (
            <span key={t} style={{ fontSize: 11, color: '#ccc', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ fontSize: 8 }}>✦</span> {t}
            </span>
          ))}
        </div>

        {/* Out-of-credits upsell */}
        {remaining <= 0 && (
          <div style={{
            ...fadeIn(0.4),
            background: '#fff', border: '1px solid #e8e8e8', borderRadius: 18,
            padding: '30px', marginTop: 32, textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <p style={{ fontSize: 24, fontFamily: "'Cormorant Garamond', serif", color: '#0d0d0d', fontWeight: 300, marginBottom: 8 }}>
              Ready for more?
            </p>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20, lineHeight: 1.7 }}>
              Get 5 more full analyses for a one-time payment.
            </p>
            <button onClick={() => setShowPaywall(true)} style={{
              background: '#0d0d0d', color: '#fff', border: 'none',
              borderRadius: 10, padding: '12px 28px', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Get 5 for €4.99 →
            </button>
          </div>
        )}
      </main>
    </>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 9V2M7 2L4.5 4.5M7 2L9.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 10.5V11.5C2 12.05 2.45 12.5 3 12.5H11C11.55 12.5 12 12.05 12 11.5V10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 1.5H9.5L10.5 3H13C13.55 3 14 3.45 14 4V11C14 11.55 13.55 12 13 12H2C1.45 12 1 11.55 1 11V4C1 3.45 1.45 3 2 3H4.5L5.5 1.5Z" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" />
      <circle cx="7.5" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  );
}
