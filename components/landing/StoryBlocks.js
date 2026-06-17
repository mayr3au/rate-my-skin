/**
 * StoryBlocks — 3 blocs landing narratifs (V1 clair, V2 éditorial sombre, V3 scan portrait)
 * Inspirés des maquettes validées. Présentationnel : chaque bloc reçoit { lang, onAnalyze }.
 * onAnalyze() doit déclencher le flow d'analyse existant (ex: setShowUploadSelector(true)).
 */

const SERIF = "'Cormorant Garamond', serif";
const SANS = "'DM Sans', sans-serif";
const CREAM = '#F8F4ED';
const GOLD = '#C5A028';
const GOLD_SOFT = '#C9A961';
const TAN = '#D4A574';
const BROWN = '#2C2416';
const GREEN = '#7DBFA8';

/* ── Petit anneau de score réutilisable ── */
function Ring({ size = 120, stroke = 7, pct = 62, color = GOLD_SOFT, track = 'rgba(201,169,97,0.18)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${c * (pct / 100)} ${c}`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

function Wordmark({ light = false }) {
  const color = light ? '#F4ECE0' : BROWN;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SERIF, fontSize: 22, color, lineHeight: 1 }}>
      <span style={{ fontWeight: 600 }}>RateMy</span>
      <span style={{ color: TAN, fontSize: 16 }}>❋</span>
      <span style={{ fontStyle: 'italic', fontWeight: 500 }}>Skin</span>
    </div>
  );
}

function CtaPill({ label, onClick, dark = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: dark
          ? 'linear-gradient(135deg, #D9B45A 0%, #C5A028 100%)'
          : 'linear-gradient(135deg, #2C2416 0%, #1A150C 100%)',
        color: dark ? '#2C2416' : '#FFF',
        border: 'none', borderRadius: 100,
        padding: '16px 30px', cursor: 'pointer',
        fontFamily: SANS, fontSize: 15, fontWeight: 700, letterSpacing: '0.02em',
        boxShadow: dark ? '0 10px 28px rgba(197,160,40,0.30)' : '0 10px 28px rgba(44,36,22,0.22)',
      }}
    >
      <span style={{ fontSize: 14 }}>✦</span>{label}
    </button>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <span style={{
      fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
      textTransform: 'uppercase', color: light ? 'rgba(212,165,116,0.9)' : TAN,
    }}>
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════
   BLOC 1 — V1 clair · produit + conseil
   ════════════════════════════════════════════ */
