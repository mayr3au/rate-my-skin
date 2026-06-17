import { useState, useMemo } from "react";
import { useLang } from "../lib/LangContext";
import { sanitizeReport } from "../lib/textSanitizer";
import MedicalDisclaimer from "./MedicalDisclaimer";
import ProductImage from "./ProductImage";

/* ════════════════════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════════════════════ */

const COLORS = {
  good: "#7AAE98",
  mid: "#9AB5CE",
  bad: "#D199AB",
  gold: "#C9A961",
  goldDark: "#A88947",
  goldLight: "#D4B574",
  ink: "#2C2416",
  inkSoft: "#5C4A3A",
  muted: "#8A7A6B",
  cream: "#FBF6EE",
};

function categorize(score) {
  if (score >= 80) return "good";
  if (score >= 60) return "mid";
  return "bad";
}

function statusLabel(score, lang) {
  const cat = categorize(score);
  if (lang === "fr") {
    return { good: "Excellent", mid: "À surveiller", bad: "Priorité" }[cat];
  }
  return { good: "Excellent", mid: "Monitor", bad: "Priority" }[cat];
}

const METRIC_ORDER = [
  "hydration",
  "radiance",
  "acne",
  "pores",
  "dark_spots",
  "dark_circles",
  "texture",
  "redness",
];

const METRIC_LABELS_FR = {
  hydration: "Hydratation",
  radiance: "Éclat",
  acne: "Acné",
  pores: "Pores",
  dark_spots: "Taches",
  dark_circles: "Cernes",
  texture: "Texture",
  redness: "Rougeurs",
};
const METRIC_LABELS_EN = {
  hydration: "Hydration",
  radiance: "Radiance",
  acne: "Acne",
  pores: "Pores",
  dark_spots: "Dark spots",
  dark_circles: "Dark circles",
  texture: "Texture",
  redness: "Redness",
};

