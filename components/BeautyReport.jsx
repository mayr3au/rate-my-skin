import { useState, useEffect } from "react";
import { useLang } from "../lib/LangContext";

const ICONS = ["✦", "◈", "◉", "▲", "◆", "●"];

function ScoreRing({ score, size = 64 }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 300);
    return () => clearTimeout(timer);
  }, [score]);
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;
  const color = score >= 78 ? "#C5A028" : score >= 65 ? "#8A8580" : "#B5ADA4";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f0f0" strokeWidth="2.5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)", filter: score >= 78 ? "drop-shadow(0 0 4px rgba(13,13,13,0.2))" : "none" }}
        strokeLinecap="round"/>
    </svg>
  );
}

function MetricCard({ m, index }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVis(true), index * 80 + 150);
    return () => clearTimeout(timer);
  }, [index]);
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #ebebeb",
      borderRadius: 18,
      padding: "20px 22px",
      display: "flex", gap: 18, alignItems: "flex-start",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)",
      boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
    }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <ScoreRing score={m.score} size={64}/>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {m.score}
          </span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "#1a1a1a" }}>
            {m.label}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: m.score >= 78 ? "#fff" : "#8A8580",
            background: m.score >= 78
              ? "linear-gradient(135deg, #0F0F0F, #2A2A2A)"
              : "#F8F8F5",
            borderRadius: 6, padding: "3px 9px",
            border: m.score >= 78 ? "none" : "1px solid #E8E4DA",
          }}>{m.grade}</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: "#777" }}>
          {m.detail}
        </p>
      </div>
    </div>
  );
}

