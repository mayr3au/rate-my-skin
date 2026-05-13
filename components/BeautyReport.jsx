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
  const color = score >= 78 ? "#0d0d0d" : score >= 65 ? "#555" : "#bbb";
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
            color: m.score >= 78 ? "#fff" : "#777",
            background: m.score >= 78
              ? "linear-gradient(135deg, #0a0a0a, #2a2a2a)"
              : "#f5f5f5",
            borderRadius: 5, padding: "2px 9px",
          }}>{m.grade}</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: "#777" }}>{m.detail}</p>
      </div>
    </div>
  );
}

const PROBLEM_LABELS = {
  acne:             { en: 'Acne & Blemishes',  fr: 'Acné & Imperfections' },
  hyperpigmentation:{ en: 'Dark Spots',         fr: 'Taches sombres' },
  dryness:          { en: 'Hydration',          fr: 'Hydratation' },
  pores:            { en: 'Pores & Texture',    fr: 'Pores & Texture' },
  dark_circles:     { en: 'Under-Eye',          fr: 'Contour des yeux' },
  radiance:         { en: 'Radiance',           fr: 'Éclat' },
  texture:          { en: 'Skin Texture',       fr: 'Texture' },
};

function ProductCard({ product, lang, t }) {
  const [hovered, setHovered] = useState(false);
  const [btnAmazonHov, setBtnAmazonHov] = useState(false);
  const [btnSephoraHov, setBtnSephoraHov] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVis(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const labelObj = PROBLEM_LABELS[product.skin_problem];
  const label = labelObj ? (lang === 'fr' ? labelObj.fr : labelObj.en) : product.skin_problem;

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
        {label}
      </span>

      {/* Product name */}
      <div style={{
        fontSize: 16, fontWeight: 400, color: '#0d0d0d', marginBottom: 7,
        fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.01em', lineHeight: 1.3,
      }}>
        {product.product_name}
      </div>

      {/* Description */}
      <p style={{ margin: '0 0 18px', fontSize: 12.5, color: '#888', lineHeight: 1.75 }}>
        {product.product_description}
      </p>

      {/* Price + CTA row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{
          fontSize: 18, fontWeight: 300, color: '#0d0d0d',
          fontFamily: "'Cormorant Garamond', serif",
        }}>
          {product.price_range}
        </span>
        <div style={{ display: 'flex', gap: 7 }}>
          {product.amazon_affiliate_link && (
            <a
              href={product.amazon_affiliate_link}
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
          )}
          {product.sephora_affiliate_link && (
            <a
              href={product.sephora_affiliate_link}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default function BeautyReport({ data, products = [] }) {
  const { lang, t } = useLang();
  const [activeTab, setActiveTab] = useState("analysis");

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "#aaa", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{t('generatingReport')}</p>
      </div>
    );
  }

  const { overall, summary, faceShape, eyeColor, skinTone, metrics, strengths, improvements, recommendations } = data;

  return (
    <div style={{ background: "#f8f8f8", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "0 0 60px" }}>

      {/* ── Report header with gradient accent ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #ebebeb",
        padding: "36px 28px 28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle background gradient */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 100% at 50% -20%, rgba(0,0,0,0.03) 0%, transparent 100%)",
        }} />
        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <p style={{ margin: "0 0 5px", fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "#bbb", fontWeight: 600 }}>
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

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Hero score card ── */}
        <div style={{
          background: "#fff",
          border: "1px solid #ebebeb",
          borderRadius: 22,
          marginTop: 24,
          padding: "32px",
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
                background: "linear-gradient(160deg, #0d0d0d 0%, #3a3a3a 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                color: "transparent",
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
            {(metrics || []).slice(0, 3).map(m => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ position: "relative" }}>
                  <ScoreRing score={m.score} size={50}/>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a" }}>{m.score}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#888", width: 110, lineHeight: 1.4 }}>{m.label}</span>
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
        }}>
          {[
            { id: "analysis",  label: t('tabMetrics') },
            { id: "strengths", label: t('tabStrengths') },
            { id: "improve",   label: t('tabImprove') },
            { id: "recs",      label: t('tabRoutine') },
            { id: "shop",      label: t('tabShop') },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "10px 4px", border: "none", borderRadius: 10,
              background: activeTab === tab.id
                ? "linear-gradient(135deg, #0a0a0a, #1f1f1f)"
                : "transparent",
              color: activeTab === tab.id ? "#fff" : "#aaa",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              letterSpacing: "0.07em", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.22s ease",
              boxShadow: activeTab === tab.id ? "0 2px 10px rgba(0,0,0,0.2)" : "none",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ marginTop: 16 }}>

          {activeTab === "analysis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(metrics || []).map((m, i) => <MetricCard key={m.label} m={m} index={i}/>)}
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
              {(strengths || []).map((s, i) => (
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
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0d0d0d", marginBottom: 7, letterSpacing: "0.05em" }}>{s.title}</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "#777" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "improve" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(improvements || []).map((s, i) => (
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
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0d0d0d", marginBottom: 7, letterSpacing: "0.05em" }}>{s.title}</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "#777" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "recs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(recommendations || []).map((r, i) => (
                <div key={i} style={{
                  background: "#fff", border: "1px solid #ebebeb", borderRadius: 18,
                  padding: "24px",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0d0d0d" }}>{r.category}</span>
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
                        <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