function normalizeMetric(m) {
  const raw = (m.id || m.key || m.label || "").toString().toLowerCase().replace(/\s+/g, "_");
  if (raw.includes("hydra")) return "hydration";
  if (raw.includes("radian") || raw.includes("eclat") || raw.includes("éclat")) return "radiance";
  if (raw.includes("acne") || raw.includes("acné")) return "acne";
  if (raw.includes("pore")) return "pores";
  if (raw.includes("dark_spot") || raw.includes("tache") || raw.includes("pigment")) return "dark_spots";
  if (raw.includes("dark_circle") || raw.includes("cerne")) return "dark_circles";
  if (raw.includes("texture")) return "texture";
  if (raw.includes("red") || raw.includes("rouge")) return "redness";
  return raw;
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Score Hero
   ════════════════════════════════════════════════════════════════════════ */

function ScoreHero({ score, lang, firstName, isPaid }) {
  const safeScore = Math.max(1, Math.min(100, Math.round(score || 0)));
  const dash = (safeScore / 100) * 263.9;
  const greeting =
    lang === "fr"
      ? firstName
        ? `Bonjour ${firstName}, voici ta peau aujourd'hui`
        : "Voici ta peau aujourd'hui"
      : firstName
      ? `Hello ${firstName}, here is your skin today`
      : "Here is your skin today";

  const verdictFr = isPaid
    ? <>Plan personnalisé prêt — <strong>objectif {Math.min(100, safeScore + 20)} en 8 semaines</strong></>
    : <>Ta peau a du <strong>potentiel</strong> — mais quelques choses la ralentissent.</>;
  const verdictEn = isPaid
    ? <>Plan ready — <strong>target {Math.min(100, safeScore + 20)} in 8 weeks</strong></>
    : <>Your skin has <strong>potential</strong> — but a few things slow it down.</>;

  return (
    <div className="rfn-score-hero">
      <div className="rfn-ornament">✦</div>
      <div className="rfn-eyebrow">
        {isPaid ? (lang === "fr" ? "Diagnostic complet" : "Complete diagnosis") : (lang === "fr" ? "Ton diagnostic" : "Your diagnosis")}
      </div>
      <h1 className="rfn-hero-title">{greeting}</h1>
      <div className="rfn-gauge">
        <svg viewBox="0 0 100 100">
          <defs>
            <linearGradient id="rfn-score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8C988" />
              <stop offset="40%" stopColor="#D4B574" />
              <stop offset="70%" stopColor="#C9A961" />
              <stop offset="100%" stopColor="#A88947" />
            </linearGradient>
            <radialGradient id="rfn-center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#FBF6EE" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FBF6EE" stopOpacity="0" />
            </radialGradient>
            <filter id="rfn-arc-glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="36" fill="url(#rfn-center-glow)" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="#C9A961" strokeWidth="0.35" opacity="0.32" />
          <g fill="#C9A961">
            <circle cx="50" cy="3" r="0.9" opacity="0.6" />
            <circle cx="73.5" cy="9.3" r="0.55" opacity="0.4" />
            <circle cx="90.7" cy="26.5" r="0.55" opacity="0.4" />
            <circle cx="97" cy="50" r="0.9" opacity="0.6" />
            <circle cx="90.7" cy="73.5" r="0.55" opacity="0.4" />
            <circle cx="73.5" cy="90.7" r="0.55" opacity="0.4" />
            <circle cx="50" cy="97" r="0.9" opacity="0.6" />
            <circle cx="26.5" cy="90.7" r="0.55" opacity="0.4" />
            <circle cx="9.3" cy="73.5" r="0.55" opacity="0.4" />
            <circle cx="3" cy="50" r="0.9" opacity="0.6" />
            <circle cx="9.3" cy="26.5" r="0.55" opacity="0.4" />
            <circle cx="26.5" cy="9.3" r="0.55" opacity="0.4" />
          </g>
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(201,169,97,0.14)" strokeWidth="4.5" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="url(#rfn-score-grad)" strokeWidth="5"
            strokeDasharray={`${dash} 263.9`} strokeLinecap="round" opacity="0.55" filter="url(#rfn-arc-glow)" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="url(#rfn-score-grad)" strokeWidth="4.2"
            strokeDasharray={`${dash} 263.9`} strokeLinecap="round" />
          <circle cx="50" cy="50" r="37" fill="none" stroke="#C9A961" strokeWidth="0.3" opacity="0.28" />
        </svg>
        <div className="rfn-gauge-num">
          <span className="rfn-gauge-n">{safeScore}</span>
          <span className="rfn-gauge-d">/ 100</span>
        </div>
      </div>
      <p className="rfn-verdict">{lang === "fr" ? verdictFr : verdictEn}</p>
      {isPaid && (
        <span className="rfn-badge-unlocked">
          ✓ {lang === "fr" ? "Rapport débloqué" : "Report unlocked"}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Metric Card
   ════════════════════════════════════════════════════════════════════════ */

function MetricCard({ metric, lang, locked }) {
  const cat = categorize(metric.score);
  const color = COLORS[cat];
  const labels = lang === "fr" ? METRIC_LABELS_FR : METRIC_LABELS_EN;
  const label = labels[metric.id] || metric.label || metric.id;
  const status = statusLabel(metric.score, lang);
  const dash = (metric.score / 100) * 106.8;

  return (
    <div className={`rfn-metric ${locked ? "rfn-locked" : ""}`}>
      <div className="rfn-ring">
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(201,169,97,0.15)" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="17" fill="none" stroke={color} strokeWidth="2.5"
            strokeDasharray={`${dash} 106.8`} strokeLinecap="round" transform="rotate(-90 20 20)" />
        </svg>
        <div className="rfn-ring-v">{metric.score}</div>
      </div>
      <div className="rfn-metric-info">
        <div className="rfn-metric-label">{label}</div>
        <div className={`rfn-metric-status rfn-status-${cat}`}>{status}</div>
      </div>
      {locked && (
        <div className="rfn-lock">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Heatmap (free or paid)
   ════════════════════════════════════════════════════════════════════════ */

function HeatmapFree({ metrics, lang }) {
  const ordered = [...metrics].sort((a, b) => b.score - a.score);
  const visible = ordered.slice(0, 3);
  const locked = ordered.slice(3);
  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{lang === "fr" ? "Tes 8 dimensions" : "Your 8 dimensions"}</h2>
        <span className="rfn-section-count">{lang === "fr" ? `${visible.length} / 8 visibles` : `${visible.length} / 8 visible`}</span>
      </div>
      <div className="rfn-heatmap">
        {visible.map((m) => (
          <MetricCard key={m.id} metric={m} lang={lang} locked={false} />
        ))}
        {locked.map((m) => (
          <MetricCard key={m.id} metric={m} lang={lang} locked={true} />
        ))}
      </div>
    </div>
  );
}

function HeatmapPaid({ metrics, lang }) {
  const good = metrics.filter((m) => categorize(m.score) === "good");
  const mid = metrics.filter((m) => categorize(m.score) === "mid");
  const bad = metrics.filter((m) => categorize(m.score) === "bad");
  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{lang === "fr" ? "Bilan détaillé" : "Detailed report"}</h2>
      </div>
      {good.length > 0 && (
        <>
          <div className="rfn-segment-label rfn-status-good">
            ✓ {lang === "fr" ? "Tes forces" : "Your strengths"} ({good.length})
          </div>
          <div className="rfn-heatmap">
            {good.map((m) => <MetricCard key={m.id} metric={m} lang={lang} />)}
          </div>
        </>
      )}
      {mid.length > 0 && (
        <>
          <div className="rfn-segment-label rfn-status-mid">
            ◐ {lang === "fr" ? "À surveiller" : "Monitor"} ({mid.length})
          </div>
          <div className="rfn-heatmap">
            {mid.map((m) => <MetricCard key={m.id} metric={m} lang={lang} />)}
          </div>
        </>
      )}
      {bad.length > 0 && (
        <>
          <div className="rfn-segment-label rfn-status-bad">
            ● {lang === "fr" ? "Priorités" : "Priorities"} ({bad.length})
          </div>
          <div className="rfn-heatmap">
            {bad.map((m) => <MetricCard key={m.id} metric={m} lang={lang} />)}
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Face Map
   ════════════════════════════════════════════════════════════════════════ */

const ZONE_BY_METRIC = {
  pores: { top: "6%", left: "47%" },
  dark_circles_l: { top: "38%", left: "27%" },
  dark_circles_r: { top: "38%", left: "60%" },
  hydration_l: { top: "53%", left: "16%" },
  hydration_r: { top: "53%", left: "70%" },
  texture_l: { top: "22%", left: "32%" },
  texture_r: { top: "22%", left: "56%" },
  acne: { top: "65%", left: "44%" },
  redness_l: { top: "44%", left: "22%" },
  redness_r: { top: "44%", left: "65%" },
  dark_spots_l: { top: "32%", left: "20%" },
  dark_spots_r: { top: "32%", left: "67%" },
  radiance: { top: "48%", left: "44%" },
};

function FaceMap({ metrics, lang, limitTo3 }) {
  // Get top-priority metrics (lowest scores) and map to face zones
  const sortedByImpact = [...metrics].sort((a, b) => a.score - b.score);
  const toShow = limitTo3 ? sortedByImpact.slice(0, 3) : sortedByImpact;
  const labels = lang === "fr" ? METRIC_LABELS_FR : METRIC_LABELS_EN;

  const hotspots = [];
  toShow.forEach((m, idx) => {
    const cat = categorize(m.score);
    const num = idx + 1;
    if (m.id === "dark_circles") {
      hotspots.push({ ...ZONE_BY_METRIC.dark_circles_l, cat, num, id: m.id });
      hotspots.push({ ...ZONE_BY_METRIC.dark_circles_r, cat, num, id: m.id });
    } else if (m.id === "hydration") {
      hotspots.push({ ...ZONE_BY_METRIC.hydration_l, cat, num, id: m.id });
      hotspots.push({ ...ZONE_BY_METRIC.hydration_r, cat, num, id: m.id });
    } else if (m.id === "texture") {
      hotspots.push({ ...ZONE_BY_METRIC.texture_l, cat, num, id: m.id });
      hotspots.push({ ...ZONE_BY_METRIC.texture_r, cat, num, id: m.id });
    } else if (m.id === "redness") {
      hotspots.push({ ...ZONE_BY_METRIC.redness_l, cat, num, id: m.id });
      hotspots.push({ ...ZONE_BY_METRIC.redness_r, cat, num, id: m.id });
    } else if (m.id === "dark_spots") {
      hotspots.push({ ...ZONE_BY_METRIC.dark_spots_l, cat, num, id: m.id });
      hotspots.push({ ...ZONE_BY_METRIC.dark_spots_r, cat, num, id: m.id });
    } else if (ZONE_BY_METRIC[m.id]) {
      hotspots.push({ ...ZONE_BY_METRIC[m.id], cat, num, id: m.id });
    }
  });

  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">
          {limitTo3
            ? (lang === "fr" ? "Là où ça se joue" : "Where it happens")
            : (lang === "fr" ? "Cartographie complète" : "Complete map")}
        </h2>
      </div>
      <div className="rfn-face-card">
        <div className="rfn-face-svg">
          <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
            <path d="M 100 30 C 70 30, 55 55, 55 90 C 55 130, 65 175, 100 215 C 135 175, 145 130, 145 90 C 145 55, 130 30, 100 30 Z"
              fill="rgba(255,255,255,0.5)" stroke="#C9A961" strokeWidth="1.2" opacity="0.85" />
            <ellipse cx="78" cy="100" rx="6" ry="2.5" fill="#C9A961" opacity="0.4" />
            <ellipse cx="122" cy="100" rx="6" ry="2.5" fill="#C9A961" opacity="0.4" />
            <path d="M 100 110 L 96 135 L 100 138 L 104 135 Z" fill="none" stroke="#C9A961" strokeWidth="1" opacity="0.4" />
            <path d="M 88 160 Q 100 168 112 160" stroke="#C9A961" strokeWidth="1" fill="none" opacity="0.4" />
          </svg>
          {hotspots.map((h, i) => (
            <div key={i} className={`rfn-hotspot rfn-hot-${h.cat}`} style={{ top: h.top, left: h.left }}>
              {h.num}
            </div>
          ))}
        </div>
        <div className="rfn-face-legend">
          {toShow.map((m, idx) => (
            <div key={m.id} className="rfn-legend-item">
              <strong>{idx + 1}.</strong> {labels[m.id] || m.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Priority Cards (paid)
   ════════════════════════════════════════════════════════════════════════ */

function PriorityCards({ problems, lang }) {
  if (!problems || problems.length === 0) return null;
  const top3 = problems.slice(0, 3);
  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{lang === "fr" ? "Tes 3 priorités" : "Your 3 priorities"}</h2>
        <span className="rfn-section-count">{lang === "fr" ? "À traiter d'abord" : "Treat first"}</span>
      </div>
      <div className="rfn-priorities">
        {top3.map((p, i) => {
          const isMid = (p.severity || "").toLowerCase() === "moderate" || (p.severity || "").toLowerCase() === "modéré";
          return (
            <div key={i} className={`rfn-prio ${isMid ? "rfn-prio-mid" : ""}`}>
              <div className="rfn-prio-top">
                <span className="rfn-prio-name">{p.title}</span>
                {p.zone && <span className="rfn-prio-zone">{p.zone}</span>}
              </div>
              <p className="rfn-prio-cause">{p.description}</p>
              {p.activeIngredient && (
                <span className="rfn-prio-actif">✦ {p.activeIngredient}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Routine Timeline (paid)
   ════════════════════════════════════════════════════════════════════════ */

function RoutineTimeline({ routine, lang }) {
  const [tab, setTab] = useState("morning");
  if (!routine || (!routine.morning?.length && !routine.evening?.length)) return null;
  const steps = (routine[tab] || []).map((s) =>
    typeof s === "string"
      ? { text: s, productName: null, brand: null, price: null, imageUrl: null, productUrl: null }
      : {
          text: s.stepText || s.text || "",
          productName: s.productData?.product_name || s.productName || s.product_name,
          brand: s.productData?.brand || s.brand,
          price: s.productData?.price ? `${s.productData.price} €` : null,
          stepType: s.productData?.routine_step || s.routineStep,
          imageUrl: s.productData?.product_image_url || s.product_image_url || s.imageUrl || null,
          productUrl: s.productData?.amazon_url || s.productData?.sephora_url || s.productData?.product_url || null,
        }
  );

  const stepLabel = (stepType, idx) => {
    if (!stepType) return lang === "fr" ? `Étape ${idx + 1}` : `Step ${idx + 1}`;
    const map = lang === "fr"
      ? { cleanser: "Nettoyage", oil_cleanser: "Démaquillage", toner: "Lotion", exfoliant: "Exfoliant", serum: "Sérum", moisturizer: "Hydratation", sunscreen: "Protection SPF", mask: "Masque", treatment: "Traitement", eye: "Contour des yeux" }
      : { cleanser: "Cleanse", oil_cleanser: "Oil cleanse", toner: "Tone", exfoliant: "Exfoliate", serum: "Serum", moisturizer: "Moisturize", sunscreen: "SPF", mask: "Mask", treatment: "Treat", eye: "Eye care" };
    return map[stepType] || stepType;
  };

  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{lang === "fr" ? "Ta routine sur-mesure" : "Your custom routine"}</h2>
      </div>
      <div className="rfn-routine-strip">
        <button className={tab === "morning" ? "active" : ""} onClick={() => setTab("morning")}>
          ☀ {lang === "fr" ? "Matin" : "Morning"}
        </button>
        <button className={tab === "evening" ? "active" : ""} onClick={() => setTab("evening")}>
          🌙 {lang === "fr" ? "Soir" : "Evening"}
        </button>
      </div>
      <div className="rfn-steps">
        {steps.map((s, i) => {
          const Wrap = s.productUrl ? "a" : "div";
          const wrapProps = s.productUrl
            ? { href: s.productUrl, target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
            <Wrap key={i} className="rfn-step" {...wrapProps}>
              <div className="rfn-step-thumb">
                {s.imageUrl ? (
                  <ProductImage src={s.imageUrl} alt={s.productName} sizes="56px" />
                ) : (
                  <span className="rfn-step-num-fallback">{i + 1}</span>
                )}
              </div>
              <div className="rfn-step-body">
                <div className="rfn-step-label">{stepLabel(s.stepType, i)}</div>
                <div className="rfn-step-product">{s.productName || s.text}</div>
                {(s.brand || s.price) && (
                  <div className="rfn-step-brand">
                    {s.brand}{s.brand && s.price ? " · " : ""}{s.price}
                  </div>
                )}
              </div>
              {s.productUrl && (
                <span className="rfn-step-cta" aria-hidden="true">→</span>
              )}
            </Wrap>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Progression Chart
   ════════════════════════════════════════════════════════════════════════ */

function ProgressionChart({ score, lang, locked }) {
  const from = Math.max(1, Math.min(100, Math.round(score || 0)));
  const to = Math.min(100, from + 20);
  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">
          {locked
            ? (lang === "fr" ? "Ta progression possible" : "Your potential progress")
            : (lang === "fr" ? "Ta trajectoire 8 semaines" : "Your 8-week trajectory")}
        </h2>
      </div>
      <div className={`rfn-progress ${locked ? "rfn-locked-card" : ""}`}>
        <div className="rfn-chart-wrap">
          <h3>
            {lang === "fr" ? `De ${from} à ${to} en 8 semaines` : `From ${from} to ${to} in 8 weeks`}
          </h3>
          <p className="rfn-pdesc">
            {lang === "fr" ? "Si tu suis la routine, voici la courbe attendue" : "If you follow the routine, here is the expected curve"}
          </p>
          <div className="rfn-from-to">
            <span className="rfn-from">{from}</span>
            <span className="rfn-arrow">→</span>
            <span className="rfn-to">{to}</span>
          </div>
          <svg viewBox="0 0 280 80" style={{ width: "100%", height: "80px" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rfn-grad-prog" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A961" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 0 60 Q 70 55 140 35 T 280 12 L 280 80 L 0 80 Z" fill="url(#rfn-grad-prog)" />
            <path d="M 0 60 Q 70 55 140 35 T 280 12" stroke="#C9A961" strokeWidth="2" fill="none" />
            <circle cx="0" cy="60" r="4" fill="#D199AB" />
            <circle cx="280" cy="12" r="4" fill="#7AAE98" />
            {!locked && (
              <>
                <text x="8" y="56" fontSize="9" fill="#D199AB" fontWeight="700">{lang === "fr" ? "Sem. 0" : "Week 0"}</text>
                <text x="240" y="9" fontSize="9" fill="#7AAE98" fontWeight="700">{lang === "fr" ? "Sem. 8" : "Week 8"}</text>
              </>
            )}
          </svg>
        </div>
        {locked && (
          <div className="rfn-progress-overlay">
            <h4>{lang === "fr" ? "Débloque ta trajectoire" : "Unlock your trajectory"}</h4>
            <p>{lang === "fr" ? `Vois comment passer de ${from} à ${to}, semaine après semaine.` : `See how to go from ${from} to ${to}, week by week.`}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Testimonial (free)
   ════════════════════════════════════════════════════════════════════════ */

function MiniTestimonial({ lang }) {
  return (
    <div className="rfn-testimonial">
      <p className="rfn-test-q">
        {lang === "fr"
          ? "« J'avais 54/100. Trois mois plus tard, 82. La routine est claire et abordable. »"
          : "\"I had 54/100. Three months later, 82. The routine is clear and affordable.\""}
      </p>
      <div className="rfn-test-a">
        <span>{lang === "fr" ? "Sarah · 28 ans · acné + taches" : "Sarah · 28 · acne + spots"}</span>
        <span className="rfn-stars">★★★★★</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Paywall (free)
   ════════════════════════════════════════════════════════════════════════ */

function Paywall({ onUnlock, unlocking, lang }) {
  return (
    <div className="rfn-paywall">
      <div className="rfn-anchor">
        <span>{lang === "fr" ? "Consultation dermato" : "Dermatology consult"}</span>
        <span className="rfn-strike">40 – 60 €</span>
      </div>
      <div className="rfn-anchor rfn-anchor-feat">
        <span>{lang === "fr" ? "Ton rapport complet" : "Your full report"}</span>
        <span className="rfn-price">7,99 €</span>
      </div>
      <button onClick={onUnlock} disabled={unlocking} className="rfn-cta">
        <span className="rfn-cta-star">✦</span>
        {unlocking ? (lang === "fr" ? "Redirection..." : "Redirecting...") : (lang === "fr" ? "Débloquer mon rapport complet" : "Unlock my full report")}
      </button>
      <p className="rfn-cta-sub">
        {lang === "fr" ? "Paiement unique · Accès à vie · Sans abonnement" : "One-time payment · Lifetime access · No subscription"}
      </p>
      <div className="rfn-guarantee-wrap">
        <span className="rfn-guarantee">
          ✓ {lang === "fr" ? "Remboursé 7 jours si pas satisfaite" : "7-day money-back guarantee"}
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: PDF Card (paid)
   ════════════════════════════════════════════════════════════════════════ */

function PdfCard({ onDownload, loading, lang }) {
  return (
    <div className="rfn-section">
      <div className="rfn-pdf-card">
        <div className="rfn-pdf-thumb">
          <div className="rfn-pdf-lines">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div className="rfn-pdf-info">
          <div className="rfn-pdf-eyebrow">{lang === "fr" ? "Document" : "Document"}</div>
          <div className="rfn-pdf-title">{lang === "fr" ? "Ton rapport PDF" : "Your PDF report"}</div>
          <button onClick={onDownload} disabled={loading}>
            {loading ? (lang === "fr" ? "..." : "...") : (lang === "fr" ? "Télécharger" : "Download")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════════════════ */

export default function ReportRefonte({
  data: rawData,
  isPaid,
  onUnlock,
  firstName,
}) {
  const { lang } = useLang();
  const data = useMemo(() => sanitizeReport(rawData, lang), [rawData, lang]);
  const [unlocking, setUnlocking] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const metrics = useMemo(() => {
    if (!data) return [];
    const paid = data.paid_version || {};
    const rawMetrics = paid.metrics && paid.metrics.length > 0
      ? paid.metrics
      : (data.metrics || []);
    if (!rawMetrics || rawMetrics.length === 0) {
      return METRIC_ORDER.map((id) => ({ id, score: 70, label: METRIC_LABELS_FR[id] || id }));
    }
    return rawMetrics.map((m) => ({
      ...m,
      id: normalizeMetric(m),
      score: Math.max(1, Math.min(100, Math.round(m.score || 0))),
    }));
  }, [data]);

  if (!data) return null;

  const score = data.overall || 0;
  const freeData = data.free_version || {};
  const paid = data.paid_version || {};
  const mainProblems = freeData.mainProblems || [];

  const handleUnlock = async (planId = "single") => {
    setUnlocking(true);
    try {
      await onUnlock(planId);
    } finally {
      setUnlocking(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const analysisId = typeof window !== "undefined" ? sessionStorage.getItem("rms_analysis_id") : null;
      if (!analysisId) {
        alert(lang === "fr" ? "Identifiant de rapport introuvable" : "Report ID not found");
        return;
      }
      window.open(`/api/generate-pdf?analysisId=${analysisId}`, "_blank");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="rfn-root">
      <style jsx global>{`
        .rfn-root {
          background: linear-gradient(180deg, #FBF6EE 0%, #F8F1E5 50%, #F5EBDB 100%);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #2C2416;
          padding-bottom: 80px;
        }
        .rfn-container {
          max-width: 480px;
          margin: 0 auto;
          padding: 24px 0 0;
        }

        /* Score Hero */
        .rfn-score-hero {
          padding: 38px 26px 32px;
          text-align: center;
          position: relative;
        }
        .rfn-ornament {
          color: #C9A961;
          font-size: 10px;
          opacity: 0.5;
          margin-bottom: 12px;
        }
        .rfn-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #C9A961;
          margin-bottom: 14px;
        }
        .rfn-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 400;
          color: #2C2416;
          margin: 0 0 28px;
          line-height: 1.18;
          letter-spacing: -0.005em;
        }
        .rfn-gauge {
          width: 200px;
          height: 200px;
          margin: 0 auto 22px;
          position: relative;
          filter: drop-shadow(0 8px 24px rgba(201,169,97,0.18));
        }
        .rfn-gauge svg { width: 100%; height: 100%; }
        .rfn-gauge-num {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .rfn-gauge-n {
          font-family: 'Cormorant Garamond', serif;
          font-size: 72px;
          font-weight: 500;
          color: #A88947;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .rfn-gauge-d {
          font-size: 11px;
          color: #B0885E;
          margin-top: 4px;
          letter-spacing: 0.16em;
          font-weight: 600;
          text-transform: uppercase;
        }
        .rfn-verdict {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 19px;
          color: #5C4A3A;
          line-height: 1.42;
          max-width: 320px;
          margin: 0 auto 18px;
        }
        .rfn-verdict strong {
          color: #2C2416;
          font-style: italic;
          font-weight: 500;
          background: linear-gradient(transparent 70%, rgba(201,169,97,0.25) 70%);
          padding: 0 2px;
        }
        .rfn-badge-unlocked {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(122,174,152,0.18) 0%, rgba(122,174,152,0.08) 100%);
          color: #7AAE98;
          border: 1px solid rgba(122,174,152,0.35);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        /* Section */
        .rfn-section { padding: 28px 26px 10px; }
        .rfn-section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(201,169,97,0.18);
          position: relative;
        }
        .rfn-section-head::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, #C9A961, transparent);
        }
        .rfn-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 23px;
          font-weight: 500;
          color: #2C2416;
          letter-spacing: -0.005em;
          margin: 0;
        }
        .rfn-section-count {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #B0885E;
        }

        /* Segment label */
        .rfn-segment-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin: 18px 0 8px;
        }
        .rfn-status-good { color: #7AAE98; }
        .rfn-status-mid { color: #9AB5CE; }
        .rfn-status-bad { color: #D199AB; }

        /* Heatmap */
        .rfn-heatmap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 0;
        }
        .rfn-metric {
          background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,253,247,0.7) 100%);
          border: 1px solid rgba(201,169,97,0.2);
          border-radius: 16px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 6px 18px rgba(168,116,73,0.04);
        }
        .rfn-ring {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          position: relative;
        }
        .rfn-ring svg { width: 100%; height: 100%; }
        .rfn-ring-v {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 600;
          color: #2C2416;
        }
        .rfn-metric-info { min-width: 0; flex: 1; }
        .rfn-metric-label {
          font-size: 13px;
          font-weight: 600;
          color: #2C2416;
          margin-bottom: 3px;
        }
        .rfn-metric-status {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .rfn-locked {
          filter: blur(4px);
          pointer-events: none;
          opacity: 0.85;
        }

        /* Face Map */
        .rfn-face-card {
          background:
            radial-gradient(ellipse at top, rgba(201,169,97,0.06), transparent 60%),
            linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(251,246,238,0.55) 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 24px;
          padding: 24px 20px 20px;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 32px rgba(168,116,73,0.05);
        }
        .rfn-face-card::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #C9A961, transparent);
        }
        .rfn-face-svg {
          width: 100%;
          height: 260px;
          position: relative;
        }
        .rfn-face-svg svg { width: 100%; height: 100%; }
        .rfn-hotspot {
          position: absolute;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Cormorant Garamond', serif;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .rfn-hot-good { border-color: #7AAE98; color: #7AAE98; }
        .rfn-hot-mid { border-color: #9AB5CE; color: #9AB5CE; }
        .rfn-hot-bad { border-color: #D199AB; color: #D199AB; }
        .rfn-face-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 16px;
          font-size: 11px;
          justify-content: center;
        }
        .rfn-legend-item {
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 100px;
          padding: 6px 12px;
          color: #5C4A3A;
        }
        .rfn-legend-item strong {
          color: #B0885E;
          font-weight: 700;
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px;
          margin-right: 4px;
        }

        /* Priorities */
        .rfn-priorities {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rfn-prio {
          background: linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 18px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 28px rgba(168,116,73,0.05);
        }
        .rfn-prio::before {
          content: "";
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #D199AB 0%, #E6BCC8 100%);
        }
        .rfn-prio-mid::before {
          background: linear-gradient(180deg, #9AB5CE 0%, #BFD0E0 100%);
        }
        .rfn-prio-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 10px;
          gap: 12px;
        }
        .rfn-prio-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 500;
          color: #2C2416;
        }
        .rfn-prio-zone {
          font-size: 9.5px;
          color: #B0885E;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          font-weight: 700;
          white-space: nowrap;
        }
        .rfn-prio-cause {
          font-size: 13px;
          color: #5C4A3A;
          line-height: 1.55;
          margin: 0 0 12px;
        }
        .rfn-prio-actif {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(201,169,97,0.14) 0%, rgba(201,169,97,0.06) 100%);
          color: #8B6E26;
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 100px;
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 600;
        }

        /* Routine */
        .rfn-routine-strip {
          display: flex;
          background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(251,246,238,0.7) 100%);
          border-radius: 100px;
          padding: 5px;
          margin-bottom: 18px;
          border: 1px solid rgba(201,169,97,0.2);
        }
        .rfn-routine-strip button {
          flex: 1;
          background: transparent;
          border: none;
          padding: 10px;
          border-radius: 100px;
          font-family: 'DM Sans';
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          color: #8A7A6B;
        }
        .rfn-routine-strip button.active {
          background: linear-gradient(135deg, #2C2416 0%, #1a1410 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(44,36,22,0.18);
        }
        .rfn-steps {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }
        .rfn-step {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 12px 14px;
          margin-bottom: 10px;
          position: relative;
          background: linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.2);
          border-radius: 16px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 20px rgba(168,116,73,0.04);
          text-decoration: none;
          color: inherit;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        a.rfn-step:hover {
          transform: translateY(-1px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 14px 28px rgba(168,116,73,0.08);
          border-color: rgba(201,169,97,0.35);
        }
        .rfn-step-thumb {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, #FDFAF4 0%, #F5EBDB 100%);
          border: 1px solid rgba(201,169,97,0.25);
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 12px rgba(168,116,73,0.06);
        }
        .rfn-step-num-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #8B6E26;
        }
        .rfn-step-cta {
          color: #C9A961;
          font-size: 18px;
          font-family: 'Cormorant Garamond', serif;
          flex-shrink: 0;
          margin-left: 4px;
          opacity: 0.6;
          transition: all 0.25s;
        }
        a.rfn-step:hover .rfn-step-cta {
          opacity: 1;
          transform: translateX(3px);
        }
        .rfn-step-body { flex: 1; padding-top: 4px; }
        .rfn-step-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #C9A961;
          margin-bottom: 3px;
        }
        .rfn-step-product {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          color: #2C2416;
          font-weight: 500;
          line-height: 1.25;
        }
        .rfn-step-brand {
          font-size: 11px;
          color: #8A7A6B;
          margin-top: 3px;
        }

        /* Progress */
        .rfn-progress {
          background:
            radial-gradient(ellipse at top right, rgba(201,169,97,0.08), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #FDF8F0 100%);
          border: 1px solid rgba(201,169,97,0.28);
          border-radius: 22px;
          padding: 24px 20px;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 32px rgba(168,116,73,0.06);
          overflow: hidden;
        }
        .rfn-progress h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 500;
          margin: 0 0 4px;
          color: #2C2416;
        }
        .rfn-pdesc {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: #8A7A6B;
          margin: 0 0 18px;
        }
        .rfn-from-to {
          display: flex;
          justify-content: center;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 18px;
        }
        .rfn-from {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          color: #D199AB;
          font-weight: 500;
        }
        .rfn-arrow {
          color: #C9A961;
          font-size: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
        }
        .rfn-to {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px;
          color: #7AAE98;
          font-weight: 500;
        }
        .rfn-locked-card .rfn-chart-wrap {
          filter: blur(4px);
          opacity: 0.7;
        }
        .rfn-progress-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at center, rgba(255,253,247,0.85) 0%, rgba(251,247,242,0.6) 100%);
          backdrop-filter: blur(3px);
          padding: 24px;
          text-align: center;
        }
        .rfn-progress-overlay::before {
          content: "✦";
          color: #C9A961;
          font-size: 14px;
          margin-bottom: 12px;
        }
        .rfn-progress-overlay h4 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          color: #2C2416;
          margin: 0 0 8px;
        }
        .rfn-progress-overlay p {
          font-size: 12.5px;
          color: #5C4A3A;
          max-width: 260px;
          line-height: 1.5;
          margin: 0;
        }

        /* Testimonial */
        .rfn-testimonial {
          margin: 16px 26px 0;
          background:
            radial-gradient(ellipse at right, rgba(201,169,97,0.06), transparent 60%),
            linear-gradient(135deg, #FDF9F4 0%, #FBF5EC 100%);
          border: 1px solid rgba(201,169,97,0.18);
          border-left: 3px solid #C9A961;
          border-radius: 0 16px 16px 0;
          padding: 16px 18px;
          position: relative;
        }
        .rfn-testimonial::before {
          content: "“";
          position: absolute;
          top: 4px;
          right: 14px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px;
          color: #C9A961;
          opacity: 0.18;
          line-height: 1;
        }
        .rfn-test-q {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 15px;
          color: #2C2416;
          line-height: 1.45;
          margin: 0 0 10px;
        }
        .rfn-test-a {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #8A7A6B;
        }
        .rfn-stars { color: #C9A961; letter-spacing: 3px; font-size: 12px; }

        /* Paywall */
        .rfn-paywall {
          margin: 28px 26px 32px;
          background:
            radial-gradient(ellipse at top, rgba(201,169,97,0.06), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.3);
          border-radius: 24px;
          padding: 28px 22px;
          text-align: center;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 20px 48px rgba(168,116,73,0.08);
        }
        .rfn-paywall::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #C9A961, transparent);
        }
        .rfn-anchor {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(201,169,97,0.06) 0%, rgba(201,169,97,0.02) 100%);
          border: 1px solid rgba(201,169,97,0.14);
          border-radius: 12px;
          margin-bottom: 8px;
          font-size: 12.5px;
          color: #5C4A3A;
        }
        .rfn-anchor-feat {
          background: linear-gradient(135deg, rgba(201,169,97,0.22) 0%, rgba(201,169,97,0.12) 100%);
          border-color: rgba(201,169,97,0.32);
          margin-bottom: 18px;
        }
        .rfn-strike {
          color: #B9AC9E;
          text-decoration: line-through;
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
        }
        .rfn-price {
          color: #8B6E26;
          font-weight: 600;
          font-size: 22px;
          font-family: 'Cormorant Garamond', serif;
        }
        .rfn-cta {
          width: 100%;
          background: linear-gradient(180deg, #3A2F22 0%, #2C2416 50%, #1A1410 100%);
          color: #fff;
          border: none;
          padding: 17px 14px;
          border-radius: 100px;
          font-family: 'DM Sans';
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          margin-bottom: 14px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 12px 28px rgba(44,36,22,0.28);
        }
        .rfn-cta:disabled { opacity: 0.6; cursor: not-allowed; }
        .rfn-cta-star {
          margin-right: 10px;
          color: #C9A961;
          font-size: 11px;
        }
        .rfn-cta-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 13px;
          color: #8A7A6B;
          line-height: 1.5;
          margin: 0;
        }
        .rfn-guarantee-wrap { display: flex; justify-content: center; margin-top: 12px; }
        .rfn-guarantee {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(122,174,152,0.18) 0%, rgba(122,174,152,0.08) 100%);
          color: #7AAE98;
          border: 1px solid rgba(122,174,152,0.3);
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        /* PDF */
        .rfn-pdf-card {
          background:
            radial-gradient(ellipse at top right, rgba(201,169,97,0.08), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #FDF8EF 100%);
          border: 1px solid rgba(201,169,97,0.3);
          border-radius: 22px;
          padding: 22px;
          display: flex;
          gap: 18px;
          align-items: center;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 16px 36px rgba(168,116,73,0.06);
        }
        .rfn-pdf-thumb {
          width: 72px;
          height: 92px;
          background: linear-gradient(135deg, #FFFFFF 0%, #FBF5EC 100%);
          border: 1px solid rgba(201,169,97,0.32);
          border-radius: 6px;
          flex-shrink: 0;
          padding: 8px;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 16px rgba(168,116,73,0.12);
        }
        .rfn-pdf-thumb::before {
          content: "✦";
          position: absolute;
          top: 4px;
          left: 6px;
          color: #C9A961;
          font-size: 8px;
          opacity: 0.6;
        }
        .rfn-pdf-thumb::after {
          content: '';
          position: absolute;
          top: 12px;
          left: 8px;
          right: 8px;
          height: 5px;
          background: linear-gradient(90deg, #C9A961, #D4B574);
          border-radius: 2px;
        }
        .rfn-pdf-lines {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .rfn-pdf-lines span {
          display: block;
          height: 2px;
          background: rgba(201,169,97,0.35);
          border-radius: 2px;
        }
        .rfn-pdf-lines span:nth-child(1) { width: 90%; }
        .rfn-pdf-lines span:nth-child(2) { width: 70%; }
        .rfn-pdf-lines span:nth-child(3) { width: 85%; }
        .rfn-pdf-lines span:nth-child(4) { width: 60%; }
        .rfn-pdf-lines span:nth-child(5) { width: 75%; }
        .rfn-pdf-info { flex: 1; }
        .rfn-pdf-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #B0885E;
          margin-bottom: 3px;
        }
        .rfn-pdf-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 500;
          color: #2C2416;
          margin-bottom: 12px;
        }
        .rfn-pdf-info button {
          background: linear-gradient(180deg, #3A2F22 0%, #2C2416 50%, #1A1410 100%);
          color: #fff;
          border: none;
          padding: 9px 18px;
          border-radius: 100px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          text-transform: uppercase;
        }
      `}</style>

      <div className="rfn-container">
        <ScoreHero score={score} lang={lang} firstName={firstName} isPaid={isPaid} />

        {/* Heatmap */}
        {metrics.length > 0 && (isPaid ? (
          <HeatmapPaid metrics={metrics} lang={lang} />
        ) : (
          <HeatmapFree metrics={metrics} lang={lang} />
        ))}

        {/* Face Map */}
        {metrics.length > 0 && (
          <FaceMap metrics={metrics} lang={lang} limitTo3={!isPaid} />
        )}

        {/* Priorities (paid) */}
        {isPaid && mainProblems.length > 0 && (
          <PriorityCards problems={mainProblems} lang={lang} />
        )}

        {/* Routine Timeline (paid) */}
        {isPaid && paid.routine && (
          <RoutineTimeline routine={paid.routine} lang={lang} />
        )}

        {/* Progression Chart */}
        <ProgressionChart score={score} lang={lang} locked={!isPaid} />

        {/* PDF Card (paid) */}
        {isPaid && (
          <PdfCard onDownload={handleDownloadPdf} loading={pdfLoading} lang={lang} />
        )}

        {/* Testimonial + Paywall (free) */}
        {!isPaid && (
          <>
            <MiniTestimonial lang={lang} />
            <Paywall onUnlock={handleUnlock} unlocking={unlocking} lang={lang} />
          </>
        )}

        <div style={{ padding: "0 26px" }}>
          <MedicalDisclaimer style={{ marginTop: 24 }} />
        </div>
      </div>
    </div>
  );
}
