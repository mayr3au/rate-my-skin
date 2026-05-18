import { useState, useEffect } from "react";
import { useLang } from "../lib/LangContext";
import { shareScore } from "../lib/shareImage";

const GOLD = "#A87449";
const CARD = {
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(253, 246, 237, 0.48) 50%, rgba(246, 235, 222, 0.72) 100%)",
  backdropFilter: "blur(25px) saturate(150%)",
  WebkitBackdropFilter: "blur(25px) saturate(150%)",
  border: "1px solid rgba(255, 255, 255, 0.75)",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(168, 116, 73, 0.03), inset 0 1px 0 0 rgba(255, 255, 255, 0.75)",
  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
};
const LABEL_STYLE = { margin: "0 0 4px", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#B9AC9E", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" };
const TITLE_STYLE = { margin: "0 0 16px", fontSize: 22, fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", color: "#2C241D" };

const ICONS = ["✦", "◈", "◉", "▲", "◆", "●"];

/* ══ Score hero card — dark tech panel ══════════════════════════════════ */
function ScoreHeroCard({ score, summary, faceShape, eyeColor, skinTone, badge, miniMetrics, t, lang }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 220);
    return () => clearTimeout(timer);
  }, [score]);

  const SIZE = 156;
  const r = SIZE / 2 - 11;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;
  const statusLabel = score >= 78 ? t("scoreExcellent") : score >= 65 ? t("scoreGood") : t("scoreNeedsWork");
  const arcColor = score >= 78 ? "#D4A574" : score >= 65 ? "#A87449" : "#8C7A6B";

  return (
    <div style={{
      background: "linear-gradient(150deg, #1E1810 0%, #2C241D 55%, #201A13 100%)",
      borderRadius: 24, marginBottom: 16, position: "relative", overflow: "hidden",
      boxShadow: "0 24px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,165,116,0.1)",
      padding: "clamp(20px,5vw,32px)",
    }}>
      {/* Radial glow behind ring */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 55% 60% at 50% 38%, rgba(168,116,73,0.18) 0%, transparent 68%)" }}/>

      {/* Corner bracket — top-left */}
      <div style={{ position: "absolute", top: 14, left: 14, width: 18, height: 18,
        borderTop: "1.5px solid rgba(212,165,116,0.35)", borderLeft: "1.5px solid rgba(212,165,116,0.35)", pointerEvents: "none" }}/>
      {/* Corner bracket — top-right */}
      <div style={{ position: "absolute", top: 14, right: 14, width: 18, height: 18,
        borderTop: "1.5px solid rgba(212,165,116,0.35)", borderRight: "1.5px solid rgba(212,165,116,0.35)", pointerEvents: "none" }}/>
      {/* Corner bracket — bottom-left */}
      <div style={{ position: "absolute", bottom: 14, left: 14, width: 18, height: 18,
        borderBottom: "1.5px solid rgba(212,165,116,0.35)", borderLeft: "1.5px solid rgba(212,165,116,0.35)", pointerEvents: "none" }}/>
      {/* Corner bracket — bottom-right */}
      <div style={{ position: "absolute", bottom: 14, right: 14, width: 18, height: 18,
        borderBottom: "1.5px solid rgba(212,165,116,0.35)", borderRight: "1.5px solid rgba(212,165,116,0.35)", pointerEvents: "none" }}/>

      {/* Top label row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, position: "relative" }}>
        <p style={{ margin: 0, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase",
          color: "rgba(212,165,116,0.55)", fontFamily: "'DM Sans', sans-serif" }}>
          {t("overallScore")}
        </p>
        {badge && (
          <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(185,172,158,0.6)", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,165,116,0.14)", borderRadius: 20, padding: "3px 10px",
            fontFamily: "'DM Sans', sans-serif" }}>
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
            <circle cx={SIZE/2} cy={SIZE/2} r={r + 7}
              fill="none" stroke="rgba(212,165,116,0.07)" strokeWidth="1" strokeDasharray="2.5 8"/>
          </svg>
          {/* Progress ring */}
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <defs>
              <linearGradient id="heroArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6B4828"/>
                <stop offset="50%" stopColor="#D4A574"/>
                <stop offset="100%" stopColor="#A87449"/>
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx={SIZE/2} cy={SIZE/2} r={r}
              fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7"/>
            {/* Arc */}
            <circle cx={SIZE/2} cy={SIZE/2} r={r}
              fill="none" stroke="url(#heroArcGrad)" strokeWidth="7"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{
                transition: "stroke-dasharray 2s cubic-bezier(0.4,0,0.2,1)",
                filter: `drop-shadow(0 0 7px ${arcColor}88)`,
              }}/>
          </svg>
          {/* Number + status label centered */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 58, fontWeight: 200, lineHeight: 1,
                fontFamily: "'Cormorant Garamond', serif", color: "#F2E8DC",
                textShadow: "0 0 24px rgba(212,165,116,0.25)" }}>
                {score}
              </span>
              <span style={{ fontSize: 15, color: "rgba(212,165,116,0.4)",
                fontFamily: "'Cormorant Garamond', serif", paddingBottom: 7 }}>
                /100
              </span>
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              color: arcColor, fontFamily: "'DM Sans', sans-serif", marginTop: 1 }}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.72, textAlign: "center", position: "relative",
        color: "rgba(242,232,220,0.65)", fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif",
        wordBreak: "break-word" }}>
        {summary}
      </p>

      {/* Separator */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,165,116,0.18), transparent)", margin: "0 0 16px" }}/>

      {/* Trait tags */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", position: "relative" }}>
        {[{ k: t("faceShape"), v: faceShape }, { k: t("eyeColor"), v: eyeColor }, { k: t("skinTone"), v: skinTone }].map(tag => tag.v ? (
          <div key={tag.k} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10,
            padding: "7px 14px", border: "1px solid rgba(212,165,116,0.1)" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "rgba(185,172,158,0.45)", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              {tag.k}
            </div>
            <div style={{ fontSize: 12, color: "rgba(242,232,220,0.82)", fontWeight: 600,
              marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>
              {tag.v}
            </div>
          </div>
        ) : null)}
      </div>

      {/* Mini-metrics strip (paid view only) */}
      {miniMetrics && miniMetrics.length > 0 && (
        <>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,165,116,0.18), transparent)", margin: "16px 0" }}/>
          <div style={{ display: "flex", position: "relative" }}>
            {miniMetrics.map((m, i) => (
              <div key={m.label} className="rpt-mini-metric" style={{
                flex: 1, textAlign: "center", padding: "0 10px",
                borderRight: i < miniMetrics.length - 1 ? "1px solid rgba(212,165,116,0.1)" : "none",
              }}>
                <div style={{ fontSize: 22, fontWeight: 200, color: "#F2E8DC",
                  fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>
                  {m.score}
                </div>
                <div style={{ fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(185,172,158,0.5)", fontWeight: 600, marginTop: 4,
                  fontFamily: "'DM Sans', sans-serif" }}>
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
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(212,165,116,0.12)" strokeWidth="3"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)" }}
        strokeLinecap="round"/>
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
  const gradeColor = m.score >= 78 ? { bg: "#2C241D", color: "#fff" } : m.score >= 65 ? { bg: "rgba(168,116,73,0.1)", color: "#8C7A6B" } : { bg: "#F5F4F2", color: "#B9AC9E" };
  return (
    <div style={{
      ...CARD, padding: "18px 20px",
      display: "flex", gap: 16, alignItems: "center",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.55s ease, transform 0.55s ease",
    }}>
      <div className="rpt-metric-ring" style={{ position: "relative", flexShrink: 0, width: 58, height: 58 }}>
        <ScoreRing score={m.score} size={58}/>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2C241D", fontFamily: "'Cormorant Garamond', serif" }}>{m.score}</span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2C241D" }}>{m.label}</span>
          <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 9px", background: gradeColor.bg, color: gradeColor.color, letterSpacing: "0.06em", flexShrink: 0 }}>{m.grade}</span>
        </div>
        <div style={{ height: 2, background: "rgba(212,165,116,0.12)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${m.score}%`, background: `linear-gradient(90deg, #2C241D, ${GOLD})`, borderRadius: 10, transition: "width 1.6s cubic-bezier(0.4,0,0.2,1)" }}/>
        </div>
        <p className="rpt-metric-detail" style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "#8C7A6B", wordBreak: "break-word", overflowWrap: "break-word" }}>{m.detail}</p>
      </div>
    </div>
  );
}

/* ── Product card ── */
function ProductCard({ product, lang, t }) {
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);
  const amazonUrl = product.amazonLink || `https://www.amazon.fr/s?k=${encodeURIComponent(product.productName)}&tag=ratemyskin-21`;
  const sephoraUrl = product.sephoraLink || `https://www.sephora.fr/search/?q=${encodeURIComponent(product.productName)}`;
  const primaryLink = amazonUrl;

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      ...CARD, padding: "18px 20px",
      border: hov ? "1px solid rgba(168,116,73,0.6)" : "1px solid rgba(255, 255, 255, 0.55)",
      boxShadow: hov ? "0 12px 40px rgba(168,116,73,0.08), inset 0 1px 1px rgba(255, 255, 255, 0.95)" : CARD.boxShadow,
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.45s ease, transform 0.45s ease, border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
      display: "flex", gap: 16, alignItems: "flex-start", overflow: "hidden",
    }}>

      {/* Product image */}
      {product.imageUrl && (
        <a href={primaryLink} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, display: "block" }}>
          <img
            src={product.imageUrl}
            alt={product.productName}
            width={88}
            height={88}
            style={{
              width: "clamp(72px, 20vw, 88px)",
              height: "clamp(72px, 20vw, 88px)",
              objectFit: "contain",
              borderRadius: 12,
              background: "rgba(245,240,235,0.5)",
              border: "1px solid rgba(212,165,116,0.15)",
              padding: 6,
              display: "block",
              transition: "opacity 0.2s",
              opacity: hov ? 0.85 : 1,
            }}
          />
        </a>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <span style={{ display: "inline-block", marginBottom: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7C2D2D", background: "#FDF2F2", border: "1px solid #F5DADA", borderRadius: 6, padding: "3px 9px" }}>
          {product.skinProblem}
        </span>
        <div style={{ fontSize: 15.5, fontWeight: 400, color: "#2C241D", marginBottom: 5, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.3, wordBreak: "break-word" }}>{product.productName}</div>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "#8C7A6B", lineHeight: 1.65, wordBreak: "break-word" }}>{product.description}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 300, color: "#2C241D", fontFamily: "'Cormorant Garamond', serif" }}>{product.price}</span>
          <div className="rpt-product-btns" style={{ display: "flex", gap: 7 }}>
            <a href={amazonUrl} target="_blank" rel="noopener noreferrer" className="btn-liquid-glass-dark" style={{ padding: "8px 14px", fontSize: 11.5, borderRadius: 12, border: "none" }}>{t('buyAmazon')}</a>
            <a href={sephoraUrl} target="_blank" rel="noopener noreferrer" className="btn-liquid-glass" style={{ padding: "8px 14px", fontSize: 11.5, borderRadius: 12, border: "none" }}>{t('buySephora')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Severity badge ── */
function SeverityBadge({ severity, t }) {
  const configs = {
    mild:        { color: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB", label: t('severityMild') },
    moderate:    { color: "#92400E", bg: "#FFFBEB", border: "#FCD34D", label: t('severityModerate') },
    significant: { color: "#991B1B", bg: "#FEF2F2", border: "#FCA5A5", label: t('severitySignificant') },
  };
  const cfg = configs[severity] || configs.mild;
  return (
    <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6, padding: "3px 9px" }}>
      {cfg.label}
    </span>
  );
}

