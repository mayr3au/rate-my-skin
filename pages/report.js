import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import BeautyReport from '../components/ReportRefonte';
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
  { icon: "M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z", label: "Calcul du score d'hydratation…" },
  { icon: "M12 2v3m0 14v3M2 12h3m14 0h3M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0", label: "Recherche d'imperfections & acné…" },
  { icon: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", label: "Analyse des ridules et de la fermeté…" },
  { icon: "M9 3H15M10 3V9L5.3 18.4A2 2 0 0 0 7.1 21H16.9A2 2 0 0 0 18.7 18.4L14 9V3M14 9H10", label: "Sélection des ingrédients actifs…" },
  { icon: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6", label: "Génération de la routine sur-mesure…" },
  { icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8M16 17H8", label: "Finalisation de votre ordonnance beauté…" },
];

const PREMIUM_STEPS_EN = [
  { icon: "M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z", label: "Calculating hydration score…" },
  { icon: "M12 2v3m0 14v3M2 12h3m14 0h3M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0", label: "Scanning for blemishes & acne…" },
  { icon: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", label: "Analyzing fine lines & elasticity…" },
  { icon: "M9 3H15M10 3V9L5.3 18.4A2 2 0 0 0 7.1 21H16.9A2 2 0 0 0 18.7 18.4L14 9V3M14 9H10", label: "Selecting active ingredients…" },
  { icon: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6", label: "Generating your custom routine…" },
  { icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8M16 17H8", label: "Finalizing your skin prescription…" },
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
  const [analysesCount, setAnalysesCount] = useState(142);
  const [userId, setUserId] = useState(null);
  const [paidUnlocks, setPaidUnlocks] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [stepFade, setStepFade] = useState(true);

  const [emailCaptured, setEmailCaptured] = useState(true);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('rms_first_name') || '';
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [emailSkipped, setEmailSkipped] = useState(false);

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
    const skipped = sessionStorage.getItem('rms_email_skipped') === '1';
    setEmailSkipped(skipped);

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
        skinTone: isFr ? "Teint Beige Moyen, Type III" : "Type III, Medium Beige",
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
            ? "Votre peau présente une belle résistance générale, avec de légers signes de déshydratation à corriger. Dans l’ensemble, votre peau est en bonne santé, le rapport complet vous donnera des scores détaillés, une routine sur mesure et des produits adaptés."
            : "Your skin shows high overall resilience, with mild indicators of moisture loss. Overall, your skin is in good health, the full report will give you detailed scores, a personalised routine and tailored product recommendations.",
        },
        paid_version: {
          metrics: isFr ? [
            { label: "Hydratation", score: 85, grade: "B", detail: "Bonne fonction barrière, quelques légères tiraillements sur le font." },
            { label: "Pores", score: 79, grade: "B", detail: "Activité sébaceum dans les limites normales, pores légèrement visibles." },
            { label: "Éclat", score: 88, grade: "A", detail: "Excellent renouvellement cellulaire, surface de la peau lumineuse." },
            { label: "Acné", score: 92, grade: "A", detail: "Aucun coumédon actif ni lésion inflammatoire détecté." },
            { label: "Taches", score: 74, grade: "C", detail: "Légères taches solaires sur les joues et hyperpigmentation." },
            { label: "Cernes", score: 68, grade: "D", detail: "Léger creux sous l’œil avec cernes visibles, probablement liés à la fatigue." },
            { label: "Texture", score: 85, grade: "B", detail: "Texture légèrement irrégulière avec quelques rugosités sur les joues." },
            { label: "Rougeurs", score: 90, grade: "A", detail: "Rougeurs diffuses localisées autour du nez et des joues." }
          ] : [
            { label: "Hydration", score: 85, grade: "B", detail: "Optimal barrier function, minor dry lines on the forehead." },
            { label: "Pores", score: 79, grade: "B", detail: "Sebaceous activity is within normal limits; minor visible pores." },
            { label: "Radiance", score: 88, grade: "A", detail: "Excellent cellular turnover; luminous skin surface reflection." },
            { label: "Acne", score: 92, grade: "A", detail: "No active comedones or inflammatory lesions detected." },
            { label: "Dark Spots", score: 74, grade: "C", detail: "Slight sun spots on cheeks and hyperpigmentation." },
            { label: "Under-Eye", score: 68, grade: "D", detail: "Mild structural pooling under orbit, visible periorbital hyperpigmentation." },
            { label: "Texture", score: 85, grade: "B", detail: "Slightly uneven texture with minor roughness on the cheeks." },
            { label: "Redness", score: 90, grade: "A", detail: "Diffuse redness around the nose and cheeks." }
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
              { stepText: "Nettoyer avec un soin doux à pH neutre.", productData: { product_name: "Gel Nettoyant Hydratant", brand: "CeraVe", price: "12,99", routine_step: "cleanser", whyItHelps: "Nettoie sans décaper : préserve le film hydrolipidique mis à mal par ta déshydratation.", applicationTip: "Le matin, masse 20 s sur peau humide, rince à l'eau tiède (jamais chaude) et tamponne sans frotter.", product_image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.fr/dp/B07RK7L1X9?tag=tonid-21" } },
              { stepText: "Appliquer un sérum Vitamine C pour l’action antioxydante.", productData: { product_name: "Sérum Vitamine C 10%", brand: "La Roche-Posay", price: "29,90", routine_step: "serum", whyItHelps: "Antioxydant qui ravive l'éclat terne et estompe progressivement tes taches pigmentaires.", applicationTip: "3 à 4 gouttes sur peau sèche, avant l'hydratant. Toujours suivi du SPF, sinon les taches reviennent.", product_image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.fr/dp/B08XYZ1234?tag=tonid-21" } },
              { stepText: "Utiliser une protection solaire SPF 50+ large spectre.", productData: { product_name: "Anthelios UVMune 400 SPF50+", brand: "La Roche-Posay", price: "19,90", routine_step: "sunscreen", whyItHelps: "Indispensable contre tes taches : 80 % du vieillissement et de la pigmentation vient du soleil.", applicationTip: "Dernière étape du matin, l'équivalent de 2 doigts sur le visage. Ré-applique vers midi si tu sors.", product_image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.fr/dp/B09ABCD567?tag=tonid-21" } }
            ],
            evening: [
              { stepText: "Double nettoyage pour éliminer la pollution.", productData: { product_name: "Huile Démaquillante Deep Cleansing", brand: "DHC", price: "23,00", routine_step: "oil_cleanser", whyItHelps: "Dissout SPF et pollution sans frotter : évite d'agresser une peau déjà sensibilisée.", applicationTip: "Le soir sur peau sèche, masse 1 min, puis émulsionne avec un peu d'eau avant de rincer.", product_image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.fr/dp/B001UE60E8?tag=tonid-21" } },
              { stepText: "Appliquer délicatement une crème contour des yeux pour cibler les cernes.", productData: { product_name: "Caffeine Solution 5% + EGCG", brand: "The Ordinary", price: "8,90", routine_step: "eye_cream", whyItHelps: "La caféine décongestionne et atténue tes cernes en relançant la microcirculation.", applicationTip: "Tapote l'équivalent d'un grain de riz sous l'œil, matin et soir, avec l'annulaire (pression douce).", product_image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.fr/dp/B06XYZ8901?tag=tonid-21" } },
              { stepText: "Appliquer du Rétinol 0,3 % pour stimuler le renouvellement cellulaire.", productData: { product_name: "Rétinol 0.3% in Squalane", brand: "The Ordinary", price: "9,90", routine_step: "treatment", whyItHelps: "Stimule le renouvellement cellulaire : lisse la texture et resserre visiblement tes pores.", applicationTip: "Le soir, 2 à 3 fois/semaine au début pour habituer la peau. Évite le contour des yeux. Jamais sans SPF le lendemain.", product_image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.fr/dp/B07L1PHSZ9?tag=tonid-21" } },
              { stepText: "Utiliser une crème riche en céramides pour renforcer la barrière cutanée.", productData: { product_name: "Crème Réparatrice Céramides", brand: "CeraVe", price: "14,99", routine_step: "moisturizer", whyItHelps: "Les céramides scellent l'hydratation et réparent ta barrière cutanée fragilisée.", applicationTip: "Le soir, sur peau encore légèrement humide pour piéger l'eau. Insiste sur les zones qui tiraillent.", product_image_url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.fr/dp/B00TTD9BRC?tag=tonid-21" } }
            ],
            weekly: [
              "Exfoliant AHA/BHA deux fois par semaine pour affiner le grain de peau.",
              "Masque hydratant apaisant une fois par semaine."
            ]
          } : {
            morning: [
              { stepText: "Cleanse with a mild, pH-balanced cleanser.", productData: { product_name: "Hydrating Facial Cleanser", brand: "CeraVe", price: "12.99", routine_step: "cleanser", whyItHelps: "Cleanses without stripping: protects the moisture barrier weakened by your dehydration.", applicationTip: "In the morning, massage for 20s on damp skin, rinse with lukewarm (never hot) water and pat dry.", product_image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.com/dp/B07RK7L1X9?tag=tonid-20" } },
              { stepText: "Apply Vitamin C Serum for antioxidant defence.", productData: { product_name: "Vitamin C 10% Serum", brand: "La Roche-Posay", price: "29.90", routine_step: "serum", whyItHelps: "Antioxidant that revives dull radiance and gradually fades your dark spots.", applicationTip: "3-4 drops on dry skin, before moisturiser. Always follow with SPF, or the spots come back.", product_image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.com/dp/B08XYZ1234?tag=tonid-20" } },
              { stepText: "Use SPF 50+ broad-spectrum sunscreen.", productData: { product_name: "Anthelios UVMune 400 SPF50+", brand: "La Roche-Posay", price: "19.90", routine_step: "sunscreen", whyItHelps: "Essential against your dark spots: 80% of ageing and pigmentation comes from the sun.", applicationTip: "Last step of the morning, two-finger length on the face. Re-apply around noon if you go out.", product_image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.com/dp/B09ABCD567?tag=tonid-20" } }
            ],
            evening: [
              { stepText: "Double cleanse to remove pollution.", productData: { product_name: "Deep Cleansing Oil", brand: "DHC", price: "23.00", routine_step: "oil_cleanser", whyItHelps: "Dissolves SPF and pollution without rubbing: avoids irritating already-sensitised skin.", applicationTip: "At night on dry skin, massage for 1 min, then emulsify with a little water before rinsing.", product_image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.com/dp/B001UE60E8?tag=tonid-20" } },
              { stepText: "Gently apply an eye repair cream to target dark circles.", productData: { product_name: "Caffeine Solution 5% + EGCG", brand: "The Ordinary", price: "8.90", routine_step: "eye_cream", whyItHelps: "Caffeine de-puffs and reduces your dark circles by boosting microcirculation.", applicationTip: "Tap a rice-grain amount under the eye, morning and night, with your ring finger (gentle pressure).", product_image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.com/dp/B06XYZ8901?tag=tonid-20" } },
              { stepText: "Apply Retinol 0.3% to boost cellular turnover.", productData: { product_name: "Retinol 0.3% in Squalane", brand: "The Ordinary", price: "9.90", routine_step: "treatment", whyItHelps: "Boosts cell turnover: smooths texture and visibly tightens your pores.", applicationTip: "At night, 2-3 times/week at first to let skin adjust. Avoid the eye area. Never skip SPF the next day.", product_image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.com/dp/B07L1PHSZ9?tag=tonid-20" } },
              { stepText: "Use a ceramide-rich barrier support cream.", productData: { product_name: "Moisturising Cream", brand: "CeraVe", price: "14.99", routine_step: "moisturizer", whyItHelps: "Ceramides lock in hydration and repair your weakened skin barrier.", applicationTip: "At night, on slightly damp skin to trap water. Focus on the areas that feel tight.", product_image_url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=200&q=60", amazon_link: "https://www.amazon.com/dp/B00TTD9BRC?tag=tonid-20" } }
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
              price: "€10-14",
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
          if (res.analysesCount) {
            setAnalysesCount(res.analysesCount);
          }
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

    if (router.query.demo === 'true') {
      setCheckingPayment(true);
      return;
    }

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
        const data = await res.json();
        const { isPaid: paid, report, should_fire_purchase } = data;
        if (paid) {
          sessionStorage.setItem('rms_is_paid', 'true');
          if (report) {
            sessionStorage.setItem('rms_report', JSON.stringify(report));
            setData(report);
          }
          setIsPaid(true);
          setProgress(100);

          // Trigger GA4 purchase event on server-confirmed transaction
          const purchaseSentKey = `rms_purchase_sent_${sessionId}`;
          const isPurchaseAlreadySent = sessionStorage.getItem(purchaseSentKey) === 'true';
          
          if (should_fire_purchase && !isPurchaseAlreadySent && typeof window !== 'undefined' && window.gtag) {
            const pendingPlanId = sessionStorage.getItem('rms_pending_plan_id') || 'single';
            const value = pendingPlanId === 'pack' ? 19.99 : 7.99;
            const itemId = pendingPlanId === 'pack' ? 'five_analyses' : 'single_analysis';
            const itemName = pendingPlanId === 'pack' ? 'Pack 5 Analyses' : 'Analyse Individuelle';

            window.gtag('event', 'purchase', {
              transaction_id: sessionId,
              value: value,
              currency: 'EUR',
              items: [{
                item_id: itemId,
                item_name: itemName,
                price: value,
                quantity: 1
              }]
            });
            sessionStorage.setItem(purchaseSentKey, 'true');
            sessionStorage.removeItem('rms_pending_plan_id');
          }

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
    // Require email, first name optional
    if (!email.trim()) return;
    setEmailLoading(true);
    const trimmedEmail = email.trim();
    if (trimmedEmail) {
      try {
        await Promise.all([
          fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmedEmail, newsletter: newsletterConsent }),
          }),
          fetch('/api/identity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmedEmail }),
          }),
        ]);
      } catch {}
    }
    localStorage.setItem('rms_email_captured', '1');
    localStorage.setItem('rms_user_email', trimmedEmail);
    // Store first name if provided (optional)
    if (firstName.trim()) {
      localStorage.setItem('rms_first_name', firstName.trim());
    }
    setEmailCaptured(true);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'email_save_submitted', {
        event_category: 'conversion_funnel',
        event_label: 'soft_email_gate'
      });
    }
    setEmailLoading(false);
  };

  const handleEmailSkip = () => {
    setEmailSkipped(true);
    sessionStorage.setItem('rms_email_skipped', '1');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'email_save_skipped', {
        event_category: 'conversion_funnel',
        event_label: 'soft_email_gate'
      });
    }
  };

  // 4. handleUnlock: calls checkout, redirects to Stripe
  const handleUnlock = async (planId) => {
    setCheckoutError(null);

    if (!userId || !analysisId) {
      setCheckoutError(
        lang === 'fr'
          ? 'Session en cours de chargement. Patientez quelques secondes puis réessayez.'
          : 'Session still loading. Please wait a moment and try again.'
      );
      return;
    }

    const email = typeof window !== 'undefined'
      ? (localStorage.getItem('rms_user_email') || localStorage.getItem('rms_email') || '')
      : '';
    try {
      if (typeof window !== 'undefined') {
        window.rms_is_redirecting_to_stripe = true;
        sessionStorage.setItem('rms_pending_plan_id', planId);
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, analysisId, planId, email }),
      });

      if (!res.ok) throw new Error('Server error');

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
      if (typeof window !== 'undefined') {
        window.rms_is_redirecting_to_stripe = false;
        sessionStorage.removeItem('rms_pending_plan_id');
      }
      setCheckoutError(
        lang === 'fr'
          ? 'Une erreur est survenue. Merci de réessayer ou de nous contacter.'
          : 'Something went wrong. Please try again or contact us.'
      );
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

      {!checkingPayment && (
        <>
          {/* Legacy nav hidden — NavBar is now rendered inside ReportRefonte */}
          {false && (
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
        <div onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Logo />
        </div>
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
        </div>
        
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.5vw, 16px)' }}>
          <LangToggle />
          <button
            onClick={() => router.push('/technologie')}
            style={{
              background: 'none', border: 'none',
              padding: '9px 4px', fontSize: 12, color: '#888', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {t('techNav')}
          </button>
          <button
            onClick={() => router.push('/blog')}
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
              {t('newAnalysis')}
            </button>
          </div>
        </div>
      </div>
      )}

      <div>
        <BeautyReport
          data={data}
          isPaid={isPaid}
          onUnlock={handleUnlock}
          checkoutError={checkoutError}
          analysesCount={analysesCount}
          emailCaptured={emailCaptured}
          setEmailCaptured={setEmailCaptured}
          emailSkipped={emailSkipped}
          setEmailSkipped={setEmailSkipped}
          email={email}
          setEmail={setEmail}
          firstName={firstName}
          setFirstName={setFirstName}
          emailLoading={emailLoading}
          setEmailLoading={setEmailLoading}
          newsletterConsent={newsletterConsent}
          setNewsletterConsent={setNewsletterConsent}
          handleEmailSubmit={handleEmailSubmit}
          handleEmailSkip={handleEmailSkip}
        />
      </div>
      </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
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
          .card-blur {
            padding: clamp(24px,5vw,36px) !important;
            max-width: 90% !important;
          }
          .input-nacré {
            font-size: 13px !important;
            padding: 12px 16px !important;
          }
          .btn-liquid-glass-dark {
            font-size: 13px !important;
            padding: 12px 18px !important;
          }
        }
      ` }} />
    </>
  );
}
