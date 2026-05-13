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

function NewsletterSection() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
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
        setMessage(data.error || t('somethingWentWrong'));
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setMessage(t('somethingWentWrong'));
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
          {t('freeWeekly')}
        </p>

        <h2 style={{
          fontSize: 30, fontWeight: 300, color: '#0d0d0d',
          fontFamily: "'Cormorant Garamond', serif",
          marginBottom: 12, letterSpacing: '0.01em',
        }}>
          {t('weeklyTipsTitle')}
        </h2>

        <p style={{
          fontSize: 13, color: '#aaa', lineHeight: 1.8,
          maxWidth: 320, margin: '0 auto 32px',
        }}>
          {t('weeklyTipsDesc')}
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
              {t('subscribed')}
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
              {status === 'loading' ? t('subscribeLoading') : t('subscribe')}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p style={{ fontSize: 12, color: '#c00', marginTop: 12 }}>{message}</p>
        )}

        <p style={{ fontSize: 11, color: '#ddd', marginTop: 20 }}>
          {t('noSpam')}
        </p>
      </div>
    </div>
  );
}

export default function Report() {
  const router = useRouter();
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('rms_report');
    if (!stored) { setNotFound(true); return; }
    try {
      setData(JSON.parse(stored));
      const storedProducts = sessionStorage.getItem('rms_products');
      if (storedProducts) setProducts(JSON.parse(storedProducts));
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
      </Head>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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

      <BeautyReport data={data} products={products} />

      <NewsletterSection />
    </>
  );
}
