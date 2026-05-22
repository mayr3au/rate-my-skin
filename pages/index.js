import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo, { CreamDrop, LuxuryFlower } from '../components/Logo';
import { useLang } from '../lib/LangContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import MultiAngleCamera from '../components/MultiAngleCamera';

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
  { icon: "M12 2a7 7 0 1 0 0 14A7 7 0 0 0 12 2zm0 3v4l3 3", label: "Détection du type de peau…" },
  { icon: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", label: "Analyse des pores et texture…" },
  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "Cartographie des zones sensibles…" },
  { icon: "M3 12h18M3 6h18M3 18h18", label: "Évaluation du teint et phototype…" },
  { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "Scoring global de votre peau…" },
  { icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", label: "Génération du rapport final…" },
];

export default function Home() {
  const router = useRouter();
  const { lang, t } = useLang();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);
  const [showMultiAngle, setShowMultiAngle] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);

  const [emailCaptured, setEmailCaptured] = useState(false);
  const [email, setEmail] = useState('');
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
  const [dragOver, setDragOver] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [paidUnlocks, setPaidUnlocks] = useState(0);

  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [stepFade, setStepFade] = useState(true);

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
      .catch(() => {});
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

      // Facts rotate every 5 seconds
      factInterval = setInterval(() => {
        setFade(false);
        fadeTimeout = setTimeout(() => {
          setFactIndex(prev => (prev + 1) % FACTS.length);
          setFade(true);
        }, 400);
      }, 5000);

      // Analysis steps rotate every ~3.2s, synced with progress stages
      stepInterval = setInterval(() => {
        setStepFade(false);
        stepFadeTimeout = setTimeout(() => {
          setAnalysisStep(prev => Math.min(prev + 1, ANALYSIS_STEPS.length - 1));
          setStepFade(true);
        }, 350);
      }, 3200);

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
      clearInterval(factInterval);
      clearInterval(stepInterval);
      clearTimeout(fadeTimeout);
      clearTimeout(stepFadeTimeout);
      unlockBody();
    };
  }, [loading]);

  /* ── Email submit ── */
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
        // Sets httpOnly email cookie so this device is auto-identified on return
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
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  /* ── Skin concern chips ── */
  const quickConcerns = [
    { key: 'Acne', label: t('quickConcernAcne') },
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

  const handleAnalyse = async (bypassEmailCheck = false) => {
    if (!image) return;

    // Trigger email gate if not captured yet
    if (!emailCaptured && !bypassEmailCheck) {
      setOverlayVisible(true);
      return;
    }

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
        const json = await res.json();

        if (json.error === 'no_face') throw new Error(json.message || t('noFaceError'));
        if (!res.ok || json.error) throw new Error(json.error || t('analysisFailed'));
        
        return json;
      })();

      // Wait for both the minimum 8s delay and the API call
      const [_, json] = await Promise.all([minDurationPromise, apiCallPromise]);

      sessionStorage.setItem('rms_report', JSON.stringify(json.data));
      sessionStorage.setItem('rms_analysis_id', json.analysisId);
      sessionStorage.setItem('rms_is_paid', json.isPaid ? 'true' : 'false');
      sessionStorage.setItem('rms_generation_finished_at', Date.now().toString());
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
        <meta name="keywords" content="note ma peau, analyse ma peau, diagnostic peau, score peau, ia skincare, test peau gratuit, rate my skin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Rate My Skin',
          url: 'https://ratemyskin.co',
          applicationCategory: 'HealthApplication',
          description: 'Analyse IA de peau gratuite. Obtenez votre score de peau et des recommandations skincare personnalisées en 30 secondes.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        }) }} />
      </Head>

      {/* ── Sticky nav ── */}
      <div className="nav-blur" style={{
        position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 4px 20px rgba(180, 160, 140, 0.04)',
        padding: '13px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {paidUnlocks > 0 && (
            <div style={{
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
          <LangToggle />
          <button
            onClick={() => router.push('/blog')}
            style={{
              background: 'none', border: 'none',
              padding: '2px 4px', fontSize: 12, color: '#8C7A6B', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {t('blogNav')}
          </button>
          <button
            onClick={() => router.push('/mes-rapports')}
            style={{
              background: 'none', border: 'none',
              padding: '2px 4px', fontSize: 12, color: '#8C7A6B', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {t('myReportsNav')}
          </button>
        </div>
      </div>

      {/* ── Main content (always rendered; blurred behind overlay) ── */}
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
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '52px 24px 8px' }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 14,
            fontFamily: "'DM Sans', sans-serif",
            background: 'linear-gradient(180deg, #2C241D 0%, #6B4828 12%, #A87449 50%, #6B4828 88%, #2C241D 100%)',
            backgroundSize: '100% 150%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'logoShimmer 20s ease-in-out infinite',
          }}>
            {t('facialAestheticsAnalysis')}
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 400,
            color: '#3A2E26', lineHeight: 1.18, margin: '0 0 6px',
          }}>
            {t('heroLine1')}
          </h1>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 300,
            color: '#6B5040', lineHeight: 1.25, margin: 0,
          }}>
            <em>{t('heroLine2')}</em>
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '18px auto 0' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.48)',
              border: '1px solid rgba(255, 255, 255, 0.65)',
              borderRadius: 30,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 500,
              color: '#6F6156',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 6px 20px rgba(168, 116, 73, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.01em',
            }}>
              <span style={{ fontSize: 7, color: '#C5A028' }}>✦</span>
              {t('heroLine3')}
            </span>
          </div>
          <p style={{
            fontSize: 13, color: '#A2968B', margin: '6px auto 0',
            maxWidth: 420, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif",
          }}>
            {t('heroDesc')}
          </p>
        </div>

        {/* Trust row (Three separate bubbles) */}
        <div style={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'stretch',
          gap: 12,
          flexWrap: 'wrap',
          maxWidth: 600,
          margin: '24px auto 0'
        }}>
          {[
            { num: t('trust1Num'), label: t('trust1Label') },
            { num: t('trust2Num'), label: t('trust2Label') },
            { num: t('trust3Num'), label: t('trust3Label') },
          ].map(({ num, label }) => (
            <div key={label} className="bubble-nacré" style={{ 
              flex: '1 1 110px',
              textAlign: 'center',
              padding: '12px 14px',
              borderRadius: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ 
                fontSize: 22, 
                fontWeight: 500, 
                fontFamily: "'Cormorant Garamond', serif",
                background: 'linear-gradient(90deg, #A87449 0%, #D4A574 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {num}
              </div>
              <div style={{ 
                fontSize: 9, 
                color: '#8C7A6B', 
                letterSpacing: '0.06em', 
                textTransform: 'uppercase', 
                marginTop: 2, 
                fontFamily: "'DM Sans', sans-serif", 
                fontWeight: 600,
                lineHeight: 1.3
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Upload + skin concern */}
        <div style={{ maxWidth: 480, margin: '32px auto 0', padding: '0 20px 60px' }}>

          {/* Photo tip */}
          <p style={{
            margin: '0 0 12px', fontSize: 12, color: '#A87449',
            fontFamily: "'DM Sans', sans-serif", textAlign: 'center',
            lineHeight: 1.5, letterSpacing: '0.01em',
          }}>
            {t('photoTip')}
          </p>

          {/* Upload zone */}
          <div
            onClick={(e) => !imageUrl && requireEmail('file', e)}
            className="card-nacré"
            style={{
              border: dragOver ? `1.5px solid ${GOLD}` : undefined,
              boxShadow: dragOver 
                ? 'inset 0 0 0 2px #C5A028, inset 0 4px 12px rgba(0,0,0,0.02)' 
                : undefined,
              borderRadius: 24,
              padding: imageUrl ? 0 : '40px 24px',
              textAlign: 'center',
              cursor: imageUrl ? 'default' : 'pointer',
              background: dragOver ? 'rgba(255, 255, 255, 0.65)' : undefined,
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              overflow: 'hidden',
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
                <CreamDrop width={110} height={55} />
                <p style={{ margin: '14px 0 4px', fontSize: 14, color: '#6F6156', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                  {t('dragDrop')}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#B9AC9E', fontFamily: "'DM Sans', sans-serif" }}>{t('fileTypes')}</p>
                <p style={{ margin: '16px 0 0', fontSize: 11, color: '#CBAA8D', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
                  {t('or')}
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                  <button
                    onClick={(e) => requireEmail('file', e)}
                    className="btn-liquid-glass-dark home-upload-btn"
                    style={{ border: 'none' }}
                  >
                    {t('uploadPhoto')}
                  </button>
                  <button
                    onClick={(e) => requireEmail('camera', e)}
                    className="btn-liquid-glass home-upload-btn"
                    style={{ border: 'none' }}
                  >
                    {t('scan')}
                  </button>
                </div>
              </>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => processFile(e.target.files[0])} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }}
            onChange={(e) => processFile(e.target.files[0])} />

          {/* Skin concern */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
              <label style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 17, color: '#3A2E26', fontWeight: 500,
              }}>
                {t('skinConcernLabel')}
              </label>
              <span style={{ fontSize: 11, color: '#B9AC9E', fontFamily: "'DM Sans', sans-serif" }}>{t('skinConcernOptional')}</span>
            </div>

            {/* Quick-select chips */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
              {quickConcerns.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleChip(key, label)}
                  style={{
                    border: activeChips.includes(key) ? `1.5px solid ${GOLD}` : '1px solid rgba(255, 255, 255, 0.55)',
                    background: activeChips.includes(key) ? 'rgba(197,160,40,0.12)' : 'rgba(255, 255, 255, 0.45)',
                    color: activeChips.includes(key) ? '#8B6914' : '#887E75',
                    borderRadius: 30, padding: '6px 16px',
                    fontSize: 12, cursor: 'pointer',
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
                  padding: '16px 18px 32px', fontSize: 13, color: '#3A2E26',
                  fontFamily: "'DM Sans', sans-serif",
                  resize: 'vertical', outline: 'none',
                  lineHeight: 1.6,
                }}
              />
              <span style={{
                position: 'absolute', bottom: 9, right: 12,
                fontSize: 11, color: skinConcern.length >= SKIN_CONCERN_MAX ? '#c0392b' : '#B9AC9E',
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
                    fontSize: 17, color: '#3A2E26', fontWeight: 500,
                  }}>
                    {t('ageLabel')}
                  </label>
                  <span style={{ fontSize: 11, color: '#B9AC9E', fontFamily: "'DM Sans', sans-serif" }}>{t('skinConcernOptional')}</span>
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
                    padding: '14px 18px', fontSize: 13, color: '#3A2E26',
                    fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  }}
                />
              </div>

              {/* Climate */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                  <label style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 17, color: '#3A2E26', fontWeight: 500,
                  }}>
                    {t('climateLabel')}
                  </label>
                  <span style={{ fontSize: 11, color: '#B9AC9E', fontFamily: "'DM Sans', sans-serif" }}>{t('skinConcernOptional')}</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <select
                    value={climate}
                    onChange={(e) => setClimate(e.target.value)}
                    className="input-nacré"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      borderRadius: 18,
                      padding: '14px 18px', fontSize: 13, color: climate ? '#3A2E26' : '#887E75',
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
                  <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#B9AC9E', fontSize: 10 }}>
                    ▼
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                  <label style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 17, color: '#3A2E26', fontWeight: 500,
                  }}>
                    {t('allergiesLabel')}
                  </label>
                  <span style={{ fontSize: 11, color: '#B9AC9E', fontFamily: "'DM Sans', sans-serif" }}>{t('skinConcernOptional')}</span>
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
                    padding: '14px 18px', fontSize: 13, color: '#3A2E26',
                    fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ margin: '12px 0 0', fontSize: 13, color: '#c0392b', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
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
                background: 'linear-gradient(135deg, #C5A028 0%, #D4B844 50%, #B89020 100%)',
                boxShadow: [
                  '0 2px 0 0 rgba(255,255,255,0.6) inset',
                  '0 -2px 0 0 rgba(0,0,0,0.2) inset',
                  'inset 0 0 0 1px rgba(255,255,255,0.25)',
                  '0 12px 32px rgba(197,160,40,0.35)',
                  '0 4px 12px rgba(197,160,40,0.25)',
                ].join(','),
                color: '#FFFFFF',
                transform: 'translateY(-2px)',
              } : {
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.1)',
                color: '#B9AC9E',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }),
            }}
            onMouseEnter={(e) => {
              if (image && !loading) {
                e.target.style.transform = 'translateY(-4px) scale(1.02)';
                e.target.style.boxShadow = [
                  '0 2px 0 0 rgba(255,255,255,0.6) inset',
                  '0 -2px 0 0 rgba(0,0,0,0.2) inset',
                  'inset 0 0 0 1px rgba(255,255,255,0.4)',
                  '0 16px 40px rgba(197,160,40,0.45)',
                  '0 8px 20px rgba(197,160,40,0.35)',
                ].join(',');
              }
            }}
            onMouseLeave={(e) => {
              if (image && !loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = [
                  '0 2px 0 0 rgba(255,255,255,0.6) inset',
                  '0 -2px 0 0 rgba(0,0,0,0.2) inset',
                  'inset 0 0 0 1px rgba(255,255,255,0.25)',
                  '0 12px 32px rgba(197,160,40,0.35)',
                  '0 4px 12px rgba(197,160,40,0.25)',
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
            <p style={{ textAlign: 'center', fontSize: 12, color: '#8C7A6B', marginTop: 10, fontFamily: "'DM Sans', sans-serif" }}>
              {t('analysisTime')}
            </p>
          )}

          {/* Footer trust */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            {[t('noAccountNeeded'), t('resultsIn20s')].map((txt) => (
              <span key={txt} style={{ fontSize: 11, color: '#CBAA8D', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
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
                  fontSize: 11,
                  color: '#A87449',
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

        {/* SEO section - French keyword visibility */}
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px 48px', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 400,
            color: '#3A2E26', margin: '0 0 12px',
          }}>
            {t('pourquoiH2')}
          </h2>
          <p style={{
            fontSize: 13, color: '#8C7A6B', lineHeight: 1.75,
            fontFamily: "'DM Sans', sans-serif", margin: 0,
          }}>
            {t('pourquoiDesc')}
          </p>
        </div>
      </main>

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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
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
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(201,169,97,0.2)',
              borderRadius: '24px',
              padding: '20px 28px',
              width: '100%',
              boxShadow: '0 4px 20px rgba(168,116,73,0.05)',
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

              {/* Live step pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, rgba(201,169,97,0.12), rgba(197,160,40,0.06))',
                border: '1px solid rgba(201,169,97,0.28)',
                borderRadius: '9999px',
                padding: '7px 16px',
                opacity: stepFade ? 1 : 0,
                transition: 'opacity 350ms ease-in-out',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, animation: 'stepIconPulse 1.5s ease-in-out infinite' }}>
                  <path d={ANALYSIS_STEPS[analysisStep]?.icon} />
                </svg>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px', fontWeight: 600,
                  color: '#6B4E2A', letterSpacing: '0.01em',
                }}>{ANALYSIS_STEPS[analysisStep]?.label}</span>
              </div>
            </div>

            {/* ── CENTER: Progress ring ── */}
            <div style={{
              position: 'relative', width: 160, height: 160,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Outer glow ring */}
              <div style={{
                position: 'absolute', inset: -8,
                borderRadius: '50%',
                background: `conic-gradient(rgba(201,169,97,${(progress/100)*0.25}) ${progress * 3.6}deg, transparent 0deg)`,
                filter: 'blur(8px)',
                transition: 'background 0.5s ease',
              }} />
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
                {/* Dashed track */}
                <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(201,169,97,0.12)" strokeWidth="8" strokeDasharray="4 6" />
                {/* Solid track */}
                <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(201,169,97,0.08)" strokeWidth="8" />
                {/* Progress arc */}
                <circle
                  cx="80" cy="80" r="66"
                  fill="none"
                  stroke="url(#progressGrad)"
                  strokeWidth="8"
                  strokeDasharray={414.69}
                  strokeDashoffset={414.69 * (1 - progress / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s cubic-bezier(0.4,0,0.2,1)' }}
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A87449" />
                    <stop offset="50%" stopColor="#C9A961" />
                    <stop offset="100%" stopColor="#E5C583" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center content */}
              <div style={{
                position: 'absolute', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '2px',
              }}>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '42px', fontWeight: 700,
                  color: '#3D2914', lineHeight: 1,
                }}>{Math.round(progress)}%</span>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '10px', fontWeight: 600,
                  color: '#B0885E', letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}>analyse</span>
              </div>
            </div>

            {/* ── BOTTOM: Facts card ── */}
            <div style={{
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
            }}>
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
                }}>Le saviez-vous ?</span>
                {/* Dots indicator */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                  {FACTS.map((_, i) => (
                    <div key={i} style={{
                      width: i === factIndex ? 16 : 5, height: 5,
                      borderRadius: '9999px',
                      background: i === factIndex ? '#C9A961' : 'rgba(201,169,97,0.25)',
                      transition: 'all 0.4s ease',
                    }} />
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
                <rect width="100" height="100" fill="white"/>
                <ellipse cx="50" cy="46" rx="36" ry="44" fill="black"/>
              </mask>
            </defs>
            <rect width="100" height="100" fill="rgba(0,0,0,0.48)" mask="url(#faceMask)"/>
            <ellipse cx="50" cy="46" rx="36" ry="44" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.6" strokeDasharray="2.5 1.8"/>
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

      <style>{`
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
      `}</style>
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
