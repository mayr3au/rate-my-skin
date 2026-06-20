import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useLang } from '../lib/LangContext';
import { useAuth } from '../lib/useAuth';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

/* ════════════════════════════════════════════════════════════════════════
   /compte — Espace client (Supabase Auth + Google)
   Logged out → Google sign-in (login & signup unified)
   Logged in  → dashboard: analyses, rescan reminder, stats, new analysis
   ════════════════════════════════════════════════════════════════════════ */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

/* Evolution chart with a real scale: score gridlines (Y), date labels (X),
   the current value, and a dashed target line — so the user reads both
   "where am I" and "over how long". */
function EvoChart({ points, target, fr }) {
  if (!points || points.length < 2) return null;
  const W = 320, H = 158;
  const padL = 30, padR = 16, padT = 16, padB = 28;
  const iW = W - padL - padR, iH = H - padT - padB;
  const scores = points.map((p) => p.score);
  const lo = Math.min(...scores, target ?? 100);
  const hi = Math.max(...scores, target ?? 0);
  let yMin = Math.max(0, Math.floor((lo - 6) / 10) * 10);
  let yMax = Math.min(100, Math.ceil((hi + 6) / 10) * 10);
  if (yMax - yMin < 30) yMax = Math.min(100, yMin + 40);
  if (yMax <= yMin) yMax = yMin + 10;
  const xAt = (i) => padL + (iW * i) / (points.length - 1);
  const yAt = (v) => padT + iH * (1 - (v - yMin) / (yMax - yMin));
  const ticks = [yMin, Math.round((yMin + yMax) / 2), yMax];
  const pts = points.map((p, i) => [xAt(i), yAt(p.score)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const area = `${line} L${last[0].toFixed(1)} ${(padT + iH).toFixed(1)} L${pts[0][0].toFixed(1)} ${(padT + iH).toFixed(1)} Z`;
  const showTarget = target != null && target > yMin && target < yMax;
  const ty = showTarget ? yAt(target) : null;
  const moShort = (d) => new Date(d).toLocaleDateString(fr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cmpEvoLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C9A961" /><stop offset="100%" stopColor="#4CAF7D" />
        </linearGradient>
        <linearGradient id="cmpEvoFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(76,175,125,0.18)" /><stop offset="100%" stopColor="rgba(76,175,125,0)" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={'y' + i}>
          <line x1={padL} y1={yAt(t)} x2={W - padR} y2={yAt(t)} stroke="rgba(94,71,47,0.10)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 3'} />
          <text x={padL - 7} y={yAt(t) + 3} textAnchor="end" fontSize="9" fill="#A8997F" fontFamily="'DM Sans',sans-serif">{t}</text>
        </g>
      ))}
      {showTarget && (
        <g>
          <line x1={padL} y1={ty} x2={W - padR} y2={ty} stroke="#B0885E" strokeWidth="1" strokeDasharray="4 3" opacity="0.65" />
          <text x={W - padR} y={ty - 4} textAnchor="end" fontSize="8.5" fontWeight="700" fill="#B0885E" fontFamily="'DM Sans',sans-serif">{fr ? `Objectif ${target}` : `Goal ${target}`}</text>
        </g>
      )}
      <path d={area} fill="url(#cmpEvoFill)" />
      <path d={line} fill="none" stroke="url(#cmpEvoLine)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const isLast = i === pts.length - 1;
        return <circle key={'p' + i} cx={p[0]} cy={p[1]} r={isLast ? 4.5 : 3} fill={isLast ? '#4CAF7D' : '#FFFFFF'} stroke={isLast ? '#FFFFFF' : '#C9A961'} strokeWidth="1.6" />;
      })}
      <text x={last[0]} y={last[1] - 9} textAnchor="middle" fontSize="11" fontWeight="700" fill="#2C2416" fontFamily="'Cormorant Garamond',serif">{scores[scores.length - 1]}</text>
      {points.map((p, i) => {
        const show = i === 0 || i === points.length - 1 || points.length <= 3;
        if (!show) return null;
        const anchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle';
        return <text key={'x' + i} x={xAt(i)} y={H - 9} textAnchor={anchor} fontSize="9" fill="#A8997F" fontFamily="'DM Sans',sans-serif">{moShort(p.date)}</text>;
      })}
    </svg>
  );
}

/* Constant per-skin-type advice — stable value that's always shown,
   independent of the score, to make the dashboard useful between scans. */
