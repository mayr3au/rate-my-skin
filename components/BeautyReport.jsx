// ============================================================
// BeautyReport.jsx — Rate My Skin
// Drop this component into your Next.js project.
// Pass the `data` prop from your Claude API response.
// ============================================================
//
// CLAUDE API PROMPT to paste in your backend (pages/api/analyze.js):
//
// const SYSTEM_PROMPT = `You are a facial aesthetics analyst.
// Analyze the uploaded face photo and respond ONLY with a valid JSON object.
// No markdown, no explanation, just raw JSON.
// Use this exact structure:
// {
//   "overall": <number 0-100>,
//   "summary": "<2 sentence honest summary>",
//   "faceShape": "<e.g. Oval, Round, Square>",
//   "eyeColor": "<e.g. Brown, Blue-Grey>",
//   "skinTone": "<e.g. Fair / Type II>",
//   "metrics": [
//     { "label": "Facial Symmetry", "score": <0-100>, "grade": "<A/B/C+/etc>", "detail": "<1-2 sentence honest analysis>" },
//     { "label": "Bone Structure", "score": <0-100>, "grade": "...", "detail": "..." },
//     { "label": "Skin Condition", "score": <0-100>, "grade": "...", "detail": "..." },
//     { "label": "Eye Quality", "score": <0-100>, "grade": "...", "detail": "..." },
//     { "label": "Lip Proportion", "score": <0-100>, "grade": "...", "detail": "..." },
//     { "label": "Nose Proportion", "score": <0-100>, "grade": "...", "detail": "..." },
//     { "label": "Facial Thirds", "score": <0-100>, "grade": "...", "detail": "..." },
//     { "label": "Hair & Grooming", "score": <0-100>, "grade": "...", "detail": "..." }
//   ],
//   "strengths": [
//     { "title": "...", "desc": "..." },
//     { "title": "...", "desc": "..." },
//     { "title": "...", "desc": "..." }
//   ],
//   "improvements": [
//     { "title": "...", "desc": "..." },
//     { "title": "...", "desc": "..." },
//     { "title": "...", "desc": "..." }
//   ],
//   "recommendations": [
//     { "category": "Skincare", "priority": "HIGH", "items": ["...", "...", "..."] },
//     { "category": "Hair", "priority": "HIGH", "items": ["...", "..."] },
//     { "category": "Style", "priority": "MEDIUM", "items": ["...", "..."] }
//   ]
// }`;
//
// ============================================================

import { useState, useEffect } from "react";

const ICONS = ["✦", "◈", "◉", "▲", "◆", "●"];

function ScoreRing({ score, size = 64 }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 300);
    return () => clearTimeout(t);
  }, [score]);
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;
  const color = score >= 78 ? "#1a1a1a" : score >= 65 ? "#555" : "#aaa";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth="2.5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        strokeLinecap="round" />
    </svg>
  );
}

function MetricCard({ m, index }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 75 + 200);
    return () => clearTimeout(t);
  }, [index]);
  return (
    <div style={{
      background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16,
      padding: "20px 22px", display: "flex", gap: 18, alignItems: "flex-start",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <ScoreRing score={m.score} size={64} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {m.score}
          </span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a1a1a" }}>
            {m.label}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: m.score >= 78 ? "#fff" : "#666",
            background: m.score >= 78 ? "#1a1a1a" : "#f5f5f5",
            borderRadius: 4, padding: "2px 8px",
          }}>{m.grade}</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "#666" }}>{m.detail}</p>
      </div>
    </div>
  );
}