export function HeroV1({ lang = 'fr', onAnalyze }) {
  const fr = lang === 'fr';
  const metrics = [
    { v: 78, label: fr ? 'Hydratation' : 'Hydration', color: GREEN },
    { v: 65, label: fr ? 'Éclat' : 'Radiance', color: GOLD_SOFT },
    { v: 89, label: fr ? 'Rougeurs' : 'Redness', color: TAN },
  ];
  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 20px 0' }}>
      <div style={{
        background: 'linear-gradient(170deg, #FBF7F0 0%, #F3E9DB 100%)',
        borderRadius: 28, border: '1px solid rgba(201,169,97,0.18)',
        boxShadow: '0 30px 70px rgba(44,36,22,0.06)',
        padding: 'clamp(28px, 5vw, 52px)', position: 'relative', overflow: 'hidden',
      }}>
        {/* header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(20px,4vw,34px)' }}>
          <Wordmark />
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, color: TAN }}>ratemyskin.co</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,4vw,48px)', alignItems: 'center' }}>
          {/* left */}
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(201,169,97,0.3)', background: 'rgba(201,169,97,0.06)', marginBottom: 18 }}>
              <span style={{ color: TAN, fontSize: 12 }}>✦</span>
              <Eyebrow>{fr ? 'Analyse IA · 30 secondes' : 'AI analysis · 30 seconds'}</Eyebrow>
            </div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(34px,6vw,56px)', lineHeight: 1.05, color: BROWN, margin: '0 0 16px' }}>
              {fr ? 'Note ta peau en 30 secondes' : 'Rate your skin in 30 seconds'}
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2.4vw,17px)', color: '#6B5B49', lineHeight: 1.55, margin: '0 0 28px', maxWidth: 420 }}>
              {fr
                ? 'Tu testes des produits au hasard ? Obtiens un diagnostic précis et une routine qui marche enfin.'
                : 'Buying products at random? Get a precise diagnosis and a routine that finally works.'}
            </p>
            <div style={{ display: 'none' }} className="storyblock-cta-desktop">
              <CtaPill label={fr ? 'Analyse gratuite · Rapport dès 7,99€' : 'Free analysis · Report from €7.99'} onClick={onAnalyze} />
            </div>
          </div>

          {/* right: score card */}
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <div style={{ background: '#FFFDFA', borderRadius: 22, padding: 'clamp(20px,3vw,28px)', boxShadow: '0 14px 40px rgba(44,36,22,0.08)', border: '1px solid rgba(201,169,97,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <Eyebrow>{fr ? 'Score global' : 'Global score'}</Eyebrow>
                <Eyebrow>{fr ? 'Aperçu gratuit' : 'Free preview'}</Eyebrow>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                <Ring size={118} stroke={8} pct={62} color={GOLD_SOFT}>
                  <span style={{ fontFamily: SERIF, fontSize: 44, color: BROWN, lineHeight: 1 }}>62</span>
                  <span style={{ fontFamily: SERIF, fontSize: 14, color: TAN }}>/100</span>
                </Ring>
                <div style={{ display: 'flex', gap: 14, flex: 1, justifyContent: 'space-around' }}>
                  {metrics.map((m) => (
                    <div key={m.label} style={{ textAlign: 'center' }}>
                      <Ring size={50} stroke={4} pct={m.v} color={m.color}>
                        <span style={{ fontFamily: SERIF, fontSize: 17, color: BROWN }}>{m.v}</span>
                      </Ring>
                      <div style={{ fontFamily: SANS, fontSize: 10.5, color: '#8C7A6B', marginTop: 4 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* conseil routine */}
              <div style={{ marginTop: 20, background: CREAM, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,169,97,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                </div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TAN }}>{fr ? 'Conseil routine' : 'Routine tip'}</div>
                  <div style={{ fontFamily: SANS, fontSize: 14, color: BROWN, fontWeight: 600 }}>{fr ? "Sérum à l'acide hyaluronique, matin & soir" : 'Hyaluronic acid serum, AM & PM'}</div>
                </div>
              </div>
              {/* testimonial */}
              <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(201,169,97,0.14)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: GOLD, fontSize: 13, letterSpacing: 1 }}>★★★★★</span>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: '#8C7A6B', fontWeight: 600 }}>4,9/5 · +15 000 analyses</span>
                </div>
                <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, color: '#3A2E26', margin: '0 0 4px', lineHeight: 1.35 }}>
                  {fr ? '« Enfin une routine pensée pour MA peau, pas une de plus au hasard. »' : '"Finally a routine built for MY skin, not another random one."'}
                </p>
                <div style={{ fontFamily: SANS, fontSize: 11, color: '#A2968B' }}>Léa, 24 {fr ? 'ans · peau mixte' : 'y/o · combination'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA full width (mobile + bottom) */}
        <div style={{ marginTop: 'clamp(24px,4vw,36px)', display: 'flex', justifyContent: 'center' }}>
          <CtaPill label={fr ? 'Analyse gratuite · Rapport dès 7,99€' : 'Free analysis · Report from €7.99'} onClick={onAnalyze} />
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   BLOC 2 — V2 éditorial sombre
   ════════════════════════════════════════════ */
