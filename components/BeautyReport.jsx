import { useState, useEffect } from "react";
import { useLang } from "../lib/LangContext";
import { shareScore } from "../lib/shareImage";

const GOLD = "#C5A028";
const CARD = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(150%)",
  WebkitBackdropFilter: "blur(20px) saturate(150%)",
  border: "1px solid rgba(255, 255, 255, 0.65)",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(168, 116, 73, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
};
const LABEL_STYLE = { margin: "0 0 4px", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#B0885E", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" };
const TITLE_STYLE = { margin: "0 0 16px", fontSize: 22, fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", color: "#3A2E26" };

const ICONS = ["✦", "◈", "◉", "▲", "◆", "●"];

const PAYWALL_ICONS = [
  /* 1 — Metrics: minimal scan lines (like a skin reader) */
  <svg key="scan" width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <line x1="2" y1="4.5" x2="14" y2="4.5"/>
    <line x1="2" y1="7.5" x2="11" y2="7.5"/>
    <line x1="2" y1="10.5" x2="13" y2="10.5"/>
    <line x1="2" y1="13.5" x2="9" y2="13.5"/>
    <line x1="3" y1="1.5" x2="3" y2="14.5" strokeWidth="0.8" strokeOpacity="0.35"/>
  </svg>,
  /* 2 — Strengths: single botanical leaf */
  <svg key="leaf" width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 14 C8 14 2 10 3 4 C6 3 12 4 13 8 C14 12 8 14 8 14 Z"/>
    <line x1="8" y1="14" x2="7" y2="7" strokeWidth="0.9"/>
  </svg>,
  /* 3 — Improvement: minimal upward trend */
  <svg key="trend" width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,12 6,8 9,10 14,4"/>
    <polyline points="11,4 14,4 14,7"/>
  </svg>,
  /* 4 — Routine: crescent moon + dot (AM/PM) */
  <svg key="moon" width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M11 3 A6 6 0 1 0 11 13 A4 4 0 1 1 11 3 Z"/>
    <circle cx="12.5" cy="3.5" r="0.7" fill="currentColor" stroke="none"/>
  </svg>,
  /* 5 — Products: serum dropper bottle */
  <svg key="bottle" width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5.5" y="6" width="5" height="8" rx="1.5"/>
    <path d="M7 6 L7 4 L9 4 L9 6"/>
    <line x1="8" y1="2" x2="8" y2="4"/>
    <line x1="6.5" y1="9.5" x2="9.5" y2="9.5" strokeWidth="0.9" strokeOpacity="0.5"/>
    <line x1="6.5" y1="11.5" x2="9.5" y2="11.5" strokeWidth="0.9" strokeOpacity="0.5"/>
  </svg>,
];

// Helper to solve cubic-bezier(x1, y1, x2, y2) at progress t
function solveCubicBezier(x1, y1, x2, y2, t) {
  const cx = 3.0 * x1;
  const bx = 3.0 * (x2 - x1) - cx;
  const ax = 1.0 - cx - bx;

  const cy = 3.0 * y1;
  const by = 3.0 * (y2 - y1) - cy;
  const ay = 1.0 - cy - by;

  function sampleCurveX(tVal) {
    return ((ax * tVal + bx) * tVal + cx) * tVal;
  }
  function sampleCurveY(tVal) {
    return ((ay * tVal + by) * tVal + cy) * tVal;
  }
  function sampleCurveDerivativeX(tVal) {
    return (3.0 * ax * tVal + 2.0 * bx) * tVal + cx;
  }

  let x = t;
  let tFound = t;
  for (let i = 0; i < 8; i++) {
    const xEst = sampleCurveX(tFound) - x;
    if (Math.abs(xEst) < 1e-4) break;
    const dX = sampleCurveDerivativeX(tFound);
    if (Math.abs(dX) < 1e-3) break;
    tFound -= xEst / dX;
  }
  return sampleCurveY(tFound);
}

/* ══ Score hero card — dark tech panel ══════════════════════════════════ */
function ScoreHeroCard({ score, summary, faceShape, skinType, skinTone, badge, miniMetrics, t, lang }) {
  const [animated, setAnimated] = useState(0);
  const [displayScore, setDisplayScore] = useState(1);

  // Helper to translate trait values automatically in French
  const getTranslatedValue = (val) => {
    if (!val) return "";
    if (lang === 'fr') {
      const lower = val.toLowerCase().trim();
      if (lower.includes('combination to oily') || lower.includes('combination') || lower === 'mixte à grasse') return 'Mixte à Grasse';
      if (lower.includes('oval') || lower === 'ovale') return 'Ovale';
      if (lower.includes('medium beige') || lower.includes('type iii')) return 'Type III — Beige Moyen';
      if (lower.includes('dry') || lower === 'sèche') return 'Peau Sèche';
      if (lower.includes('oily') || lower === 'grasse') return 'Peau Grasse';
      if (lower.includes('sensitive') || lower === 'sensible') return 'Peau Sensible';
      if (lower.includes('normal')) return 'Peau Normale';
    }
    return val;
  };

  useEffect(() => {
    let startTimestamp = null;
    const duration = 2000; // 2 seconds, perfectly in sync with the visual weight
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Calculate eased progress matching the exact cubic-bezier curve
      const easeProgress = solveCubicBezier(0.4, 0, 0.2, 1, progress);

      const currentRingVal = score * easeProgress;
      const currentScoreVal = Math.round(1 + (score - 1) * easeProgress);

      setAnimated(currentRingVal);
      setDisplayScore(currentScoreVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    const delayTimer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(step);
    }, 220);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [score]);

  const SIZE = 156;
  const r = SIZE / 2 - 11;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;
  const statusLabel = score >= 78 ? t("scoreExcellent") : score >= 65 ? t("scoreGood") : t("scoreNeedsWork");
  const arcColor = score >= 78 ? "#C5A028" : score >= 65 ? "#A87449" : "#8C7A6B";

  return (
    <div className="rpt-score-hero" style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.84) 0%, rgba(253,246,237,0.68) 50%, rgba(246,235,222,0.84) 100%)",
      backdropFilter: "blur(32px) saturate(170%)",
      WebkitBackdropFilter: "blur(32px) saturate(170%)",
      borderRadius: 28, marginBottom: 24, position: "relative", overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.9)",
      boxShadow: [
        "0 2px 0 rgba(255,255,255,0.95)",
        "0 6px 12px rgba(168,116,73,0.10)",
        "0 18px 40px rgba(140,90,50,0.18)",
        "0 40px 80px rgba(100,60,30,0.14)",
        "0 70px 120px rgba(80,45,15,0.08)",
        "inset 0 1px 0 rgba(255,255,255,0.98)",
        "inset 0 -1px 0 rgba(168,116,73,0.06)",
      ].join(", "),
      transform: "translateY(-4px)",
      padding: "clamp(20px,5vw,32px)",
    }}>

      {/* Corner bracket — top-left */}
      <div style={{
        position: "absolute", top: 14, left: 14, width: 18, height: 18,
        borderTop: "1.5px solid rgba(168,116,73,0.2)", borderLeft: "1.5px solid rgba(168,116,73,0.2)", pointerEvents: "none"
      }} />
      {/* Corner bracket — top-right */}
      <div style={{
        position: "absolute", top: 14, right: 14, width: 18, height: 18,
        borderTop: "1.5px solid rgba(168,116,73,0.2)", borderRight: "1.5px solid rgba(168,116,73,0.2)", pointerEvents: "none"
      }} />
      {/* Corner bracket — bottom-left */}
      <div style={{
        position: "absolute", bottom: 14, left: 14, width: 18, height: 18,
        borderBottom: "1.5px solid rgba(168,116,73,0.2)", borderLeft: "1.5px solid rgba(168,116,73,0.2)", pointerEvents: "none"
      }} />
      {/* Corner bracket — bottom-right */}
      <div style={{
        position: "absolute", bottom: 14, right: 14, width: 18, height: 18,
        borderBottom: "1.5px solid rgba(168,116,73,0.2)", borderRight: "1.5px solid rgba(168,116,73,0.2)", pointerEvents: "none"
      }} />

      {/* Top label row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, position: "relative" }}>
        <p style={{
          margin: 0, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase",
          color: "#B0885E", fontFamily: "'DM Sans', sans-serif"
        }}>
          {t("overallScore")}
        </p>
        {badge && (
          <span style={{
            fontSize: 7.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#8C7A6B", background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(255,255,255,0.75)", borderRadius: 20, padding: "3px 10px",
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {badge}
          </span>
        )}
      </div>

      {/* Centered ring */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, position: "relative" }}>
        <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
          {/* Decorative outer dashes */}
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ position: "absolute", inset: 0 }}>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={r + 7}
              fill="none" stroke="rgba(168, 116, 73, 0.14)" strokeWidth="1" strokeDasharray="2.5 8" />
          </svg>
          {/* Progress ring */}
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <defs>
              <linearGradient id="heroArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6B4828" />
                <stop offset="50%" stopColor="#D4A574" />
                <stop offset="100%" stopColor="#A87449" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx={SIZE / 2} cy={SIZE / 2} r={r}
              fill="none" stroke="rgba(168,116,73,0.1)" strokeWidth="9" />
            {/* Arc */}
            <circle cx={SIZE / 2} cy={SIZE / 2} r={r}
              fill="none" stroke="url(#heroArcGrad)" strokeWidth="9"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
          </svg>
          {/* Number + status label centered */}
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 2
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{
                fontSize: 58, fontWeight: 200, lineHeight: 1,
                fontFamily: "'Cormorant Garamond', serif", color: "#3A2E26",
                textShadow: "none"
              }}>
                {displayScore}
              </span>
              <span style={{
                fontSize: 15, color: "#A87449",
                fontFamily: "'Cormorant Garamond', serif", paddingBottom: 7
              }}>
                /100
              </span>
            </div>
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              color: arcColor, fontFamily: "'DM Sans', sans-serif", marginTop: 1
            }}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p style={{
        margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.72, textAlign: "center", position: "relative",
        color: "#6F6156", fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif",
        wordBreak: "break-word"
      }}>
        {summary}
      </p>

      {/* Separator */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,116,73,0.15), transparent)", margin: "0 0 16px" }} />

      {/* Trait tags */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", position: "relative" }}>
        {[{ k: t("faceShape"), v: faceShape }, { k: t("skinType"), v: skinType }, { k: t("skinTone"), v: skinTone }].map(tag => tag.v ? (
          <div key={tag.k} style={{
            background: "rgba(255,255,255,0.62)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 10,
            padding: "7px 14px", border: "1px solid rgba(255,255,255,0.82)"
          }}>
            <div style={{
              fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#B0885E", fontWeight: 600, fontFamily: "'DM Sans', sans-serif"
            }}>
              {tag.k}
            </div>
            <div style={{
              fontSize: 12, color: "#3A2E26", fontWeight: 600,
              marginTop: 3, fontFamily: "'DM Sans', sans-serif"
            }}>
              {getTranslatedValue(tag.v)}
            </div>
          </div>
        ) : null)}
      </div>

      {/* Mini-metrics strip (paid view only) */}
      {miniMetrics && miniMetrics.length > 0 && (
        <>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,116,73,0.15), transparent)", margin: "16px 0" }} />
          <div style={{ display: "flex", position: "relative" }}>
            {miniMetrics.map((m, i) => (
              <div key={m.label} className="rpt-mini-metric" style={{
                flex: 1, textAlign: "center", padding: "0 10px",
                borderRight: i < miniMetrics.length - 1 ? "1px solid rgba(168,116,73,0.12)" : "none",
              }}>
                <div style={{
                  fontSize: 22, fontWeight: 200, color: "#3A2E26",
                  fontFamily: "'Cormorant Garamond', serif", lineHeight: 1
                }}>
                  {m.score}
                </div>
                <div style={{
                  fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#A0938A", fontWeight: 600, marginTop: 4,
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Animated score ring (metric cards) ── */
function ScoreRing({ score, size = 64 }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 300);
    return () => clearTimeout(timer);
  }, [score]);
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;
  const color = score >= 78 ? GOLD : score >= 65 ? "#8C7A6B" : "#B9AC9E";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", flexShrink: 0, display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(168,116,73,0.12)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)" }}
        strokeLinecap="round" />
    </svg>
  );
}