const SKIN_TYPE_LABEL = {
  fr: { mixte: 'Peau mixte', seche: 'Peau sèche', grasse: 'Peau grasse', sensible: 'Peau sensible', normale: 'Peau normale' },
  en: { mixte: 'Combination', seche: 'Dry skin', grasse: 'Oily skin', sensible: 'Sensitive skin', normale: 'Normal skin' },
};
const SKIN_TIPS = {
  fr: {
    mixte: ['Nettoie matin et soir avec un gel doux, sans décaper.', 'Hydrate la zone T en gel léger, les joues en crème plus riche.', 'Exfolie 1 à 2 fois/semaine pour garder les pores nets.'],
    seche: ['Choisis un nettoyant sans savon et rince à l’eau tiède.', 'Applique ta crème sur peau encore humide pour sceller l’eau.', 'Ajoute un sérum à l’acide hyaluronique le soir.'],
    grasse: ['Nettoyant moussant doux, 2 fois par jour maximum.', 'Intègre la niacinamide pour réguler le sébum.', 'SPF fluide non comédogène chaque matin.'],
    sensible: ['Garde une routine minimaliste, peu d’actifs à la fois.', 'Évite parfums et alcool dans tes produits.', 'Teste tout nouveau produit avant de l’appliquer sur le visage.'],
    normale: ['Maintiens une routine simple et régulière.', 'SPF tous les matins, sans exception.', 'Vitamine C le matin pour protéger ton éclat.'],
  },
  en: {
    mixte: ['Cleanse morning and night with a gentle gel, no stripping.', 'Hydrate the T-zone with a light gel, cheeks with a richer cream.', 'Exfoliate 1–2×/week to keep pores clear.'],
    seche: ['Use a soap-free cleanser and rinse with lukewarm water.', 'Apply moisturizer on still-damp skin to seal in water.', 'Add a hyaluronic acid serum at night.'],
    grasse: ['Gentle foaming cleanser, twice a day maximum.', 'Add niacinamide to regulate sebum.', 'Lightweight non-comedogenic SPF every morning.'],
    sensible: ['Keep a minimal routine, few actives at a time.', 'Avoid fragrance and alcohol in your products.', 'Patch-test any new product before using it on your face.'],
    normale: ['Keep a simple, consistent routine.', 'SPF every morning, no exception.', 'Vitamin C in the morning to protect your glow.'],
  },
};
function normSkinType(s = '') {
  const t = s.toLowerCase();
  if (/(mixte|combinat)/.test(t)) return 'mixte';
  if (/(s[èe]che|\bdry\b)/.test(t)) return 'seche';
  if (/(grasse|oily)/.test(t)) return 'grasse';
  if (/(sensible|sensitive)/.test(t)) return 'sensible';
  if (/(normale|normal)/.test(t)) return 'normale';
  return 'mixte';
}

