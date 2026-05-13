import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import BeautyReport from '../components/BeautyReport';
import Logo from '../components/Logo';

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Something went wrong.');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px 72px' }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: 20,
        padding: '44px 36px',
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <p style={{
          fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase',
          color: '#ccc', fontWeight: 600, marginBottom: 14,
        }}>
          Free · Weekly
        </p>

        <h2 style={{
          fontSize: 30, fontWeight: 300, color: '#0d0d0d',
          fontFamily: "'Cormorant Garamond', serif",
          marginBottom: 12, letterSpacing: '0.01em',
        }}>
          Get weekly skin tips
        </h2>

        <p style={{
          fontSize: 13, color: '#aaa', lineHeight: 1.8,
          maxWidth: 320, margin: '0 auto 32px',
        }}>
          Evidence-based skincare, grooming, and aesthetic insights — straight to your inbox.
        </p>

        {status === 'success' ? (
          <div style={{
            background: '#fafafa', borderRadius: 14,
            padding: '24px', display: 'inline-flex',
            flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16, color: '#0d0d0d' }}>✦</span>
            <p style={{
              fontSize: 15, color: '#0d0d0d',
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
            }}>
              You're in. Weekly tips coming your way.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="your@email.com"
              required
              style={{
                flex: 1,
                border: `1px solid ${focused ? '#0d0d0d' : '#e0e0e0'}`,
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                color: '#0d0d0d',
                background: '#fafafa',
                transition: 'border-color 0.18s ease',
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                background: '#0d0d0d',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 22px',
                fontSize: 13,
                fontWeight: 600,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
                letterSpacing: '0.04em',
              }}
            >
              {status === 'loading' ? '…' : 'Subscribe →'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p style={{ fontSize: 12, color: '#c00', marginTop: 12 }}>{message}</p>
        )}

        <p style={{ fontSize: 11, color: '#ddd', marginTop: 20 }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}

export default function Report() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('rms_report');
    if (!stored) { setNotFound(true); return; }
    try {
      setData(JSON.parse(stored));
    } catch {
      setNotFound(true);
    }
  }, []);

  if (notFound) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif", gap: 16,
      }}>
        <p style={{ fontSize: 14, color: '#aaa' }}>No report found.</p>
        <button
          onClick={() => router.push('/')}
          style={{
            background: '#0d0d0d', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 24px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Your Facial Report — Rate My Skin</title>
        <meta name="description" content="Your AI-powered facial aesthetics report from Rate My Skin." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Sticky frosted-glass nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,250,250,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #ebebeb',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo />
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none', border: '1px solid #e0e0e0', borderRadius: 8,
            padding: '8px 16px', fontSize: 12, color: '#666', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          }}
        >
          ← New Analysis
        </button>
      </div>

      <BeautyReport data={data} />

      <NewsletterSection />
    </>
  );
}