/* ── Metric card ── */
function MetricCard({ m, index }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVis(true), index * 80 + 100);
    return () => clearTimeout(timer);
  }, [index]);
  const gradeColor = m.score >= 78 ? { bg: "rgba(197,160,40,0.12)", color: "#8B6914" } : m.score >= 65 ? { bg: "rgba(168,116,73,0.1)", color: "#8C7A6B" } : { bg: "rgba(168,116,73,0.06)", color: "#B9AC9E" };
  return (
    <div style={{
      ...CARD, padding: "18px 20px",
      display: "flex", gap: 16, alignItems: "center",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.55s ease, transform 0.55s ease",
    }}>
      <div className="rpt-metric-ring" style={{ position: "relative", flexShrink: 0, width: 58, height: 58 }}>
        <ScoreRing score={m.score} size={58} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#3A2E26", fontFamily: "'Cormorant Garamond', serif" }}>{m.score}</span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3A2E26" }}>{m.label}</span>
          <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 9px", background: gradeColor.bg, color: gradeColor.color, letterSpacing: "0.06em", flexShrink: 0 }}>{m.grade}</span>
        </div>
        <div style={{ height: 2, background: "rgba(168,116,73,0.1)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${m.score}%`, background: "linear-gradient(90deg, #A87449, #D4A574)", borderRadius: 10, transition: "width 1.6s cubic-bezier(0.4,0,0.2,1)" }} />
        </div>
        <p className="rpt-metric-detail" style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "#8C7A6B", wordBreak: "break-word", overflowWrap: "break-word" }}>{m.detail}</p>
      </div>
    </div>
  );
}

