import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useLang } from '../lib/LangContext';

/* ════════════════════════════════════════════════════════════════════════
   /technologie — Nouvelle DA éditoriale
   ════════════════════════════════════════════════════════════════════════ */

const COPY = {
  fr: {
    metaTitle: "Notre technologie — Rate My Skin",
    metaDesc: "Comment notre IA dermatologique analyse 8 dimensions de la peau en 30 secondes. Une méthode fondée sur l'imagerie clinique et la science de la peau.",
    eyebrow: "Notre technologie",
    title: "L'IA qui ",
    titleEm: "comprend",
    titleEnd: " ta peau.",
    sub: "Un référentiel dermatologique embarqué, 8 dimensions analysées, et un diagnostic en clair — pas un score abstrait.",

    methodEyebrow: "La méthode",
    methodTitle: "3 étapes, 30 ",
    methodTitleEm: "secondes",
    methodSteps: [
      { num: '01', title: "Capture haute fidélité", desc: "Une photo classique de ton smartphone suffit. L'IA détecte automatiquement la qualité, l'éclairage et le cadrage." },
      { num: '02', title: "Analyse multi-dimensionnelle", desc: "8 dimensions cliniques évaluées simultanément : hydratation, pores, éclat, acné, taches, cernes, texture, rougeurs." },
      { num: '03', title: "Synthèse en clair", desc: "Pas de jargon. Un score sur 100, 3 priorités expliquées, une routine sur-mesure et un plan de progression." },
    ],

    dimEyebrow: "Ce que l'IA détecte",
    dimTitle: "8 dimensions, 1 ",
    dimTitleEm: "écosystème",
    dimSub: "Chaque dimension est mesurée indépendamment, puis croisée avec les autres pour révéler les causes profondes.",
    dimensions: [
      { label: "Hydratation", desc: "Évalue la teneur en eau de la couche cornée via la diffusion lumineuse.", method: "Spectro-colorimétrie" },
      { label: "Pores", desc: "Quantifie le diamètre et la densité des pores visibles sur la zone T.", method: "Détection contours" },
      { label: "Éclat", desc: "Mesure la luminosité moyenne du teint et la régularité chromatique.", method: "Analyse espace L*a*b*" },
      { label: "Acné", desc: "Identifie les imperfections actives (boutons, points noirs, microkystes).", method: "Classification visuelle" },
      { label: "Taches", desc: "Détecte les zones d'hyperpigmentation et leur étendue.", method: "Cartographie mélanique" },
      { label: "Cernes", desc: "Évalue la coloration et le volume sous-orbital.", method: "Analyse péri-oculaire" },
      { label: "Texture", desc: "Quantifie la rugosité et l'uniformité du grain de peau.", method: "Micro-relief" },
      { label: "Rougeurs", desc: "Mesure l'intensité et la diffusion des zones érythémateuses.", method: "Détection hémoglobine" },
    ],

    scienceEyebrow: "Pourquoi nous croire",
    scienceTitle: "Une méthode ",
    scienceTitleEm: "transparente",
    scienceItems: [
      { title: "Référentiel dermatologique", desc: "Notre IA est entraînée sur un dataset de plus de 200 000 visages annotés par des dermatologues, reflétant la diversité des phototypes Fitzpatrick I à VI." },
      { title: "Pas une boîte noire", desc: "Chaque score est justifié par les observations visuelles (« forte densité de pores zone nasale ») et reliable à une action concrète." },
      { title: "Photos jamais stockées", desc: "Ton image transite uniquement pour l'analyse. Aucune donnée biométrique n'est conservée sur nos serveurs après le diagnostic." },
      { title: "Calibré dans le temps", desc: "Le modèle est ré-évalué chaque trimestre avec un comité dermato pour éviter les dérives et garder une précision constante." },
    ],

    limitsEyebrow: "Honnêteté",
    limitsTitle: "Ce que nous ne ",
    limitsTitleEm: "remplaçons pas",
    limitsBody: "Notre outil est un guide de soin quotidien, fondé sur l'observation visuelle. Pour une condition médicale active — rosacée sévère, eczéma persistant, acné kystique, mélanome suspect — consulte un dermatologue. Aucune IA ne remplace un examen clinique.",

    ctaTitle: "Prête à découvrir ta peau ",
    ctaTitleEm: "vraiment",
    ctaTitleEnd: " ?",
    ctaBtn: "Analyser ma peau gratuitement",
    ctaSub: "30 secondes · sans inscription · photos jamais stockées",
  },
  en: {
    metaTitle: "Our technology — Rate My Skin",
    metaDesc: "How our dermatology AI analyzes 8 skin dimensions in 30 seconds. A method grounded in clinical imaging and skin science.",
    eyebrow: "Our technology",
    title: "The AI that ",
    titleEm: "understands",
    titleEnd: " your skin.",
    sub: "An embedded dermatology benchmark, 8 dimensions analyzed, and a plain-language diagnosis — not an abstract score.",

    methodEyebrow: "The method",
    methodTitle: "3 steps, 30 ",
    methodTitleEm: "seconds",
    methodSteps: [
      { num: '01', title: "High-fidelity capture", desc: "A standard smartphone photo is enough. The AI auto-detects quality, lighting and framing." },
      { num: '02', title: "Multi-dimensional analysis", desc: "8 clinical dimensions evaluated simultaneously: hydration, pores, radiance, acne, dark spots, dark circles, texture, redness." },
      { num: '03', title: "Plain-language summary", desc: "No jargon. A score out of 100, 3 explained priorities, a tailored routine and a progression plan." },
    ],

    dimEyebrow: "What the AI detects",
    dimTitle: "8 dimensions, 1 ",
    dimTitleEm: "ecosystem",
    dimSub: "Each dimension is measured independently, then cross-referenced with others to reveal root causes.",
    dimensions: [
      { label: "Hydration", desc: "Estimates water content of the stratum corneum via light diffusion.", method: "Spectrocolorimetry" },
      { label: "Pores", desc: "Quantifies diameter and density of visible pores on the T-zone.", method: "Edge detection" },
      { label: "Radiance", desc: "Measures average complexion luminosity and chromatic uniformity.", method: "L*a*b* space analysis" },
      { label: "Acne", desc: "Identifies active blemishes (papules, blackheads, microcysts).", method: "Visual classification" },
      { label: "Dark spots", desc: "Detects hyperpigmented zones and their extent.", method: "Melanic mapping" },
      { label: "Dark circles", desc: "Evaluates coloration and volume in the sub-orbital area.", method: "Peri-ocular analysis" },
      { label: "Texture", desc: "Quantifies roughness and uniformity of the skin grain.", method: "Micro-relief" },
      { label: "Redness", desc: "Measures intensity and diffusion of erythematous zones.", method: "Hemoglobin detection" },
    ],

    scienceEyebrow: "Why trust us",
    scienceTitle: "A ",
    scienceTitleEm: "transparent",
    scienceItems: [
      { title: "Dermatology benchmark", desc: "Our AI is trained on a dataset of 200,000+ faces annotated by dermatologists, covering Fitzpatrick phototypes I to VI." },
      { title: "Not a black box", desc: "Every score is justified by visual observations (\"high pore density in nose area\") and tied to a concrete action." },
      { title: "Photos never stored", desc: "Your image is only processed for analysis. No biometric data is kept on our servers afterwards." },
      { title: "Continuously calibrated", desc: "The model is re-evaluated every quarter with a dermatology panel to prevent drift and maintain precision." },
    ],

    limitsEyebrow: "Honesty",
    limitsTitle: "What we ",
    limitsTitleEm: "don't replace",
    limitsBody: "Our tool is a daily skincare guide, grounded in visual observation. For an active medical condition — severe rosacea, persistent eczema, cystic acne, suspect melanoma — consult a dermatologist. No AI replaces a clinical exam.",

    ctaTitle: "Ready to ",
    ctaTitleEm: "truly understand",
    ctaTitleEnd: " your skin?",
    ctaBtn: "Analyze my skin for free",
    ctaSub: "30 seconds · no signup · photos never stored",
  },
};

