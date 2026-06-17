import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo, { CreamDrop, LuxuryFlower } from '../components/Logo';
import { useLang } from '../lib/LangContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import MultiAngleCamera from '../components/MultiAngleCamera';
import ProductImage from '../components/ProductImage';
import { ProductCard } from '../components/BeautyReport';
import { createAdminClient } from '../lib/supabase';

export async function getStaticProps() {
  let teaserProducts = {
    morningCleanser: null,
    morningSerum: null,
    eveningCleanser: null,
    eveningTreatment: null
  };

  try {
    const supabase = createAdminClient();
    const { data: products } = await supabase.from('products').select('*');

    if (products && products.length > 0) {
      teaserProducts.morningCleanser = products.find(p => p.routine_step === 'cleanser' && p.product_name.includes('Effaclar')) || products.find(p => p.routine_step === 'cleanser') || products[0];
      teaserProducts.morningSerum = products.find(p => p.routine_step === 'serum' && p.product_name.includes('C15')) || products.find(p => p.routine_step === 'serum') || products[1] || products[0];
      teaserProducts.eveningCleanser = products.find(p => p.routine_step === 'cleanser' && p.product_name.includes('Clinique')) || products.find(p => p.routine_step === 'cleanser' && p.id !== teaserProducts.morningCleanser?.id) || products[2] || products[0];
      teaserProducts.eveningTreatment = products.find(p => p.routine_step === 'treatment' && p.product_name.includes('Retinol')) || products.find(p => p.routine_step === 'treatment') || products[3] || products[0];
    } else {
      throw new Error("Aucun produit trouvé dans la base");
    }
  } catch (err) {
    console.error('Error fetching teaser products:', err);
    // Fallback de secours si la base n'est pas accessible localement
    teaserProducts.morningCleanser = {
      product_name: "Gel Moussant Purifiant Effaclar", brand: "La Roche-Posay", routine_step: "cleanser",
      skin_types: ["oily", "combination"], concerns: ["acne"], rating: 4.8, count: "2k+", actives: ["Zinc PCA", "Eau Thermale"],
      product_image_url: "https://votre-projet.supabase.co/storage/v1/object/public/products/la-roche-posay-effaclar.jpg"
    };
    teaserProducts.morningSerum = {
      product_name: "C15 Super Booster Vitamine C", brand: "Paula's Choice", routine_step: "serum",
      skin_types: ["all"], concerns: ["hyperpigmentation", "dark_spots"], rating: 4.6, count: "1k+", actives: ["15% Vitamine C pure", "Acide férulique"],
      product_image_url: "https://votre-projet.supabase.co/storage/v1/object/public/products/paulas-choice-c15.jpg"
    };
    teaserProducts.eveningCleanser = {
      product_name: "Take The Day Off Baume", brand: "Clinique", routine_step: "cleanser",
      skin_types: ["all"], concerns: ["acne"], rating: 4.7, count: "5k+", actives: ["Huile de Carthame", "Vitamine E"],
      product_image_url: "https://votre-projet.supabase.co/storage/v1/object/public/products/clinique-take-the-day-off.jpg"
    };
    teaserProducts.eveningTreatment = {
      product_name: "Retinol 0.2% in Squalane", brand: "The Ordinary", routine_step: "treatment",
      skin_types: ["all"], concerns: ["aging", "acne"], rating: 4.5, count: "3k+", actives: ["Rétinol pur (0.2%)", "Squalane"],
      product_image_url: "https://votre-projet.supabase.co/storage/v1/object/public/products/the-ordinary-retinol.jpg"
    };
  }

  return {
    props: {
      teaserProducts
    },
    revalidate: 3600
  };
}

const SKIN_CONCERN_MAX = 200;
const GOLD = '#C5A028';