/* ── Product image lookup ── */
const getProductImage = (productName) => {
  const name = productName?.toLowerCase() || '';
  if (name.includes('cerave sa cleanser') || name.includes('sa smoothing cleanser')) {
    return 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes("paula's choice 2%") || (name.includes('paula') && name.includes('bha'))) {
    return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('alpha arbutin')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('skinceuticals') || name.includes('c e ferulic')) {
    return 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('cerave moistur') || name.includes('crème hydratante')) {
    return 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('laneige') || name.includes('sleeping mask')) {
    return 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('ordinary niacinamide')) {
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('saturn') || name.includes('sunday riley') || name.includes('sulfur')) {
    return 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('caffeine eye') || name.includes('inkey list')) {
    return 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('avocado') || name.includes('kiehl')) {
    return 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('glow recipe') || name.includes('watermelon') || name.includes('dew drops')) {
    return 'https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('drunk elephant') || name.includes('firma')) {
    return 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes("paula's choice 8%") || (name.includes('paula') && name.includes('aha'))) {
    return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=240&auto=format&fit=crop';
  }

  if (name.includes('cleanser') || name.includes('nettoyant')) {
    return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('serum') || name.includes('sérum')) {
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('cream') || name.includes('moisturizer') || name.includes('crème')) {
    return 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=240&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=240&auto=format&fit=crop';
};

/* ── Product card ── */
function ProductCard({ product, lang, t }) {
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  const amazonUrl = product.amazonLink || `https://www.amazon.fr/s?k=${encodeURIComponent(product.productName)}&tag=ratemyskin-21`;
  const sephoraUrl = product.sephoraLink || `https://www.sephora.fr/search/?q=${encodeURIComponent(product.productName)}`;
  const primaryLink = amazonUrl;

  const imgUrl = product.imageUrl || getProductImage(product.productName);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...CARD,
        padding: "20px",
        border: hov ? "1px solid rgba(168,116,73,0.45)" : "1px solid rgba(255, 255, 255, 0.85)",
        boxShadow: hov ? "0 16px 40px rgba(168,116,73,0.12), inset 0 1px 0 rgba(255,255,255,0.95)" : "0 8px 32px rgba(168,116,73,0.03), inset 0 1px 0 rgba(255,255,255,0.95)",
        opacity: vis ? 1 : 0,
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        transition: "opacity 0.45s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s, background-color 0.3s",
        display: "flex",
        gap: "20px",
        alignItems: "stretch",
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(253, 246, 237, 0.52) 50%, rgba(246, 235, 222, 0.78) 100%)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
      }}
    >
      {/* Product image wrapper */}
      <div style={{
        flexShrink: 0,
        width: "clamp(90px, 22vw, 110px)",
        borderRadius: "14px",
        overflow: "hidden",
        background: "#FFFFFF",
        border: "1px solid rgba(168,116,73,0.1)",
        position: "relative",
        boxShadow: "0 6px 18px rgba(168, 116, 73, 0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <a href={primaryLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", height: "100%" }}>
          {imgFailed ? (
            <div style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #FBF6F0 0%, #EEDCD0 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "20px", color: "#A87449" }}>✦</span>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#8C7A6B", marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>CARE</span>
            </div>
          ) : (
            <img
              src={imgUrl}
              alt={product.productName}
              onError={() => setImgFailed(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: hov ? "scale(1.06)" : "scale(1)",
              }}
            />
          )}
        </a>
      </div>

      {/* Content wrapper */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Header row with Category and Price */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <span style={{
              display: "inline-block",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#A87449",
              background: "rgba(168,116,73,0.06)",
              border: "1px solid rgba(168,116,73,0.18)",
              borderRadius: 6,
              padding: "3px 8px"
            }}>
              {product.skinProblem}
            </span>
            <span style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#A87449",
              fontFamily: "'DM Sans', sans-serif"
            }}>
              {product.price}
            </span>
          </div>

          {/* Product Title */}
          <div style={{
            fontSize: 17.5,
            fontWeight: 600,
            color: "#2C241D",
            marginBottom: 6,
            fontFamily: "'Cormorant Garamond', serif",
            lineHeight: 1.25,
            wordBreak: "break-word"
          }}>
            {product.productName}
          </div>

          {/* Product Description */}
          <p style={{
            margin: "0 0 16px",
            fontSize: 12.5,
            color: "#6F6156",
            lineHeight: 1.6,
            wordBreak: "break-word"
          }}>
            {product.description}
          </p>
        </div>

        {/* Buttons Row */}
        <div className="rpt-product-btns" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-liquid-glass-dark"
            style={{
              padding: "9px 18px",
              fontSize: 11.5,
              borderRadius: 10,
              border: "none",
              flex: 1,
              textAlign: "center",
              whiteSpace: "nowrap"
            }}
          >
            {t('buyAmazon')}
          </a>
          <a
            href={sephoraUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-liquid-glass"
            style={{
              padding: "9px 18px",
              fontSize: 11.5,
              borderRadius: 10,
              border: "none",
              flex: 1,
              textAlign: "center",
              whiteSpace: "nowrap"
            }}
          >
            {t('buySephora')}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Severity badge ── */
function SeverityBadge({ severity, t }) {
  const configs = {
    mild:        { color: "#7DBFA8", bg: "rgba(168,220,200,0.18)", border: "rgba(168,220,200,0.45)", label: t('severityMild') },
    moderate:    { color: "#82B8D8", bg: "rgba(168,200,232,0.18)", border: "rgba(168,200,232,0.45)", label: t('severityModerate') },
    significant: { color: "#D4A0BC", bg: "rgba(232,184,212,0.18)", border: "rgba(232,184,212,0.45)", label: t('severitySignificant') },
  };
  const cfg = configs[severity] || configs.mild;
  return (
    <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "3px 9px" }}>
      {cfg.label}
    </span>
  );
}

