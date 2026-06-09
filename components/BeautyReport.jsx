import { useState, useEffect, useMemo } from "react";
import { useLang } from "../lib/LangContext";
import { shareScore } from "../lib/shareImage";
import { sanitizeReport } from "../lib/textSanitizer";
import MedicalDisclaimer from "./MedicalDisclaimer";
import { STATIC_PRODUCTS } from "../lib/catalog";
import { ScanFace, Sparkles, ShoppingBag, Heart, TrendingUp, FileText } from 'lucide-react';
import { getRelevantActivesForConcerns } from "../lib/productFilter";
import { LuxuryFlower } from "./Logo";
import ProductImage from "./ProductImage";

const GOLD = "#C5A028";
const CARD = {
  background: "rgba(255, 255, 255, 0.68)",
  backdropFilter: "blur(24px) saturate(150%)",
  WebkitBackdropFilter: "blur(24px) saturate(150%)",
  border: "1px solid rgba(201, 169, 97, 0.22)",
  borderRadius: 24,
  boxShadow: "0 10px 36px rgba(168, 116, 73, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
};
const LABEL_STYLE = { margin: "0 0 4px", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#B0885E", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" };
const TITLE_STYLE = { margin: "0 0 16px", fontSize: 22, fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", color: "#3A2E26" };

const ICONS = ["✦", "◈", "◉", "▲", "◆", "●"];

const CUSTOM_PAYWALL_ICONS = {
  scan: <ScanFace size={28} strokeWidth={1.5} color="#C9A961" />,
  routine: <Sparkles size={28} strokeWidth={1.5} color="#C9A961" />,
  dropper: <ShoppingBag size={28} strokeWidth={1.5} color="#C9A961" />,
  lifestyle: <Heart size={28} strokeWidth={1.5} color="#C9A961" />,
  progression: <TrendingUp size={28} strokeWidth={1.5} color="#C9A961" />,
  pdf: <FileText size={28} strokeWidth={1.5} color="#C9A961" />
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
function ScoreHeroCard({ score, summary, faceShape, skinType, skinTone, badge, miniMetrics, t, lang, onShare, sharing, shareMsg }) {
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
        margin: "0 0 16px", fontSize: "14px", lineHeight: "1.6", textAlign: "center", position: "relative",
        color: "#2C2416", fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
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
            className="bubble-nacré"
            style={{
              borderRadius: 10,
              padding: "7px 14px",
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

      {/* Share Button (Small version near the score) */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 16, width: "100%" }}>
        <button
          onClick={onShare}
          disabled={sharing}
          style={{
            padding: "9px 18px",
            borderRadius: 20,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.03em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "1px solid rgba(201, 169, 97, 0.35)",
            cursor: "pointer",
            width: "fit-content",
            background: "linear-gradient(135deg, #3D2914 0%, #4E351B 50%, #281B0D 100%)",
            color: "#FFFDF9",
            boxShadow: "0 6px 16px rgba(61, 41, 20, 0.12)",
            fontFamily: "'DM Sans', sans-serif",
            textTransform: "uppercase",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {sharing ? (
            <>
              <span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              {t('shareGenerating')}
            </>
          ) : (
            <>
              <CameraSparkleIcon size={13} color="#C9A961" />
              <span>{t('shareScore')}</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center", marginLeft: 4, paddingLeft: 8, borderLeft: "1px solid rgba(255,255,255,0.25)" }}>
                <InstagramLogo size={11} color="#FFFDF9" />
                <TikTokLogo size={11} color="#FFFDF9" />
              </span>
            </>
          )}
        </button>
        {shareMsg && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#A87449", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>{shareMsg}</p>}
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

function EmailSaveCard({
  lang,
  t,
  email,
  setEmail,
  firstName,
  setFirstName,
  emailLoading,
  newsletterConsent,
  setNewsletterConsent,
  handleEmailSubmit,
  handleEmailSkip
}) {
  return (
    <div style={{
      ...CARD,
      marginTop: 40,
      padding: "clamp(24px, 5vw, 36px)",
      textAlign: "center",
      border: "1px solid rgba(201, 169, 97, 0.35)",
      boxShadow: "0 12px 32px rgba(168, 116, 73, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <LuxuryFlower width={56} height={56} />
      </div>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: '#C5A028', fontWeight: 600, margin: '0 0 8px',
      }}>
        {lang === 'fr' ? 'Sauvegarder mon rapport' : 'Save my report'}
      </p>

      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 400,
        color: '#2C241D', margin: '0 0 10px', lineHeight: 1.25,
      }}>
        {lang === 'fr' ? 'Retrouvez votre analyse à tout moment' : 'Access your analysis anytime'}
      </h2>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12.5, color: '#8C7A6B', lineHeight: 1.6,
        margin: '0 0 20px',
      }}>
        {lang === 'fr'
          ? "Entrez votre e-mail pour enregistrer ce rapport dans 'Mes rapports' et recevoir chaque semaine nos conseils skincare basés sur la science."
          : "Enter your email to save this report to 'My Reports' and receive weekly science-based skincare tips."}
      </p>

      <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={lang === 'fr' ? 'Votre prénom (optionnel)' : 'Your first name (optional)'}
          className="input-nacré"
          style={{
            borderRadius: 16,
            padding: '12px 16px', fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none', width: '100%', boxSizing: 'border-box',
            color: '#3A2E26',
          }}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={lang === 'fr' ? 'Votre email' : 'Your email'}
          required
          className="input-nacré"
          style={{
            borderRadius: 16,
            padding: '12px 16px', fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none', width: '100%', boxSizing: 'border-box',
            color: '#3A2E26',
          }}
        />

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', marginTop: 4, textAlign: 'left' }}>
          <input
            type="checkbox"
            checked={newsletterConsent}
            onChange={(e) => setNewsletterConsent(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span style={{ fontSize: 10.5, color: '#8C7A6B', lineHeight: 1.4, fontFamily: "'DM Sans', sans-serif" }}>
            {t('newsletterConsent')}
          </span>
        </label>

        <button
          type="submit"
          disabled={emailLoading}
          className="btn-liquid-glass-dark"
          style={{
            width: '100%',
            marginTop: 8,
            padding: '12px 18px',
            borderRadius: 16,
            border: 'none',
            fontSize: 13,
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
            lang === 'fr' ? 'Sauvegarder mon rapport →' : 'Save my report →'
          )}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleEmailSkip}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12.5,
            fontWeight: 600,
            color: '#8C7A6B',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {lang === 'fr' ? 'Continuer sans sauvegarder' : 'Continue without saving'}
        </button>
      </div>
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
  const { lang } = useLang();

  useEffect(() => {
    const timer = setTimeout(() => setVis(true), index * 80 + 100);
    return () => clearTimeout(timer);
  }, [index]);

  const getStatus = (score) => {
    const s = Number(score) || 0;
    if (s >= 80) return { label: lang === 'fr' ? 'BON' : 'GOOD', color: 'green' };
    if (s >= 60) return { label: lang === 'fr' ? 'À SURVEILLER' : 'MONITOR', color: 'amber' };
    return { label: lang === 'fr' ? 'À TRAVAILLER' : 'NEEDS WORK', color: 'pink' };
  };

  const status = getStatus(m.score);
  
  const statusColors = {
    green: { bg: 'rgba(125,191,168,0.1)', color: '#4D8C76' },
    amber: { bg: 'rgba(212, 165, 116, 0.15)', color: '#B0885E' },
    pink: { bg: 'rgba(216, 134, 157, 0.1)', color: '#B85C75' },
  };

  const currentStatusStyle = statusColors[status.color];

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
            {m.severity && t && <SeverityBadge severity={m.severity} t={t} />}
          </div>
        </div>
        <div style={{ height: 2, background: "rgba(168,116,73,0.1)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${m.score}%`, background: "linear-gradient(90deg, #A87449, #D4A574)", borderRadius: 10, transition: "width 1.6s cubic-bezier(0.4,0,0.2,1)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
           <span style={{
             background: currentStatusStyle.bg,
             color: currentStatusStyle.color,
             fontSize: 8.5, fontWeight: 700, padding: "3px 6px",
             borderRadius: 6, letterSpacing: "0.05em", lineHeight: 1,
             whiteSpace: "nowrap"
           }}>
             {status.label}
           </span>
           <span style={{ 
              fontSize: "13px", color: "#2C2416", fontWeight: 400, 
              fontFamily: "'Inter', sans-serif",
              lineHeight: "1.55",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1
            }}>
              {m.detail}
            </span>
        </div>
      </div>
    </div>
  );
}

/* ── Image proxy helper ─────────────────────────────────────────────────────
   Routes product images through our server-side proxy so that Amazon and
   Sephora anti-hotlinking headers are bypassed reliably.
   Falls back to null (which triggers the SVG placeholder) for empty URLs.
── */
const PLACEHOLDER_IMAGE = '/images/product-placeholder.svg';

const getProxiedImageUrl = (originalUrl) => {
  if (!originalUrl || originalUrl === '' || originalUrl === 'placeholder') {
    return null;
  }
  // Local/data URLs pass through unchanged (like data:image/jpeg;base64)
  if (originalUrl.startsWith('/') || originalUrl.startsWith('data:')) {
    return originalUrl;
  }
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
};

/* ── Product image lookup ── */
const getProductImage = (productName) => {
  const name = productName?.toLowerCase() || '';
  if (name.includes('cerave sa cleanser') || name.includes('sa smoothing cleanser')) {
    return 'https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?q=80&w=240&auto=format&fit=crop';
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
    return 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=240&auto=format&fit=crop';
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
    return 'https://images.unsplash.com/photo-1629732047847-50b7ecf0cbf1?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('avocado') || name.includes('kiehl')) {
    return 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('glow recipe') || name.includes('watermelon') || name.includes('dew drops')) {
    return 'https://images.unsplash.com/photo-1590156546746-c22224b69cd1?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('drunk elephant') || name.includes('firma')) {
    return 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes("paula's choice 8%") || (name.includes('paula') && name.includes('aha'))) {
    return 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=240&auto=format&fit=crop';
  }

  if (name.includes('cleanser') || name.includes('nettoyant')) {
    return 'https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('serum') || name.includes('sérum')) {
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=240&auto=format&fit=crop';
  }
  if (name.includes('cream') || name.includes('moisturizer') || name.includes('crème')) {
    return 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=240&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=240&auto=format&fit=crop';
};

const getProductEfficacy = (productName) => {
  const name = (productName || '').toLowerCase();
  
  if (name.includes('cerave sa') || name.includes('sa smoothing')) {
    return { rating: 4.7, count: "14k+", label: "94% pores désincrustés" };
  }
  if (name.includes("paula's choice 2%") || (name.includes('paula') && name.includes('bha'))) {
    return { rating: 4.8, count: "25k+", label: "96% réduction des comédons" };
  }
  if (name.includes('ordinary alpha arbutin')) {
    return { rating: 4.5, count: "8k+", label: "90% taches atténuées" };
  }
  if (name.includes('skinceuticals') || name.includes('c e ferulic')) {
    return { rating: 4.9, count: "5k+", label: "98% éclat & antioxydant" };
  }
  if (name.includes('cerave moist') || name.includes('crème hydratante')) {
    return { rating: 4.8, count: "30k+", label: "95% barrière renforcée" };
  }
  if (name.includes('laneige water') || name.includes('sleeping mask')) {
    return { rating: 4.7, count: "12k+", label: "93% hydratation nocturne" };
  }
  if (name.includes('ordinary niacinamide')) {
    return { rating: 4.6, count: "40k+", label: "91% sébum régulé" };
  }
  if (name.includes('caffeine eye') || name.includes('inkey list')) {
    return { rating: 4.4, count: "9k+", label: "88% poches réduites" };
  }
  if (name.includes('avocado') || name.includes('kiehl')) {
    return { rating: 4.7, count: "6k+", label: "92% contour hydraté" };
  }
  if (name.includes('glow recipe') || name.includes('watermelon')) {
    return { rating: 4.6, count: "7k+", label: "90% teint lumineux" };
  }
  if (name.includes('drunk elephant') || name.includes('firma')) {
    return { rating: 4.7, count: "4k+", label: "93% fermeté améliorée" };
  }
  if (name.includes('paula') && name.includes('aha')) {
    return { rating: 4.7, count: "5k+", label: "92% texture lissée" };
  }

  // Fallback rating using deterministic hash of the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rating = (4.4 + Math.abs(hash % 6) * 0.1).toFixed(1);
  const percent = 88 + Math.abs(hash % 11);
  return { rating: parseFloat(rating), count: "1k+", label: `${percent}% satisfaction globale` };
};

const getNormalizedUserSkinType = (skinType) => {
  if (!skinType) return '';
  const clean = skinType.toLowerCase().trim();
  if (clean.includes('grasse') || clean.includes('oily')) return 'oily';
  if (clean.includes('sèche') || clean.includes('seche') || clean.includes('dry')) return 'dry';
  if (clean.includes('mixte') || clean.includes('combination')) return 'combination';
  if (clean.includes('sensible') || clean.includes('sensitive')) return 'sensitive';
  if (clean.includes('normale') || clean.includes('normal')) return 'normal';
  return clean;
};

const getSkinTypeLabel = (type, lang) => {
  const mapping = {
    dry: lang === 'fr' ? 'Peau Sèche' : 'Dry Skin',
    oily: lang === 'fr' ? 'Peau Grasse' : 'Oily Skin',
    combination: lang === 'fr' ? 'Peau Mixte' : 'Combination Skin',
    sensitive: lang === 'fr' ? 'Peau Sensible' : 'Sensitive Skin',
    normal: lang === 'fr' ? 'Peau Normale' : 'Normal Skin'
  };
  return mapping[type] || type;
};

const getConcernLabel = (concern, lang) => {
  const mapping = {
    acne: lang === 'fr' ? 'Acné & Boutons' : 'Acne',
    pores: lang === 'fr' ? 'Pores' : 'Pores',
    dryness: lang === 'fr' ? 'Déshydratation' : 'Dehydration',
    radiance: lang === 'fr' ? 'Éclat' : 'Radiance',
    dark_spots: lang === 'fr' ? 'Taches' : 'Dark Spots',
    dark_circles: lang === 'fr' ? 'Cernes' : 'Dark Circles',
    redness: lang === 'fr' ? 'Rougeurs' : 'Redness',
    aging: lang === 'fr' ? 'Anti-âge' : 'Aging',
    texture: lang === 'fr' ? 'Texture' : 'Texture'
  };
  return mapping[concern] || concern;
};

const getUserConcernsList = (reportData) => {
  const concernsSet = new Set();
  const mapTextToConcerns = (text) => {
    if (!text) return;
    const t = text.toLowerCase();
    if (t.includes('acne') || t.includes('bouton') || t.includes('imperfection') || t.includes('blemish') || t.includes('acné')) concernsSet.add('acne');
    if (t.includes('pigment') || t.includes('tache') || t.includes('spot') || t.includes('hyperpigmentation')) {
      concernsSet.add('hyperpigmentation');
      concernsSet.add('dark_spots');
    }
    if (t.includes('dry') || t.includes('sec') || t.includes('sèche') || t.includes('dehydr') || t.includes('déhydr') || t.includes('déshydratation')) concernsSet.add('dryness');
    if (t.includes('pore')) concernsSet.add('pores');
    if (t.includes('cerne') || t.includes('dark circle') || t.includes('eye') || t.includes('oeil') || t.includes('yeux') || t.includes('cernes')) concernsSet.add('dark_circles');
    if (t.includes('éclat') || t.includes('glow') || t.includes('radiance') || t.includes('terne') || t.includes('dull')) concernsSet.add('radiance');
    if (t.includes('texture') || t.includes('rugos') || t.includes('grain') || t.includes('rêche')) concernsSet.add('texture');
    if (t.includes('rougeur') || t.includes('redness') || t.includes('sensib') || t.includes('irrit')) concernsSet.add('redness');
    if (t.includes('ride') || t.includes('ridule') || t.includes('aging') || t.includes('wrinkle') || t.includes('fine line')) concernsSet.add('aging');
  };

  if (reportData.free_version?.mainProblems) {
    reportData.free_version.mainProblems.forEach(p => {
      mapTextToConcerns(p.title);
      mapTextToConcerns(p.description);
    });
  }
  if (reportData.summary) {
    mapTextToConcerns(reportData.summary);
  }
  return Array.from(concernsSet);
};

/* ── Product card ── */
export function ProductCard({ product, lang, t, userSkinType, userConcerns, isPriorityRecommendation = false, compact = false, requiredActives = [] }) {
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  if (!product) return null;

  const getBrandAndName = (p) => {
    if (p.brand) return { brand: p.brand, name: p.productName || p.product_name };
    if (p.product_brand) return { brand: p.product_brand, name: p.productName || p.product_name };
    
    const fullName = p.productName || p.product_name || "";
    const brands = [
      "Paula's Choice", "The Ordinary", "SkinCeuticals", "Sunday Riley", 
      "The Inkey List", "Glow Recipe", "Drunk Elephant", "CeraVe", 
      "Laneige", "Kiehl's", "La Roche-Posay", "Vichy", "Avene", "Bioderma"
    ];
    
    for (const b of brands) {
      if (fullName.toLowerCase().startsWith(b.toLowerCase())) {
        const remainingName = fullName.substring(b.length).trim().replace(/^[—\-\s]+/, '');
        return { brand: b, name: remainingName };
      }
    }
    
    return { brand: "", name: fullName };
  };

  const { brand, name } = getBrandAndName(product);

  // ── Diagnostic: trace image URL selection (remove after confirming fix) ──
  if (typeof window !== 'undefined') {
    const _pname = product.productName || product.product_name || '?';
    console.log(`[ProductCard: ${_pname}] raw object image fields:`, {
      product_image_url: product.product_image_url,
      productImageUrl: product.productImageUrl,
      imageUrl: product.imageUrl,
      image_url: product.image_url
    });
  }

  const rawImgUrl = product.product_image_url || product.productImageUrl || product.imageUrl || product.image_url || getProductImage(product.productName || product.product_name);
  const imgUrl = getProxiedImageUrl(rawImgUrl);
  
  // Custom description based on locale if static, or direct AI generated description
  const descriptionText = lang === 'fr' 
    ? (product.description_fr || product.description || product.product_description || product.productDescription || "")
    : (product.description_en || product.description || product.product_description || product.productDescription || "");
  
  const amazonUrl = product.amazon_link || product.amazonLink || `https://www.amazon.fr/s?k=${encodeURIComponent(product.productName || product.product_name || '')}&tag=ratemyskin-21`;
  const sephoraUrl = product.sephora_link || product.sephoraLink || `https://www.sephora.fr/search/?q=${encodeURIComponent(product.productName || product.product_name || '')}`;
  
  // Get ratings and efficacy labels
  const defaultEfficacy = getProductEfficacy(product.productName || product.product_name);
  const rating = product.rating || defaultEfficacy.rating;
  const count = product.count || defaultEfficacy.count;
  const label = lang === 'fr' 
    ? (product.efficacyLabel_fr || defaultEfficacy.label) 
    : (product.efficacyLabel_en || defaultEfficacy.label);

  // Compute profile matches
  const pSkinTypes = product.skinTypes || product.skin_types || ['normal', 'dry', 'oily', 'combination', 'sensitive'];
  const pConcerns = product.concerns || (product.skin_problem ? [product.skin_problem] : []);
  
  const normUserSkinType = userSkinType ? getNormalizedUserSkinType(userSkinType) : "";
  const matchesSkinType = normUserSkinType ? pSkinTypes.includes(normUserSkinType) : false;
  const matchesConcern = (userConcerns && userConcerns.length > 0) ? pConcerns.some(c => userConcerns.includes(c)) : false;

  // Find matching concern keys for badge labels
  const matchedConcernsList = userConcerns ? pConcerns.filter(c => userConcerns.includes(c)) : [];

  const hasActiveOverlap = requiredActives && requiredActives.length > 0
  const hasConcernOverlap = userConcerns && userConcerns.length > 0
    ? (matchedConcernsList.length / userConcerns.length >= 0.5 || matchedConcernsList.length / Math.max(1, pConcerns.length) >= 0.5)
    : matchesConcern;

  const isPerfectMatch = requiredActives && requiredActives.length > 0
    ? (hasActiveOverlap && hasConcernOverlap && matchesSkinType)
    : (matchesSkinType && matchesConcern);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...CARD,
        padding: "12px 16px",
        border: hov ? "1px solid rgba(168,116,73,0.45)" : (isPerfectMatch ? "1px solid rgba(201, 169, 97, 0.45)" : "1px solid rgba(255, 255, 255, 0.85)"),
        boxShadow: hov 
          ? "0 12px 28px rgba(168,116,73,0.08), inset 0 1px 0 rgba(255,255,255,0.95)" 
          : (isPerfectMatch ? "0 6px 20px rgba(201, 169, 97, 0.05), inset 0 1px 0 rgba(255,255,255,0.95)" : "0 6px 20px rgba(168,116,73,0.02), inset 0 1px 0 rgba(255,255,255,0.95)"),
        opacity: vis ? 1 : 0,
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition: "opacity 0.45s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s, background-color 0.3s",
        background: isPerfectMatch 
          ? "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(253, 246, 237, 0.65) 50%, rgba(201, 169, 97, 0.08) 100%)" 
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(253, 246, 237, 0.52) 50%, rgba(246, 235, 222, 0.78) 100%)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "12px"
      }}
    >
      <div className="premium-product-card">
        {/* Product image container */}
        <div className="premium-product-img-wrapper">
          <a href={amazonUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", height: "100%" }}>
            <div style={{ 
              width: "100%", height: "100%", 
              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              transform: hov ? "scale(1.06)" : "scale(1)"
            }}>
              <ProductImage src={imgUrl} alt={product.productName || product.product_name} sizes="(max-width: 768px) 50vw, 300px" />
            </div>
          </a>
        </div>

        {/* Content wrapper */}
        <div className="premium-product-info" style={{ flex: 1 }}>
          {/* Header row with Matching Badges / Category and Price */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2, flexWrap: "wrap", gap: 6 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {isPriorityRecommendation && (
                <span style={{
                  display: "inline-block",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#FFF",
                  background: "linear-gradient(135deg, #C5A028 0%, #A87449 100%)",
                  borderRadius: 5,
                  padding: "2px 6px",
                  boxShadow: "0 2px 4px rgba(168,116,73,0.15)"
                }}>
                  ✨ {lang === 'fr' ? "Conseillé pour vous" : "Recommended for you"}
                </span>
              )}
              {!isPriorityRecommendation && isPerfectMatch && (
                <span style={{
                  display: "inline-block",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#FFF",
                  background: "linear-gradient(135deg, #C9A961 0%, #E5C583 100%)",
                  borderRadius: 5,
                  padding: "2px 6px",
                  boxShadow: "0 2px 4px rgba(201,169,97,0.15)"
                }}>
                  ✨ Match Parfait
                </span>
              )}
              {!isPriorityRecommendation && !isPerfectMatch && matchesSkinType && userSkinType && (
                <span style={{
                  display: "inline-block",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#5CA18B",
                  background: "rgba(168,220,200,0.18)",
                  border: "1px solid rgba(168,220,200,0.45)",
                  borderRadius: 5,
                  padding: "2px 6px"
                }}>
                  ✓ {getSkinTypeLabel(normUserSkinType, lang)}
                </span>
              )}
              {!isPriorityRecommendation && !isPerfectMatch && matchesConcern && matchedConcernsList.length > 0 && (
                <span style={{
                  display: "inline-block",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#B67C9D",
                  background: "rgba(232,184,212,0.18)",
                  border: "1px solid rgba(232,184,212,0.45)",
                  borderRadius: 5,
                  padding: "2px 6px"
                }}>
                  ✦ {getConcernLabel(matchedConcernsList[0], lang)}
                </span>
              )}
              {/* Category tag */}
              <span style={{
                display: "inline-block",
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8C7A6B",
                background: "rgba(168,116,73,0.06)",
                border: "1px solid rgba(168,116,73,0.12)",
                borderRadius: 5,
                padding: "2px 6px"
              }}>
                {product.routineStep || product.routine_step || "skincare"}
              </span>
            </div>
            
            {(product.price || product.price_range) && (
              <span style={{
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#A87449",
                fontFamily: "'DM Sans', sans-serif"
              }}>
                {product.price || product.price_range}
              </span>
            )}
          </div>

          {/* Product Title (Brand + Name) */}
          <div style={{
            fontSize: "17px",
            fontWeight: "700",
            color: "#2C241D",
            fontFamily: "'Cormorant Garamond', serif",
            lineHeight: 1.25,
            marginBottom: "2px",
            wordBreak: "break-word"
          }}>
            {brand ? (
              <>
                <span style={{ color: "#B0885E", fontWeight: "700" }}>{brand}</span>
                <span style={{ color: "#2C241D", fontWeight: "300", margin: "0 6px" }}>|</span>
                <span>{name}</span>
              </>
            ) : name}
          </div>

          {/* Efficacy Rating Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "2px 0 4px", flexWrap: "wrap" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "12px",
              fontWeight: "700",
              color: "#C5A028",
              fontFamily: "'DM Sans', sans-serif"
            }}>
              <span>★</span>
              <span>{rating}/5</span>
            </div>
            <span style={{ fontSize: "11px", color: "#A0938A" }}>({count} {lang === 'fr' ? 'avis' : 'reviews'})</span>
            {label && (
              <>
                <span style={{ color: "#E3C9B5" }}>•</span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#A87449",
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  {label}
                </span>
              </>
            )}
          </div>

          {/* Product Description */}
          <p className="premium-product-desc" style={{ marginBottom: 4 }}>
            {descriptionText}
          </p>

          {/* Key Actives list */}
          {product.actives && product.actives.length > 0 && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 4, 
              marginTop: 2, 
              fontSize: 10.5, 
              color: "#8C7A6B", 
              fontFamily: "'DM Sans', sans-serif",
              flexWrap: "wrap"
            }}>
              <span style={{ fontWeight: 700, color: "#B0885E" }}>
                {lang === 'fr' ? "Actifs :" : "Actives:"}
              </span>
              <span style={{ fontStyle: "italic" }}>
                {(lang === 'fr' ? product.actives : (product.actives_en || product.actives)).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Buy Buttons wrapper */}
        <div className="rpt-product-buttons-container">
          {amazonUrl && (
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-product-btn"
              style={{
                background: "linear-gradient(135deg, #3D2914 0%, #281B0D 100%)",
                color: "#FAF6F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                padding: "8px 12px",
                borderRadius: 10,
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "all 0.3s ease",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
              }}
            >
              Amazon
            </a>
          )}
          {sephoraUrl && (
            <a
              href={sephoraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-product-btn"
              style={{
                background: "rgba(255,255,255,0.85)",
                color: "#3D2914",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                padding: "8px 12px",
                borderRadius: 10,
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "all 0.3s ease",
                border: "1px solid rgba(168, 116, 73, 0.22)",
                boxShadow: "0 2px 6px rgba(168,116,73,0.04)"
              }}
            >
              Sephora
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const getNormalizedConcerns = (concernsList) => {
  if (!concernsList) return [];
  const normalized = new Set();
  concernsList.forEach(c => {
    if (!c) return;
    const clean = c.toLowerCase().trim();
    normalized.add(clean);
    if (clean === 'hyperpigmentation' || clean === 'pigmentation') {
      normalized.add('dark_spots');
    }
    if (clean === 'dark_spots') {
      normalized.add('hyperpigmentation');
    }
  });
  return Array.from(normalized);
};

const findMatchingProduct = (stepText, products, userSkinType, userConcerns, alreadySelectedIds = []) => {
  if (!products || products.length === 0) return null;
  const validProducts = products.filter(Boolean);
  if (validProducts.length === 0) return null;
  const text = (stepText || '').toLowerCase();

  // 1. Precise name-based matching
  let bestMatch = null;
  let maxOverlap = 0;

  for (const p of validProducts) {
    const name = (p.productName || p.product_name || '').toLowerCase();
    if (!name) continue;

    if (text.includes(name)) {
      return p;
    }

    const words = name.split(/\s+/).filter(w => w.length > 2 && w !== 'the');
    if (words.length > 0 && words.every(word => text.includes(word))) {
      if (words.length > maxOverlap) {
        maxOverlap = words.length;
        bestMatch = p;
      }
    }
  }

  if (bestMatch) return bestMatch;

  // 2. Identify the product category from the step text
  let category = null;
  if (text.includes('nettoyer') || text.includes('nettoyant') || text.includes('cleanse') || text.includes('cleanser') || text.includes('gel moussant') || text.includes('eau micellaire') || text.includes('démaquillant') || text.includes('wash') || text.includes('lavant') || text.includes('lotion micellaire')) {
    category = 'cleanser';
  } else if (text.includes('lotion') || text.includes('toner') || text.includes('tonique') || text.includes('exfolier') || text.includes('exfoliant') || text.includes('bha') || text.includes('aha') || text.includes('glycolique') || text.includes('salicylique') || text.includes('peeling') || text.includes('solution tonique')) {
    category = 'toner';
  } else if (text.includes('sérum') || text.includes('serum') || text.includes('concentré') || text.includes('vitamine c') || text.includes('retinol') || text.includes('rétinol') || text.includes('arbutine') || text.includes('arbutin') || text.includes('niacinamide') || text.includes('hyaluronique') || text.includes('acide') || text.includes('ampoule')) {
    category = 'serum';
  } else if (text.includes('spf') || text.includes('solaire') || text.includes('soleil') || text.includes('sunscreen') || text.includes('protection') || text.includes('fluide invisible') || text.includes('relief sun') || text.includes('uvmune') || text.includes('protection solaire')) {
    category = 'sunscreen';
  } else if (text.includes('masque') || text.includes('mask') || text.includes('sleeping mask') || text.includes('détox') || text.includes('detox') || text.includes('argile rose')) {
    category = 'mask';
  } else if (text.includes('contour') || text.includes('yeux') || text.includes('eye') || text.includes('cernes') || text.includes('poches') || text.includes('caffeine') || text.includes('caféine') || text.includes('avocado')) {
    category = 'eye';
  } else if (text.includes('crème') || text.includes('cream') || text.includes('moisturizer') || text.includes('hydratant') || text.includes('hydrater') || text.includes('nourrir') || text.includes('nourrissant') || text.includes('cicalfate') || text.includes('skin food') || text.includes('baume') || text.includes('gel-crème') || text.includes('soin auto-réhydratant')) {
    category = 'moisturizer';
  }

  // 3. Fallback filtering based on the identified category & user profile
  if (category) {
    const candidates = validProducts.filter(p => {
      const pStep = p.routineStep || p.routine_step || "";
      return pStep === category;
    });

    if (candidates.length > 0) {
      // Score candidates based on profile match
      const scored = candidates.map(p => {
        const pSkinTypes = p.skinTypes || p.skin_types || [];
        const pConcerns = getNormalizedConcerns(p.concerns || (p.skin_problem ? [p.skin_problem] : []));
        
        const matchesSkinType = pSkinTypes.includes(userSkinType);
        const matchesConcern = pConcerns.some(c => (userConcerns || []).includes(c));
        const isPerfectMatch = matchesSkinType && matchesConcern;
        
        let score = 0;
        if (isPerfectMatch) score = 3;
        else if (matchesConcern) score = 2;
        else if (matchesSkinType) score = 1;

        // Penalty if already selected in the routine to promote variety
        const isAlreadySelected = alreadySelectedIds.includes(p.id);
        if (isAlreadySelected) {
          score -= 5;
        }

        return { product: p, score };
      });

      // Sort by score descending, then by rating
      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const rB = b.product.rating || 4.5;
        const rA = a.product.rating || 4.5;
        return rB - rA;
      });

      return scored[0].product;
    }
  }

  // 4. Absolute ultimate fallback (if no category could be parsed)
  const unselectedProducts = validProducts.filter(p => !alreadySelectedIds.includes(p.id));
  const pool = unselectedProducts.length > 0 ? unselectedProducts : validProducts;
  
  const scoredPool = pool.map(p => {
    const pSkinTypes = p.skinTypes || p.skin_types || [];
    const pConcerns = getNormalizedConcerns(p.concerns || (p.skin_problem ? [p.skin_problem] : []));
    const matchesSkinType = pSkinTypes.includes(userSkinType);
    const matchesConcern = pConcerns.some(c => (userConcerns || []).includes(c));
    let score = 0;
    if (matchesSkinType && matchesConcern) score = 3;
    else if (matchesConcern) score = 2;
    else if (matchesSkinType) score = 1;
    return { product: p, score };
  });

  scoredPool.sort((a, b) => b.score - a.score);
  return scoredPool[0]?.product || null;
};

function CameraSparkleIcon({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <path d="M23 19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V8C1 6.9 1.9 6 3 6H7L9 3H15L17 6H21C22.1 6 23 6.9 23 8V19Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth="1.8" />
      <path d="M18 9.5L18.3 8.3L19.5 8L18.3 7.7L18 6.5L17.7 7.7L16.5 8L17.7 8.3Z" fill={color} />
    </svg>
  );
}

function InstagramLogo({ size = 13, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TikTokLogo({ size = 13, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
function InlineProductCard({ product, lang, t }) {
  const [hov, setHov] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const productName = product.productName || product.product_name || "";
  const amazonUrl = product.amazonLink || product.amazon_link || `https://www.amazon.fr/s?k=${encodeURIComponent(productName)}&tag=ratemyskin-21`;
  const sephoraUrl = product.sephoraLink || product.sephora_link || `https://www.sephora.fr/search/?q=${encodeURIComponent(productName)}`;
  const rawImgUrl = product.product_image_url || product.imageUrl || product.image_url || "";
  const imgUrl = getProxiedImageUrl(rawImgUrl);
  const descText = lang === 'fr'
    ? (product.description_fr || product.description || "")
    : (product.description_en || product.description || "");
  const priceText = product.price || product.price_range || "";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rpt-inline-product-card"
      style={{
        border: hov ? "1px solid rgba(168, 116, 73, 0.4)" : "1px solid rgba(168, 116, 73, 0.15)",
        boxShadow: hov ? "0 4px 12px rgba(168, 116, 73, 0.06)" : "none",
      }}
    >
      <div className="rpt-inline-product-card-header">
        {/* Image */}
        <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 8, overflow: 'hidden', border: "1px solid rgba(168, 116, 73, 0.08)" }}>
          <ProductImage src={imgUrl} alt={productName} sizes="38px" />
        </div>

        {/* Text block: name + description + price */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11.5, fontWeight: 700, color: "#2C241D",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3
          }}>
            {productName}
          </div>
          {descText && (
            <p style={{
              margin: "2px 0 0", fontSize: 10, lineHeight: 1.45, color: "#8C7A6B",
              fontFamily: "'DM Sans', sans-serif",
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden"
            }}>
              {descText}
            </p>
          )}
          {priceText && (
            <div style={{ fontSize: 10, color: "#A87449", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
              {priceText}
            </div>
          )}
        </div>
      </div>

      {/* Buttons: small, stacked vertically on right */}
      <div className="rpt-inline-product-card-buttons">
        {/* "Acheter" notch label */}
        <div className="rpt-inline-product-card-notch" style={{
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
function ReportHeader({ t, lang }) {
  const dossier = useMemo(() => {
    // Extract user details for the report header
    const email = typeof window !== "undefined" ? localStorage.getItem("rms_user_email") || "" : "";
    const storedFirstName = typeof window !== "undefined" ? localStorage.getItem("rms_first_name") || "" : "";
    const age = typeof window !== "undefined" ? (sessionStorage.getItem("rms_age") || "") : "";
    const timestamp = typeof window !== "undefined" ? sessionStorage.getItem("rms_generation_finished_at") : null;
    let dateStr = "";
    if (timestamp) {
      dateStr = new Date(parseInt(timestamp, 10)).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');
    } else {
      dateStr = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');
    }

    let firstName = "";
    if (storedFirstName) {
      firstName = storedFirstName;
    } else if (email) {
      const part = email.split("@")[0];
      const subPart = part.split(/[._-]/)[0];
      firstName = subPart.charAt(0).toUpperCase() + subPart.slice(1);
    }

    return {
      name: firstName || (lang === 'fr' ? "Non renseigné" : "Not specified"),
      age: age ? `${age} ${lang === 'fr' ? 'ans' : 'y/o'}` : (lang === 'fr' ? "Non renseigné" : "Not specified"),
      date: dateStr
    };
  }, [lang]);

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
      <div className="mobile-padding" style={{
        maxWidth: 680, margin: "0 auto", position: "relative",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16
      }}>
        <div>
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

        {/* Dossier Card Panel */}
        <div style={{
          background: "rgba(255, 255, 255, 0.45)",
          border: "1px solid rgba(168, 116, 73, 0.12)",
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontSize: 11,
          fontFamily: "'DM Sans', sans-serif",
          color: "#8C7A6B",
          minWidth: 150,
          boxShadow: "0 4px 12px rgba(168, 116, 73, 0.02)",
        }}>
          <div style={{ display: "flex", gap: 2, flexDirection: "column" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#B0885E", textTransform: "uppercase" }}>
              {lang === 'fr' ? "Prénom" : "First Name"}
            </span>
            <span style={{ fontWeight: 600, color: "#3A2E26" }}>{dossier.name}</span>
          </div>
          <div style={{ display: "flex", gap: 2, flexDirection: "column", borderTop: "1px solid rgba(168, 116, 73, 0.08)", paddingTop: 4 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", color: "#B0885E", textTransform: "uppercase" }}>
              {lang === 'fr' ? "Date du diagnostic" : "Diagnosis Date"}
            </span>
            <span style={{ fontWeight: 500, fontSize: 10.5, color: "#6F6156" }}>{dossier.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section heading helper ── */
function SectionHeading({ label, title }) {
  return (
    <div style={{ 
      marginBottom: 20, 
      borderBottom: "1px solid rgba(168, 116, 73, 0.08)", 
      paddingBottom: 10,
      display: "flex",
      flexDirection: "column",
      gap: 3
    }}>
      <span style={{ 
        fontSize: 8.5, 
        fontWeight: 700, 
        letterSpacing: "0.22em", 
        textTransform: "uppercase", 
        color: "#C9A961", 
        fontFamily: "'DM Sans', sans-serif" 
      }}>
        {label}
      </span>
      <h2 style={{ 
        margin: 0, 
        fontSize: 24, 
        fontWeight: 400, 
        fontFamily: "'Cormorant Garamond', serif", 
        letterSpacing: "0.01em",
        background: "linear-gradient(180deg, #2C241D 0%, #6B4828 40%, #A87449 100%)",
        WebkitBackgroundClip: "text", 
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        {title}
      </h2>
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
export default function BeautyReport({
  data: rawData,
  isPaid,
  onUnlock,
  analysesCount = 142,
  emailCaptured,
  setEmailCaptured,
  emailSkipped,
  setEmailSkipped,
  email,
  setEmail,
  firstName,
  setFirstName,
  emailLoading,
  setEmailLoading,
  newsletterConsent,
  setNewsletterConsent,
  handleEmailSubmit,
  handleEmailSkip
}) {
  const { lang, t } = useLang();
  const data = useMemo(() => sanitizeReport(rawData, lang), [rawData, lang]);
  const [unlocking, setUnlocking] = useState(false);
  const [previewTab, setPreviewTab] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [showAllFree, setShowAllFree] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sendEmailLoading, setSendEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [hasClickedCheckout, setHasClickedCheckout] = useState(false);

  const [activeStep, setActiveStep] = useState("all");
  const [onlyMyMatch, setOnlyMyMatch] = useState(false);
  const [activeConcern, setActiveConcern] = useState("all");

  const userSkinTypeNorm = useMemo(() => getNormalizedUserSkinType(data?.skinType), [data?.skinType]);
  const userConcerns = useMemo(() => data ? getUserConcernsList(data) : [], [data]);

  // Derive catalog and routine data here (before any early return) to respect Rules of Hooks
  const catalogProducts = useMemo(() => {
    if (!data) return [];
    const paid = data.paid_version || {};
    const freeData = data.free_version || {};
    return data.catalog || paid.productRecommendations || freeData.productRecommendations || [];
  }, [data]);

  const routineData = useMemo(() => {
    if (!data) return {};
    const paid = data.paid_version || {};
    return paid.routine || {};
  }, [data]);

  const routineWithProducts = useMemo(() => {
    if (!routineData || Object.keys(routineData).length === 0) return { morning: [], evening: [], weekly: [] };
    const alreadySelectedIds = [];
    
    const stepsInCatalog = (catalogProducts || []).map(p => (p.routineStep || p.routine_step || '').toLowerCase().trim());
    const hasMask = stepsInCatalog.includes('mask');

    const mapSteps = (stepsList, timeOfDay, isWeekly = false) => {
      console.log('[FRONTEND MAP] === RECEIVED STEPS ===');
      if (stepsList && Array.isArray(stepsList)) {
        stepsList.forEach((step, i) => {
          console.log(`[FRONTEND MAP] Step ${i}:`, step?.productName || step?.product_name || step);
          console.log(`[FRONTEND MAP]   step.productData:`, step?.productData);
          console.log(`[FRONTEND MAP]   image URL value:`, step?.productData?.product_image_url);
        });
      }
      if (!stepsList || !Array.isArray(stepsList)) return [];
      
      const mapped = stepsList.map((stepText, idx) => {
        const isObj = typeof stepText === 'object' && stepText !== null;
        const text = isObj ? (stepText.stepText || stepText.text || '') : (stepText || '');
        const id = isObj ? (stepText.productId || stepText.product_id) : null;

        let matched = null;

        // PRIORITY: use the server-embedded productData if available.
        // This carries the exact product the server chose (with dedup applied)
        // AND the correct image URL from Supabase, bypassing all re-lookup ambiguity.
        if (isObj && stepText.productData) {
          matched = stepText.productData;
        } else if (id) {
          // Fallback: resolve by ID from catalog (old reports without productData)
          matched = catalogProducts.find(p => p.id === id);
        }
        if (!matched && text) {
          matched = findMatchingProduct(text, catalogProducts, userSkinTypeNorm, userConcerns, alreadySelectedIds);
        }
        if (matched) alreadySelectedIds.push(matched.id);

        let requiredActives = [];
        if (isWeekly) {
          requiredActives = ['bha', 'aha', 'salicylic_acid', 'glycolic_acid'];
        } else if (timeOfDay === 'morning' && idx === 1) {
          requiredActives = getRelevantActivesForConcerns(userConcerns, 'morning');
        } else if (timeOfDay === 'evening' && idx === 2) {
          requiredActives = getRelevantActivesForConcerns(userConcerns, 'evening');
        }

        return { text, product: matched, requiredActives };
      });

      if (isWeekly && mapped.length === 0 && userConcerns) {
        const hasAcneOrPores = userConcerns.includes('acne') || userConcerns.includes('pores');
        if (hasAcneOrPores && !hasMask) {
          mapped.push({
            text: lang === 'fr' 
              ? "Masque purifiant à l'argile 1x/semaine (à ajouter manuellement à votre routine, pas encore dans notre catalogue)" 
              : "Purifying clay mask 1x/week (add manually to your routine, not yet in our catalog)",
            product: null,
            requiredActives: []
          });
        }
      }
      
      return mapped;
    };
    
    return {
      morning: mapSteps(routineData.morning, 'morning'),
      evening: mapSteps(routineData.evening, 'evening'),
      weekly: mapSteps(routineData.weekly, 'weekly', true)
    };
  }, [routineData, catalogProducts, userSkinTypeNorm, userConcerns, lang]);

const mapUiStepToDb = (uiStep) => {
  switch (uiStep) {
    case 'cleanser': return ['cleanser', 'oil_cleanser'];
    case 'toner': return ['toner', 'exfoliant'];
    case 'serum': return ['serum'];
    case 'moisturizer': return ['moisturizer'];
    case 'sunscreen': return ['spf'];
    case 'mask': return ['mask', 'treatment'];
    case 'eye': return ['eye'];
    default: return [];
  }
};

const mapUiConcernToDb = (uiConcern) => {
  switch (uiConcern) {
    case 'acne': return ['acne'];
    case 'pores': return ['pores', 'blackheads'];
    case 'dryness': return ['dehydration', 'dryness'];
    case 'radiance': return ['dullness', 'radiance'];
    case 'dark_spots': return ['hypertension', 'hyperpigmentation', 'dark_spots'];
    case 'dark_circles': return ['dark_circles'];
    case 'redness': return ['redness', 'sensitivity'];
    case 'aging': return ['aging'];
    case 'texture': return ['texture'];
    default: return [];
  }
};

  const sortedAndFilteredProducts = useMemo(() => {
    // Always prefer the Supabase catalog (data.catalog) over static fallback
    const rawCatalog = (data?.catalog && Array.isArray(data.catalog) && data.catalog.length > 0)
      ? data.catalog
      : STATIC_PRODUCTS;

    return rawCatalog.map(p => {
      const pSkinTypes = p.skinTypes || p.skin_types || [];
      const pConcerns = getNormalizedConcerns(p.concerns || (p.skin_problem ? [p.skin_problem] : []));
      const pRoutineStep = (p.routineStep || p.routine_step || "").toLowerCase().trim();

      const matchesSkinType = pSkinTypes.includes(userSkinTypeNorm);
      const matchesConcern = pConcerns.some(c => (userConcerns || []).includes(c));
      const isPerfectMatch = matchesSkinType && matchesConcern;
      
      let score = 0;
      if (isPerfectMatch) score = 3;
      else if (matchesConcern) score = 2;
      else if (matchesSkinType) score = 1;

      return {
        ...p,
        skinTypes: pSkinTypes,
        concerns: pConcerns,
        routineStep: pRoutineStep,
        matchesSkinType,
        matchesConcern,
        isPerfectMatch,
        relevanceScore: score
      };
    })
    .filter(p => {
      if (activeStep !== "all") {
        const allowedSteps = mapUiStepToDb(activeStep);
        if (allowedSteps.length > 0 && !allowedSteps.includes(p.routineStep)) {
          return false;
        }
      }
      if (activeConcern !== "all") {
        const allowedConcerns = mapUiConcernToDb(activeConcern);
        if (allowedConcerns.length > 0) {
          const hasMatch = p.concerns.some(c => allowedConcerns.includes(c));
          if (!hasMatch) return false;
        }
      }
      if (onlyMyMatch) {
        return p.matchesSkinType || p.matchesConcern;
      }
      return true;
    })
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      const ratingB = b.rating || 4.5;
      const ratingA = a.rating || 4.5;
      return ratingB - ratingA;
    });
  }, [activeStep, activeConcern, onlyMyMatch, userSkinTypeNorm, userConcerns, data?.catalog]);

  // Social Proof Counter
  const [socialProofN, setSocialProofN] = useState(() => {
    // Force a low starting value for the social proof counter
    return 200;
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

  useEffect(() => {
    if (data) {
      const sent = sessionStorage.getItem('rms_sent_score_viewed');
      if (!sent) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'score_viewed', {
            event_category: 'conversion_funnel',
            event_label: 'free_score_displayed'
          });
          sessionStorage.setItem('rms_sent_score_viewed', 'true');
        }
      }
    }
  }, [data]);

  useEffect(() => {
    if (data && !isPaid && !emailCaptured && !emailSkipped) {
      const sent = sessionStorage.getItem('rms_sent_email_save_shown');
      if (!sent) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'email_save_shown', {
            event_category: 'conversion_funnel',
            event_label: 'soft_email_gate'
          });
          sessionStorage.setItem('rms_sent_email_save_shown', 'true');
        }
      }
    }
  }, [data, isPaid, emailCaptured, emailSkipped]);

  useEffect(() => {
    if (data && !isPaid && (emailCaptured || emailSkipped)) {
      const sent = sessionStorage.getItem('rms_sent_paywall_viewed');
      if (!sent) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'paywall_viewed', {
            event_category: 'conversion_funnel',
            event_label: 'free_report_paywall'
          });
          sessionStorage.setItem('rms_sent_paywall_viewed', 'true');
        }
      }
    }
  }, [data, isPaid, emailCaptured, emailSkipped]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasClickedCheckout && !isPaid) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'checkout_abandoned', {
            event_category: 'conversion_funnel',
            event_label: 'after_checkout_click'
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasClickedCheckout, isPaid]);

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
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const reportId = typeof window !== 'undefined' ? sessionStorage.getItem('rms_analysis_id') : null;
      
      // Save latest report details to sessionStorage for dev environment test fallback
      sessionStorage.setItem('rms_latest_report', JSON.stringify(data));

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId, reportData: data, lang, isPaid }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = lang === 'fr' ? 'analyse-de-peau-rate-my-skin.pdf' : 'rate-my-skin-report.pdf';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('[PDF] Error generating PDF:', error);
      // Show user-facing error
      const msg = lang === 'fr'
        ? 'Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.'
        : 'An error occurred while generating the PDF. Please try again.';
      alert(msg);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (sendEmailLoading) return;
    setSendEmailLoading(true);
    setEmailStatus(null);
    try {
      const reportId = typeof window !== 'undefined' ? sessionStorage.getItem('rms_analysis_id') : null;
      
      if (!reportId) {
        throw new Error(lang === 'fr' 
          ? "Identifiant de rapport introuvable."
          : "Report ID not found.");
      }

      const response = await fetch('/api/send-email-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId, lang }),
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resData.error || (lang === 'fr' ? "Erreur lors de l'envoi" : "Sending error"));
      }

      setEmailStatus({
        type: 'success',
        text: resData.message || (lang === 'fr' 
          ? `Rapport envoyé à ${resData.email || 'votre adresse'}`
          : `Report sent to ${resData.email || 'your address'}`)
      });
    } catch (error) {
      console.error('[Email] Error sending PDF by email:', error);
      setEmailStatus({
        type: 'error',
        text: error.message || (lang === 'fr'
          ? "Une erreur est survenue lors de l'envoi de l'email."
          : "An error occurred while sending the email.")
      });
    } finally {
      setSendEmailLoading(false);
    }
  };

  // Early return after ALL hooks — safe here since all useMemo/useState are above
  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "#B9AC9E", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{t('generatingReport')}</p>
      </div>
    );
  }

  const { overall, summary, faceShape, skinType, skinTone } = data;

  const getDynamicHeadline = () => {
    const score = overall || 0;
    if (score < 60) {
      return lang === 'fr'
        ? "Votre peau a un potentiel de progression important. Voici votre plan pour atteindre 80+ en 8 semaines."
        : "Your skin has significant potential for progress. Here is your plan to reach 80+ in 8 weeks.";
    } else if (score >= 60 && score <= 79) {
      return lang === 'fr'
        ? "Votre peau est sur la bonne voie. Voici comment franchir le prochain palier."
        : "Your skin is on the right track. Here is how to cross the next threshold.";
    } else {
      return lang === 'fr'
        ? "Votre peau est déjà belle. Voici comment la maintenir au sommet."
        : "Your skin is already beautiful. Here is how to keep it at the top.";
    }
  };

  const getDynamicSubheadline = () => {
    const concerns = mainProblems.map(p => p.title).filter(Boolean);
    if (concerns.length >= 2) {
      return lang === 'fr'
        ? `Causes identifiées pour ${concerns[0].toLowerCase()} et ${concerns[1].toLowerCase()}, routine sur-mesure matin & soir, produits adaptés à votre budget, et plan de progression semaine par semaine.`
        : `Identified causes for ${concerns[0].toLowerCase()} and ${concerns[1].toLowerCase()}, custom morning & evening routine, budget-matched products, and a week-by-week progress plan.`;
    } else if (concerns.length === 1) {
      return lang === 'fr'
        ? `Causes identifiées pour ${concerns[0].toLowerCase()}, routine sur-mesure matin & soir, produits adaptés à votre budget, et plan de progression semaine par semaine.`
        : `Identified causes for ${concerns[0].toLowerCase()}, custom morning & evening routine, budget-matched products, and a week-by-week progress plan.`;
    } else {
      return lang === 'fr'
        ? "Rapport complet prêt à débloquer — causes identifiées, routine sur-mesure matin & soir, produits adaptés à votre budget et plan de progression semaine par semaine."
        : "Your full report is ready to unlock — root causes identified, personalised AM & PM routine, budget-matched products and a week-by-week progression plan.";
    }
  };

  const handleUnlock = async (planId) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'checkout_clicked', {
        event_category: 'conversion_funnel',
        event_label: 'paywall_cta',
        value: 7.99
      });
    }
    setHasClickedCheckout(true);
    setUnlocking(true);
    try { await onUnlock(planId); } finally { setUnlocking(false); }
  };

  const freeData = data.free_version || {};
  const mainProblems = freeData.mainProblems || [];
  const basicSummary = freeData.basicSummary || summary || "";
  const paid = data.paid_version || {};
  const routine = paid.routine || {};

  const displayMetrics = paid.metrics || [];
  const displayStrengths = paid.strengths || [];
  const displayImprovements = paid.improvements || [];
  const displayProducts = paid.productRecommendations || [];
  const allProducts = (freeData.productRecommendations || paid.productRecommendations || []).slice(0, 3);


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
      <ReportHeader t={t} lang={lang} />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 0" }}>

        {/* ── Score hero ── */}
        <ScoreHeroCard
          score={overall}
          summary={basicSummary}
          faceShape={faceShape} skinType={skinType} skinTone={skinTone}
          badge={isPaid ? null : t("freeReportLabel")}
          t={t} lang={lang}
          onShare={handleShare}
          sharing={sharing}
          shareMsg={shareMsg}
        />

        <MedicalDisclaimer style={{ marginTop: 16 }} />
      </div>

      {!isPaid && !emailCaptured && !emailSkipped ? (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
          <EmailSaveCard
            lang={lang}
            t={t}
            email={email}
            setEmail={setEmail}
            firstName={firstName}
            setFirstName={setFirstName}
            emailLoading={emailLoading}
            newsletterConsent={newsletterConsent}
            setNewsletterConsent={setNewsletterConsent}
            handleEmailSubmit={handleEmailSubmit}
            handleEmailSkip={handleEmailSkip}
          />
        </div>
      ) : (
        <>
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
            {/* ── Main problems ── */}
            {!isPaid && mainProblems.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <SectionHeading label={t('mainProblemsHeading')} title={t('areasToAddress')} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {mainProblems.map((problem, i) => {
                    if (i > 0 && !showAllFree) return null;
                    return (
                      <div key={i} style={{ ...CARD, padding: "0", display: "flex", overflow: "hidden" }}>
                        <div style={{ width: 4, background: SEVERITY_ACCENT[problem.severity] || "#D1D5DB", flexShrink: 0 }} />
                        <div style={{ padding: "18px 20px", flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <SeverityBadge severity={problem.severity} t={t} />
                          </div>
                          <div style={{ fontSize: "20px", fontWeight: "700", color: "#2C2416", marginBottom: 6, fontFamily: "'Playfair Display', serif", lineHeight: 1.3 }}>{problem.title}</div>
                          <p style={{ margin: 0, fontSize: "16px", lineHeight: "1.55", color: "#2C2416", fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{problem.description}</p>
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
            {!isPaid && allProducts.length > 0 && (
              <div style={{ marginTop: 48 }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14, gap: 8 }}>
                  <SectionHeading label={t('shopSubtitle')} title={t('shopTitle')} />
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8B6914", background: "rgba(197,160,40,0.1)", border: "1px solid rgba(197,160,40,0.28)", borderRadius: 20, padding: "4px 12px", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
                    {t('freeIncluded')}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
        <div style={{ maxWidth: 680, margin: "48px auto 0", padding: "0 20px" }}>
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
                  ? `${analysesCount} femmes ont noté leur peau cette semaine` 
                  : `${analysesCount} women rated their skin this week`}
              </span>
            </div>

            {/* 3. COPY HOOK */}
            <h1 className="paywall-title">
              {getDynamicHeadline()}
            </h1>
            <p className="paywall-subtitle">
              {getDynamicSubheadline()}
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
              <div className="grid-cell" style={{ position: "relative" }}>
                <div className="cell-icon-container">
                  {CUSTOM_PAYWALL_ICONS.pdf}
                </div>
                <div className="cell-text-block">
                  <span className="cell-text">{lang === 'fr' ? 'Rapport PDF premium' : 'Premium PDF Report'}</span>
                  <span className="cell-subtext">{lang === 'fr' ? 'Document élégant de 5 pages à conserver, imprimer ou consulter à vie' : 'Elegant 5-page document to keep, print or access for life'}</span>
                </div>
                <span className="badge-gold">{lang === 'fr' ? 'OFFERT' : 'FREE'}</span>
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
            {/* Testimonial Quote Card */}
            <div style={{
              margin: "24px auto 0",
              padding: "16px 20px",
              borderRadius: "14px",
              backgroundColor: "#FDF9F4",
              borderLeft: "3px solid #C9A961",
              maxWidth: "480px",
              textAlign: "left",
              boxShadow: "0 4px 12px rgba(44, 36, 22, 0.03)",
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "15px",
                fontStyle: "italic",
                lineHeight: 1.5,
                color: "#2C2416",
                margin: "0 0 8px"
              }}>
                {lang === 'fr'
                  ? "« J'ai enfin compris ce dont ma peau avait vraiment besoin. La routine est claire et adaptée à mon budget. »"
                  : "\"I finally understood what my skin actually needed. The routine is clear and fits my budget.\""}
              </p>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{
                  fontSize: "11px",
                  color: "#9B9286",
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif"
                }}>
                  — Sarah M., 34 ans
                </span>
                <span style={{
                  color: "#C9A961",
                  fontSize: "11px",
                  letterSpacing: "1px"
                }}>
                  ★★★★★
                </span>
              </div>
            </div>

            {/* Value comparison */}
            <div style={{
              margin: "20px auto 16px",
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(44, 36, 22, 0.03)",
              border: "1px dashed rgba(201, 169, 97, 0.2)",
              maxWidth: "480px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              lineHeight: 1.6,
              color: "#6F6156"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>{lang === 'fr' ? "Consultation dermatologique moyenne :" : "Average dermatological consultation:"}</span>
                <span style={{ textDecoration: "line-through", color: "#A89484", fontWeight: 500 }}>40€ - 60€</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span style={{ color: "#2C2416" }}>{lang === 'fr' ? "Votre analyse complète personnalisée :" : "Your personalized complete analysis:"}</span>
                <span style={{ color: "#C9A961" }}>7,99€</span>
              </div>
            </div>

            {/* 5. CTA BUTTON */}
            <button 
              onClick={() => handleUnlock("single")} 
              disabled={unlocking} 
              className="cta-button"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 24px",
                width: "100%",
                height: "auto",
                gap: 2,
                border: "none",
                cursor: "pointer"
              }}
            >
              {unlocking ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#ffffff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite"
                  }} />
                  <span style={{ fontSize: "14px", fontWeight: 700 }}>{t('redirecting')}</span>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "0.03em" }}>
                    {lang === 'fr' ? "OBTENIR MA ROUTINE PERSONNALISÉE" : "GET MY CUSTOM ROUTINE"}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.9, marginTop: 1 }}>
                    {lang === 'fr' 
                      ? "Paiement unique de 7,99€ • Accès immédiat" 
                      : "One-time payment of €7.99 • Instant access"}
                  </span>
                </>
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


      {/* ── Tab navigation: sticky bottom bar on mobile, pill row on desktop ── */}
      <style>{`
        @media (max-width: 640px) {
          .rpt-tabs-desktop { display: ${isPaid ? 'none' : 'block'} !important; }
          .rpt-tabs-mobile { display: ${isPaid ? 'flex' : 'none'} !important; }
        }
        @media (min-width: 641px) {
          .rpt-tabs-desktop { display: block !important; }
          .rpt-tabs-mobile { display: none !important; }
        }
      `}</style>

      {/* Desktop: scrollable pill row */}
      <div className="rpt-tabs-desktop" style={{ maxWidth: 680, margin: "24px auto 0", padding: "0 20px" }}>
        {!isPaid && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{ 
              fontSize: 8.5, 
              fontWeight: 700, 
              letterSpacing: "0.22em", 
              textTransform: "uppercase", 
              color: "#C9A961", 
              fontFamily: "'DM Sans', sans-serif" 
            }}>
              {lang === 'fr' ? 'Version gratuite' : 'Free Preview'}
            </span>
            <h2 style={{ 
              margin: "4px 0 0", 
              fontSize: 22, 
              fontWeight: 400, 
              fontFamily: "'Cormorant Garamond', serif", 
              letterSpacing: "0.01em",
              background: "linear-gradient(180deg, #2C241D 0%, #6B4828 40%, #A87449 100%)",
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {lang === 'fr' ? 'Aperçu du rapport complet' : 'Full Report Preview'}
            </h2>
          </div>
        )}
        <div style={{
          display: "flex", justifyContent: "center", gap: 20, overflowX: "auto",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.65)",
          borderRadius: 14, padding: "6px 12px",
          boxShadow: "0 8px 32px rgba(168,116,73,0.03), inset 0 1px 1px rgba(255,255,255,0.8)",
          scrollbarWidth: "none"
        }}>
          {TABS_CONFIG.map((tab, i) => (
            <button key={i} onClick={() => setPreviewTab(i)} style={{
              flex: "0 0 auto",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 10px 14px",
              color: previewTab === i ? "#C9A961" : "#9E8A7A",
              transition: "all 0.2s ease",
              minWidth: 0,
              position: "relative"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tab.icon}
              </div>
              <span style={{
                fontSize: 8.5, fontWeight: previewTab === i ? 700 : 500,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden", textOverflow: "ellipsis",
                maxWidth: 76,
                lineHeight: 1.2,
                textAlign: "center"
              }}>
                {tab.short}
              </span>
              {previewTab === i && (
                <div style={{
                  position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
                  width: 32, height: 2, borderRadius: 2,
                  background: "linear-gradient(90deg, #C9A961, #A87449)",
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: sticky bottom navigation bar */}
      {isPaid && (
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
                padding: "6px 8px 12px",
                color: previewTab === i ? "#C9A961" : "#9E8A7A",
                transition: "all 0.2s ease",
                minWidth: 0, flex: 1,
                position: "relative",
              }}
            >
              {/* Icon with active indicator dot */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tab.icon}
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
              {previewTab === i && (
                <div style={{
                  position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
                  width: 24, height: 2, borderRadius: 2,
                  background: "linear-gradient(90deg, #C9A961, #A87449)",
                }} />
              )}
            </button>
          ))}
        </div>
      )}

      <div style={{
        maxWidth: 680,
        margin: "10px auto 0",
        padding: "0 20px 100px",
        filter: isPaid ? "none" : "blur(5px)",
        opacity: isPaid ? 1 : 0.3,
        pointerEvents: isPaid ? "auto" : "none",
        userSelect: isPaid ? "auto" : "none"
      }}>
        <SectionHeading 
          label={lang === 'fr' ? 'Rapport détaillé' : 'Detailed Report'} 
          title={TABS_CONFIG[previewTab].label} 
        />
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
                <div><div style={{ fontSize: "16px", fontWeight: "700", color: "#2C2416", marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>{s.title}</div><p style={{ margin: 0, fontSize: "13px", lineHeight: "1.55", color: "#2C2416", fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{s.desc}</p></div>
              </div>
            ))}
          </div>
        )}
        {previewTab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayImprovements.map((item, i) => (
              <div key={i} style={{ ...CARD, padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(212,165,116,0.12)", border: "1px solid rgba(212,165,116,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 600, color: GOLD, fontFamily: "'Cormorant Garamond', serif" }}>{i + 1}</div>
                <div><div style={{ fontSize: "16px", fontWeight: "700", color: "#2C2416", marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>{item.title}</div><p style={{ margin: 0, fontSize: "13px", lineHeight: "1.55", color: "#2C2416", fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{item.desc}</p></div>
              </div>
            ))}
          </div>
        )}
        {previewTab === 3 && (
          (routineWithProducts.morning || []).length === 0 && (routineWithProducts.evening || []).length === 0 && (routineWithProducts.weekly || []).length === 0 ? (
            <div style={{ ...CARD, padding: "20px", textAlign: "center", color: "#8C7A6B" }}>
              {t('routineUnavailable')}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(routineWithProducts.morning || []).length > 0 && (
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
                    {(routineWithProducts.morning || []).map((stepItem, idx) => {
                      const step = stepItem.text;
                      const matchedProduct = stepItem.product;
                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, minWidth: 16 }}>{idx + 1}.</span>
                            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#6F6156" }}>{step}</p>
                          </div>
                          {matchedProduct && (
                            <div style={{ marginLeft: 24, marginTop: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A961" }}>✦</span>
                                <span style={{ fontSize: 10, color: "#8C7A6B", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>
                                  {lang === 'fr' ? "Produit conseillé pour cette étape" : "Suggested for this step"}
                                </span>
                              </div>
                              <ProductCard product={matchedProduct} lang={lang} t={t} userSkinType={skinType} userConcerns={userConcerns} requiredActives={stepItem.requiredActives} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(routineWithProducts.evening || []).length > 0 && (
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
                    {(routineWithProducts.evening || []).map((stepItem, idx) => {
                      const step = stepItem.text;
                      const matchedProduct = stepItem.product;
                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, minWidth: 16 }}>{idx + 1}.</span>
                            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#6F6156" }}>{step}</p>
                          </div>
                          {matchedProduct && (
                            <div style={{ marginLeft: 24, marginTop: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A961" }}>✦</span>
                                <span style={{ fontSize: 10, color: "#8C7A6B", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>
                                  {lang === 'fr' ? "Produit conseillé pour cette étape" : "Suggested for this step"}
                                </span>
                              </div>
                              <ProductCard product={matchedProduct} lang={lang} t={t} userSkinType={skinType} userConcerns={userConcerns} requiredActives={stepItem.requiredActives} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(routineWithProducts.weekly || []).length > 0 && (
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
                    {(routineWithProducts.weekly || []).map((stepItem, idx) => {
                      const step = stepItem.text;
                      const matchedProduct = stepItem.product;
                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, minWidth: 16 }}>{idx + 1}.</span>
                            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#6F6156" }}>{step}</p>
                          </div>
                          {matchedProduct && (
                            <div style={{ marginLeft: 24, marginTop: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A961" }}>✦</span>
                                <span style={{ fontSize: 10, color: "#8C7A6B", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>
                                  {lang === 'fr' ? "Produit conseillé pour cette étape" : "Suggested for this step"}
                                </span>
                              </div>
                              <ProductCard product={matchedProduct} lang={lang} t={t} userSkinType={skinType} userConcerns={userConcerns} requiredActives={stepItem.requiredActives} />
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
        )}
        {previewTab === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Header Banner - Luxury Apothecary Introduction */}
            <div style={{
              ...CARD,
              padding: "24px",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(253, 246, 237, 0.65) 50%, rgba(201, 169, 97, 0.05) 100%)",
              border: "1px solid rgba(201, 169, 97, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}>
              <div>
                <h3 style={{
                  margin: "0 0 8px",
                  fontSize: 20,
                  fontWeight: 300,
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#3A2E26",
                  letterSpacing: "0.02em"
                }}>
                  {lang === 'fr' ? "Votre Boutique Beauté sur Mesure" : "Your Personal Skincare Selection"}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#6F6156",
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  {lang === 'fr' 
                    ? "Chaque produit présenté ici a été sélectionné en tenant compte de votre type de peau et de vos préoccupations spécifiques. Cliquez sur vos matchs idéaux en premier — ce sont vos alliés prioritaires."
                    : "Every product below was chosen with your unique skin profile in mind. Start with your perfect matches — they're your skin's best allies right now."}
                </p>
              </div>

              {/* Profile Summary Badges inside shop */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.45)",
                border: "1px solid rgba(168, 116, 73, 0.1)",
                borderRadius: 12
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 8.5, fontWeight: 700, color: "#B0885E", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {lang === 'fr' ? "Votre type de peau :" : "Your skin type:"}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#3A2E26", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "#5CA18B" }}>✓</span> {getSkinTypeLabel(userSkinTypeNorm, lang)}
                  </span>
                </div>
                {userConcerns.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, borderLeft: "1px solid rgba(168, 116, 73, 0.12)", paddingLeft: 12 }}>
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: "#B0885E", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {lang === 'fr' ? "Vos cibles d'action :" : "Your concerns targeted:"}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#3A2E26", display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {userConcerns.map((c, idx) => (
                        <span key={idx} style={{ 
                          fontSize: 10.5, 
                          background: "rgba(232,184,212,0.18)", 
                          color: "#B67C9D", 
                          padding: "1px 6px", 
                          borderRadius: 4,
                          border: "1px solid rgba(232,184,212,0.3)"
                        }}>
                          {getConcernLabel(c, lang)}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </div>

              {/* Match System Explanation Legend */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 8,
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                color: "#8C7A6B",
                borderTop: "1px solid rgba(168, 116, 73, 0.08)",
                paddingTop: 12
              }}>
                <span style={{ fontWeight: 700, color: "#3A2E26", textTransform: "uppercase", fontSize: 9, letterSpacing: "0.05em", marginBottom: 2 }}>
                  {lang === 'fr' ? "Légende de recommandation :" : "Recommendation Legend:"}
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ background: "linear-gradient(135deg, #C9A961 0%, #E5C583 100%)", color: "white", padding: "1px 6px", borderRadius: 4, fontSize: 8.5, fontWeight: 700 }}>Match Parfait</span>
                    <span>{lang === 'fr' ? "Convient à votre peau ET cible vos préoccupations." : "Fits skin type AND targets active concerns."}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ background: "rgba(168,220,200,0.18)", border: "1px solid rgba(168,220,200,0.45)", color: "#5CA18B", padding: "1px 6px", borderRadius: 4, fontSize: 8.5, fontWeight: 700 }}>✓ Peau {getSkinTypeLabel(userSkinTypeNorm, lang)}</span>
                    <span>{lang === 'fr' ? "Adapté à votre type de peau." : "Formulated for your skin type."}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ background: "rgba(232,184,212,0.18)", border: "1px solid rgba(232,184,212,0.45)", color: "#B67C9D", padding: "1px 6px", borderRadius: 4, fontSize: 8.5, fontWeight: 700 }}>✦ Ciblé</span>
                    <span>{lang === 'fr' ? "Cible une de vos préoccupations actives." : "Directly targets one of your skin concerns."}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Section: Priority AI Recommendations (Top 3) */}
            {displayProducts.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: GOLD, fontSize: 16 }}>✨</span>
                  <h4 style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#3A2E26",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em"
                  }}>
                    {lang === 'fr' ? "Votre Sélection Sur-Mesure" : "Your Custom Selection"}
                  </h4>
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 18, color: "#2C2416", lineHeight: 1.5, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
                  {lang === 'fr' 
                    ? "Ces produits correspondent à la fois à votre type de peau et à vos préoccupations actives. Ils forment la base de votre routine idéale :"
                    : "These products match both your skin type and your active concerns. They form the core of your ideal daily routine:"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {displayProducts.map((p, i) => (
                    <ProductCard
                      key={`priority-${i}`}
                      product={p}
                      lang={lang}
                      t={t}
                      userSkinType={skinType}
                      userConcerns={userConcerns}
                      isPriorityRecommendation={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section: Complete Apothecary Catalog (Remaining Products with filters) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid rgba(168, 116, 73, 0.08)", paddingTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h4 style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#3A2E26",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em"
                  }}>
                    {lang === 'fr' ? "Explorez le catalogue complet" : "Explore the Full Catalog"}
                  </h4>
                  <p style={{ margin: "4px 0 0", fontSize: 18, color: "#2C2416", lineHeight: 1.5, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
                    {lang === 'fr' 
                      ? "Tous nos produits sélectionnés, triés par pertinence pour votre peau."
                      : "All our curated products, sorted by relevance to your skin."}
                  </p>
                </div>

                {/* Profile match quick toggle */}
                <label style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#3A2E26",
                  fontWeight: 600,
                  userSelect: "none",
                  padding: "6px 12px",
                  background: onlyMyMatch ? "rgba(201, 169, 97, 0.1)" : "rgba(168,116,73,0.04)",
                  border: onlyMyMatch ? "1px solid rgba(201, 169, 97, 0.35)" : "1px solid rgba(168, 116, 73, 0.12)",
                  borderRadius: 10,
                  transition: "all 0.3s ease"
                }}>
                  <input
                    type="checkbox"
                    checked={onlyMyMatch}
                    onChange={(e) => setOnlyMyMatch(e.target.checked)}
                    style={{
                      cursor: "pointer",
                      accentColor: GOLD
                    }}
                  />
                  <span>
                    {lang === 'fr' ? "Matches Idéaux Uniquement" : "My Matches Only"}
                  </span>
                </label>
              </div>

              {/* Filters Box */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: 16,
                background: "rgba(255, 255, 255, 0.4)",
                border: "1px solid rgba(168, 116, 73, 0.1)",
                borderRadius: 16
              }}>
                {/* 1. Skincare Step Filters (Pills) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: "#B0885E", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {lang === 'fr' ? "Filtrer par étape :" : "Filter by Step:"}
                  </span>
                  <div className="rpt-tabs" style={{
                    display: "flex",
                    gap: 6,
                    overflowX: "auto",
                    paddingBottom: 4,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                  }}>
                    {[
                      { key: "all", fr: "Tout", en: "All" },
                      { key: "cleanser", fr: "Nettoyants", en: "Cleansers" },
                      { key: "toner", fr: "Lotions & Toniques", en: "Toners" },
                      { key: "serum", fr: "Sérums", en: "Serums" },
                      { key: "moisturizer", fr: "Crèmes", en: "Moisturizers" },
                      { key: "sunscreen", fr: "Solaire SPF", en: "Sunscreen" },
                      { key: "mask", fr: "Masques & Soins", en: "Masks" },
                      { key: "eye", fr: "Contour des yeux", en: "Eye Care" }
                    ].map(step => (
                      <button
                        key={step.key}
                        onClick={() => setActiveStep(step.key)}
                        style={{
                          flexShrink: 0,
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: activeStep === step.key ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                          background: activeStep === step.key ? "linear-gradient(135deg, #3D2914 0%, #281B0D 100%)" : "rgba(255, 255, 255, 0.75)",
                          color: activeStep === step.key ? "#FFFDF9" : "#6F6156",
                          border: activeStep === step.key ? "1px solid #3D2914" : "1px solid rgba(168,116,73,0.15)",
                          boxShadow: activeStep === step.key ? "0 2px 6px rgba(61,41,20,0.15)" : "none"
                        }}
                      >
                        {lang === 'fr' ? step.fr : step.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Skin Concern Filters (Pills) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px dashed rgba(168, 116, 73, 0.12)", paddingTop: 10 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: "#B0885E", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {lang === 'fr' ? "Filtrer par cible dermatologique :" : "Filter by Skin Concern:"}
                  </span>
                  <div style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap"
                  }}>
                    {[
                      { key: "all", fr: "Tous Problèmes", en: "All Concerns" },
                      { key: "acne", fr: "Acné & Boutons", en: "Acne" },
                      { key: "pores", fr: "Pores dilatés", en: "Pores" },
                      { key: "dryness", fr: "Déshydratation / Sècheresse", en: "Dehydration" },
                      { key: "radiance", fr: "Teint Terne / Éclat", en: "Radiance / Dullness" },
                      { key: "dark_spots", fr: "Taches / Hyper-pigmentation", en: "Dark Spots" },
                      { key: "dark_circles", fr: "Cernes & Poches", en: "Dark Circles" },
                      { key: "redness", fr: "Rougeurs & Réactivité", en: "Redness" },
                      { key: "aging", fr: "Rides / Signes de l'âge", en: "Aging / Wrinkles" },
                      { key: "texture", fr: "Texture / Grain de peau", en: "Texture" }
                    ].map(concern => (
                      <button
                        key={concern.key}
                        onClick={() => setActiveConcern(concern.key)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 8,
                          fontSize: 10.5,
                          fontWeight: activeConcern === concern.key ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                          background: activeConcern === concern.key ? "linear-gradient(135deg, #B0885E 0%, #8C7A6B 100%)" : "rgba(255, 255, 255, 0.75)",
                          color: activeConcern === concern.key ? "#FFFDF9" : "#8C7A6B",
                          border: activeConcern === concern.key ? "1px solid #B0885E" : "1px solid rgba(168,116,73,0.12)",
                          boxShadow: activeConcern === concern.key ? "0 2px 6px rgba(176,136,94,0.12)" : "none"
                        }}
                      >
                        {lang === 'fr' ? concern.fr : concern.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid Catalog */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sortedAndFilteredProducts.filter(p => {
                  // Exclude the priority top 3 products to avoid duplicate display
                  const isPriority = displayProducts.some(dp => {
                    const dpName = (dp.productName || dp.product_name || "").toLowerCase();
                    const pName = (p.productName || p.product_name || "").toLowerCase();
                    return dpName === pName;
                  });
                  return !isPriority;
                }).length === 0 ? (
                  <div style={{
                    ...CARD,
                    padding: "32px",
                    textAlign: "center",
                    color: "#A0938A",
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    <p style={{ margin: 0, fontSize: 13 }}>
                      {lang === 'fr' 
                        ? "Aucun autre produit ne correspond à vos filtres actuels." 
                        : "No other products match your current filters."}
                    </p>
                    <button 
                      onClick={() => {
                        setActiveStep("all");
                        setActiveConcern("all");
                        setOnlyMyMatch(false);
                      }}
                      style={{
                        marginTop: 12,
                        background: "none",
                        border: "none",
                        color: GOLD,
                        fontWeight: 700,
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      {lang === 'fr' ? "Réinitialiser les filtres" : "Reset all filters"}
                    </button>
                  </div>
                ) : (
                  sortedAndFilteredProducts
                    .filter(p => {
                      // Exclude priority recommendations from the catalog list
                      const isPriority = displayProducts.some(dp => {
                        const dpName = (dp.productName || dp.product_name || "").toLowerCase();
                        const pName = (p.productName || p.product_name || "").toLowerCase();
                        return dpName === pName;
                      });
                      return !isPriority;
                    })
                    .map((p, i) => (
                      <ProductCard
                        key={`catalog-${i}`}
                        product={p}
                        lang={lang}
                        t={t}
                        userSkinType={skinType}
                        userConcerns={userConcerns}
                        isPriorityRecommendation={false}
                      />
                    ))
                )}
              </div>
            </div>
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
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#2C2416", marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>{item.title}</div>
                      <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.55", color: "#2C2416", fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{item.desc}</p>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* ── Box: Expectations of the new routine ── */}
            <div style={{
              ...CARD,
              padding: "24px",
              background: "linear-gradient(135deg, rgba(253, 246, 237, 0.9) 0%, rgba(246, 235, 222, 0.9) 100%)",
              border: "1px solid rgba(197, 160, 40, 0.25)",
              boxShadow: "0 10px 30px rgba(168,116,73,0.04)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C5A028" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#B0885E", fontFamily: "'DM Sans', sans-serif"
                }}>
                  {lang === 'fr' ? "Espérances de la nouvelle routine" : "Routine Expectations"}
                </span>
              </div>
              <h4 style={{
                margin: "0 0 4px", fontSize: 18, fontWeight: 600,
                color: "#3A2E26", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.3
              }}>
                {lang === 'fr' 
                  ? "Calendrier d'évolution & résultats réels" 
                  : "What to expect as your skin adapts?"}
              </h4>
              <p style={{
                margin: "0 0 16px", fontSize: 11, color: "#8C7A6B", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8C7A6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {lang === 'fr'
                  ? "Moyenne établie sur les résultats de 1 450+ utilisateurs après 8 semaines."
                  : "Based on self-assessment averages from 1,450+ users over 8 weeks."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { time: lang === 'fr' ? "1-3 jours" : "1-3 days", title: lang === 'fr' ? "Douceur & Éclat initial" : "Softness & Glow", desc: lang === 'fr' ? "Effet repulpant immédiat. Les agents hydratants ciblent la sécheresse superficielle. Votre teint paraît plus frais." : "Immediate plumping effect. Hydrating actives quench surface dehydration. Complexion looks fresher." },
                  { time: lang === 'fr' ? "2-4 semaines" : "2-4 weeks", title: lang === 'fr' ? "Régulation du sébum & Pureté" : "Sebum Balance & Clarity", desc: lang === 'fr' ? "Les actifs (acides doux) commencent à désincruster les pores. Diminution visible du sébum et des petites imperfections." : "Exfoliating actives start clearing congestion. Visible reduction in surface oils and minor breakouts." },
                  { time: lang === 'fr' ? "4-8 semaines" : "4-8 weeks", title: lang === 'fr' ? "Renouvellement & Teint unifié" : "Cellular Turnover & Tone", desc: lang === 'fr' ? "Cycle cellulaire complet de 28 jours. Les pores se resserrent, les taches et ridules s'atténuent." : "Full skin cell cycle completed. Dark spots fade, texture refines, and skin tone becomes more uniform." },
                  { time: lang === 'fr' ? "12+ semaines" : "12+ weeks", title: lang === 'fr' ? "Reconstruction durable" : "Long-term Resilience", desc: lang === 'fr' ? "La barrière cutanée est profondément réparée et renforcée contre les agressions externes et le vieillissement." : "The moisture barrier is deeply restored. Skin is resilient against external triggers and signs of aging are minimized." }
                ].map((phase, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{
                      fontSize: 9.5, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
                      background: "rgba(168,116,73,0.12)", color: "#8C7A6B", width: 78, textAlign: "center",
                      fontFamily: "'DM Sans', sans-serif", flexShrink: 0
                    }}>{phase.time}</span>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#2C241D", marginBottom: 2 }}>{phase.title}</div>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#6F6156" }}>{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Box: Graphical Funnel ── */}
            <div style={{
              ...CARD,
              padding: "24px 20px",
              background: "#FFFDF9",
            }}>
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#A87449", fontFamily: "'DM Sans', sans-serif"
                }}>
                  {lang === 'fr' ? "Courbe d'évolution" : "Skin Evolution Funnel"}
                </span>
                <h4 style={{
                  margin: "6px 0 0", fontSize: 19, fontWeight: 500,
                  color: "#3A2E26", fontFamily: "'Cormorant Garamond', serif"
                }}>
                  {lang === 'fr' ? "Entonnoir de transformation de la peau" : "Your 8-Week Transformation Funnel"}
                </h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { range: "S1 - S2", label: lang === 'fr' ? "Apaisement & Tolérance" : "Calming & Tolerance", desc: lang === 'fr' ? "Hydratation superficielle et réduction de l'inflammation de départ." : "Initial hydration boost and skin barrier calming.", width: "100%", percent: "100%", bg: "linear-gradient(90deg, #A87449 0%, #D4A574 100%)" },
                  { range: "S3 - S4", label: lang === 'fr' ? "Purification Active" : "Active Clarification", desc: lang === 'fr' ? "Désincrustation des pores, texture plus lisse et régulation séborrhéique." : "Exfoliating skin layers, refining pores and surface oils.", width: "85%", percent: "80%", bg: "linear-gradient(90deg, #B0855A 0%, #D8B085 100%)" },
                  { range: "S5 - S6", label: lang === 'fr' ? "Régénération & Éclat" : "Radiance & Repair", desc: lang === 'fr' ? "Atténuation des cernes et taches, accélération du renouvellement cellulaire." : "Fading under-eye shadows and spots, boosting skin cell turnover.", width: "70%", percent: "60%", bg: "linear-gradient(90deg, #C5A028 0%, #E6C868 100%)" },
                  { range: "S7 - S8", label: lang === 'fr' ? "Stabilisation & Éclat final" : "Stabilization & Peak Glow", desc: lang === 'fr' ? "Barrière protectrice scellée, texture équilibrée et éclat durable." : "Deeply sealed barrier, balanced hydration, and lasting glow.", width: "55%", percent: "40%", bg: "linear-gradient(90deg, #C59A28 0%, #DDB652 100%)" }
                ].map((phase, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: phase.width,
                      borderRadius: 14,
                      padding: "12px 16px",
                      background: phase.bg,
                      color: "#FFF",
                      boxShadow: "0 6px 16px rgba(168,116,73,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      minWidth: "260px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 700, background: "rgba(255,255,255,0.22)", padding: "3px 8px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" }}>
                          {phase.range}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            {phase.label}
                          </span>
                          <span style={{ fontSize: 10, opacity: 0.85, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, marginTop: 2, display: "none" }}>
                            {phase.desc}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", opacity: 0.9 }}>
                        {phase.percent}
                      </span>
                    </div>
                    {i < 3 && (
                      <div style={{
                        width: 0,
                        height: 0,
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: "6px solid #D4A574",
                        margin: "4px 0",
                        opacity: 0.6
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Week-by-Week timeline cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", marginTop: 8 }}>
              {paid.progression ? (
                <>
                  <div style={{ position: "absolute", left: 36, top: 20, bottom: 20, width: 2, background: "linear-gradient(180deg, rgba(201,169,97,0.4), rgba(201,169,97,0.05))", zIndex: 0 }} />
                  {paid.progression.map((step, i) => (
                    <div key={i} style={{ ...CARD, padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", position: "relative", zIndex: 1 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FFF", border: "2px solid #C9A961", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#A87449", flexShrink: 0, boxShadow: "0 4px 12px rgba(201,169,97,0.15)" }}>
                        {step.week}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2C2416", marginBottom: 2 }}>
                          {lang === 'fr' ? `Semaine ${step.week}` : `Week ${step.week}`}
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#2C2416", marginBottom: 4, fontFamily: "'Playfair Display', serif" }}>{step.title}</div>
                        <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.55", color: "#2C2416", fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ ...CARD, padding: "20px", textAlign: "center", color: "#2C2416", fontSize: 16, lineHeight: 1.5, fontWeight: 400 }}>
                  {lang === 'fr' ? 'Plan de progression non disponible pour ce rapport.' : 'Progression plan not available for this report.'}
                </div>
              )}
            </div>

            {/* ── Box: Motivation & Safety Disclaimer ── */}
            <div style={{
              ...CARD,
              padding: "22px 24px",
              marginTop: 12,
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(253, 246, 237, 0.5) 100%)",
              border: "1px solid rgba(168, 116, 73, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: 14
            }}>
              {/* Motivation Column */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A028" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A87449", fontFamily: "'DM Sans', sans-serif" }}>
                    {lang === 'fr' ? "Le secret de la constance" : "The Key to Consistency"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#6F6156" }}>
                  {lang === 'fr'
                    ? "La peau met environ 28 jours à se renouveler. Les premiers résultats profonds n'apparaissent qu'au bout de 4 à 6 semaines. Restez régulier(e) : la régularité des soins matin et soir est 10 fois plus efficace qu'un soin ponctuel très concentré. Prenez une photo chaque semaine pour suivre votre évolution."
                    : "Skin takes about 28 days to regenerate, and deep improvements emerge around weeks 4 to 6. Keep going: daily AM/PM consistency is 10 times more effective than occasional treatments. Snap a weekly photo to document your progress."}
                </p>
              </div>

              {/* Separator line */}
              <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,116,73,0.12), transparent)" }} />

              {/* Disclaimer Column */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9AC9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8C7A6B", fontFamily: "'DM Sans', sans-serif" }}>
                    {lang === 'fr' ? "Réactions inattendues & Purge" : "Unexpected Reactions & Purging"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "#8C7A6B" }}>
                  {lang === 'fr'
                    ? "Important : L'introduction d'actifs ciblés (comme le Rétinol ou les acides AHA/BHA) peut provoquer une 'purge cutanée' (poussée temporaire de petits boutons) pendant les 2 premières semaines. C'est normal. En revanche, en cas de rougeur persistante, brûlure ou irritation intense, espacez les applications à 1 soir sur 2 ou 3, ou cessez l'utilisation et consultez un professionnel."
                    : "Note: Introducing active ingredients (like Retinol or AHA/BHA exfoliants) can trigger a temporary 'purging' phase (a brief breakout period) during the first 2 weeks. This is normal. However, if persistent redness, burning, or severe irritation occurs, reduce application frequency (e.g., every 2 or 3 nights) or discontinue use and consult a professional."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PDF download card (paid only) ── */}
      {isPaid && (
        <div style={{ maxWidth: 680, margin: "32px auto 0", padding: "0 20px" }}>
          <div style={{
            background: "linear-gradient(to bottom, #F8F4ED 0%, #F0E7D8 100%)",
            border: "1px solid rgba(201, 169, 97, 0.1)",
            borderRadius: 24,
            padding: "44px 40px",
            boxShadow: "0 16px 40px rgba(44, 36, 22, 0.06), inset 0 1px 0 rgba(255,255,255,0.4)",
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
              margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif",
            }}>
              {t('pdfCardDesc')}
            </p>

            {/* Benefit Badges */}
            <div style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              gap: 16,
              margin: "0 auto 28px",
              maxWidth: 480,
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#6F6156", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
                  {lang === 'fr' ? "5 pages premium" : "5 premium pages"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#6F6156", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
                  {lang === 'fr' ? "Archivage à vie" : "Lifetime archive"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#6F6156", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
                  {lang === 'fr' ? "Imprimable" : "Printable"}
                </span>
              </div>
            </div>

            {/* Minimalist PDF Icon Visual */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              margin: "24px auto",
              width: "100%",
              maxWidth: "180px",
            }}>
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 180 220" 
                style={{
                  filter: "drop-shadow(0 10px 20px rgba(44, 36, 22, 0.08))",
                  maxHeight: "220px"
                }}
              >
                {/* Document outline */}
                <path 
                  d="M20 10 H 130 L 160 40 V 210 H 20 Z" 
                  fill="#FDFBF9" 
                  stroke="#C9A961" 
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Folded corner */}
                <path 
                  d="M130 10 V 40 H 160" 
                  fill="#F0E7D8" 
                  stroke="#C9A961" 
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Inner content lines (representing text) */}
                <line x1="45" y1="65" x2="135" y2="65" stroke="#D4C5A0" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="45" y1="80" x2="115" y2="80" stroke="#D4C5A0" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="45" y1="95" x2="125" y2="95" stroke="#D4C5A0" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Score circle in middle */}
                <circle cx="90" cy="135" r="22" fill="none" stroke="#C9A961" strokeWidth="2.5" />
                <line x1="82" y1="135" x2="98" y2="135" stroke="#C9A961" strokeWidth="2" strokeLinecap="round" />
                
                {/* Bottom content lines */}
                <line x1="45" y1="175" x2="135" y2="175" stroke="#D4C5A0" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="45" y1="190" x2="105" y2="190" stroke="#D4C5A0" strokeWidth="2.5" strokeLinecap="round" />

                {/* Premium badge/seal in top-right */}
                <g>
                  {/* Subtle outer glow/ring */}
                  <circle cx="145" cy="45" r="14" fill="#C9A961" />
                  <circle cx="145" cy="45" r="12" fill="none" stroke="#FDFBF9" strokeWidth="0.75" strokeDasharray="2 1" />
                  {/* Small star in center */}
                  <path d="M145 39 L146.5 42.5 L150 43 L147.5 45.5 L148 49 L145 47 L142 49 L142.5 45.5 L140 43 L143.5 42.5 Z" fill="#FDFBF9" />
                </g>
              </svg>
            </div>

            {/* Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              style={{
                width: "100%",
                padding: "16px 32px",
                borderRadius: "14px",
                backgroundColor: "#2C2416",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(44, 36, 22, 0.15)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(44, 36, 22, 0.25)";
                e.currentTarget.style.backgroundColor = "#3A301E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(44, 36, 22, 0.15)";
                e.currentTarget.style.backgroundColor = "#2C2416";
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('pdfButton')}
                </>
              )}
            </button>

            {/* Email Action */}
            <div style={{ marginTop: 18 }}>
              <button
                onClick={handleSendEmail}
                disabled={sendEmailLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#C9A961",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "color 0.2s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
              >
                {sendEmailLoading ? (
                  <>
                    <span style={{
                      display: "inline-block", width: 10, height: 10,
                      border: "1.5px solid rgba(201,169,97,0.4)", borderTopColor: "#C9A961",
                      borderRadius: "50%", animation: "spin 0.7s linear infinite"
                    }} />
                    {lang === 'fr' ? 'Envoi en cours...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    {lang === 'fr' ? 'Recevoir aussi par email' : 'Also receive by email'}
                  </>
                )}
              </button>
              {emailStatus && (
                <p style={{
                  fontSize: 11,
                  color: emailStatus.type === 'success' ? '#9CAF88' : '#C97B63',
                  marginTop: 6,
                  marginBottom: 0,
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  {emailStatus.text}
                </p>
              )}
            </div>

            {/* Social Proof */}
            <p style={{
              fontSize: 11,
              color: "#9B9286",
              marginTop: 18,
              marginBottom: 0,
              fontStyle: "italic",
              fontFamily: "'DM Sans', sans-serif"
            }}>
              {lang === 'fr' 
                ? "Plus de 140 femmes ont déjà téléchargé leur rapport premium ce mois-ci" 
                : "More than 140 women have already downloaded their premium report this month"}
            </p>
          </div>
        </div>
      )}

          </>
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
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #F0E7D8;
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
          background: #E8DCC5;
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
        
        /* Premium Inline Product Card Responsive CSS */
        .rpt-inline-product-card {
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          background: rgba(255, 255, 255, 0.65);
          border-radius: 12px;
          padding: 8px 10px;
          margin-top: 6px;
          transition: all 0.3s ease;
        }
        .rpt-inline-product-card-header {
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          flex: 1;
          min-width: 0;
        }
        .rpt-inline-product-card-buttons {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-shrink: 0;
          align-items: center;
        }
        @media (max-width: 480px) {
          .rpt-inline-product-card {
            flex-direction: column;
            align-items: stretch;
            padding: 10px;
          }
          .rpt-inline-product-card-buttons {
            flex-direction: row;
            justify-content: flex-end;
            margin-top: 6px;
            padding-top: 8px;
            border-top: 1px dashed rgba(168, 116, 73, 0.12);
            width: 100%;
          }
          .rpt-inline-product-card-notch {
            display: none !important;
          }
        }

        /* Premium Inline Product Card Responsive CSS */
        .premium-product-card {
          display: flex;
          flex-direction: row;
          gap: 16px;
          align-items: stretch;
          width: 100%;
        }
        .premium-product-img-wrapper {
          width: 90px;
          height: 110px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(168, 116, 73, 0.1);
          background: #FAF6F0;
        }
        .premium-product-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 4px;
        }
        .premium-product-desc {
          margin: 0;
          font-size: 16px;
          line-height: 1.55;
          color: #2C2416;
          font-family: 'Inter', sans-serif;
        }
        .rpt-product-buttons-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
          width: 110px;
          flex-shrink: 0;
        }
        .premium-product-btn {
          width: 100%;
          text-align: center;
          transition: all 0.3s ease;
        }
        .premium-product-btn:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }
        @media (max-width: 560px) {
          .premium-product-card {
            display: grid !important;
            grid-template-columns: 96px 1fr !important;
            grid-template-rows: auto auto !important;
            gap: 12px 16px !important;
            align-items: center !important;
            width: 100% !important;
          }
          .premium-product-img-wrapper {
            grid-column: 1 !important;
            grid-row: 1 !important;
            width: 96px !important;
            height: 96px !important;
            border-radius: 12px !important;
            background: #F8F4ED !important;
            padding: 8px !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .premium-product-info {
            grid-column: 2 !important;
            grid-row: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            min-width: 0 !important;
          }
          .rpt-product-buttons-container {
            grid-column: 1 / span 2 !important;
            grid-row: 2 !important;
            display: flex !important;
            flex-direction: row !important;
            width: 100% !important;
            gap: 10px !important;
            margin-top: 4px !important;
            padding-top: 0 !important;
            border-top: none !important;
          }
          .premium-product-btn {
            flex: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