/* ── Language toggle ── */
function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {['en', 'fr'].map((l, i) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {i > 0 && <span style={{ color: '#E0DDD8', fontSize: 11, lineHeight: 1 }}>|</span>}
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

/* ── Main page ── */
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

const ANALYSIS_STEPS = [
  { icon: "M12 2v3m0 14v3M2 12h3m14 0h3M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0", label: "Détection du type de peau…" },
  { icon: "M3 3h18v18H3zm0 6h18M3 15h18M9 3v18M15 3v18", label: "Analyse des pores et texture…" },
  { icon: "M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z", label: "Mesure de l'hydratation…" },
  { icon: "M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z", label: "Cartographie des zones sensibles…" },
  { icon: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", label: "Recherche des ridules…" },
  { icon: "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41", label: "Évaluation du teint et phototype…" },
  { icon: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6", label: "Calcul de l'uniformité cutanée…" },
  { icon: "M12 2l3.09 6.26 6.91 1.01-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "Scoring global de votre peau…" },
  { icon: "M9 3H15M10 3V9L5.3 18.4A2 2 0 0 0 7.1 21H16.9A2 2 0 0 0 18.7 18.4L14 9V3M14 9H10", label: "Sélection des actifs skincare…" },
  { icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8M16 17H8", label: "Génération du rapport final…" },
];

/* ── Testimonials ── */
function Testimonials({ lang }) {
  const data = [
    {
      name: "Christelle",
      age: 38,
      concern: lang === 'fr' ? "Taches pigmentaires & Teint terne" : "Pigmentation & Dullness",
      quote: lang === 'fr'
        ? "J'ai complètement repensé ma routine grâce au scan. Fini les produits trop agressifs, ma peau respire et mes taches s'estompent enfin !"
        : "I completely revamped my routine thanks to the scan. No more harsh products, my skin breathes and my dark spots are finally fading!",
      rating: 5,
      isVerified: true
    }
  ];

  return (
    <div style={{
      maxWidth: 960,
      margin: '0 auto 64px',
      padding: '0 24px',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Small badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <span style={{
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#D4A574",
          background: "rgba(212, 165, 116, 0.05)",
          border: "1px solid rgba(212, 165, 116, 0.15)",
          borderRadius: 20,
          padding: "4px 12px",
          fontFamily: "'DM Sans', sans-serif"
        }}>
          {lang === 'fr' ? "TÉMOIGNAGES" : "COMMUNITY FEEDBACK"}
        </span>
      </div>

      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(26px, 4.5vw, 36px)',
        fontWeight: 400,
        color: '#3A2E26',
        textAlign: 'center',
        margin: '0 0 10px',
        letterSpacing: '-0.01em',
      }}>
        {lang === 'fr' ? "L'avis de la communauté" : "Real results"}
      </h3>
      <p style={{
        fontSize: 13,
        color: '#A2968B',
        textAlign: 'center',
        margin: '0 auto 38px',
        maxWidth: 500,
        lineHeight: 1.6,
        letterSpacing: '0.01em',
      }}>
        {lang === 'fr'
          ? "Découvrez comment Rate My Skin aide à faire les bons choix pour sa peau."
          : "Discover how Rate My Skin helps you make the right choices for your skin."}
      </p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
      }}>
        {data.map((t, idx) => {
          return (
            <div
              key={idx}
              className="bubble-nacré"
              style={{
                width: '100%',
                maxWidth: 360,
                borderRadius: 28,
                padding: '28px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(253, 246, 237, 0.45) 50%, rgba(246, 235, 222, 0.65) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(168, 116, 73, 0.12)',
                boxShadow: '0 8px 32px rgba(168, 116, 73, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(168, 116, 73, 0.35)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(168, 116, 73, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(168, 116, 73, 0.12)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(168, 116, 73, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
              }}
            >
              <div>
                {/* Header: stars */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ color: '#C5A028', fontSize: 14, letterSpacing: 1 }}>
                    {"★".repeat(t.rating)}
                  </div>
                </div>

                {/* Quote */}
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  color: '#2C2416',
                  lineHeight: 1.5,
                  letterSpacing: '0.01em',
                  margin: '0 0 20px',
                }}>
                  "{t.quote}"
                </p>
              </div>

              {/* Profile footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(168, 116, 73, 0.08)',
                paddingTop: 14,
                marginTop: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Avatar placeholder with luxury gold gradient styling */}
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FAF6F0 0%, #D4A574 100%)',
                    color: '#3A2E26',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: "'Cormorant Garamond', serif",
                    boxShadow: '0 2px 8px rgba(168, 116, 73, 0.1)'
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3A2E26' }}>
                      {t.name}, {t.age} {lang === 'fr' ? 'ans' : 'y/o'}
                    </div>
                    <div style={{ fontSize: 11, color: '#8C6A3A', marginTop: 1, letterSpacing: '0.02em' }}>
                      {t.concern}
                    </div>
                  </div>
                </div>

                {/* Verified badge */}
                {t.isVerified && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: '#7DBFA8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {lang === 'fr' ? 'Avis vérifié' : 'Verified review'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FAQ({ lang, t }) {
  const faqData = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto 64px', padding: '0 20px' }}>
      {/* Small badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <span style={{
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#D4A574",
          background: "rgba(212, 165, 116, 0.05)",
          border: "1px solid rgba(212, 165, 116, 0.15)",
          borderRadius: 20,
          padding: "4px 12px",
          fontFamily: "'DM Sans', sans-serif"
        }}>
          {lang === 'fr' ? "Questions fréquentes" : "FAQ"}
        </span>
      </div>

      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(20px, 3.5vw, 26px)',
        fontWeight: 400,
        color: '#3A2E26',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: '-0.01em',
      }}>
        FAQ
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqData.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              style={{
                borderRadius: 12,
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                border: '1px solid rgba(168, 116, 73, 0.08)',
                background: isOpen ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.25)',
                boxShadow: isOpen ? '0 4px 16px rgba(168, 116, 73, 0.02)' : 'none',
              }}
              onClick={() => toggle(idx)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#2C2416',
                  textAlign: 'left',
                }}>
                  {item.q}
                </span>
                <span style={{
                  fontSize: 9,
                  color: '#C5A028',
                  transition: 'transform 0.3s ease',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  ▼
                </span>
              </div>
              <div style={{
                maxHeight: isOpen ? 250 : 0,
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  color: '#2C2416',
                  lineHeight: 1.5,
                  margin: '8px 0 0',
                  textAlign: 'left',
                }}>
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home({ teaserProducts }) {
  const router = useRouter();
  const { lang, t } = useLang();



  const renderFloatingAccent = (label, pct, color, style, className, animClass) => (
    <div className={`floating-accent ${className}`} style={{ ...style, animation: `${animClass} 4s ease-in-out infinite` }}>
      <div style={{ position: 'relative', width: 28, height: 28 }}>
        <svg width="28" height="28" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(201,169,97,0.15)" strokeWidth="3" />
          <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 14 * (pct / 100)} ${2 * Math.PI * 14}`}
            strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#2C2416' }}>
          {pct}
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#2C2416', fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
    </div>
  );

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleFactChange = (newIndex) => {
    setFade(false);
    setTimeout(() => {
      setFactIndex(newIndex);
      setFade(true);
    }, 200);
  };

  const [showCamera, setShowCamera] = useState(false);
  const [showMultiAngle, setShowMultiAngle] = useState(false);
  const [showUploadSelector, setShowUploadSelector] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);

  const [emailCaptured, setEmailCaptured] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'file' | 'camera'

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [skinConcern, setSkinConcern] = useState('');
  const [age, setAge] = useState('');
  const [climate, setClimate] = useState('');
  const [allergies, setAllergies] = useState('');
  const [activeChips, setActiveChips] = useState([]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState('landing');
  const [hasSentQuestionsViewed, setHasSentQuestionsViewed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [paidUnlocks, setPaidUnlocks] = useState(0);

  const [showStickyCta, setShowStickyCta] = useState(false);
  const heroCtaRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroCtaRef.current) return;
      const rect = heroCtaRef.current.getBoundingClientRect();
      // Show sticky CTA once the bottom of the hero CTA goes above the viewport top
      setShowStickyCta(rect.bottom < 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [stepFade, setStepFade] = useState(true);
  const [routineTeaserTab, setRoutineTeaserTab] = useState('morning');

  useEffect(() => {
    // Migrate old localStorage key so returning users are recognised
    const oldEmail = localStorage.getItem('rms_email');
    if (oldEmail && !localStorage.getItem('rms_user_email')) {
      localStorage.setItem('rms_user_email', oldEmail);
    }

    const captured = localStorage.getItem('rms_email_captured') === '1';
    setEmailCaptured(captured);

    fetch('/api/identity')
      .then(r => r.json())
      .then(({ userId: uid, paidUnlocks: unlocks, email: cookieEmail }) => {
        setUserId(uid);
        if (unlocks > 0) setPaidUnlocks(unlocks);
        // Cookie email means this device is already identified — skip the gate
        if (cookieEmail) {
          setEmail(cookieEmail);
          setEmailCaptured(true);
          localStorage.setItem('rms_user_email', cookieEmail);
          localStorage.setItem('rms_email_captured', '1');
        }
      })
      .catch(() => { });
  }, []);

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

    if (loading) {
      const startTime = Date.now();
      const totalDuration = 20000; // 20s max — ease-out so it slows near 99%

      progressInterval = setInterval(() => {
        const elapsed = Math.min(Date.now() - startTime, totalDuration);
        // Ease-out curve: fast start, slows dramatically near 99%
        const t = elapsed / totalDuration;
        const eased = 1 - Math.pow(1 - t, 2.8);
        const currentProgress = Math.min(eased * 99, 99);
        setProgress(currentProgress);
      }, 80);

      // Analysis steps rotate every 2s, synced with progress stages
      stepInterval = setInterval(() => {
        setStepFade(false);
        stepFadeTimeout = setTimeout(() => {
          setAnalysisStep(prev => Math.min(prev + 1, ANALYSIS_STEPS.length - 1));
          setStepFade(true);
        }, 350);
      }, 2000);

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
  }, [loading]);

  /* ── Email submit ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    setEmailLoading(true);
    try {
      await Promise.all([
        fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, newsletter: newsletterConsent }),
        }),
        // Sets httpOnly email cookie so this device is auto-identified on return
        fetch('/api/identity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail }),
        }),
      ]);
    } catch { }
    localStorage.setItem('rms_email_captured', '1');
    localStorage.setItem('rms_user_email', trimmedEmail);
    if (firstName.trim()) {
      localStorage.setItem('rms_first_name', firstName.trim());
    } else {
      localStorage.removeItem('rms_first_name');
    }
    setEmailCaptured(true);

    // Smooth transition: close overlay, then resume the action the user originally triggered
    setTimeout(() => {
      setOverlayVisible(false);
      setEmailLoading(false);
      setTimeout(() => {
        if (pendingAction === 'file') {
          fileInputRef.current?.click();
        } else if (pendingAction === 'camera') {
          setShowMultiAngle(true);
        } else {
          handleAnalyse(true);
        }
        setPendingAction(null);
      }, 300);
    }, 650);
  };

  /* ── Email gate guard: show overlay or proceed directly ── */
  const requireEmail = (action, e) => {
    if (e) e.stopPropagation();
    if (emailCaptured) {
      if (action === 'file') fileInputRef.current?.click();
      else if (action === 'camera') setShowMultiAngle(true);
    } else {
      setPendingAction(action);
      setOverlayVisible(true);
    }
  };

  /* ── Handle multi-angle captures ── */
  const handleMultiAngleCaptures = (captures) => {
    setShowMultiAngle(false);
    // Use the frontal (FRONT) image as the primary image for analysis
    // The other angles can be used for extended analysis in the future
    if (captures.FRONT) {
      processFile(captures.FRONT);
    } else if (captures.LEFT) {
      processFile(captures.LEFT);
    } else if (captures.RIGHT) {
      processFile(captures.RIGHT);
    }
  };

  /* ── File handling ── */
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError(t('invalidFile')); return; }
    if (file.size > 20 * 1024 * 1024) { setError(t('fileTooLarge')); return; }
    setError('');
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
    setCurrentStep('questions');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  /* ── Skin concern chips ── */
  const quickConcerns = [
    { key: 'Acne', label: t('quickConcernAcne') },
    { key: 'Pimples', label: t('quickConcernPimples') },
    { key: 'Dryness', label: t('quickConcernDryness') },
    { key: 'Oily', label: t('quickConcernOily') },
    { key: 'Sensitivity', label: t('quickConcernSensitivity') },
    { key: 'Aging', label: t('quickConcernAging') },
    { key: 'DarkSpots', label: t('quickConcernDarkSpots') },
    { key: 'LargePores', label: t('quickConcernPores') },
    { key: 'Redness', label: t('quickConcernRedness') },
    { key: 'DarkCircles', label: t('quickConcernDarkCircles') },
    { key: 'Blackheads', label: t('quickConcernBlackheads') },
    { key: 'Sebum', label: t('quickConcernSebum') },
  ];

  const handleChip = (key, label) => {
    setActiveChips(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      const labels = next.map(k => quickConcerns.find(c => c.key === k)?.label ?? k);
      setSkinConcern(labels.join(', '));
      return next;
    });
  };

  /* ── Camera overlay ── */
  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 80);
    } catch {
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const capturePhoto = () => {
    // Screen flash — illuminate face for 200ms then capture
    setScreenFlash(true);
    setTimeout(() => {
      setScreenFlash(false);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(blob => {
        if (blob) processFile(new File([blob], 'selfie.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.92);
      stopCamera();
    }, 200);
  };

  const handleSkipQuestions = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'questions_skipped', {
        event_category: 'conversion_funnel',
        event_label: 'optional_questions_step'
      });
    }
    handleAnalyse();
  };

  useEffect(() => {
    if (currentStep === 'questions' && !hasSentQuestionsViewed) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'questions_step_viewed', {
          event_category: 'conversion_funnel',
          event_label: 'optional_questions_step'
        });
      }
      setHasSentQuestionsViewed(true);
    }
  }, [currentStep, hasSentQuestionsViewed]);

  const handleAnalyse = async () => {
    if (!image) return;

    setLoading(true);
    setError('');

    // Start min 8s promise
    const minDurationPromise = new Promise(resolve => setTimeout(resolve, 8000));

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

      const storedEmail = localStorage.getItem('rms_user_email') || localStorage.getItem('rms_email') || null;

      const apiCallPromise = (async () => {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            mimeType,
            userId: userId || null,
            lang,
            skinConcern: skinConcern.trim() || null,
            age: age.trim() || null,
            climate: climate.trim() || null,
            allergies: allergies.trim() || null,
            email: storedEmail,
          }),
        });

        if (!res.ok) {
          let errMsg = t('analysisFailed');
          try {
            const errJson = await res.json();
            if (errJson.error === 'no_face') throw new Error(errJson.message || t('noFaceError'));
            if (errJson.error) errMsg = errJson.error;
          } catch {
            try {
              const txt = await res.text();
              if (txt) errMsg = txt.substring(0, 100);
            } catch { }
          }
          throw new Error(errMsg);
        }

        let json;
        try {
          json = await res.json();
        } catch {
          throw new Error(t('analysisFailed'));
        }

        if (json.error === 'no_face') throw new Error(json.message || t('noFaceError'));
        if (json.error) throw new Error(json.error || t('analysisFailed'));

        return json;
      })();

      // Wait for both the minimum 8s delay and the API call
      const [_, json] = await Promise.all([minDurationPromise, apiCallPromise]);

      sessionStorage.setItem('rms_report', JSON.stringify(json.data));
      sessionStorage.setItem('rms_analysis_id', json.analysisId);
      sessionStorage.setItem('rms_is_paid', json.isPaid ? 'true' : 'false');
      sessionStorage.setItem('rms_generation_finished_at', Date.now().toString());
      sessionStorage.setItem('rms_age', age.trim());
      // Sync userId from server response in case it was server-generated
      if (json.userId && !userId) setUserId(json.userId);
      // Update paid_unlocks counter from server response
      if (typeof json.paidUnlocksLeft === 'number') setPaidUnlocks(json.paidUnlocksLeft);

      setProgress(100);
      // Give a tiny moment for 100% to display before router navigates
      setTimeout(() => {
        router.push('/report');
      }, 150);
    } catch (err) {
      setError(err.message || t('analysisFailed'));
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Note Ma Peau - Analyse IA Gratuite de ta Peau | Rate My Skin</title>
        <meta name="description" content="Note ma peau gratuitement avec notre IA. Diagnostic de peau personnalisé en 30 secondes. Score, conseils et produits adaptés." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="canonical" href="https://ratemyskin.co/" />
        <link rel='alternate' hreflang='fr' href='https://ratemyskin.co/' />
        <link rel='alternate' hreflang='x-default' href='https://ratemyskin.co/' />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ratemyskin.co/" />
        <meta property="og:title" content="Note Ma Peau - Analyse IA Gratuite" />
        <meta property="og:description" content="Note ma peau gratuitement avec notre IA. Diagnostic de peau personnalisé en 30 secondes. Score, conseils et produits adaptés." />
        <meta property="og:image" content="https://ratemyskin.co/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Note Ma Peau - Analyse IA Gratuite" />
        <meta name="twitter:description" content="Note ma peau gratuitement avec notre IA. Diagnostic de peau personnalisé en 30 secondes. Score, conseils et produits adaptés." />
        <meta name="twitter:image" content="https://ratemyskin.co/og-image.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Rate My Skin',
            url: 'https://ratemyskin.co',
            applicationCategory: 'HealthApplication',
            description: 'Analyse IA de peau gratuite. Obtenez votre score de peau et des recommandations skincare personnalisées en 30 secondes.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          })
        }} />
      </Head>

      {/* ── Welcoming Banner ── */}
      <div className="welcome-banner" style={{
        background: 'linear-gradient(90deg, #FDFCF9 0%, #FAF2EA 50%, #FDFCF9 100%)',
        borderBottom: '1px solid rgba(197, 160, 40, 0.12)',
        padding: 'calc(6px + env(safe-area-inset-top, 0px)) 12px 6px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        position: 'relative',
        zIndex: 210,
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#C5A028', opacity: 0.85, animation: 'floatBob 3s ease-in-out infinite', flexShrink: 0 }}>
          <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        </svg>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(9.5px, 2.7vw, 11px)',
          fontWeight: 500,
          color: '#8C6A4F',
          letterSpacing: '0.04em',
          lineHeight: '1.4',
          textAlign: 'center'
        }}>
          {lang === 'fr'
            ? 'Bienvenue ! Révélons ensemble l’éclat naturel de votre peau.'
            : 'Welcome! Let’s reveal your skin’s natural radiance together.'}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#C5A028', opacity: 0.85, animation: 'floatBob 3s ease-in-out infinite', flexShrink: 0 }}>
          <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        </svg>
      </div>

      {/* ── Sticky nav ── */}
      <div className="nav-blur" style={{
        position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 4px 20px rgba(180, 160, 140, 0.04)',
        padding: '13px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%',
      }}>
        {/* Left Section */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <LangToggle />
          {paidUnlocks > 0 && (
            <div className="mobile-hide" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, rgba(197,160,40,0.08), rgba(212,165,116,0.06))',
              border: '1px solid rgba(197,160,40,0.28)',
              borderRadius: 20, padding: '4px 11px',
            }}>
              <span style={{ fontSize: 7, color: '#C5A028', fontWeight: 700 }}>✦</span>
              <span style={{ fontSize: 11, color: '#8C6A3A', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                {t('paidUnlocksIncluded', paidUnlocks)}
              </span>
            </div>
          )}
        </div>

        {/* Center Section */}
        <div 
          onClick={() => router.push('/')} 
          style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Logo />
        </div>

        {/* Right Section */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 }}>
          <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)', minWidth: 0 }}>
            <button
              onClick={() => router.push('/technologie')}
              style={{
                background: 'none', border: 'none',
                padding: '2px 0', fontSize: 'clamp(11px, 2vw, 12px)', color: '#8C7A6B', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                letterSpacing: '0.02em', whiteSpace: 'nowrap'
              }}
            >
              {t('techNav')}
            </button>
            <button
              onClick={() => router.push('/blog')}
              style={{
                background: 'none', border: 'none',
                padding: '2px 0', fontSize: 'clamp(11px, 2vw, 12px)', color: '#8C7A6B', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                letterSpacing: '0.02em', whiteSpace: 'nowrap'
              }}
            >
              {t('blogNav')}
            </button>
            <button
              onClick={() => router.push('/mes-rapports')}
              style={{
                background: 'none', border: 'none',
                padding: '2px 0', fontSize: 'clamp(11px, 2vw, 12px)', color: '#8C7A6B', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                letterSpacing: '0.02em', whiteSpace: 'nowrap'
              }}
            >
              {t('myReportsNav')}
            </button>
          </div>

          <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-toggle-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C241D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </label>
        </div>

        {/* Mobile Hamburger Button Input Control */}
        <input type="checkbox" id="mobile-nav-toggle-checkbox" className="mobile-nav-toggle" />

        {/* Mobile Navigation Drawer Backdrop Overlay */}
        <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-overlay" />

        {/* Mobile Drawer Content */}
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-drawer-header">
            <div 
              onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/'); }} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Logo height={28} />
            </div>
            <label htmlFor="mobile-nav-toggle-checkbox" className="mobile-nav-drawer-close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C241D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </label>
          </div>
          <div className="mobile-nav-drawer-links">
            <button className="mobile-nav-drawer-link" onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/technologie'); }}>
              {t('techNav')}
            </button>
            <button className="mobile-nav-drawer-link" onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/blog'); }}>
              {t('blogNav')}
            </button>
            <button className="mobile-nav-drawer-link" onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/mes-rapports'); }}>
              {t('myReportsNav')}
            </button>
          </div>
          <div className="mobile-nav-drawer-cta">
            <button
              onClick={() => { document.getElementById('mobile-nav-toggle-checkbox').checked = false; router.push('/'); }}
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
          </div>
        </div>
      </div>

      <main
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{
          minHeight: 'calc(100vh - 60px)',
          background: 'transparent',
          fontFamily: "'DM Sans', sans-serif",
          filter: (overlayVisible && !emailCaptured) ? 'blur(8px)' : 'none',
          pointerEvents: (overlayVisible && !emailCaptured) ? 'none' : 'auto',
          transition: 'filter 0.65s ease',
          userSelect: (overlayVisible && !emailCaptured) ? 'none' : 'auto',
        }}
      >
        {currentStep === 'landing' ? (
          <>
            <style>{`
              @keyframes float1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
              @keyframes float2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
              @keyframes float3 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
              .floating-accent {
                position: absolute;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(201, 169, 97, 0.2);
                border-radius: 40px;
                padding: 6px 12px 6px 6px;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 8px 24px rgba(44, 36, 22, 0.08);
                z-index: 10;
              }
              @media (max-width: 768px) {
                .floating-accent.hide-mobile { display: none; }
                .mobile-hide { display: none !important; }
                .hero-mockup-col { margin-top: 24px; }
              }
              .metric-card {
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                cursor: pointer;
              }
              .metric-card:hover {
                transform: translateY(-4px) scale(1.02);
                border-color: rgba(201, 169, 97, 0.4) !important;
                box-shadow: 0 12px 24px rgba(168, 116, 73, 0.08) !important;
                background: rgba(255, 255, 255, 0.8) !important;
              }
              @keyframes dash { from { stroke-dasharray: 0 100; } }
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(16px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes phoneFloat {
                0%, 100% { transform: translateY(-10px); }
                50% { transform: translateY(-20px); }
              }
              @keyframes glowPulse {
                0% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
                70% { box-shadow: 0 0 0 12px rgba(212, 165, 116, 0); }
                100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0); }
              }
              .hero-stagger-1 { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.1s; }
              .hero-stagger-2 { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.2s; }
              .hero-stagger-3 { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.3s; }
              .hero-stagger-4 { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.4s; }
              .premium-cta-primary {
                background: linear-gradient(135deg, #2C2416 0%, #1A150C 100%) !important;
                color: #FFFFFF !important;
                border-radius: 100px !important;
                box-shadow: 0 8px 24px rgba(44, 36, 22, 0.2) !important;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                cursor: pointer;
              }
              .premium-cta-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 32px rgba(44, 36, 22, 0.3) !important;
              }
              .premium-cta-secondary {
                background: rgba(255, 255, 255, 0.7) !important;
                color: #2C2416 !important;
                border: 1px solid rgba(212, 165, 116, 0.3) !important;
                border-radius: 100px !important;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                cursor: pointer;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
              }
              .premium-cta-secondary:hover {
                transform: translateY(-2px);
                background: rgba(255, 255, 255, 0.95) !important;
                border-color: rgba(212, 165, 116, 0.6) !important;
                box-shadow: 0 8px 24px rgba(212, 165, 116, 0.12) !important;
              }
            `}</style>
            {/* ═══ HERO: Two-column layout on desktop ═══ */}
            <div style={{
              maxWidth: 1080,
              margin: '0 auto',
              padding: '48px 24px 0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'clamp(32px, 4vw, 56px)',
              justifyContent: 'center',
            }}>
              {/* LEFT COLUMN: Hook + Upload */}
              <div style={{
                flex: '1 1 340px',
                maxWidth: 520,
                textAlign: 'left',
              }}>
                <p className="hero-stagger-1" style={{
                  fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                  fontWeight: 700, marginBottom: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#D4A574',
                }}>
                  {t('facialAestheticsAnalysis')}
                </p>
                <h1 className="hero-stagger-1 hero-h1" style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 400,
                  color: '#2C2416', lineHeight: 1.18, margin: '0 0 10px',
                }}>
                  {t('landingHook')}
                </h1>
                <h2 className="hero-stagger-2 hero-h2" style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(20px, 3.5vw, 24px)',
                  fontStyle: 'italic',
                  color: '#D4A574',
                  margin: '0 0 16px',
                  fontWeight: 400
                }}>
                  {lang === 'fr' ? 'Diagnostic facial IA · Score & conseils personnalisés' : 'AI facial diagnosis · Score & personalized advice'}
                </h2>
                <div className="hero-stagger-2" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: '6px 12px', background: 'rgba(212, 165, 116, 0.08)', borderRadius: 20, border: '1px solid rgba(212, 165, 116, 0.2)' }}>
                  <span style={{ color: '#D4A574', fontSize: 14 }}>✦</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#D4A574', textTransform: 'uppercase' }}>
                    {lang === 'fr' ? 'Analyse gratuite · Rapport complet dès 7,99€' : 'Free analysis · Full report from €7.99'}
                  </span>
                </div>
                <p className="hero-stagger-3 hero-p" style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'clamp(16px, 2.5vw, 17px)',
                  fontWeight: 400,
                  color: '#2C2416',
                  lineHeight: 1.5,
                  margin: '0 0 32px',
                  letterSpacing: '0.01em',
                }}>
                  {lang === 'fr' ? (
                    <>Le vrai problème de ta peau n'est peut-être pas <strong style={{ fontWeight: 700 }}>celui que tu crois.</strong></>
                  ) : (
                    <>Your real skin issue might not be <strong style={{ fontWeight: 700 }}>what you think.</strong></>
                  )}
                </p>

                {/* Upload Zone — desktop: full drag-drop; mobile: CTA button only */}
                <div className="hero-stagger-4">
                  {/* Desktop drag-drop card — hidden on mobile via CSS */}
                  <div className="hero-upload-zone-desktop" style={{
                    padding: '12px 8px 16px',
                    borderRadius: 12,
                    border: '1px solid rgba(201, 169, 97, 0.45)',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(248, 244, 237, 0.18) 100%)',
                    boxShadow: '0 10px 24px rgba(168, 116, 73, 0.02)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Filigree brand flower decoration */}
                    <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.03, pointerEvents: 'none' }}>
                      <LuxuryFlower width={200} height={200} />
                    </div>

                    <div
                      onClick={(e) => !imageUrl && fileInputRef.current?.click()}
                      className="card-nacré hero-upload-box"
                      style={{
                        border: dragOver ? `1.5px solid ${GOLD}` : '1px solid rgba(201, 169, 97, 0.22)',
                        boxShadow: dragOver
                          ? 'inset 0 0 0 2px #C5A028, inset 0 4px 12px rgba(0,0,0,0.02)'
                          : '0 12px 32px rgba(168, 116, 73, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                        borderRadius: 22,
                        padding: imageUrl ? 0 : '40px 24px',
                        textAlign: 'center',
                        cursor: imageUrl ? 'default' : 'pointer',
                        background: dragOver ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 1,
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
                              background: 'rgba(13,13,13,0.82)', color: '#fff',
                              border: 'none', borderRadius: 8, padding: '7px 14px',
                              fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {t('changePhoto')}
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Simplified Elegant Face Scan Icon */}
                          <div className="hero-upload-desktop-hint" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                              {/* Simple elegant scan oval */}
                              <rect x="3" y="3" width="38" height="38" rx="19" stroke="#C9A961" strokeWidth="1.25" />
                              {/* Minimalist face outline within the oval */}
                              {/* Hair/Head Top Arch */}
                              <path d="M15 17 C 15 15, 29 15, 29 17" stroke="#C9A961" strokeWidth="1.25" strokeLinecap="round" />
                              {/* Face/Jaw Contour */}
                              <path d="M15 20 C14 22, 14.5 27, 22 31.5 C29.5 27, 30 22, 29 20" stroke="#C9A961" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Stylized Nose line */}
                              <path d="M22 21.5 V 25.5 H 23.5" stroke="#C9A961" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Minimal Eyes (Horizontal dashes) */}
                              <line x1="17.5" y1="20.5" x2="19.5" y2="20.5" stroke="#C9A961" strokeWidth="1.25" strokeLinecap="round" />
                              <line x1="24.5" y1="20.5" x2="26.5" y2="20.5" stroke="#C9A961" strokeWidth="1.25" strokeLinecap="round" />
                              {/* Minimal Smile */}
                              <path d="M20 28 C 21 28.5, 23 28.5, 24 28" stroke="#C9A961" strokeWidth="1.25" strokeLinecap="round" />
                            </svg>
                          </div>
                          <h3 className="hero-upload-title hero-upload-desktop-hint" style={{ margin: '0 0 8px', fontSize: 20, color: '#2C2416', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>
                            {lang === 'fr' ? 'Découvre ton score de peau' : 'Discover your skin score'}
                          </h3>
                          <p className="hero-upload-desktop-hint" style={{ margin: '0 0 20px', fontSize: 13, color: '#5C4A3A', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                            {lang === 'fr' ? 'Glisse ta photo ici, ou' : 'Drop your photo here, or'}
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%', marginBottom: 16 }}>
                            <button
                              ref={heroCtaRef}
                              className="premium-cta-primary"
                              onClick={(e) => { e.stopPropagation(); setShowUploadSelector(true); }}
                            >
                              {lang === 'fr' ? 'Analyser ma peau gratuitement' : 'Analyze my skin for free'}
                            </button>
                          </div>

                          <div className="hero-upload-desktop-hint" style={{ fontSize: 10.5, color: '#8A7A6B', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <p style={{ margin: 0, letterSpacing: '0.02em' }}>
                              {lang === 'fr' ? 'Gratuit · résultat en ~30s · sans inscription · photos jamais stockées' : 'Free · ~30s result · no sign-up · photos never stored'}
                            </p>
                            <div style={{ width: 30, height: 1, background: 'rgba(212, 165, 116, 0.3)', margin: '0 auto' }}></div>
                            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 9.5 }}>
                              {lang === 'fr' ? 'Portrait · bien éclairé · sans lunettes' : 'Portrait · well lit · no glasses'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => processFile(e.target.files[0])} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }}
                      onChange={(e) => processFile(e.target.files[0])} />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Phone mockup showing the report */}
              <div className="hero-mockup-col" style={{
                flex: '0 1 380px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}>
                {renderFloatingAccent(lang === 'fr' ? 'Hydratation' : 'Hydration', 78, '#7DBFA8', { top: '15%', left: '-5%' }, 'mobile-float-bubble mobile-float-bubble-1', 'float1')}
                {renderFloatingAccent(lang === 'fr' ? 'Éclat' : 'Radiance', 65, '#C9A961', { top: '45%', right: '-10%' }, 'mobile-float-bubble mobile-float-bubble-2', 'float2')}
                {renderFloatingAccent(lang === 'fr' ? 'Pores' : 'Pores', 82, '#D4A574', { bottom: '20%', left: '-2%' }, 'mobile-float-bubble mobile-float-bubble-3', 'float3')}
                {/* Extra bubbles for mobile */}
                {renderFloatingAccent(lang === 'fr' ? 'Texture' : 'Texture', 74, '#A87449', { bottom: '5%', right: '-5%' }, 'hide-desktop mobile-float-bubble mobile-float-bubble-4', 'float1')}
                {renderFloatingAccent(lang === 'fr' ? 'Rougeurs' : 'Redness', 89, '#D4A574', { top: '-2%', right: '15%' }, 'hide-desktop mobile-float-bubble mobile-float-bubble-5', 'float2')}

                <img
                  src="/hero-mockup.png"
                  alt="Rate My Skin Report Preview"
                  style={{
                    width: '100%',
                    maxWidth: 380,
                    height: 'auto',
                    objectFit: 'contain',
                    animation: 'phoneFloat 6s ease-in-out infinite',
                  }}
                />
              </div>
            </div>

            {/* ═══ Trust row ═══ */}
            <div className="trust-row" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              maxWidth: 700,
              margin: '40px auto 0',
              padding: '0 24px',
            }}>
              {[
                { num: t('trust1Num'), label: t('trust1Label') },
                { num: t('trust2Num'), label: t('trust2Label') },
                { num: t('trust3Num'), label: t('trust3Label') },
              ].map(({ num, label }) => (
                <div key={label} className="trust-badge" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255, 255, 255, 0.45)',
                  border: '1px solid rgba(212, 165, 116, 0.25)',
                  borderRadius: 100,
                  padding: '6px 16px',
                  boxShadow: '0 4px 12px rgba(168, 116, 73, 0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}>
                  <span style={{ color: '#D4A574', fontSize: 12 }}>✦</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className="trust-num" style={{
                      fontSize: 16,
                      fontWeight: 600,
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#D4A574',
                    }}>
                      {num}
                    </span>
                    <span className="trust-label" style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: '#2C2416',
                      fontFamily: "'DM Sans', sans-serif"
                    }}>
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ═══ Une analyse complète ═══ */}
            <div style={{
              maxWidth: 1080,
              margin: '80px auto 0',
              padding: '0 24px',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              flexWrap: 'wrap',
              gap: 40,
              alignItems: 'center',
            }}>
              {/* Left Column: Title and Explanation Box */}
              <div style={{ flex: '1 1 300px', maxWidth: 500 }}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(26px, 4vw, 36px)',
                  fontWeight: 400,
                  color: '#3A2E26',
                  margin: '0 0 24px',
                  lineHeight: 1.15
                }}>
                  {lang === 'fr' ? 'Une analyse complète de ta peau' : 'A complete skin analysis'}
                </h2>

                <div style={{
                  background: 'rgba(255,255,255,0.7)',
                  borderLeft: '3px solid #D4A574',
                  padding: '20px 24px',
                  borderRadius: '0 16px 16px 0',
                  boxShadow: '0 8px 24px rgba(168,116,73,0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}>
                  <h4 style={{ margin: '0 0 8px', color: '#2C2416', fontSize: 15, fontWeight: 700 }}>
                    {lang === 'fr' ? 'Pourquoi 8 métriques ?' : 'Why 8 metrics?'}
                  </h4>
                  <p style={{ margin: 0, fontSize: 14, color: '#5C4A3A', lineHeight: 1.5 }}>
                    {lang === 'fr'
                      ? "Un bouton ou une rougeur ne sont que des symptômes. En croisant l'hydratation, les pores, le relief ou encore les taches sous-jacentes, l'IA dresse un bilan ultra-précis de l'écosystème de ta peau. C'est la clé pour arrêter de deviner et utiliser enfin les actifs qui te correspondent."
                      : "A blemish or redness are just symptoms. By cross-referencing hydration, pores, texture, or underlying spots, the AI creates an ultra-precise assessment of your skin's ecosystem. It's the key to stop guessing and finally use the active ingredients that work for you."}
                  </p>
                </div>
              </div>

              {/* Right Column: The Densely Packed Metrics */}
              <div style={{
                flex: '2 1 400px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '20px 12px',
              }}>
                {[
                  { id: 'hydratation', label: lang === 'fr' ? 'Hydratation' : 'Hydration', color: '#7DBFA8', val: 78, status: lang === 'fr' ? 'À SURVEILLER' : 'MONITOR', statusColor: 'amber', shortLine: lang === 'fr' ? 'Manque de lipides' : 'Lacking lipids' },
                  { id: 'pores', label: lang === 'fr' ? 'Pores' : 'Pores', color: '#D4A574', val: 58, status: lang === 'fr' ? 'À TRAVAILLER' : 'NEEDS WORK', statusColor: 'pink', shortLine: lang === 'fr' ? 'Légèrement dilatés' : 'Slightly enlarged' },
                  { id: 'eclat', label: lang === 'fr' ? 'Éclat' : 'Radiance', color: '#C9A961', val: 65, status: lang === 'fr' ? 'À SURVEILLER' : 'MONITOR', statusColor: 'amber', shortLine: lang === 'fr' ? 'Teint un peu terne' : 'Slightly dull' },
                  { id: 'acne', label: lang === 'fr' ? 'Acné' : 'Acne', color: '#7DBFA8', val: 82, status: lang === 'fr' ? 'BON' : 'GOOD', statusColor: 'green', shortLine: lang === 'fr' ? 'Peau nette' : 'Clear skin' },
                  { id: 'taches', label: lang === 'fr' ? 'Taches' : 'Dark spots', color: '#B0885E', val: 70, status: lang === 'fr' ? 'À SURVEILLER' : 'MONITOR', statusColor: 'amber', shortLine: lang === 'fr' ? 'Début de taches' : 'Early spots' },
                  { id: 'cernes', label: lang === 'fr' ? 'Cernes' : 'Dark circles', color: '#8C7A6B', val: 62, status: lang === 'fr' ? 'À SURVEILLER' : 'MONITOR', statusColor: 'amber', shortLine: lang === 'fr' ? 'Ombres visibles' : 'Visible shadows' },
                  { id: 'texture', label: lang === 'fr' ? 'Texture' : 'Texture', color: '#A87449', val: 74, status: lang === 'fr' ? 'À SURVEILLER' : 'MONITOR', statusColor: 'amber', shortLine: lang === 'fr' ? 'Grain irrégulier' : 'Uneven texture' },
                  { id: 'rougeurs', label: lang === 'fr' ? 'Rougeurs' : 'Redness', color: '#D4A574', val: 89, status: lang === 'fr' ? 'BON' : 'GOOD', statusColor: 'green', shortLine: lang === 'fr' ? 'Rougeurs diffuses' : 'Diffuse redness' },
                ].map((m) => (
                  <div key={m.id} className="metric-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: '1px solid transparent',
                    transition: 'all 0.3s ease',
                    cursor: 'default'
                  }}>
                    <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                      {m.isValue ? (
                        <div style={{
                          width: '100%', height: '100%', borderRadius: '50%',
                          border: `2px solid ${m.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 600, color: '#2C2416', fontFamily: "'Cormorant Garamond', serif"
                        }}>
                          {m.val}
                        </div>
                      ) : (
                        <>
                          <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(201,169,97,0.15)" strokeWidth="2.5" />
                            <circle cx="20" cy="20" r="17" fill="none" stroke={m.color} strokeWidth="2.5"
                              strokeDasharray={`${2 * Math.PI * 17 * (m.val / 100)} ${2 * Math.PI * 17}`}
                              strokeLinecap="round"
                              style={{ animation: 'dash 1.5s ease-out forwards' }} />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#2C2416' }}>
                            {m.val}
                          </div>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#2C2416' }}>{m.label}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {m.status && (
                          <span style={{
                            background: m.statusColor === 'green' ? 'rgba(125,191,168,0.1)' :
                              m.statusColor === 'amber' ? 'rgba(212, 165, 116, 0.15)' :
                                'rgba(216, 134, 157, 0.1)',
                            color: m.statusColor === 'green' ? '#4D8C76' :
                              m.statusColor === 'amber' ? '#B0885E' :
                                '#B85C75',
                            fontSize: 8.5, fontWeight: 700, padding: '3px 6px',
                            borderRadius: 6, letterSpacing: '0.05em', lineHeight: 1,
                            whiteSpace: 'nowrap'
                          }}>
                            {m.status}
                          </span>
                        )}
                        {m.shortLine && (
                          <span style={{ fontSize: 11, color: '#5C4A3A', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.shortLine}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Product preview */}
              <div style={{
                width: '100%',
                marginTop: 40,
                padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)',
                borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(248,244,237,0.5) 100%)',
                border: '1px solid rgba(201,169,97,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(24px, 4vw, 32px)',
                boxSizing: 'border-box'
              }}>
                <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4A574', marginBottom: 12, display: 'inline-block' }}>
                    {lang === 'fr' ? 'TA ROUTINE SUR-MESURE' : 'YOUR BESPOKE ROUTINE'}
                  </span>
                  <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 600, color: '#2C2416', margin: '0 0 16px', lineHeight: 1.2 }}>
                    {lang === 'fr' ? 'Une routine construite sur ta peau réelle' : 'A routine built on your real skin'}
                  </h4>
                  <p style={{ fontSize: 15, color: '#5C4A3A', margin: 0, lineHeight: 1.6 }}>
                    {lang === 'fr'
                      ? "Pas un quiz. Pas les conseils génériques d'un influenceur. L'IA lit 8 métriques directement sur ton visage, hydratation, pores, taches, éclat, et compose la routine et les produits faits pour TES besoins, zone par zone. Ce que tu vois ici n'est qu'un exemple : la tienne sera unique."
                      : "Not a quiz. Not generic influencer advice. The AI reads 8 metrics directly on your face, hydration, pores, dark spots, radiance, and curates the routine and products made for YOUR needs, zone by zone. What you see here is just an example: yours will be unique."}
                  </p>
                </div>

                {/* The Teaser Routine Container */}
                <div style={{ position: 'relative', width: '100%', maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: 24, boxShadow: '0 12px 40px rgba(44,36,22,0.06)', border: '1px solid rgba(201,169,97,0.15)', overflow: 'hidden' }}>

                  {/* TABS */}
                  <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,169,97,0.1)', background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,244,237,0.3) 100%)' }}>
                    <button
                      onClick={() => setRoutineTeaserTab('morning')}
                      style={{ flex: 1, padding: '20px 16px', background: 'none', border: 'none', borderBottom: routineTeaserTab === 'morning' ? '2px solid #D4A574' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={routineTeaserTab === 'morning' ? '#D4A574' : '#8C7A6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: routineTeaserTab === 'morning' ? '#D4A574' : '#8C7A6B' }}>
                        {lang === 'fr' ? 'MATIN' : 'MORNING'}
                      </span>
                    </button>
                    <button
                      onClick={() => setRoutineTeaserTab('evening')}
                      style={{ flex: 1, padding: '20px 16px', background: 'none', border: 'none', borderBottom: routineTeaserTab === 'evening' ? '2px solid #D4A574' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={routineTeaserTab === 'evening' ? '#D4A574' : '#8C7A6B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: routineTeaserTab === 'evening' ? '#D4A574' : '#8C7A6B' }}>
                        {lang === 'fr' ? 'SOIR' : 'EVENING'}
                      </span>
                    </button>
                  </div>

                  {/* Steps Wrapper */}
                  <div style={{ padding: 'clamp(20px, 4vw, 32px)', position: 'relative', maxHeight: 520, overflow: 'hidden' }}>

                    {routineTeaserTab === 'morning' ? (
                      <>
                        {/* MORNING CONTENT */}
                        <div style={{ marginBottom: 32 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", color: '#C9A961', fontWeight: 600 }}>01</span>
                            <h6 style={{ margin: 0, fontSize: 18, color: '#2C2416', fontWeight: 600 }}>{lang === 'fr' ? 'Nettoyer en douceur' : 'Gentle Cleanse'}</h6>
                          </div>

                          {teaserProducts?.morningCleanser && (
                            <ProductCard
                              product={teaserProducts.morningCleanser}
                              lang={lang}
                              t={t}
                              userSkinType={teaserProducts.morningCleanser.skin_types?.[0] || teaserProducts.morningCleanser.skinTypes?.[0] || 'oily'}
                              userConcerns={teaserProducts.morningCleanser.skin_problem ? [teaserProducts.morningCleanser.skin_problem] : (teaserProducts.morningCleanser.concerns ? [teaserProducts.morningCleanser.concerns[0]] : ['acne'])}
                            />
                          )}

                          <div style={{ marginTop: 12, background: '#FAF6F0', border: '1px solid rgba(212,165,116,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ fontSize: 16 }}>💡</div>
                            <div style={{ fontSize: 13, color: '#5C4A3A', lineHeight: 1.5 }}>
                              <strong style={{ color: '#2C2416', display: 'block', marginBottom: 2 }}>{lang === 'fr' ? "Conseil de l'IA" : "AI Coaching"}</strong>
                              {lang === 'fr'
                                ? "Masse 60 secondes sur peau humide pour dissoudre l'excès de sébum détecté sur la zone T, puis rince à l'eau tiède."
                                : "Massage for 60 seconds on damp skin to dissolve the excess sebum detected on your T-zone, then rinse with lukewarm water."}
                            </div>
                          </div>
                        </div>

                        <div style={{ marginBottom: 40 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", color: '#C9A961', fontWeight: 600 }}>02</span>
                            <h6 style={{ margin: 0, fontSize: 18, color: '#2C2416', fontWeight: 600 }}>{lang === 'fr' ? 'Cibler l\'éclat' : 'Target Radiance'}</h6>
                          </div>

                          {teaserProducts?.morningSerum && (
                            <ProductCard
                              product={teaserProducts.morningSerum}
                              lang={lang}
                              t={t}
                              userSkinType={teaserProducts.morningSerum.skin_types?.[0] || teaserProducts.morningSerum.skinTypes?.[0] || 'oily'}
                              userConcerns={teaserProducts.morningSerum.skin_problem ? [teaserProducts.morningSerum.skin_problem] : (teaserProducts.morningSerum.concerns ? [teaserProducts.morningSerum.concerns[0]] : ['hyperpigmentation'])}
                            />
                          )}

                          <div style={{ marginTop: 12, background: '#FAF6F0', border: '1px solid rgba(212,165,116,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ fontSize: 16 }}>⏱️</div>
                            <div style={{ fontSize: 13, color: '#5C4A3A', lineHeight: 1.5 }}>
                              <strong style={{ color: '#2C2416', display: 'block', marginBottom: 2 }}>{lang === 'fr' ? "Application" : "Application"}</strong>
                              {lang === 'fr'
                                ? "Applique 3 à 4 gouttes. Laisse absorber 2 minutes avant de passer à l'hydratation pour maximiser son effet antioxydant."
                                : "Apply 3 to 4 drops. Let it absorb for 2 minutes before moisturizing to maximize its antioxidant effect."}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* EVENING CONTENT */}
                        <div style={{ marginBottom: 32 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", color: '#C9A961', fontWeight: 600 }}>01</span>
                            <h6 style={{ margin: 0, fontSize: 18, color: '#2C2416', fontWeight: 600 }}>{lang === 'fr' ? 'Double nettoyage' : 'Double Cleanse'}</h6>
                          </div>

                          {teaserProducts?.eveningCleanser && (
                            <ProductCard
                              product={teaserProducts.eveningCleanser}
                              lang={lang}
                              t={t}
                              userSkinType={teaserProducts.eveningCleanser.skin_types?.[0] || teaserProducts.eveningCleanser.skinTypes?.[0] || 'oily'}
                              userConcerns={teaserProducts.eveningCleanser.skin_problem ? [teaserProducts.eveningCleanser.skin_problem] : (teaserProducts.eveningCleanser.concerns ? [teaserProducts.eveningCleanser.concerns[0]] : ['acne'])}
                            />
                          )}

                          <div style={{ marginTop: 12, background: '#FAF6F0', border: '1px solid rgba(212,165,116,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ fontSize: 16 }}>💡</div>
                            <div style={{ fontSize: 13, color: '#5C4A3A', lineHeight: 1.5 }}>
                              <strong style={{ color: '#2C2416', display: 'block', marginBottom: 2 }}>{lang === 'fr' ? "Conseil de l'IA" : "AI Coaching"}</strong>
                              {lang === 'fr'
                                ? "Masse sur peau sèche pendant 60 secondes. Les huiles du baume vont dissoudre tes bouchons de sébum incrustés dans les pores, puis rince."
                                : "Massage on dry skin for 60 seconds. The balm's oils will dissolve the sebum plugs in your pores, then rinse."}
                            </div>
                          </div>
                        </div>

                        <div style={{ marginBottom: 40 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", color: '#C9A961', fontWeight: 600 }}>02</span>
                            <h6 style={{ margin: 0, fontSize: 18, color: '#2C2416', fontWeight: 600 }}>{lang === 'fr' ? 'Traiter & Réparer' : 'Treat & Repair'}</h6>
                          </div>

                          {teaserProducts?.eveningTreatment && (
                            <ProductCard
                              product={teaserProducts.eveningTreatment}
                              lang={lang}
                              t={t}
                              userSkinType={teaserProducts.eveningTreatment.skin_types?.[0] || teaserProducts.eveningTreatment.skinTypes?.[0] || 'oily'}
                              userConcerns={teaserProducts.eveningTreatment.skin_problem ? [teaserProducts.eveningTreatment.skin_problem] : (teaserProducts.eveningTreatment.concerns ? [teaserProducts.eveningTreatment.concerns[0]] : ['acne'])}
                            />
                          )}

                          <div style={{ marginTop: 12, background: '#FAF6F0', border: '1px solid rgba(212,165,116,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ fontSize: 16 }}>⚠️</div>
                            <div style={{ fontSize: 13, color: '#5C4A3A', lineHeight: 1.5 }}>
                              <strong style={{ color: '#2C2416', display: 'block', marginBottom: 2 }}>{lang === 'fr' ? "Application progressive" : "Progressive Application"}</strong>
                              {lang === 'fr'
                                ? "Ne commence qu'avec 2 soirs par semaine ! Ton scan montre de légers signes de fragilité cutanée, on y va doucement."
                                : "Start with only 2 nights a week! Your scan shows slight signs of skin fragility, we need to build tolerance slowly."}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Overlay Lock UI */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 35%, rgba(255,255,255,1) 100%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 24 }}>
                      <div style={{ background: '#fff', border: '1px solid rgba(201,169,97,0.3)', borderRadius: 16, padding: '24px 20px', textAlign: 'center', boxShadow: '0 12px 30px rgba(44,36,22,0.08)', width: 'calc(100% - 48px)', maxWidth: 360 }}>
                        <div style={{ background: '#F8F4ED', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A574" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <h4 style={{ margin: '0 0 8px', color: '#2C2416', fontSize: 18, fontWeight: 700 }}>{lang === 'fr' ? 'Débloque ta routine' : 'Unlock your routine'}</h4>
                        <p style={{ margin: '0 0 20px', color: '#5C4A3A', fontSize: 13, lineHeight: 1.4 }}>
                          {lang === 'fr' ? 'Matin & soir, étapes complètes et conseils.' : 'AM & PM, full steps and tips.'}
                        </p>
                        <button
                          onClick={() => setShowMultiAngle(true)}
                          style={{
                            background: '#2C2416', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(44,36,22,0.15)', width: '100%',
                          }}
                        >
                          {lang === 'fr' ? 'Créer ma routine →' : 'Create my routine →'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: '#8C7A6B' }}>
                  {lang === 'fr' ? 'Exemple illustratif, ta vraie routine sera construite à partir de ton scan.' : 'Illustrative example, your real routine will be built from your scan.'}
                </div>
              </div>
            </div>

            {/* ═══ Comment ça marche — 3 steps ═══ */}
            <div style={{
              maxWidth: 960,
              margin: '72px auto 0',
              padding: '0 24px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {/* Section badge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <span style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#D4A574',
                  background: 'rgba(212, 165, 116, 0.05)',
                  border: '1px solid rgba(212, 165, 116, 0.15)',
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  {lang === 'fr' ? 'COMMENT ÇA MARCHE' : 'HOW IT WORKS'}
                </span>
              </div>

              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(26px, 4.5vw, 36px)',
                fontWeight: 400,
                color: '#3A2E26',
                textAlign: 'center',
                margin: '0 0 40px',
                letterSpacing: '-0.01em',
              }}>
                {lang === 'fr' ? 'De ta photo à ta routine parfaite' : 'From your photo to your perfect routine'}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 24,
              }}>
                {[
                  {
                    num: '01',
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    ),
                    title: lang === 'fr' ? 'Scanne ta peau' : 'Scan your skin',
                    desc: lang === 'fr'
                      ? 'Une photo suffit. L\'IA analyse 8 métriques cliniques que ton miroir ne te montre pas, fini de deviner ce qui ne va pas.'
                      : 'One photo is enough. The AI analyzes 8 clinical metrics your mirror doesn\'t show, stop guessing what\'s wrong.',
                  },
                  {
                    num: '02',
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26 6.91 1.01-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ),
                    title: lang === 'fr' ? 'Comprends ta peau' : 'Understand your skin',
                    desc: lang === 'fr'
                      ? 'Un score précis et le détail zone par zone : enfin une réponse claire à \'pourquoi ma peau fait ça ?\''
                      : 'A precise score and zone-by-zone breakdown: finally a clear answer to \'why is my skin doing this?\'',
                  },
                  {
                    num: '03',
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 3H15M10 3V9L5.3 18.4A2 2 0 0 0 7.1 21H16.9A2 2 0 0 0 18.7 18.4L14 9V3" />
                        <path d="M14 9H10" />
                      </svg>
                    ),
                    title: lang === 'fr' ? 'Transforme ta peau' : 'Transform your skin',
                    desc: lang === 'fr'
                      ? 'Une routine matin/soir sur-mesure, les bons produits, et un plan pour viser de vrais résultats en quelques semaines. Tu sais exactement quoi faire.'
                      : 'A bespoke AM/PM routine, the right products, and a plan targeting real results in weeks. You know exactly what to do.',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="bubble-nacré"
                    style={{
                      borderRadius: 28,
                      padding: '28px 24px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'default',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(253,246,237,0.45) 50%, rgba(246,235,222,0.65) 100%)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(168,116,73,0.12)',
                      boxShadow: '0 8px 32px rgba(168,116,73,0.02), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.borderColor = 'rgba(168,116,73,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = 'rgba(168,116,73,0.12)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 28, fontWeight: 600,
                        color: '#2C2416',
                        lineHeight: 1,
                      }}>{step.num}</span>
                      {step.icon}
                    </div>
                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20, fontWeight: 600,
                      color: '#2C2416', margin: 0,
                    }}>{step.title}</h3>
                    <p style={{
                      fontSize: 13, color: '#5C4A3A',
                      lineHeight: 1.6, margin: 0,
                    }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ Social Proof Band ═══ */}
            <div style={{
              maxWidth: 560,
              margin: '56px auto 0',
              padding: '0 24px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                padding: '16px 24px',
                borderRadius: 60,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(248,244,237,0.35) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(201,169,97,0.14)',
                boxShadow: '0 4px 20px rgba(168,116,73,0.03)',
              }}>
                {/* Overlapping avatar circles */}
                <div style={{ display: 'flex', flexShrink: 0 }}>
                  {['#D4A574', '#C9A961', '#A87449', '#7DBFA8'].map((c, i) => (
                    <div key={i} style={{
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${c} 0%, #FAF6F0 100%)`,
                      border: '2px solid #FDFAF7',
                      marginLeft: i === 0 ? 0 : -8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: '#3A2E26',
                      fontFamily: "'Cormorant Garamond', serif",
                      position: 'relative', zIndex: 4 - i,
                    }}>
                      {['S', 'L', 'C', 'I'][i]}
                    </div>
                  ))}
                </div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, fontWeight: 500,
                  color: '#5C4A3A',
                  lineHeight: 1.4,
                }}>
                  {lang === 'fr'
                    ? <><strong style={{ color: '#2C2416' }}>206 femmes</strong> ont noté leur peau cette semaine</>
                    : <><strong style={{ color: '#2C2416' }}>206 women</strong> rated their skin this week</>}
                </span>
              </div>
            </div>

            {/* ═══ Testimonials ═══ */}
            <div style={{ marginTop: 64 }}>
              <Testimonials lang={lang} />
            </div>
            <FAQ lang={lang} t={t} />
          </>
        ) : (
          /* Step: 'questions' */
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 60px' }}>


            {/* Questions Step Title */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 400,
                color: '#2C2416', lineHeight: 1.2, margin: '0 0 10px',
              }}>
                {t('questionsTitle')}
              </h1>
            </div>

            {/* Photo preview */}
            {imageUrl && (
              <div style={{ position: 'relative', marginBottom: 24, borderRadius: 16, overflow: 'hidden' }}>
                <img
                  src={imageUrl} alt="Preview"
                  style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block', borderRadius: 16 }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  style={{
                    position: 'absolute', bottom: 12, right: 12,
                    background: 'rgba(13,13,13,0.82)', color: '#fff',
                    border: 'none', borderRadius: 8, padding: '7px 14px',
                    fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {t('changePhoto')}
                </button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => processFile(e.target.files[0])} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }}
              onChange={(e) => processFile(e.target.files[0])} />

            {/* Skin concern */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                <label style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 18, color: '#2C2416', fontWeight: 600,
                }}>
                  {t('skinConcernLabel')}
                </label>
                <span style={{ fontSize: 16, color: '#2C2416', fontFamily: "'DM Sans', sans-serif", marginLeft: 'auto', textAlign: 'right' }}>{t('skinConcernOptional')}</span>
              </div>

              {/* Quick-select chips */}
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
                {quickConcerns.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleChip(key, label)}
                    style={{
                      border: activeChips.includes(key) ? '1.5px solid rgba(197, 160, 40, 0.65)' : '1px solid rgba(168, 116, 73, 0.22)',
                      background: activeChips.includes(key) ? 'rgba(197,160,40,0.12)' : 'rgba(255, 255, 255, 0.45)',
                      color: activeChips.includes(key) ? '#8B6914' : '#2C2416',
                      borderRadius: 30, padding: '6px 16px',
                      fontSize: 16, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: activeChips.includes(key) ? 600 : 400,
                      boxShadow: activeChips.includes(key) ? '0 4px 12px rgba(197,160,40,0.15)' : 'inset 0 1px 1px rgba(255,255,255,0.7)',
                      transition: 'all 0.25s ease',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
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
                      setActiveChips([]);
                    }
                  }}
                  placeholder={t('skinConcernPlaceholder')}
                  rows={3}
                  className="input-nacré"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    borderRadius: 18,
                    padding: '16px 18px 32px', fontSize: 16, color: '#2C2416',
                    fontFamily: "'DM Sans', sans-serif",
                    resize: 'vertical', outline: 'none',
                    lineHeight: 1.5,
                  }}
                />
                <span style={{
                  position: 'absolute', bottom: 9, right: 12,
                  fontSize: 16, color: skinConcern.length >= SKIN_CONCERN_MAX ? '#c0392b' : '#2C2416',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {t('skinConcernCounter', skinConcern.length, SKIN_CONCERN_MAX)}
                </span>
              </div>

              {/* Additional context fields */}
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Age */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                    <label style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 18, color: '#2C2416', fontWeight: 600,
                    }}>
                      {t('ageLabel')}
                    </label>
                    <span style={{ fontSize: 16, color: '#2C2416', fontFamily: "'DM Sans', sans-serif" }}>{t('skinConcernOptional')}</span>
                  </div>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={t('agePlaceholder')}
                    className="input-nacré"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      borderRadius: 18,
                      padding: '14px 18px', fontSize: 16, color: '#2C2416',
                      fontFamily: "'DM Sans', sans-serif", outline: 'none',
                    }}
                  />
                </div>

                {/* Collapsible toggle for Climate & Allergies */}
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 16,
                      fontWeight: 500,
                      color: '#2C2416',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {t('refineAnalysis')}
                    <span style={{ fontSize: 10, display: 'inline-block', transition: 'transform 0.3s', transform: showOptionalFields ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.7 }}>▼</span>
                  </button>
                </div>

                {showOptionalFields && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease-out' }}>
                    {/* Climate */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                        <label style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 18, color: '#2C2416', fontWeight: 600,
                        }}>
                          {t('climateLabel')}
                        </label>
                        <span style={{ fontSize: 16, color: '#2C2416', fontFamily: "'DM Sans', sans-serif" }}>{t('skinConcernOptional')}</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={climate}
                          onChange={(e) => setClimate(e.target.value)}
                          className="input-nacré"
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            borderRadius: 18,
                            padding: '14px 18px', fontSize: 16, color: climate ? '#2C2416' : '#2C2416',
                            fontFamily: "'DM Sans', sans-serif", outline: 'none',
                            appearance: 'none', cursor: 'pointer',
                          }}
                        >
                          <option value="" disabled>{t('climateOptionSelect')}</option>
                          <option value="Humid & Tropical">{t('climateOptionHumid')}</option>
                          <option value="Dry & Arid">{t('climateOptionDry')}</option>
                          <option value="Cold & Harsh">{t('climateOptionCold')}</option>
                          <option value="Urban (Pollution)">{t('climateOptionUrban')}</option>
                          <option value="High Sun Exposure">{t('climateOptionSun')}</option>
                          <option value="Temperate / Moderate">{t('climateOptionTemperate')}</option>
                        </select>
                        <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#C5A028', fontSize: 10 }}>
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Allergies */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                        <label style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 18, color: '#2C2416', fontWeight: 600,
                        }}>
                          {t('allergiesLabel')}
                        </label>
                        <span style={{ fontSize: 16, color: '#2C2416', fontFamily: "'DM Sans', sans-serif" }}>{t('skinConcernOptional')}</span>
                      </div>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder={t('allergiesPlaceholder')}
                        className="input-nacré"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          borderRadius: 18,
                          padding: '14px 18px', fontSize: 16, color: '#2C2416',
                          fontFamily: "'DM Sans', sans-serif", outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ margin: '12px 0 0', fontSize: 16, color: '#c0392b', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
            )}

            {/* CTA */}
            <button
              onClick={handleAnalyse}
              disabled={!image || loading}
              style={{
                width: '100%',
                marginTop: 20,
                padding: '16px 28px',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                fontFamily: "'DM Sans', sans-serif",
                borderRadius: 32,
                border: 'none',
                cursor: image && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
                ...(image && !loading ? {
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: [
                    '0 2px 0 0 rgba(255,255,255,0.95) inset',
                    '0 -2px 0 0 rgba(168,116,73,0.15) inset',
                    'inset 0 1px 0 rgba(255,255,255,0.98)',
                    '0 12px 32px rgba(168, 116, 73, 0.08)',
                    '0 4px 12px rgba(168, 116, 73, 0.04)',
                  ].join(','),
                  color: '#2C2416',
                  transform: 'translateY(-2px)',
                } : {
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.1)',
                  color: '#2C2416',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }),
              }}
              onMouseEnter={(e) => {
                if (image && !loading) {
                  e.target.style.transform = 'translateY(-4px) scale(1.02)';
                  e.target.style.boxShadow = [
                    '0 2px 0 0 rgba(255,255,255,0.98) inset',
                    '0 -2px 0 0 rgba(168,116,73,0.2) inset',
                    'inset 0 1px 0 rgba(255,255,255,0.99)',
                    '0 16px 40px rgba(168, 116, 73, 0.12)',
                    '0 8px 20px rgba(168, 116, 73, 0.08)',
                  ].join(',');
                }
              }}
              onMouseLeave={(e) => {
                if (image && !loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = [
                    '0 2px 0 0 rgba(255,255,255,0.95) inset',
                    '0 -2px 0 0 rgba(168,116,73,0.15) inset',
                    'inset 0 1px 0 rgba(255,255,255,0.98)',
                    '0 12px 32px rgba(168, 116, 73, 0.08)',
                    '0 4px 12px rgba(168, 116, 73, 0.04)',
                  ].join(',');
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <LuxuryFlower width={22} height={22} />
                  {t('analysingFeatures')}
                </span>
              ) : (
                t('analyseNow')
              )}
            </button>

            {loading && (
              <p style={{ textAlign: 'center', fontSize: 16, color: '#2C2416', marginTop: 10, fontFamily: "'DM Sans', sans-serif" }}>
                {t('analysisTime')}
              </p>
            )}

            {/* Footer trust */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
              {[t('noAccountNeeded'), t('resultsIn20s')].map((txt) => (
                <span key={txt} style={{ fontSize: 16, color: '#2C2416', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ color: GOLD }}>✓</span> {txt}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
              {[
                { label: t('privacyPolicy'), path: '/privacy' },
                { label: lang === 'fr' ? 'Avertissement médical' : 'Medical Disclaimer', path: '/mentions-legales' },
              ].map(({ label, path }) => (
                <span
                  key={path}
                  onClick={() => router.push(path)}
                  style={{
                    fontSize: 16,
                    color: '#2C2416',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '0.04em',
                    opacity: 0.75,
                    transition: 'opacity 0.2s',
                    textDecoration: 'underline',
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 1}
                  onMouseLeave={(e) => e.target.style.opacity = 0.75}
                >
                  {label}
                </span>
              ))}
            </div>

            <MedicalDisclaimer style={{ marginTop: 16 }} />
          </div>
        )}
      </main>

      {/* Sticky Bottom CTA Bar (Mobile Only) */}
      {currentStep === 'landing' && showStickyCta && (
        <div className="mobile-sticky-cta-bar" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 250,
          background: 'rgba(251, 246, 240, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(201, 169, 97, 0.22)',
          boxShadow: '0 -8px 24px rgba(44, 36, 22, 0.06)',
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          display: 'none', // Overridden to flex in CSS on mobile
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}>
          <button
            className="premium-cta-primary"
            onClick={(e) => { e.stopPropagation(); setShowUploadSelector(true); }}
            style={{
              width: '100%',
              maxWidth: 'none',
              height: '50px',
              fontSize: '13.5px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
            }}
          >
            {lang === 'fr' ? 'Analyser ma peau gratuitement' : 'Analyze my skin for free'}
          </button>
        </div>
      )}

      {/* ── Email gate overlay (always in DOM, fades away after submit) ── */}
      {overlayVisible && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(255, 253, 248, 0.4)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
          opacity: emailCaptured ? 0 : 1,
          pointerEvents: emailCaptured ? 'none' : 'auto',
          transition: 'opacity 0.65s ease',
        }}>
          <div className="card-blur" style={{
            position: 'relative',
            borderRadius: 32,
            padding: 'clamp(32px, 6vw, 48px)',
            maxWidth: 420, width: '100%',
            boxShadow: '0 32px 80px rgba(130, 100, 80, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
            transform: emailCaptured ? 'translateY(16px) scale(0.97)' : 'translateY(0) scale(1)',
            transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
            textAlign: 'center',
          }}>
            {/* Close button */}
            <button
              onClick={() => {
                setOverlayVisible(false);
                setPendingAction(null);
              }}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'none',
                border: 'none',
                color: '#8C7A6B',
                fontSize: 18,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                opacity: 0.7,
                transition: 'opacity 0.2s',
                padding: '4px 8px',
                zIndex: 10,
              }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.7}
            >
              ✕
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
              <LuxuryFlower width={72} height={72} />
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
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={lang === 'fr' ? 'Votre prénom' : 'Your first name'}
                required
                autoFocus
                className="input-nacré"
                style={{
                  borderRadius: 16,
                  padding: '14px 18px', fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none', width: '100%', boxSizing: 'border-box',
                  color: '#3A2E26',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === 'fr' ? 'Votre email (optionnel)' : 'Your email (optional)'}
                className="input-nacré"
                style={{
                  borderRadius: 16,
                  padding: '14px 18px', fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none', width: '100%', boxSizing: 'border-box',
                  color: '#3A2E26',
                }}
              />
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                cursor: 'pointer', padding: '2px 0',
              }}>
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(e) => setNewsletterConsent(e.target.checked)}
                  style={{
                    marginTop: 2, width: 15, height: 15, flexShrink: 0,
                    accentColor: '#A87449', cursor: 'pointer',
                  }}
                />
                <span style={{
                  fontSize: 11, color: '#8C7A6B', lineHeight: 1.5,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {t('newsletterConsent')}
                </span>
              </label>

              <button
                type="submit"
                disabled={emailLoading}
                className="btn-liquid-glass-dark"
                style={{
                  padding: '14px 20px',
                  fontSize: 14, fontWeight: 600,
                  cursor: emailLoading ? 'wait' : 'pointer',
                  borderRadius: 16,
                  border: 'none',
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

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.38)',
                border: '1px solid rgba(180, 155, 135, 0.35)',
                borderRadius: 30,
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 500,
                color: '#7A6A5E',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.01em',
              }}>
                <span style={{ fontSize: 6, color: '#9C8070' }}>✦</span>
                {t('heroLine3')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Full-screen Analysis Loading Page ── */}
      {loading && (
        <div className="analysis-loading-overlay" style={{
          zIndex: 1000,
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
                }}>Analyse en cours…</h2>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px', color: '#8C7A6B', margin: 0,
                }}>Intelligence artificielle dermatologique</p>
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
                  <path d={ANALYSIS_STEPS[analysisStep]?.icon} />
                </svg>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px', fontWeight: 500,
                  color: '#8C7A6B', letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}>{ANALYSIS_STEPS[analysisStep]?.label}</span>
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

      {/* ── Camera overlay ── */}
      {showCamera && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: '#000', display: 'flex', flexDirection: 'column' }}>
          {/* Screen flash overlay */}
          {screenFlash && (
            <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 10, pointerEvents: 'none' }} />
          )}

          {/* Live video — mirrored for selfie */}
          <video
            ref={videoRef}
            autoPlay playsInline muted
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />

          {/* Face oval guide overlay — full screen SVG */}
          <svg
            viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <defs>
              <mask id="faceMask">
                <rect width="100" height="100" fill="white" />
                <ellipse cx="50" cy="46" rx="36" ry="44" fill="black" />
              </mask>
            </defs>
            <rect width="100" height="100" fill="rgba(0,0,0,0.48)" mask="url(#faceMask)" />
            <ellipse cx="50" cy="46" rx="36" ry="44" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" strokeDasharray="2.5 1.8" />
          </svg>

          {/* Instruction */}
          <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', padding: '0 24px' }}>
            <p style={{ color: '#fff', fontSize: 14, fontFamily: "'DM Sans', sans-serif", margin: 0, fontWeight: 500, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              {t('alignFace')}
            </p>
          </div>

          {/* Controls */}
          <div style={{ position: 'absolute', bottom: 56, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
            {/* Cancel */}
            <button onClick={stopCamera} style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            {/* Capture shutter */}
            <button onClick={capturePhoto} style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.35)', cursor: 'pointer', boxShadow: '0 0 0 2px rgba(255,255,255,0.2)' }} aria-label={t('capture')} />
          </div>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Multi-Angle Camera ── */}
      {showMultiAngle && (
        <MultiAngleCamera
          onCapturesComplete={handleMultiAngleCaptures}
          onClose={() => setShowMultiAngle(false)}
          t={t}
        />
      )}

      {/* ── Upload options selector overlay ── */}
      {showUploadSelector && (
        <div 
          className="upload-selector-overlay"
          onClick={() => setShowUploadSelector(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 650,
            background: 'rgba(44, 36, 22, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn 0.25s ease-out forwards',
          }}
        >
          <div 
            className="upload-selector-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(150deg, rgba(255,255,255,0.95) 0%, rgba(253,246,237,0.9) 55%, rgba(246,235,222,0.95) 100%)',
              border: '1px solid rgba(201, 169, 97, 0.35)',
              borderRadius: 24,
              padding: '24px 28px',
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 24px 64px rgba(61,41,20,0.12), inset 0 1px 0 rgba(255,255,255,0.95)',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <LuxuryFlower width={48} height={48} />
            </div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#2C2416',
              margin: '0 0 6px',
            }}>
              {lang === 'fr' ? 'Analyser ma peau' : 'Analyze my skin'}
            </h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: '#6F6156',
              lineHeight: 1.5,
              margin: '0 0 24px',
            }}>
              {lang === 'fr' ? 'Choisissez comment ajouter votre photo :' : 'Choose how to add your photo:'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Option 1: Live Camera */}
              <button
                onClick={() => {
                  setShowUploadSelector(false);
                  setShowMultiAngle(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(253, 246, 237, 0.5) 100%)',
                  border: '1px solid rgba(201, 169, 97, 0.28)',
                  borderRadius: 16,
                  padding: '14px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 12px rgba(168,116,73,0.03)',
                }}
                className="selector-option-btn"
              >
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: '#F0E7D8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#C9A961', flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2C2416', fontFamily: "'DM Sans', sans-serif" }}>
                    {lang === 'fr' ? 'Appareil photo (En direct)' : 'Live Camera'}
                  </div>
                  <div style={{ fontSize: 11, color: '#8C7A6B', marginTop: 2, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
                    {lang === 'fr' ? 'Scanner votre visage avec notre guide doré' : 'Scan your face with our smart gold guide'}
                  </div>
                </div>
              </button>

              {/* Option 2: Photo Library */}
              <button
                onClick={() => {
                  setShowUploadSelector(false);
                  fileInputRef.current?.click();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(253, 246, 237, 0.5) 100%)',
                  border: '1px solid rgba(201, 169, 97, 0.28)',
                  borderRadius: 16,
                  padding: '14px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 12px rgba(168,116,73,0.03)',
                }}
                className="selector-option-btn"
              >
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: '#F0E7D8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#C9A961', flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2C2416', fontFamily: "'DM Sans', sans-serif" }}>
                    {lang === 'fr' ? 'Photothèque' : 'Photo Library'}
                  </div>
                  <div style={{ fontSize: 11, color: '#8C7A6B', marginTop: 2, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
                    {lang === 'fr' ? 'Choisir un portrait existant dans votre galerie' : 'Choose an existing portrait from your library'}
                  </div>
                </div>
              </button>

              {/* Option 3: Files */}
              <button
                onClick={() => {
                  setShowUploadSelector(false);
                  fileInputRef.current?.click();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(253, 246, 237, 0.5) 100%)',
                  border: '1px solid rgba(201, 169, 97, 0.28)',
                  borderRadius: 16,
                  padding: '14px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 12px rgba(168,116,73,0.03)',
                }}
                className="selector-option-btn"
              >
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: '#F0E7D8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#C9A961', flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2C2416', fontFamily: "'DM Sans', sans-serif" }}>
                    {lang === 'fr' ? 'Choisir un fichier' : 'Choose a file'}
                  </div>
                  <div style={{ fontSize: 11, color: '#8C7A6B', marginTop: 2, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
                    {lang === 'fr' ? 'Parcourir les documents locaux de votre appareil' : 'Browse local documents on your device'}
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowUploadSelector(false)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: '#8C7A6B',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginTop: 20,
              }}
            >
              {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes logoShimmer {
          0% { background-position: 50% 0%; }
          50% { background-position: 50% 100%; }
          100% { background-position: 50% 0%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes stepIconPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes loadingProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        * { box-sizing: border-box; }
        .selector-option-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(201, 169, 97, 0.6) !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 246, 237, 0.7) 100%) !important;
          box-shadow: 0 6px 18px rgba(168,116,73,0.08) !important;
        }
      ` }} />
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