const SEVERITY_ACCENT = { mild: "#A8DCC8", moderate: "#A8C8E8", significant: "#E8B8D4" };

/* ── Shared report header ── */
function ReportHeader({ t }) {
  return (
    <div className="rpt-report-header" style={{
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(22px) saturate(150%)",
      WebkitBackdropFilter: "blur(22px) saturate(150%)",
      borderBottom: "1px solid rgba(255,255,255,0.65)",
      padding: "28px 28px 20px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 100% at 50% -20%, rgba(168,116,73,0.02) 0%, transparent 100%)" }} />
      <div className="mobile-padding" style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
        <p className="mobile-hide" style={{
          margin: "0 0 6px", fontSize: 10, fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          fontFamily: "'DM Sans', sans-serif", color: "#B0885E",
        }}>{t('aestheticAnalysis')}</p>
        <h1 style={{
          margin: "0 0 4px",
          fontSize: "clamp(20px, 5vw, 28px)",
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          fontStyle: "normal",
          letterSpacing: "0.01em",
          lineHeight: 1.2,
          background: "linear-gradient(180deg, #2C241D 0%, #6B4828 12%, #A87449 50%, #6B4828 88%, #2C241D 100%)",
          backgroundSize: "100% 150%",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "logoShimmer 20s ease-in-out infinite",
        }}>
          {t('yourFacialReport')}
        </h1>
        <p className="mobile-hide" style={{ margin: 0, fontSize: 11.5, color: "#8C7A6B", letterSpacing: "0.02em", fontFamily: "'DM Sans', sans-serif" }}>{t('notMedicalAdvice')}</p>
      </div>
    </div>
  );
}