function ProductCard({ product, lang, t }) {
  const [hovered, setHovered] = useState(false);
  const [btnAmazonHov, setBtnAmazonHov] = useState(false);
  const [btnSephoraHov, setBtnSephoraHov] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVis(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const amazonUrl = `https://www.amazon.fr/s?k=${encodeURIComponent(product.productName)}&tag=ratemyskin-21`;
  const sephoraUrl = `https://www.sephora.fr/search/?q=${encodeURIComponent(product.productName)}`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? '#c8c8c8' : '#ebebeb'}`,
        borderRadius: 18,
        padding: '22px 24px',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease, border-color 0.22s ease, box-shadow 0.22s ease',
        boxShadow: hovered ? '0 10px 36px rgba(0,0,0,0.10)' : '0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Problem badge */}
      <span style={{
        display: 'inline-block', marginBottom: 12,
        fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: '#7C2D2D', background: '#FDF2F2',
        border: '1px solid #F5DADA',
        borderRadius: 6, padding: '3px 9px',
      }}>
        {product.skinProblem}
      </span>

      {/* Product name */}
      <div style={{
        fontSize: 16, fontWeight: 400, color: '#0d0d0d', marginBottom: 7,
        fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.01em', lineHeight: 1.3,
      }}>
        {product.productName}
      </div>

      {/* Description */}
      <p style={{ margin: '0 0 18px', fontSize: 12.5, color: '#888', lineHeight: 1.75 }}>
        {product.description}
      </p>

      {/* Price + CTA row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{
          fontSize: 18, fontWeight: 300, color: '#0d0d0d',
          fontFamily: "'Cormorant Garamond', serif",
        }}>
          {product.price}
        </span>
        <div style={{ display: 'flex', gap: 7 }}>
          <a
            href={amazonUrl}
            target="_blank" rel="noopener noreferrer"
            onMouseEnter={() => setBtnAmazonHov(true)}
            onMouseLeave={() => setBtnAmazonHov(false)}
            style={{
              display: 'inline-block', textDecoration: 'none',
              background: btnAmazonHov
                ? 'linear-gradient(135deg, #1a1a1a, #333)'
                : 'linear-gradient(135deg, #0a0a0a, #1f1f1f)',
              color: '#fff', border: 'none', borderRadius: 9,
              padding: '8px 15px', fontSize: 11.5, fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.04em',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: btnAmazonHov ? '0 4px 16px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'box-shadow 0.2s ease, background 0.2s ease',
            }}
          >
            {t('buyAmazon')}
          </a>
          <a
            href={sephoraUrl}
            target="_blank" rel="noopener noreferrer"
            onMouseEnter={() => setBtnSephoraHov(true)}
            onMouseLeave={() => setBtnSephoraHov(false)}
            style={{
              display: 'inline-block', textDecoration: 'none',
              background: btnSephoraHov ? '#f5f5f5' : '#fff',
              color: '#0d0d0d', border: '1.5px solid #0d0d0d', borderRadius: 9,
              padding: '8px 15px', fontSize: 11.5, fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.04em',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s ease',
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
    mild:        { color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB', label: t('severityMild') },
    moderate:    { color: '#92400E', bg: '#FFFBEB', border: '#FCD34D', label: t('severityModerate') },
    significant: { color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5', label: t('severitySignificant') },
  };
  const cfg = configs[severity] || configs.mild;
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 6, padding: '3px 9px',
    }}>
      {cfg.label}
    </span>
  );
}

/* ── Report header block (shared between free/paid) ── */
function ReportHeader({ t }) {
  return (
    <div style={{
      background: "#fff",
      borderBottom: "1px solid #ebebeb",
      padding: "36px 28px 28px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 100% at 50% -20%, rgba(0,0,0,0.03) 0%, transparent 100%)",
      }} />
      <div className="mobile-padding" style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
        <p className="mobile-hide" style={{ margin: "0 0 5px", fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "#bbb", fontWeight: 600 }}>
          {t('aestheticAnalysis')}
        </p>
        <h1 style={{
          margin: "0 0 4px", fontSize: 30, fontWeight: 300,
          fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.01em",
          background: "linear-gradient(135deg, #0d0d0d 0%, #3a3a3a 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          color: "transparent",
        }}>
          {t('yourFacialReport')}
        </h1>
        <p style={{ margin: 0, fontSize: 12, color: "#bbb", letterSpacing: "0.02em" }}>
          {t('notMedicalAdvice')}
        </p>
      </div>
    </div>
  );
}

export default function BeautyReport({ data, isPaid, onUnlock }) {
  const { lang, t } = useLang();
  const [activeTab, setActiveTab] = useState("analysis");
  const [unlocking, setUnlocking] = useState(false);

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "#aaa", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{t('generatingReport')}</p>
      </div>
    );
  }

  const { overall, summary, faceShape, eyeColor, skinTone } = data;

  const handleUnlock = async (planId) => {
    setUnlocking(true);
    try {
      await onUnlock(planId);
    } finally {
      setUnlocking(false);
    }
  };

  /* ══════════════ FREE VIEW — blurred paid content + fixed paywall overlay ══════════════ */
  if (!isPaid) {
    const freeData = data.free_version || {};
    const mainProblems = freeData.mainProblems || [];
    const basicSummary = freeData.basicSummary || summary || '';
    const paid = data.paid_version || {};
    const previewMetrics = (paid.metrics || []).slice(0, 4);
    const previewStrengths = (paid.strengths || []).slice(0, 2);
    const allProducts = paid.products || [];

    return (
      <div style={{ background: "#f8f8f8", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "0 0 60px" }}>
        <ReportHeader t={t} />

        {/* ── Free content (score + 3 issues) ── */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 6 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#8A8580', background: '#F8F8F5', border: '1px solid #E8E4DA',
              borderRadius: 20, padding: '4px 14px',
            }}>
              {t('freeReportLabel')}
            </span>
          </div>

          <div className="mobile-padding" style={{
            background: "#fff", border: "1px solid #ebebeb", borderRadius: 22,
            marginTop: 12, padding: "24px", boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
          }}>
            <p style={{ margin: "0 0 6px", fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", fontWeight: 600 }}>
              {t('overallScore')}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
              <span style={{
                fontSize: 80, fontWeight: 300, lineHeight: 1,
                fontFamily: "'Cormorant Garamond', serif",
                background: "linear-gradient(160deg, #C5A028 0%, #E8C872 50%, #C5A028 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                color: "transparent",
              }}>
                {overall}
              </span>
              <span style={{ fontSize: 26, color: "#d0d0d0", fontFamily: "'Cormorant Garamond', serif" }}>/100</span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: 100, height: 3, marginBottom: 18, overflow: "hidden" }}>
              <div style={{
                background: "linear-gradient(90deg, #0d0d0d 0%, #444 100%)",
                borderRadius: 100, height: "100%", width: `${overall}%`,
                transition: "width 1.8s cubic-bezier(0.4,0,0.2,1)",
              }}/>
            </div>
            <p style={{ margin: "0 0 18px", fontSize: 15.5, lineHeight: 1.8, color: "#666", fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" }}>
              {basicSummary}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[{ k: t('faceShape'), v: faceShape }, { k: t('eyeColor'), v: eyeColor }, { k: t('skinTone'), v: skinTone }].map(tag => (
                <div key={tag.k} style={{ background: "linear-gradient(135deg, #f8f8f8, #f2f2f2)", borderRadius: 10, padding: "7px 14px", border: "1px solid #ebebeb" }}>
                  <div style={{ fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#bbb", fontWeight: 600 }}>{tag.k}</div>
                  <div style={{ fontSize: 12, color: "#1a1a1a", fontWeight: 600, marginTop: 2 }}>{tag.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <p style={{ margin: "0 0 12px 4px", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#bbb", fontWeight: 600 }}>
              {t('mainProblemsHeading')}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mainProblems.map((problem, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 18, padding: "20px 22px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ marginBottom: 8 }}><SeverityBadge severity={problem.severity} t={t} /></div>
                  <div style={{ fontSize: 16, fontWeight: 400, color: "#0d0d0d", marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>
                    {problem.title}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "#777" }}>{problem.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Product Recommendations (always free, affiliate) ── */}
          {allProducts.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, gap: 8 }}>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#bbb", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                    {t('shopSubtitle')}
                  </p>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", color: "#0d0d0d" }}>
                    {t('shopTitle')}
                  </h3>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "#C5A028", background: "rgba(197,160,40,0.08)", border: "1px solid rgba(197,160,40,0.25)",
                  borderRadius: 20, padding: "4px 12px", whiteSpace: "nowrap", flexShrink: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Free
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {allProducts.map((p, i) => (
                  <ProductCard key={i} product={p} lang={lang} t={t} />
                ))}
              </div>
              <p style={{ fontSize: 10, color: "#ccc", textAlign: "center", padding: "12px 4px 0", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                {lang === 'fr'
                  ? 'Liens affiliés — nous touchons une petite commission si vous achetez, sans surcoût pour vous.'
                  : 'Affiliate links — we may earn a small commission at no extra cost to you.'}
              </p>
            </div>
          )}
        </div>

        {/* ── Blurred paid content preview ── */}
        <div style={{
          maxWidth: 680, margin: "24px auto 0", padding: "0 20px 80px",
          filter: "blur(5px)",
          opacity: 0.38,
          pointerEvents: "none",
          userSelect: "none",
          transition: "filter 0.9s ease, opacity 0.9s ease",
        }}>
          {/* Fake tab bar */}
          <div style={{
            display: "flex", gap: 4, background: "#fff", border: "1px solid #ebebeb",
            borderRadius: 14, padding: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            {[t('tabMetrics'), t('tabStrengths'), t('tabImprove'), t('tabRoutine'), t('tabShop')].map((label, i) => (
              <div key={label} style={{
                flex: 1, padding: "12px 4px", borderRadius: 10, textAlign: "center",
                background: i === 0 ? "linear-gradient(135deg, #0F0F0F, #2A2A2A)" : "transparent",
                color: i === 0 ? "#fff" : "#8A8580",
                fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em",
                fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
              }}>{label}</div>
            ))}
          </div>

          {/* Preview metrics */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {previewMetrics.map((m, i) => <MetricCard key={i} m={m} index={i} />)}
          </div>

          {/* Preview strengths */}
          {previewStrengths.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              {previewStrengths.map((s, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 18, padding: "24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #0a0a0a, #2a2a2a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: 14 }}>{ICONS[i] || "✦"}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0d0d0d", marginBottom: 7 }}>{s.title}</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "#777" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ── Fixed paywall overlay ── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(252,249,245,0.80)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}>
          <div style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 22,
            padding: "clamp(28px, 5vw, 44px)",
            maxWidth: 400, width: "100%",
            boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
            textAlign: "center",
          }}>
            {/* Gold accent line */}
            <div style={{ width: 32, height: 2, background: "linear-gradient(90deg, #C5A028, #E8C872)", borderRadius: 2, margin: "0 auto 20px" }} />

            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#C5A028", margin: "0 0 10px", fontFamily: "'DM Sans', sans-serif",
            }}>
              {t('paywallCardLabel')}
            </p>

            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 400,
              color: "#0d0d0d", margin: "0 0 12px", lineHeight: 1.2,
            }}>
              {t('paywallCardTitle')}
            </h2>

            <p style={{
              fontSize: 13, color: "#888", lineHeight: 1.65,
              margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif",
            }}>
              {t('paywallCardDesc')}
            </p>

            {/* Perks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: "left" }}>
              {[t('paywallPerk1'), t('paywallPerk2'),
                lang === 'fr' ? "Plan d'amélioration détaillé & points forts" : "Detailed strengths & improvement plan",
              ].map((perk, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "#C5A028", fontSize: 11, flexShrink: 0, marginTop: 2 }}>✦</span>
                  <span style={{ fontSize: 12.5, color: "#555", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{perk}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => handleUnlock('single')}
                disabled={unlocking}
                style={{
                  width: "100%", padding: "14px",
                  background: unlocking ? "#555" : "#0d0d0d",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontSize: 13, fontWeight: 700, cursor: unlocking ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.03em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "opacity 0.2s, background 0.2s",
                  opacity: unlocking ? 0.7 : 1,
                }}
              >
                {unlocking ? (
                  <>
                    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    {t('redirecting')}
                  </>
                ) : t('unlockSingle')}
              </button>
              <button
                onClick={() => handleUnlock('pack')}
                disabled={unlocking}
                style={{
                  width: "100%", padding: "14px",
                  background: "transparent", color: "#0d0d0d",
                  border: "1.5px solid #0d0d0d", borderRadius: 12,
                  fontSize: 13, fontWeight: 600, cursor: unlocking ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.03em",
                  transition: "opacity 0.2s",
                  opacity: unlocking ? 0.5 : 1,
                }}
              >
                {t('unlockPack')}
              </button>
            </div>

            <p style={{ marginTop: 16, fontSize: 11, color: "#ccc", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
              {lang === 'fr' ? 'Paiement unique · Sans abonnement' : 'One-time payment · No subscription'}
            </p>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ══════════════ PAID VIEW ══════════════ */
  const paid = data.paid_version || {};
  const metrics = paid.metrics || [];
  const strengths = paid.strengths || [];
  const improvements = paid.improvements || [];
  const recommendations = paid.recommendations || [];
  const products = paid.products || [];

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "0 0 60px" }}>
      <ReportHeader t={t} />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Hero score card ── */}
        <div className="mobile-padding" style={{
          background: "#fff",
          border: "1px solid #ebebeb",
          borderRadius: 22,
          marginTop: 24,
          padding: "24px",
          display: "flex", gap: 32,
          alignItems: "center", flexWrap: "wrap",
          boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: "0 0 6px", fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", fontWeight: 600 }}>
              {t('overallScore')}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
              <span style={{
                fontSize: 80, fontWeight: 300, lineHeight: 1,
                fontFamily: "'Cormorant Garamond', serif",
                background: "linear-gradient(160deg, #C5A028 0%, #E8C872 50%, #C5A028 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                color: "transparent",
                textShadow: "0 2px 10px rgba(197, 160, 40, 0.15)",
              }}>
                {overall}
              </span>
              <span style={{ fontSize: 26, color: "#d0d0d0", fontFamily: "'Cormorant Garamond', serif" }}>/100</span>
            </div>

            {/* Gradient score bar */}
            <div style={{ background: "#f0f0f0", borderRadius: 100, height: 3, marginBottom: 18, overflow: "hidden" }}>
              <div style={{
                background: "linear-gradient(90deg, #0d0d0d 0%, #444 100%)",
                borderRadius: 100, height: "100%", width: `${overall}%`,
                transition: "width 1.8s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: "0 0 8px rgba(0,0,0,0.2)",
              }}/>
            </div>

            <p style={{ margin: "0 0 18px", fontSize: 15.5, lineHeight: 1.8, color: "#666", fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" }}>
              {summary}
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { k: t('faceShape'), v: faceShape },
                { k: t('eyeColor'), v: eyeColor },
                { k: t('skinTone'), v: skinTone },
              ].map(tag => (
                <div key={tag.k} style={{
                  background: "linear-gradient(135deg, #f8f8f8, #f2f2f2)",
                  borderRadius: 10, padding: "7px 14px",
                  border: "1px solid #ebebeb",
                }}>
                  <div style={{ fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#bbb", fontWeight: 600 }}>{tag.k}</div>
                  <div style={{ fontSize: 12, color: "#1a1a1a", fontWeight: 600, marginTop: 2, letterSpacing: "0.02em" }}>{tag.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score rings — top 3 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {metrics.slice(0, 3).map(m => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ position: "relative" }}>
                  <ScoreRing score={m.score} size={50}/>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a" }}>{m.score}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#888", width: 110, lineHeight: 1.4 }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", gap: 4, marginTop: 20,
          background: "#fff",
          border: "1px solid #ebebeb",
          borderRadius: 14, padding: 4,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}>
          {[
            { id: "analysis",  label: t('tabMetrics') },
            { id: "strengths", label: t('tabStrengths') },
            { id: "improve",   label: t('tabImprove') },
            { id: "recs",      label: t('tabRoutine') },
            { id: "shop",      label: t('tabShop') },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "12px 4px", border: "none", borderRadius: 10,
              background: activeTab === tab.id
                ? "linear-gradient(135deg, #0F0F0F, #2A2A2A)"
                : "transparent",
              color: activeTab === tab.id ? "#fff" : "#8A8580",
              fontSize: 10.5, fontWeight: 600, cursor: "pointer",
              letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: activeTab === tab.id ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ marginTop: 16 }}>

          {activeTab === "analysis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {metrics.map((m, i) => <MetricCard key={i} m={m} index={i}/>)}
              <div style={{
                background: "#fff", border: "1px solid #ebebeb", borderRadius: 14,
                padding: "16px 22px", display: "flex", gap: 20, flexWrap: "wrap",
              }}>
                {[
                  { range: "78–100", label: t('legendStrong'),   color: "#0d0d0d" },
                  { range: "65–77", label: t('legendAverage'),  color: "#777" },
                  { range: "0–64",  label: t('legendBelowAvg'), color: "#ccc" },
                ].map(l => (
                  <div key={l.range} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }}/>
                    <span style={{ fontSize: 11, color: "#999" }}>{l.range} — {l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "strengths" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {strengths.map((s, i) => (
                <div key={i} style={{
                  background: "#fff", border: "1px solid #ebebeb", borderRadius: 18,
                  padding: "24px", display: "flex", gap: 16, alignItems: "flex-start",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "linear-gradient(135deg, #0a0a0a, #2a2a2a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 14, color: "#fff",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  }}>{ICONS[i] || "✦"}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0d0d0d", marginBottom: 7, letterSpacing: "0.05em" }}>
                      {s.title}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "#777" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "improve" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {improvements.map((s, i) => (
                <div key={i} style={{
                  background: "#fff", border: "1px solid #ebebeb", borderRadius: 18,
                  padding: "24px", display: "flex", gap: 16, alignItems: "flex-start",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "linear-gradient(135deg, #f5f5f5, #ebebeb)",
                    border: "1px solid #e0e0e0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 14, color: "#555", fontWeight: 700,
                    fontFamily: "'Cormorant Garamond', serif",
                  }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0d0d0d", marginBottom: 7, letterSpacing: "0.05em" }}>
                      {s.title}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "#777" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "recs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recommendations.map((r, i) => (
                <div key={i} style={{
                  background: "#fff", border: "1px solid #ebebeb", borderRadius: 18,
                  padding: "24px",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0d0d0d" }}>
                      {r.category}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
                      color: r.priority === "HIGH" ? "#fff" : "#777",
                      background: r.priority === "HIGH"
                        ? "linear-gradient(135deg, #0a0a0a, #2a2a2a)"
                        : "#f0f0f0",
                      borderRadius: 5, padding: "3px 9px",
                    }}>{r.priority}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {(r.items || []).map((item, j) => (
                      <div key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ccc", flexShrink: 0, marginTop: 7 }}/>
                        <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "shop" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Section header */}
              <div style={{ padding: "6px 4px 10px" }}>
                <p style={{ margin: "0 0 3px", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#bbb", fontWeight: 600 }}>
                  {t('shopSubtitle')}
                </p>
                <h2 style={{
                  margin: 0, fontSize: 26, fontWeight: 300,
                  fontFamily: "'Cormorant Garamond', serif", color: "#0d0d0d",
                }}>
                  {t('shopTitle')}
                </h2>
              </div>

              {products.length === 0 ? (
                <div style={{
                  background: "#fff", border: "1px solid #ebebeb", borderRadius: 18,
                  padding: "32px", textAlign: "center", color: "#bbb", fontSize: 13,
                }}>
                  {t('noProducts')}
                </div>
              ) : (
                products.map((p, i) => (
                  <ProductCard key={i} product={p} lang={lang} t={t} />
                ))
              )}

              {/* Affiliate disclaimer */}
              <p style={{ fontSize: 10, color: "#ccc", textAlign: "center", padding: "8px 4px 0", lineHeight: 1.7 }}>
                {lang === 'fr'
                  ? 'Liens affiliés — nous touchons une petite commission si vous achetez, sans surcoût pour vous.'
                  : 'Affiliate links — we may earn a small commission at no extra cost to you.'}
              </p>
            </div>
          )}
        </div>

        {/* ── Share CTA ── */}
        <div style={{
          background: "linear-gradient(145deg, #0a0a0a 0%, #1f1f1f 100%)",
          borderRadius: 18, padding: "22px 26px",
          marginTop: 16,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#fff", fontWeight: 600, letterSpacing: "0.03em" }}>{t('shareScore')}</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#555", letterSpacing: "0.04em" }}>ratemyskin.ai</p>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(t('shareText', overall))}
            style={{
              background: "rgba(255,255,255,0.96)", color: "#0d0d0d", border: "none",
              borderRadius: 10, padding: "11px 22px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.05em",
              boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            }}>
            {t('copyShare')}
          </button>
        </div>

        <div style={{ marginTop: 24, padding: "0 4px" }}>
          <p style={{ fontSize: 10, color: "#ccc", lineHeight: 1.8, textAlign: "center", letterSpacing: "0.02em" }}>
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