const SEVERITY_ACCENT = { mild: "#D1D5DB", moderate: "#FCD34D", significant: "#FCA5A5" };

/* ── Shared report header ── */
function ReportHeader({ t }) {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.45)",
      backdropFilter: "blur(18px) saturate(120%)",
      WebkitBackdropFilter: "blur(18px) saturate(120%)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
      padding: "32px 28px 24px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 100% at 50% -20%, rgba(0,0,0,0.025) 0%, transparent 100%)" }} />
      <div className="mobile-padding" style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
        <p className="mobile-hide" style={{ ...LABEL_STYLE, margin: "0 0 4px" }}>{t('aestheticAnalysis')}</p>
        <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", background: "linear-gradient(135deg, #2C241D 0%, #A87449 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" }}>
          {t('yourFacialReport')}
        </h1>
        <p style={{ margin: 0, fontSize: 11.5, color: "#B9AC9E", letterSpacing: "0.02em", fontFamily: "'DM Sans', sans-serif" }}>{t('notMedicalAdvice')}</p>
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
    <div style={{ background: "rgba(245,240,235,0.6)", borderRadius: 12, padding: "8px 16px", border: "1px solid rgba(212,165,116,0.14)" }}>
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

  const { overall, summary, faceShape, eyeColor, skinTone } = data;

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
            faceShape={faceShape} eyeColor={eyeColor} skinTone={skinTone}
            badge={t("freeReportLabel")}
            t={t} lang={lang}
          />

          {/* ── Main problems ── */}
          {mainProblems.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <SectionHeading label={t('mainProblemsHeading')} title={t('areasToAddress')} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mainProblems.map((problem, i) => (
                  <div key={i} style={{ ...CARD, padding: "0", display: "flex", overflow: "hidden" }}>
                    <div style={{ width: 4, background: SEVERITY_ACCENT[problem.severity] || "#D1D5DB", flexShrink: 0 }}/>
                    <div style={{ padding: "18px 20px", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <SeverityBadge severity={problem.severity} t={t} />
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 400, color: "#2C241D", marginBottom: 6, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.3 }}>{problem.title}</div>
                      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: "#8C7A6B" }}>{problem.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Products (free) ── */}
          {allProducts.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14, gap: 8 }}>
                <SectionHeading label={t('shopSubtitle')} title={t('shopTitle')} />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C5A028", background: "rgba(197,160,40,0.08)", border: "1px solid rgba(197,160,40,0.25)", borderRadius: 20, padding: "4px 12px", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
                  {t('freeIncluded')}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {allProducts.map((p, i) => <ProductCard key={i} product={p} lang={lang} t={t} />)}
              </div>
              <p style={{ fontSize: 10, color: "#C4B8AE", textAlign: "center", padding: "12px 4px 0", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                {t('affiliateNotice')}
              </p>
            </div>
          )}
        </div>

        {/* ── Paywall card ── */}
        <div style={{ maxWidth: 680, margin: "32px auto 0", padding: "0 20px" }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)",
            border: "1.5px solid rgba(197, 160, 40, 0.45)",
            borderRadius: 24, padding: "clamp(28px,5vw,40px)",
            boxShadow: "0 20px 56px rgba(168, 116, 73, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.95)",
            textAlign: "center",
          }}>
            <div style={{ width: 36, height: 3, background: "linear-gradient(90deg, #C5A028, #E8C872)", borderRadius: 2, margin: "0 auto 18px" }} />
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#C5A028", margin: "0 0 10px", fontFamily: "'DM Sans', sans-serif" }}>
              {t('paywallCardLabel')}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px,5vw,28px)", fontWeight: 400, color: "#2C241D", margin: "0 0 10px", lineHeight: 1.2 }}>
              {t('paywallCardTitle')}
            </h2>
            <p style={{ fontSize: 13, color: "#8C7A6B", lineHeight: 1.65, margin: "0 0 22px", fontFamily: "'DM Sans', sans-serif" }}>
              {t('paywallCardDesc')}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24, textAlign: "left", background: "rgba(245,240,235,0.4)", borderRadius: 14, padding: "16px 18px" }}>
              {[t('paywallPerk1'), t('paywallPerk2'), t('paywallImprove')].map((perk, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: GOLD, fontSize: 10, flexShrink: 0, marginTop: 3 }}>✦</span>
                  <span style={{ fontSize: 12.5, color: "#6F6156", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{perk}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => handleUnlock("single")} disabled={unlocking} className="btn-liquid-glass-dark" style={{ width: "100%", padding: "15px", borderRadius: 12, fontSize: 13.5, fontWeight: 700, letterSpacing: "0.03em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none" }}>
                {unlocking ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />{t('redirecting')}</> : t('unlockSingle')}
              </button>
              <button onClick={() => handleUnlock("pack")} disabled={unlocking} className="btn-liquid-glass" style={{ width: "100%", padding: "15px", borderRadius: 12, fontSize: 13, fontWeight: 600, letterSpacing: "0.03em", border: "none" }}>
                {t('unlockPack')}
              </button>
            </div>
            <p style={{ marginTop: 14, fontSize: 11, color: "#C4B8AE", fontFamily: "'DM Sans', sans-serif" }}>
              {t('oneTimePayment')}
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
              ? <><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(185,172,158,0.35)", borderTopColor: "#B9AC9E", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>{t('shareGenerating')}</>
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
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(16px) saturate(120%)",
            WebkitBackdropFilter: "blur(16px) saturate(120%)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: 14, padding: 4,
            boxShadow: "0 8px 32px rgba(168,116,73,0.03), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
            scrollbarWidth: "none"
          }}>
            {TABS.map((label, i) => (
              <button key={label} onClick={() => setPreviewTab(i)} className="rpt-tab-btn" style={{
                flex: 1, padding: "11px 4px", borderRadius: 10, textAlign: "center",
                background: previewTab === i ? "linear-gradient(135deg, rgba(44, 36, 29, 0.85), rgba(28, 22, 17, 0.92))" : "transparent",
                color: previewTab === i ? "#fff" : "#B9AC9E",
                fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
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
          {previewTab === 0 && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{previewMetrics.map((m, i) => <MetricCard key={i} m={m} index={i}/>)}</div>}
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
          {previewTab === 4 && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{allProducts.map((p, i) => <ProductCard key={i} product={p} lang={lang} t={t}/>)}</div>}
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
    { id: "analysis",  label: t('tabMetrics') },
    { id: "strengths", label: t('tabStrengths') },
    { id: "improve",   label: t('tabImprove') },
    { id: "recs",      label: t('tabRoutine') },
    { id: "shop",      label: t('tabShop') },
  ];

  return (
    <div style={{ background: "transparent", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: 60 }}>
      <ReportHeader t={t} />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 0" }}>

        {/* ── Score hero ── */}
        <ScoreHeroCard
          score={overall}
          summary={summary}
          faceShape={faceShape} eyeColor={eyeColor} skinTone={skinTone}
          miniMetrics={metrics.slice(0, 3)}
          t={t} lang={lang}
        />

        {/* ── Tabs ── */}
        <div className="rpt-tabs" style={{
          display: "flex", gap: 4,
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(16px) saturate(120%)",
          WebkitBackdropFilter: "blur(16px) saturate(120%)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          borderRadius: 14, padding: 4,
          boxShadow: "0 8px 32px rgba(168,116,73,0.03), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
          scrollbarWidth: "none", WebkitOverflowScrolling: "touch"
        }}>
          {TABS_PAID.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="rpt-tab-btn" style={{
              flex: 1, padding: "12px 4px", border: activeTab === tab.id ? "1px solid rgba(255, 255, 255, 0.15)" : "none", borderRadius: 10,
              background: activeTab === tab.id ? "linear-gradient(135deg, rgba(44, 36, 29, 0.85), rgba(28, 22, 17, 0.92))" : "transparent",
              color: activeTab === tab.id ? "#fff" : "#B9AC9E",
              fontSize: 10, fontWeight: 600, cursor: "pointer", letterSpacing: "0.08em",
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
              {metrics.map((m, i) => <MetricCard key={i} m={m} index={i}/>)}
              <div style={{ ...CARD, padding: "14px 18px", display: "flex", gap: 18, flexWrap: "wrap" }}>
                {[{ range: "78–100", label: t('legendStrong'), color: "#2C241D" }, { range: "65–77", label: t('legendAverage'), color: "#8C7A6B" }, { range: "0–64", label: t('legendBelowAvg'), color: "#B9AC9E" }].map(l => (
                  <div key={l.range} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 11, color: "#B9AC9E", fontFamily: "'DM Sans', sans-serif" }}>{l.range} — {l.label}</span>
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
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(168,116,73,0.1)", border: "1px solid rgba(168,116,73,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, color: GOLD }}>{ICONS[i] || "✦"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#2C241D", marginBottom: 6, letterSpacing: "0.04em", wordBreak: "break-word" }}>{s.title}</div>
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
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#2C241D", marginBottom: 6, letterSpacing: "0.04em", wordBreak: "break-word" }}>{s.title}</div>
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
              { key: "weekly",  label: t('routineWeekly'), dot: GOLD },
            ].filter(s => (paidRoutine[s.key] || []).length > 0);

            if (ROUTINE_SECTIONS.length === 0) {
              return (
                <div style={{ ...CARD, padding: "32px", textAlign: "center", color: "#C4B8AE", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  {t('routineUnavailable')}
                </div>
              );
            }

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ROUTINE_SECTIONS.map(({ key, label, dot }) => (
                  <div key={key} style={{ ...CARD, padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid rgba(212,165,116,0.1)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }}/>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2C241D", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(paidRoutine[key] || []).map((step, j) => (
                        <div key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "rgba(212,165,116,0.1)", border: "1px solid rgba(212,165,116,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 700, color: GOLD, fontFamily: "'Cormorant Garamond', serif", marginTop: 1 }}>{j + 1}</div>
                          <span style={{ fontSize: 13, color: "#6F6156", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{step}</span>
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
                <div style={{ ...CARD, padding: "32px", textAlign: "center", color: "#C4B8AE", fontSize: 13 }}>{t('noProducts')}</div>
              ) : products.map((p, i) => <ProductCard key={i} product={p} lang={lang} t={t}/>)}
              <p style={{ fontSize: 10, color: "#C4B8AE", textAlign: "center", padding: "8px 4px 0", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                {t('affiliateNotice')}
              </p>
            </div>
          )}
        </div>

        {/* ── Share CTA (paid view) ── */}
        <div style={{
          background: "linear-gradient(145deg, #1E1810 0%, #2C241D 60%, #201A13 100%)",
          borderRadius: 20, padding: "28px 24px", marginTop: 20,
          border: "1px solid rgba(212,165,116,0.1)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(212,165,116,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            {t('shareHeading')}
          </p>
          <h3 style={{ margin: "0 0 6px", fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, color: "#F2E8DC", lineHeight: 1.2 }}>
            {t('shareYourScore', overall)}
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "rgba(185,172,158,0.6)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
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
                ? <><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "rgba(255,255,255,0.7)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>{t('shareGeneratingShort')}</>
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
            <p style={{ margin: "12px 0 0", fontSize: 12, color: "rgba(212,165,116,0.85)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
              {shareMsg}
            </p>
          )}
        </div>

        <div style={{ marginTop: 20, padding: "0 4px" }}>
          <p style={{ fontSize: 10, color: "#C4B8AE", lineHeight: 1.8, textAlign: "center", letterSpacing: "0.02em", fontFamily: "'DM Sans', sans-serif" }}>{t('disclaimer')}</p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
