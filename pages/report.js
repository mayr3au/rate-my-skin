import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import BeautyReport from '../components/BeautyReport';
import Logo, { LuxuryFlower } from '../components/Logo';
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

const FACTS = [
  {
    title: "Le mythe du 'trop propre'",
    desc: "Nettoyer sa peau plus de 2 fois par jour détruit la barrière cutanée et peut paradoxalement causer plus d'imperfections."
  },
  {
    title: "L'impact du stress",
    desc: "Le cortisol stimule la production de sébum. La gestion du stress fait partie intégrante d'une routine peau efficace."
  },
  {
    title: "L'ordre compte",
    desc: "Appliquer ses soins du plus fluide au plus épais maximise leur absorption. Sérum avant crème, jamais l'inverse."
  },
  {
    title: "Le SPF est non-négociable",
    desc: "80% du vieillissement cutané est lié aux UV. Même par temps nuageux, même en intérieur près d'une fenêtre."
  },
  {
    title: "La règle des 60 secondes",
    desc: "Laisser un nettoyant agir 60 secondes sur la peau améliore significativement la dissolution du sébum et des impûretés."
  },
  {
    title: "L'hydratation de l'intérieur",
    desc: "Boire 1,5 L d'eau par jour améliore l'éclat et la souplesse de la peau dès les premières semaines."
  },
];