function ScoreRing({ score, size = 52 }) {
  const color = score >= 75 ? '#4CAF7D' : score >= 50 ? '#C9A961' : '#C49AAA';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${color}14`,
    }}>
      <span style={{ fontSize: size * 0.3, fontWeight: 700, color, fontFamily: "'DM Sans', sans-serif" }}>
        {score}
      </span>
    </div>
  );
}

export default function ComptePage() {
  const router = useRouter();
  const { lang } = useLang();
  const fr = lang === 'fr';
  const { user, loading, configured, signInWithGoogle, signOut } = useAuth();

  const [reports, setReports] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [authError, setAuthError] = useState('');
  const [rescanTarget, setRescanTarget] = useState(null);

  // Read the locally-scheduled rescan (set from the premium report)
  useEffect(() => {
    try {
      const t = localStorage.getItem('rms_rescan_target');
      if (t) setRescanTarget(new Date(t));
    } catch (e) {}
  }, []);

  // Once authenticated: (1) link this device's anonymous analyses to the
  // account email via /api/identity (stamps the users row so past analyses
  // become retrievable), then (2) fetch all analyses for that email.
  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    const email = user.email;
    setLoadingReports(true);

    const linkAccount = fetch('/api/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {}); // best-effort, never blocks the dashboard

    linkAccount
      .then(() =>
        fetch('/api/my-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      )
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setReports(json.reports || []);
      })
      .catch(() => {
        if (!cancelled) setReports([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingReports(false);
      });

    return () => { cancelled = true; };
  }, [user?.email]);

  const handleGoogle = useCallback(async () => {
    setAuthError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setAuthError(
        fr
          ? "La connexion Google n'est pas encore disponible. Réessaie plus tard."
          : "Google sign-in isn't available yet. Please try again later."
      );
    }
  }, [signInWithGoogle, fr]);

  const openReport = (report) => {
    try {
      sessionStorage.setItem('rms_report', JSON.stringify(report.reportJson));
      sessionStorage.setItem('rms_analysis_id', report.id);
      sessionStorage.setItem('rms_is_paid', report.isPaid ? 'true' : 'false');
    } catch (e) {}
    router.push('/report');
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(fr ? 'fr-FR' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const meta = user?.user_metadata || {};
  const fullName = meta.full_name || meta.name || '';
  const firstName = fullName.split(' ')[0] || (user?.email ? user.email.split('@')[0] : '');
  const avatar = meta.avatar_url || meta.picture || null;

  const paidCount = reports?.filter((r) => r.isPaid).length || 0;
  const latestScore = reports?.find((r) => r.score != null)?.score ?? null;

  // Evolution data — score journey, sorted oldest → newest, powers the progress hero
  const scoredAsc = (reports || [])
    .filter((r) => r.score != null)
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const evoScores = scoredAsc.map((r) => r.score);
  const firstScore = evoScores[0] ?? null;
  const lastScore = evoScores[evoScores.length - 1] ?? null;
  const evoDelta = firstScore != null && lastScore != null ? lastScore - firstScore : null;
  const hasJourney = evoScores.length >= 2;
  const nextMilestone =
    lastScore != null ? Math.min(100, lastScore + (lastScore >= 85 ? 4 : lastScore >= 70 ? 8 : 12)) : null;
  const shortDate = (iso) =>
    new Date(iso).toLocaleDateString(fr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });

  const rescanLabel = rescanTarget
    ? rescanTarget.toLocaleDateString(fr ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })
    : null;
  const rescanDue = rescanTarget ? Date.now() >= rescanTarget.getTime() : false;

  // Time span covered by the journey (for the chart caption)
  const spanDays = hasJourney
    ? Math.round((new Date(scoredAsc[scoredAsc.length - 1].createdAt) - new Date(scoredAsc[0].createdAt)) / 86400000)
    : 0;
  const spanLabel = spanDays >= 55
    ? `${Math.round(spanDays / 30)} ${fr ? 'mois' : 'months'}`
    : `${Math.max(1, Math.round(spanDays / 7))} ${fr ? 'sem.' : 'wks'}`;

  // Constant skin profile + advice (stable between scans), from the latest report
  const latest = reports?.find((r) => r.score != null) || null;
  const skinTypeRaw = latest?.faceShape || latest?.reportJson?.skinType || '';
  const skinToneRaw = latest?.skinTone || latest?.reportJson?.skinTone || '';
  const concernRaw = latest?.skinConcern || latest?.reportJson?.mainConcern || '';
  const skinKey = normSkinType(skinTypeRaw || concernRaw);
  const skinTypeLabel = skinTypeRaw || SKIN_TYPE_LABEL[fr ? 'fr' : 'en'][skinKey];
  const skinTips = SKIN_TIPS[fr ? 'fr' : 'en'][skinKey] || SKIN_TIPS[fr ? 'fr' : 'en'].mixte;
  const hasPremium = paidCount > 0;
  const evoPoints = scoredAsc.map((r) => ({ score: r.score, date: r.createdAt }));

  return (
    <>
      <Head>
        <title>{fr ? 'Mon espace · RateMySkin' : 'My account · RateMySkin'}</title>
        <meta name="description" content={fr ? 'Connecte-toi pour retrouver tes analyses, ton suivi et ton rescan.' : 'Log in to find your analyses, tracking and rescan.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex" />
      </Head>

      <NavBar ctaLabel={fr ? 'Nouvelle analyse' : 'New analysis'} ctaHref="/" />

      <div className="cmp-bg">
        <main className="cmp-main">
          {loading ? (
            <div className="cmp-loading">
              <span className="cmp-spinner" />
            </div>
          ) : !user ? (
            /* ─────────────── LOGGED OUT ─────────────── */
            <div className="cmp-signin">
              <div className="cmp-star">✦</div>
              <p className="cmp-eyebrow">{fr ? 'Espace client' : 'Client area'}</p>
              <h1 className="cmp-title">
                {fr ? <>Ton espace <em>beauté.</em></> : <>Your beauty <em>space.</em></>}
              </h1>
              <p className="cmp-lede">
                {fr
                  ? 'Connecte-toi pour retrouver toutes tes analyses, suivre ton évolution et programmer ton rescan à 2 mois.'
                  : 'Log in to find all your analyses, track your progress and schedule your 2-month rescan.'}
              </p>

              <button className="cmp-google" onClick={handleGoogle} disabled={!configured}>
                <GoogleIcon />
                {fr ? 'Continuer avec Google' : 'Continue with Google'}
              </button>

              <p className="cmp-google-sub">
                {fr ? 'Connexion ou création de compte — en un clic.' : 'Sign in or create an account — in one click.'}
              </p>

              {!configured && (
                <p className="cmp-error">
                  {fr ? 'Authentification non configurée sur cet environnement.' : 'Authentication is not configured in this environment.'}
                </p>
              )}
              {authError && <p className="cmp-error">{authError}</p>}

              <div className="cmp-divider"><span>{fr ? 'ou' : 'or'}</span></div>

              <button className="cmp-alt" onClick={() => router.push('/mes-rapports')}>
                {fr ? 'Retrouver mes rapports par email' : 'Find my reports by email'}
              </button>

              <p className="cmp-reassure">
                {fr
                  ? 'Nous ne stockons jamais ta photo — uniquement les rapports liés à ton compte.'
                  : 'We never store your photo — only the reports linked to your account.'}
              </p>
            </div>
          ) : (
            /* ─────────────── LOGGED IN — DASHBOARD ─────────────── */
            <div className="cmp-dash">
              {/* Header */}
              <div className="cmp-dash-head">
                <div className="cmp-dash-id">
                  {avatar ? (
                    <img src={avatar} alt="" className="cmp-avatar" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="cmp-avatar cmp-avatar-fallback">
                      {(firstName || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="cmp-hello">{fr ? `Bonjour ${firstName}` : `Hello ${firstName}`}</p>
                    <p className="cmp-email">{user.email}</p>
                  </div>
                </div>
                <button className="cmp-signout" onClick={signOut}>
                  {fr ? 'Déconnexion' : 'Sign out'}
                </button>
              </div>

              {/* Stats */}
              <div className="cmp-stats">
                <div className="cmp-stat">
                  <span className="cmp-stat-val">{reports ? reports.length : '—'}</span>
                  <span className="cmp-stat-lab">{fr ? 'analyses' : 'analyses'}</span>
                </div>
                <div className="cmp-stat">
                  <span className="cmp-stat-val">{latestScore ?? '—'}</span>
                  <span className="cmp-stat-lab">{fr ? 'dernier score' : 'latest score'}</span>
                </div>
                <div className="cmp-stat">
                  <span className="cmp-stat-val">{paidCount}</span>
                  <span className="cmp-stat-lab">{fr ? 'premium' : 'premium'}</span>
                </div>
              </div>

              {/* Evolution hero — the progress story */}
              {lastScore != null && (
                <div className="cmp-evo">
                  <div className="cmp-evo-top">
                    <div>
                      <p className="cmp-evo-eyebrow">{fr ? 'Ton évolution' : 'Your progress'}</p>
                      <p className="cmp-evo-headline">
                        {hasJourney ? (
                          evoDelta > 0 ? (
                            fr ? <>Ta peau a gagné <strong className="up">+{evoDelta} points</strong></>
                               : <>Your skin gained <strong className="up">+{evoDelta} points</strong></>
                          ) : evoDelta < 0 ? (
                            fr ? <>Léger recul de <strong className="down">{evoDelta} points</strong></>
                               : <>Slight dip of <strong className="down">{evoDelta} points</strong></>
                          ) : (
                            fr ? <>Ton score reste <strong>stable</strong></>
                               : <>Your score is <strong>steady</strong></>
                          )
                        ) : (
                          fr ? <>Ton point de départ : <strong>{lastScore}/100</strong></>
                             : <>Your starting point: <strong>{lastScore}/100</strong></>
                        )}
                      </p>
                    </div>
                    {hasJourney && (
                      <div className={`cmp-evo-badge ${evoDelta >= 0 ? 'up' : 'down'}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          {evoDelta >= 0
                            ? <><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6h-6" /></>
                            : <><path d="M3 7l6 6 4-4 8 8" /><path d="M21 17v-6h-6" /></>}
                        </svg>
                        {evoDelta >= 0 ? '+' : ''}{evoDelta}
                      </div>
                    )}
                  </div>

                  {hasJourney ? (
                    <>
                      <div className="cmp-evo-chart"><EvoChart points={evoPoints} target={nextMilestone} fr={fr} /></div>
                      <p className="cmp-evo-foot">
                        {fr
                          ? <>Sur <strong>{spanLabel}</strong>{nextMilestone > lastScore ? <> · prochain palier <strong>{nextMilestone}/100</strong>. Garde ta routine et confirme-le à ton prochain rescan.</> : <>. Continue ta routine pour tenir ce niveau.</>}</>
                          : <>Over <strong>{spanLabel}</strong>{nextMilestone > lastScore ? <> · next milestone <strong>{nextMilestone}/100</strong>. Keep your routine and confirm it at your next rescan.</> : <>. Keep your routine to hold this level.</>}</>}
                      </p>
                    </>
                  ) : (
                    <div className="cmp-evo-goal">
                      <div className="cmp-evo-bar">
                        <div className="cmp-evo-bar-fill" style={{ width: `${lastScore}%` }} />
                        <div className="cmp-evo-bar-target" style={{ left: `${nextMilestone}%` }} />
                      </div>
                      <p className="cmp-evo-goal-text">
                        {fr
                          ? <>Prochain palier : <strong>{nextMilestone}/100</strong> — atteignable en ~8 semaines en suivant ta routine. Ton rescan le prouvera, score par score.</>
                          : <>Next milestone: <strong>{nextMilestone}/100</strong> — reachable in ~8 weeks by following your routine. Your rescan will prove it, score by score.</>}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Constant skin profile + advice — value between scans */}
              {latest && (
                <div className="cmp-profile">
                  <div className="cmp-profile-head">
                    <span className="cmp-profile-eyebrow">{fr ? 'Ton profil peau' : 'Your skin profile'}</span>
                    <span className="cmp-profile-note">{fr ? 'Constant · ta routine s’y adapte' : 'Constant · your routine adapts to it'}</span>
                  </div>
                  <div className="cmp-profile-grid">
                    <div className="cmp-profile-item">
                      <span className="cmp-profile-lab">{fr ? 'Type de peau' : 'Skin type'}</span>
                      <span className="cmp-profile-val">{skinTypeLabel}</span>
                    </div>
                    {skinToneRaw && (
                      <div className="cmp-profile-item">
                        <span className="cmp-profile-lab">{fr ? 'Carnation' : 'Skin tone'}</span>
                        <span className="cmp-profile-val">{skinToneRaw}</span>
                      </div>
                    )}
                    {concernRaw && (
                      <div className="cmp-profile-item">
                        <span className="cmp-profile-lab">{fr ? 'Préoccupation' : 'Main concern'}</span>
                        <span className="cmp-profile-val">{concernRaw}</span>
                      </div>
                    )}
                  </div>
                  <div className="cmp-tips">
                    <p className="cmp-tips-title">
                      {fr ? <>3 réflexes pour ta <em>{skinTypeLabel.toLowerCase()}</em></> : <>3 habits for your <em>{skinTypeLabel.toLowerCase()}</em></>}
                    </p>
                    <ul className="cmp-tips-list">
                      {skinTips.map((tip, i) => (
                        <li key={i}><span className="cmp-tips-num">{i + 1}</span><span>{tip}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Smart CTA — push free users to premium, premium users to rescan */}
              {latest && (
                <div className={`cmp-cta ${!hasPremium ? 'unlock' : rescanDue ? 'due' : 'rescan'}`}>
                  <div className="cmp-cta-icon">
                    {!hasPremium ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v5h-5" /></svg>
                    )}
                  </div>
                  <div className="cmp-cta-body">
                    <p className="cmp-cta-title">
                      {!hasPremium
                        ? (fr ? 'Débloque ta routine sur-mesure' : 'Unlock your tailored routine')
                        : rescanDue
                          ? (fr ? "C'est le moment de ton rescan" : 'Time for your rescan')
                          : (fr ? (rescanLabel ? `Prochain rescan : ${rescanLabel}` : 'Programme ton prochain rescan') : (rescanLabel ? `Next rescan: ${rescanLabel}` : 'Schedule your next rescan'))}
                    </p>
                    <p className="cmp-cta-text">
                      {!hasPremium
                        ? (fr ? 'Routine matin & soir, tes 5 zones prioritaires et le suivi de ton évolution — dès 7,99 €.' : 'Morning & evening routine, your 5 priority zones and progress tracking — from €7.99.')
                        : (fr ? 'Refais une analyse pour mesurer ton évolution réelle, score par score.' : 'Run a new analysis to measure your real progress, score by score.')}
                    </p>
                  </div>
                  <button className="cmp-cta-btn" onClick={() => (!hasPremium ? openReport(latest) : router.push('/'))}>
                    <span className="star">✦</span>
                    {!hasPremium ? (fr ? 'Voir mon plan' : 'See my plan') : (fr ? 'Faire mon rescan' : 'Do my rescan')}
                  </button>
                </div>
              )}

              {/* Trust strip — confidence signals */}
              <div className="cmp-trust">
                <div className="cmp-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  <span>{fr ? 'Suivi réel, recalculé sur ta photo' : 'Real tracking, recomputed on your photo'}</span>
                </div>
                <div className="cmp-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                  <span>{fr ? 'Tes photos ne sont jamais stockées' : 'Your photos are never stored'}</span>
                </div>
                <div className="cmp-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" /></svg>
                  <span>{fr ? 'Analyse IA dermatologique' : 'Dermatology-grade AI'}</span>
                </div>
              </div>

              {/* Reports */}
              <div className="cmp-section-head">
                <h2>{fr ? 'Mes analyses' : 'My analyses'}</h2>
                <button className="cmp-new" onClick={() => router.push('/')}>
                  <span className="star">✦</span> {fr ? 'Nouvelle analyse' : 'New analysis'}
                </button>
              </div>

              {loadingReports ? (
                <div className="cmp-loading"><span className="cmp-spinner" /></div>
              ) : reports && reports.length > 0 ? (
                <div className="cmp-reports">
                  {reports.map((report) => (
                    <div key={report.id} className="cmp-report">
                      {report.score != null && <ScoreRing score={report.score} />}
                      <div className="cmp-report-info">
                        <p className="cmp-report-meta">
                          <span>{formatDate(report.createdAt)}</span>
                          {report.faceShape ? <span> · {report.faceShape}</span> : null}
                          {report.isPaid ? (
                            <span className="cmp-tag premium">Premium</span>
                          ) : (
                            <span className="cmp-tag free">{fr ? 'Gratuit' : 'Free'}</span>
                          )}
                        </p>
                        <p className="cmp-report-sum">{report.summary || report.skinConcern || '—'}</p>
                      </div>
                      <button className="cmp-report-open" onClick={() => openReport(report)}>
                        {fr ? 'Ouvrir' : 'Open'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cmp-empty">
                  <p>{fr ? "Tu n'as pas encore d'analyse." : "You don't have any analysis yet."}</p>
                  <button className="cmp-new" onClick={() => router.push('/')}>
                    <span className="star">✦</span> {fr ? 'Lancer ma première analyse' : 'Start my first analysis'}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>

      <style jsx>{`
        .cmp-bg {
          background: linear-gradient(180deg, #FBF6EE 0%, #F8F1E5 50%, #F5EBDB 100%);
          min-height: calc(100vh - 60px);
          padding: 0 0 80px;
        }
        .cmp-main {
          font-family: 'DM Sans', sans-serif;
          padding: 56px 20px 0;
          max-width: 680px;
          margin: 0 auto;
        }
        .cmp-loading { display: flex; justify-content: center; padding: 80px 0; }
        .cmp-spinner {
          width: 30px; height: 30px; border-radius: 50%;
          border: 3px solid rgba(201,169,97,0.25);
          border-top-color: #C9A961;
          animation: cmpspin 0.8s linear infinite;
        }
        @keyframes cmpspin { to { transform: rotate(360deg); } }

        /* ── Sign-in ── */
        .cmp-signin { text-align: center; max-width: 440px; margin: 0 auto; }
        .cmp-star { color: #C9A961; font-size: 15px; opacity: 0.75; margin-bottom: 14px; }
        .cmp-eyebrow {
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
          color: #C9A961; font-weight: 700; margin: 0 0 14px;
        }
        .cmp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 6vw, 50px); font-weight: 400;
          color: #2C2416; margin: 0 0 14px; line-height: 1.05; letter-spacing: -0.015em;
        }
        .cmp-title em { color: #B0885E; font-style: italic; }
        .cmp-lede {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 17px; color: #5C4A3A; line-height: 1.5;
          margin: 0 auto 28px; max-width: 400px;
        }
        .cmp-google {
          display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          width: 100%; max-width: 340px;
          background: #FFFFFF; color: #2C2416;
          border: 1px solid rgba(60,40,25,0.18);
          border-radius: 100px; padding: 15px 24px;
          font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(94,71,47,0.08), 0 1px 0 rgba(255,255,255,0.9) inset;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cmp-google:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(94,71,47,0.12); }
        .cmp-google:disabled { opacity: 0.5; cursor: not-allowed; }
        .cmp-google-sub {
          font-size: 12px; color: #8A7A6B; margin: 12px 0 0;
        }
        .cmp-error { color: #C0392B; font-size: 12.5px; margin: 14px 0 0; }

        .cmp-divider {
          display: flex; align-items: center; gap: 12px;
          color: #B9AC9E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em;
          margin: 28px 0 20px;
        }
        .cmp-divider::before, .cmp-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(201,169,97,0.25);
        }
        .cmp-alt {
          background: none; border: 1px solid rgba(201,169,97,0.35);
          color: #6F5A44; border-radius: 100px; padding: 12px 22px;
          font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
          transition: background 0.2s;
        }
        .cmp-alt:hover { background: rgba(201,169,97,0.08); }
        .cmp-reassure {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 13px; color: #8A7A6B; margin: 26px auto 0; max-width: 360px;
        }

        /* ── Dashboard ── */
        .cmp-dash-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .cmp-dash-id { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .cmp-avatar {
          width: 54px; height: 54px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
          border: 2px solid rgba(201,169,97,0.4);
        }
        .cmp-avatar-fallback {
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #C9A961, #B0885E); color: #fff;
          font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600;
        }
        .cmp-hello {
          font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 500;
          color: #2C2416; margin: 0; line-height: 1.1; letter-spacing: -0.01em;
        }
        .cmp-email { font-size: 12px; color: #8A7A6B; margin: 2px 0 0; }
        .cmp-signout {
          background: none; border: 1px solid rgba(140,122,107,0.3);
          color: #8A7A6B; border-radius: 100px; padding: 9px 16px;
          font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
          transition: all 0.2s; flex-shrink: 0;
        }
        .cmp-signout:hover { border-color: rgba(192,57,43,0.4); color: #C0392B; }

        .cmp-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;
        }
        .cmp-stat {
          background: linear-gradient(180deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.22); border-radius: 18px;
          padding: 18px 12px; text-align: center;
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 10px 24px rgba(94,71,47,0.04);
        }
        .cmp-stat-val {
          display: block; font-family: 'Cormorant Garamond', serif;
          font-size: 30px; font-weight: 600; color: #2C2416; line-height: 1;
        }
        .cmp-stat-lab {
          display: block; font-size: 10.5px; color: #8A7A6B; margin-top: 6px;
          text-transform: uppercase; letter-spacing: 0.08em;
        }

        /* ── Evolution hero ── */
        .cmp-evo {
          background: linear-gradient(165deg, #FFFFFF 0%, #FDFAF3 100%);
          border: 1px solid rgba(201,169,97,0.26); border-radius: 22px;
          padding: 20px 22px; margin-bottom: 14px;
          box-shadow: 0 14px 34px rgba(94,71,47,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .cmp-evo-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
        .cmp-evo-eyebrow {
          font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #C9A961; font-weight: 700; margin: 0 0 6px;
        }
        .cmp-evo-headline {
          font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500;
          color: #2C2416; margin: 0; line-height: 1.18; letter-spacing: -0.005em;
        }
        .cmp-evo-headline strong { font-weight: 700; }
        .cmp-evo-headline strong.up { color: #3E9B6C; }
        .cmp-evo-headline strong.down { color: #C08552; }
        .cmp-evo-badge {
          display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 800;
          padding: 6px 12px; border-radius: 100px; line-height: 1;
        }
        .cmp-evo-badge.up { color: #3E9B6C; background: rgba(76,175,125,0.12); border: 1px solid rgba(76,175,125,0.3); }
        .cmp-evo-badge.down { color: #C08552; background: rgba(192,133,82,0.12); border: 1px solid rgba(192,133,82,0.3); }
        .cmp-evo-badge svg { width: 14px; height: 14px; }
        .cmp-evo-chart { margin: 16px 0 6px; }
        .cmp-evo-chart :global(svg) { width: 100%; height: auto; display: block; }
        .cmp-evo-axis {
          display: flex; justify-content: space-between;
          font-size: 11px; color: #8A7A6B; font-weight: 700;
        }
        .cmp-evo-foot {
          font-size: 12px; color: #6F5A44; margin: 14px 0 0; line-height: 1.45;
          padding-top: 13px; border-top: 1px solid rgba(201,169,97,0.16);
        }
        .cmp-evo-foot strong { color: #2C2416; font-weight: 700; }
        .cmp-evo-goal { margin-top: 18px; }
        .cmp-evo-bar {
          position: relative; height: 10px; border-radius: 100px;
          background: rgba(44,36,22,0.06);
        }
        .cmp-evo-bar-fill {
          position: absolute; left: 0; top: 0; bottom: 0; border-radius: 100px;
          background: linear-gradient(90deg, #C9A961, #4CAF7D);
        }
        .cmp-evo-bar-target {
          position: absolute; top: -3px; width: 2px; height: 16px;
          background: #B0885E; transform: translateX(-50%);
        }
        .cmp-evo-bar-target::after {
          content: '★'; position: absolute; top: -15px; left: 50%;
          transform: translateX(-50%); font-size: 10px; color: #B0885E; line-height: 1;
        }
        .cmp-evo-goal-text { font-size: 12.5px; color: #6F5A44; margin: 16px 0 0; line-height: 1.45; }
        .cmp-evo-goal-text strong { color: #2C2416; font-weight: 700; }

        /* ── Skin profile + tips (constant) ── */
        .cmp-profile {
          background: linear-gradient(165deg, #FFFFFF 0%, #FDFAF3 100%);
          border: 1px solid rgba(201,169,97,0.24); border-radius: 22px;
          padding: 18px 20px; margin-bottom: 14px;
          box-shadow: 0 10px 28px rgba(94,71,47,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .cmp-profile-head {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 10px; flex-wrap: wrap; margin-bottom: 12px;
        }
        .cmp-profile-eyebrow {
          font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #C9A961; font-weight: 700;
        }
        .cmp-profile-note {
          font-size: 13px; color: #A8997F; font-style: italic;
          font-family: 'Cormorant Garamond', serif;
        }
        .cmp-profile-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .cmp-profile-item {
          flex: 1; min-width: 110px;
          background: rgba(201,169,97,0.06); border: 1px solid rgba(201,169,97,0.16);
          border-radius: 14px; padding: 11px 14px;
        }
        .cmp-profile-lab {
          display: block; font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #B0885E; font-weight: 700; margin-bottom: 4px;
        }
        .cmp-profile-val {
          display: block; font-family: 'Cormorant Garamond', serif; font-size: 18px;
          color: #2C2416; line-height: 1.1;
        }
        .cmp-tips { margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(201,169,97,0.16); }
        .cmp-tips-title {
          font-family: 'Cormorant Garamond', serif; font-size: 17px; color: #2C2416; margin: 0 0 10px;
        }
        .cmp-tips-title em { font-style: italic; color: #B0885E; }
        .cmp-tips-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
        .cmp-tips-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #4A3C32; line-height: 1.45; }
        .cmp-tips-num {
          flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
          background: rgba(201,169,97,0.14); border: 1px solid rgba(201,169,97,0.3);
          color: #A87449; font-size: 11px; font-weight: 700; font-family: 'Cormorant Garamond', serif;
          display: flex; align-items: center; justify-content: center; margin-top: 1px;
        }

        /* ── Smart CTA ── */
        .cmp-cta {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          border-radius: 20px; padding: 18px 20px; margin-bottom: 24px;
        }
        .cmp-cta.unlock {
          background: linear-gradient(135deg, #2C2416 0%, #3A2F22 100%);
          border: 1px solid rgba(201,169,97,0.4);
        }
        .cmp-cta.rescan {
          background: linear-gradient(135deg, rgba(196,154,170,0.12), rgba(201,169,97,0.08));
          border: 1px solid rgba(196,154,170,0.3);
        }
        .cmp-cta.due {
          border: 1px solid rgba(201,169,97,0.5);
          background: linear-gradient(135deg, rgba(201,169,97,0.16), rgba(227,194,122,0.1));
        }
        .cmp-cta-icon {
          width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cmp-cta-icon svg { width: 20px; height: 20px; }
        .cmp-cta.unlock .cmp-cta-icon { background: rgba(201,169,97,0.18); color: #E3C27A; }
        .cmp-cta.rescan .cmp-cta-icon, .cmp-cta.due .cmp-cta-icon { background: rgba(255,255,255,0.6); border: 1px solid rgba(201,169,97,0.3); color: #B0885E; }
        .cmp-cta-body { flex: 1; min-width: 180px; }
        .cmp-cta-title { font-size: 15px; font-weight: 700; margin: 0 0 3px; }
        .cmp-cta-text { font-size: 12.5px; margin: 0; line-height: 1.45; }
        .cmp-cta.unlock .cmp-cta-title { color: #FFFFFF; }
        .cmp-cta.unlock .cmp-cta-text { color: rgba(255,255,255,0.82); }
        .cmp-cta.rescan .cmp-cta-title, .cmp-cta.due .cmp-cta-title { color: #2C2416; }
        .cmp-cta.rescan .cmp-cta-text, .cmp-cta.due .cmp-cta-text { color: #6F5A44; }
        .cmp-cta-btn {
          display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0;
          border: none; border-radius: 100px; padding: 12px 20px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.04em; cursor: pointer; font-family: inherit;
        }
        .cmp-cta.unlock .cmp-cta-btn {
          background: linear-gradient(135deg, #E3C27A, #C9A961); color: #2C2416;
          box-shadow: 0 8px 20px rgba(201,169,97,0.3);
        }
        .cmp-cta.rescan .cmp-cta-btn, .cmp-cta.due .cmp-cta-btn {
          background: linear-gradient(135deg, #C9A961, #B0885E); color: #fff;
        }
        .cmp-cta-btn .star { font-size: 10px; }

        /* ── Trust strip ── */
        .cmp-trust {
          display: flex; flex-wrap: wrap; gap: 8px 18px; justify-content: center;
          padding: 12px 16px; margin-bottom: 24px;
          background: rgba(255,255,255,0.5); border: 1px solid rgba(201,169,97,0.18);
          border-radius: 14px;
        }
        .cmp-trust-item {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11.5px; color: #6F5A44; font-weight: 600;
        }
        .cmp-trust-item svg { width: 14px; height: 14px; color: #B0885E; flex-shrink: 0; }

        .cmp-rescan {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          background: linear-gradient(135deg, rgba(196,154,170,0.12), rgba(201,169,97,0.08));
          border: 1px solid rgba(196,154,170,0.3); border-radius: 20px;
          padding: 18px 20px; margin-bottom: 28px;
        }
        .cmp-rescan.due { border-color: rgba(201,169,97,0.5); background: linear-gradient(135deg, rgba(201,169,97,0.16), rgba(227,194,122,0.1)); }
        .cmp-rescan-icon {
          width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
          background: rgba(255,255,255,0.6); border: 1px solid rgba(201,169,97,0.3);
          display: flex; align-items: center; justify-content: center; color: #B0885E;
        }
        .cmp-rescan-icon svg { width: 20px; height: 20px; }
        .cmp-rescan-body { flex: 1; min-width: 180px; }
        .cmp-rescan-title { font-size: 14px; font-weight: 700; color: #2C2416; margin: 0 0 2px; }
        .cmp-rescan-text { font-size: 12.5px; color: #6F5A44; margin: 0; line-height: 1.4; }
        .cmp-rescan-cta {
          background: linear-gradient(135deg, #C9A961, #B0885E); color: #fff; border: none;
          border-radius: 100px; padding: 11px 20px; font-size: 12.5px; font-weight: 700;
          cursor: pointer; font-family: inherit; flex-shrink: 0;
        }

        .cmp-section-head {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          margin-bottom: 14px;
        }
        .cmp-section-head h2 {
          font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 500;
          color: #2C2416; margin: 0; letter-spacing: -0.005em;
        }
        .cmp-new {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(180deg, #3A2F22 0%, #2C2416 50%, #1A1410 100%);
          color: #fff; border: none; border-radius: 100px; padding: 11px 18px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 8px 20px rgba(44,36,22,0.18);
        }
        .cmp-new .star { color: #C9A961; font-size: 10px; }

        .cmp-reports { display: flex; flex-direction: column; gap: 12px; }
        .cmp-report {
          display: flex; align-items: center; gap: 16px;
          background: linear-gradient(180deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.2); border-radius: 18px;
          padding: 16px 18px;
          box-shadow: 0 8px 24px rgba(168,116,73,0.04), inset 0 1px 1px rgba(255,255,255,0.85);
        }
        .cmp-report-info { flex: 1; min-width: 0; }
        .cmp-report-meta {
          font-size: 11px; color: #B9AC9E; margin: 0 0 4px;
          display: flex; align-items: center; flex-wrap: wrap; gap: 4px 6px;
        }
        .cmp-tag {
          padding: 1px 7px; border-radius: 10px; font-size: 9px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .cmp-tag.premium { background: rgba(201,169,97,0.14); border: 1px solid rgba(201,169,97,0.28); color: #A87449; }
        .cmp-tag.free { background: rgba(140,122,107,0.08); border: 1px solid rgba(140,122,107,0.18); color: #8C7A6B; }
        .cmp-report-sum {
          font-size: 13px; color: #4A3C32; margin: 0; line-height: 1.5;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .cmp-report-open {
          flex-shrink: 0; background: rgba(44,36,22,0.04); border: 1px solid rgba(44,36,22,0.12);
          color: #2C2416; border-radius: 100px; padding: 10px 18px;
          font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit;
          transition: background 0.2s;
        }
        .cmp-report-open:hover { background: rgba(44,36,22,0.08); }

        .cmp-empty {
          text-align: center; padding: 40px 24px;
          background: rgba(255,255,255,0.55); border: 1px solid rgba(201,169,97,0.2);
          border-radius: 20px;
        }
        .cmp-empty p { font-size: 14px; color: #8C7A6B; margin: 0 0 18px; }

        @media (max-width: 560px) {
          .cmp-hello { font-size: 22px; }
          .cmp-section-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </>
  );
}
