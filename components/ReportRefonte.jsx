import { useState, useMemo, useEffect } from "react";
import { useLang } from "../lib/LangContext";
import { sanitizeReport } from "../lib/textSanitizer";
import ProductImage from "./ProductImage";
import NavBar from "./NavBar";
import Footer from "./Footer";

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

/* Grammaire correcte FR pour chaque métrique */
const METRIC_PHRASE_FR = {
  hydration:    { articled: "l'hydratation", possessive: "ton hydratation", isPlural: false },
  radiance:     { articled: "l'éclat",       possessive: "ton éclat",       isPlural: false },
  acne:         { articled: "l'acné",        possessive: "ton acné",        isPlural: false },
  pores:        { articled: "les pores",     possessive: "tes pores",       isPlural: true  },
  dark_spots:   { articled: "les taches",    possessive: "tes taches",      isPlural: true  },
  dark_circles: { articled: "les cernes",    possessive: "tes cernes",      isPlural: true  },
  texture:      { articled: "la texture",    possessive: "ta texture",      isPlural: false },
  redness:      { articled: "les rougeurs",  possessive: "tes rougeurs",    isPlural: true  },
};
const METRIC_PHRASE_EN = {
  hydration:    { articled: "hydration",   possessive: "your hydration",   isPlural: false },
  radiance:     { articled: "radiance",    possessive: "your radiance",    isPlural: false },
  acne:         { articled: "acne",        possessive: "your acne",        isPlural: false },
  pores:        { articled: "pores",       possessive: "your pores",       isPlural: true  },
  dark_spots:   { articled: "dark spots",  possessive: "your dark spots",  isPlural: true  },
  dark_circles: { articled: "dark circles",possessive: "your dark circles",isPlural: true  },
  texture:      { articled: "texture",     possessive: "your texture",     isPlural: false },
  redness:      { articled: "redness",     possessive: "your redness",     isPlural: false },
};
function phraseFor(id, lang) {
  const map = lang === "fr" ? METRIC_PHRASE_FR : METRIC_PHRASE_EN;
  return map[id] || { articled: id, possessive: id, isPlural: false };
}

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
  const finalDash = (safeScore / 100) * 263.9;
  const [animDash, setAnimDash] = useState(0);
  const [animNum, setAnimNum] = useState(0);

  useEffect(() => {
    let start = null;
    const duration = 1600;
    // easeOutCubic
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let rafId;
    const tick = (ts) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      const e = ease(t);
      setAnimDash(finalDash * e);
      setAnimNum(Math.round(safeScore * e));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [safeScore, finalDash]);

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
          <g transform="rotate(-90 50 50)">
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#rfn-score-grad)" strokeWidth="5"
              strokeDasharray={`${animDash} 263.9`} strokeLinecap="round" opacity="0.55" filter="url(#rfn-arc-glow)" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#rfn-score-grad)" strokeWidth="4.2"
              strokeDasharray={`${animDash} 263.9`} strokeLinecap="round" />
          </g>
          <circle cx="50" cy="50" r="37" fill="none" stroke="#C9A961" strokeWidth="0.3" opacity="0.28" />
        </svg>
        <div className="rfn-gauge-num">
          <span className="rfn-gauge-n">{animNum}</span>
          <span className="rfn-gauge-d">/ 100</span>
        </div>
      </div>
      {/* Score scale bar — 0→100 rose→bleu→vert avec marqueur animé */}
      <div className="rfn-scale">
        <div className="rfn-scale-track">
          <div className="rfn-scale-marker" style={{ left: `${animNum}%` }}>
            <div className="rfn-scale-marker-num">{animNum}</div>
            <div className="rfn-scale-marker-arrow"></div>
          </div>
        </div>
        <div className="rfn-scale-labels">
          <span className="rfn-scale-lbl-l">{lang === "fr" ? "Priorité" : "Priority"}</span>
          <span className="rfn-scale-lbl-m">{lang === "fr" ? "À surveiller" : "Monitor"}</span>
          <span className="rfn-scale-lbl-r">{lang === "fr" ? "Excellent" : "Excellent"}</span>
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
  const fr = lang === "fr";
  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{fr ? "Tes 8 dimensions" : "Your 8 dimensions"}</h2>
        <span className="rfn-section-count">{fr ? `${visible.length} / 8 visibles` : `${visible.length} / 8 visible`}</span>
      </div>
      <div className="rfn-heatmap">
        {visible.map((m) => (
          <MetricCard key={m.id} metric={m} lang={lang} locked={false} />
        ))}
        {/* Desktop: show all 5 locked cards. Mobile: hidden via CSS. */}
        <div className="rfn-locked-desktop" style={{ display: "contents" }}>
          {locked.map((m) => (
            <MetricCard key={m.id} metric={m} lang={lang} locked={true} />
          ))}
        </div>
      </div>
      {/* Mobile-only compact locked block */}
      {locked.length > 0 && (
      <div className="rfn-locked-mobile">
        <div className="rfn-locked-mobile-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </div>
        <div className="rfn-locked-mobile-text">
          <strong>{fr ? `${locked.length} dimensions cachées` : `${locked.length} dimensions hidden`}</strong>
          <span>{fr ? "Débloque pour voir Cernes, Taches, Pores, Texture, Hydratation…" : "Unlock to see all metrics…"}</span>
        </div>
      </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Free-only value-adds: Diagnostic en clair, Atouts, Conseil offert
   ════════════════════════════════════════════════════════════════════════ */

const FREE_TIPS_FR = {
  hydration: (score) => `Ton hydratation à ${score}/100 indique une barrière cutanée fragilisée — pas un simple manque d'eau. Le vrai levier : applique ton hydratant sur peau encore humide (dans les 30 sec. après le nettoyage). L'absorption des actifs est jusqu'à 2× plus élevée sur peau humide que sur peau sèche.`,
  radiance: (score) => `Un éclat à ${score}/100 trahit un renouvellement cellulaire trop lent — pas un manque de crème. La vitamine C pure (L-ascorbique) appliquée le matin inhibe la mélanine et stimule la synthèse de collagène. Une exfoliation douce 2× par semaine libère les cellules mortes qui étouffent l'éclat.`,
  acne: (score) => `Ton score acné à ${score}/100 révèle un déséquilibre du microbiome cutané, pas un manque d'hygiène. Contre-intuitif : te laver le visage plus de 2 fois/jour aggrave l'acné — ta peau sur-stimule alors sa production de sébum pour compenser. Un nettoyage doux, 2× par jour, suffit.`,
  pores: (score) => `Tes pores à ${score}/100 sont dilatés parce que le sébum oxydé s'accumule à leur ouverture. Le niacinamide régule la sécrétion de sébum à la source (pas juste en surface). Associé au rétinol le soir, il affine visiblement le grain en 6 à 8 semaines — sans assécher.`,
  dark_spots: (score) => `Tes taches à ${score}/100 sont le résultat d'UVA accumulés — pas forcément de coups de soleil. Les UVA traversent les nuages et le verre de tes fenêtres. Un SPF 50+ quotidien est la seule barrière efficace pour stopper l'apparition de nouvelles taches dès aujourd'hui.`,
  dark_circles: (score) => `Tes cernes à ${score}/100 combinent souvent deux causes distinctes : une stase vasculaire (circulation ralentie) et un creux structural. La caféine topique réduit l'œdème en resserrant les vaisseaux. Appliquée le matin avec un tapotement doux (pas de frottement), elle réduit visiblement le gonflement en 15 minutes.`,
  texture: (score) => `Ta texture à ${score}/100 résulte d'une accumulation de cellules mortes dans les creux de ta peau — invisible mais palpable. Un AHA (acide glycolique ou lactique) 1× par semaine le soir dissout ces cellules chimiquement, sans friction abrasive. Résultat visible dès la 2e application.`,
  redness: (score) => `Tes rougeurs à ${score}/100 indiquent une sensibilisation de ta barrière cutanée. Le principal déclencheur souvent ignoré : l'eau chaude au lavage. Au-dessus de 37°C, l'eau dissout les lipides protecteurs de ta peau et déclenche l'inflammation. L'eau tiède ou fraîche change tout.`,
};
const FREE_TIPS_EN = {
  hydration: (score) => `Your hydration at ${score}/100 signals a compromised skin barrier — not just dehydration. The real fix: apply your moisturizer on damp skin within 30 seconds of cleansing. Absorption of actives is up to 2× higher on damp vs dry skin.`,
  radiance: (score) => `Radiance at ${score}/100 means cellular turnover is too slow — no cream alone will fix that. Pure vitamin C (L-ascorbic acid) in the morning inhibits melanin and stimulates collagen. Gentle exfoliation 2×/week removes the dead cell layer dimming your glow.`,
  acne: (score) => `Your acne score of ${score}/100 points to a microbiome imbalance, not poor hygiene. Counter-intuitively: washing more than twice a day worsens acne — your skin overproduces sebum to compensate. Gentle cleansing, twice a day, is enough.`,
  pores: (score) => `Your pores at ${score}/100 are enlarged because oxidized sebum builds up at the opening. Niacinamide regulates sebum production at the source (not just on the surface). Paired with evening retinol, it visibly refines texture in 6–8 weeks — without stripping.`,
  dark_spots: (score) => `Your dark spots at ${score}/100 come from accumulated UVA damage — not just sunburns. UVA rays penetrate clouds and glass windows. A daily SPF 50+ is the only effective barrier to stop new spots from forming starting today.`,
  dark_circles: (score) => `Your dark circles at ${score}/100 usually combine two root causes: vascular stasis (slow circulation) and structural shadowing. Topical caffeine reduces puffiness by constricting blood vessels. Applied in the morning with gentle tapping (never rubbing), it visibly reduces swelling in 15 minutes.`,
  texture: (score) => `Your texture at ${score}/100 results from dead cell buildup in your skin's grooves — invisible but felt. An AHA (glycolic or lactic acid) once a week at night dissolves these cells chemically, without scrubbing. Visible improvement from the second application.`,
  redness: (score) => `Your redness at ${score}/100 signals a sensitized skin barrier. The most overlooked trigger: hot water when cleansing. Above 37°C, water dissolves your skin's protective lipids and triggers inflammation. Lukewarm or cool water makes a significant difference.`,
};

function PersonalAnalysis({ score, topConcern, lang }) {
  const fr = lang === "fr";
  const phrase = phraseFor(topConcern?.id, lang);
  const bracket = score >= 75 ? "high" : score >= 55 ? "mid" : "low";
  // Conjugaison correcte selon pluriel
  const verbFreine = fr ? (phrase.isPlural ? "freinent" : "freine") : (phrase.isPlural ? "are holding back" : "is holding back");
  const verbAlarme = fr ? (phrase.isPlural ? "envoient" : "envoie") : (phrase.isPlural ? "are sending" : "is sending");

  const text = fr
    ? bracket === "high"
      ? <>Ta peau est en <strong>bonne santé globale</strong>. Quelques détails à affiner sur <strong>{phrase.articled}</strong> pourraient te faire passer dans le top 10%.</>
      : bracket === "mid"
        ? <>Ta peau a un <strong>vrai potentiel</strong> — <strong>{phrase.articled}</strong> {verbFreine} sa progression. Quelques ajustements ciblés peuvent transformer ton score en 8 semaines.</>
        : <>Ta peau envoie des <strong>signaux d'alarme</strong>, notamment sur <strong>{phrase.articled}</strong>. Une routine adaptée peut renverser la tendance rapidement.</>
    : bracket === "high"
      ? <>Your skin is in <strong>great overall shape</strong>. Refining <strong>{phrase.articled}</strong> could push you into the top 10%.</>
      : bracket === "mid"
        ? <>Your skin has <strong>real potential</strong> — <strong>{phrase.articled}</strong> {verbFreine} your glow. Targeted tweaks can transform your score in 8 weeks.</>
        : <>Your skin is showing <strong>distress signals</strong>, particularly around <strong>{phrase.articled}</strong>. The right routine can reverse this fast.</>;

  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{fr ? "Diagnostic en clair" : "Plain-language diagnosis"}</h2>
      </div>
      <div className="rfn-personal-card">
        <span className="rfn-personal-mark">❝</span>
        <p className="rfn-personal-text">{text}</p>
      </div>
    </div>
  );
}

function StrengthsShowcase({ metrics, lang }) {
  const fr = lang === "fr";
  const labels = fr ? METRIC_LABELS_FR : METRIC_LABELS_EN;
  const strengths = metrics.filter((m) => m.score >= 75).sort((a, b) => b.score - a.score).slice(0, 2);
  if (strengths.length === 0) return null;
  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{fr ? "Tes atouts" : "Your strengths"}</h2>
        <span className="rfn-section-count">{fr ? "À célébrer" : "To celebrate"}</span>
      </div>
      <div className="rfn-strengths">
        {strengths.map((m, i) => (
          <div key={m.id} className="rfn-strength-card">
            <div className="rfn-strength-medal">
              <svg viewBox="0 0 60 60">
                <defs>
                  <linearGradient id={`rfn-medal-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E8C988" />
                    <stop offset="100%" stopColor="#A88947" />
                  </linearGradient>
                </defs>
                <circle cx="30" cy="30" r="26" fill="url(#rfn-medal-${i})" opacity="0.18" />
                <circle cx="30" cy="30" r="22" fill="none" stroke={`url(#rfn-medal-${i})`} strokeWidth="2" />
                <circle cx="30" cy="30" r="14" fill={`url(#rfn-medal-${i})`} opacity="0.4" />
              </svg>
              <span className="rfn-strength-medal-num">{m.score}</span>
            </div>
            <div className="rfn-strength-info">
              <div className="rfn-strength-label">{labels[m.id] || m.label}</div>
              <div className="rfn-strength-tag">{fr ? "Top 10% des utilisateurs" : "Top 10% of users"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrajectoryTimeline({ score, lang }) {
  const fr = lang === "fr";
  const from = Math.max(1, Math.min(100, Math.round(score || 0)));
  const to = Math.min(100, from + 20);
  const diff = to - from;
  const diffStr = "+" + diff;
  const w2 = Math.round(from + diff * 0.25);
  const w4 = Math.round(from + diff * 0.55);

  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{fr ? "Ta projection 8 semaines" : "Your 8-week projection"}</h2>
        <span className="rfn-section-count">{fr ? "Évolution attendue" : "Expected"}</span>
      </div>
      <div className="rfn-traj-card">
        <p className="rfn-traj-intro">
          {fr
            ? <>En suivant une routine adaptée, <strong>ta peau peut gagner {diffStr} points en 8 semaines.</strong></>
            : <>Following a tailored routine, <strong>your skin can gain {diffStr} points in 8 weeks.</strong></>}
        </p>
        <div className="rfn-traj-timeline">
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ width: "100%", height: "70px", position: "absolute", top: "16px", left: 0, pointerEvents: "none" }}>
            <defs>
              <linearGradient id="rfn-traj-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D199AB" />
                <stop offset="100%" stopColor="#7AAE98" />
              </linearGradient>
              <linearGradient id="rfn-traj-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C9A961" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 6 60 Q 80 50 150 30 T 294 8 L 294 100 L 6 100 Z" fill="url(#rfn-traj-fill)" />
            <path d="M 6 60 Q 80 50 150 30 T 294 8" stroke="url(#rfn-traj-line)" strokeWidth="2.2" fill="none" />
          </svg>
          <div className="rfn-traj-points">
            <div className="rfn-traj-pt rfn-traj-pt-from">
              <span className="rfn-traj-pt-dot"></span>
              <span className="rfn-traj-pt-val">{from}</span>
              <span className="rfn-traj-pt-lbl">{fr ? "Auj." : "Now"}</span>
            </div>
            <div className="rfn-traj-pt">
              <span className="rfn-traj-pt-dot rfn-traj-pt-dot-mid"></span>
              <span className="rfn-traj-pt-val rfn-traj-pt-val-soft">{w2}</span>
              <span className="rfn-traj-pt-lbl">{fr ? "S. 2" : "W. 2"}</span>
            </div>
            <div className="rfn-traj-pt">
              <span className="rfn-traj-pt-dot rfn-traj-pt-dot-mid"></span>
              <span className="rfn-traj-pt-val rfn-traj-pt-val-soft">{w4}</span>
              <span className="rfn-traj-pt-lbl">{fr ? "S. 4" : "W. 4"}</span>
            </div>
            <div className="rfn-traj-pt rfn-traj-pt-to">
              <span className="rfn-traj-pt-dot"></span>
              <span className="rfn-traj-pt-val">{to}</span>
              <span className="rfn-traj-pt-lbl">{fr ? "S. 8" : "W. 8"}</span>
            </div>
          </div>
        </div>
        <div className="rfn-traj-stats">
          <div className="rfn-traj-stat">
            <div className="rfn-traj-stat-num">{diffStr}</div>
            <div className="rfn-traj-stat-lbl">{fr ? "Points gagnés" : "Points gained"}</div>
          </div>
          <div className="rfn-traj-stat">
            <div className="rfn-traj-stat-num">8</div>
            <div className="rfn-traj-stat-lbl">{fr ? "Semaines" : "Weeks"}</div>
          </div>
          <div className="rfn-traj-stat">
            <div className="rfn-traj-stat-num">{fr ? "82%" : "82%"}</div>
            <div className="rfn-traj-stat-lbl">{fr ? "Y arrivent" : "Reach it"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Free Cleanser Teaser — step 1 of routine
   ════════════════════════════════════════════════════════════════════════ */

const CLEANSER_BY_CONCERN_FR = {
  hydration: { name: "Toleriane Caring Wash", brand: "La Roche-Posay", price: "13,50 €", why: "Nettoie sans agresser la barrière, préserve l'hydratation.", actives: "Glycérine · Niacinamide" },
  acne: { name: "Effaclar Gel Moussant", brand: "La Roche-Posay", price: "13,90 €", why: "Élimine l'excès de sébum sans assécher.", actives: "Zinc PCA · Eau Thermale" },
  pores: { name: "Effaclar Gel Moussant", brand: "La Roche-Posay", price: "13,90 €", why: "Élimine l'excès de sébum sans assécher.", actives: "Zinc PCA · Eau Thermale" },
  texture: { name: "CeraVe SA Smoothing Cleanser", brand: "CeraVe", price: "14,90 €", why: "Exfolie en douceur grâce à l'acide salicylique.", actives: "Acide Salicylique · Céramides" },
  dark_spots: { name: "Vitamin C Cleansing Foam", brand: "Caudalie", price: "16,00 €", why: "Réveille l'éclat dès le nettoyage.", actives: "Vitamine C · Antioxydants" },
  radiance: { name: "Vitamin C Cleansing Foam", brand: "Caudalie", price: "16,00 €", why: "Réveille l'éclat dès le nettoyage.", actives: "Vitamine C · Antioxydants" },
  redness: { name: "Toleriane Caring Wash", brand: "La Roche-Posay", price: "13,50 €", why: "Apaise les peaux sensibles, sans tensioactifs agressifs.", actives: "Glycérine · Eau Thermale" },
  dark_circles: { name: "Toleriane Caring Wash", brand: "La Roche-Posay", price: "13,50 €", why: "Nettoie le contour des yeux en douceur.", actives: "Glycérine · Niacinamide" },
};
const CLEANSER_BY_CONCERN_EN = {
  hydration: { name: "Toleriane Caring Wash", brand: "La Roche-Posay", price: "€13.50", why: "Cleanses without disrupting the barrier, preserves hydration.", actives: "Glycerin · Niacinamide" },
  acne: { name: "Effaclar Foaming Gel", brand: "La Roche-Posay", price: "€13.90", why: "Removes excess sebum without drying.", actives: "Zinc PCA · Thermal Water" },
  pores: { name: "Effaclar Foaming Gel", brand: "La Roche-Posay", price: "€13.90", why: "Removes excess sebum without drying.", actives: "Zinc PCA · Thermal Water" },
  texture: { name: "CeraVe SA Smoothing Cleanser", brand: "CeraVe", price: "€14.90", why: "Gently exfoliates with salicylic acid.", actives: "Salicylic Acid · Ceramides" },
  dark_spots: { name: "Vitamin C Cleansing Foam", brand: "Caudalie", price: "€16.00", why: "Wakes up radiance from cleansing.", actives: "Vitamin C · Antioxidants" },
  radiance: { name: "Vitamin C Cleansing Foam", brand: "Caudalie", price: "€16.00", why: "Wakes up radiance from cleansing.", actives: "Vitamin C · Antioxidants" },
  redness: { name: "Toleriane Caring Wash", brand: "La Roche-Posay", price: "€13.50", why: "Soothes sensitive skin, no harsh surfactants.", actives: "Glycerin · Thermal Water" },
  dark_circles: { name: "Toleriane Caring Wash", brand: "La Roche-Posay", price: "€13.50", why: "Gently cleanses the eye area.", actives: "Glycerin · Niacinamide" },
};

function CleanserTeaser({ topConcern, lang }) {
  const fr = lang === "fr";
  const map = fr ? CLEANSER_BY_CONCERN_FR : CLEANSER_BY_CONCERN_EN;
  const product = map[topConcern?.id] || map.hydration;
  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{fr ? "Ton 1er produit, offert" : "Your 1st product, free"}</h2>
        <span className="rfn-section-count">{fr ? "Aperçu routine" : "Routine preview"}</span>
      </div>
      <div className="rfn-cleanser-card">
        <div className="rfn-cleanser-step">
          <span className="rfn-cleanser-step-num">01</span>
          <span className="rfn-cleanser-step-lbl">{fr ? "Nettoyage" : "Cleanse"}</span>
        </div>
        <div className="rfn-cleanser-body">
          <div className="rfn-cleanser-tag">{fr ? "Adapté à ta peau" : "Tailored to your skin"}</div>
          <h3 className="rfn-cleanser-name">{product.name}</h3>
          <div className="rfn-cleanser-brand">{product.brand} · <span className="rfn-cleanser-price">{product.price}</span></div>
          <p className="rfn-cleanser-why">{product.why}</p>
          <div className="rfn-cleanser-actives">
            <span className="rfn-cleanser-actives-lbl">{fr ? "Actifs clés" : "Key actives"}</span>
            <span className="rfn-cleanser-actives-val">{product.actives}</span>
          </div>
        </div>
      </div>
      <div className="rfn-cleanser-locked">
        <div className="rfn-cleanser-locked-dots">
          <span className="rfn-cleanser-locked-num">02</span>
          <span className="rfn-cleanser-locked-num">03</span>
          <span className="rfn-cleanser-locked-num">04</span>
        </div>
        <div className="rfn-cleanser-locked-text">
          <strong>{fr ? "3 étapes restantes" : "3 steps remaining"}</strong>
          <span>{fr ? "Sérum · Hydratant · Protection SPF" : "Serum · Moisturizer · SPF"}</span>
        </div>
      </div>
    </div>
  );
}

function FreeTip({ topConcern, lang }) {
  const fr = lang === "fr";
  const tips = fr ? FREE_TIPS_FR : FREE_TIPS_EN;
  const tipFn = tips[topConcern?.id];
  const score = topConcern?.score ?? 70;
  const fallbackTip = fr
    ? `Hydrate-toi de l'intérieur et applique un SPF 50 chaque matin — c'est la base de toute routine efficace.`
    : "Hydrate from within and apply SPF 50 every morning — that's the foundation of any effective routine.";
  const rawTip = typeof tipFn === "function" ? tipFn(score) : fallbackTip;
  const tip = typeof rawTip === "string" ? rawTip : String(rawTip ?? fallbackTip);
  const phrase = phraseFor(topConcern?.id, lang);
  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{fr ? "Insight IA offert" : "Free AI insight"}</h2>
        <span className="rfn-section-count">{fr ? "Sans paiement" : "No payment"}</span>
      </div>
      <div className="rfn-tip-card">
        <div className="rfn-tip-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.7.5 1 1.3 1 2.1V18h6v-1.2c0-.8.3-1.6 1-2.1A7 7 0 0 0 12 2z" />
          </svg>
        </div>
        <div className="rfn-tip-body">
          <div className="rfn-tip-tag">{fr ? "Diagnostic · " : "Insight · "}{phrase.articled}</div>
          <p className="rfn-tip-text">{tip}</p>
        </div>
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

/* Anatomically correct hotspot positions on the face SVG
   Face SVG viewBox 0 0 200 260, container height 260px.
   y references: forehead 30-90, eyes 100, nose 110-145, lips 168, chin 200-225 */
const ZONE_BY_METRIC = {
  // Pores: tip of nose (T-zone)
  pores: { top: "52%", left: "50%" },

  // Dark circles: directly under each eye
  dark_circles_l: { top: "44%", left: "37%" },
  dark_circles_r: { top: "44%", left: "59%" },

  // Hydration: mid-cheeks (lower)
  hydration_l: { top: "62%", left: "30%" },
  hydration_r: { top: "62%", left: "66%" },

  // Texture: between eye and cheekbone
  texture_l: { top: "55%", left: "32%" },
  texture_r: { top: "55%", left: "64%" },

  // Acne: chin
  acne: { top: "82%", left: "50%" },

  // Redness: cheekbones
  redness_l: { top: "50%", left: "34%" },
  redness_r: { top: "50%", left: "62%" },

  // Dark spots: upper cheeks / under temples
  dark_spots_l: { top: "38%", left: "28%" },
  dark_spots_r: { top: "38%", left: "68%" },

  // Radiance: forehead center
  radiance: { top: "24%", left: "50%" },
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
          <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="rfn-face-shade" cx="50%" cy="42%" r="58%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                <stop offset="70%" stopColor="#FBF6EE" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#F5EBDB" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Face — oval doux, mâchoire affinée */}
            <path
              d="M 100 32
                 C 82 32, 66 50, 62 78
                 C 58 108, 62 138, 72 165
                 C 80 188, 90 210, 100 224
                 C 110 210, 120 188, 128 165
                 C 138 138, 142 108, 138 78
                 C 134 50, 118 32, 100 32 Z"
              fill="url(#rfn-face-shade)"
              stroke="#C9A961" strokeWidth="1.2" opacity="0.9"
            />

            {/* Sourcils — arcs fins */}
            <path d="M 70 86 Q 78 82 86 86" stroke="#C9A961" strokeWidth="1.1" fill="none" opacity="0.4" strokeLinecap="round" />
            <path d="M 114 86 Q 122 82 130 86" stroke="#C9A961" strokeWidth="1.1" fill="none" opacity="0.4" strokeLinecap="round" />

            {/* Yeux — amande */}
            <path d="M 70 100 Q 78 95 86 100 Q 78 105 70 100 Z" fill="#C9A961" opacity="0.5" />
            <path d="M 114 100 Q 122 95 130 100 Q 122 105 114 100 Z" fill="#C9A961" opacity="0.5" />
            <circle cx="78" cy="100" r="1.3" fill="#5C4A3A" opacity="0.6" />
            <circle cx="122" cy="100" r="1.3" fill="#5C4A3A" opacity="0.6" />

            {/* Nez */}
            <path d="M 100 110 L 100 130 Q 100 140 95 142 M 100 142 Q 105 140 105 142"
              fill="none" stroke="#C9A961" strokeWidth="1" opacity="0.42" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 95 142 Q 100 145 105 142" stroke="#C9A961" strokeWidth="0.9" fill="none" opacity="0.32" strokeLinecap="round" />

            {/* Lèvres — courbe douce avec ombre subtile */}
            <path d="M 86 168 Q 100 162 114 168 Q 100 172 86 168 Z"
              fill="#C9A961" opacity="0.18" />
            <path d="M 86 168 Q 93 165 100 167 Q 107 165 114 168" stroke="#C9A961" strokeWidth="0.9" fill="none" opacity="0.45" strokeLinecap="round" />
            <path d="M 88 168 Q 100 175 112 168" stroke="#C9A961" strokeWidth="0.7" fill="none" opacity="0.28" strokeLinecap="round" />

            {/* Menton — ombre légère */}
            <path d="M 92 200 Q 100 206 108 200" stroke="#C9A961" strokeWidth="0.6" fill="none" opacity="0.16" strokeLinecap="round" />
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

function RoutineStep({ s, i, lang, label }) {
  const [open, setOpen] = useState(false);
  const hasDetails = !!(s.why || s.howTo);
  return (
    <div className={"rfn-step" + (open ? " rfn-step-open" : "")}>
      <div className="rfn-step-thumb">
        {s.imageUrl ? (
          <ProductImage src={s.imageUrl} alt={s.productName} sizes="56px" />
        ) : (
          <span className="rfn-step-num-fallback">{i + 1}</span>
        )}
      </div>
      <div className="rfn-step-body">
        <div className="rfn-step-label">{label}</div>
        <div className="rfn-step-product">{s.productName || s.text}</div>
        {(s.brand || s.price) && (
          <div className="rfn-step-brand">
            {s.brand}{s.brand && s.price ? " · " : ""}
            {s.price && <span className="rfn-step-price">{s.price}</span>}
          </div>
        )}
        {hasDetails && (
          <button
            type="button"
            className={"rfn-step-toggle" + (open ? " open" : "")}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open
              ? (lang === "fr" ? "Masquer les conseils" : "Hide tips")
              : (lang === "fr" ? "Conseils & application" : "Tips & application")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        )}
        {open && (
          <div className="rfn-step-details">
            {s.why && (
              <div className="rfn-step-note rfn-step-why">
                <span className="rfn-step-note-label">{lang === "fr" ? "Pour ton problème" : "For your concern"}</span>
                <span className="rfn-step-note-text">{s.why}</span>
              </div>
            )}
            {s.howTo && (
              <div className="rfn-step-note rfn-step-how">
                <span className="rfn-step-note-label">{lang === "fr" ? "Comment l'appliquer" : "How to apply"}</span>
                <span className="rfn-step-note-text">{s.howTo}</span>
              </div>
            )}
          </div>
        )}
        {s.productUrl && (
          <a className="rfn-step-buy" href={s.productUrl} target="_blank" rel="noopener noreferrer">
            {lang === "fr" ? "Voir le produit" : "View product"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
          </a>
        )}
      </div>
    </div>
  );
}

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
          howTo: s.productData?.applicationTip || s.applicationTip || s.howTo || s.stepText || s.text || null,
          why: s.productData?.whyItHelps || s.whyItHelps || s.why || null,
          imageUrl: s.productData?.product_image_url || s.productData?.imageUrl || s.product_image_url || s.imageUrl || null,
          productUrl:
            s.productData?.amazon_link || s.productData?.amazonLink ||
            s.productData?.sephora_link || s.productData?.sephoraLink ||
            s.productData?.amazon_url || s.productData?.sephora_url || s.productData?.product_url ||
            s.amazon_link || s.sephora_link || null,
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
        {steps.map((s, i) => (
          <RoutineStep key={`${tab}-${i}`} s={s} i={i} lang={lang} label={stepLabel(s.stepType, i)} />
        ))}
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

const TESTIMONIALS_FR = [
  {
    initials: "S",
    color: "#D199AB",
    name: "Sarah",
    meta: "28 ans · acné + taches",
    before: 54,
    after: 82,
    weeks: 12,
    quote: "Je pensais que mes boutons c'était mon alimentation. Le rapport m'a montré que c'était le frottement de ma taie et un nettoyant trop agressif. Score passé de 54 à 82.",
  },
  {
    initials: "L",
    color: "#9AB5CE",
    name: "Léa",
    meta: "24 ans · peau mixte",
    before: 61,
    after: 79,
    weeks: 6,
    quote: "Je croyais que mes cernes étaient génétiques. En fait c'était un manque de caféine topique. 6 semaines plus tard, mes collègues me demandent si je dors mieux.",
  },
  {
    initials: "M",
    color: "#7AAE98",
    name: "Marine",
    meta: "32 ans · peau sensible",
    before: 67,
    after: 88,
    weeks: 8,
    quote: "Le diagnostic a expliqué pourquoi ma peau réagissait à tout. J'avais une barrière cutanée fragilisée, pas une allergie. 8 semaines sans rougeur, enfin.",
  },
];
const TESTIMONIALS_EN = [
  {
    initials: "S",
    color: "#D199AB",
    name: "Sarah",
    meta: "28 · acne + dark spots",
    before: 54,
    after: 82,
    weeks: 12,
    quote: "I thought my breakouts were from diet. The report showed it was pillowcase friction and a harsh cleanser. Score went from 54 to 82.",
  },
  {
    initials: "L",
    color: "#9AB5CE",
    name: "Léa",
    meta: "24 · combination skin",
    before: 61,
    after: 79,
    weeks: 6,
    quote: "I thought my dark circles were genetic. Turned out it was a lack of topical caffeine. 6 weeks later, my coworkers ask if I've been sleeping better.",
  },
  {
    initials: "M",
    color: "#7AAE98",
    name: "Marine",
    meta: "32 · sensitive skin",
    before: 67,
    after: 88,
    weeks: 8,
    quote: "The diagnosis explained why my skin reacted to everything. I had a compromised barrier — not an allergy. 8 weeks with no redness at all.",
  },
];

function TestimonialBlock({ lang }) {
  const fr = lang === "fr";
  const list = fr ? TESTIMONIALS_FR : TESTIMONIALS_EN;
  return (
    <div className="rfn-section">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{fr ? "Ce qu'elles disent" : "What they say"}</h2>
        <span className="rfn-section-count">★★★★★ 4,9 / 5</span>
      </div>
      <div className="rfn-testi-list">
        {list.map((t, i) => (
          <div key={i} className="rfn-testi-card">
            <div className="rfn-testi-top">
              <div className="rfn-testi-avatar" style={{ background: t.color }}>
                {t.initials}
              </div>
              <div className="rfn-testi-meta">
                <strong className="rfn-testi-name">{t.name}</strong>
                <span className="rfn-testi-sub">{t.meta}</span>
              </div>
              <div className="rfn-testi-score">
                <span className="rfn-testi-before">{t.before}</span>
                <span className="rfn-testi-arrow">→</span>
                <span className="rfn-testi-after">{t.after}</span>
                <span className="rfn-testi-weeks">{fr ? `${t.weeks} sem.` : `${t.weeks} wks`}</span>
              </div>
            </div>
            <p className="rfn-testi-quote">"{t.quote}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Paywall (free)
   ════════════════════════════════════════════════════════════════════════ */

const PAYWALL_FEATURES_FR = [
  "8 scores détaillés avec interprétation complète",
  "Routine matin + soir sur-mesure (4 étapes)",
  "6 produits adaptés à ton budget avec liens",
  "Plan de progression semaine par semaine (8 sem.)",
  "Rescan dans 2 mois : ton évolution réelle, score par score",
  "Carte visage complète · PDF téléchargeable",
];
const PAYWALL_FEATURES_EN = [
  "8 detailed scores with full interpretation",
  "Custom morning + evening routine (4 steps each)",
  "6 budget-matched product picks with links",
  "Week-by-week progression plan (8 weeks)",
  "Rescan in 2 months: your real progress, score by score",
  "Full face map · Downloadable PDF report",
];

function Paywall({ onUnlock, unlocking, lang, score = 0 }) {
  const fr = lang === "fr";
  const features = fr ? PAYWALL_FEATURES_FR : PAYWALL_FEATURES_EN;
  const base = Math.max(1, Math.round(score || 0));
  const target = Math.min(97, base + Math.max(6, Math.round((100 - base) * 0.5)));
  const [selected, setSelected] = useState("pack");
  const plans = [
    {
      id: "single",
      name: fr ? "1 rapport" : "1 report",
      desc: fr ? "Ce rapport complet" : "This full report",
      note: fr ? "Rescan dans 2 mois inclus" : "Rescan in 2 months included",
      price: "7,99 €",
      unit: fr ? "Paiement unique" : "One-time",
    },
    {
      id: "pack",
      name: fr ? "Pack 5 analyses" : "5-analysis pack",
      desc: fr ? "Ce rapport + 4 analyses de suivi" : "This report + 4 follow-up scans",
      price: "19,99 €",
      old: "39,95 €",
      badge: "-50%",
      unit: fr ? "3,99 € / analyse" : "€3.99 / scan",
      popular: true,
    },
  ];
  return (
    <div className="rfn-paywall">
      {/* Header */}
      <div className="rfn-pw-head">
        <span className="rfn-pw-eyebrow">✦ {fr ? "Rapport complet" : "Full report"}</span>
        <h2 className="rfn-pw-title">
          {fr ? "Ton plan sur-mesure t'attend" : "Your tailored plan is ready"}
        </h2>
        <p className="rfn-pw-sub">
          {fr
            ? <>Objectif <strong>{target}/100 en 8 semaines</strong> — routine, produits et suivi inclus.</>
            : <>Target <strong>{target}/100 in 8 weeks</strong> — routine, products and tracking included.</>}
        </p>
      </div>

      {/* Plan selector */}
      <div className="rfn-pw-plans">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p.id)}
            className={`rfn-pw-plan${selected === p.id ? " rfn-pw-plan-on" : ""}${p.popular ? " rfn-pw-plan-pop" : ""}`}
          >
            {p.popular && <span className="rfn-pw-plan-flag">{fr ? "Le plus choisi" : "Most popular"}</span>}
            <span className="rfn-pw-plan-radio" />
            <span className="rfn-pw-plan-info">
              <span className="rfn-pw-plan-name">{p.name}</span>
              <span className="rfn-pw-plan-desc">{p.desc}</span>
              {p.note && (
                <span className="rfn-pw-plan-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v5h-5"/></svg>
                  {p.note}
                </span>
              )}
            </span>
            <span className="rfn-pw-plan-pricecol">
              {p.badge && <span className="rfn-pw-plan-badge">{p.badge}</span>}
              <span className="rfn-pw-plan-price">{p.price}</span>
              {p.old && <span className="rfn-pw-plan-old">{p.old}</span>}
              <span className="rfn-pw-plan-unit">{p.unit}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Compare anchor */}
      <div className="rfn-pw-anchor">
        {fr ? "Équivalent consultation dermato" : "Dermatology consult equivalent"}
        <span className="rfn-pw-strike">40 – 60 €</span>
      </div>

      {/* Features */}
      <div className="rfn-pw-features-title">{fr ? "Ce que tu débloques" : "What you unlock"}</div>
      <ul className="rfn-features">
        {features.map((f, i) => (
          <li key={i} className="rfn-feature-item">
            <span className="rfn-feature-check">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button onClick={() => onUnlock(selected)} disabled={unlocking} className="rfn-cta">
        <span className="rfn-cta-star">✦</span>
        {unlocking
          ? (fr ? "Redirection..." : "Redirecting...")
          : (fr
              ? `Débloquer — ${selected === "pack" ? "19,99 €" : "7,99 €"}`
              : `Unlock — ${selected === "pack" ? "€19.99" : "€7.99"}`)}
      </button>

      {/* Trust row */}
      <div className="rfn-pw-trust">
        <div className="rfn-pw-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          <span>{fr ? "Paiement sécurisé" : "Secure payment"}</span>
        </div>
        <div className="rfn-pw-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>
          <span>{fr ? "Accès immédiat" : "Instant access"}</span>
        </div>
        <div className="rfn-pw-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
          <span>{fr ? "Remboursé 7 j" : "7-day refund"}</span>
        </div>
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
   Section: Rescan in 2 months — real progress check, paid only
   ════════════════════════════════════════════════════════════════════════ */

function RescanCard({ lang, score = 0 }) {
  const fr = lang === "fr";
  const [scheduled, setScheduled] = useState(false);
  const target = new Date();
  target.setMonth(target.getMonth() + 2);
  const monthLabel = target.toLocaleDateString(fr ? "fr-FR" : "en-US", { month: "long", year: "numeric" });

  useEffect(() => {
    try { if (localStorage.getItem("rms_rescan_target")) setScheduled(true); } catch (e) {}
  }, []);

  const schedule = () => {
    try { localStorage.setItem("rms_rescan_target", target.toISOString()); } catch (e) {}
    setScheduled(true);
  };

  const base = Math.max(1, Math.round(score || 0));

  return (
    <div className="rfn-section">
      <div className="rfn-rescan">
        <div className="rfn-rescan-badge">{fr ? "Suivi inclus" : "Tracking included"}</div>
        <div className="rfn-rescan-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v5h-5" />
          </svg>
        </div>
        <h2 className="rfn-rescan-title">{fr ? "Reviens vérifier ton évolution réelle" : "Come back to check your real progress"}</h2>
        <p className="rfn-rescan-text">
          {fr
            ? "Dans 2 mois, refais un scan. On compare ton avant/après score par score et on te livre un commentaire personnalisé sur tes vrais progrès — pas une promesse, des chiffres."
            : "In 2 months, take a new scan. We compare your before/after score by score and give you a personalised note on your real progress — not a promise, actual numbers."}
        </p>

        <div className="rfn-rescan-compare">
          <div className="rfn-rescan-now">
            <span className="rfn-rescan-now-label">{fr ? "Aujourd'hui" : "Today"}</span>
            <span className="rfn-rescan-now-score">{base}</span>
          </div>
          <span className="rfn-rescan-arrow">→</span>
          <div className="rfn-rescan-next">
            <span className="rfn-rescan-next-label">{monthLabel}</span>
            <span className="rfn-rescan-next-score">?</span>
          </div>
        </div>

        <button
          type="button"
          className={"rfn-rescan-cta" + (scheduled ? " done" : "")}
          onClick={schedule}
          disabled={scheduled}
        >
          {scheduled ? (
            <>✓ {fr ? `Rappel programmé · ${monthLabel}` : `Reminder set · ${monthLabel}`}</>
          ) : (
            <>{fr ? `Programmer mon rescan · ${monthLabel}` : `Schedule my rescan · ${monthLabel}`}</>
          )}
        </button>
        <p className="rfn-rescan-hint">
          {fr
            ? "Avec le pack 5 analyses, tes 4 scans de suivi sont déjà inclus."
            : "With the 5-analysis pack, your 4 follow-up scans are already included."}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Section: Improvement Space (2 months) — warm closing, paid only
   ════════════════════════════════════════════════════════════════════════ */

function HeartMark() {
  // Custom RateMySkin heart: gold gradient heart with a brand sparkle inside
  return (
    <svg className="rfn-heart-mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="rfnHeartGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E3C27A" />
          <stop offset="55%" stopColor="#C9A961" />
          <stop offset="100%" stopColor="#B08D3C" />
        </linearGradient>
      </defs>
      <path
        d="M24 41.5C24 41.5 5.5 30.4 5.5 17.9C5.5 11.6 10.4 7 16.1 7C19.7 7 22.6 8.8 24 11.6C25.4 8.8 28.3 7 31.9 7C37.6 7 42.5 11.6 42.5 17.9C42.5 30.4 24 41.5 24 41.5Z"
        fill="url(#rfnHeartGrad)"
      />
      <path d="M24 16.2l1.5 3.6 3.9.3-3 2.6.9 3.8-3.3-2-3.3 2 .9-3.8-3-2.6 3.9-.3z" fill="#FFFFFF" fillOpacity="0.92" />
    </svg>
  );
}

function ImprovementSpace({ lang, firstName }) {
  const fr = lang === "fr";
  const name = firstName ? `, ${firstName}` : "";
  const helps = fr
    ? [
        { icon: "M12 8v4l3 2", circle: true, title: "Sois patiente", text: "Ta peau se renouvelle en ~28 jours. Les premiers résultats se voient vers la semaine 4, les vrais changements vers 8 semaines." },
        { icon: "M12 2.5C12 2.5 5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.5-7-12.5z", title: "Hydrate-toi de l'intérieur", text: "1,5 L d'eau par jour soutient l'éclat et la souplesse autant que tes soins du dehors." },
        { icon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z", title: "Protège ton sommeil", text: "C'est la nuit que la peau se répare. 7 à 8 h changent visiblement le teint et atténuent les cernes." },
        { icon: "M12 3l8 4.5-8 4.5-8-4.5z M4 12l8 4.5 8-4.5 M4 16.5l8 4.5 8-4.5", title: "Une nouveauté à la fois", text: "Introduis un actif fort (rétinol, acides) tous les 10 à 15 jours pour éviter les réactions." },
        { icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", title: "Une photo chaque semaine", text: "Même lumière, même angle. Tu verras les progrès invisibles au quotidien, et ça motive." },
        { icon: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z", title: "Sois douce avec toi", text: "Une mauvaise journée de peau n'efface pas tes progrès. La régularité bat la perfection." },
      ]
    : [
        { icon: "M12 8v4l3 2", circle: true, title: "Be patient", text: "Your skin renews in ~28 days. First results show around week 4, real changes by week 8." },
        { icon: "M12 2.5C12 2.5 5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.5-7-12.5z", title: "Hydrate from within", text: "1.5 L of water a day supports radiance and suppleness as much as your topical care." },
        { icon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z", title: "Protect your sleep", text: "Skin repairs itself at night. 7-8 hours visibly improve your complexion and dark circles." },
        { icon: "M12 3l8 4.5-8 4.5-8-4.5z M4 12l8 4.5 8-4.5 M4 16.5l8 4.5 8-4.5", title: "One new thing at a time", text: "Introduce a strong active (retinol, acids) every 10-15 days to avoid reactions." },
        { icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", title: "A photo every week", text: "Same light, same angle. You'll see the progress that's invisible day to day, and it keeps you going." },
        { icon: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z", title: "Be gentle with yourself", text: "A bad skin day doesn't erase your progress. Consistency beats perfection." },
      ];

  return (
    <div className="rfn-section rfn-improve">
      <div className="rfn-section-head">
        <h2 className="rfn-section-title">{fr ? "Ton espace amélioration · 2 mois" : "Your 2-month improvement space"}</h2>
      </div>
      <p className="rfn-improve-intro">
        {fr
          ? "Les soins ne font que la moitié du chemin. Voici les gestes du quotidien qui font vraiment la différence sur deux mois — sans pression, à ton rythme."
          : "Skincare is only half the journey. Here are the everyday habits that truly make the difference over two months — no pressure, at your own pace."}
      </p>

      <div className="rfn-improve-grid">
        {helps.map((h, i) => (
          <div className="rfn-improve-card" key={i}>
            <div className="rfn-improve-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {h.circle && <circle cx="12" cy="12" r="9" />}
                <path d={h.icon} />
              </svg>
            </div>
            <div className="rfn-improve-card-body">
              <div className="rfn-improve-card-title">{h.title}</div>
              <div className="rfn-improve-card-text">{h.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rfn-team-note">
        <div className="rfn-team-heart"><HeartMark /></div>
        <div className="rfn-team-eyebrow">{fr ? "Un mot de l'équipe RateMySkin" : "A note from the RateMySkin team"}</div>
        <p className="rfn-team-text">
          {fr
            ? `On a pensé ce plan comme on aimerait qu'on prenne soin de nous${name} : avec exigence, mais sans jugement. Ta peau raconte ton histoire, tes nuits, tes saisons — elle n'a pas besoin d'être parfaite pour être belle. Avance à ton rythme, célèbre les petites victoires, et reviens nous voir dans 8 semaines. On a hâte de voir ton chemin.`
            : `We built this plan the way we'd want to be cared for${name}: with high standards, but no judgement. Your skin tells your story — your nights, your seasons — it doesn't need to be perfect to be beautiful. Go at your own pace, celebrate the small wins, and come back to see us in 8 weeks. We can't wait to see how far you've come.`}
        </p>
        <div className="rfn-team-sign">
          {fr ? "Prends soin de toi," : "Take care of yourself,"}
          <strong>{fr ? "— L'équipe RateMySkin" : "— The RateMySkin team"}</strong>
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
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    if (isPaid) return;
    const onScroll = () => {
      const paywall = document.querySelector('.rfn-paywall');
      const past = window.scrollY > 700;
      const paywallVisible = paywall && paywall.getBoundingClientRect().top < window.innerHeight - 60;
      setShowStickyCta(past && !paywallVisible);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isPaid]);

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
        /* Score scale bar */
        .rfn-scale {
          width: min(320px, 90%);
          margin: 4px auto 22px;
        }
        .rfn-scale-track {
          position: relative;
          height: 10px;
          border-radius: 100px;
          background: linear-gradient(90deg,
            #C97883 0%,
            #D199AB 22%,
            #BFAFC5 40%,
            #9AB5CE 50%,
            #ABBEB5 60%,
            #7AAE98 78%,
            #5E9A82 100%
          );
          box-shadow:
            inset 0 1px 2px rgba(0,0,0,0.08),
            0 1px 0 rgba(255,255,255,0.6);
        }
        .rfn-scale-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          transition: left 0.06s linear;
        }
        .rfn-scale-marker-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          font-weight: 600;
          color: #2C2416;
          background: #FBF6EE;
          border: 1px solid rgba(201,169,97,0.4);
          border-radius: 100px;
          padding: 2px 9px;
          line-height: 1.1;
          margin-bottom: 6px;
          box-shadow: 0 4px 10px rgba(94,71,47,0.12);
          letter-spacing: -0.01em;
          white-space: nowrap;
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          display: inline-block;
        }
        .rfn-scale-marker-arrow {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translate(-50%, -2px);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid #FBF6EE;
          filter: drop-shadow(0 2px 1px rgba(94,71,47,0.15));
        }
        .rfn-scale-marker-arrow::before {
          content: "";
          position: absolute;
          top: -8px;
          left: -7px;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 8px solid rgba(201,169,97,0.4);
          z-index: -1;
        }
        .rfn-scale-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }
        .rfn-scale-lbl-l { color: #C97883; }
        .rfn-scale-lbl-m { color: #6B8FB0; }
        .rfn-scale-lbl-r { color: #5E9A82; }

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
        .rfn-section { padding: clamp(20px, 4vw, 28px) clamp(16px, 4vw, 26px) 10px; }
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

        /* Personal analysis card */
        .rfn-personal-card {
          background:
            radial-gradient(ellipse at top left, rgba(201,169,97,0.08), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 22px;
          padding: 26px 24px;
          position: relative;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 14px 32px rgba(168,116,73,0.05);
        }
        .rfn-personal-mark {
          position: absolute;
          top: 8px; left: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px;
          color: #C9A961;
          opacity: 0.18;
          line-height: 1;
        }
        .rfn-personal-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 17px;
          line-height: 1.55;
          color: #2C2416;
          margin: 0;
          padding-left: 36px;
        }
        .rfn-personal-text strong {
          font-style: normal;
          font-weight: 600;
          color: #A88947;
          background: linear-gradient(transparent 70%, rgba(201,169,97,0.22) 70%);
          padding: 0 2px;
        }

        /* Strengths showcase */
        .rfn-strengths {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 420px) {
          .rfn-strengths { grid-template-columns: 1fr; }
        }
        .rfn-strength-card {
          background: linear-gradient(135deg, #FFFFFF 0%, #FDF5E8 100%);
          border: 1px solid rgba(201,169,97,0.28);
          border-radius: 18px;
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 10px 24px rgba(168,116,73,0.06);
        }
        .rfn-strength-medal {
          position: relative;
          width: 60px;
          height: 60px;
          filter: drop-shadow(0 4px 12px rgba(201,169,97,0.22));
        }
        .rfn-strength-medal svg { width: 100%; height: 100%; }
        .rfn-strength-medal-num {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #A88947;
        }
        .rfn-strength-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 500;
          color: #2C2416;
          line-height: 1.15;
        }
        .rfn-strength-tag {
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C9A961;
          font-weight: 700;
        }

        /* Trajectory timeline (free) */
        .rfn-traj-card {
          background:
            radial-gradient(ellipse at top right, rgba(201,169,97,0.08), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #FDF8F0 100%);
          border: 1px solid rgba(201,169,97,0.28);
          border-radius: 22px;
          padding: 22px 20px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 32px rgba(168,116,73,0.06);
        }
        .rfn-traj-intro {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 16px;
          color: #5C4A3A;
          line-height: 1.5;
          margin: 0 0 18px;
        }
        .rfn-traj-intro strong {
          font-style: normal;
          font-weight: 600;
          color: #A88947;
        }
        .rfn-traj-timeline {
          position: relative;
          height: 110px;
          margin-bottom: 18px;
        }
        .rfn-traj-points {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 0 4px;
        }
        .rfn-traj-pt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .rfn-traj-pt-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #C9A961;
          border: 2px solid #FBF6EE;
          box-shadow: 0 0 0 1px rgba(201,169,97,0.3), 0 4px 8px rgba(168,116,73,0.18);
        }
        .rfn-traj-pt-dot-mid {
          width: 9px; height: 9px;
          background: #FBF6EE;
          border: 2px solid #C9A961;
          box-shadow: none;
        }
        .rfn-traj-pt-from .rfn-traj-pt-dot { background: #D199AB; box-shadow: 0 0 0 1px rgba(209,153,171,0.3), 0 4px 8px rgba(209,153,171,0.18); }
        .rfn-traj-pt-to .rfn-traj-pt-dot { background: #7AAE98; box-shadow: 0 0 0 1px rgba(122,174,152,0.3), 0 4px 10px rgba(122,174,152,0.22); }
        .rfn-traj-pt-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #2C2416;
          line-height: 1;
          margin-top: 14px;
        }
        .rfn-traj-pt-val-soft {
          font-size: 16px;
          color: #8A7A6B;
          font-weight: 500;
          margin-top: 18px;
        }
        .rfn-traj-pt-from .rfn-traj-pt-val { color: #B85C75; }
        .rfn-traj-pt-to .rfn-traj-pt-val { color: #4D8C76; }
        .rfn-traj-pt-lbl {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #B0885E;
        }
        .rfn-traj-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid rgba(201,169,97,0.18);
        }
        .rfn-traj-stat { text-align: center; }
        .rfn-traj-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 500;
          color: #A88947;
          letter-spacing: -0.01em;
          line-height: 1;
        }
        .rfn-traj-stat-lbl {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #8A7A6B;
          margin-top: 5px;
        }

        /* Cleanser teaser */
        .rfn-cleanser-card {
          background:
            radial-gradient(ellipse at top, rgba(201,169,97,0.06), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.28);
          border-radius: 20px;
          padding: 22px 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 14px 32px rgba(168,116,73,0.06);
        }
        .rfn-cleanser-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          padding: 8px 4px 0;
        }
        .rfn-cleanser-step-num {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E8C988 0%, #A88947 100%);
          color: #FBF6EE;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 4px 12px rgba(168,116,73,0.22);
        }
        .rfn-cleanser-step-lbl {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #B0885E;
          margin-top: 4px;
        }
        .rfn-cleanser-body { flex: 1; min-width: 0; }
        .rfn-cleanser-tag {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #4D8C76;
          background: rgba(122,174,152,0.12);
          border: 1px solid rgba(122,174,152,0.28);
          border-radius: 100px;
          padding: 3px 10px;
          margin-bottom: 8px;
        }
        .rfn-cleanser-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          color: #2C2416;
          margin: 0 0 4px;
          letter-spacing: -0.005em;
          line-height: 1.15;
        }
        .rfn-cleanser-brand {
          font-size: 12.5px;
          color: #8A7A6B;
          margin-bottom: 10px;
        }
        .rfn-cleanser-price {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          color: #A88947;
          font-size: 15px;
          font-style: italic;
        }
        .rfn-cleanser-why {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: #5C4A3A;
          line-height: 1.5;
          margin: 0 0 12px;
        }
        .rfn-cleanser-actives {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px 12px;
          background: rgba(201,169,97,0.08);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 10px;
        }
        .rfn-cleanser-actives-lbl {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #B0885E;
        }
        .rfn-cleanser-actives-val {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: #2C2416;
        }
        .rfn-cleanser-locked {
          margin-top: 12px;
          padding: 14px 18px;
          background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(253,250,244,0.4) 100%);
          border: 1px dashed rgba(201,169,97,0.32);
          border-radius: 16px;
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .rfn-cleanser-locked-dots {
          display: inline-flex;
          gap: 6px;
        }
        .rfn-cleanser-locked-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(201,169,97,0.22);
          color: #B9AC9E;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 500;
          filter: blur(0.6px);
        }
        .rfn-cleanser-locked-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-family: 'DM Sans', sans-serif;
        }
        .rfn-cleanser-locked-text strong {
          font-size: 12.5px;
          color: #2C2416;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .rfn-cleanser-locked-text span {
          font-size: 11px;
          color: #8A7A6B;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
        }

        /* Free tip */
        .rfn-tip-card {
          background:
            radial-gradient(ellipse at top right, rgba(122,174,152,0.1), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #F4F8F2 100%);
          border: 1px solid rgba(122,174,152,0.28);
          border-radius: 20px;
          padding: 20px 22px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 28px rgba(77,140,118,0.06);
        }
        .rfn-tip-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(122,174,152,0.22) 0%, rgba(122,174,152,0.08) 100%);
          border: 1px solid rgba(122,174,152,0.32);
          color: #4D8C76;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rfn-tip-icon svg { width: 22px; height: 22px; }
        .rfn-tip-body { flex: 1; }
        .rfn-tip-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4D8C76;
          margin-bottom: 6px;
        }
        .rfn-tip-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          color: #2C2416;
          line-height: 1.5;
          margin: 0;
          font-style: italic;
        }

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
        /* Compact mobile locked block — replaces 5 blurred cards on small screens */
        .rfn-locked-mobile {
          display: none;
          margin-top: 10px;
          padding: 14px 18px;
          background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(253,250,244,0.5) 100%);
          border: 1px dashed rgba(201,169,97,0.35);
          border-radius: 16px;
          gap: 14px;
          align-items: center;
          font-family: 'DM Sans', sans-serif;
        }
        .rfn-locked-mobile-icon {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(44,36,22,0.85);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rfn-locked-mobile-icon svg { width: 16px; height: 16px; }
        .rfn-locked-mobile-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .rfn-locked-mobile-text strong { font-size: 13px; color: #2C2416; }
        .rfn-locked-mobile-text span {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 12px;
          color: #5C4A3A;
        }
        @media (max-width: 640px) {
          .rfn-locked-mobile { display: flex; }
          .rfn-locked-desktop { display: none !important; }
        }

        /* Sticky CTA mobile (only visible <760px) */
        .rfn-sticky-cta {
          display: none;
          position: fixed;
          left: 0; right: 0; bottom: 0;
          z-index: 80;
          padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px));
          background: rgba(251,246,238,0.96);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-top: 1px solid rgba(201,169,97,0.22);
          box-shadow: 0 -8px 24px rgba(94,71,47,0.1);
          transform: translateY(100%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rfn-sticky-cta.show { transform: translateY(0); }
        .rfn-sticky-cta button {
          width: 100%;
          background: linear-gradient(180deg, #3A2F22 0%, #2C2416 50%, #1A1410 100%);
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 14px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 10px 24px rgba(44,36,22,0.24);
        }
        .rfn-sticky-cta .s { color: #C9A961; font-size: 11px; }
        .rfn-sticky-cta .lbl { flex: 1; text-align: left; }
        .rfn-sticky-cta .price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 600;
          color: #C9A961;
          letter-spacing: -0.01em;
          text-transform: none;
        }
        @media (max-width: 760px) {
          .rfn-sticky-cta { display: block; }
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
          align-items: flex-start;
          padding: 14px;
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
        .rfn-step-price {
          color: #8B6E26;
          font-weight: 600;
        }
        .rfn-step-note {
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 11.5px;
          line-height: 1.45;
        }
        .rfn-step-note-label {
          display: block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .rfn-step-note-text {
          color: #5A4F40;
        }
        .rfn-step-why {
          background: rgba(200,150,170,0.10);
          border-left: 2px solid #C49AAA;
        }
        .rfn-step-why .rfn-step-note-label { color: #B07A8E; }
        .rfn-step-how {
          background: rgba(201,169,97,0.10);
          border-left: 2px solid #C9A961;
        }
        .rfn-step-how .rfn-step-note-label { color: #A8853A; }
        .rfn-step-toggle {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 9px;
          padding: 5px 11px 5px 12px;
          border-radius: 999px;
          background: rgba(201,169,97,0.10);
          border: 1px solid rgba(201,169,97,0.32);
          color: #A8853A;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rfn-step-toggle:hover {
          background: rgba(201,169,97,0.18);
          border-color: rgba(201,169,97,0.5);
        }
        .rfn-step-toggle svg {
          width: 13px;
          height: 13px;
          transition: transform 0.25s ease;
        }
        .rfn-step-toggle.open svg { transform: rotate(180deg); }
        .rfn-step-details {
          margin-top: 4px;
          animation: rfnStepUnfold 0.22s ease;
          overflow: hidden;
        }
        @keyframes rfnStepUnfold {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rfn-step-buy {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 9px;
          padding: 6px 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #C9A961 0%, #B08D3C 100%);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(176,141,60,0.28);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .rfn-step-buy svg {
          width: 12px;
          height: 12px;
        }
        .rfn-step-buy:hover {
          box-shadow: 0 6px 16px rgba(176,141,60,0.4);
          transform: translateY(-1px);
        }

        /* Rescan in 2 months */
        .rfn-rescan {
          position: relative;
          text-align: center;
          padding: 28px 22px 22px;
          border-radius: 22px;
          background:
            radial-gradient(ellipse at top, rgba(196,154,170,0.12), transparent 60%),
            linear-gradient(135deg, #FFFFFF 0%, #FDF6F2 100%);
          border: 1px solid rgba(196,154,170,0.32);
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 14px 36px rgba(168,116,73,0.06);
          overflow: hidden;
        }
        .rfn-rescan-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #FFFFFF;
          background: linear-gradient(135deg, #C49AAA 0%, #B07A8E 100%);
          padding: 4px 9px;
          border-radius: 999px;
          box-shadow: 0 4px 10px rgba(176,122,142,0.3);
        }
        .rfn-rescan-icon {
          width: 46px;
          height: 46px;
          margin: 0 auto 10px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #F7E6EC 0%, #EFD2DC 100%);
          border: 1px solid rgba(196,154,170,0.4);
          color: #B07A8E;
        }
        .rfn-rescan-icon svg { width: 22px; height: 22px; }
        .rfn-rescan-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 23px;
          font-weight: 600;
          color: #2C2416;
          margin: 0 0 8px;
        }
        .rfn-rescan-text {
          font-size: 13px;
          line-height: 1.6;
          color: #6A5D4C;
          max-width: 480px;
          margin: 0 auto 18px;
        }
        .rfn-rescan-compare {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          padding: 12px 22px;
          margin-bottom: 18px;
          border-radius: 16px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(201,169,97,0.22);
        }
        .rfn-rescan-now, .rfn-rescan-next {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .rfn-rescan-now-label, .rfn-rescan-next-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #A89A86;
        }
        .rfn-rescan-now-score {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          font-weight: 600;
          line-height: 1;
          color: #C49AAA;
        }
        .rfn-rescan-next-score {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          font-weight: 600;
          line-height: 1;
          color: #C9A961;
        }
        .rfn-rescan-arrow {
          font-size: 22px;
          color: #C9A961;
          font-family: 'Cormorant Garamond', serif;
        }
        .rfn-rescan-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 24px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, #C9A961 0%, #B08D3C 100%);
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(176,141,60,0.28);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .rfn-rescan-cta:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(176,141,60,0.38);
        }
        .rfn-rescan-cta.done {
          background: rgba(122,168,90,0.14);
          color: #5E8A3E;
          box-shadow: none;
          cursor: default;
        }
        .rfn-rescan-hint {
          font-size: 11px;
          color: #9A8C7B;
          margin: 10px 0 0;
        }

        /* Improvement Space (2 months) */
        .rfn-improve-intro {
          font-size: 13.5px;
          line-height: 1.6;
          color: #6A5D4C;
          margin: 0 0 16px;
          max-width: 560px;
        }
        .rfn-improve-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (max-width: 560px) {
          .rfn-improve-grid { grid-template-columns: 1fr; }
        }
        .rfn-improve-card {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px;
          background: linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.2);
          border-radius: 16px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 20px rgba(168,116,73,0.04);
        }
        .rfn-improve-icon {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FDF3DF 0%, #F3E3C2 100%);
          border: 1px solid rgba(201,169,97,0.3);
          color: #A8853A;
        }
        .rfn-improve-icon svg { width: 19px; height: 19px; }
        .rfn-improve-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: #2C2416;
          margin-bottom: 2px;
        }
        .rfn-improve-card-text {
          font-size: 12px;
          line-height: 1.5;
          color: #6A5D4C;
        }
        .rfn-team-note {
          position: relative;
          margin-top: 16px;
          padding: 30px 22px 24px;
          text-align: center;
          border-radius: 22px;
          background:
            radial-gradient(ellipse at top, rgba(201,169,97,0.10), transparent 65%),
            linear-gradient(135deg, #FFFDF8 0%, #FBF3E6 100%);
          border: 1px solid rgba(201,169,97,0.3);
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 14px 36px rgba(168,116,73,0.07);
          overflow: hidden;
        }
        .rfn-team-heart {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }
        .rfn-heart-mark {
          width: 46px;
          height: 46px;
          filter: drop-shadow(0 6px 14px rgba(176,141,60,0.32));
          animation: rfnHeartBeat 2.8s ease-in-out infinite;
        }
        @keyframes rfnHeartBeat {
          0%, 100% { transform: scale(1); }
          8% { transform: scale(1.12); }
          16% { transform: scale(1); }
          24% { transform: scale(1.08); }
          32% { transform: scale(1); }
        }
        .rfn-team-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #B08D3C;
          margin-bottom: 10px;
        }
        .rfn-team-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17.5px;
          line-height: 1.55;
          color: #3D3221;
          max-width: 520px;
          margin: 0 auto 16px;
          font-style: italic;
        }
        .rfn-team-sign {
          font-size: 12.5px;
          color: #8A7A6B;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .rfn-team-sign strong {
          font-size: 13.5px;
          color: #2C2416;
          font-weight: 600;
          letter-spacing: 0.02em;
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

        /* Testimonial Block */
        .rfn-testi-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rfn-testi-card {
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(201,169,97,0.13);
          border-radius: 13px;
          padding: 12px 14px;
          box-shadow: 0 2px 10px rgba(61,41,20,0.03);
        }
        .rfn-testi-top {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 7px;
        }
        .rfn-testi-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          opacity: 0.85;
        }
        .rfn-testi-meta {
          display: flex;
          flex-direction: column;
          gap: 0;
          flex: 1;
        }
        .rfn-testi-name {
          font-size: 12.5px;
          font-weight: 700;
          color: #2C2416;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.25;
        }
        .rfn-testi-sub {
          font-size: 10.5px;
          color: #8A7A6B;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.2;
        }
        .rfn-testi-score {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-direction: row;
          text-align: right;
          flex-shrink: 0;
        }
        .rfn-testi-before {
          font-size: 11px;
          color: #C49AAA;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
        }
        .rfn-testi-arrow {
          font-size: 10px;
          color: #C9A961;
        }
        .rfn-testi-after {
          font-size: 13px;
          font-weight: 700;
          color: #7AAE98;
          font-family: 'DM Sans', sans-serif;
        }
        .rfn-testi-weeks {
          font-size: 9px;
          color: #B0A090;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.03em;
          white-space: nowrap;
          margin-left: 3px;
        }
        .rfn-testi-quote {
          font-size: 12px;
          color: #5C4A3A;
          line-height: 1.45;
          margin: 0;
          font-style: italic;
          font-family: 'DM Sans', sans-serif;
        }

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
        /* Paywall header */
        .rfn-pw-head {
          text-align: center;
          margin-bottom: 18px;
        }
        .rfn-pw-eyebrow {
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #B08D3C;
          margin-bottom: 8px;
        }
        .rfn-pw-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 600;
          color: #2C2416;
          line-height: 1.15;
          margin: 0 0 7px;
        }
        .rfn-pw-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #6B5A48;
          line-height: 1.5;
          margin: 0 auto;
          max-width: 320px;
        }
        .rfn-pw-sub strong { color: #2C2416; font-weight: 700; }

        /* Plan selector */
        .rfn-pw-plans {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }
        .rfn-pw-plan {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          background: rgba(255,255,255,0.6);
          border: 1.5px solid rgba(201,169,97,0.22);
          border-radius: 14px;
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          font-family: 'DM Sans', sans-serif;
        }
        .rfn-pw-plan:hover { border-color: rgba(201,169,97,0.45); }
        .rfn-pw-plan-pop { padding-top: 20px; }
        .rfn-pw-plan-on {
          border-color: #C9A961;
          background: linear-gradient(135deg, rgba(201,169,97,0.12) 0%, rgba(201,169,97,0.04) 100%);
          box-shadow: 0 4px 16px rgba(168,116,73,0.1);
        }
        .rfn-pw-plan-flag {
          position: absolute;
          top: -1px;
          left: 16px;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #C9A961, #B08D3C);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 100px;
          box-shadow: 0 2px 8px rgba(176,141,60,0.3);
        }
        .rfn-pw-plan-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #C9B79A;
          flex-shrink: 0;
          position: relative;
          transition: border-color 0.18s;
        }
        .rfn-pw-plan-on .rfn-pw-plan-radio {
          border-color: #C9A961;
        }
        .rfn-pw-plan-on .rfn-pw-plan-radio::after {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: #C9A961;
        }
        .rfn-pw-plan-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .rfn-pw-plan-name { font-size: 14px; font-weight: 700; color: #2C2416; }
        .rfn-pw-plan-desc { font-size: 11.5px; color: #8A7A6B; line-height: 1.3; }
        .rfn-pw-plan-note {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 6px;
          padding: 3px 9px 3px 7px;
          border-radius: 100px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #9A7B2E;
          background: linear-gradient(135deg, rgba(227,194,122,0.18), rgba(201,169,97,0.12));
          border: 1px solid rgba(201,169,97,0.32);
          width: fit-content;
        }
        .rfn-pw-plan-note svg { width: 11px; height: 11px; flex-shrink: 0; }
        .rfn-pw-plan-pricecol {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0;
          flex-shrink: 0;
          position: relative;
        }
        .rfn-pw-plan-badge {
          font-size: 9px;
          font-weight: 700;
          color: #7AAE98;
          background: rgba(122,174,152,0.16);
          border-radius: 100px;
          padding: 1px 7px;
          margin-bottom: 2px;
        }
        .rfn-pw-plan-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 600;
          color: #8B6E26;
          line-height: 1.1;
        }
        .rfn-pw-plan-old {
          font-size: 11px;
          color: #B9AC9E;
          text-decoration: line-through;
          line-height: 1;
        }
        .rfn-pw-plan-unit { font-size: 10px; color: #9A8A7B; margin-top: 2px; }
        .rfn-pw-anchor {
          display: flex;
          justify-content: center;
          align-items: baseline;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #8A7A6B;
          margin-bottom: 20px;
        }
        .rfn-pw-strike {
          color: #B9AC9E;
          text-decoration: line-through;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
        }
        .rfn-pw-features-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9A8A7B;
          text-align: left;
          margin-bottom: 12px;
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
        .rfn-pw-trust {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 4px;
        }
        .rfn-pw-trust-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px;
          font-weight: 600;
          color: #8A7A6B;
        }
        .rfn-pw-trust-item svg {
          width: 13px;
          height: 13px;
          color: #B08D3C;
        }
        .rfn-features {
          list-style: none;
          margin: 0 0 20px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rfn-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: #5C4A3A;
          line-height: 1.45;
          font-family: 'DM Sans', sans-serif;
        }
        .rfn-feature-check {
          color: #7AAE98;
          font-weight: 700;
          font-size: 12px;
          flex-shrink: 0;
          margin-top: 1px;
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

      <NavBar ctaLabel={lang === 'fr' ? 'Nouvelle analyse' : 'New analysis'} ctaHref="/" />

      <div className="rfn-container">
        <ScoreHero score={score} lang={lang} firstName={firstName} isPaid={isPaid} />

        {/* Personal analysis (free only) */}
        {!isPaid && metrics.length > 0 && (
          <PersonalAnalysis
            score={score}
            topConcern={[...metrics].sort((a, b) => a.score - b.score)[0]}
            lang={lang}
          />
        )}

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

        {/* Trajectory timeline (free only) */}
        {!isPaid && (
          <TrajectoryTimeline score={score} lang={lang} />
        )}

        {/* Cleanser teaser (free only) */}
        {!isPaid && metrics.length > 0 && (
          <CleanserTeaser
            topConcern={[...metrics].sort((a, b) => a.score - b.score)[0]}
            lang={lang}
          />
        )}

        {/* Free tip / Insight IA (free only) — juste avant le paywall */}
        {!isPaid && metrics.length > 0 && (
          <FreeTip
            topConcern={[...metrics].sort((a, b) => a.score - b.score)[0]}
            lang={lang}
          />
        )}

        {/* Priorities (paid) */}
        {isPaid && mainProblems.length > 0 && (
          <PriorityCards problems={mainProblems} lang={lang} />
        )}

        {/* Routine Timeline (paid) */}
        {isPaid && paid.routine && (
          <RoutineTimeline routine={paid.routine} lang={lang} />
        )}

        {/* Progression Chart (paid only — free uses TrajectoryTimeline above) */}
        {isPaid && (
          <ProgressionChart score={score} lang={lang} locked={false} />
        )}

        {/* Rescan in 2 months (paid) */}
        {isPaid && (
          <RescanCard score={score} lang={lang} />
        )}

        {/* PDF Card (paid) */}
        {isPaid && (
          <PdfCard onDownload={handleDownloadPdf} loading={pdfLoading} lang={lang} />
        )}

        {/* Improvement Space (paid) — warm 2-month closing + team note */}
        {isPaid && (
          <ImprovementSpace lang={lang} firstName={firstName} />
        )}

        {/* Testimonials + Paywall (free) */}
        {!isPaid && (
          <>
            <TestimonialBlock lang={lang} />
            <Paywall onUnlock={handleUnlock} unlocking={unlocking} lang={lang} score={score} />
          </>
        )}

      </div>

      <Footer />

      {/* Sticky CTA mobile — apparaît après scroll, masqué si paywall visible */}
      {!isPaid && (
        <div className={`rfn-sticky-cta ${showStickyCta ? "show" : ""}`}>
          <button onClick={() => handleUnlock("single")} disabled={unlocking}>
            <span className="s">✦</span>
            <span className="lbl">
              {lang === "fr" ? "Débloquer mon rapport" : "Unlock my report"}
            </span>
            <span className="price">7,99 €</span>
          </button>
        </div>
      )}
    </div>
  );
}
