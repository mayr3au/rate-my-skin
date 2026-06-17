import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from './Logo';
import { useLang } from '../lib/LangContext';

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {['en', 'fr'].map((l, i) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {i > 0 && <span style={{ color: '#E0DDD8', fontSize: 11 }}>|</span>}
          <button
            onClick={() => setLang(l)}
            style={{
              background: 'none', border: 'none',
              fontSize: 11, fontWeight: lang === l ? 700 : 400,
              color: lang === l ? '#2C241D' : '#B9AC9E',
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

export default function Navbar() {
  const router = useRouter();
  const { lang, t } = useLang();
  const [isOpen, setIsOpen] = useState(false);

  const WARM = '#A87449';

  const navLinks = [
    { href: '/technologie', label: t('techNav') },
    { href: '/blog', label: t('blogNav') },
    { href: '/mes-rapports', label: t('myReportsNav') }
  ];

  return (
    <>
      <div className="nav-blur" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        padding: 'calc(13px + env(safe-area-inset-top, 0px)) 26px 13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Logo height={32} />
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2.5vw, 20px)' }}>
          <LangToggle />
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              style={{
                background: 'none', border: 'none',
                padding: '2px 0', fontSize: '12px', color: '#8C7A6B', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                letterSpacing: '0.02em', whiteSpace: 'nowrap'
              }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => router.push('/')}
            className="btn-liquid-glass"
            style={{
              borderRadius: 10,
              padding: '9px 18px', fontSize: 12,
              border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              color: WARM
            }}
          >
            {lang === 'fr' ? 'Analyser ma peau' : 'Analyze my skin'}
          </button>
        </div>

        {/* Mobile Controls (LangToggle + Hamburger) */}
        <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: 14 }}>
          <LangToggle />
          <button
            onClick={() => setIsOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C241D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Sidebar */}
      <div 
        className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 110,
          background: 'rgba(44, 36, 29, 0.25)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      >
        <div 
          className="mobile-drawer-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: '280px', maxWidth: '85vw',
            background: 'linear-gradient(150deg, rgba(255,255,255,0.95) 0%, rgba(253,246,237,0.92) 55%, rgba(246,235,222,0.95) 100%)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(201, 169, 97, 0.25)',
            boxShadow: '-8px 0 32px rgba(44, 36, 29, 0.08)',
            padding: '28px 24px',
            display: 'flex', flexDirection: 'column', gap: 32,
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header of drawer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Logo height={28} />
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C241D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Links list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  setIsOpen(false);
                  router.push(link.href);
                }}
                style={{
                  background: 'none', border: 'none',
                  textAlign: 'left', padding: '8px 0',
                  fontSize: '15px', color: '#2C241D', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  letterSpacing: '0.01em', borderBottom: '1px solid rgba(168,116,73,0.08)'
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Footer CTA of drawer */}
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/');
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3D2914 0%, #281B0D 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 20px',
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
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 767px) {
          .nav-desktop-links {
            display: none !important;
          }
          .nav-mobile-controls {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
