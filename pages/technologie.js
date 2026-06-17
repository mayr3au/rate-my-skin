import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '../components/Logo';
import { useLang } from '../lib/LangContext';

const GOLD = '#C9A961';
const WARM = '#2C2416';
const LIGHT_BG = '#F8F4ED';
const SURFACE = '#FFFFFF';
const BORDER = '#E8DCC5';
const TEXT_SEC = '#7A6A55';
const HOVER_BG = '#F0EAE0';

// SVGs for "Comment ça marche"
const PhotoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="12" cy="12" r="4" />
    <line x1="19" y1="5" x2="19" y2="5.01" />
  </svg>
);

const ScanIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="11" x2="20" y2="11" />
    <line x1="4" y1="16" x2="20" y2="16" />
    <line x1="4" y1="21" x2="20" y2="21" />
    <circle cx="12" cy="11" r="2.5" fill={GOLD} className="scan-dot" />
  </svg>
);

const ReportIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="17" x2="13" y2="17" />
    <polyline points="15 16 17 18 20 14" />
  </svg>
);

// SVGs for "Ce que vous recevez"
const GaugeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
    <path d="M12 2a10 10 0 0 1 7.54 16.59" />
    <path d="M12 2a10 10 0 0 0-7.54 16.59" />
    <line x1="12" y1="14" x2="15" y2="9" />
    <circle cx="12" cy="14" r="1.5" fill={GOLD} />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
    <line x1="19.07" y1="4.93" x2="17.66" y2="6.34" />
  </svg>
);

const TimelineIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
    <line x1="8" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="20" y2="12" />
    <line x1="8" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6" r="2" fill={GOLD} />
    <circle cx="4" cy="12" r="2" fill={GOLD} />
    <circle cx="4" cy="18" r="2" fill={GOLD} />
  </svg>
);

const MoleculeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
    <polygon points="12 2 22 8 22 18 12 24 2 18 2 8" />
    <line x1="12" y1="2" x2="12" y2="10" />
    <line x1="2" y1="18" x2="12" y2="13" />
    <line x1="22" y1="18" x2="12" y2="13" />
    <circle cx="12" cy="10" r="1.5" fill={GOLD} />
    <circle cx="12" cy="13" r="1.5" fill={GOLD} />
  </svg>
);

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
              fontFamily: "'Inter', sans-serif",
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