export function EditorialV2({ lang = 'fr', onAnalyze }) {
  const fr = lang === 'fr';
  const crit = [
    { label: fr ? 'Hydratation' : 'Hydration', d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' },
    { label: fr ? 'Éclat' : 'Radiance', d: 'M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M17 7l1.4-1.4M5.6 18.4L7 17' },
    { label: 'Pores', d: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z' },
    { label: fr ? 'Rougeurs' : 'Redness', d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21l8.84-8.61a5.5 5.5 0 0 0 0-7.78z' },
  ];
  return (
    <section style={{ maxWidth: 1080, margin: '36px auto 0', padding: '0 20px' }}>
      <div style={{
        background: 'radial-gradient(120% 90% at 50% 0%, #3A2A1A 0%, #261A0F 55%, #1C130A 100%)',
        borderRadius: 28, padding: 'clamp(40px,7vw,72px) clamp(24px,5vw,48px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        boxShadow: '0 30px 70px rgba(20,14,6,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}><Wordmark light /></div>
        <Eyebrow light>{fr ? 'Tu testes tout, rien ne change ?' : 'You try everything, nothing changes?'}</Eyebrow>
        <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(36px,7vw,68px)', lineHeight: 1.04, color: '#F6EEE2', margin: '16px auto 36px', maxWidth: 620 }}>
          {fr ? 'Pourquoi ta routine ne marche pas ?' : 'Why your routine doesn’t work?'}
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <Ring size={180} stroke={6} pct={28} color={GOLD_SOFT} track="rgba(255,255,255,0.08)">
            <span style={{ fontFamily: SERIF, fontSize: 64, color: '#F6EEE2', lineHeight: 1 }}>?</span>
            <span style={{ fontFamily: SERIF, fontSize: 16, color: 'rgba(212,165,116,0.8)' }}>/100</span>
          </Ring>
        </div>

        <div style={{ marginBottom: 18 }}><Eyebrow light>{fr ? '12 critères analysés par l’IA' : '12 criteria analyzed by AI'}</Eyebrow></div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px,4vw,40px)', flexWrap: 'wrap', marginBottom: 40 }}>
          {crit.map((c) => (
            <div key={c.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, border: '1px solid rgba(212,165,116,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TAN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={c.d} /></svg>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(246,238,226,0.75)' }}>{c.label}</span>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2.4vw,17px)', color: 'rgba(246,238,226,0.78)', lineHeight: 1.6, maxWidth: 460, margin: '0 auto 32px' }}>
          {fr ? "Parce qu'elle n'est pas faite pour TA peau. L'IA révèle ce dont elle a vraiment besoin." : "Because it's not built for YOUR skin. The AI reveals what it truly needs."}
        </p>
        <CtaPill dark label={fr ? 'Découvre ton score gratuit' : 'Get your free score'} onClick={onAnalyze} />
        <div style={{ marginTop: 26, fontFamily: SANS, fontSize: 11, letterSpacing: '0.2em', color: 'rgba(212,165,116,0.7)' }}>RATEMYSKIN.CO</div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   BLOC 3 — V3 scan / portrait clair
   ════════════════════════════════════════════ */
export function ScanV3({ lang = 'fr', onAnalyze }) {
  const fr = lang === 'fr';
  return (
    <section style={{ maxWidth: 1080, margin: '36px auto 0', padding: '0 20px' }}>
      <div style={{
        background: 'linear-gradient(160deg, #FBF7F0 0%, #F1E7D7 100%)',
        borderRadius: 28, border: '1px solid rgba(201,169,97,0.18)',
        padding: 'clamp(28px,5vw,52px)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(20px,4vw,30px)' }}>
          <Wordmark />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: BROWN, color: '#F4ECE0', fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em' }}>✦ {fr ? 'ANALYSE IA' : 'AI SCAN'}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,4vw,48px)', alignItems: 'center' }}>
          {/* drop zone */}
          <div style={{ flex: '1 1 280px', minWidth: 0, position: 'relative' }}>
            <div style={{
              border: `1.5px dashed ${GOLD_SOFT}`, borderRadius: 20, minHeight: 280,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: 24,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 14, letterSpacing: '0.08em', color: '#9A8A75' }}>[ {fr ? 'glisse un portrait ici' : 'drop a portrait here'} ]</div>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: '#B6A789', marginTop: 6 }}>{fr ? 'selfie lumineux, cadrage visage' : 'bright selfie, face framed'}</div>
            </div>
            {/* floating chips */}
            <div style={{ position: 'absolute', top: 24, right: -8, background: '#fff', borderRadius: 30, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 26px rgba(44,36,22,0.12)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
              <span style={{ fontFamily: SANS, fontSize: 12.5, color: BROWN }}>{fr ? 'Hydratation' : 'Hydration'} <b>78</b></span>
            </div>
            <div style={{ position: 'absolute', top: 72, right: 6, background: '#fff', borderRadius: 30, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 26px rgba(44,36,22,0.12)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD_SOFT} strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2" /></svg>
              <span style={{ fontFamily: SANS, fontSize: 12.5, color: BROWN }}>{fr ? 'Éclat' : 'Radiance'} <b>65</b></span>
            </div>
          </div>

          {/* right text */}
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <Ring size={70} stroke={5} pct={71} color={GOLD_SOFT}>
                <span style={{ fontFamily: SERIF, fontSize: 24, color: BROWN }}>71</span>
              </Ring>
              <div style={{ background: '#fff', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 22px rgba(44,36,22,0.06)' }}>
                <div style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TAN }}>{fr ? 'Ton score global' : 'Your global score'}</div>
                <div style={{ fontFamily: SERIF, fontSize: 18, color: BROWN }}>{fr ? 'Bon potentiel à révéler' : 'Good potential to reveal'}</div>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}><Eyebrow>{fr ? 'Arrête de deviner' : 'Stop guessing'}</Eyebrow></div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(30px,5vw,46px)', lineHeight: 1.05, color: BROWN, margin: '0 0 22px' }}>
              {fr ? "Sache enfin ce qu'il lui faut" : 'Finally know what it needs'}
            </h2>
            <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26, boxShadow: '0 8px 22px rgba(44,36,22,0.05)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(201,169,97,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TAN }}>{fr ? 'Ta routine personnalisée' : 'Your personalized routine'}</div>
                <div style={{ fontFamily: SANS, fontSize: 14, color: BROWN, fontWeight: 600 }}>{fr ? 'Nettoyant doux + sérum hydratant + SPF 50' : 'Gentle cleanser + hydrating serum + SPF 50'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <CtaPill label={fr ? 'Analyse gratuite' : 'Free analysis'} onClick={onAnalyze} />
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, color: TAN }}>ratemyskin.co</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StoryBlocks({ lang = 'fr', onAnalyze }) {
  return (
    <>
      <HeroV1 lang={lang} onAnalyze={onAnalyze} />
      <EditorialV2 lang={lang} onAnalyze={onAnalyze} />
      <ScanV3 lang={lang} onAnalyze={onAnalyze} />
    </>
  );
}