const PREMIUM_STEPS_FR = [
  { icon: "M12 2a7 7 0 1 0 0 14A7 7 0 0 0 12 2zm0 3v4l3 3", label: "Calcul du score d'hydratation…" },
  { icon: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", label: "Recherche d'imperfections & acné…" },
  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "Analyse des ridules et de la fermeté…" },
  { icon: "M3 12h18M3 6h18M3 18h18", label: "Sélection des ingrédients actifs…" },
  { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "Génération de la routine sur-mesure…" },
  { icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", label: "Finalisation de votre ordonnance beauté…" },
];

const PREMIUM_STEPS_EN = [
  { icon: "M12 2a7 7 0 1 0 0 14A7 7 0 0 0 12 2zm0 3v4l3 3", label: "Calculating hydration score…" },
  { icon: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", label: "Scanning for blemishes & acne…" },
  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "Analyzing fine lines & elasticity…" },
  { icon: "M3 12h18M3 6h18M3 18h18", label: "Selecting active ingredients…" },
  { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "Generating your custom routine…" },
  { icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", label: "Finalizing your skin prescription…" },
];

export default function Report() {
  const router = useRouter();
  const { lang, t } = useLang();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleFactChange = (newIndex) => {
    setFade(false);
    setTimeout(() => {
      setFactIndex(newIndex);
      setFade(true);
    }, 200);
  };

  const [data, setData] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [userId, setUserId] = useState(null);
  const [paidUnlocks, setPaidUnlocks] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [stepFade, setStepFade] = useState(true);

  const [emailCaptured, setEmailCaptured] = useState(true);
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(true);
  const [showEmailGate, setShowEmailGate] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    // 1. Read from sessionStorage
    const stored = sessionStorage.getItem('rms_report');

    const captured = localStorage.getItem('rms_email_captured') === '1';
    setEmailCaptured(captured);
    if (!captured) {
      setShowEmailGate(true);
    }

    const storedAnalysisId = sessionStorage.getItem('rms_analysis_id');
    if (storedAnalysisId) setAnalysisId(storedAnalysisId);

    const storedIsPaid = sessionStorage.getItem('rms_is_paid');
    if (storedIsPaid === 'true') {
      setIsPaid(true);
    } else if (process.env.NODE_ENV === 'development') {
      const urlParams = new URLSearchParams(window.location.search);
      setIsPaid(urlParams.get('paid') === 'true');
    }

    if (!stored && process.env.NODE_ENV === 'development') {
      const isFr = lang === 'fr';
      const mockReport = {
        overall: 82,
        summary: isFr
          ? "Une légère déshydratation et des cernes sont les principales observations de cette analyse."
          : "Mild dehydration and periorbital hyperpigmentation are the dominant findings in this analysis.",
        faceShape: isFr ? "Ovale" : "Oval",
        skinType: isFr ? "Mixte" : "Combination",
        skinTone: isFr ? "Teint Beige Moyen — Type III" : "Type III — Medium Beige",
        free_version: {
          mainProblems: isFr ? [
            { title: "Déshydratation", description: "Des signes de manque d’hydratation sont visibles dans les couches superficielles de la peau. Cela arrive souvent avec la fatigue ou un manque d’eau.", severity: "mild" },
            { title: "Cernes", description: "Des cernes sont observés sous les yeux, probablement liés à une légère fatigue ou une prédisposition naturelle.", severity: "moderate" },
            { title: "Excès de sébum", description: "Un léger brillant est visible sur la zone T, signe d’une production de sébum un peu élevée.", severity: "mild" }
          ] : [
            { title: "Dehydration", description: "Clinical signs of moisture depletion in the epidermal layer. This often occurs with fatigue or insufficient water intake.", severity: "mild" },
            { title: "Periorbital Hyperpigmentation", description: "Dark circles observed under the eyes, likely linked to mild fatigue or a natural predisposition.", severity: "moderate" },
            { title: "Sebum Production", description: "Slight shininess in the T-zone area, indicating slightly elevated sebum production.", severity: "mild" }
          ],
          basicSummary: isFr
            ? "Votre peau présente une belle résistance générale, avec de légers signes de déshydratation à corriger. Dans l’ensemble, votre peau est en bonne santé — le rapport complet vous donnera des scores détaillés, une routine sur mesure et des produits adaptés."
            : "Your skin shows high overall resilience, with mild indicators of moisture loss. Overall, your skin is in good health — the full report will give you detailed scores, a personalised routine and tailored product recommendations.",
        },
        paid_version: {
          metrics: isFr ? [
            { label: "Hydratation", score: 85, grade: "B", detail: "Bonne fonction barrière, quelques légères tiraillements sur le font." },
            { label: "Pores", score: 79, grade: "B", detail: "Activité sébaceum dans les limites normales, pores légèrement visibles." },
            { label: "Éclat", score: 88, grade: "A", detail: "Excellent renouvellement cellulaire, surface de la peau lumineuse." },
            { label: "Acné", score: 92, grade: "A", detail: "Aucun coumédon actif ni lésion inflammatoire détecté." },
            { label: "Taches", score: 74, grade: "C", detail: "Légères taches solaires sur les joues et hyperpigmentation." },
            { label: "Cernes", score: 68, grade: "D", detail: "Léger creux sous l’œil avec cernes visibles, probablement liés à la fatigue." },
            { label: "Symétrie", score: 85, grade: "B", detail: "Alignement facial très harmonieux, légère variance structurelle mineure." },
            { label: "Harmonie", score: 90, grade: "A", detail: "Excellente relation spatiale entre les proportions du visage." }
          ] : [
            { label: "Hydration", score: 85, grade: "B", detail: "Optimal barrier function, minor dry lines on the forehead." },
            { label: "Pores", score: 79, grade: "B", detail: "Sebaceous activity is within normal limits; minor visible pores." },
            { label: "Radiance", score: 88, grade: "A", detail: "Excellent cellular turnover; luminous skin surface reflection." },
            { label: "Acne", score: 92, grade: "A", detail: "No active comedones or inflammatory lesions detected." },
            { label: "Dark Spots", score: 74, grade: "C", detail: "Slight sun spots on cheeks and hyperpigmentation." },
            { label: "Under-Eye", score: 68, grade: "D", detail: "Mild structural pooling under orbit, visible periorbital hyperpigmentation." },
            { label: "Symmetry", score: 85, grade: "B", detail: "Highly harmonious facial alignment; minor structural variance." },
            { label: "Harmony", score: 90, grade: "A", detail: "Perfect spatial relationship between golden ratios." }
          ],
          strengths: isFr ? [
            { title: "Éclat cellulaire", desc: "Texture de peau lumineuse montrant un renouvellement cellulaire très efficace." },
            { title: "Résistance aux imperfections", desc: "Peau nette avec zéro lésion inflammatoire active." }
          ] : [
            { title: "Cellular Radiance", desc: "Luminous skin texture showing highly effective cellular turnover." },
            { title: "Blemish Resilience", desc: "Clean skin canvas with zero active inflammatory lesions." }
          ],
          improvements: isFr ? [
            { title: "Hydrater le contour des yeux", desc: "Appliquer une hydratation topique ciblée pour atténuer les cernes." },
            { title: "Protéger contre les taches", desc: "Utiliser une protection antioxydante pour prévenir les taches induites par le soleil." }
          ] : [
            { title: "Orbital Hydration", desc: "Targeted active topical hydration to correct structural shadow pooling." },
            { title: "Pigment Moderation", desc: "Antioxidant protection to prevent ultraviolet-induced spots." }
          ],
          routine: isFr ? {
            morning: [
              "Nettoyer avec un soin doux à pH neutre.",
              "Appliquer un sérum Vitamine C pour l’action antioxydante.",
              "Utiliser une protection solaire SPF 50+ large spectre."
            ],
            evening: [
              "Double nettoyage pour éliminer la pollution.",
              "Appliquer délicatement une crème contour des yeux pour cibler les cernes.",
              "Appliquer du Rétinol 0,3 % pour stimuler le renouvellement cellulaire.",
              "Utiliser une crème riche en céramides pour renforcer la barrière cutanée."
            ],
            weekly: [
              "Exfoliant AHA/BHA deux fois par semaine pour affiner le grain de peau.",
              "Masque hydratant apaisant une fois par semaine."
            ]
          } : {
            morning: [
              "Cleanse with a mild, pH-balanced cleanser.",
              "Apply Vitamin C Serum for antioxidant defence.",
              "Use SPF 50+ broad-spectrum sunscreen."
            ],
            evening: [
              "Double cleanse to remove pollution.",
              "Gently apply an eye repair cream to target dark circles.",
              "Apply Retinol 0.3% to boost cellular turnover.",
              "Use a ceramide-rich barrier support cream."
            ],
            weekly: [
              "AHA/BHA exfoliant twice a week to refine texture.",
              "Soothing hydration mask once a week."
            ]
          },
          productRecommendations: [
            {
              skinProblem: isFr ? "Cernes" : "Under-Eye Hyperpigmentation",
              productName: "The Inkey List Caffeine Eye Cream",
              description: isFr
                ? "Formulé avec de la caféine et des peptides pour réduire visiblement le gonflement et estomper les cernes."
                : "Caffeine + peptides to visibly reduce puffiness and dark circles overnight.",
              amazonLink: "https://www.amazon.fr/dp/B08JH2JH7Y?tag=ratemyskin-21",
              sephoraLink: "https://www.sephora.com/product/the-inkey-list-caffeine-eye-cream",
              price: "€10–14",
              imageUrl: "https://images.unsplash.com/photo-1629732047847-50b7ecf0cbf1?q=80&w=200&auto=format&fit=crop"
            },
            {
              skinProblem: isFr ? "Nettoyage" : "Cleansing",
              productName: "CeraVe SA Cleanser",
              description: isFr
                ? "Nettoyant doux enrichi en acide salicylique et céramides pour désincruster les pores tout en douceur."
                : "Gentle cleanser enriched with salicylic acid and ceramides to unclog pores and smooth texture.",
              amazonLink: "https://www.amazon.fr/s?k=CeraVe+SA+Cleanser&tag=ratemyskin-21",
              sephoraLink: "https://www.sephora.fr/search/?q=CeraVe+SA+Cleanser",
              price: "€13.90",
              imageUrl: "https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?q=80&w=240&auto=format&fit=crop"
            },
            {
              skinProblem: isFr ? "Éclat & Antioxydant" : "Radiance & Antioxidant",
              productName: "SkinCeuticals C E Ferulic",
              description: isFr
                ? "Sérum antioxydant de référence à la vitamine C pure pour illuminer le teint et protéger des rayons UV."
                : "Gold-standard pure Vitamin C antioxidant serum to brighten the skin tone and protect against UV rays.",
              amazonLink: "https://www.amazon.fr/s?k=SkinCeuticals+C+E+Ferulic&tag=ratemyskin-21",
              sephoraLink: "https://www.sephora.fr/search/?q=SkinCeuticals+C+E+Ferulic",
              price: "€165.00",
              imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=240&auto=format&fit=crop"
            },
            {
              skinProblem: isFr ? "Hydratation" : "Hydration",
              productName: "CeraVe Moisturising Cream",
              description: isFr
                ? "Crème riche réparatrice aux 3 céramides essentiels pour hydrater et restaurer la barrière cutanée."
                : "Rich restorative cream with 3 essential ceramides to hydrate and restore the protective skin barrier.",
              amazonLink: "https://www.amazon.fr/s?k=CeraVe+Moisturising+Cream&tag=ratemyskin-21",
              sephoraLink: "https://www.sephora.fr/search/?q=CeraVe+Moisturising+Cream",
              price: "€15.00",
              imageUrl: "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=240&auto=format&fit=crop"
            },
            {
              skinProblem: isFr ? "Exfoliation" : "Exfoliation",
              productName: "Paula's Choice 2% BHA Exfoliant",
              description: isFr
                ? "Lotion exfoliante culte à l'acide salicylique qui élimine les points noirs et resserre visiblement les pores."
                : "Cult-favourite salicylic acid exfoliant that clears blackheads, unclogs pores, and refines texture.",
              amazonLink: "https://www.amazon.fr/s?k=Paulas+Choice+2%25+BHA&tag=ratemyskin-21",
              sephoraLink: "https://www.sephora.fr/search/?q=Paulas+Choice+2%25+BHA",
              price: "€34.00",
              imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=240&auto=format&fit=crop"
            },
            {
              skinProblem: isFr ? "Hydratation de nuit" : "Overnight Hydration",
              productName: "Laneige Water Sleeping Mask",
              description: isFr
                ? "Masque de nuit en gel ultra-frais qui désaltère la peau déshydratée pendant le sommeil."
                : "Ultra-fresh overnight gel mask that deeply rehydrates the skin and supports barrier repair during sleep.",
              amazonLink: "https://www.amazon.fr/s?k=Laneige+Water+Sleeping+Mask&tag=ratemyskin-21",
              sephoraLink: "https://www.sephora.fr/search/?q=Laneige+Water+Sleeping+Mask",
              price: "€29.00",
              imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=240&auto=format&fit=crop"
            }
          ],
          lifestyle: isFr ? {
            diet: { title: "Plus d'Oméga-3 & Hydratation", desc: "Favorise la barrière lipidique et réduit l'inflammation. Mangez plus de saumon, de noix, de graines de chia et veillez à boire au moins 1,5L d'eau par jour pour nourrir la peau de l'intérieur." },
            sleep: { title: "Sommeil réparateur & Taie en Soie", desc: "Dormez 7 à 8 heures par nuit pour la régénération cellulaire. Privilégiez une taie d'oreiller en soie (pour limiter les frictions et préserver l'hydratation) et essayez de dormir sur le dos pour éviter les plis de pression." },
            stress: { title: "Gestion du cortisol", desc: "Le stress chronique augmente le sébum et l'inflammation. Intégrez 5 min de respiration profonde ou de méditation chaque jour pour apaiser le système nerveux et réguler les hormones cutanées." },
            hygiene: { title: "Hygiène des taies & du téléphone", desc: "Changez votre taie d'oreiller tous les 2 à 3 jours pour ne pas dormir sur des résidus bactériens accumulés. Désinfectez votre écran de téléphone tous les jours (véritable nid à microbes) et lavez vos mains à l'eau et au savon avant chaque routine skincare." },
            sun: { title: "Protection UV quotidienne", desc: "Même par temps nuageux ou en intérieur près d'une fenêtre, appliquez quotidiennement un SPF 50+. Les UVA traversent les nuages et le verre, dégradant le collagène et provoquant taches et vieillissement prématuré." },
            exercise: { title: "Sport & Douche immédiate", desc: "L'activité physique stimule la circulation et l'éclat, mais la sueur séchée obstrue les pores et retient les toxines. Prenez une douche ou nettoyez votre visage immédiatement après l'effort avec un nettoyant doux." },
            temperature: { title: "Lavage à l'eau tiède", desc: "Ne lavez jamais votre visage à l'eau chaude sous la douche. L'eau chaude dissout les huiles naturelles protectrices de la peau, causant déshydratation et irritations. Utilisez toujours de l'eau tiède ou fraîche au lavabo." }
          } : {
            diet: { title: "More Omega-3s & Hydration", desc: "Supports the lipid barrier and reduces inflammation. Eat more salmon, walnuts, chia seeds, and aim for at least 1.5L of water daily to keep your skin hydrated from within." },
            sleep: { title: "Restful Sleep & Silk Pillowcase", desc: "7-8 hours a night is crucial for cell turnover. Use a mulberry silk pillowcase to prevent skin friction and retain moisture, and try sleeping on your back to avoid sleep creases." },
            stress: { title: "Cortisol Management", desc: "Chronic stress triggers sebum production and inflammation. Practice 5 minutes of deep breathing or mindfulness daily to lower cortisol levels and calm your nervous system." },
            hygiene: { title: "Pillowcase Hygiene & Phone Sanitization", desc: "Change your pillowcase every 2-3 days to avoid sleeping on bacteria, saliva, and sweat buildup. Sanitize your mobile screen daily and wash hands before applying any product." },
            sun: { title: "Daily UV Protection", desc: "Even on cloudy days or indoors near windows, apply a daily SPF 50+. UVA rays penetrate clouds and glass, breaking down collagen, creating dark spots, and causing premature aging." },
            exercise: { title: "Workout & Immediate Rinse", desc: "Physical activity boosts circulation and radiance, but dried sweat traps bacteria and clogs pores. Always cleanse your face with a gentle wash immediately after working out." },
            temperature: { title: "Lukewarm Water Only", desc: "Never wash your face with hot shower water. Hot water strips the skin's natural protective oils, leading to severe dehydration and irritation. Always rinse with lukewarm or cool water at the sink." }
          },
          progression: isFr ? [
            { week: 1, title: "Fondations & Tolérance", desc: "Introduction de la nouvelle routine. La barrière cutanée s'adapte en douceur." },
            { week: 2, title: "Action ciblée", desc: "Les actifs commencent à pénétrer et à agir sur l'hydratation et les rougeurs." },
            { week: 3, title: "Régénération", desc: "Le grain de peau s'affine, les pores paraissent visuellement moins dilatés." },
            { week: 4, title: "Résultats visibles", desc: "Une peau visiblement plus lumineuse, repulpée, équilibrée et éclatante." }
          ] : [
            { week: 1, title: "Foundations & Tolerance", desc: "Introduction of the new routine. The skin barrier adapts gently." },
            { week: 2, title: "Targeted Action", desc: "Actives begin to penetrate and target hydration and redness." },
            { week: 3, title: "Turnover Boost", desc: "Skin texture is refined, pores appear visibly less enlarged." },
            { week: 4, title: "Visible Results", desc: "Visibly brighter, plumper, balanced and more radiant skin." }
          ]
        }
      };
      setData(mockReport);
      const urlParams = new URLSearchParams(window.location.search);
      setIsPaid(urlParams.get('paid') === 'true');
    } else {
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch (err) {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    }

    // Force DB synchronization of report data if analysis ID is present
    if (storedAnalysisId) {
      fetch(`/api/analysis-status?id=${storedAnalysisId}`)
        .then(r => r.json())
        .then(res => {
          if (res.isPaid) {
            sessionStorage.setItem('rms_is_paid', 'true');
            setIsPaid(true);
            if (res.report) {
              sessionStorage.setItem('rms_report', JSON.stringify(res.report));
              setData(res.report);
            }
          }
        })
        .catch(() => {});
    }

    // 2. Fetch identity + paid_unlocks
    fetch('/api/identity')
      .then(r => r.json())
      .then(data => {
        const { userId: uid, paidUnlocks: unlocks } = data;
        setUserId(uid);
        if (unlocks > 0) setPaidUnlocks(unlocks);
      })
      .catch(() => {});
  }, [lang]);

  // 3. Handle payment=success query param
  const unlockBody = () => {
    const top = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    if (top) window.scrollTo(0, -parseInt(top || '0'));
  };

  useEffect(() => {
    let progressInterval;
    let factInterval;
    let stepInterval;
    let fadeTimeout;
    let stepFadeTimeout;

    if (checkingPayment) {
      const startTime = Date.now();
      const totalDuration = 18000; // 18 seconds max

      progressInterval = setInterval(() => {
        const elapsed = Math.min(Date.now() - startTime, totalDuration);
        const t = elapsed / totalDuration;
        const eased = 1 - Math.pow(1 - t, 2.8);
        const currentProgress = Math.min(eased * 99, 99);
        setProgress(currentProgress);
      }, 80);

      // Analysis steps rotate every 2.8s
      stepInterval = setInterval(() => {
        setStepFade(false);
        stepFadeTimeout = setTimeout(() => {
          setAnalysisStep(prev => Math.min(prev + 1, (lang === 'fr' ? PREMIUM_STEPS_FR : PREMIUM_STEPS_EN).length - 1));
          setStepFade(true);
        }, 350);
      }, 2800);

      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      setProgress(0);
      setFactIndex(0);
      setFade(true);
      setAnalysisStep(0);
      setStepFade(true);
      unlockBody();
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(fadeTimeout);
      clearTimeout(stepFadeTimeout);
      unlockBody();
    };
  }, [checkingPayment, lang]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.payment !== 'success') return;

    const storedAnalysisId = sessionStorage.getItem('rms_analysis_id');
    if (!storedAnalysisId) return;

    const sessionId = router.query.session_id || '';

    setCheckingPayment(true);
    // Remove query param from URL
    router.replace('/report', undefined, { shallow: true });

    // Poll analysis status — up to 12 attempts × 2s = 24s coverage for Claude generation
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch(`/api/analysis-status?id=${storedAnalysisId}&session_id=${encodeURIComponent(sessionId)}`);
        const { isPaid: paid, report } = await res.json();
        if (paid) {
          sessionStorage.setItem('rms_is_paid', 'true');
          if (report) {
            sessionStorage.setItem('rms_report', JSON.stringify(report));
            setData(report);
          }
          setIsPaid(true);
          setProgress(100);
          setTimeout(() => {
            setCheckingPayment(false);
          }, 350);
          return;
        }
      } catch { }
      attempts++;
      if (attempts < 12) {
        setTimeout(poll, 2000);
      } else {
        setCheckingPayment(false);
      }
    };

    poll();
  }, [router.isReady, router.query.payment, router.query.session_id]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    try {
      await Promise.all([
        fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), newsletter: newsletterConsent }),
        }),
        fetch('/api/identity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        }),
      ]);
    } catch {}
    localStorage.setItem('rms_email_captured', '1');
    localStorage.setItem('rms_user_email', email.trim());
    setEmailCaptured(true);
    setShowEmailGate(false);
    setEmailLoading(false);
  };

  // 4. handleUnlock: calls checkout, redirects to Stripe
  const handleUnlock = async (planId) => {
    if (!userId || !analysisId) return;
    const email = typeof window !== 'undefined'
      ? (localStorage.getItem('rms_user_email') || localStorage.getItem('rms_email') || '')
      : '';
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, analysisId, planId, email }),
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error('Failed to parse checkout response');
      }

      const { url, error: err } = json;
      if (err) throw new Error(err);
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err.message);
    }
  };

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
          className="btn-liquid-glass-dark"
          style={{
            borderRadius: 10, padding: '12px 24px', fontSize: 13,
            fontWeight: 600, border: 'none',
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
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="canonical" href="https://ratemyskin.co/report" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ratemyskin.co/report" />
        <meta property="og:title" content={t('reportTitle')} />
        <meta property="og:description" content={t('reportMetaDesc')} />
        <meta property="og:image" content="https://ratemyskin.co/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('reportTitle')} />
        <meta name="twitter:description" content={t('reportMetaDesc')} />
        <meta name="twitter:image" content="https://ratemyskin.co/og-image.png" />
      </Head>

      {/* ── Full-screen Premium Generation Loading Page ── */}
      {checkingPayment && (
        <div className="analysis-loading-overlay" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'linear-gradient(160deg, #FDFAF7 0%, #FBF6F0 35%, #F5EDE3 70%, #EDD9C5 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px',
          paddingTop: 'max(32px, env(safe-area-inset-top))',
          paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
          textAlign: 'center',
          animation: 'fadeIn 0.6s ease-out forwards',
          gap: 0,
        }}>
          {/* Silk texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none',
            background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 1000 1000\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'silk\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.005\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type=\'linear\' slope=\'0.03\'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23silk)\'/%3E%3C/svg%3E")',
          }} />

          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%', maxWidth: '440px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '28px',
          }}>

            {/* ── TOP: Flower + Live step ── */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
              width: '100%',
            }}>
              {/* Flower spinning */}
              <div style={{
                filter: 'drop-shadow(0 0 12px rgba(201,169,97,0.35))',
                animation: 'floatBob 3s ease-in-out infinite',
              }}>
                <LuxuryFlower width={52} height={52} />
              </div>

              {/* Title */}
              <div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '22px', fontWeight: 700,
                  color: '#3D2914', margin: '0 0 4px',
                  letterSpacing: '0.01em',
                }}>
                  {lang === 'fr' ? 'Génération de votre rapport Premium…' : 'Generating your Premium report…'}
                </h2>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px', color: '#8C7A6B', margin: 0,
                }}>
                  {lang === 'fr' ? 'Diagnostic avancé par IA en cours' : 'Advanced AI Diagnosis in progress'}
                </p>
              </div>

              {/* Live step pill (clean capsule style) */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255, 255, 255, 0.45)',
                border: '1px solid rgba(168, 116, 73, 0.12)',
                borderRadius: '30px',
                padding: '6px 14px',
                opacity: stepFade ? 1 : 0,
                transition: 'opacity 350ms ease-in-out',
                marginTop: '8px',
                width: 'fit-content',
                margin: '8px auto 0',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, animation: 'stepIconPulse 1.5s ease-in-out infinite' }}>
                  <path d={(lang === 'fr' ? PREMIUM_STEPS_FR : PREMIUM_STEPS_EN)[analysisStep]?.icon} />
                </svg>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px', fontWeight: 500,
                  color: '#8C7A6B', letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}>
                  {(lang === 'fr' ? PREMIUM_STEPS_FR : PREMIUM_STEPS_EN)[analysisStep]?.label}
                </span>
              </div>
            </div>

            {/* ── CENTER: Horizontal progress bar (even thinner + shorter + centered) ── */}
            <div style={{ width: '100%', marginTop: '12px', marginBottom: '12px', textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '36px',
                fontWeight: 700,
                color: '#3D2914',
                lineHeight: 1,
                marginBottom: '14px',
              }}>
                {Math.round(progress)}%
              </div>
              <div style={{
                width: '180px',
                height: '1px',
                background: 'rgba(168, 116, 73, 0.12)',
                margin: '0 auto',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #A87449 0%, #C9A961 100%)',
                  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
            </div>

            {/* ── BOTTOM: Facts card ── */}
            <div 
              onTouchStart={(e) => {
                touchStartX.current = e.targetTouches[0].clientX;
                touchEndX.current = e.targetTouches[0].clientX;
              }}
              onTouchMove={(e) => {
                touchEndX.current = e.targetTouches[0].clientX;
              }}
              onTouchEnd={() => {
                const diff = touchStartX.current - touchEndX.current;
                if (diff > 50) {
                  handleFactChange((factIndex + 1) % FACTS.length);
                } else if (diff < -50) {
                  handleFactChange((factIndex - 1 + FACTS.length) % FACTS.length);
                }
              }}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(201,169,97,0.18)',
                borderRadius: '20px',
                padding: '20px 22px',
                boxShadow: '0 8px 28px rgba(61,41,20,0.04)',
                textAlign: 'left',
                boxSizing: 'border-box',
                cursor: 'grab',
                userSelect: 'none',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                  <path d="M9 18h6" /><path d="M10 22h4" />
                </svg>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: '#C9A961',
                }}>{lang === 'fr' ? 'Le saviez-vous ?' : 'Did you know?'}</span>
                {/* Dots indicator */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                  {FACTS.map((_, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleFactChange(i)}
                      style={{
                        width: i === factIndex ? 16 : 5, height: 5,
                        borderRadius: '9999px',
                        background: i === factIndex ? '#C9A961' : 'rgba(201,169,97,0.25)',
                        transition: 'all 0.4s ease',
                        cursor: 'pointer',
                      }} 
                    />
                  ))}
                </div>
              </div>

              {/* Fading fact content */}
              <div style={{
                opacity: fade ? 1 : 0,
                transition: 'opacity 400ms ease-in-out',
                minHeight: '72px',
              }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '16px', fontWeight: 700,
                  color: '#3D2914', margin: '0 0 6px', lineHeight: 1.3,
                }}>{FACTS[factIndex]?.title}</h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px', color: '#6B6B6B',
                  lineHeight: '1.6', margin: 0,
                }}>{FACTS[factIndex]?.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky frosted-glass nav */}
      <div className="rpt-nav" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        padding: 'calc(13px + env(safe-area-inset-top, 0px)) 26px 13px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        animation: 'slideDown 0.55s ease',
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {paidUnlocks > 0 && (
            <div className="mobile-hide" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, rgba(197,160,40,0.08), rgba(212,165,116,0.06))',
              border: '1px solid rgba(197,160,40,0.28)',
              borderRadius: 20, padding: '4px 11px',
            }}>
              <span style={{ fontSize: 7, color: '#C5A028', fontWeight: 700 }}>✦</span>
              <span style={{ fontSize: 11, color: '#8C6A3A', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                {t('paidUnlocksLeft', paidUnlocks)}
              </span>
            </div>
          )}
          <LangToggle />
          <button
            onClick={() => router.push('/blog')}
            className="mobile-hide"
            style={{
              background: 'none', border: 'none',
              padding: '9px 4px', fontSize: 12, color: '#888', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {t('blogNav')}
          </button>
          <button
            onClick={() => router.push('/mes-rapports')}
            className="mobile-hide"
            style={{
              background: 'none', border: 'none',
              padding: '9px 4px', fontSize: 12, color: '#888', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {t('myReportsNav')}
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn-liquid-glass rpt-nav-cta"
            style={{
              borderRadius: 10,
              padding: '9px 18px', fontSize: 12,
              border: 'none',
            }}
          >
            {t('newAnalysis')}
          </button>
        </div>
      </div>

      <div style={{
        filter: showEmailGate ? 'blur(12px)' : 'none',
        pointerEvents: showEmailGate ? 'none' : 'auto',
        userSelect: showEmailGate ? 'none' : 'auto',
        transition: 'filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <BeautyReport data={data} isPaid={isPaid} onUnlock={handleUnlock} />
      </div>

      {/* ── Email gate overlay ── */}
      {showEmailGate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(255, 253, 248, 0.45)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div className="card-blur" style={{
            borderRadius: 32,
            padding: 'clamp(32px, 6vw, 48px)',
            maxWidth: 420, width: '100%',
            boxShadow: '0 32px 80px rgba(130, 100, 80, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
              <LuxuryFlower width={72} height={72} />
            </div>

            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: '#C5A028', fontWeight: 500, margin: '0 0 10px',
            }}>
              {t('reward')}
            </p>

            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 400,
              color: '#2C241D', margin: '0 0 10px', lineHeight: 1.2,
            }}>
              {t('unlock2ndFree')}
            </h2>

            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: '#8C7A6B', lineHeight: 1.6,
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
                className="input-nacré"
                style={{
                  borderRadius: 16,
                  padding: '14px 18px', fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none', width: '100%', boxSizing: 'border-box',
                  color: '#3A2E26',
                }}
              />

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', marginTop: 6, textAlign: 'left' }}>
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(e) => setNewsletterConsent(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span style={{ fontSize: 11, color: '#8C7A6B', lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif" }}>
                  {t('newsletterConsent')}
                </span>
              </label>

              <button
                type="submit"
                disabled={emailLoading}
                className="btn-liquid-glass-dark"
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '14px 20px',
                  borderRadius: 16,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                {emailLoading ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    {t('saving')}
                  </>
                ) : (
                  t('claimFreeAnalysis')
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes stepIconPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .analysis-loading-overlay {
          position: fixed;
          inset: 0;
        }
        @media (max-width: 480px) {
          .analysis-loading-overlay > div > div { gap: 18px !important; }
        }
      `}</style>
    </>
  );
}
