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

export default function Report() {
  const router = useRouter();
  const { lang, t } = useLang();

  const [data, setData] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [userId, setUserId] = useState(null);
  const [paidUnlocks, setPaidUnlocks] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    // 1. Read from sessionStorage
    const stored = sessionStorage.getItem('rms_report');

    // In local development, if no report exists, inject a beautiful mock paid report!
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
            { label: "Hydratation", score: 85, grade: "B", detail: "Bonne fonction barrière, quelques légères tiraillements sur le front." },
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
              productName: "CeraVe Eye Repair Cream",
              description: isFr
                ? "Formulé avec des céramides et de l’acide hyaluronique pour cibler les signes de déshydratation et protéger le contour des yeux."
                : "Formulated with ceramides and hyaluronic acid to target structural dehydration lines and protect the orbital area.",
              amazonLink: "https://www.amazon.fr/s?k=CeraVe+Eye+Repair+Cream&tag=ratemyskin-21",
              sephoraLink: "https://www.sephora.fr/search/?q=CeraVe+Eye+Repair+Cream",
              price: "€14.50",
              imageUrl: "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=200&auto=format&fit=crop"
            }
          ]
        }
      };
      setData(mockReport);
      const urlParams = new URLSearchParams(window.location.search);
      setIsPaid(urlParams.get('paid') === 'true');
    } else {
      if (!stored) { setNotFound(true); return; }
      try {
        setData(JSON.parse(stored));
      } catch {
        setNotFound(true);
        return;
      }
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

    // 2. Fetch identity + paid_unlocks
    fetch('/api/identity')
      .then(r => r.json())
      .then(({ userId: uid, paidUnlocks: unlocks }) => {
        setUserId(uid);
        if (unlocks > 0) setPaidUnlocks(unlocks);
      })
      .catch(() => { });
  }, [lang]);

  // 3. Handle payment=success query param
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.payment !== 'success') return;

    const storedAnalysisId = sessionStorage.getItem('rms_analysis_id');
    if (!storedAnalysisId) return;

    setCheckingPayment(true);
    // Remove query param from URL
    router.replace('/report', undefined, { shallow: true });

    // Poll analysis status — up to 10 attempts × 2s = 20s coverage for slow webhooks
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch(`/api/analysis-status?id=${storedAnalysisId}`);
        const { isPaid: paid } = await res.json();
        if (paid) {
          sessionStorage.setItem('rms_is_paid', 'true');
          setIsPaid(true);
          setCheckingPayment(false);
          return;
        }
      } catch { }
      attempts++;
      if (attempts < 10) {
        setTimeout(poll, 2000);
      } else {
        setCheckingPayment(false);
      }
    };

    poll();
  }, [router.isReady, router.query.payment]);

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
      const { url, error: err } = await res.json();
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

      {/* Payment checking overlay */}
      {checkingPayment && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(253,250,247,0.97)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, gap: 16,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            width: 32, height: 32,
            border: '2px solid #0d0d0d', borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          }} />
          <p style={{ fontSize: 14, color: '#0d0d0d' }}>{t('checkingPayment')}</p>
        </div>
      )}

      {/* Sticky frosted-glass nav */}
      <div className="rpt-nav" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
        padding: '13px 26px',
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

      <BeautyReport data={data} isPaid={isPaid} onUnlock={handleUnlock} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
