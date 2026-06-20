import { useState, useEffect, useRef } from "react";
import Footer from "./Footer";

/* ════════════════════════════════════════════════════════════════════════
   HomeRefonte — landing en 7 actes éditoriaux
   ════════════════════════════════════════════════════════════════════════ */

export default function HomeRefonte({ onUploadClick, lang = "fr", setLang = () => {}, t = (k) => k }) {
  const [scrolled, setScrolled] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const scoreRef = useRef(null);
  const animatedOnce = useRef(false);

  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest('.hrf-menu-wrap')) setOpenMenu(null);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Score reveal animation (0 → 58) when hero gauge is visible
  useEffect(() => {
    if (!scoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animatedOnce.current) {
          animatedOnce.current = true;
          let v = 0;
          const target = 58;
          const tick = () => {
            v += Math.max(1, Math.round((target - v) / 6));
            if (v >= target) {
              setScoreAnim(target);
            } else {
              setScoreAnim(v);
              requestAnimationFrame(tick);
            }
          };
          tick();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(scoreRef.current);
    return () => observer.disconnect();
  }, []);

  const fr = lang === "fr";
  const dash = (scoreAnim / 100) * 263.9;

  return (
    <div className="hrf-root">
      <style jsx global>{`
        .hrf-root {
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,181,116,0.10) 0%, transparent 60%),
            linear-gradient(180deg, #FBF6EE 0%, #F8F1E5 50%, #F5EBDB 100%);
          font-family: 'DM Sans', sans-serif;
          color: #2C2416;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .hrf-root *::selection { background: rgba(201,169,97,0.3); }

        /* ── Layout ─────────────────────────────────────────────── */
        .hrf-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 28px;
        }
        .hrf-section {
          padding: clamp(32px, 5vw, 72px) 0;
          position: relative;
        }

        /* Press strip */
        .hrf-press {
          padding: 28px 0 12px;
          border-top: 1px solid rgba(201,169,97,0.14);
          border-bottom: 1px solid rgba(201,169,97,0.14);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }
        .hrf-press-lbl {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #B0885E;
          flex-shrink: 0;
        }
        .hrf-press-row {
          display: flex;
          align-items: center;
          gap: clamp(20px, 4vw, 44px);
          flex: 1;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hrf-press-brand {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(15px, 2vw, 19px);
          color: #8A7A6B;
          letter-spacing: 0.02em;
          white-space: nowrap;
          transition: color 0.25s;
        }
        .hrf-press-brand:hover { color: #2C2416; }
        @media (max-width: 720px) {
          .hrf-press { padding: 20px 0; }
        }

        /* Quote divider */
        .hrf-quote-divider {
          text-align: center;
          padding: clamp(48px, 8vw, 80px) clamp(20px, 4vw, 40px);
          max-width: 760px;
          margin: 0 auto;
          position: relative;
        }
        .hrf-quote-divider::before {
          content: "❝";
          font-family: 'Cormorant Garamond', serif;
          font-size: 80px;
          color: #C9A961;
          opacity: 0.22;
          line-height: 0.6;
          display: block;
          margin-bottom: 14px;
        }
        .hrf-quote-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(22px, 3vw, 30px);
          color: #2C2416;
          line-height: 1.35;
          margin: 0 0 16px;
        }
        .hrf-quote-text em {
          background: linear-gradient(transparent 65%, rgba(201,169,97,0.3) 65%);
          padding: 0 4px;
          font-style: italic;
        }
        .hrf-quote-author {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #B0885E;
          font-weight: 600;
        }

        /* FAQ */
        .hrf-faq {
          max-width: 720px;
          margin: 48px auto 0;
        }
        .hrf-faq-item {
          border-bottom: 1px solid rgba(201,169,97,0.16);
        }
        .hrf-faq-item:first-child { border-top: 1px solid rgba(201,169,97,0.16); }
        .hrf-faq-q {
          padding: 22px 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 2vw, 20px);
          color: #2C2416;
          font-weight: 500;
          letter-spacing: -0.005em;
          transition: color 0.2s;
        }
        .hrf-faq-q:hover { color: #C9A961; }
        .hrf-faq-q-icon {
          color: #C9A961;
          font-size: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .hrf-faq-item.open .hrf-faq-q-icon { transform: rotate(45deg); }
        .hrf-faq-a {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }
        .hrf-faq-item.open .hrf-faq-a { max-height: 400px; }
        .hrf-faq-a-inner {
          padding: 0 4px 22px;
          font-size: 14px;
          color: #5C4A3A;
          line-height: 1.65;
        }
        .hrf-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #C9A961;
          margin-bottom: 18px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .hrf-eyebrow::before, .hrf-eyebrow::after {
          content: "";
          width: 28px; height: 1px;
          background: linear-gradient(90deg, transparent, #C9A961, transparent);
        }
        .hrf-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 400;
          color: #2C2416;
          line-height: 1.05;
          letter-spacing: -0.015em;
          margin: 0 0 24px;
        }
        .hrf-h2 em {
          font-style: italic;
          color: #B0885E;
        }
        .hrf-lede {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(17px, 2vw, 21px);
          color: #5C4A3A;
          line-height: 1.5;
          max-width: 580px;
          margin: 0 auto 40px;
        }
        .hrf-center { text-align: center; }

        /* ── Nav (sticky, blur on scroll) ────────────────────── */
        .hrf-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          background: rgba(251,246,238,0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(201,169,97,0.14);
          transition: all 0.3s ease;
        }
        .hrf-nav.scrolled {
          background: rgba(251,246,238,0.96);
          box-shadow: 0 8px 24px rgba(94,71,47,0.06);
        }
        .hrf-nav-left, .hrf-nav-right {
          display: flex;
          align-items: center;
          gap: 18px;
          flex: 1;
        }
        .hrf-nav-right { justify-content: flex-end; }
        .hrf-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 500;
          color: #2C2416;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: -0.005em;
          white-space: nowrap;
          padding: 0 24px;
          flex-shrink: 0;
        }
        .hrf-logo em { font-style: italic; font-weight: 400; }
        .hrf-logo .star { color: #C9A961; font-size: 15px; }
        .hrf-lang {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          color: #B0885E;
          letter-spacing: 0.08em;
          font-weight: 600;
        }
        .hrf-lang .sep { color: rgba(201,169,97,0.5); margin: 0 4px; }
        .hrf-lang-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          font: inherit; color: inherit; letter-spacing: inherit;
          transition: opacity 0.2s;
        }
        .hrf-nav-links {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .hrf-nav-link {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #5C4A3A;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.25s;
          background: none;
          border: none;
          font-family: inherit;
          white-space: nowrap;
          padding: 6px 2px;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .hrf-nav-link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C9A961, transparent);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .hrf-nav-link:hover { color: #2C2416; }
        .hrf-nav-link:hover::after { width: 100%; }
        .hrf-nav-link .chev {
          font-size: 9px;
          color: #C9A961;
          transition: transform 0.25s;
          margin-left: 1px;
        }
        .hrf-nav-link.open .chev { transform: rotate(180deg); }
        .hrf-nav-link.open { color: #2C2416; }

        /* Dropdown menu */
        .hrf-menu-wrap { position: relative; }
        .hrf-menu {
          position: absolute;
          top: calc(100% + 14px);
          left: 50%;
          transform: translateX(-50%) translateY(-6px);
          min-width: 240px;
          background: linear-gradient(135deg, #FBF6EE 0%, #F5EBDB 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 16px;
          padding: 8px;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.95) inset,
            0 20px 48px rgba(94,71,47,0.16),
            0 8px 16px rgba(94,71,47,0.06);
          opacity: 0;
          pointer-events: none;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 110;
        }
        .hrf-menu.open {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          pointer-events: auto;
        }
        .hrf-menu::before {
          content: "";
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: #FBF6EE;
          border-top: 1px solid rgba(201,169,97,0.22);
          border-left: 1px solid rgba(201,169,97,0.22);
        }
        .hrf-menu-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 14px;
          border-radius: 10px;
          cursor: pointer;
          color: #2C2416;
          text-decoration: none;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
          transition: background 0.2s;
        }
        .hrf-menu-item:hover { background: rgba(201,169,97,0.1); }
        .hrf-menu-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(201,169,97,0.18) 0%, rgba(201,169,97,0.06) 100%);
          border: 1px solid rgba(201,169,97,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #8B6E26;
        }
        .hrf-menu-icon svg { width: 16px; height: 16px; }
        .hrf-menu-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hrf-menu-title {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 500;
          color: #2C2416;
          letter-spacing: -0.005em;
          line-height: 1.2;
        }
        .hrf-menu-desc {
          display: block;
          font-size: 11px;
          color: #8A7A6B;
          line-height: 1.4;
        }

        /* Mobile menu */
        .hrf-burger {
          display: none;
          background: none;
          border: 1px solid rgba(201,169,97,0.25);
          border-radius: 100px;
          padding: 8px 10px;
          cursor: pointer;
          color: #2C2416;
        }
        .hrf-burger svg { width: 18px; height: 18px; display: block; }
        @media (max-width: 880px) {
          .hrf-nav-links { display: none; }
          .hrf-nav-cta { display: none; }
          .hrf-burger { display: inline-flex; }
        }
        .hrf-mobile-drawer {
          position: fixed;
          top: 0; right: 0;
          width: min(320px, 86vw);
          height: 100vh;
          background: linear-gradient(180deg, #FBF6EE 0%, #F5EBDB 100%);
          border-left: 1px solid rgba(201,169,97,0.22);
          padding: 24px 22px;
          z-index: 200;
          box-shadow: -20px 0 60px rgba(94,71,47,0.18);
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hrf-mobile-drawer.open { transform: translateX(0); }
        .hrf-mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(44,36,22,0.4);
          backdrop-filter: blur(4px);
          z-index: 199;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .hrf-mobile-backdrop.open { opacity: 1; pointer-events: auto; }
        .hrf-mobile-close {
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          font-size: 20px;
          color: #8A7A6B;
          cursor: pointer;
        }
        .hrf-mobile-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          color: #2C2416;
          margin-bottom: 18px;
        }
        .hrf-drawer-lang {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 16px; padding-top: 16px;
          border-top: 1px solid rgba(201,169,97,0.2);
        }
        .hrf-drawer-lang-label {
          font-size: 13px; font-weight: 600; color: #6F5A44;
        }
        .hrf-drawer-lang-toggle {
          display: inline-flex; padding: 3px;
          background: rgba(201,169,97,0.1); border: 1px solid rgba(201,169,97,0.24);
          border-radius: 100px;
        }
        .hrf-drawer-lang-opt {
          border: none; background: none; cursor: pointer;
          padding: 6px 16px; border-radius: 100px;
          font-family: 'DM Sans'; font-size: 12px; font-weight: 700;
          letter-spacing: 0.06em; color: #8A7A6B; transition: all 0.2s;
        }
        .hrf-drawer-lang-opt.active {
          background: #fff; color: #2C2416;
          box-shadow: 0 2px 6px rgba(94,71,47,0.1);
        }
        .hrf-nav-cta {
          background: linear-gradient(180deg, #3A2F22 0%, #2C2416 100%);
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 100px;
          font-family: 'DM Sans';
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          margin-left: 12px;
          box-shadow: 0 4px 12px rgba(44,36,22,0.18);
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .hrf-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(44,36,22,0.24); }
        .hrf-nav-cta .star { color: #C9A961; font-size: 10px; }
        .hrf-account {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 100px;
          background: rgba(201,169,97,0.08);
          border: 1px solid rgba(201,169,97,0.28);
          color: #6F5A44;
          cursor: pointer;
          flex-shrink: 0;
          margin-left: 4px;
          transition: all 0.22s;
        }
        .hrf-account:hover { background: rgba(201,169,97,0.16); color: #2C2416; transform: translateY(-1px); }
        .hrf-account svg { width: 18px; height: 18px; display: block; }
        @media (max-width: 720px) {
          .hrf-nav-links { display: none; }
          .hrf-nav { padding: 12px 18px; }
        }
        @media (max-width: 640px) {
          .hrf-nav { padding: 8px 16px; }
          .hrf-nav-left, .hrf-nav-right { gap: 8px; }
          .hrf-logo { font-size: 20px; padding: 0; gap: 4px; }
          .hrf-logo .star { font-size: 12px; }
          /* Declutter: language switch lives in the drawer; the header CTA is
             dropped on phones (still in hero + drawer) and replaced by the
             account access. */
          .hrf-lang { display: none; }
          .hrf-nav-cta { display: none; }
          .hrf-account { display: inline-flex; }
          .hrf-burger { padding: 6px 8px; }
          .hrf-burger svg { width: 18px; height: 18px; }
        }

        /* ── HERO ───────────────────────────────────────────────── */
        .hrf-hero {
          padding: clamp(24px, 4vw, 56px) 0 clamp(64px, 8vw, 96px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(40px, 6vw, 80px);
          align-items: center;
        }
        @media (max-width: 880px) {
          .hrf-hero { grid-template-columns: 1fr; text-align: center; }
        }
        .hrf-hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(201,169,97,0.3);
          border-radius: 100px;
          padding: 8px 16px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8B6E26;
          margin-bottom: 24px;
        }
        .hrf-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 7vw, 72px);
          font-weight: 400;
          color: #2C2416;
          line-height: 1.0;
          letter-spacing: -0.02em;
          margin: 0 0 20px;
        }
        .hrf-h1 em {
          font-style: italic;
          color: #B0885E;
          display: block;
        }
        .hrf-h1-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(18px, 2vw, 22px);
          color: #5C4A3A;
          line-height: 1.5;
          margin: 0 0 32px;
          max-width: 460px;
        }
        @media (max-width: 880px) {
          .hrf-h1-sub { margin-left: auto; margin-right: auto; }
        }
        .hrf-cta-row {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        @media (max-width: 880px) {
          .hrf-cta-row { justify-content: center; }
        }
        .hrf-cta-primary {
          background: linear-gradient(180deg, #3A2F22 0%, #2C2416 50%, #1A1410 100%);
          color: #fff;
          border: none;
          padding: 18px 32px;
          border-radius: 100px;
          font-family: 'DM Sans';
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.15) inset,
            0 14px 32px rgba(44,36,22,0.28),
            0 4px 8px rgba(44,36,22,0.12);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .hrf-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.18) inset,
            0 18px 40px rgba(44,36,22,0.34),
            0 6px 12px rgba(44,36,22,0.18);
        }
        .hrf-cta-primary .star { color: #C9A961; font-size: 12px; }
        .hrf-trust-mini {
          display: flex;
          gap: 16px;
          align-items: center;
          font-size: 12px;
          color: #8A7A6B;
          flex-wrap: wrap;
        }
        @media (max-width: 880px) {
          .hrf-trust-mini { justify-content: center; }
        }
        .hrf-trust-mini .stars { color: #C9A961; letter-spacing: 2px; font-size: 13px; }
        .hrf-trust-mini .sep { opacity: 0.4; }

        /* ── iPhone réaliste ──────────────────────────────────── */
        .hrf-phone-stage {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          height: clamp(540px, 68vw, 680px);
          perspective: 1400px;
        }
        .hrf-phone {
          position: relative;
          width: clamp(280px, 32vw, 340px);
          aspect-ratio: 1 / 2.06;
          background:
            linear-gradient(135deg, #C5B49C 0%, #8B7A60 18%, #6B5A48 35%, #8B7A60 55%, #B5A48C 75%, #6B5A48 100%);
          border-radius: 54px;
          padding: 7px;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.18),
            inset 0 2px 3px rgba(255,255,255,0.15),
            inset 0 -3px 6px rgba(0,0,0,0.25),
            -16px 20px 40px rgba(94,71,47,0.18),
            0 60px 120px rgba(94,71,47,0.28),
            0 30px 60px rgba(94,71,47,0.12);
          animation: hrf-phone-tilt-bob 7s ease-in-out infinite;
          transform-style: preserve-3d;
          z-index: 2;
        }
        /* Side buttons (volume + power) */
        .hrf-phone::before {
          content: "";
          position: absolute;
          left: -2.5px;
          top: 100px;
          width: 3px;
          height: 28px;
          background: linear-gradient(90deg, #1A1612, #2C2620);
          border-radius: 1.5px 0 0 1.5px;
          box-shadow: 0 50px 0 #1A1612, 0 90px 0 #1A1612;
        }
        .hrf-phone::after {
          content: "";
          position: absolute;
          right: -2.5px;
          top: 130px;
          width: 3px;
          height: 56px;
          background: linear-gradient(270deg, #1A1612, #2C2620);
          border-radius: 0 1.5px 1.5px 0;
        }
        @keyframes hrf-phone-bob {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes hrf-phone-tilt-bob {
          0%, 100% {
            transform: perspective(1400px) rotateY(-10deg) rotateX(3deg) translateY(0);
          }
          50% {
            transform: perspective(1400px) rotateY(-7deg) rotateX(5deg) translateY(-10px);
          }
        }
        .hrf-phone-inner {
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, #FBF6EE 0%, #F8F1E5 60%, #F5EBDB 100%);
          border-radius: 48px;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04);
        }
        /* Subtle screen glare */
        .hrf-phone-inner::before {
          content: "";
          position: absolute;
          top: 0; left: -20%;
          width: 60%; height: 100%;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.16) 50%, transparent 70%);
          pointer-events: none;
          z-index: 4;
          transform: skewX(-12deg);
        }
        /* Dynamic Island */
        .hrf-island {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 84px;
          height: 26px;
          background: #0A0805;
          border-radius: 100px;
          z-index: 8;
          box-shadow:
            inset 0 1px 2px rgba(255,255,255,0.06),
            0 2px 4px rgba(0,0,0,0.18);
        }
        /* Compact status (just time small) */
        .hrf-status-mini {
          position: absolute;
          top: 18px;
          left: 24px;
          font-size: 11px;
          font-weight: 700;
          color: #2C2416;
          letter-spacing: -0.01em;
          z-index: 5;
        }
        .hrf-status-mini-r {
          position: absolute;
          top: 18px;
          right: 24px;
          z-index: 5;
          color: #2C2416;
          display: inline-flex;
          gap: 3px;
          align-items: center;
        }
        /* App content area (bigger room for content) */
        .hrf-app {
          padding: 50px 18px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 3;
          height: 100%;
        }
        /* Personal banner */
        .hrf-app-person {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(253,250,244,0.5) 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 100px;
          padding: 5px 12px 5px 5px;
          margin-top: 4px;
          box-shadow: 0 4px 12px rgba(168,116,73,0.05);
        }
        .hrf-app-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E8C988 0%, #A88947 100%);
          color: #FBF6EE;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 600;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.4) inset,
            0 2px 6px rgba(168,116,73,0.18);
        }
        .hrf-app-person-name {
          font-family: 'DM Sans';
          font-size: 10px;
          font-weight: 600;
          color: #2C2416;
          letter-spacing: 0.04em;
        }
        .hrf-app-person-tag {
          font-family: 'DM Sans';
          font-size: 9px;
          font-weight: 500;
          color: #B0885E;
          letter-spacing: 0.02em;
          margin-left: 4px;
        }
        /* Trajectory mini chart */
        .hrf-traj {
          width: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(253,250,244,0.4) 100%);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 14px;
          padding: 10px 12px;
          margin-top: 2px;
        }
        .hrf-traj-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }
        .hrf-traj-lbl {
          font-size: 7.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #B0885E;
        }
        .hrf-traj-target {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          font-style: italic;
          color: #5C4A3A;
        }
        .hrf-traj-bar {
          position: relative;
          height: 4px;
          background: rgba(201,169,97,0.16);
          border-radius: 100px;
          overflow: visible;
        }
        .hrf-traj-fill {
          position: absolute;
          inset: 0 42% 0 0;
          background: linear-gradient(90deg, #D199AB 0%, #C9A961 60%, #7AAE98 100%);
          border-radius: 100px;
        }
        .hrf-traj-dot {
          position: absolute;
          top: -3px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #FBF6EE;
          border: 2px solid;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .hrf-traj-dot.from { left: -5px; border-color: #D199AB; }
        .hrf-traj-dot.to { right: -5px; border-color: #7AAE98; }
        /* Priority chips */
        .hrf-prio-mini {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 100%;
        }
        .hrf-prio-chip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 9px;
          padding: 7px 10px;
          background: #fff;
          border: 1px solid rgba(201,169,97,0.18);
          border-left: 3px solid;
          border-radius: 9px;
          box-shadow: 0 2px 6px rgba(168,116,73,0.04);
        }
        .hrf-prio-chip-score {
          width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 11.5px; font-weight: 700;
          border: 1.5px solid;
        }
        .hrf-prio-chip-score.bad { color: #C77E94; border-color: #D199AB; background: rgba(209,153,171,0.12); }
        .hrf-prio-chip-score.mid { color: #6F92B0; border-color: #9AB5CE; background: rgba(154,181,206,0.12); }
        .hrf-prio-chip-score.good { color: #5E9A7E; border-color: #7AAE98; background: rgba(122,174,152,0.12); }
        .hrf-prio-chip-l { flex: 1; min-width: 0; }
        .hrf-prio-chip-z {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #B0885E;
          margin-bottom: 1px;
        }
        .hrf-prio-chip-n {
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px;
          font-weight: 500;
          color: #2C2416;
          line-height: 1.1;
        }
        .hrf-prio-chip-a {
          font-size: 8.5px;
          font-weight: 600;
          color: #8B6E26;
          background: rgba(201,169,97,0.12);
          border-radius: 100px;
          padding: 2px 7px;
          white-space: nowrap;
        }
        /* Unlock CTA */
        .hrf-app-cta {
          margin-top: auto;
          width: 100%;
          padding: 9px 14px;
          background: linear-gradient(180deg, #3A2F22 0%, #2C2416 100%);
          color: #fff;
          border-radius: 100px;
          font-family: 'DM Sans';
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.12) inset,
            0 6px 14px rgba(44,36,22,0.22);
        }
        .hrf-app-cta .s { color: #C9A961; font-size: 8px; }
        .hrf-phone-eyebrow {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #C9A961;
          margin-top: 4px;
        }
        .hrf-phone-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          color: #2C2416;
          text-align: center;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .hrf-phone-gauge {
          width: 155px;
          height: 155px;
          position: relative;
          filter: drop-shadow(0 8px 22px rgba(201,169,97,0.26));
        }
        .hrf-phone-gauge svg { width: 100%; height: 100%; }
        .hrf-phone-score {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .hrf-phone-score .n {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px;
          font-weight: 500;
          color: #A88947;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .hrf-phone-score .d {
          font-size: 9px;
          color: #B0885E;
          letter-spacing: 0.18em;
          font-weight: 600;
          margin-top: 4px;
        }
        .hrf-phone-verdict {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 11px;
          color: #5C4A3A;
          text-align: center;
          line-height: 1.4;
          max-width: 200px;
        }
        .hrf-phone-mini-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          width: 100%;
          margin-top: 8px;
        }
        .hrf-pm {
          background: #fff;
          border-radius: 8px;
          padding: 6px 4px;
          text-align: center;
          border: 1px solid rgba(201,169,97,0.15);
        }
        .hrf-pm-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
        }
        .hrf-pm-lbl {
          font-size: 7px;
          letter-spacing: 0.06em;
          color: #8A7A6B;
          margin-top: 2px;
          font-weight: 600;
        }
        .hrf-pm.good .hrf-pm-num { color: #7AAE98; }
        .hrf-pm.mid .hrf-pm-num { color: #9AB5CE; }
        .hrf-pm.bad .hrf-pm-num { color: #D199AB; }

        /* Floating accents around phone */
        .hrf-float {
          position: absolute;
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 100px;
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 600;
          color: #2C2416;
          box-shadow: 0 8px 24px rgba(168,116,73,0.08);
          backdrop-filter: blur(8px);
          z-index: 3;
        }
        .hrf-float .num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          margin-right: 6px;
        }
        .hrf-float-1 {
          top: 18%; left: 4%;
          animation: hrf-float1 7s ease-in-out infinite;
        }
        .hrf-float-2 {
          top: 42%; right: 0%;
          animation: hrf-float2 8s ease-in-out infinite;
        }
        .hrf-float-3 {
          bottom: 20%; left: -2%;
          animation: hrf-float3 9s ease-in-out infinite;
        }
        @media (max-width: 640px) {
          .hrf-float-1 { top: 12%; left: 8%; }
          .hrf-float-2 { top: 40%; right: 4%; }
          .hrf-float-3 { bottom: 22%; left: 6%; }
          .hrf-float .num { font-size: 13px; }
          .hrf-float { font-size: 9px; padding: 4px 9px; }
        }
        @keyframes hrf-float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8px, -10px); }
        }
        @keyframes hrf-float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, 12px); }
        }
        @keyframes hrf-float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -8px); }
        }

        /* ── 2. PROBLEM ─────────────────────────────────────────── */
        .hrf-problem-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 56px;
        }
        @media (max-width: 880px) {
          .hrf-problem-grid { grid-template-columns: 1fr; gap: 18px; }
        }
        .hrf-myth-card {
          background: linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 22px;
          padding: 28px 24px;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 32px rgba(168,116,73,0.05);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hrf-myth-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 20px 48px rgba(168,116,73,0.10);
        }
        .hrf-myth-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-style: italic;
          color: #C9A961;
          margin-bottom: 10px;
        }
        .hrf-myth-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          color: #2C2416;
          margin-bottom: 12px;
          line-height: 1.15;
        }
        .hrf-myth-strike {
          font-size: 12px;
          color: #B9AC9E;
          text-decoration: line-through;
          margin-bottom: 6px;
          font-style: italic;
        }
        .hrf-myth-truth {
          font-size: 14px;
          color: #5C4A3A;
          line-height: 1.6;
        }
        .hrf-myth-truth strong { color: #2C2416; font-weight: 600; }

        /* ── 3. HOW ─────────────────────────────────────────────── */
        .hrf-how-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 32px;
          margin-top: 56px;
          position: relative;
        }
        @media (max-width: 880px) {
          .hrf-how-grid { grid-template-columns: 1fr; gap: 24px; }
        }
        .hrf-step {
          text-align: center;
          position: relative;
        }
        .hrf-step-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px;
          color: #C9A961;
          opacity: 0.4;
          line-height: 1;
          margin-bottom: 16px;
          font-style: italic;
        }
        .hrf-step-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FDFAF4 0%, #F5EBDB 100%);
          border: 1px solid rgba(201,169,97,0.3);
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C9A961;
        }
        .hrf-step-icon svg { width: 32px; height: 32px; }
        .hrf-step-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 500;
          color: #2C2416;
          margin-bottom: 10px;
        }
        .hrf-step-desc {
          font-size: 14px;
          color: #5C4A3A;
          line-height: 1.6;
          max-width: 280px;
          margin: 0 auto;
        }
        .hrf-step-arrow {
          position: absolute;
          top: 70px;
          right: -20px;
          color: #C9A961;
          font-size: 24px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          opacity: 0.5;
        }
        @media (max-width: 880px) {
          .hrf-step-arrow { display: none; }
        }

        /* ── 4. WHAT YOU GET ────────────────────────────────────── */
        .hrf-get-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: clamp(40px, 6vw, 80px);
          margin-top: 56px;
          align-items: center;
        }
        @media (max-width: 880px) {
          .hrf-get-grid { grid-template-columns: 1fr; }
        }
        .hrf-features-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .hrf-feat {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 18px 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(253,250,244,0.5) 100%);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 16px;
          transition: all 0.3s;
        }
        .hrf-feat:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(253,250,244,0.75) 100%);
          transform: translateX(4px);
        }
        .hrf-feat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(201,169,97,0.18) 0%, rgba(201,169,97,0.06) 100%);
          color: #8B6E26;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(201,169,97,0.28);
          box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 10px rgba(168,116,73,0.05);
          transition: all 0.3s;
        }
        .hrf-feat-icon svg { width: 22px; height: 22px; }
        .hrf-feat:hover .hrf-feat-icon {
          background: linear-gradient(135deg, rgba(201,169,97,0.32) 0%, rgba(201,169,97,0.12) 100%);
          transform: scale(1.04);
        }
        .hrf-feat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          font-weight: 600;
          color: #B0885E;
          letter-spacing: 0.18em;
          margin-right: 6px;
          font-style: italic;
        }
        .hrf-feat-text { flex: 1; }
        .hrf-feat-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          color: #2C2416;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        .hrf-feat-desc {
          font-size: 13px;
          color: #5C4A3A;
          line-height: 1.55;
        }

        /* Report preview card — riche */
        .hrf-preview-card {
          background: linear-gradient(180deg, #FBF6EE 0%, #F5EBDB 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 28px;
          padding: 12px;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 30px 60px rgba(94,71,47,0.14), 0 12px 24px rgba(94,71,47,0.06);
        }
        .hrf-preview-card::before {
          content: "";
          position: absolute;
          top: -1px; left: 50%;
          transform: translateX(-50%);
          width: 48px; height: 2px;
          background: linear-gradient(90deg, transparent, #C9A961, transparent);
        }
        .hrf-preview-inner {
          background: linear-gradient(180deg, #FFFFFF 0%, #FDFAF4 100%);
          border-radius: 18px;
          padding: 22px 20px;
          position: relative;
        }
        .hrf-preview-top {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 14px;
          margin-bottom: 4px;
          border-bottom: 1px solid rgba(201,169,97,0.16);
        }
        .hrf-preview-top-text {
          flex: 1;
          min-width: 0;
        }
        .hrf-preview-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 500;
          color: #2C2416;
          line-height: 1.1;
        }
        .hrf-preview-sub {
          font-size: 11px;
          color: #B0885E;
          margin-top: 1px;
          letter-spacing: 0.02em;
        }
        .hrf-preview-pill {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #C9A961;
          background: rgba(201,169,97,0.1);
          border: 1px solid rgba(201,169,97,0.25);
          padding: 4px 10px;
          border-radius: 100px;
        }
        .hrf-preview-gauge-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 4px 4px;
        }
        .hrf-preview-trajectory {
          flex: 1;
          min-width: 0;
          padding: 12px 14px;
          background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(253,250,244,0.5) 100%);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 14px;
        }
        .hrf-preview-traj-lbl {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #B0885E;
          margin-bottom: 4px;
        }
        .hrf-preview-traj-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          color: #5C4A3A;
          font-weight: 500;
        }
        .hrf-preview-traj-val strong { color: #7AAE98; font-weight: 600; }
        .hrf-preview-stamp {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(201,169,97,0.16);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8B6E26;
        }
        .hrf-preview-stamp-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #2C2416;
          letter-spacing: -0.01em;
          text-transform: none;
        }

        /* ── 5. RESULTS ─────────────────────────────────────────── */
        .hrf-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 56px 0 40px;
        }
        @media (max-width: 720px) {
          .hrf-stats { grid-template-columns: 1fr; gap: 16px; }
        }
        .hrf-stat {
          text-align: center;
          padding: 24px 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(253,250,244,0.5) 100%);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 22px;
        }
        .hrf-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px;
          font-weight: 500;
          color: #C9A961;
          line-height: 1;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .hrf-stat-num em {
          font-style: italic;
          font-size: 32px;
        }
        .hrf-stat-lbl {
          font-size: 12px;
          color: #5C4A3A;
          line-height: 1.5;
          letter-spacing: 0.02em;
        }

        .hrf-testimonials {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 32px;
        }
        @media (max-width: 880px) {
          .hrf-testimonials { grid-template-columns: 1fr; }
        }
        .hrf-tcard {
          background: linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          box-shadow: 0 12px 32px rgba(168,116,73,0.05);
        }
        .hrf-tcard::before {
          content: "“";
          position: absolute;
          top: 8px;
          right: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 60px;
          color: #C9A961;
          opacity: 0.18;
          line-height: 1;
        }
        .hrf-tcard-stars { color: #C9A961; letter-spacing: 3px; font-size: 13px; margin-bottom: 10px; }
        .hrf-tcard-q {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 15px;
          color: #2C2416;
          line-height: 1.5;
          margin-bottom: 14px;
        }
        .hrf-tcard-a {
          font-size: 11.5px;
          color: #8A7A6B;
          letter-spacing: 0.02em;
        }
        .hrf-tcard-a strong { color: #5C4A3A; font-weight: 600; }

        /* ── 6. PRICING ─────────────────────────────────────────── */
        .hrf-pricing {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 800px;
          margin: 56px auto 0;
        }
        @media (max-width: 720px) {
          .hrf-pricing { grid-template-columns: 1fr; }
        }
        .hrf-plan {
          background: linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 24px;
          padding: 32px 28px;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 16px 40px rgba(168,116,73,0.06);
        }
        .hrf-plan.featured {
          border: 2px solid rgba(201,169,97,0.5);
          background: linear-gradient(135deg, #FFFFFF 0%, #FDF5E8 100%);
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 24px 60px rgba(201,169,97,0.18);
        }
        .hrf-plan-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #C9A961 0%, #A88947 100%);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
        }
        .hrf-plan-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 500;
          color: #2C2416;
          margin-bottom: 6px;
        }
        .hrf-plan-tag {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: #8A7A6B;
          margin-bottom: 20px;
        }
        .hrf-plan-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px;
          font-weight: 500;
          color: #2C2416;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .hrf-plan-price-sub {
          font-size: 12px;
          color: #8A7A6B;
          margin-top: 4px;
          margin-bottom: 24px;
        }
        .hrf-plan-list {
          list-style: none;
          padding: 0;
          margin: 0 0 28px;
        }
        .hrf-plan-list li {
          padding: 8px 0;
          font-size: 13px;
          color: #5C4A3A;
          display: flex;
          align-items: center;
          gap: 10px;
          line-height: 1.5;
        }
        .hrf-plan-list li::before {
          content: "✓";
          color: #C9A961;
          font-weight: 700;
        }
        .hrf-plan-list li.no::before {
          content: "—";
          color: #B9AC9E;
        }
        .hrf-plan-list li.no { color: #B9AC9E; }
        .hrf-plan-cta {
          width: 100%;
          background: rgba(255,255,255,0.5);
          color: #2C2416;
          border: 1px solid rgba(201,169,97,0.4);
          padding: 14px;
          border-radius: 100px;
          font-family: 'DM Sans';
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        .hrf-plan-cta:hover {
          background: rgba(201,169,97,0.12);
        }
        .hrf-plan.featured .hrf-plan-cta {
          background: linear-gradient(180deg, #3A2F22 0%, #2C2416 50%, #1A1410 100%);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 8px 20px rgba(44,36,22,0.24);
        }
        .hrf-plan.featured .hrf-plan-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(44,36,22,0.32);
        }
        .hrf-guarantee {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }
        .hrf-guarantee span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(122,174,152,0.18) 0%, rgba(122,174,152,0.08) 100%);
          color: #7AAE98;
          border: 1px solid rgba(122,174,152,0.3);
          border-radius: 100px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
        }

        /* ── 7. FINAL CTA ──────────────────────────────────────── */
        .hrf-final {
          text-align: center;
          padding: clamp(80px, 12vw, 140px) 0 clamp(120px, 16vw, 160px);
          position: relative;
        }
        .hrf-final-ornament {
          color: #C9A961;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .hrf-final-h {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 6vw, 64px);
          font-weight: 400;
          line-height: 1.05;
          color: #2C2416;
          max-width: 720px;
          margin: 0 auto 24px;
          letter-spacing: -0.015em;
        }
        .hrf-final-h em {
          font-style: italic;
          color: #B0885E;
        }
        .hrf-final-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 18px;
          color: #5C4A3A;
          max-width: 480px;
          margin: 0 auto 36px;
          line-height: 1.5;
        }
      `}</style>

      {/* ─── NAV ─────────────────────────────────────────────────────── */}
      <div className={`hrf-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="hrf-nav-left">
          <span className="hrf-lang">
            <button type="button" className="hrf-lang-btn" style={{ opacity: fr ? 0.4 : 1 }} onClick={() => setLang("en")} aria-label="English">EN</button>
            <span className="sep">|</span>
            <button type="button" className="hrf-lang-btn" style={{ opacity: fr ? 1 : 0.4, color: "#2C2416" }} onClick={() => setLang("fr")} aria-label="Français">FR</button>
          </span>
        </div>
        <div className="hrf-logo">
          RateMy <span className="star">✦</span> <em>Skin</em>
        </div>
        <div className="hrf-nav-right">
          <div className="hrf-nav-links">

            {/* Découvrir dropdown (sections home) */}
            <div className="hrf-menu-wrap">
              <button
                className={`hrf-nav-link ${openMenu === "discover" ? "open" : ""}`}
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "discover" ? null : "discover"); }}
              >
                {fr ? "Découvrir" : "Discover"}
                <span className="chev">▾</span>
              </button>
              <div className={`hrf-menu ${openMenu === "discover" ? "open" : ""}`}>
                <a href="#how" className="hrf-menu-item" onClick={() => setOpenMenu(null)}>
                  <span className="hrf-menu-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" />
                    </svg>
                  </span>
                  <span className="hrf-menu-body">
                    <span className="hrf-menu-title">{fr ? "Comment ça marche" : "How it works"}</span>
                    <span className="hrf-menu-desc">{fr ? "Scan, IA, plan — en 3 étapes" : "Scan, AI, plan — in 3 steps"}</span>
                  </span>
                </a>
                <a href="#results" className="hrf-menu-item" onClick={() => setOpenMenu(null)}>
                  <span className="hrf-menu-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" />
                    </svg>
                  </span>
                  <span className="hrf-menu-body">
                    <span className="hrf-menu-title">{fr ? "Résultats" : "Results"}</span>
                    <span className="hrf-menu-desc">{fr ? "Témoignages & avant / après" : "Testimonials & before / after"}</span>
                  </span>
                </a>
                <a href="#pricing" className="hrf-menu-item" onClick={() => setOpenMenu(null)}>
                  <span className="hrf-menu-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M14.5 9a2.5 2.5 0 0 0-2.5-2.5h-1A2.5 2.5 0 0 0 8.5 9c0 1.4 1.1 2.5 2.5 2.5h2c1.4 0 2.5 1.1 2.5 2.5a2.5 2.5 0 0 1-2.5 2.5h-1a2.5 2.5 0 0 1-2.5-2.5" /><line x1="12" y1="4" x2="12" y2="20" />
                    </svg>
                  </span>
                  <span className="hrf-menu-body">
                    <span className="hrf-menu-title">{fr ? "Prix" : "Pricing"}</span>
                    <span className="hrf-menu-desc">{fr ? "Gratuit ou 7,99€ — pas d'abonnement" : "Free or €7.99 — no subscription"}</span>
                  </span>
                </a>
                <a href="#faq" className="hrf-menu-item" onClick={() => setOpenMenu(null)}>
                  <span className="hrf-menu-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" /><circle cx="12" cy="17" r="0.5" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="hrf-menu-body">
                    <span className="hrf-menu-title">FAQ</span>
                    <span className="hrf-menu-desc">{fr ? "Sécurité, garantie, fonctionnement" : "Privacy, guarantee, how it works"}</span>
                  </span>
                </a>
              </div>
            </div>

            {/* Ressources dropdown (pages site) */}
            <div className="hrf-menu-wrap">
              <button
                className={`hrf-nav-link ${openMenu === "resources" ? "open" : ""}`}
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "resources" ? null : "resources"); }}
              >
                {fr ? "Ressources" : "Resources"}
                <span className="chev">▾</span>
              </button>
              <div className={`hrf-menu ${openMenu === "resources" ? "open" : ""}`}>
                <a href="/blog" className="hrf-menu-item">
                  <span className="hrf-menu-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="14" y2="13" />
                    </svg>
                  </span>
                  <span className="hrf-menu-body">
                    <span className="hrf-menu-title">{fr ? "Blog" : "Blog"}</span>
                    <span className="hrf-menu-desc">{fr ? "Conseils skincare et études" : "Skincare tips and studies"}</span>
                  </span>
                </a>
                <a href="/technologie" className="hrf-menu-item">
                  <span className="hrf-menu-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="6" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><circle cx="7.5" cy="8" r="0.5" fill="currentColor" /><circle cx="10" cy="8" r="0.5" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="hrf-menu-body">
                    <span className="hrf-menu-title">{fr ? "Technologie" : "Technology"}</span>
                    <span className="hrf-menu-desc">{fr ? "Notre IA dermatologique" : "Our dermatology AI"}</span>
                  </span>
                </a>
                <a href="/mes-rapports" className="hrf-menu-item">
                  <span className="hrf-menu-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
                    </svg>
                  </span>
                  <span className="hrf-menu-body">
                    <span className="hrf-menu-title">{fr ? "Mes rapports" : "My reports"}</span>
                    <span className="hrf-menu-desc">{fr ? "Retrouve tes analyses précédentes" : "Access your previous analyses"}</span>
                  </span>
                </a>
                <a href="/compte" className="hrf-menu-item">
                  <span className="hrf-menu-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
                    </svg>
                  </span>
                  <span className="hrf-menu-body">
                    <span className="hrf-menu-title">{fr ? "Mon compte" : "My account"}</span>
                    <span className="hrf-menu-desc">{fr ? "Connexion Google · suivi & rescan" : "Google sign-in · tracking & rescan"}</span>
                  </span>
                </a>
              </div>
            </div>

          </div>
          <a href="/compte" className="hrf-account" aria-label={fr ? "Mon compte" : "My account"} title={fr ? "Mon compte" : "My account"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>
          </a>
          <button className="hrf-nav-cta" onClick={onUploadClick}>
            <span className="star">✦</span>
            {fr ? "Analyser" : "Analyze"}
          </button>
          <button className="hrf-burger" onClick={() => setMobileNavOpen(true)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`hrf-mobile-backdrop ${mobileNavOpen ? "open" : ""}`} onClick={() => setMobileNavOpen(false)}></div>
      <div className={`hrf-mobile-drawer ${mobileNavOpen ? "open" : ""}`}>
        <button className="hrf-mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Fermer">✕</button>
        <div className="hrf-mobile-title">Menu</div>
        <a href="#how" className="hrf-menu-item" onClick={() => setMobileNavOpen(false)}>
          <span className="hrf-menu-body">
            <span className="hrf-menu-title">{fr ? "Comment ça marche" : "How it works"}</span>
            <span className="hrf-menu-desc">{fr ? "Scan, IA, plan — 3 étapes" : "Scan, AI, plan — 3 steps"}</span>
          </span>
        </a>
        <a href="#results" className="hrf-menu-item" onClick={() => setMobileNavOpen(false)}>
          <span className="hrf-menu-body">
            <span className="hrf-menu-title">{fr ? "Résultats" : "Results"}</span>
          </span>
        </a>
        <a href="#pricing" className="hrf-menu-item" onClick={() => setMobileNavOpen(false)}>
          <span className="hrf-menu-body">
            <span className="hrf-menu-title">{fr ? "Prix" : "Pricing"}</span>
          </span>
        </a>
        <a href="#faq" className="hrf-menu-item" onClick={() => setMobileNavOpen(false)}>
          <span className="hrf-menu-body">
            <span className="hrf-menu-title">FAQ</span>
          </span>
        </a>
        <div style={{ height: 1, background: "rgba(201,169,97,0.2)", margin: "12px 0" }}></div>
        <a href="/blog" className="hrf-menu-item">
          <span className="hrf-menu-body"><span className="hrf-menu-title">Blog</span></span>
        </a>
        <a href="/technologie" className="hrf-menu-item">
          <span className="hrf-menu-body"><span className="hrf-menu-title">{fr ? "Technologie" : "Technology"}</span></span>
        </a>
        <a href="/mes-rapports" className="hrf-menu-item">
          <span className="hrf-menu-body"><span className="hrf-menu-title">{fr ? "Mes rapports" : "My reports"}</span></span>
        </a>
        <a href="/compte" className="hrf-menu-item">
          <span className="hrf-menu-body"><span className="hrf-menu-title">{fr ? "Mon compte" : "My account"}</span></span>
        </a>
        <div className="hrf-drawer-lang">
          <span className="hrf-drawer-lang-label">{fr ? "Langue" : "Language"}</span>
          <div className="hrf-drawer-lang-toggle">
            <button type="button" className={`hrf-drawer-lang-opt ${!fr ? "active" : ""}`} onClick={() => setLang("en")}>EN</button>
            <button type="button" className={`hrf-drawer-lang-opt ${fr ? "active" : ""}`} onClick={() => setLang("fr")}>FR</button>
          </div>
        </div>
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <button className="hrf-nav-cta" onClick={() => { setMobileNavOpen(false); onUploadClick(); }} style={{ display: "flex", width: "100%", justifyContent: "center", padding: "14px" }}>
            <span className="star">✦</span>
            {fr ? "Analyser ma peau" : "Analyze my skin"}
          </button>
        </div>
      </div>

      {/* ═══ ACT 1: HERO ═══════════════════════════════════════════════ */}
      <div className="hrf-container">
        <div className="hrf-hero">
          <div>
            <span className="hrf-hero-pill">
              <span style={{ color: "#C9A961" }}>✦</span>
              {fr ? "Analyse IA · 30 secondes" : "AI analysis · 30 seconds"}
            </span>
            <h1 className="hrf-h1">
              {fr ? "Ta peau," : "Your skin,"}
              <em>{fr ? "comprise." : "understood."}</em>
            </h1>
            <p className="hrf-h1-sub">
              {fr
                ? "Le vrai problème de ta peau n'est peut-être pas celui que tu crois. Découvre-le en 30 secondes."
                : "The real issue with your skin might not be what you think. Find out in 30 seconds."}
            </p>
            <div className="hrf-cta-row">
              <button className="hrf-cta-primary" onClick={onUploadClick}>
                <span className="star">✦</span>
                {fr ? "Analyser ma peau gratuitement" : "Analyze my skin for free"}
              </button>
            </div>
            <div className="hrf-trust-mini">
              <span>{fr ? "Gratuit · 30 secondes" : "Free · 30 seconds"}</span>
              <span className="sep">·</span>
              <span>{fr ? "Sans inscription" : "No signup"}</span>
              <span className="sep">·</span>
              <span>{fr ? "Photos jamais stockées" : "Photos never stored"}</span>
            </div>
          </div>

          {/* Phone mockup animé */}
          <div className="hrf-phone-stage">
            <div className="hrf-float hrf-float-1">
              <span className="num" style={{ color: "#7AAE98" }}>89</span>
              {fr ? "Rougeurs" : "Redness"}
            </div>
            <div className="hrf-float hrf-float-2">
              <span className="num" style={{ color: "#9AB5CE" }}>78</span>
              {fr ? "Hydratation" : "Hydration"}
            </div>
            <div className="hrf-float hrf-float-3">
              <span className="num" style={{ color: "#D199AB" }}>58</span>
              {fr ? "Pores" : "Pores"}
            </div>

            <div className="hrf-phone">
              <div className="hrf-phone-inner">
                <div className="hrf-island"></div>
                <span className="hrf-status-mini">9:41</span>
                <span className="hrf-status-mini-r">
                  <svg width="14" height="9" viewBox="0 0 16 10" fill="currentColor">
                    <rect x="0" y="6" width="2.5" height="4" rx="0.4"/>
                    <rect x="3.5" y="4" width="2.5" height="6" rx="0.4"/>
                    <rect x="7" y="2" width="2.5" height="8" rx="0.4"/>
                    <rect x="10.5" y="0" width="2.5" height="10" rx="0.4"/>
                  </svg>
                  <svg width="20" height="9" viewBox="0 0 24 11" fill="none">
                    <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5"/>
                    <rect x="2" y="2" width="14" height="7" rx="1.2" fill="currentColor"/>
                    <rect x="21" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/>
                  </svg>
                </span>
                <div className="hrf-app">
                <div className="hrf-app-person">
                  <span className="hrf-app-avatar">L</span>
                  <span className="hrf-app-person-name">Léa</span>
                  <span className="hrf-app-person-tag">· 28 · {fr ? "peau mixte" : "combination"}</span>
                </div>
                <div className="hrf-phone-eyebrow" style={{ marginTop: 4 }}>{fr ? "Diagnostic IA" : "AI diagnosis"}</div>
                <div className="hrf-phone-gauge" ref={scoreRef} style={{ margin: "2px 0 0" }}>
                  <svg viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="hrf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E8C988" />
                        <stop offset="50%" stopColor="#C9A961" />
                        <stop offset="100%" stopColor="#A88947" />
                      </linearGradient>
                    </defs>
                    <g transform="rotate(-90 50 50)">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(201,169,97,0.14)" strokeWidth="4.5" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#hrf-grad)" strokeWidth="5"
                        strokeDasharray="3 263.9" strokeLinecap="round" opacity="0.5" style={{ filter: 'blur(0.6px)' }} />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#hrf-grad)" strokeWidth="4.5"
                        strokeDasharray={`${dash} 263.9`} strokeLinecap="round" />
                    </g>
                  </svg>
                  <div className="hrf-phone-score">
                    <span className="n">{scoreAnim}</span>
                    <span className="d">/ 100</span>
                  </div>
                </div>
                <div className="hrf-traj">
                  <div className="hrf-traj-row">
                    <span className="hrf-traj-lbl">{fr ? "Trajectoire 8 sem." : "8-week trajectory"}</span>
                    <span className="hrf-traj-target">58 <span style={{ color: "#C9A961" }}>→</span> <strong style={{ color: "#7AAE98", fontStyle: "normal", fontWeight: 600 }}>78</strong></span>
                  </div>
                  <div className="hrf-traj-bar">
                    <div className="hrf-traj-fill"></div>
                    <div className="hrf-traj-dot from"></div>
                    <div className="hrf-traj-dot to"></div>
                  </div>
                </div>
                <div className="hrf-prio-mini">
                  <div className="hrf-prio-chip" style={{ borderLeftColor: "#D199AB" }}>
                    <span className="hrf-prio-chip-score bad">56</span>
                    <div className="hrf-prio-chip-l">
                      <div className="hrf-prio-chip-z">{fr ? "Front · Nez" : "Forehead · Nose"}</div>
                      <div className="hrf-prio-chip-n">{fr ? "Pores dilatés" : "Enlarged pores"}</div>
                    </div>
                    <span className="hrf-prio-chip-a">Niacinamide</span>
                  </div>
                  <div className="hrf-prio-chip" style={{ borderLeftColor: "#D199AB" }}>
                    <span className="hrf-prio-chip-score bad">61</span>
                    <div className="hrf-prio-chip-l">
                      <div className="hrf-prio-chip-z">{fr ? "Contour œil" : "Eye area"}</div>
                      <div className="hrf-prio-chip-n">{fr ? "Cernes marqués" : "Dark circles"}</div>
                    </div>
                    <span className="hrf-prio-chip-a">{fr ? "Caféine" : "Caffeine"}</span>
                  </div>
                  <div className="hrf-prio-chip" style={{ borderLeftColor: "#9AB5CE" }}>
                    <span className="hrf-prio-chip-score mid">64</span>
                    <div className="hrf-prio-chip-l">
                      <div className="hrf-prio-chip-z">{fr ? "Joues" : "Cheeks"}</div>
                      <div className="hrf-prio-chip-n">{fr ? "Déshydratation" : "Dehydration"}</div>
                    </div>
                    <span className="hrf-prio-chip-a">{fr ? "Hyaluron." : "Hyaluron."}</span>
                  </div>
                </div>
                <div className="hrf-app-cta">
                  <span className="s">✦</span>
                  {fr ? "Voir le plan complet" : "View full plan"}
                  <span style={{ color: "#C9A961", marginLeft: 2 }}>→</span>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ACT 2: LE VRAI PROBLÈME ════════════════════════════════════ */}
      <div className="hrf-container">
        <div className="hrf-section hrf-center" id="problem">
          <div className="hrf-eyebrow">{fr ? "Ce que personne ne te dit" : "What no one tells you"}</div>
          <h2 className="hrf-h2">
            {fr ? "Ta peau ne ment pas." : "Your skin doesn't lie."}<br />
            <em>{fr ? "Mais elle peut tromper." : "But it can mislead."}</em>
          </h2>
          <p className="hrf-lede">
            {fr
              ? "Tu testes des produits, ça empire, tu changes encore. Le problème ? Tu traites des symptômes, pas la cause."
              : "You try products, it gets worse, you switch again. The problem? You treat symptoms, not the cause."}
          </p>
          <div className="hrf-problem-grid">
            <div className="hrf-myth-card">
              <div className="hrf-myth-num">I.</div>
              <h3 className="hrf-myth-title">{fr ? "L'excès de sébum" : "Excess sebum"}</h3>
              <p className="hrf-myth-strike">{fr ? "« Ma peau brille → j'assèche »" : "\"My skin is oily → I dry it\""}</p>
              <p className="hrf-myth-truth">
                {fr
                  ? <>En réalité ? <strong>Une peau déshydratée surproduit du sébum.</strong> Plus tu assèches, plus elle brille.</>
                  : <>The truth? <strong>Dehydrated skin overproduces sebum.</strong> The more you dry, the more it shines.</>}
              </p>
            </div>
            <div className="hrf-myth-card">
              <div className="hrf-myth-num">II.</div>
              <h3 className="hrf-myth-title">{fr ? "Les boutons" : "Breakouts"}</h3>
              <p className="hrf-myth-strike">{fr ? "« J'ai des boutons → manque d'hygiène »" : "\"I break out → I don't clean enough\""}</p>
              <p className="hrf-myth-truth">
                {fr
                  ? <>En réalité ? <strong>Trop nettoyer détruit la barrière cutanée</strong> et empire l'acné.</>
                  : <>The truth? <strong>Over-cleansing destroys the skin barrier</strong> and worsens acne.</>}
              </p>
            </div>
            <div className="hrf-myth-card">
              <div className="hrf-myth-num">III.</div>
              <h3 className="hrf-myth-title">{fr ? "Le teint terne" : "Dull complexion"}</h3>
              <p className="hrf-myth-strike">{fr ? "« Ma peau est terne → j'exfolie »" : "\"My skin is dull → I exfoliate\""}</p>
              <p className="hrf-myth-truth">
                {fr
                  ? <>En réalité ? <strong>Le ternissement vient souvent du manque de SPF</strong> et d'antioxydants.</>
                  : <>The truth? <strong>Dullness often comes from lack of SPF</strong> and antioxidants.</>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ACT 3: HOW IT WORKS ════════════════════════════════════════ */}
      <div className="hrf-container">
        <div className="hrf-section hrf-center" id="how">
          <div className="hrf-eyebrow">{fr ? "En 4 étapes" : "In 4 steps"}</div>
          <h2 className="hrf-h2">{fr ? <>Une analyse précise, <em>et un suivi réel.</em></> : <>A precise analysis, <em>and real follow-up.</em></>}</h2>
          <div className="hrf-how-grid">
            <div className="hrf-step">
              <div className="hrf-step-num">01</div>
              <div className="hrf-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <h3 className="hrf-step-title">{fr ? "Scanne ta peau" : "Scan your skin"}</h3>
              <p className="hrf-step-desc">
                {fr
                  ? "Une photo de ton visage, bonne lumière naturelle. C'est tout. Pas d'app à installer."
                  : "A photo of your face in good natural light. That's it. No app to install."}
              </p>
              <span className="hrf-step-arrow">→</span>
            </div>
            <div className="hrf-step">
              <div className="hrf-step-num">02</div>
              <div className="hrf-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>
              <h3 className="hrf-step-title">{fr ? "L'IA décortique" : "The AI analyzes"}</h3>
              <p className="hrf-step-desc">
                {fr
                  ? "8 dimensions analysées : hydratation, pores, taches, rougeurs, texture, éclat, acné, cernes."
                  : "8 dimensions analyzed: hydration, pores, dark spots, redness, texture, radiance, acne, dark circles."}
              </p>
              <span className="hrf-step-arrow">→</span>
            </div>
            <div className="hrf-step">
              <div className="hrf-step-num">03</div>
              <div className="hrf-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="15" y2="17" />
                </svg>
              </div>
              <h3 className="hrf-step-title">{fr ? "Reçois ton plan" : "Get your plan"}</h3>
              <p className="hrf-step-desc">
                {fr
                  ? "Score sur 100, 3 priorités, routine matin & soir, produits par budget, plan 8 semaines."
                  : "Score out of 100, 3 priorities, AM & PM routine, products by budget, 8-week plan."}
              </p>
              <span className="hrf-step-arrow">→</span>
            </div>
            <div className="hrf-step">
              <div className="hrf-step-num">04</div>
              <div className="hrf-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                  <path d="M21 4v5h-5" />
                  <path d="M8 13l2.5 2.5L16 10" />
                </svg>
              </div>
              <h3 className="hrf-step-title">{fr ? "Mesure tes progrès" : "Track your progress"}</h3>
              <p className="hrf-step-desc">
                {fr
                  ? "Reviens dans 2 mois pour un nouveau scan : ton évolution réelle, score par score, avec le commentaire de l'équipe."
                  : "Come back in 2 months for a new scan: your real progress, score by score, with the team's personal note."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ACT 4: WHAT YOU GET ═════════════════════════════════════════ */}
      <div className="hrf-container">
        <div className="hrf-section" id="get">
          <div className="hrf-get-grid">
            <div>
              <div className="hrf-eyebrow">{fr ? "Ce que tu obtiens" : "What you get"}</div>
              <h2 className="hrf-h2">{fr ? <>Pas un score.<br /><em>Un vrai diagnostic.</em></> : <>Not a score.<br /><em>A real diagnosis.</em></>}</h2>
              <div className="hrf-features-list">
                <div className="hrf-feat">
                  <div className="hrf-feat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 3 a9 9 0 0 1 6.36 15.36" strokeWidth="2.2" />
                      <text x="12" y="14" fontSize="6" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none">58</text>
                    </svg>
                  </div>
                  <div className="hrf-feat-text">
                    <div className="hrf-feat-title"><span className="hrf-feat-num">01.</span>{fr ? "Ton score global sur 100" : "Your overall score out of 100"}</div>
                    <div className="hrf-feat-desc">{fr ? "Calculé sur 8 dimensions cliniques avec un référentiel dermatologique." : "Calculated across 8 clinical dimensions with a dermatology benchmark."}</div>
                  </div>
                </div>
                <div className="hrf-feat">
                  <div className="hrf-feat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3 C 8 3 6 6 6 10 C 6 14 8 19 12 21 C 16 19 18 14 18 10 C 18 6 16 3 12 3 Z" />
                      <circle cx="9.5" cy="10" r="0.6" fill="currentColor"/>
                      <circle cx="14.5" cy="10" r="0.6" fill="currentColor"/>
                      <circle cx="12" cy="6.5" r="1" />
                      <circle cx="8" cy="13" r="1" />
                      <circle cx="16" cy="13" r="1" />
                    </svg>
                  </div>
                  <div className="hrf-feat-text">
                    <div className="hrf-feat-title"><span className="hrf-feat-num">02.</span>{fr ? "Carte du visage annotée" : "Annotated face map"}</div>
                    <div className="hrf-feat-desc">{fr ? "Front, joues, contour œil — chaque zone problématique localisée et expliquée." : "Forehead, cheeks, eye area — every concern zone mapped and explained."}</div>
                  </div>
                </div>
                <div className="hrf-feat">
                  <div className="hrf-feat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="hrf-feat-text">
                    <div className="hrf-feat-title"><span className="hrf-feat-num">03.</span>{fr ? "3 priorités avec leurs causes" : "3 priorities with their causes"}</div>
                    <div className="hrf-feat-desc">{fr ? "Pas juste les symptômes — la vraie cause de chaque imperfection + actif recommandé." : "Not just symptoms — the real cause behind each concern + recommended active."}</div>
                  </div>
                </div>
                <div className="hrf-feat">
                  <div className="hrf-feat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="7" cy="12" r="3.5" />
                      <path d="M7 5v1.5M7 17.5V19M2 12h1.5M10.5 12H12" />
                      <path d="M20 14a4 4 0 1 1-4.5-4 5 5 0 0 0 4.5 4z" />
                    </svg>
                  </div>
                  <div className="hrf-feat-text">
                    <div className="hrf-feat-title"><span className="hrf-feat-num">04.</span>{fr ? "Routine matin & soir sur-mesure" : "Custom morning & evening routine"}</div>
                    <div className="hrf-feat-desc">{fr ? "Produits sélectionnés selon ton budget, marques recommandées avec liens directs." : "Products picked by budget, recommended brands with direct links."}</div>
                  </div>
                </div>
                <div className="hrf-feat">
                  <div className="hrf-feat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 17 8 12 12 15 21 6" />
                      <polyline points="14 6 21 6 21 13" />
                      <line x1="3" y1="21" x2="21" y2="21" opacity="0.4" />
                    </svg>
                  </div>
                  <div className="hrf-feat-text">
                    <div className="hrf-feat-title"><span className="hrf-feat-num">05.</span>{fr ? "Plan de progression 8 semaines" : "8-week progression plan"}</div>
                    <div className="hrf-feat-desc">{fr ? "Semaine après semaine, vois comment ta peau évolue avec des objectifs concrets." : "Week by week, watch your skin transform with concrete goals."}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sneak peek du rapport — riche */}
            <div className="hrf-preview-card">
              <div className="hrf-preview-inner">
                <div className="hrf-preview-top">
                  <span className="hrf-app-avatar" style={{ width: 30, height: 30, fontSize: 16 }}>L</span>
                  <div className="hrf-preview-top-text">
                    <div className="hrf-preview-name">Léa</div>
                    <div className="hrf-preview-sub">28 · {fr ? "peau mixte" : "combination"}</div>
                  </div>
                  <span className="hrf-preview-pill">{fr ? "Aperçu" : "Preview"}</span>
                </div>

                <div className="hrf-preview-gauge-wrap">
                  <div className="hrf-phone-gauge" style={{ width: 170, height: 170, margin: 0 }}>
                    <svg viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="hrf-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#E8C988" />
                          <stop offset="50%" stopColor="#C9A961" />
                          <stop offset="100%" stopColor="#A88947" />
                        </linearGradient>
                      </defs>
                      <g transform="rotate(-90 50 50)">
                        <g fill="#C9A961" opacity="0.45">
                          <circle cx="50" cy="3" r="0.8"/>
                          <circle cx="73.5" cy="9.3" r="0.5"/>
                          <circle cx="90.7" cy="26.5" r="0.5"/>
                          <circle cx="97" cy="50" r="0.8"/>
                          <circle cx="90.7" cy="73.5" r="0.5"/>
                          <circle cx="73.5" cy="90.7" r="0.5"/>
                          <circle cx="50" cy="97" r="0.8"/>
                          <circle cx="26.5" cy="90.7" r="0.5"/>
                          <circle cx="9.3" cy="73.5" r="0.5"/>
                          <circle cx="3" cy="50" r="0.8"/>
                        </g>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(201,169,97,0.14)" strokeWidth="5" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#hrf-grad2)" strokeWidth="5"
                          strokeDasharray="153.1 263.9" strokeLinecap="round" />
                      </g>
                    </svg>
                    <div className="hrf-phone-score">
                      <span className="n" style={{ fontSize: 56 }}>58</span>
                      <span className="d">/ 100</span>
                    </div>
                  </div>
                  <div className="hrf-preview-trajectory">
                    <div className="hrf-preview-traj-lbl">{fr ? "Objectif 8 sem." : "Target 8 wks"}</div>
                    <div className="hrf-preview-traj-val">
                      58 <span style={{ color: "#C9A961" }}>→</span> <strong>78</strong>
                    </div>
                    <div className="hrf-traj-bar" style={{ marginTop: 8 }}>
                      <div className="hrf-traj-fill"></div>
                      <div className="hrf-traj-dot from"></div>
                      <div className="hrf-traj-dot to"></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 18 }}>
                  <div className="hrf-prio-chip" style={{ borderLeftColor: "#D199AB" }}>
                    <div className="hrf-prio-chip-l">
                      <div className="hrf-prio-chip-z">{fr ? "Front · Nez" : "Forehead · Nose"}</div>
                      <div className="hrf-prio-chip-n">{fr ? "Pores dilatés" : "Enlarged pores"}</div>
                    </div>
                    <span className="hrf-prio-chip-a">Niacinamide</span>
                  </div>
                  <div className="hrf-prio-chip" style={{ borderLeftColor: "#D199AB" }}>
                    <div className="hrf-prio-chip-l">
                      <div className="hrf-prio-chip-z">{fr ? "Contour œil" : "Eye area"}</div>
                      <div className="hrf-prio-chip-n">{fr ? "Cernes marqués" : "Dark circles"}</div>
                    </div>
                    <span className="hrf-prio-chip-a">{fr ? "Caféine" : "Caffeine"}</span>
                  </div>
                  <div className="hrf-prio-chip" style={{ borderLeftColor: "#9AB5CE" }}>
                    <div className="hrf-prio-chip-l">
                      <div className="hrf-prio-chip-z">{fr ? "Joues" : "Cheeks"}</div>
                      <div className="hrf-prio-chip-n">{fr ? "Déshydratation" : "Dehydration"}</div>
                    </div>
                    <span className="hrf-prio-chip-a">{fr ? "Hyaluron." : "Hyaluron."}</span>
                  </div>
                </div>

                <div className="hrf-preview-stamp">
                  <span>✦ {fr ? "Rapport complet" : "Full report"}</span>
                  <span className="hrf-preview-stamp-price">7,99 €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ACT 5: RESULTS ═════════════════════════════════════════════ */}
      <div className="hrf-container">
        <div className="hrf-section hrf-center" id="results">
          <div className="hrf-eyebrow">{fr ? "Résultats" : "Results"}</div>
          <h2 className="hrf-h2">{fr ? <>Elles ont essayé. <em>Voici ce qui a changé.</em></> : <>They tried. <em>Here's what changed.</em></>}</h2>
          <div className="hrf-testimonials">
            <div className="hrf-tcard">
              <div className="hrf-tcard-stars">★★★★★</div>
              <p className="hrf-tcard-q">
                {fr
                  ? "« J'avais 54/100. Trois mois plus tard, 82. Enfin une routine pensée pour MA peau. »"
                  : "\"I was at 54/100. Three months later, 82. Finally a routine made for MY skin.\""}
              </p>
              <p className="hrf-tcard-a"><strong>Sarah</strong>, 28 {fr ? "ans" : "y/o"} · {fr ? "acné + taches" : "acne + spots"}</p>
            </div>
            <div className="hrf-tcard">
              <div className="hrf-tcard-stars">★★★★★</div>
              <p className="hrf-tcard-q">
                {fr
                  ? "« Le diagnostic m'a expliqué pourquoi mes produits aggravaient tout. Routine simplifiée, peau apaisée. »"
                  : "\"The diagnosis told me why my products were making it worse. Routine simplified, skin calmed.\""}
              </p>
              <p className="hrf-tcard-a"><strong>Marine</strong>, 34 {fr ? "ans" : "y/o"} · {fr ? "rougeurs + sensibilité" : "redness + sensitivity"}</p>
            </div>
            <div className="hrf-tcard">
              <div className="hrf-tcard-stars">★★★★★</div>
              <p className="hrf-tcard-q">
                {fr
                  ? "« Moins de 8€ pour comprendre ce qu'aucun dermato ne m'avait jamais expliqué. »"
                  : "\"Less than €8 to understand what no dermatologist had ever told me.\""}
              </p>
              <p className="hrf-tcard-a"><strong>Léa</strong>, 24 {fr ? "ans" : "y/o"} · {fr ? "pores + déshydratation" : "pores + dehydration"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ACT 6: PRICING ═════════════════════════════════════════════ */}
      <div className="hrf-container">
        <div className="hrf-section hrf-center" id="pricing">
          <div className="hrf-eyebrow">{fr ? "Transparence prix" : "Transparent pricing"}</div>
          <h2 className="hrf-h2">{fr ? <>Pas d'abonnement. <em>Jamais.</em></> : <>No subscription. <em>Ever.</em></>}</h2>
          <p className="hrf-lede">
            {fr
              ? "Une consultation dermato coûte 40 à 60€. Ton diagnostic IA personnalisé : 7,99€. Une fois. Accès à vie."
              : "A dermatology consult costs €40-60. Your personalized AI diagnosis: €7.99. Once. Lifetime access."}
          </p>
          <div className="hrf-pricing">
            <div className="hrf-plan">
              <div className="hrf-plan-name">{fr ? "Gratuit" : "Free"}</div>
              <div className="hrf-plan-tag">{fr ? "Pour commencer" : "To start"}</div>
              <div className="hrf-plan-price">0 €</div>
              <div className="hrf-plan-price-sub">{fr ? "Sans inscription" : "No signup"}</div>
              <ul className="hrf-plan-list">
                <li>{fr ? "Ton score global sur 100" : "Overall score out of 100"}</li>
                <li>{fr ? "3 métriques visibles" : "3 visible metrics"}</li>
                <li>{fr ? "Carte du visage simplifiée" : "Simplified face map"}</li>
                <li className="no">{fr ? "Routine sur-mesure" : "Custom routine"}</li>
                <li className="no">{fr ? "Plan 8 semaines" : "8-week plan"}</li>
                <li className="no">{fr ? "Rapport PDF" : "PDF report"}</li>
                <li className="no">{fr ? "Rescan dans 2 mois" : "Rescan in 2 months"}</li>
              </ul>
              <button className="hrf-plan-cta" onClick={onUploadClick}>
                {fr ? "Essayer gratuitement" : "Try for free"}
              </button>
            </div>
            <div className="hrf-plan featured">
              <div className="hrf-plan-badge">{fr ? "Le + populaire" : "Most popular"}</div>
              <div className="hrf-plan-name">{fr ? "Rapport complet" : "Full report"}</div>
              <div className="hrf-plan-tag">{fr ? "Paiement unique · accès à vie" : "One-time · lifetime"}</div>
              <div className="hrf-plan-price">7,99 €</div>
              <div className="hrf-plan-price-sub">{fr ? "Au lieu de 40-60€ (consult. dermato)" : "vs €40-60 (derm consult)"}</div>
              <ul className="hrf-plan-list">
                <li>{fr ? "Tout du plan gratuit" : "Everything in free"}</li>
                <li>{fr ? "8 métriques détaillées" : "8 detailed metrics"}</li>
                <li>{fr ? "Carte du visage complète" : "Full face map"}</li>
                <li>{fr ? "Routine matin & soir sur-mesure" : "Custom AM & PM routine"}</li>
                <li>{fr ? "Plan de progression 8 semaines" : "8-week progression plan"}</li>
                <li>{fr ? "Rapport PDF (5 pages)" : "PDF report (5 pages)"}</li>
                <li>{fr ? "Rescan dans 2 mois : ton évolution réelle" : "Rescan in 2 months: your real progress"}</li>
              </ul>
              <button className="hrf-plan-cta" onClick={onUploadClick}>
                {fr ? "Analyser ma peau" : "Analyze my skin"}
              </button>
            </div>
          </div>
          <div className="hrf-guarantee">
            <span>✓ {fr ? "Remboursé 7 jours si pas satisfaite" : "7-day money-back guarantee"}</span>
          </div>
        </div>
      </div>

      {/* ═══ QUOTE DIVIDER ═══════════════════════════════════════════════ */}
      <div className="hrf-container">
        <div className="hrf-quote-divider">
          <p className="hrf-quote-text">
            {fr ? (
              <>« Pour la première fois, j'ai compris <em>pourquoi</em> ma peau réagissait. Le diagnostic m'a évité 200€ de produits inutiles. »</>
            ) : (
              <>"For the first time, I understood <em>why</em> my skin reacted. The diagnosis saved me €200 of useless products."</>
            )}
          </p>
          <div className="hrf-quote-author">
            {fr ? "Claire · Bordeaux · ★★★★★" : "Claire · Bordeaux · ★★★★★"}
          </div>
        </div>
      </div>

      {/* ═══ FAQ ═════════════════════════════════════════════════════════ */}
      <div className="hrf-container">
        <div className="hrf-section hrf-center" id="faq">
          <div className="hrf-eyebrow">FAQ</div>
          <h2 className="hrf-h2">{fr ? <>Vos questions, <em>nos réponses.</em></> : <>Your questions, <em>our answers.</em></>}</h2>
          <div className="hrf-faq">
            {[
              {
                q: fr ? "L'analyse est-elle vraiment gratuite ?" : "Is the analysis really free?",
                a: fr
                  ? "Oui — tu obtiens ton score sur 100 et tes 3 priorités sans débourser un centime, sans inscription. Le rapport complet (8 métriques détaillées, routine sur-mesure, plan 8 semaines, PDF) est en option à 7,99€."
                  : "Yes — you get your score out of 100 and your 3 priorities without paying a cent, no signup needed. The full report (8 detailed metrics, custom routine, 8-week plan, PDF) is optional at €7.99."
              },
              {
                q: fr ? "Ma photo est-elle stockée ?" : "Is my photo stored?",
                a: fr
                  ? "Non. Ta photo transite par notre IA pour l'analyse puis est immédiatement supprimée. Aucun visage n'est conservé sur nos serveurs."
                  : "No. Your photo goes through our AI for analysis and is immediately deleted. No face is kept on our servers."
              },
              {
                q: fr ? "Comment l'IA fait-elle son diagnostic ?" : "How does the AI diagnose?",
                a: fr
                  ? "Notre IA analyse 8 dimensions cliniques (hydratation, pores, éclat, acné, taches, cernes, texture, rougeurs), croise les signaux avec un référentiel dermatologique, et identifie les causes réelles plutôt que les symptômes."
                  : "Our AI analyzes 8 clinical dimensions (hydration, pores, radiance, acne, dark spots, dark circles, texture, redness), cross-references signals with a dermatology framework, and identifies actual causes rather than symptoms."
              },
              {
                q: fr ? "Est-ce remboursé si je ne suis pas satisfaite ?" : "Is there a money-back guarantee?",
                a: fr
                  ? "Oui, 7 jours de garantie satisfait ou remboursé. Aucune question, aucun formulaire compliqué."
                  : "Yes, 7-day money-back guarantee. No questions, no complicated form."
              },
              {
                q: fr ? "Y a-t-il un abonnement ?" : "Is there a subscription?",
                a: fr
                  ? "Non, jamais. Un paiement unique de 7,99€ te donne accès à vie à ton rapport. Pas de prélèvement, pas de renouvellement automatique."
                  : "No, never. A single payment of €7.99 gives you lifetime access to your report. No recurring billing, no auto-renewal."
              },
              {
                q: fr ? "Est-ce que ça remplace une consultation dermato ?" : "Does it replace a dermatology consult?",
                a: fr
                  ? "Non — c'est un outil d'orientation, pas un diagnostic médical. Pour des conditions comme la rosacée, l'eczéma sévère ou l'acné kystique, nous t'invitons à consulter un dermatologue."
                  : "No — it's a guidance tool, not a medical diagnosis. For conditions like rosacea, severe eczema, or cystic acne, we recommend consulting a dermatologist."
              },
            ].map((item, idx) => (
              <div key={idx} className={`hrf-faq-item ${openFaq === idx ? "open" : ""}`}>
                <button className="hrf-faq-q" onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}>
                  <span>{item.q}</span>
                  <span className="hrf-faq-q-icon">+</span>
                </button>
                <div className="hrf-faq-a">
                  <div className="hrf-faq-a-inner">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ACT 7: FINAL CTA ════════════════════════════════════════════ */}
      <div className="hrf-container">
        <div className="hrf-final">
          <div className="hrf-final-ornament">✦</div>
          <h2 className="hrf-final-h">
            {fr ? (
              <>Découvre ce que ta peau<br /><em>essaie de te dire.</em></>
            ) : (
              <>Discover what your skin<br /><em>is trying to tell you.</em></>
            )}
          </h2>
          <p className="hrf-final-sub">
            {fr
              ? "30 secondes, une photo, et un vrai diagnostic. Gratuit, sans inscription."
              : "30 seconds, one photo, and a real diagnosis. Free, no signup."}
          </p>
          <button className="hrf-cta-primary" onClick={onUploadClick} style={{ padding: "20px 36px", fontSize: 14 }}>
            <span className="star">✦</span>
            {fr ? "Analyser ma peau gratuitement" : "Analyze my skin for free"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