/* ── Section heading helper ── */
function SectionHeading({ label, title }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={LABEL_STYLE}>{label}</p>
      <h3 style={{ ...TITLE_STYLE, marginBottom: 0 }}>{title}</h3>
    </div>
  );
}

/* ── Trait tag ── */
function TraitTag({ label, value }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.55)", borderRadius: 12, padding: "8px 16px", border: "1px solid rgba(255,255,255,0.75)" }}>
      <div style={{ fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#B9AC9E", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "#2C241D", fontWeight: 600, marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function BeautyReport({ data, isPaid, onUnlock }) {
  const { lang, t } = useLang();
  const [activeTab, setActiveTab] = useState("analysis");
  const [unlocking, setUnlocking] = useState(false);
  const [previewTab, setPreviewTab] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [showAllFree, setShowAllFree] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    setShareMsg("");
    try {
      const result = await shareScore(data, lang);
      if (result === "downloaded") {
        setShareMsg(t("shareDownloaded"));
        setTimeout(() => setShareMsg(""), 4000);
      }
    } catch (err) {
      console.error("[share]", err.message);
      setShareMsg(t("shareError"));
      setTimeout(() => setShareMsg(""), 3000);
    } finally {
      setSharing(false);
    }
  };

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "#B9AC9E", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{t('generatingReport')}</p>
      </div>
    );
  }

  const { overall, summary, faceShape, skinType, skinTone } = data;

  const handleUnlock = async (planId) => {
    setUnlocking(true);
    try { await onUnlock(planId); } finally { setUnlocking(false); }
  };

  /* ══════════════════════════ FREE VIEW ══════════════════════════ */
  if (!isPaid) {
    const freeData = data.free_version || {};
    const mainProblems = freeData.mainProblems || [];
    const basicSummary = freeData.basicSummary || summary || "";
    const paid = data.paid_version || {};
    const previewMetrics = (paid.metrics || []).slice(0, 4);
    const previewStrengths = (paid.strengths || []).slice(0, 2);
    const previewImprovements = (paid.improvements || []).slice(0, 2);
    const routine = paid.routine || {};
    const previewRoutine = [...(routine.morning || []), ...(routine.evening || [])].slice(0, 4);
    const allProducts = (paid.productRecommendations || []).slice(0, 3);

    const TABS = [t('tabMetrics'), t('tabStrengths'), t('tabImprove'), t('tabRoutine'), t('tabShop')];

    return (
      <div style={{ background: "transparent", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 }}>
        <ReportHeader t={t} />

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 0" }}>

          {/* ── Score hero ── */}
          <ScoreHeroCard
            score={overall}
            summary={basicSummary}
            faceShape={faceShape} skinType={skinType} skinTone={skinTone}
            badge={t("freeReportLabel")}
            t={t} lang={lang}
          />

          {/* ── Main problems ── */}
          {mainProblems.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <SectionHeading label={t('mainProblemsHeading')} title={t('areasToAddress')} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mainProblems.map((problem, i) => {
                  if (i > 0 && !showAllFree) return null;
                  return (
                    <div key={i} style={{ ...CARD, padding: "0", display: "flex", overflow: "hidden" }}>
                      <div style={{ width: 4, background: SEVERITY_ACCENT[problem.severity] || "#D1D5DB", flexShrink: 0 }} />
                      <div style={{ padding: "18px 20px", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <SeverityBadge severity={problem.severity} t={t} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 400, color: "#3A2E26", marginBottom: 6, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.3 }}>{problem.title}</div>
                        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: "#8C7A6B" }}>{problem.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Voir plus / Voir moins toggle button */}
              {mainProblems.length > 1 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                  <button
                    onClick={() => setShowAllFree(!showAllFree)}
                    className="btn-liquid-glass-pearl"
                    style={{
                      padding: "10px 24px",
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 20,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#A87449",
                      boxShadow: "0 4px 12px rgba(168, 116, 73, 0.05)"
                    }}
                  >
                    {showAllFree ? t('seeLess') : t('seeMore')}
                    <span style={{ fontSize: 9 }}>{showAllFree ? '▲' : '▼'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Products (free) ── */}
          {showAllFree && allProducts.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14, gap: 8 }}>
                <SectionHeading label={t('shopSubtitle')} title={t('shopTitle')} />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8B6914", background: "rgba(197,160,40,0.1)", border: "1px solid rgba(197,160,40,0.28)", borderRadius: 20, padding: "4px 12px", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
                  {t('freeIncluded')}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {allProducts.map((p, i) => <ProductCard key={i} product={p} lang={lang} t={t} />)}
              </div>
              <p style={{ fontSize: 10, color: "#B9AC9E", textAlign: "center", padding: "12px 4px 0", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                {t('affiliateNotice')}
              </p>
            </div>
          )}
        </div>

        {/* ── Paywall card ── */}
        <div style={{ maxWidth: 680, margin: "32px auto 0", padding: "0 20px" }}>
          <div style={{
            background: "linear-gradient(150deg, rgba(255,255,255,0.82) 0%, rgba(253,246,237,0.68) 55%, rgba(246,235,222,0.82) 100%)",
            backdropFilter: "blur(32px) saturate(160%)",
            WebkitBackdropFilter: "blur(32px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.88)",
            borderRadius: 26, padding: "clamp(28px,5vw,40px)",
            boxShadow: "0 12px 48px rgba(168,116,73,0.09), 0 2px 0 rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.98)",
          }}>
            {/* Label pill */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "linear-gradient(135deg, rgba(197,160,40,0.12), rgba(212,165,116,0.08))",
                border: "1px solid rgba(197,160,40,0.30)",
                borderRadius: 30, padding: "5px 14px",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "#8B6914", fontFamily: "'DM Sans', sans-serif",
              }}>
                <span style={{ fontSize: 7 }}>✦</span>
                {t('paywallCardLabel')}
              </span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(24px,5vw,32px)", fontWeight: 400,
              color: "#3A2E26", margin: "0 0 12px", lineHeight: 1.18, textAlign: "center",
            }}>
              {t('paywallCardTitle')}
            </h2>

            {/* Sub-copy */}
            <p style={{
              fontSize: 13.5, color: "#6F6156", lineHeight: 1.7,
              margin: "0 0 28px", fontFamily: "'DM Sans', sans-serif", textAlign: "center",
            }}>
              {t('paywallCardDesc')}
            </p>

            {/* Feature rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 24, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.75)" }}>
              {t('paywallFeatures').map((f, i, arr) => (
                <div key={i} style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  padding: "14px 18px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.60)" : "rgba(253,248,242,0.50)",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.65)" : "none",
                }}>
                  <div className="rpt-paywall-feature-icon" style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(197,160,40,0.13), rgba(212,165,116,0.08))",
                    border: "1px solid rgba(197,160,40,0.20)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#A87449", marginTop: 1,
                  }}>
                    {PAYWALL_ICONS[i] || f.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="rpt-paywall-feature-title" style={{ fontSize: 12.5, fontWeight: 700, color: "#3A2E26", marginBottom: 3, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}>
                      {f.title}
                    </div>
                    <div className="rpt-paywall-feature-desc" style={{ fontSize: 11.5, color: "#8C7A6B", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Value framing */}
            <p style={{
              fontSize: 12, color: "#A87449", textAlign: "center",
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: 15, margin: "0 0 22px", letterSpacing: "0.01em",
            }}>
              {t('paywallValueFrame')}
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => handleUnlock("single")} disabled={unlocking} className="btn-liquid-glass-dark" style={{ width: "100%", padding: "16px", borderRadius: 14, fontSize: 14, fontWeight: 700, letterSpacing: "0.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none" }}>
                {unlocking
                  ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />{t('redirecting')}</>
                  : t('paywallSingleCta')}
              </button>
              <button onClick={() => handleUnlock("pack")} disabled={unlocking} className="btn-liquid-glass" style={{ width: "100%", padding: "15px", borderRadius: 14, fontSize: 13, fontWeight: 600, letterSpacing: "0.02em", border: "none" }}>
                {t('paywallPackCta')}
              </button>
            </div>

            {/* Trust footer */}
            <p style={{ marginTop: 16, fontSize: 11, color: "#B9AC9E", fontFamily: "'DM Sans', sans-serif", textAlign: "center", letterSpacing: "0.01em" }}>
              {t('paywallTrust')}
            </p>
          </div>
        </div>

        {/* ── Share button (free view) ── */}
        <div style={{ maxWidth: 680, margin: "24px auto 0", padding: "0 20px" }}>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="btn-liquid-glass-dark"
            style={{
              width: "100%", padding: "14px", borderRadius: 14,
              fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              border: "none",
            }}
          >
            {sharing
              ? <><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(185,172,158,0.35)", borderTopColor: "#B9AC9E", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />{t('shareGenerating')}</>
              : <>{t('shareScore')}<span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>· Instagram / TikTok</span></>
            }
          </button>
          {shareMsg && <p style={{ margin: "10px 0 0", fontSize: 12, color: "#A87449", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>{shareMsg}</p>}
        </div>

        {/* ── Clickable tab preview bar ── */}
        <div style={{ maxWidth: 680, margin: "24px auto 0", padding: "0 20px" }}>
          <p style={{ ...LABEL_STYLE, textAlign: "center", marginBottom: 10 }}>
            {t('previewLabel')}
          </p>
          <div className="rpt-tabs" style={{
            display: "flex", gap: 4,
            background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.65)",
            borderRadius: 14, padding: 4,
            boxShadow: "0 8px 32px rgba(168,116,73,0.03), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
            scrollbarWidth: "none"
          }}>
            {TABS.map((label, i) => (
              <button key={label} onClick={() => setPreviewTab(i)} className="rpt-tab-btn" style={{
                flex: 1, padding: "11px 4px", borderRadius: 10, textAlign: "center",
                background: previewTab === i ? "linear-gradient(135deg, rgba(44, 36, 29, 0.85), rgba(28, 22, 17, 0.92))" : "transparent",
                color: previewTab === i ? "#fff" : "#6F6156",
                fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
                fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                border: previewTab === i ? "1px solid rgba(255, 255, 255, 0.15)" : "none", cursor: "pointer", transition: "all 0.25s ease",
                boxShadow: previewTab === i ? "0 4px 14px rgba(44,36,29,0.15)" : "none",
                whiteSpace: "nowrap",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* ── Blurred tab content ── */}
        <div style={{ maxWidth: 680, margin: "10px auto 0", padding: "0 20px 60px", filter: "blur(5px)", opacity: 0.3, pointerEvents: "none", userSelect: "none" }}>
          {previewTab === 0 && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{previewMetrics.map((m, i) => <MetricCard key={i} m={m} index={i} />)}</div>}
          {previewTab === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {previewStrengths.map((s, i) => (
                <div key={i} style={{ ...CARD, padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(168,116,73,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: GOLD, fontSize: 14 }}>{ICONS[i] || "✦"}</div>
                  <div><div style={{ fontSize: 12, fontWeight: 600, color: "#2C241D", marginBottom: 6 }}>{s.title}</div><p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#8C7A6B" }}>{s.desc}</p></div>
                </div>
              ))}
            </div>
          )}
          {previewTab === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {previewImprovements.map((item, i) => (
                <div key={i} style={{ ...CARD, padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(212,165,116,0.12)", border: "1px solid rgba(212,165,116,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: "'Cormorant Garamond', serif" }}>{i + 1}</div>
                  <div><div style={{ fontSize: 12, fontWeight: 600, color: "#2C241D", marginBottom: 6 }}>{item.title}</div><p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#8C7A6B" }}>{item.desc}</p></div>
                </div>
              ))}
            </div>
          )}
          {previewTab === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {previewRoutine.map((rec, i) => (
                <div key={i} style={{ ...CARD, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: GOLD, fontSize: 10, marginTop: 3, flexShrink: 0 }}>✦</span>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "#8C7A6B" }}>{rec}</p>
                </div>
              ))}
            </div>
          )}
          {previewTab === 4 && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{allProducts.map((p, i) => <ProductCard key={i} product={p} lang={lang} t={t} />)}</div>}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ══════════════════════════ PAID VIEW ══════════════════════════ */
  const paid = data.paid_version || {};
  const metrics = paid.metrics || [];
  const strengths = paid.strengths || [];
  const improvements = paid.improvements || [];
  const paidRoutine = paid.routine || {};
  const products = paid.productRecommendations || [];

  const TABS_PAID = [
    { id: "analysis", label: t('tabMetrics') },
    { id: "strengths", label: t('tabStrengths') },
    { id: "improve", label: t('tabImprove') },
    { id: "recs", label: t('tabRoutine') },
    { id: "shop", label: t('tabShop') },
  ];

  return (
    <div style={{ background: "transparent", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: 60 }}>
      <ReportHeader t={t} />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 0" }}>

        {/* ── Score hero ── */}
        <ScoreHeroCard
          score={overall}
          summary={summary}
          faceShape={faceShape} skinType={skinType} skinTone={skinTone}
          miniMetrics={metrics.slice(0, 3)}
          t={t} lang={lang}
        />

        {/* ── Tabs ── */}
        <div className="rpt-tabs" style={{
          display: "flex", gap: 4,
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.65)",
          borderRadius: 14, padding: 4,
          boxShadow: "0 8px 32px rgba(168,116,73,0.03), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
          scrollbarWidth: "none", WebkitOverflowScrolling: "touch"
        }}>
          {TABS_PAID.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="rpt-tab-btn" style={{
              flex: 1, padding: "12px 4px", border: activeTab === tab.id ? "1px solid rgba(255, 255, 255, 0.15)" : "none", borderRadius: 10,
              background: activeTab === tab.id ? "linear-gradient(135deg, rgba(44, 36, 29, 0.85), rgba(28, 22, 17, 0.92))" : "transparent",
              color: activeTab === tab.id ? "#fff" : "#6F6156",
              fontSize: 9, fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em",
              fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", whiteSpace: "nowrap",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: activeTab === tab.id ? "0 4px 16px rgba(0,0,0,0.14)" : "none",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ marginTop: 16 }}>

          {/* Metrics */}
          {activeTab === "analysis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {metrics.map((m, i) => <MetricCard key={i} m={m} index={i} />)}
              <div style={{ ...CARD, padding: "14px 18px", display: "flex", gap: 18, flexWrap: "wrap" }}>
                {[{ range: "78–100", label: t('legendStrong'), color: "#D4A574" }, { range: "65–77", label: t('legendAverage'), color: "#8C7A6B" }, { range: "0–64", label: t('legendBelowAvg'), color: "#B9AC9E" }].map(l => (
                  <div key={l.range} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#8C7A6B", fontFamily: "'DM Sans', sans-serif" }}>{l.range} — {l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {activeTab === "strengths" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {strengths.map((s, i) => (
                <div key={i} style={{ ...CARD, padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start", overflow: "hidden" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(197,160,40,0.1)", border: "1px solid rgba(197,160,40,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, color: GOLD }}>{ICONS[i] || "✦"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#3A2E26", marginBottom: 6, letterSpacing: "0.04em", wordBreak: "break-word" }}>{s.title}</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#8C7A6B", wordBreak: "break-word", overflowWrap: "break-word" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Improvements */}
          {activeTab === "improve" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {improvements.map((s, i) => (
                <div key={i} style={{ ...CARD, padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start", overflow: "hidden" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(212,165,116,0.1)", border: "1px solid rgba(212,165,116,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: "'Cormorant Garamond', serif" }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#3A2E26", marginBottom: 6, letterSpacing: "0.04em", wordBreak: "break-word" }}>{s.title}</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#8C7A6B", wordBreak: "break-word", overflowWrap: "break-word" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Routine */}
          {activeTab === "recs" && (() => {
            const ROUTINE_SECTIONS = [
              { key: "morning", label: t('routineMorning'), dot: "#F6C667" },
              { key: "evening", label: t('routineEvening'), dot: "#8C7A6B" },
              { key: "weekly", label: t('routineWeekly'), dot: GOLD },
            ].filter(s => (paidRoutine[s.key] || []).length > 0);

            if (ROUTINE_SECTIONS.length === 0) {
              return (
                <div style={{ ...CARD, padding: "32px", textAlign: "center", color: "#B9AC9E", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  {t('routineUnavailable')}
                </div>
              );
            }

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ROUTINE_SECTIONS.map(({ key, label, dot }) => (
                  <div key={key} style={{ ...CARD, padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid rgba(168,116,73,0.12)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3A2E26", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(paidRoutine[key] || []).map((step, j) => (
                        <div key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "rgba(197,160,40,0.1)", border: "1px solid rgba(197,160,40,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 700, color: GOLD, fontFamily: "'Cormorant Garamond', serif", marginTop: 1 }}>{j + 1}</div>
                          <span style={{ fontSize: 13, color: "#8C7A6B", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Shop */}
          {activeTab === "shop" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SectionHeading label={t('shopSubtitle')} title={t('shopTitle')} />
              {products.length === 0 ? (
                <div style={{ ...CARD, padding: "32px", textAlign: "center", color: "#B9AC9E", fontSize: 13 }}>{t('noProducts')}</div>
              ) : products.map((p, i) => <ProductCard key={i} product={p} lang={lang} t={t} />)}
              <p style={{ fontSize: 10, color: "#B9AC9E", textAlign: "center", padding: "8px 4px 0", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                {t('affiliateNotice')}
              </p>
            </div>
          )}
        </div>

        {/* ── Share CTA (paid view) ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(253,246,237,0.55) 50%, rgba(246,235,222,0.72) 100%)",
          backdropFilter: "blur(22px) saturate(150%)",
          WebkitBackdropFilter: "blur(22px) saturate(150%)",
          borderRadius: 20, padding: "28px 24px", marginTop: 20,
          border: "1px solid rgba(255,255,255,0.78)",
          boxShadow: "0 8px 32px rgba(168,116,73,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
          textAlign: "center",
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#B0885E", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            {t('shareHeading')}
          </p>
          <h3 style={{ margin: "0 0 6px", fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, color: "#3A2E26", lineHeight: 1.2 }}>
            {t('shareYourScore', overall)}
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "#8C7A6B", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
            {t('shareSubtitle')}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="btn-liquid-glass"
              style={{
                padding: "12px 26px",
                borderRadius: 10,
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.04em",
                display: "flex", alignItems: "center", gap: 8,
                border: "none",
              }}
            >
              {sharing
                ? <><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "rgba(255,255,255,0.7)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />{t('shareGeneratingShort')}</>
                : t("shareScore")
              }
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(t("shareText", overall))}
              className="btn-liquid-glass"
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                fontSize: 12, fontWeight: 500,
                border: "none",
              }}
            >
              {t("copyShare")}
            </button>
          </div>
          {shareMsg && (
            <p style={{ margin: "12px 0 0", fontSize: 12, color: "#A87449", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
              {shareMsg}
            </p>
          )}
        </div>

        <div style={{ marginTop: 20, padding: "0 4px" }}>
          <p style={{ fontSize: 10, color: "#B9AC9E", lineHeight: 1.8, textAlign: "center", letterSpacing: "0.02em", fontFamily: "'DM Sans', sans-serif" }}>{t('disclaimer')}</p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
