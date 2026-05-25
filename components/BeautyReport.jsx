import { useState, useEffect, useMemo } from "react";
import { useLang } from "../lib/LangContext";
import { shareScore } from "../lib/shareImage";
import { sanitizeReport } from "../lib/textSanitizer";
import MedicalDisclaimer from "./MedicalDisclaimer";

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

const CUSTOM_PAYWALL_ICONS = {
  scan: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6c3-1.5 5 1.5 8 0s5-1.5 8 0" />
      <path d="M4 11c3-1.5 5 1.5 8 0s5-1.5 8 0" opacity="0.6" />
      <path d="M4 16c3-1.5 5 1.5 8 0s5-1.5 8 0" opacity="0.35" />
      <circle cx="12" cy="11" r="5" strokeDasharray="3 3" />
      <path d="M12 8v6M10 10l2-2 2 2" />
    </svg>
  ),
  routine: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <path d="m12 15 .5-1.5 1.5-.5-1.5-.5L12 11l-.5 1.5-1.5.5 1.5.5z" fill="#C9A961" stroke="none" />
      <path d="m17 10 .3-.7.7-.3-.7-.3-.3-.7-.3.7-.7.3.7.3z" fill="#C9A961" stroke="none" />
    </svg>
  ),
  dropper: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v3" strokeWidth="2" />
      <path d="M9 5h6" />
      <rect x="10" y="6" width="4" height="2" rx="0.5" />
      <path d="M7 11v8a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3z" />
      <line x1="12" y1="8" x2="12" y2="16" opacity="0.6" />
      <path d="M12 19a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3z" fill="#C9A961" stroke="none" />
    </svg>
  ),
  lifestyle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 8.4 19 14a7 7 0 0 1-8 6Z" />
      <path d="M9 11a3 3 0 0 1 3-3" />
      <path d="M11 20V12" />
      <path d="M17 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" fill="#C9A961" stroke="none" />
    </svg>
  ),
  progression: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20c2-3 4-8 7-8s5 4 8 0" />
      <path d="m15 11 3-3 3 3" />
      <circle cx="18" cy="12" r="2" fill="#C9A961" stroke="none" />
      <circle cx="12" cy="12" r="10" strokeDasharray="4 4" opacity="0.5" />
    </svg>
  ),
  chat: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="m11 11 .3-.7.7-.3-.7-.3-.3-.7-.3.7-.7.3.7.3z" fill="#C9A961" stroke="none" />
      <path d="m15 9 .2-.5.5-.2-.5-.2-.2-.5-.2.5-.5.2.5.2z" fill="#C9A961" stroke="none" />
    </svg>
  ),
};

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
  const [showTooltip, setShowTooltip] = useState(false);

  const getPhototypeText = (val) => {
    if (!val) return "";
    const lower = val.toLowerCase();
    const isFr = lang === 'fr';
    if (lower.includes('type iii') || lower.includes('beige moyen') || lower.includes('medium')) {
      return isFr ? "Phototype III selon l'échelle dermatologique" : "Phototype III according to the dermatological scale";
    }
    if (lower.includes('type ii') || lower.includes('clair') || lower.includes('fair') || lower.includes('light')) {
      return isFr ? "Phototype II selon l'échelle dermatologique" : "Phototype II according to the dermatological scale";
    }
    if (lower.includes('type i') || lower.includes('très clair') || lower.includes('very fair')) {
      return isFr ? "Phototype I selon l'échelle dermatologique" : "Phototype I according to the dermatological scale";
    }
    if (lower.includes('type vi') || lower.includes('foncé') || lower.includes('deep')) {
      return isFr ? "Phototype VI selon l'échelle dermatologique" : "Phototype VI according to the dermatological scale";
    }
    if (lower.includes('type v') || lower.includes('brun') || lower.includes('dark')) {
      return isFr ? "Phototype V selon l'échelle dermatologique" : "Phototype V according to the dermatological scale";
    }
    if (lower.includes('type iv') || lower.includes('mat') || lower.includes('olive')) {
      return isFr ? "Phototype IV selon l'échelle dermatologique" : "Phototype IV according to the dermatological scale";
    }
    return isFr ? "Phototype selon l'échelle de Fitzpatrick" : "Phototype according to the Fitzpatrick scale";
  };

  useEffect(() => {
    if (!showTooltip) return;
    const handleOutsideClick = () => {
      setShowTooltip(false);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showTooltip]);

  // Helper to remove phototype tags like Type I, Type II, Type III, etc. from the visible label
  const getCleanedSkinTone = (val) => {
    if (!val) return "";
    let clean = val.replace(/\s*(?:—|-|\/|\|)?\s*Type\s+[IVXLCDM]+\s*(?:—|-|\/|\|)?\s*/gi, ' ');
    clean = clean.replace(/\s*Type\s+[IVXLCDM]+\s*/gi, ' ');
    clean = clean.trim().replace(/\s+/g, ' ');
    clean = clean.replace(/^[—\-\/\|\s]+|[—\-\/\|\s]+$/g, '');
    return clean;
  };

  // Helper to translate trait values automatically in French
  const getTranslatedValue = (val) => {
    if (!val) return "";
    let result = val;
    if (lang === 'fr') {
      const lower = val.toLowerCase().trim();
      if (lower.includes('combination to oily') || lower.includes('combination') || lower === 'mixte à grasse') result = 'Mixte à Grasse';
      else if (lower.includes('oval') || lower === 'ovale') result = 'Ovale';
      else if (lower.includes('medium beige') || lower.includes('type iii')) result = 'Beige Moyen';
      else if (lower.includes('dry') || lower === 'sèche') result = 'Peau Sèche';
      else if (lower.includes('oily') || lower === 'grasse') result = 'Peau Grasse';
      else if (lower.includes('sensitive') || lower === 'sensible') result = 'Peau Sensible';
      else if (lower.includes('normal')) result = 'Peau Normale';
    }
    return getCleanedSkinTone(result);
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
        {[
          { type: 'faceShape', k: t("faceShape"), v: faceShape },
          { type: 'skinType', k: t("skinType"), v: skinType },
          { type: 'skinTone', k: t("skinTone"), v: skinTone }
        ].map(tag => tag.v ? (
          <div
            key={tag.k}
            onClick={(e) => {
              if (tag.type === 'skinTone') {
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }
            }}
            style={{
              background: "rgba(255,255,255,0.62)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: 10,
              padding: "7px 14px",
              border: "1px solid rgba(255,255,255,0.82)",
              cursor: tag.type === 'skinTone' ? 'pointer' : 'default',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            <div style={{
              fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#B0885E", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              {tag.k}
              {tag.type === 'skinTone' && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'rgba(168,116,73,0.12)',
                  color: '#A87449',
                  fontSize: 8,
                  fontWeight: 700,
                  fontStyle: 'normal',
                }}>i</span>
              )}
            </div>
            <div style={{
              fontSize: 12, color: "#3A2E26", fontWeight: 600,
              marginTop: 3, fontFamily: "'DM Sans', sans-serif"
            }}>
              {getTranslatedValue(tag.v)}
            </div>

            {/* Premium Info Bubble / Tooltip */}
            {tag.type === 'skinTone' && showTooltip && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-8px)',
                  width: 220,
                  background: 'rgba(58, 46, 38, 0.96)',
                  color: '#FAF6F0',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  boxShadow: '0 8px 24px rgba(44, 36, 29, 0.25)',
                  zIndex: 100,
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: 'center',
                  animation: 'tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {getPhototypeText(tag.v)}
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid rgba(58, 46, 38, 0.96)',
                }} />
              </div>
            )}
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
function MetricCard({ m, index, t }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVis(true), index * 80 + 100);
    return () => clearTimeout(timer);
  }, [index]);

  const getGradeStyle = (grade) => {
    const g = (grade || '').toUpperCase().trim();
    if (g.startsWith('A')) {
      return { color: "#7DBFA8", bg: "rgba(168,220,200,0.18)", border: "1px solid rgba(168,220,200,0.45)" };
    }
    if (g.startsWith('B')) {
      return { color: "#82B8D8", bg: "rgba(168,200,232,0.18)", border: "1px solid rgba(168,200,232,0.45)" };
    }
    return { color: "#D4A0BC", bg: "rgba(232,184,212,0.18)", border: "1px solid rgba(232,184,212,0.45)" };
  };

  const gradeStyle = getGradeStyle(m.grade);

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3A2E26" }}>{m.label}</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 6,
              padding: "3px 9px",
              background: gradeStyle.bg,
              color: gradeStyle.color,
              border: gradeStyle.border,
              letterSpacing: "0.06em"
            }}>
              {m.grade}
            </span>
            {m.severity && t && <SeverityBadge severity={m.severity} t={t} />}
          </div>
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