export default function NotreTechnologie() {
  const { lang, t } = useLang();
  const [activeMetric, setActiveMetric] = useState('hydration');

  const containerRef = useRef(null);
  const dotRefs = {
    hydration: useRef(null),
    sebum: useRef(null),
    texture: useRef(null),
    pigmentation: useRef(null),
    redness: useRef(null)
  };
  const cardRefs = {
    hydration: useRef(null),
    sebum: useRef(null),
    texture: useRef(null),
    pigmentation: useRef(null),
    redness: useRef(null)
  };

  const [allCoords, setAllCoords] = useState({});

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  useEffect(() => {
    const updateAllLines = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newCoords = {};

      Object.keys(dots).forEach((key) => {
        const dot = dotRefs[key]?.current;
        const card = cardRefs[key]?.current;
        if (dot && card) {
          const dotRect = dot.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();

          const x1 = dotRect.left + dotRect.width / 2 - containerRect.left;
          const y1 = dotRect.top + dotRect.height / 2 - containerRect.top;
          const x2 = cardRect.left - containerRect.left;
          const y2 = cardRect.top + 28 - containerRect.top; // Point slightly down the header center

          newCoords[key] = { x1, y1, x2, y2 };
        }
      });
      setAllCoords(newCoords);
    };

    updateAllLines();
    window.addEventListener('resize', updateAllLines);
    const timer = setTimeout(updateAllLines, 200);

    return () => {
      window.removeEventListener('resize', updateAllLines);
      clearTimeout(timer);
    };
  }, [activeMetric]);

  const content = {
    fr: {
      heroTag: 'SCAN IA · TECHNOLOGIE',
      heroTitle: 'La technologie derrière votre diagnostic',
      heroSubtitle: 'Notre modèle d\'analyse d\'image identifie les signaux visuels que votre miroir ne capte pas — hydratation, pigmentation, inflammation, texture — et les traduit en actions concrètes pour votre peau.',
      
      howItWorksTitle: 'Comment ça marche',
      steps: [
        {
          num: '01',
          icon: <PhotoIcon />,
          title: 'Uploadez votre selfie',
          desc: "Une photo en lumière naturelle suffit. Pas besoin d'appareil professionnel.",
          detail: 'Format accepté : JPG/PNG · Résolution minimum 480px'
        },
        {
          num: '02',
          icon: <ScanIcon />,
          title: 'Notre IA scanne votre peau',
          desc: 'En 20 secondes, 5 dimensions analysées : hydratation, pores, rides, taches, rougeurs.',
          detail: 'Analyse multi-couches : couleur · texture · structure'
        },
        {
          num: '03',
          icon: <ReportIcon />,
          title: 'Vous recevez votre diagnostic',
          desc: 'Score sur 100, détail de vos métriques, routine personnalisée et produits adaptés.',
          detail: 'Score + 5 sous-scores + routine + sélection produits'
        }
      ],

      metricsTitle: 'Ce que notre IA lit sur votre visage',
      metrics: {
        hydration: {
          label: 'Hydratation',
          title: 'Votre peau est-elle en soif ?',
          desc: "Nous détectons les zones sèches invisibles à l'œil nu — celles qui causent les tiraillements et accentuent les rides au fil du temps.",
          measured: "Notre modèle analyse la variation de luminosité en surface et les micro-textures — les zones sèches réfléchissent différemment la lumière. Technique issue de l'analyse colorimétrique en espace L*a*b*."
        },
        sebum: {
          label: 'Pores & Sébum',
          title: 'Votre zone T sous contrôle ?',
          desc: "Analyse des pores dilatés et de l'excès de sébum sur le front, le nez et le menton. Pour savoir si votre routine matifie vraiment — ou aggrave la situation.",
          measured: "Détection de la densité et du diamètre des pores par analyse de texture locale. L'excès de sébum est identifié via les zones de sur-brillance dans le canal lumineux de l'image."
        },
        texture: {
          label: 'Rides & Texture',
          title: 'Votre capital jeunesse',
          desc: "Détection des premières lignes d'expression et des irrégularités de surface. Les signaux les plus précoces du vieillissement cutané, identifiés avant qu'ils s'installent.",
          measured: "Les rides et irrégularités de surface créent des variations de gradient détectables par analyse fréquentielle de l'image. Plus les variations sont prononcées, plus la texture est irrégulière."
        },
        pigmentation: {
          label: 'Taches Brunes',
          title: 'Les traces du soleil et de l\'acné',
          desc: "Localisation et intensité des taches de pigmentation — soleil, cicatrices, hormones. On identifie l'origine probable pour mieux cibler le traitement.",
          measured: "Segmentation des zones de sur-pigmentation via la composante b* (jaune-bleu) de l'espace colorimétrique CIELAB, robuste aux variations d'éclairage ambiant."
        },
        redness: {
          label: 'Rougeurs & Sensibilité',
          title: 'Votre barrière cutanée',
          desc: "Détection des zones inflammées ou réactives : couperose, eczéma, irritations chroniques. Votre peau parle — notre IA traduit.",
          measured: "L'inflammation cutanée se traduit par une élévation du canal rouge (R) et une désaturation du canal vert (G) — détectables en espace RGB avant conversion en indices de sévérité."
        }
      },

      underHoodTag: 'NOTRE APPROCHE',
      underHoodTitle: 'Une analyse en 3 couches, pas un simple filtre photo',
      underHoodText: "Notre modèle traite chaque image en trois passes successives. D'abord la détection des zones du visage (front, zone T, joues, contour des yeux). Ensuite l'analyse colorimétrique dans l'espace L*a*b* — l'espace de couleur utilisé en imagerie médicale car il isole la luminosité des teintes, quelle que soit la source lumineuse. Enfin l'analyse de texture pour détecter rides et irrégularités que l'œil ne distingue pas à l'échelle de la photo standard.",
      underHoodBadges: ['Analyse L*a*b*', 'Détection de zones', 'Analyse de texture'],

      refTitle: 'RECHERCHE DE RÉFÉRENCE',
      refSubtitle: 'Ces techniques d\'analyse d\'image sont issues de la littérature en dermatologie computationnelle. Nos implémentations s\'appuient sur ces méthodes établies.',
      refNote: 'Ces publications documentent les techniques générales utilisées en analyse d\'image cutanée. Rate My Skin n\'est pas un dispositif médical et ne remplace pas un diagnostic dermatologique.',
      refPapers: [
        {
          source: 'Journal of Biomedical Optics · 2019',
          title: 'Skin color measurement using digital imaging',
          desc: 'Valide l\'utilisation de l\'espace CIELAB pour quantifier rougeurs et pigmentation cutanée sur smartphone.'
        },
        {
          source: 'Skin Research and Technology · 2021',
          title: 'Colorimetric Image Analysis for Melanin and Erythema Quantification',
          desc: 'Détaille la conversion L*a*b* pour évaluer taches et rougeurs via capteurs de smartphones standards.'
        },
        {
          source: 'IEEE Transactions on Medical Imaging · 2020',
          title: 'Deep Learning for Skin Lesion Analysis: State of the Art',
          desc: 'Revue des méthodes d\'analyse de texture cutanée par vision computationnelle.'
        }
      ],

      receivablesTag: 'CE QUE VOUS RECEVEZ CONCRÈTEMENT',
      receivablesTitle: 'Un diagnostic complet, pas un score vide',
      receivablesSubtitle: 'Chaque diagnostic IA génère trois livrables exploitables immédiatement.',
      cards: [
        {
          icon: <GaugeIcon />,
          title: 'Votre Score Peau (0–100)',
          bullets: [
            "Un chiffre unique qui résume l'état global de votre peau",
            "Comparable dans le temps pour mesurer vos vrais progrès",
            "Détail des 5 sous-scores pour savoir où agir en priorité"
          ],
          micro: 'Score calculé comme moyenne pondérée de vos 5 métriques'
        },
        {
          icon: <TimelineIcon />,
          title: 'Votre Routine Personnalisée',
          bullets: [
            "Matin, soir et hebdomadaire — adaptée à VOS métriques",
            "Pas un template générique : chaque étape justifiée par vos résultats",
            "Réévaluable à chaque nouvelle analyse pour suivre l'évolution"
          ],
          micro: 'Routine générée en fonction de vos scores les plus faibles en priorité'
        },
        {
          icon: <MoleculeIcon />,
          title: 'Produits Filtrés Pour Vous',
          bullets: [
            "Sélection basée uniquement sur les ingrédients actifs et votre type de peau",
            "Filtrés par budget, tolérance cutanée et disponibilité en France",
            "Zéro partenariat payant. Zéro pub déguisée."
          ],
          micro: 'Produits filtrés par : type de peau · budget · actifs · disponibilité FR'
        }
      ],

      stat1Num: '30 sec',
      stat1Label: 'pour un diagnostic complet',
      stat2Num: '0€',
      stat2Label: 'analyse gratuite et sans engagement',
      stat3Num: '5 dimensions',
      stat3Label: 'analysées simultanément en un seul scan',

      ctaTag: '✦ ANALYSE GRATUITE',
      ctaTitle: 'Prête à découvrir l\'état réel de votre peau ?',
      ctaSubtitle: 'Diagnostic personnalisé en 30 secondes. Sans rendez-vous. Sans créer de compte.',
      ctaButton: 'Analyser ma peau gratuitement →',
      ctaSocial: 'Utilisé par des centaines d\'utilisatrices en France · Aucune donnée revendue',
      ctaMicro: '✓ Gratuit · ✓ 30 secondes · ✓ Sans inscription requise'
    },
    en: {
      heroTag: 'AI SCAN · TECHNOLOGY',
      heroTitle: 'The technology behind your diagnosis',
      heroSubtitle: 'Our image analysis model identifies visual signals that your mirror doesn\'t catch — hydration, pigmentation, inflammation, texture — and translates them into concrete actions for your skin.',
      
      howItWorksTitle: 'How It Works',
      steps: [
        {
          num: '01',
          icon: <PhotoIcon />,
          title: 'Upload your selfie',
          desc: 'A photo in natural light is enough. No professional device needed.',
          detail: 'Accepted format: JPG/PNG · Minimum resolution 480px'
        },
        {
          num: '02',
          icon: <ScanIcon />,
          title: 'Our AI scans your skin',
          desc: 'In 20 seconds, 5 dimensions analyzed: hydration, pores, wrinkles, spots, redness.',
          detail: 'Multi-layer analysis: color · texture · structure'
        },
        {
          num: '03',
          icon: <ReportIcon />,
          title: 'You receive your diagnosis',
          desc: 'Score out of 100, detail of your metrics, personalized routine and adapted products.',
          detail: 'Score + 5 sub-scores + routine + product selection'
        }
      ],

      metricsTitle: 'What our AI reads on your face',
      metrics: {
        hydration: {
          label: 'Hydration',
          title: 'Is your skin thirsty?',
          desc: 'We detect dry zones invisible to the naked eye — those that cause tightness and accentuate wrinkles over time.',
          measured: 'Our model analyzes surface brightness variation and micro-textures — dry areas reflect light differently. Method derived from colorimetric analysis in the L*a*b* space.'
        },
        sebum: {
          label: 'Pores & Sebum',
          title: 'Your T-zone under control?',
          desc: 'Analysis of enlarged pores and excess sebum on the forehead, nose, and chin. To know if your routine actually mattifies — or worsens the situation.',
          measured: 'Detection of pore density and diameter via local texture analysis. Excess sebum is identified using over-brightness zones in the image\'s light channel.'
        },
        texture: {
          label: 'Wrinkles & Texture',
          title: 'Your youth capital',
          desc: 'Detection of the first expression lines and surface irregularities. The earliest signals of skin aging, identified before they settle.',
          measured: 'Wrinkles and surface irregularities create gradient variations detectable by frequency analysis. The more pronounced the variations, the more irregular the texture.'
        },
        pigmentation: {
          label: 'Dark Spots',
          title: 'Traces of sun and acne',
          desc: 'Localization and intensity of pigmentation spots — sun, scars, hormones. We identify the probable origin to better target the treatment.',
          measured: 'Segmentation of over-pigmented zones using the b* (yellow-blue) component of the CIELAB color space, robust to ambient lighting variations.'
        },
        redness: {
          label: 'Redness & Sensitivity',
          title: 'Your skin barrier',
          desc: 'Detection of inflamed or reactive areas: rosacea, eczema, chronic irritations. Your skin talks — our AI translates.',
          measured: 'Skin inflammation translates into redness (R) channel elevation and green (G) channel desaturation — detectable in RGB space before conversion to severity indexes.'
        }
      },

      underHoodTag: 'OUR APPROACH',
      underHoodTitle: 'A 3-layer analysis, not a simple photo filter',
      underHoodText: 'Our model processes each image in three successive passes. First, facial zone detection (forehead, T-zone, cheeks, eye contour). Second, colorimetric analysis in the L*a*b* space — the color space used in medical imaging because it isolates brightness from hue, regardless of the light source. Finally, texture analysis to detect wrinkles and irregularities that the human eye cannot distinguish on a standard photo.',
      underHoodBadges: ['L*a*b* Analysis', 'Zone Detection', 'Texture Analysis'],

      refTitle: 'REFERENCE RESEARCH',
      refSubtitle: 'These image analysis techniques stem from the literature in computational dermatology. Our implementations rely on these established methods.',
      refNote: 'These publications document the general techniques used in skin image analysis. Rate My Skin is not a medical device and does not replace a dermatological diagnosis.',
      refPapers: [
        {
          source: 'Journal of Biomedical Optics · 2019',
          title: 'Skin color measurement using digital imaging',
          desc: 'Validates the use of the CIELAB color space to quantify skin redness and pigmentation on smartphones.'
        },
        {
          source: 'Skin Research and Technology · 2021',
          title: 'Colorimetric Image Analysis for Melanin and Erythema Quantification',
          desc: 'Details L*a*b* conversion to assess spots and redness using standard smartphone sensors.'
        },
        {
          source: 'IEEE Transactions on Medical Imaging · 2020',
          title: 'Deep Learning for Skin Lesion Analysis: State of the Art',
          desc: 'A review of skin texture analysis methods via computational vision.'
        }
      ],

      receivablesTag: 'WHAT YOU CONCREETLY RECEIVE',
      receivablesTitle: 'A complete diagnosis, not an empty score',
      receivablesSubtitle: 'Each AI diagnostic generates three immediately actionable deliverables.',
      cards: [
        {
          icon: <GaugeIcon />,
          title: 'Your Skin Score (0–100)',
          bullets: [
            "A unique number summarizing the overall condition of your skin",
            "Comparable over time to measure your true progress",
            "Detail of the 5 sub-scores to know where to act first"
          ],
          micro: 'Score calculated as a weighted average of your 5 metrics'
        },
        {
          icon: <TimelineIcon />,
          title: 'Your Personalized Routine',
          bullets: [
            "Morning, evening and weekly — adapted to YOUR metrics",
            "Not a generic template: each step justified by your results",
            "Re-evaluable with each new analysis to follow progress"
          ],
          micro: 'Routine generated based on your lowest scores first'
        },
        {
          icon: <MoleculeIcon />,
          title: 'Products Filtered For You',
          bullets: [
            "Selection based solely on active ingredients and your skin type",
            "Filtered by budget, skin tolerance and availability",
            "Zero paid partnerships. Zero disguised ads."
          ],
          micro: 'Products filtered by: skin type · budget · actives · availability'
        }
      ],

      stat1Num: '30 sec',
      stat1Label: 'for a complete diagnosis',
      stat2Num: '0€',
      stat2Label: 'free analysis, no strings attached',
      stat3Num: '5 dimensions',
      stat3Label: 'analyzed simultaneously in a single scan',

      ctaTag: '✦ FREE ANALYSIS',
      ctaTitle: 'Ready to discover the real state of your skin?',
      ctaSubtitle: 'Personalized diagnosis in 30 seconds. No appointments. No account creation required.',
      ctaButton: 'Analyze my skin for free →',
      ctaSocial: 'Used by hundreds of users in France · No data ever sold',
      ctaMicro: '✓ Free · ✓ 30 seconds · ✓ No registration required'
    }
  };

  const tLocal = lang === 'fr' ? content.fr : content.en;

  // Dot coordinates for the visual representation
  const dots = {
    hydration: { top: '20%', left: '50%' },
    sebum: { top: '48%', left: '50%' },
    texture: { top: '38%', left: '70%' },
    pigmentation: { top: '56%', left: '30%' },
    redness: { top: '74%', left: '50%' }
  };

  return (
    <>
      <Head>
        <title>{lang === 'fr' ? 'Technologie' : 'Technology'} | Rate My Skin</title>
        <meta name="description" content={tLocal.heroSubtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="canonical" href="https://ratemyskin.co/technologie" />
      </Head>

      {/* Styles globally applicable to this page only */}
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
            background-color: ${LIGHT_BG} !important;
            margin: 0;
            padding: 0;
          }
          .reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal.revealed {
            opacity: 1;
            transform: translateY(0);
          }
          @keyframes dotPulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
              box-shadow: 0 0 0 0 rgba(201, 169, 97, 0.65);
            }
            70% {
              transform: translate(-50%, -50%) scale(1.5);
              box-shadow: 0 0 0 12px rgba(201, 169, 97, 0);
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              box-shadow: 0 0 0 0 rgba(201, 169, 97, 0);
            }
          }
          .pulse-active {
            animation: dotPulse 1000ms infinite ease-in-out;
          }
          @keyframes scanDotMove {
            0% { cx: 4px; }
            50% { cx: 20px; }
            100% { cx: 4px; }
          }
          .scan-dot {
            animation: scanDotMove 2s infinite ease-in-out;
          }
          .metric-card {
            background: ${SURFACE};
            border: 1px solid ${BORDER};
            border-radius: 16px;
            padding: 20px 24px;
            cursor: pointer;
            transition: background-color 200ms ease, border-color 200ms ease, border-left 200ms ease;
            text-align: left;
          }
          .metric-card:hover {
            background: ${HOVER_BG};
          }
          .metric-card.active {
            background: ${HOVER_BG};
            border-left: 3px solid ${GOLD};
          }
          
          /* Responsive adjustments */
          .grid-3-col {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
          }
          .interactive-grid {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 48px;
            align-items: center;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .how-it-works-connector {
            position: absolute;
            top: 48px;
            left: 15%;
            right: 15%;
            height: 1px;
            border-top: 1px dashed ${GOLD};
            opacity: 0.4;
            z-index: 1;
          }
          .under-hood-grid {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 48px;
            align-items: start;
          }
          
          @media (max-width: 768px) {
            /* General */
            section, .section-padding {
              padding: 48px 20px !important;
            }
            main > section:first-of-type {
              padding: 60px 20px 48px 20px !important;
            }
            .section-title {
              font-size: 26px !important;
              line-height: 1.2 !important;
              margin-bottom: 24px !important;
            }
            .section-subtitle {
              font-size: 15px !important;
              line-height: 1.6 !important;
              margin-bottom: 24px !important;
              max-width: 100% !important;
            }
            .section-tag {
              font-size: 10px !important;
              letter-spacing: 0.1em !important;
              margin-bottom: 12px !important;
            }
            
            /* Grids */
            .grid-3-col, .under-hood-grid, .interactive-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
            
            /* Cards */
            .metric-card, .grid-3-col > div, .under-hood-grid > div {
              padding: 20px !important;
            }
            
            /* Comment ça marche */
            .step-card {
              padding: 24px 20px !important;
              min-height: auto !important;
            }
            .step-card-num {
              font-size: 36px !important;
              margin-bottom: 8px !important;
            }
            .step-card-title {
              font-size: 18px !important;
            }
            .step-card-desc {
              font-size: 14px !important;
              line-height: 1.7 !important;
            }
            .step-card-detail {
              font-size: 13px !important;
              padding-top: 12px !important;
              margin-top: 12px !important;
            }
            .how-it-works-connector {
              display: none !important;
            }
            
            /* Interactive metrics visualizer */
            .face-visual-container {
              height: 220px !important;
            }
            .metric-card-title {
              font-size: 16px !important;
              font-weight: bold !important;
            }
            .metric-card-desc {
              font-size: 14px !important;
              line-height: 1.7 !important;
            }
            .metric-card-measured-box {
              padding: 12px 16px !important;
            }
            .metric-card-measured-text {
              font-size: 13px !important;
              line-height: 1.6 !important;
            }
            .desktop-connector-svg {
              display: none !important;
            }
            
            /* Under the hood */
            .under-hood-text {
              font-size: 14px !important;
              line-height: 1.7 !important;
              margin-bottom: 24px !important;
            }
            .tech-badge {
              font-size: 13px !important;
            }
            .ref-card {
              padding: 20px !important;
            }
            .ref-subtitle {
              font-size: 13px !important;
              line-height: 1.6 !important;
              margin-bottom: 20px !important;
            }
            .ref-item-title {
              font-size: 14px !important;
              font-weight: bold !important;
            }
            .ref-item-desc {
              font-size: 13px !important;
              line-height: 1.5 !important;
            }
            .ref-item-source {
              font-size: 10px !important;
              letter-spacing: 0.1em !important;
            }
            .ref-disclaimer {
              font-size: 13px !important;
              margin-top: 20px !important;
              padding-top: 16px !important;
            }
            
            /* Ce que vous recevez */
            .receivable-card {
              padding: 20px !important;
              width: 100% !important;
            }
            .receivable-icon-container {
              height: 32px !important;
              margin-bottom: 12px !important;
            }
            .receivable-icon-container svg {
              width: 32px !important;
              height: 32px !important;
            }
            .receivable-card-title {
              font-size: 18px !important;
              margin-bottom: 12px !important;
            }
            .receivable-bullet {
              font-size: 13px !important;
              line-height: 1.8 !important;
            }
            .receivable-micro {
              font-size: 13px !important;
              padding: 12px 20px !important;
            }
            
            /* Dark Stats */
            .stats-grid {
              grid-template-columns: 1fr !important;
              gap: 0px !important;
              text-align: center !important;
            }
            .stat-item {
              padding: 24px 0 !important;
              border-bottom: 1px solid rgba(248, 244, 237, 0.15) !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
            }
            .stat-item:last-of-type {
              border-bottom: none !important;
            }
            .stat-number {
              font-size: 40px !important;
              line-height: 1 !important;
              margin-bottom: 8px !important;
            }
            .stat-label {
              font-size: 13px !important;
              line-height: 1.4 !important;
            }
            
            /* CTA Final */
            .cta-section-title {
              font-size: 24px !important;
              line-height: 1.2 !important;
            }
            .cta-section-subtitle {
              font-size: 14px !important;
              line-height: 1.6 !important;
              margin-bottom: 20px !important;
            }
            .cta-button {
              width: 100% !important;
              padding: 16px !important;
              font-size: 15px !important;
              height: 48px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .cta-social {
              font-size: 12px !important;
              margin-bottom: 16px !important;
            }
            .cta-micro {
              font-size: 13px !important;
              margin-top: 12px !important;
            }
            
            /* Nav bar */
            .nav-blur {
              padding: 12px 16px !important;
            }
          }
        `
      }} />

      {/* Nav */}
      <div className="nav-blur" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(248, 244, 237, 0.85)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${BORDER}`,
        padding: 'calc(13px + env(safe-area-inset-top, 0px)) 26px 13px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 16px)' }}>
          <LangToggle />
          <Link href="/blog" style={{
            fontSize: 12, color: '#8C7A6B', textDecoration: 'none',
            fontFamily: "'Inter', sans-serif", fontWeight: 500,
            letterSpacing: '0.02em', whiteSpace: 'nowrap'
          }}>
            Blog
          </Link>
          <Link href="/" style={{
            background: 'none', border: 'none', textDecoration: 'none',
            fontSize: 12, color: '#A87449', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontWeight: 600,
            letterSpacing: '0.02em', whiteSpace: 'nowrap'
          }}>
            {lang === 'fr' ? 'Analyser ma peau' : 'Analyze my skin'}
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <input type="checkbox" id="mobile-nav-toggle-checkbox" className="mobile-nav-toggle" />
        <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: 14 }}>
          <LangToggle />
          <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-toggle-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C241D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </label>
        </div>

        {/* Mobile Navigation Drawer Backdrop Overlay */}
        <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-overlay" />

        {/* Mobile Drawer Content */}
        <div className="mobile-nav-drawer" style={{ textDecoration: 'none', textAlign: 'left' }}>
          <div className="mobile-nav-drawer-header">
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}>
              <Logo height={28} />
            </Link>
            <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-drawer-close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C241D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </label>
          </div>
          <div className="mobile-nav-drawer-links">
            <Link href="/technologie" className="mobile-nav-drawer-link" style={{ display: 'block', textDecoration: 'none' }} onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}>
              {t('techNav')}
            </Link>
            <Link href="/blog" className="mobile-nav-drawer-link" style={{ display: 'block', textDecoration: 'none' }} onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}>
              {t('blogNav')}
            </Link>
            <Link href="/mes-rapports" className="mobile-nav-drawer-link" style={{ display: 'block', textDecoration: 'none' }} onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}>
              {t('myReportsNav')}
            </Link>
          </div>
          <div className="mobile-nav-drawer-cta">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button
                onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #3D2914 0%, #281B0D 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px 20px',
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
            </Link>
          </div>
        </div>
      </div>

      <main style={{ width: '100%', overflowX: 'hidden' }}>
        
        {/* 1. HERO SECTION */}
        <section className="reveal" style={{ padding: '100px 24px 60px', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          <span className="section-tag" style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: GOLD,
            fontWeight: 600,
            display: 'block',
            marginBottom: 16
          }}>
            {tLocal.heroTag}
          </span>
          <h1 className="section-title" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 40,
            color: WARM,
            fontWeight: 400,
            lineHeight: 1.2,
            margin: '0 0 20px'
          }}>
            {tLocal.heroTitle}
          </h1>
          <p className="section-subtitle" style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            lineHeight: 1.7,
            color: TEXT_SEC,
            maxWidth: 580,
            margin: '0 auto'
          }}>
            {tLocal.heroSubtitle}
          </p>
        </section>

        {/* 2. COMMENT CA MARCHE */}
        <section className="section-padding" style={{ background: '#F0EAE0', padding: '80px 24px', position: 'relative' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative' }}>
            <h2 className="reveal section-title" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 40,
              color: WARM,
              fontWeight: 400,
              textAlign: 'center',
              marginBottom: 56
            }}>
              {tLocal.howItWorksTitle}
            </h2>
            
            <div style={{ position: 'relative' }}>
              <div className="how-it-works-connector" />
              <div className="grid-3-col">
                {tLocal.steps.map((step, index) => (
                  <div key={index} className="reveal step-card" style={{
                    position: 'relative',
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 16,
                    padding: '32px 24px',
                    textAlign: 'center',
                    boxShadow: '0 2px 20px rgba(44,36,22,0.06)',
                    zIndex: 2,
                    transition: 'background-color 200ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '260px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = HOVER_BG}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = SURFACE}
                  >
                    <div>
                      <div className="step-card-num" style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 48,
                        color: GOLD,
                        opacity: 0.5,
                        lineHeight: 1,
                        marginBottom: 8
                      }}>
                        {step.num}
                      </div>
                      <div style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{step.icon}</div>
                      <h3 className="step-card-title" style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 20,
                        fontWeight: 400,
                        color: WARM,
                        margin: '0 0 12px'
                      }}>
                        {step.title}
                      </h3>
                      <p className="step-card-desc" style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: TEXT_SEC,
                        margin: '0 0 16px 0'
                      }}>
                        {step.desc}
                      </p>
                    </div>
                    <div className="step-card-detail" style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: GOLD,
                      fontWeight: 500,
                      borderTop: `1px solid ${BORDER}`,
                      paddingTop: 12,
                      marginTop: 'auto'
                    }}>
                      {step.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. LES 5 METRIQUES */}
        <section className="section-padding" style={{ padding: '80px 24px', position: 'relative' }} ref={containerRef}>
          
          {/* Connector Dotted Lines SVG Overlay */}
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5
          }} className="desktop-connector-svg">
            {Object.entries(allCoords).map(([key, coords]) => (
              <line
                key={key}
                x1={coords.x1}
                y1={coords.y1}
                x2={coords.x2}
                y2={coords.y2}
                stroke={GOLD}
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity={activeMetric === key ? 0.75 : 0.25}
                style={{ transition: 'opacity 0.3s ease' }}
              />
            ))}
          </svg>

          <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 6 }}>
            <h2 className="reveal section-title" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 40,
              color: WARM,
              fontWeight: 400,
              textAlign: 'center',
              marginBottom: 56
            }}>
              {tLocal.metricsTitle}
            </h2>

            <div className="interactive-grid">
              
              {/* VISUEL GAUCHE */}
              <div className="reveal" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="face-visual-container" style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 320,
                  aspectRatio: '3/4',
                  background: `radial-gradient(circle, ${BORDER} 0%, ${LIGHT_BG} 100%)`,
                  borderRadius: 16,
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 2px 20px rgba(44, 36, 22, 0.06)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Face SVG Outline */}
                  <svg viewBox="0 0 200 266" style={{ width: '80%', height: '80%', opacity: 0.7 }}>
                    {/* Outer Contour */}
                    <path d="M 100,40 Q 50,40 52,115 C 52,175 72,215 100,226 C 128,215 148,175 148,115 Q 150,40 100,40 Z"
                      fill="none" stroke={GOLD} strokeWidth="1.5" />
                    {/* Brows */}
                    <path d="M 62,90 Q 72,83 82,88" fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M 118,88 Q 128,83 138,90" fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" />
                    {/* Eyes */}
                    <path d="M 64,102 Q 74,96 84,102 Q 74,106 64,102 Z" fill="none" stroke={GOLD} strokeWidth="1" />
                    <circle cx="74" cy="101" r="1.5" fill={GOLD} />
                    <path d="M 116,102 Q 126,96 136,102 Q 126,106 116,102 Z" fill="none" stroke={GOLD} strokeWidth="1" />
                    <circle cx="126" cy="101" r="1.5" fill={GOLD} />
                    {/* Nose */}
                    <path d="M 100,90 L 96,138 L 100,143 L 104,138 Z" fill="none" stroke={GOLD} strokeWidth="1" strokeLinejoin="round" />
                    {/* Lips */}
                    <path d="M 82,178 Q 100,170 118,178 Q 100,188 82,178 Z" fill="none" stroke={GOLD} strokeWidth="1" strokeLinejoin="round" />
                  </svg>

                  {/* Pulsing Dots */}
                  {Object.entries(dots).map(([key, pos]) => (
                    <div
                      key={key}
                      ref={dotRefs[key]}
                      style={{
                        position: 'absolute',
                        top: pos.top,
                        left: pos.left,
                        width: 10,
                        height: 10,
                        backgroundColor: GOLD,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 0 4px rgba(201,169,97,0.25)',
                        zIndex: 10
                      }}
                      className={activeMetric === key ? 'pulse-active' : ''}
                      onClick={() => setActiveMetric(key)}
                    />
                  ))}
                </div>
              </div>

              {/* LISTE DROITE */}
              <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(tLocal.metrics).map(([key, metric]) => {
                  const isActive = activeMetric === key;
                  return (
                    <div
                      key={key}
                      ref={cardRefs[key]}
                      onClick={() => setActiveMetric(isActive ? '' : key)} // Toggle accordion logic
                      className={`metric-card ${isActive ? 'active' : ''}`}
                    >
                      <h3 className="metric-card-title" style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 20,
                        fontWeight: 400,
                        color: isActive ? GOLD : WARM,
                        margin: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        <span style={{ flexGrow: 1 }}>{metric.title}</span>
                        <span style={{ fontSize: 12, opacity: 0.6, transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                      </h3>
                      {isActive && (
                        <div style={{ marginTop: 16 }}>
                          <p className="metric-card-desc" style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 15,
                            lineHeight: 1.7,
                            color: TEXT_SEC,
                            margin: '0 0 16px 0'
                          }}>
                            {metric.desc}
                          </p>
                          <div style={{ height: 1, backgroundColor: BORDER, margin: '16px 0' }} />
                          <div className="metric-card-measured-box" style={{
                            background: HOVER_BG,
                            borderLeft: `2px solid ${GOLD}`,
                            padding: '12px 16px',
                            borderRadius: '0 8px 8px 0'
                          }}>
                            <h4 style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 11,
                              fontWeight: 600,
                              color: GOLD,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              margin: '0 0 6px 0'
                            }}>
                              {lang === 'fr' ? "Comment c'est mesuré" : "How it's measured"}
                            </h4>
                            <p className="metric-card-measured-text" style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13,
                              lineHeight: 1.6,
                              color: TEXT_SEC,
                              margin: 0
                            }}>
                              {metric.measured}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* 4. UNDER THE HOOD SECTION */}
        <section className="section-padding" style={{ background: '#F8F4ED', padding: '80px 24px', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <div className="under-hood-grid">
              
              {/* LEFT COLUMN: passes explanation */}
              <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <span className="section-tag" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  fontWeight: 600,
                  display: 'block'
                }}>
                  {tLocal.underHoodTag}
                </span>
                <h2 className="section-title" style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 32,
                  color: WARM,
                  fontWeight: 400,
                  lineHeight: 1.25,
                  margin: 0
                }}>
                  {tLocal.underHoodTitle}
                </h2>
                <p className="under-hood-text" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: TEXT_SEC,
                  margin: '8px 0 24px 0'
                }}>
                  {tLocal.underHoodText}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {tLocal.underHoodBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="tech-badge"
                      style={{
                        background: HOVER_BG,
                        border: `1px solid ${GOLD}`,
                        color: WARM,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12,
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontWeight: 500
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: literature references */}
              <div className="reveal ref-card" style={{
                background: HOVER_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: '32px'
              }}>
                <span className="section-tag" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: 8
                }}>
                  {tLocal.refTitle}
                </span>
                <p className="ref-subtitle" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: TEXT_SEC,
                  marginBottom: 24
                }}>
                  {tLocal.refSubtitle}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {tLocal.refPapers.map((paper, idx) => (
                    <div key={idx} style={{
                      borderBottom: idx === tLocal.refPapers.length - 1 ? 'none' : `1px solid ${BORDER}`,
                      paddingBottom: idx === tLocal.refPapers.length - 1 ? 0 : 20
                    }}>
                      <div className="ref-item-source" style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        textTransform: 'uppercase',
                        color: GOLD,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        marginBottom: 4
                      }}>
                        {paper.source}
                      </div>
                      <h4 className="ref-item-title" style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: WARM,
                        margin: '0 0 6px 0'
                      }}>
                        {paper.title}
                      </h4>
                      <p className="ref-item-desc" style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: TEXT_SEC,
                        margin: 0
                      }}>
                        {paper.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="ref-disclaimer" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontStyle: 'italic',
                  color: TEXT_SEC,
                  opacity: 0.8,
                  marginTop: 24,
                  lineHeight: 1.5,
                  borderTop: `1px dashed ${BORDER}`,
                  paddingTop: 16,
                  margin: '24px 0 0 0'
                }}>
                  {tLocal.refNote}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 5. CE QUE VOUS RECEVEZ */}
        <section className="section-padding" style={{ background: SURFACE, padding: '80px 24px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            
            <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
              <span className="section-tag" style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: GOLD,
                fontWeight: 600,
                display: 'block',
                marginBottom: 16
              }}>
                {tLocal.receivablesTag}
              </span>
              <h2 className="section-title" style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 40,
                color: WARM,
                fontWeight: 400,
                lineHeight: 1.2,
                margin: '0 0 20px'
              }}>
                {tLocal.receivablesTitle}
              </h2>
              <p className="section-subtitle" style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                lineHeight: 1.7,
                color: TEXT_SEC,
                maxWidth: 580,
                margin: '0 auto'
              }}>
                {tLocal.receivablesSubtitle}
              </p>
            </div>

            <div className="grid-3-col">
              {tLocal.cards.map((card, idx) => (
                <div key={idx} className="reveal receivable-card" style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderTop: `3px solid ${GOLD}`,
                  borderRadius: 16,
                  boxShadow: '0 2px 20px rgba(44,36,22,0.06)',
                  transition: 'background-color 200ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = HOVER_BG}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = SURFACE}
                >
                  <div style={{ padding: '32px 24px 24px 24px' }}>
                    <div className="receivable-icon-container" style={{ height: 40, display: 'flex', alignItems: 'center', marginBottom: 16 }}>{card.icon}</div>
                    <h3 className="receivable-card-title" style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 20,
                      fontWeight: 400,
                      color: WARM,
                      margin: '0 0 20px'
                    }}>
                      {card.title}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {card.bullets.map((b, bulletIdx) => (
                        <li key={bulletIdx} className="receivable-bullet" style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 14,
                          lineHeight: 1.8,
                          color: TEXT_SEC,
                          marginBottom: bulletIdx === card.bullets.length - 1 ? 0 : 12,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8
                        }}>
                          <span style={{ color: GOLD, flexShrink: 0 }}>→</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="receivable-micro" style={{
                    background: LIGHT_BG,
                    borderTop: `1px solid ${BORDER}`,
                    padding: '12px 20px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: GOLD,
                    fontWeight: 500
                  }}>
                    {card.micro}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 6. CHIFFRES REELS */}
        <section className="section-padding" style={{ background: '#2C2416', padding: '60px 24px', color: '#F8F4ED' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <div className="stats-grid">
              
              <div className="reveal stat-item" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="stat-number" style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 48,
                  color: GOLD,
                  lineHeight: 1
                }}>
                  {tLocal.stat1Num}
                </div>
                <div className="stat-label" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: '#F8F4ED',
                  opacity: 0.7
                }}>
                  {tLocal.stat1Label}
                </div>
              </div>

              <div className="reveal stat-item" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="stat-number" style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 48,
                  color: GOLD,
                  lineHeight: 1
                }}>
                  {tLocal.stat2Num}
                </div>
                <div className="stat-label" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: '#F8F4ED',
                  opacity: 0.7
                }}>
                  {tLocal.stat2Label}
                </div>
              </div>

              <div className="reveal stat-item" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="stat-number" style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 48,
                  color: GOLD,
                  lineHeight: 1
                }}>
                  {tLocal.stat3Num}
                </div>
                <div className="stat-label" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: '#F8F4ED',
                  opacity: 0.7
                }}>
                  {tLocal.stat3Label}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 7. CTA FINAL */}
        <section className="section-padding" style={{ background: LIGHT_BG, padding: '80px 24px', textAlign: 'center' }}>
          <div className="reveal" style={{ maxWidth: 600, margin: '0 auto' }}>
            <span className="section-tag" style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: GOLD,
              fontWeight: 600,
              display: 'block',
              marginBottom: 16
            }}>
              {tLocal.ctaTag}
            </span>
            <h2 className="cta-section-title" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 40,
              color: WARM,
              fontWeight: 400,
              lineHeight: 1.2,
              margin: '0 0 20px'
            }}>
              {tLocal.ctaTitle}
            </h2>
            <p className="cta-section-subtitle" style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              lineHeight: 1.7,
              color: TEXT_SEC,
              marginBottom: 24
            }}>
              {tLocal.ctaSubtitle}
            </p>

            <p className="cta-social" style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: TEXT_SEC,
              marginBottom: 20
            }}>
              {tLocal.ctaSocial}
            </p>
            
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="cta-button" style={{
                background: WARM,
                color: '#F8F4ED',
                border: 'none',
                borderRadius: 8,
                padding: '18px 40px',
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 2px 20px rgba(44,36,22,0.06)',
                transition: 'all 200ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = GOLD;
                e.currentTarget.style.color = WARM;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = WARM;
                e.currentTarget.style.color = '#F8F4ED';
              }}
              >
                {tLocal.ctaButton}
              </button>
            </Link>
            
            <p className="cta-micro" style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: TEXT_SEC,
              marginTop: 16,
              margin: '16px 0 0 0'
            }}>
              {tLocal.ctaMicro}
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