export default function Technologie() {
  const { lang } = useLang();
  const router = useRouter();
  const t = COPY[lang === 'fr' ? 'fr' : 'en'];
  const fr = lang === 'fr';

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="canonical" href="https://ratemyskin.co/technologie" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ratemyskin.co/technologie" />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDesc} />
        <meta property="og:image" content="https://ratemyskin.co/og-image.png" />
      </Head>

      <NavBar />

      <style jsx global>{`
        .tech-root {
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,181,116,0.10) 0%, transparent 60%),
            linear-gradient(180deg, #FBF6EE 0%, #F8F1E5 50%, #F5EBDB 100%);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #2C2416;
          padding-bottom: 100px;
        }
        .tech-wrap { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
        .tech-section { padding: clamp(56px, 8vw, 96px) 0; position: relative; }
        .tech-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #C9A961;
          margin-bottom: 16px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .tech-eyebrow::before, .tech-eyebrow::after {
          content: "";
          width: 28px; height: 1px;
          background: linear-gradient(90deg, transparent, #C9A961, transparent);
        }
        .tech-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 7vw, 72px);
          font-weight: 400;
          color: #2C2416;
          line-height: 1.02;
          letter-spacing: -0.02em;
          margin: 0 0 22px;
        }
        .tech-h1 em { font-style: italic; color: #B0885E; font-weight: 400; }
        .tech-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 400;
          color: #2C2416;
          line-height: 1.05;
          letter-spacing: -0.015em;
          margin: 0 0 18px;
        }
        .tech-h2 em { font-style: italic; color: #B0885E; }
        .tech-lede {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(17px, 2vw, 21px);
          color: #5C4A3A;
          line-height: 1.55;
          margin: 0 auto 36px;
          max-width: 640px;
        }
        .tech-center { text-align: center; }

        /* Hero */
        .tech-hero {
          padding: clamp(60px, 9vw, 120px) 0 clamp(40px, 6vw, 72px);
          text-align: center;
        }

        /* Method steps */
        .tech-method-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(20px, 3vw, 36px);
          margin-top: 48px;
        }
        @media (max-width: 880px) {
          .tech-method-grid { grid-template-columns: 1fr; }
        }
        .tech-step {
          text-align: center;
          padding: 28px 22px;
          background: linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 22px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 30px rgba(168,116,73,0.05);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tech-step:hover {
          transform: translateY(-4px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 18px 40px rgba(168,116,73,0.08);
        }
        .tech-step-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px;
          font-style: italic;
          color: #C9A961;
          opacity: 0.55;
          line-height: 1;
          margin-bottom: 14px;
        }
        .tech-step-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          color: #2C2416;
          margin-bottom: 10px;
          letter-spacing: -0.005em;
        }
        .tech-step-desc {
          font-size: 14px;
          color: #5C4A3A;
          line-height: 1.6;
        }

        /* Dimensions grid */
        .tech-dim-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-top: 36px;
        }
        @media (max-width: 720px) { .tech-dim-grid { grid-template-columns: 1fr; } }
        .tech-dim {
          background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(253,250,244,0.5) 100%);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 16px;
          padding: 20px 22px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: all 0.25s;
        }
        .tech-dim:hover {
          background: linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border-color: rgba(201,169,97,0.32);
          transform: translateX(4px);
        }
        .tech-dim-num {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(201,169,97,0.2) 0%, rgba(201,169,97,0.06) 100%);
          border: 1px solid rgba(201,169,97,0.3);
          color: #8B6E26;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .tech-dim-body { flex: 1; min-width: 0; }
        .tech-dim-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 500;
          color: #2C2416;
          margin-bottom: 4px;
          letter-spacing: -0.005em;
        }
        .tech-dim-desc {
          font-size: 13px;
          color: #5C4A3A;
          line-height: 1.55;
          margin-bottom: 8px;
        }
        .tech-dim-method {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #B0885E;
          background: rgba(201,169,97,0.1);
          border-radius: 100px;
          padding: 3px 10px;
        }

        /* Science cards */
        .tech-sci-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 36px;
        }
        @media (max-width: 720px) { .tech-sci-grid { grid-template-columns: 1fr; } }
        .tech-sci {
          background:
            radial-gradient(ellipse at top right, rgba(201,169,97,0.06), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 22px;
          padding: 28px 26px;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 32px rgba(168,116,73,0.05);
        }
        .tech-sci::before {
          content: "";
          position: absolute;
          top: -1px; left: 24px;
          width: 36px; height: 2px;
          background: linear-gradient(90deg, #C9A961, transparent);
        }
        .tech-sci-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          color: #2C2416;
          margin-bottom: 10px;
          letter-spacing: -0.005em;
        }
        .tech-sci-desc {
          font-size: 14px;
          color: #5C4A3A;
          line-height: 1.65;
        }

        /* Honesty card */
        .tech-limits {
          margin: 0 auto;
          max-width: 760px;
          padding: 32px clamp(24px, 4vw, 40px);
          background:
            radial-gradient(ellipse at top, rgba(122,174,152,0.08), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #F4F8F2 100%);
          border: 1px solid rgba(122,174,152,0.28);
          border-radius: 24px;
          text-align: center;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 16px 40px rgba(77,140,118,0.06);
        }
        .tech-limits-body {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 17px;
          color: #2C2416;
          line-height: 1.6;
          margin: 0;
        }
        .tech-limits .tech-eyebrow { color: #4D8C76; }
        .tech-limits .tech-eyebrow::before, .tech-limits .tech-eyebrow::after {
          background: linear-gradient(90deg, transparent, #7AAE98, transparent);
        }
        .tech-limits .tech-h2 em { color: #4D8C76; }

        /* CTA */
        .tech-cta {
          text-align: center;
          padding: clamp(64px, 10vw, 120px) 0 0;
        }
        .tech-cta-h {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5.5vw, 56px);
          font-weight: 400;
          line-height: 1.05;
          color: #2C2416;
          margin: 0 auto 28px;
          max-width: 720px;
          letter-spacing: -0.015em;
        }
        .tech-cta-h em { font-style: italic; color: #B0885E; }
        .tech-cta-btn {
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
          box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 14px 32px rgba(44,36,22,0.28);
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .tech-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 1px 0 rgba(255,255,255,0.18) inset, 0 18px 40px rgba(44,36,22,0.34); }
        .tech-cta-btn .star { color: #C9A961; font-size: 12px; }
        .tech-cta-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: #8A7A6B;
          margin-top: 14px;
        }

        /* Face visual */
        .tech-face-visual {
          width: 280px;
          height: 320px;
          margin: 0 auto 40px;
          position: relative;
        }
        .tech-face-visual svg { width: 100%; height: 100%; }
        .tech-face-pulse {
          position: absolute;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #C9A961;
          opacity: 0.6;
          animation: tech-pulse 2.5s ease-in-out infinite;
        }
        @keyframes tech-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; box-shadow: 0 0 0 0 rgba(201,169,97,0.4); }
          50% { transform: scale(1.15); opacity: 0.9; box-shadow: 0 0 0 12px rgba(201,169,97,0); }
        }
      `}</style>

      <div className="tech-root">

        {/* HERO */}
        <div className="tech-wrap">
          <div className="tech-hero">
            <div style={{ color: '#C9A961', fontSize: 14, opacity: 0.7, marginBottom: 14 }}>✦</div>
            <div className="tech-eyebrow">{t.eyebrow}</div>
            <h1 className="tech-h1">
              {t.title}<em>{t.titleEm}</em>{t.titleEnd}
            </h1>
            <p className="tech-lede">{t.sub}</p>

            {/* Face visual with pulsing scan points */}
            <div className="tech-face-visual">
              <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="tech-face-shade" cx="50%" cy="42%" r="58%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#F5EBDB" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <path
                  d="M 100 28 C 80 28, 64 48, 60 76 C 56 106, 60 136, 70 162 C 78 184, 88 206, 100 218 C 112 206, 122 184, 130 162 C 140 136, 144 106, 140 76 C 136 48, 120 28, 100 28 Z"
                  fill="url(#tech-face-shade)" stroke="#C9A961" strokeWidth="1.3" opacity="0.9"
                />
                <path d="M 68 84 Q 76 80 84 84" stroke="#C9A961" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" />
                <path d="M 116 84 Q 124 80 132 84" stroke="#C9A961" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" />
                <path d="M 68 98 Q 76 93 84 98 Q 76 103 68 98 Z" fill="#C9A961" opacity="0.45" />
                <path d="M 116 98 Q 124 93 132 98 Q 124 103 116 98 Z" fill="#C9A961" opacity="0.45" />
                <circle cx="76" cy="98" r="1.2" fill="#5C4A3A" opacity="0.6" />
                <circle cx="124" cy="98" r="1.2" fill="#5C4A3A" opacity="0.6" />
                <path d="M 100 108 L 100 132 Q 100 138 96 140 M 100 140 Q 104 138 104 140" fill="none" stroke="#C9A961" strokeWidth="0.9" opacity="0.42" strokeLinecap="round" />
                <path d="M 86 158 Q 100 154 114 158" stroke="#C9A961" strokeWidth="0.9" fill="none" opacity="0.45" strokeLinecap="round" />
                <path d="M 88 158 Q 100 165 112 158" stroke="#C9A961" strokeWidth="0.7" fill="none" opacity="0.28" strokeLinecap="round" />
              </svg>
              {/* Pulsing scan dots */}
              <div className="tech-face-pulse" style={{ top: "24%", left: "47%", animationDelay: "0s" }}></div>
              <div className="tech-face-pulse" style={{ top: "42%", left: "32%", animationDelay: "0.4s" }}></div>
              <div className="tech-face-pulse" style={{ top: "42%", left: "62%", animationDelay: "0.8s" }}></div>
              <div className="tech-face-pulse" style={{ top: "55%", left: "30%", animationDelay: "1.2s" }}></div>
              <div className="tech-face-pulse" style={{ top: "55%", left: "65%", animationDelay: "1.6s" }}></div>
              <div className="tech-face-pulse" style={{ top: "76%", left: "47%", animationDelay: "2s" }}></div>
            </div>
          </div>
        </div>

        {/* METHOD */}
        <div className="tech-wrap">
          <div className="tech-section tech-center">
            <div className="tech-eyebrow">{t.methodEyebrow}</div>
            <h2 className="tech-h2">{t.methodTitle}<em>{t.methodTitleEm}</em></h2>
            <div className="tech-method-grid">
              {t.methodSteps.map((step, i) => (
                <div key={i} className="tech-step">
                  <div className="tech-step-num">{step.num}</div>
                  <h3 className="tech-step-title">{step.title}</h3>
                  <p className="tech-step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DIMENSIONS */}
        <div className="tech-wrap">
          <div className="tech-section tech-center">
            <div className="tech-eyebrow">{t.dimEyebrow}</div>
            <h2 className="tech-h2">{t.dimTitle}<em>{t.dimTitleEm}</em></h2>
            <p className="tech-lede">{t.dimSub}</p>
            <div className="tech-dim-grid" style={{ textAlign: "left" }}>
              {t.dimensions.map((d, i) => (
                <div key={i} className="tech-dim">
                  <div className="tech-dim-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="tech-dim-body">
                    <div className="tech-dim-label">{d.label}</div>
                    <p className="tech-dim-desc">{d.desc}</p>
                    <span className="tech-dim-method">{d.method}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SCIENCE / TRUST */}
        <div className="tech-wrap">
          <div className="tech-section tech-center">
            <div className="tech-eyebrow">{t.scienceEyebrow}</div>
            <h2 className="tech-h2">{t.scienceTitle}<em>{t.scienceTitleEm}</em></h2>
            <div className="tech-sci-grid" style={{ textAlign: "left" }}>
              {t.scienceItems.map((s, i) => (
                <div key={i} className="tech-sci">
                  <h3 className="tech-sci-title">{s.title}</h3>
                  <p className="tech-sci-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HONESTY / LIMITS */}
        <div className="tech-wrap">
          <div className="tech-section">
            <div className="tech-limits">
              <div className="tech-eyebrow">{t.limitsEyebrow}</div>
              <h2 className="tech-h2">{t.limitsTitle}<em>{t.limitsTitleEm}</em></h2>
              <p className="tech-limits-body">{t.limitsBody}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="tech-wrap">
          <div className="tech-cta">
            <div style={{ color: '#C9A961', fontSize: 16, marginBottom: 18 }}>✦</div>
            <h2 className="tech-cta-h">
              {t.ctaTitle}<em>{t.ctaTitleEm}</em>{t.ctaTitleEnd}
            </h2>
            <button className="tech-cta-btn" onClick={() => router.push('/')}>
              <span className="star">✦</span>
              {t.ctaBtn}
            </button>
            <p className="tech-cta-sub">{t.ctaSub}</p>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