const findMatchingProduct = (stepText, products) => {
  if (!products || products.length === 0) return null;
  const text = (stepText || '').toLowerCase();

  // 1. Cleanser / Nettoyant
  if (text.includes('nettoyer') || text.includes('nettoyant') || text.includes('cleanse') || text.includes('cleanser')) {
    const found = products.find(p => {
      const name = p.productName.toLowerCase();
      return name.includes('cleanser') || name.includes('nettoyant');
    });
    if (found) return found;
  }

  // 2. Vitamin C / Vitamine C
  if (text.includes('vitamine c') || text.includes('vitamin c') || text.includes('antioxydant')) {
    const found = products.find(p => {
      const name = p.productName.toLowerCase();
      return name.includes('vitamin c') || name.includes('vitamine c') || name.includes('c-firma') || name.includes('ferulic') || name.includes('ascorbic');
    });
    if (found) return found;
  }

  // 3. Eye Cream / Cernes
  if (text.includes('cernes') || text.includes('yeux') || text.includes('eye') || text.includes('eyes') || text.includes('orbital') || text.includes('caffeine')) {
    const found = products.find(p => {
      const name = p.productName.toLowerCase();
      return name.includes('eye') || name.includes('yeux') || name.includes('caffeine') || name.includes('avocado') || name.includes('cernes');
    });
    if (found) return found;
  }

  // 4. Retinol / Rétinol
  if (text.includes('rétinol') || text.includes('retinol')) {
    const found = products.find(p => {
      const name = p.productName.toLowerCase();
      return name.includes('retinol') || name.includes('rétinol');
    });
    if (found) return found;
  }

  // 5. Exfoliant / AHA / BHA
  if (text.includes('exfolier') || text.includes('exfoliant') || text.includes('bha') || text.includes('aha') || text.includes('acide glycolique') || text.includes('glycolic') || text.includes('salicylic') || text.includes('salicylique')) {
    const found = products.find(p => {
      const name = p.productName.toLowerCase();
      return name.includes('exfoliant') || name.includes('bha') || name.includes('aha') || name.includes('peeling') || name.includes('smoothing') || name.includes('gel');
    });
    if (found) return found;
  }

  // 6. Niacinamide
  if (text.includes('niacinamide') || text.includes('pores') || text.includes('sebum') || text.includes('sébum') || text.includes('brillance')) {
    const found = products.find(p => {
      const name = p.productName.toLowerCase();
      return name.includes('niacinamide') || name.includes('zinc');
    });
    if (found) return found;
  }

  // 7. Hydration mask
  if (text.includes('masque') || text.includes('mask') || text.includes('sleeping mask')) {
    const found = products.find(p => {
      const name = p.productName.toLowerCase();
      return name.includes('mask') || name.includes('masque');
    });
    if (found) return found;
  }

  // 8. Moisturizer / Cream
  if (text.includes('crème') || text.includes('cream') || text.includes('moisturizer') || text.includes('hydratante') || text.includes('hydrater') || text.includes('barrière') || text.includes('barrier') || text.includes('céramides') || text.includes('ceramide')) {
    const found = products.find(p => {
      const name = p.productName.toLowerCase();
      return (name.includes('cream') || name.includes('moisturizer') || name.includes('crème')) && !name.includes('eye');
    });
    if (found) return found;
  }

  return null;
};

/* ── Custom luxury SVG icons ── */
function SunIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" stroke="#C9A961" strokeWidth="1.5" />
      {/* Rays */}
      <line x1="12" y1="2" x2="12" y2="5" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="12" x2="5" y2="12" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="12" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Elegant crescent */}
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
        stroke="#A87449"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(168,116,73,0.08)"
      />
      {/* Small star accent */}
      <circle cx="17" cy="6" r="0.8" fill="#C9A961" />
      <circle cx="19.5" cy="9" r="0.5" fill="#C9A961" />
    </svg>
  );
}

function SparkleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central 4-pointed star */}
      <path
        d="M12 2 L13.2 10.8 L22 12 L13.2 13.2 L12 22 L10.8 13.2 L2 12 L10.8 10.8 Z"
        stroke="#C9A961"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="rgba(201,169,97,0.1)"
      />
      {/* Small accent stars */}
      <path d="M19 3 L19.5 5.5 L22 6 L19.5 6.5 L19 9 L18.5 6.5 L16 6 L18.5 5.5 Z" fill="#C9A961" opacity="0.7" />
      <path d="M5 16 L5.3 17.7 L7 18 L5.3 18.3 L5 20 L4.7 18.3 L3 18 L4.7 17.7 Z" fill="#A87449" opacity="0.6" />
    </svg>
  );
}

/* ── Inline product card for routine steps ── */
function InlineProductCard({ product, t }) {
  const [hov, setHov] = useState(false);
  const amazonUrl = product.amazonLink || `https://www.amazon.fr/s?k=${encodeURIComponent(product.productName)}&tag=ratemyskin-21`;
  const sephoraUrl = product.sephoraLink || `https://www.sephora.fr/search/?q=${encodeURIComponent(product.productName)}`;
  const imgUrl = product.imageUrl || getProductImage(product.productName);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.65)",
        border: hov ? "1px solid rgba(168, 116, 73, 0.4)" : "1px solid rgba(168, 116, 73, 0.15)",
        borderRadius: 12,
        padding: "8px 10px",
        marginTop: 6,
        boxShadow: hov ? "0 4px 12px rgba(168, 116, 73, 0.06)" : "none",
        transition: "all 0.3s ease"
      }}
    >
      {/* Image */}
      <img
        src={imgUrl}
        alt={product.productName}
        style={{
          width: 38,
          height: 38,
          objectFit: "cover",
          borderRadius: 8,
          background: "#fff",
          border: "1px solid rgba(168, 116, 73, 0.08)",
          flexShrink: 0
        }}
      />

      {/* Text block: name + description + price */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: "#2C241D",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.3
        }}>
          {product.productName}
        </div>
        {product.description && (
          <p style={{
            margin: "2px 0 0",
            fontSize: 10,
            lineHeight: 1.45,
            color: "#8C7A6B",
            fontFamily: "'DM Sans', sans-serif",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
            {product.description}
          </p>
        )}
        <div style={{
          fontSize: 10,
          color: "#A87449",
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          marginTop: 2
        }}>
          {product.price}
        </div>
      </div>

      {/* Buttons: small, stacked vertically on right */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, alignItems: "center" }}>
        {/* "Acheter" notch label */}
        <div style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#C9A961",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 3,
          paddingBottom: 2,
          borderBottom: "1px solid rgba(201,169,97,0.25)",
          width: "100%",
          justifyContent: "center"
        }}>
          <span style={{ fontSize: 9 }}>🛍</span> Ajouter à ma skin care
        </div>
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-liquid-glass-dark"
          style={{
            padding: "4px 9px",
            borderRadius: 5,
            fontSize: 9,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
            border: "none",
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "center",
            letterSpacing: "0.03em"
          }}
        >
          Amazon
        </a>
        <a
          href={sephoraUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-liquid-glass"
          style={{
            padding: "4px 9px",
            borderRadius: 5,
            fontSize: 9,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
            border: "none",
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "center",
            letterSpacing: "0.03em"
          }}
        >
          Sephora
        </a>
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
export default function BeautyReport({ data: rawData, isPaid, onUnlock }) {
  const { lang, t } = useLang();
  const data = useMemo(() => sanitizeReport(rawData, lang), [rawData, lang]);
  const [unlocking, setUnlocking] = useState(false);
  const [previewTab, setPreviewTab] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [showAllFree, setShowAllFree] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Social Proof Counter
  const [socialProofN, setSocialProofN] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("rms_social_proof_n");
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val)) return val;
      }
    }
    return 847;
  });

  useEffect(() => {
    let timeoutId;
    const scheduleNextIncrement = () => {
      // Random delay between 90s and 180s
      const delay = Math.floor(Math.random() * (180000 - 90000 + 1)) + 90000;
      timeoutId = setTimeout(() => {
        setSocialProofN(prev => {
          const nextVal = prev + 1;
          localStorage.setItem("rms_social_proof_n", nextVal.toString());
          return nextVal;
        });
        scheduleNextIncrement();
      }, delay);
    };

    scheduleNextIncrement();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isPaid) return;
    
    let timerEnd = sessionStorage.getItem('rms_paywall_timer_end');
    if (!timerEnd) {
      timerEnd = (Date.now() + 15 * 60 * 1000).toString();
      sessionStorage.setItem('rms_paywall_timer_end', timerEnd);
    }
    
    let endTimestamp = parseInt(timerEnd, 10);
    
    const updateTimer = () => {
      const now = Date.now();
      let remaining = Math.ceil((endTimestamp - now) / 1000);
      if (remaining <= 0) {
        // Silently restart at 5:00
        const newEnd = Date.now() + 5 * 60 * 1000;
        sessionStorage.setItem('rms_paywall_timer_end', newEnd.toString());
        endTimestamp = newEnd;
        remaining = 300;
      }
      setTimeLeft(remaining);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [isPaid]);

  const formatTime = (seconds) => {
    if (seconds === null) return '15:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { generateSkinReportPDF } = await import('../lib/pdfGenerator');
      await generateSkinReportPDF(data, lang);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
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

  const displayMetrics = isPaid ? (paid.metrics || []) : previewMetrics;
  const displayStrengths = isPaid ? (paid.strengths || []) : previewStrengths;
  const displayImprovements = isPaid ? (paid.improvements || []) : previewImprovements;
  const displayProducts = isPaid ? (paid.productRecommendations || []) : allProducts;

  const TABS_CONFIG = [
    {
      label: t('tabMetrics'),
      short: lang === 'fr' ? 'Métriques' : 'Metrics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="14" width="4" height="7" rx="1"/>
          <rect x="10" y="9" width="4" height="12" rx="1"/>
          <rect x="17" y="4" width="4" height="17" rx="1"/>
        </svg>
      )
    },
    {
      label: t('tabStrengths'),
      short: lang === 'fr' ? 'Atouts' : 'Strengths',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      label: t('tabImprove'),
      short: lang === 'fr' ? 'Améliorer' : 'Improve',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <path d="M9 11l3 3L22 4"/>
        </svg>
      )
    },
    {
      label: t('tabRoutine'),
      short: lang === 'fr' ? 'Routine' : 'Routine',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8 2 5 5 5 9v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9c0-4-3-7-7-7z"/>
          <line x1="5" y1="13" x2="19" y2="13"/>
          <path d="M9 17h6"/>
        </svg>
      )
    },
    {
      label: t('tabShop'),
      short: lang === 'fr' ? 'Produits' : 'Shop',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      )
    },
    {
      label: t('tabLifestyle'),
      short: lang === 'fr' ? 'Style de vie' : 'Lifestyle',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 8.4 19 14a7 7 0 0 1-8 6z"/>
          <path d="M11 20V12"/>
        </svg>
      )
    },
    {
      label: t('tabPlan'),
      short: lang === 'fr' ? 'Plan' : 'Plan',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" rx="1"/>
          <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" strokeDasharray="2 2"/>
        </svg>
      )
    },
  ];
  const TABS = TABS_CONFIG.map(t => t.label);

  return (
    <div style={{ background: "transparent", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 }}>
      <ReportHeader t={t} />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 0" }}>

        {/* ── Score hero ── */}
        <ScoreHeroCard
          score={overall}
          summary={basicSummary}
          faceShape={faceShape} skinType={skinType} skinTone={skinTone}
          badge={isPaid ? null : t("freeReportLabel")}
          t={t} lang={lang}
        />

        <MedicalDisclaimer style={{ marginTop: 16 }} />

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

      {/* ── Paywall card (unpaid only) ── */}
      {!isPaid && (
        <div style={{ maxWidth: 680, margin: "32px auto 0", padding: "0 20px" }}>
          <div style={{
            background: "linear-gradient(150deg, rgba(255,255,255,0.92) 0%, rgba(253,246,237,0.85) 55%, rgba(246,235,222,0.92) 100%)",
            backdropFilter: "blur(32px) saturate(160%)",
            WebkitBackdropFilter: "blur(32px) saturate(160%)",
            border: "1px solid rgba(201, 169, 97, 0.35)",
            borderRadius: 28, padding: "clamp(28px,5vw,40px)",
            boxShadow: "0 24px 64px rgba(61,41,20,0.08), 0 2px 0 rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.98)",
            position: "relative",
          }}>

            {/* 2. COMPTEUR SOCIAL PROOF */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "16px",
              fontSize: "12.5px",
              color: "#6B6B6B",
              fontStyle: "italic",
              fontFamily: "'Inter', sans-serif",
            }}>
              <span className="pulsing-dot-wrapper">
                <span className="pulsing-dot-ping" />
                <span className="pulsing-dot-core" />
              </span>
              <span>
                {lang === 'fr' 
                  ? `${socialProofN} femmes ont noté leur peau cette semaine` 
                  : `${socialProofN} women rated their skin this week`}
              </span>
            </div>

            {/* 3. COPY HOOK */}
            <h1 className="paywall-title">
              {lang === 'fr'
                ? "Votre peau mérite une analyse qui va jusqu'au bout"
                : "Your skin deserves an analysis that goes all the way"}
            </h1>
            <p className="paywall-subtitle">
              {lang === 'fr'
                ? "Rapport complet prêt à débloquer — causes identifiées, routine sur-mesure matin & soir, produits adaptés à votre budget et plan de progression semaine par semaine"
                : "Your full report is ready to unlock — root causes identified, personalised AM & PM routine, budget-matched products and a week-by-week progression plan"}
            </p>

            {/* 4. UNLOCK GRID */}
            <div className="unlock-grid">
              <div className="grid-cell">
                <div className="cell-icon-container">
                  {CUSTOM_PAYWALL_ICONS.scan}
                </div>
                <div className="cell-text-block">
                  <span className="cell-text">{lang === 'fr' ? 'Causes identifiées zone par zone' : 'Root causes identified zone by zone'}</span>
                  <span className="cell-subtext">{lang === 'fr' ? 'Front, joues, nez, contour des yeux — chaque imperfection expliquée' : 'Forehead, cheeks, nose, eye area — every concern explained'}</span>
                </div>
              </div>
              <div className="grid-cell" style={{ position: "relative" }}>
                <div className="cell-icon-container">
                  {CUSTOM_PAYWALL_ICONS.routine}
                </div>
                <div className="cell-text-block">
                  <span className="cell-text">{lang === 'fr' ? 'Routine matin & soir sur-mesure' : 'Custom morning & evening routine'}</span>
                  <span className="cell-subtext">{lang === 'fr' ? 'Étapes dans le bon ordre, actifs ciblés pour votre peau' : 'Steps in the right order, actives matched to your skin'}</span>
                </div>
                <span className="badge-gold">{lang === 'fr' ? 'SUR MESURE' : 'CUSTOM'}</span>
              </div>
              <div className="grid-cell">
                <div className="cell-icon-container">
                  {CUSTOM_PAYWALL_ICONS.dropper}
                </div>
                <div className="cell-text-block">
                  <span className="cell-text">{lang === 'fr' ? 'Produits sélectionnés par budget' : 'Products selected by budget'}</span>
                  <span className="cell-subtext">{lang === 'fr' ? 'Marques accessibles et premium, avec liens directs' : 'Accessible and premium brands, with direct links'}</span>
                </div>
              </div>
              <div className="grid-cell">
                <div className="cell-icon-container">
                  {CUSTOM_PAYWALL_ICONS.lifestyle}
                </div>
                <div className="cell-text-block">
                  <span className="cell-text">{lang === 'fr' ? 'Alimentation, sommeil & stress' : 'Diet, sleep & stress habits'}</span>
                  <span className="cell-subtext">{lang === 'fr' ? 'Les habitudes de vie qui impactent directement votre peau' : 'Lifestyle habits that directly affect your skin'}</span>
                </div>
              </div>
              <div className="grid-cell">
                <div className="cell-icon-container">
                  {CUSTOM_PAYWALL_ICONS.progression}
                </div>
                <div className="cell-text-block">
                  <span className="cell-text">{lang === 'fr' ? 'Plan de progression sur 8 semaines' : '8-week progression plan'}</span>
                  <span className="cell-subtext">{lang === 'fr' ? 'Objectifs concrets semaine après semaine pour voir les résultats' : 'Concrete weekly goals to see visible results'}</span>
                </div>
              </div>
              <div className="grid-cell">
                <div className="cell-icon-container">
                  {CUSTOM_PAYWALL_ICONS.chat}
                </div>
                <div className="cell-text-block">
                  <span className="cell-text">{lang === 'fr' ? 'Assistant IA conversationnel' : 'AI Skincare Assistant'}</span>
                  <span className="cell-subtext">{lang === 'fr' ? 'Posez toutes vos questions à notre IA experte disponible 24h/7' : 'Ask any questions to our expert AI available 24/7'}</span>
                </div>
              </div>
            </div>

            {/* Medical disclaimer */}
            <p style={{ fontSize: 10.5, color: "#B9AC9E", textAlign: "center", margin: "0 auto 20px", fontFamily: "'Inter', sans-serif", lineHeight: 1.55, maxWidth: "480px" }}>
              {lang === 'fr'
                ? <>En procédant au paiement, vous reconnaissez avoir lu notre{' '}<a href="/mentions-legales" style={{ color: "#3D2914", fontWeight: "600", textDecoration: "underline" }}>avertissement médical</a>.</>
                : <>By proceeding to payment, you confirm you have read our{' '}<a href="/mentions-legales" style={{ color: "#3D2914", fontWeight: "600", textDecoration: "underline" }}>medical disclaimer</a>.</>
              }
            </p>

            {/* 1. COUNTDOWN TIMER */}
            {timeLeft !== null && (
              <div className="countdown-pill">
                <svg className="countdown-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="countdown-text">
                  {lang === 'fr' 
                    ? `Offre disponible encore ${formatTime(timeLeft)}` 
                    : `Offer available for another ${formatTime(timeLeft)}`}
                </span>
              </div>
            )}

            {/* 5. CTA BUTTON */}
            <button onClick={() => handleUnlock("single")} disabled={unlocking} className="cta-button">
              {unlocking ? (
                <>
                  <span style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#ffffff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite"
                  }} />
                  {t('redirecting')}
                </>
              ) : (
                lang === 'fr' ? "Débloquer mon rapport complet — 7,99 €" : "Unlock My Full Report — €7.99"
              )}
            </button>
            <div className="trust-signals">
              <span className="trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {lang === 'fr' ? 'Paiement 100% sécurisé' : '100% Secure payment'}
              </span>
              <span className="trust-sep">·</span>
              <span className="trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                {lang === 'fr' ? 'Paiement unique, sans abonnement' : 'One-time payment, no subscription'}
              </span>
              <span className="trust-sep">·</span>
              <span className="trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {lang === 'fr' ? 'Accès instantané' : 'Instant access'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Share button ── */}
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

      {/* ── Tab navigation: sticky bottom bar on mobile, pill row on desktop ── */}
      <style>{`
        @media (max-width: 640px) {
          .rpt-tabs-desktop { display: none !important; }
          .rpt-tabs-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .rpt-tabs-desktop { display: flex !important; }
          .rpt-tabs-mobile { display: none !important; }
        }
      `}</style>

      {/* Desktop: scrollable pill row */}
      <div className="rpt-tabs-desktop" style={{ maxWidth: 680, margin: "24px auto 0", padding: "0 20px" }}>
        {!isPaid && (
          <p style={{ ...LABEL_STYLE, textAlign: "center", marginBottom: 10 }}>
            {t('previewLabel')}
          </p>
        )}
        <div style={{
          display: "flex", gap: 4, overflowX: "auto",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.65)",
          borderRadius: 14, padding: 4,
          boxShadow: "0 8px 32px rgba(168,116,73,0.03), inset 0 1px 1px rgba(255,255,255,0.8)",
          scrollbarWidth: "none"
        }}>
          {TABS_CONFIG.map((tab, i) => (
            <button key={i} onClick={() => setPreviewTab(i)} className="rpt-tab-btn" style={{
              flex: "0 0 auto", padding: "10px 14px", borderRadius: 10, textAlign: "center",
              background: previewTab === i ? "linear-gradient(135deg, rgba(44,36,29,0.88), rgba(28,22,17,0.94))" : "transparent",
              color: previewTab === i ? "#fff" : "#6F6156",
              fontSize: 9.5, fontWeight: 600, letterSpacing: "0.07em",
              fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
              border: previewTab === i ? "1px solid rgba(255,255,255,0.15)" : "none",
              cursor: "pointer", transition: "all 0.25s ease",
              boxShadow: previewTab === i ? "0 4px 14px rgba(44,36,29,0.15)" : "none",
              whiteSpace: "nowrap",
            }}>{tab.short}</button>
          ))}
        </div>
      </div>

      {/* Mobile: sticky bottom navigation bar */}
      <div className="rpt-tabs-mobile" style={{
        display: "none",
        position: "fixed", bottom: "-50px", left: 0, right: 0, zIndex: 100,
        background: "#FFFDF9",
        borderTop: "1px solid rgba(201, 169, 97, 0.18)",
        boxShadow: "0 -8px 32px rgba(44,36,29,0.08)",
        padding: "6px 4px calc(56px + env(safe-area-inset-bottom))",
        justifyContent: "space-around", alignItems: "center",
        gap: 0,
      }}>
        {TABS_CONFIG.map((tab, i) => (
          <button
            key={i}
            onClick={() => setPreviewTab(i)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              padding: "6px 8px",
              color: previewTab === i ? "#C9A961" : "#9E8A7A",
              transition: "all 0.2s ease",
              minWidth: 0, flex: 1,
            }}
          >
            {/* Icon with active indicator dot */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {tab.icon}
              {previewTab === i && (
                <div style={{
                  position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
                  width: 18, height: 2, borderRadius: 2,
                  background: "linear-gradient(90deg, #C9A961, #A87449)",
                }} />
              )}
            </div>
            <span style={{
              fontSize: 8.5, fontWeight: previewTab === i ? 700 : 500,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: 52,
              lineHeight: 1.2,
            }}>
              {tab.short}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab content (Blurred for unpaid, interactive and complete for paid) ── */}
      <div style={{
        maxWidth: 680,
        margin: "10px auto 0",
        padding: "0 20px 100px",
        filter: isPaid ? "none" : "blur(5px)",
        opacity: isPaid ? 1 : 0.3,
        pointerEvents: isPaid ? "auto" : "none",
        userSelect: isPaid ? "auto" : "none"
      }}>
        {previewTab === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayMetrics.map((m, i) => <MetricCard key={i} m={m} index={i} t={t} />)}

            <div style={{
              ...CARD,
              marginTop: 14,
              padding: "18px 20px",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(253, 246, 237, 0.45) 100%)",
              display: "flex",
              flexDirection: "column",
              gap: 12
            }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#A87449",
                fontFamily: "'DM Sans', sans-serif",
                borderBottom: "1px solid rgba(168, 116, 73, 0.1)",
                paddingBottom: 6
              }}>
                {lang === 'fr' ? "Comprendre les Notes" : "Understanding the Grades"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Grade A */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "3px 9px",
                    width: 32,
                    textAlign: "center",
                    background: "rgba(168,220,200,0.18)",
                    color: "#7DBFA8",
                    border: "1px solid rgba(168,220,200,0.45)",
                    letterSpacing: "0.06em",
                    flexShrink: 0
                  }}>A</span>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#6F6156" }}>
                    <strong>{lang === 'fr' ? "Optimal / Excellent" : "Optimal / Excellent"}</strong> : {lang === 'fr' ? "La zone présente une excellente santé cutanée avec une barrière protectrice optimale et aucune imperfection notable." : "The area shows excellent skin health with an optimal protective barrier and no notable concerns."}
                  </p>
                </div>
                {/* Grade B */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "3px 9px",
                    width: 32,
                    textAlign: "center",
                    background: "rgba(168,200,232,0.18)",
                    color: "#82B8D8",
                    border: "1px solid rgba(168,200,232,0.45)",
                    letterSpacing: "0.06em",
                    flexShrink: 0
                  }}>B</span>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#6F6156" }}>
                    <strong>{lang === 'fr' ? "Bon / Léger" : "Good / Mild"}</strong> : {lang === 'fr' ? "Bon état général. De légères variations (sébum, déshydratation passagère) sont détectées et peuvent être facilement corrigées." : "Good overall condition. Mild variations (sebum, temporary dehydration) are detected and can be easily corrected."}
                  </p>
                </div>
                {/* Grade C - D */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "3px 9px",
                    width: 32,
                    textAlign: "center",
                    background: "rgba(232,184,212,0.18)",
                    color: "#D4A0BC",
                    border: "1px solid rgba(232,184,212,0.45)",
                    letterSpacing: "0.06em",
                    flexShrink: 0
                  }}>C - D</span>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#6F6156" }}>
                    <strong>{lang === 'fr' ? "À surveiller / Modéré à Significatif" : "Needs Attention / Moderate to Significant"}</strong> : {lang === 'fr' ? "Imperfections ou déséquilibres plus marqués (cernes prononcés, rougeurs, pores dilatés) nécessitant des soins ciblés." : "More pronounced concerns or imbalances (noticeable dark circles, redness, enlarged pores) requiring targeted care."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {previewTab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayStrengths.map((s, i) => (
              <div key={i} style={{ ...CARD, padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(168,116,73,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: GOLD, fontSize: 14 }}>{ICONS[i] || "✦"}</div>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: "#2C241D", marginBottom: 6 }}>{s.title}</div><p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#8C7A6B" }}>{s.desc}</p></div>
              </div>
            ))}
          </div>
        )}
        {previewTab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayImprovements.map((item, i) => (
              <div key={i} style={{ ...CARD, padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(212,165,116,0.12)", border: "1px solid rgba(212,165,116,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: "'Cormorant Garamond', serif" }}>{i + 1}</div>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: "#2C241D", marginBottom: 6 }}>{item.title}</div><p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#8C7A6B" }}>{item.desc}</p></div>
              </div>
            ))}
          </div>
        )}
        {previewTab === 3 && (
          isPaid ? (
            (routine.morning || []).length === 0 && (routine.evening || []).length === 0 && (routine.weekly || []).length === 0 ? (
              <div style={{ ...CARD, padding: "20px", textAlign: "center", color: "#8C7A6B" }}>
                {t('routineUnavailable')}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(routine.morning || []).length > 0 && (
                  <div style={{
                    ...CARD,
                    padding: "20px",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(253,246,237,0.50) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(168,116,73,0.12)", paddingBottom: 8 }}>
                      <SunIcon size={18} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3A2E26", fontFamily: "'DM Sans', sans-serif" }}>
                        {t('routineMorning')}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(routine.morning || []).map((step, idx) => {
                        const matchedProduct = findMatchingProduct(step, paid.productRecommendations || []);
                        return (
                          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                              <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, minWidth: 16 }}>{idx + 1}.</span>
                              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#6F6156" }}>{step}</p>
                            </div>
                            {matchedProduct && (
                              <div style={{ marginLeft: 24 }}>
                                <InlineProductCard product={matchedProduct} t={t} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(routine.evening || []).length > 0 && (
                  <div style={{
                    ...CARD,
                    padding: "20px",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(253,246,237,0.50) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(168,116,73,0.12)", paddingBottom: 8 }}>
                      <MoonIcon size={18} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3A2E26", fontFamily: "'DM Sans', sans-serif" }}>
                        {t('routineEvening')}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(routine.evening || []).map((step, idx) => {
                        const matchedProduct = findMatchingProduct(step, paid.productRecommendations || []);
                        return (
                          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                              <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, minWidth: 16 }}>{idx + 1}.</span>
                              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#6F6156" }}>{step}</p>
                            </div>
                            {matchedProduct && (
                              <div style={{ marginLeft: 24 }}>
                                <InlineProductCard product={matchedProduct} t={t} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(routine.weekly || []).length > 0 && (
                  <div style={{
                    ...CARD,
                    padding: "20px",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(253,246,237,0.50) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(168,116,73,0.12)", paddingBottom: 8 }}>
                      <SparkleIcon size={18} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3A2E26", fontFamily: "'DM Sans', sans-serif" }}>
                        {t('routineWeekly')}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(routine.weekly || []).map((step, idx) => {
                        const matchedProduct = findMatchingProduct(step, paid.productRecommendations || []);
                        return (
                          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                              <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, minWidth: 16 }}>{idx + 1}.</span>
                              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#6F6156" }}>{step}</p>
                            </div>
                            {matchedProduct && (
                              <div style={{ marginLeft: 24 }}>
                                <InlineProductCard product={matchedProduct} t={t} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {previewRoutine.map((rec, i) => (
                <div key={i} style={{ ...CARD, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: GOLD, fontSize: 10, marginTop: 3, flexShrink: 0 }}>✦</span>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "#8C7A6B" }}>{rec}</p>
                </div>
              ))}
            </div>
          )
        )}
        {previewTab === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayProducts.map((p, i) => <ProductCard key={i} product={p} lang={lang} t={t} />)}
          </div>
        )}
        {previewTab === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.keys(paid.lifestyle || {})
              .sort((a, b) => {
                const order = ['hygiene', 'sun', 'temperature', 'sleep', 'diet', 'exercise', 'stress'];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map((key) => {
                const item = (paid.lifestyle || {})[key];
                if (!item) return null;
                const icons = {
                  diet: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 8.4 19 14a7 7 0 0 1-8 6Z" />
                      <path d="M9 11a3 3 0 0 1 3-3" />
                      <path d="M11 20V12" />
                    </svg>
                  ),
                  sleep: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  ),
                  stress: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12a4 4 0 0 1 8 0" />
                      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2" />
                    </svg>
                  ),
                  hygiene: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  ),
                  sun: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ),
                  exercise: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  ),
                  temperature: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
                    </svg>
                  )
                };
                const titles = {
                  diet: lang === 'fr' ? 'Alimentation' : 'Diet',
                  sleep: lang === 'fr' ? 'Sommeil' : 'Sleep',
                  stress: 'Stress',
                  hygiene: lang === 'fr' ? 'Hygiène & Textile' : 'Hygiene & Habits',
                  sun: lang === 'fr' ? 'Exposition' : 'Sun Exposure',
                  exercise: lang === 'fr' ? 'Activité & Sport' : 'Exercise',
                  temperature: lang === 'fr' ? 'Température Eau' : 'Water Temperature'
                };
                const priorities = {
                  hygiene: lang === 'fr' ? 'Priorité 1 · Crucial' : 'Priority 1 · Crucial',
                  sun: lang === 'fr' ? 'Priorité 2 · Crucial' : 'Priority 2 · Crucial',
                  temperature: lang === 'fr' ? 'Priorité 3 · Essentiel' : 'Priority 3 · Essential',
                  sleep: lang === 'fr' ? 'Priorité 4 · Essentiel' : 'Priority 4 · Essential',
                  diet: lang === 'fr' ? 'Priorité 5 · Important' : 'Priority 5 · Important',
                  exercise: lang === 'fr' ? 'Priorité 6 · Important' : 'Priority 6 · Important',
                  stress: lang === 'fr' ? 'Priorité 7 · Recommandé' : 'Priority 7 · Recommended',
                };
                return (
                  <div key={key} style={{ ...CARD, padding: "20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(168,116,73,0.08)", border: "1px solid rgba(168,116,73,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A87449", flexShrink: 0 }}>
                      {icons[key] || "✦"}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#A87449", fontFamily: "'DM Sans', sans-serif" }}>
                          {titles[key] || key}
                        </span>
                        <span style={{
                          fontSize: 8, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                          color: "#C5A028", background: "rgba(197, 160, 40, 0.07)",
                          border: "1px solid rgba(197, 160, 40, 0.20)", borderRadius: 5, padding: "2px 6px",
                          fontFamily: "'DM Sans', sans-serif"
                        }}>
                          {priorities[key]}
                        </span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#2C241D", marginBottom: 6, fontFamily: "'Cormorant Garamond', serif" }}>{item.title}</div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#6F6156" }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
            {!paid.lifestyle && (
              <div style={{ ...CARD, padding: "20px", textAlign: "center", color: "#8C7A6B" }}>
                {lang === 'fr' ? 'Recommandations de mode de vie non disponibles pour ce rapport.' : 'Lifestyle recommendations not available for this report.'}
              </div>
            )}
          </div>
        )}
        {previewTab === 6 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
            {paid.progression ? (
              <>
                <div style={{ position: "absolute", left: 36, top: 20, bottom: 20, width: 2, background: "linear-gradient(180deg, rgba(201,169,97,0.5), rgba(201,169,97,0.05))", zIndex: 0 }} />
                {paid.progression.map((step, i) => (
                  <div key={i} style={{ ...CARD, padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", position: "relative", zIndex: 1 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FFF", border: "2px solid #C9A961", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#A87449", flexShrink: 0, boxShadow: "0 4px 12px rgba(201,169,97,0.2)" }}>
                      {step.week}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8C7A6B", marginBottom: 2 }}>
                        {lang === 'fr' ? `Semaine ${step.week}` : `Week ${step.week}`}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#2C241D", marginBottom: 4, fontFamily: "'Cormorant Garamond', serif" }}>{step.title}</div>
                      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "#6F6156" }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ ...CARD, padding: "20px", textAlign: "center", color: "#8C7A6B" }}>
                {lang === 'fr' ? 'Plan de progression non disponible pour ce rapport.' : 'Progression plan not available for this report.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PDF download card (paid only) ── */}
      {isPaid && (
        <div style={{ maxWidth: 680, margin: "32px auto 0", padding: "0 20px" }}>
          <div style={{
            background: "linear-gradient(150deg, rgba(255,255,255,0.85) 0%, rgba(253,246,237,0.72) 55%, rgba(246,235,222,0.85) 100%)",
            backdropFilter: "blur(32px) saturate(160%)",
            WebkitBackdropFilter: "blur(32px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.9)",
            borderRadius: 26, padding: "clamp(28px,5vw,40px)",
            boxShadow: "0 12px 48px rgba(168,116,73,0.09), 0 2px 0 rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.98)",
            textAlign: "center"
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
                {t('pdfCardTitle')}
              </span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(24px,5vw,32px)", fontWeight: 400,
              color: "#3A2E26", margin: "0 0 12px", lineHeight: 1.18,
            }}>
              {t('pdfCardTitle')}
            </h2>

            {/* Description */}
            <p style={{
              fontSize: 13.5, color: "#6F6156", lineHeight: 1.7,
              margin: "0 0 28px", fontFamily: "'DM Sans', sans-serif",
            }}>
              {t('pdfCardDesc')}
            </p>

            {/* Blurred PDF Preview Mockup */}
            <div style={{
              position: "relative",
              width: "160px",
              height: "220px",
              margin: "0 auto 24px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(168,116,73,0.2)",
              boxShadow: "0 8px 24px rgba(168, 116, 73, 0.08)",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img
                src="/pdf-preview-mockup.png"
                alt="PDF Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "blur(3px)",
                  transform: "scale(1.05)",
                  display: "block"
                }}
              />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(58, 46, 38, 0.05), rgba(58, 46, 38, 0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FAF6F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{
                  filter: "drop-shadow(0 2px 4px rgba(58, 46, 38, 0.2))"
                }}>
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="btn-liquid-glass-dark"
              style={{
                width: "100%", padding: "16px", borderRadius: 14,
                fontSize: 14, fontWeight: 700, letterSpacing: "0.02em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                border: "none", cursor: "pointer"
              }}
            >
              {pdfLoading ? (
                <>
                  <span style={{
                    display: "inline-block", width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                    borderRadius: "50%", animation: "spin 0.7s linear infinite"
                  }} />
                  {t('pdfLoading')}
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('pdfButton')}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer disclaimer and links */}
      <div style={{ maxWidth: 680, margin: "20px auto 0", padding: "0 20px 8px", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#B9AC9E", lineHeight: 1.8, letterSpacing: "0.02em", fontFamily: "'DM Sans', sans-serif", margin: "0 0 6px" }}>
          {lang === 'fr' ? 'Scores basés sur les données photographiques · Pas un avis dermatologique' : 'Scores reflect visible photographic data · Not a medical assessment'}
        </p>
        <a href="/mentions-legales" style={{ fontSize: 10, color: "#A87449", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif", opacity: 0.75 }}>
          {lang === 'fr' ? 'Avertissement médical' : 'Medical Disclaimer'}
        </a>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .pulsing-dot-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 8px;
          height: 8px;
          flex-shrink: 0;
        }
        .pulsing-dot-core {
          position: relative;
          display: inline-block;
          border-radius: 50%;
          width: 8px;
          height: 8px;
          background-color: #10B981;
        }
        .pulsing-dot-ping {
          position: absolute;
          display: inline-block;
          border-radius: 50%;
          width: 8px;
          height: 8px;
          background-color: #10B981;
          animation: pulse-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes pulse-ping {
          0% {
            transform: scale(0.95);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        
        .paywall-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 600;
          color: #3D2914;
          line-height: 1.35;
          text-align: center;
          margin: 0 0 14px;
        }
        @media (min-width: 768px) {
          .paywall-title {
            font-size: 34px;
          }
        }
        
        .paywall-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          color: #6F6156;
          line-height: 1.65;
          text-align: center;
          margin: 0 auto 28px;
          max-width: 520px;
        }
        
        .unlock-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) {
          .unlock-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .grid-cell {
          position: relative;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(253, 246, 237, 0.45) 50%, rgba(201, 169, 97, 0.04) 100%);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(201, 169, 97, 0.22);
          border-radius: 20px;
          padding: 18px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(168, 116, 73, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.6);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s, box-shadow 0.35s, background-color 0.35s;
        }
        .grid-cell:hover {
          transform: translateY(-3px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 246, 237, 0.75) 50%, rgba(201, 169, 97, 0.08) 100%);
          border-color: rgba(201, 169, 97, 0.6);
          box-shadow: 0 12px 28px rgba(168, 116, 73, 0.08), 0 0 10px rgba(201, 169, 97, 0.12);
        }
        .cell-icon-container {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(201, 169, 97, 0.08);
          border: 1px solid rgba(201, 169, 97, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          box-shadow: inset 0 1px 2px rgba(201, 169, 97, 0.05);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .grid-cell:hover .cell-icon-container {
          background: rgba(201, 169, 97, 0.18);
          border-color: rgba(201, 169, 97, 0.5);
          transform: scale(1.05) rotate(5deg);
        }
        .cell-text-block {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }
        .cell-text {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #3D2914;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        .cell-subtext {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: #8C7A6B;
          line-height: 1.4;
        }
        
        .badge-gold {
          position: absolute;
          top: 8px;
          right: 8px;
          background: linear-gradient(135deg, #C9A961, #E5C583);
          color: #FFFFFF;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 3px 7px;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 5px rgba(201, 169, 97, 0.3);
        }
        
        .countdown-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(245, 237, 227, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
          border: 1px solid rgba(201, 169, 97, 0.45);
          border-radius: 9999px;
          padding: 9px 20px;
          margin: 0 auto 24px;
          width: fit-content;
          box-shadow: 0 4px 12px rgba(201, 169, 97, 0.08);
          animation: pulseShadow 3s infinite ease-in-out;
        }
        @keyframes pulseShadow {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(201, 169, 97, 0.08), 0 0 0 rgba(201, 169, 97, 0);
          }
          50% {
            box-shadow: 0 6px 20px rgba(201, 169, 97, 0.22), 0 0 8px rgba(201, 169, 97, 0.2);
          }
        }
        .countdown-icon {
          animation: pulseClock 2s infinite ease-in-out;
        }
        @keyframes pulseClock {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .countdown-text {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #3D2914;
          letter-spacing: 0.01em;
        }
        
        .cta-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: linear-gradient(135deg, #3D2914 0%, #4E351B 50%, #281B0D 100%);
          background-size: 200% 200%;
          animation: buttonShimmer 8s ease infinite;
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          font-size: 15.5px;
          font-weight: 700;
          padding: 19px 24px;
          border-radius: 18px;
          border: 1px solid rgba(201, 169, 97, 0.55);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 24px rgba(61, 41, 20, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          margin-bottom: 12px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        @keyframes buttonShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .cta-button:hover {
          background: linear-gradient(135deg, #4E351B 0%, #5E4021 50%, #3D2914 100%);
          border-color: rgba(201, 169, 97, 0.85);
          box-shadow: 0 12px 30px rgba(61, 41, 20, 0.35), 0 0 15px rgba(201, 169, 97, 0.25);
          transform: translateY(-2px) scale(1.005);
        }
        .cta-button:active {
          transform: translateY(1px);
          box-shadow: 0 4px 10px rgba(61, 41, 20, 0.2);
        }
        .cta-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .trust-signals {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin: 0 0 20px;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #8C7A6B;
        }
        .trust-sep {
          color: rgba(168, 116, 73, 0.35);
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