export default function BeautyReport({ data }) {
  const [activeTab, setActiveTab] = useState("analysis");

  // Fallback while loading
  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "#aaa", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Generating your report…</p>
      </div>
    );
  }

  const { overall, summary, faceShape, eyeColor, skinTone, metrics, strengths, improvements, recommendations } = data;

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "0 0 60px" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "32px 28px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#aaa", fontWeight: 600 }}>
            Rate My Skin · Aesthetic Analysis
          </p>
          <h1 style={{ margin: "0 0 2px", fontSize: 28, fontWeight: 300, color: "#0d0d0d", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.01em" }}>
            Your Facial Report
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
            AI-powered analysis · Not clinical or medical advice
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>

        {/* Hero score card */}
        <div style={{
          background: "#fff", border: "1px solid #e8e8e8", borderRadius: 20,
          marginTop: 24, padding: "28px", display: "flex", gap: 28,
          alignItems: "center", flexWrap: "wrap"
        }}>
          {/* Big score */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", fontWeight: 600 }}>
              Overall Score
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 72, fontWeight: 300, color: "#0d0d0d", lineHeight: 1, fontFamily: "'Cormorant Garamond', serif" }}>
                {overall}
              </span>
              <span style={{ fontSize: 24, color: "#bbb", fontFamily: "'Cormorant Garamond', serif" }}>/100</span>
            </div>
            <div style={{ background: "#f5f5f5", borderRadius: 100, height: 3, marginBottom: 16, overflow: "hidden" }}>
              <div style={{
                background: "#0d0d0d", borderRadius: 100, height: "100%", width: `${overall}%`,
                transition: "width 1.6s cubic-bezier(0.4,0,0.2,1)"
              }} />
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.75, color: "#555", fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" }}>
              {summary}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { k: "Face Shape", v: faceShape },
                { k: "Eye Color", v: eyeColor },
                { k: "Skin Tone", v: skinTone },
              ].map(t => (
                <div key={t.k} style={{ background: "#f8f8f8", borderRadius: 8, padding: "6px 12px" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", fontWeight: 600 }}>{t.k}</div>
                  <div style={{ fontSize: 12, color: "#1a1a1a", fontWeight: 500, marginTop: 1 }}>{t.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score rings summary — top 3 metrics */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(metrics || []).slice(0, 3).map(m => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <ScoreRing score={m.score} size={48} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a" }}>{m.score}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#666", width: 110 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 24, background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 4 }}>
          {[
            { id: "analysis", label: "Metrics" },
            { id: "strengths", label: "Strengths" },
            { id: "improve", label: "Improve" },
            { id: "recs", label: "Routine" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, padding: "9px 4px", border: "none", borderRadius: 8,
              background: activeTab === t.id ? "#0d0d0d" : "transparent",
              color: activeTab === t.id ? "#fff" : "#888",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              letterSpacing: "0.06em", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s ease"
            }}>{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ marginTop: 16 }}>

          {activeTab === "analysis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(metrics || []).map((m, i) => <MetricCard key={m.label} m={m} index={i} />)}
              <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { range: "78–100", label: "Strong", color: "#1a1a1a" },
                  { range: "65–77", label: "Average", color: "#555" },
                  { range: "0–64", label: "Below avg", color: "#aaa" },
                ].map(l => (
                  <div key={l.range} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                    <span style={{ fontSize: 11, color: "#888" }}>{l.range} — {l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "strengths" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(strengths || []).map((s, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "22px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: "#0d0d0d",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 14, color: "#fff"
                  }}>{ICONS[i] || "✦"}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0d0d0d", marginBottom: 6, letterSpacing: "0.04em" }}>{s.title}</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#666" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "improve" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(improvements || []).map((s, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "22px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: "#f5f5f5",
                    border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 13, color: "#555", fontWeight: 700,
                    fontFamily: "'Cormorant Garamond', serif"
                  }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0d0d0d", marginBottom: 6, letterSpacing: "0.04em" }}>{s.title}</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#666" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "recs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(recommendations || []).map((r, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "22px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0d0d0d" }}>{r.category}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                      color: r.priority === "HIGH" ? "#fff" : "#555",
                      background: r.priority === "HIGH" ? "#0d0d0d" : "#f0f0f0",
                      borderRadius: 4, padding: "3px 8px"
                    }}>{r.priority}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(r.items || []).map((item, j) => (
                      <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ccc", flexShrink: 0, marginTop: 6 }} />
                        <span style={{ fontSize: 13, color: "#555", lineHeight: 1.55 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share CTA */}
        <div style={{
          background: "#0d0d0d", borderRadius: 16, padding: "20px 24px",
          marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#fff", fontWeight: 600 }}>Share your score</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#888" }}>ratemyskin.ai</p>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(`I got ${overall}/100 on Rate My Skin 👁️ ratemyskin.ai`)}
            style={{
              background: "#fff", color: "#0d0d0d", border: "none",
              borderRadius: 8, padding: "10px 20px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.04em"
            }}>
            Copy & Share
          </button>
        </div>

        <div style={{ marginTop: 24, padding: "0 4px" }}>
          <p style={{ fontSize: 10, color: "#bbb", lineHeight: 1.7, textAlign: "center" }}>
            Scores reflect visible photographic data only · Not a medical or dermatological assessment
          </p>
        </div>
      </div>
    </div>
  );
}
