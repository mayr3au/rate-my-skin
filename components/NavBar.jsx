import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useLang } from "../lib/LangContext";

/* ════════════════════════════════════════════════════════════════════════
   NavBar — header partagé entre toutes les pages (nouvelle DA)
   ════════════════════════════════════════════════════════════════════════ */

export default function NavBar({ ctaLabel, ctaHref = "/", ctaOnClick }) {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest(".nbr-menu-wrap")) setOpenMenu(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const fr = lang === "fr";
  const onCTA = () => {
    if (ctaOnClick) ctaOnClick();
    else router.push(ctaHref);
  };

  return (
    <>
      <style jsx global>{`
        .nbr-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          background: rgba(251,246,238,0.94);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(201,169,97,0.16);
          transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .nbr-nav.scrolled {
          background: rgba(251,246,238,0.97);
          box-shadow: 0 8px 24px rgba(94,71,47,0.06);
        }
        .nbr-nav-left, .nbr-nav-right {
          display: flex;
          align-items: center;
          gap: 18px;
          flex: 1;
        }
        .nbr-nav-right { justify-content: flex-end; }
        .nbr-logo {
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
          cursor: pointer;
          background: none;
          border: none;
        }
        .nbr-logo em { font-style: italic; font-weight: 400; }
        .nbr-logo .star { color: #C9A961; font-size: 15px; }

        .nbr-lang {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          color: #B0885E;
          letter-spacing: 0.08em;
          font-weight: 600;
        }
        .nbr-lang button {
          background: none;
          border: none;
          font: inherit;
          color: inherit;
          letter-spacing: inherit;
          padding: 2px 4px;
          cursor: pointer;
        }
        .nbr-lang .sep { color: rgba(201,169,97,0.5); margin: 0 4px; }

        .nbr-nav-links { display: flex; gap: 24px; align-items: center; }
        .nbr-nav-link {
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
        .nbr-nav-link::after {
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
        .nbr-nav-link:hover { color: #2C2416; }
        .nbr-nav-link:hover::after { width: 100%; }
        .nbr-nav-link .chev { font-size: 9px; color: #C9A961; transition: transform 0.25s; }
        .nbr-nav-link.open .chev { transform: rotate(180deg); }
        .nbr-nav-link.open { color: #2C2416; }

        .nbr-menu-wrap { position: relative; }
        .nbr-menu {
          position: absolute;
          top: calc(100% + 14px);
          left: 50%;
          transform: translateX(-50%) translateY(-6px);
          min-width: 240px;
          background: linear-gradient(135deg, #FBF6EE 0%, #F5EBDB 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 20px 48px rgba(94,71,47,0.16);
          opacity: 0;
          pointer-events: none;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 110;
        }
        .nbr-menu.open { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
        .nbr-menu::before {
          content: "";
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 10px; height: 10px;
          background: #FBF6EE;
          border-top: 1px solid rgba(201,169,97,0.22);
          border-left: 1px solid rgba(201,169,97,0.22);
        }
        .nbr-menu-item {
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
        .nbr-menu-item:hover { background: rgba(201,169,97,0.1); }
        .nbr-menu-icon {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(201,169,97,0.18) 0%, rgba(201,169,97,0.06) 100%);
          border: 1px solid rgba(201,169,97,0.22);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #8B6E26;
        }
        .nbr-menu-icon svg { width: 16px; height: 16px; }
        .nbr-menu-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .nbr-menu-title {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 500;
          color: #2C2416;
          letter-spacing: -0.005em;
          line-height: 1.2;
        }
        .nbr-menu-desc { display: block; font-size: 11px; color: #8A7A6B; line-height: 1.4; }

        .nbr-nav-cta {
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
        .nbr-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(44,36,22,0.24); }
        .nbr-nav-cta .star { color: #C9A961; font-size: 10px; }

        .nbr-account {
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
          transition: all 0.22s;
        }
        .nbr-account:hover { background: rgba(201,169,97,0.16); color: #2C2416; transform: translateY(-1px); }
        .nbr-account svg { width: 18px; height: 18px; display: block; }
        @media (max-width: 640px) {
          .nbr-account { width: 34px; height: 34px; }
          .nbr-account svg { width: 16px; height: 16px; }
        }

        .nbr-burger {
          display: none;
          background: none;
          border: 1px solid rgba(201,169,97,0.25);
          border-radius: 100px;
          padding: 8px 10px;
          cursor: pointer;
          color: #2C2416;
        }
        .nbr-burger svg { width: 18px; height: 18px; display: block; }
        @media (max-width: 880px) {
          .nbr-nav-links { display: none; }
          .nbr-nav-cta { display: none; }
          .nbr-burger { display: inline-flex; }
        }
        @media (max-width: 640px) {
          .nbr-nav { padding: 8px 14px; }
          .nbr-nav-left, .nbr-nav-right { gap: 10px; }
          .nbr-logo { font-size: 19px; padding: 0; gap: 4px; }
          .nbr-logo .star { font-size: 12px; }
          .nbr-lang { font-size: 10px; }
          .nbr-burger { padding: 6px 8px; }
          .nbr-burger svg { width: 16px; height: 16px; }
        }

        .nbr-mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(44,36,22,0.4);
          backdrop-filter: blur(4px);
          z-index: 199;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .nbr-mobile-backdrop.open { opacity: 1; pointer-events: auto; }
        .nbr-mobile-drawer {
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
          font-family: 'DM Sans', sans-serif;
        }
        .nbr-mobile-drawer.open { transform: translateX(0); }
        .nbr-mobile-close {
          position: absolute; top: 18px; right: 18px;
          background: none; border: none;
          font-size: 20px; color: #8A7A6B; cursor: pointer;
        }
        .nbr-mobile-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #2C2416; margin-bottom: 18px; }
      `}</style>

      <div className={`nbr-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nbr-nav-left">
          <span className="nbr-lang">
            <button onClick={() => setLang("en")} style={{ opacity: fr ? 0.4 : 1 }}>EN</button>
            <span className="sep">|</span>
            <button onClick={() => setLang("fr")} style={{ opacity: fr ? 1 : 0.4, color: "#2C2416" }}>FR</button>
          </span>
        </div>
        <button className="nbr-logo" onClick={() => router.push("/")}>
          RateMy <span className="star">✦</span> <em>Skin</em>
        </button>
        <div className="nbr-nav-right">
          <div className="nbr-nav-links">

            <div className="nbr-menu-wrap">
              <button
                className={`nbr-nav-link ${openMenu === "discover" ? "open" : ""}`}
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "discover" ? null : "discover"); }}
              >
                {fr ? "Découvrir" : "Discover"}
                <span className="chev">▾</span>
              </button>
              <div className={`nbr-menu ${openMenu === "discover" ? "open" : ""}`}>
                <a href="/#how" className="nbr-menu-item">
                  <span className="nbr-menu-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg></span>
                  <span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Comment ça marche" : "How it works"}</span><span className="nbr-menu-desc">{fr ? "Scan, IA, plan — en 3 étapes" : "Scan, AI, plan — in 3 steps"}</span></span>
                </a>
                <a href="/#results" className="nbr-menu-item">
                  <span className="nbr-menu-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" /></svg></span>
                  <span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Résultats" : "Results"}</span><span className="nbr-menu-desc">{fr ? "Témoignages & avant / après" : "Testimonials & before / after"}</span></span>
                </a>
                <a href="/#pricing" className="nbr-menu-item">
                  <span className="nbr-menu-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="4" x2="12" y2="20" /></svg></span>
                  <span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Prix" : "Pricing"}</span><span className="nbr-menu-desc">{fr ? "Gratuit ou 7,99€ — pas d'abonnement" : "Free or €7.99 — no subscription"}</span></span>
                </a>
                <a href="/#faq" className="nbr-menu-item">
                  <span className="nbr-menu-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" /><circle cx="12" cy="17" r="0.5" fill="currentColor" /></svg></span>
                  <span className="nbr-menu-body"><span className="nbr-menu-title">FAQ</span><span className="nbr-menu-desc">{fr ? "Sécurité, garantie, fonctionnement" : "Privacy, guarantee, how it works"}</span></span>
                </a>
              </div>
            </div>

            <div className="nbr-menu-wrap">
              <button
                className={`nbr-nav-link ${openMenu === "resources" ? "open" : ""}`}
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "resources" ? null : "resources"); }}
              >
                {fr ? "Ressources" : "Resources"}
                <span className="chev">▾</span>
              </button>
              <div className={`nbr-menu ${openMenu === "resources" ? "open" : ""}`}>
                <a href="/blog" className="nbr-menu-item">
                  <span className="nbr-menu-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="14" y2="13" /></svg></span>
                  <span className="nbr-menu-body"><span className="nbr-menu-title">Blog</span><span className="nbr-menu-desc">{fr ? "Conseils skincare et études" : "Skincare tips and studies"}</span></span>
                </a>
                <a href="/technologie" className="nbr-menu-item">
                  <span className="nbr-menu-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg></span>
                  <span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Technologie" : "Technology"}</span><span className="nbr-menu-desc">{fr ? "Notre IA dermatologique" : "Our dermatology AI"}</span></span>
                </a>
                <a href="/mes-rapports" className="nbr-menu-item">
                  <span className="nbr-menu-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /></svg></span>
                  <span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Mes rapports" : "My reports"}</span><span className="nbr-menu-desc">{fr ? "Retrouve tes analyses précédentes" : "Access your previous analyses"}</span></span>
                </a>
                <a href="/compte" className="nbr-menu-item">
                  <span className="nbr-menu-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg></span>
                  <span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Mon compte" : "My account"}</span><span className="nbr-menu-desc">{fr ? "Connexion Google · suivi & rescan" : "Google sign-in · tracking & rescan"}</span></span>
                </a>
              </div>
            </div>

          </div>
          <button
            className="nbr-account"
            onClick={() => router.push("/compte")}
            aria-label={fr ? "Mon compte" : "My account"}
            title={fr ? "Mon compte" : "My account"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>
          </button>
          <button className="nbr-nav-cta" onClick={onCTA}>
            <span className="star">✦</span>
            {ctaLabel || (fr ? "Analyser" : "Analyze")}
          </button>
          <button className="nbr-burger" onClick={() => setMobileNavOpen(true)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`nbr-mobile-backdrop ${mobileNavOpen ? "open" : ""}`} onClick={() => setMobileNavOpen(false)}></div>
      <div className={`nbr-mobile-drawer ${mobileNavOpen ? "open" : ""}`}>
        <button className="nbr-mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Fermer">✕</button>
        <div className="nbr-mobile-title">Menu</div>
        <a href="/" className="nbr-menu-item"><span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Accueil" : "Home"}</span></span></a>
        <a href="/#how" className="nbr-menu-item"><span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Comment ça marche" : "How it works"}</span></span></a>
        <a href="/#results" className="nbr-menu-item"><span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Résultats" : "Results"}</span></span></a>
        <a href="/#pricing" className="nbr-menu-item"><span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Prix" : "Pricing"}</span></span></a>
        <a href="/#faq" className="nbr-menu-item"><span className="nbr-menu-body"><span className="nbr-menu-title">FAQ</span></span></a>
        <div style={{ height: 1, background: "rgba(201,169,97,0.2)", margin: "12px 0" }}></div>
        <a href="/blog" className="nbr-menu-item"><span className="nbr-menu-body"><span className="nbr-menu-title">Blog</span></span></a>
        <a href="/technologie" className="nbr-menu-item"><span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Technologie" : "Technology"}</span></span></a>
        <a href="/mes-rapports" className="nbr-menu-item"><span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Mes rapports" : "My reports"}</span></span></a>
        <a href="/compte" className="nbr-menu-item"><span className="nbr-menu-body"><span className="nbr-menu-title">{fr ? "Mon compte" : "My account"}</span></span></a>
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <button className="nbr-nav-cta" onClick={() => { setMobileNavOpen(false); onCTA(); }} style={{ display: "flex", width: "100%", justifyContent: "center", padding: "14px", margin: 0 }}>
            <span className="star">✦</span>
            {ctaLabel || (fr ? "Analyser ma peau" : "Analyze my skin")}
          </button>
        </div>
      </div>
    </>
  );
}
