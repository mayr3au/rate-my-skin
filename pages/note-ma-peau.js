import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';

const GOLD = '#C5A028';
const WARM = '#A87449';

const steps = [
  {
    num: '01',
    title: 'Upload ta photo',
    desc: "Importe une photo de ton visage — bonne lumière, visage centré, gros plan. JPG, PNG ou WebP jusqu'à 20 Mo.",
  },
  {
    num: '02',
    title: "L'IA analyse en 30 secondes",
    desc: "Notre intelligence artificielle examine 8 métriques cliniques : hydratation, éclat, acné, pores, taches brunes, cernes, symétrie et harmonie du visage.",
  },
  {
    num: '03',
    title: 'Reçois ton score et tes conseils',
    desc: "Tu obtiens ton score de peau sur 100, tes 3 problèmes cutanés prioritaires, et des conseils skincare personnalisés adaptés à ton type de peau.",
  },
];

const faqs = [
  {
    q: "Comment l'IA note ma peau ?",
    a: "Notre IA analyse une photo de ton visage et évalue 8 critères dermatologiques : hydratation, éclat, présence d'acné, taille des pores, taches brunes, cernes, symétrie du visage et harmonie des traits. Chaque critère est noté individuellement, puis combiné pour générer un score global sur 100. L'analyse est réalisée en temps réel et ta photo n'est jamais stockée.",
  },
  {
    q: 'Est-ce vraiment gratuit ?',
    a: "Oui, entièrement gratuit. Tu obtiens ton score de peau et tes 3 principaux problèmes cutanés sans débourser un centime, sans inscription obligatoire. Un rapport complet avec les 8 métriques détaillées, ton plan d'amélioration et ta routine sur-mesure est disponible en option à 7,99 €.",
  },
  {
    q: 'Quelles sont les notes possibles ?',
    a: "Le score de peau va de 0 à 100. De 80 à 100 : excellente santé cutanée visible. De 60 à 79 : bonne santé avec quelques points à améliorer. De 40 à 59 : des problèmes modérés identifiés. En dessous de 40 : des axes prioritaires à traiter. La majorité des utilisateurs se situe entre 55 et 80.",
  },
  {
    q: 'Comment améliorer ma note de peau ?',
    a: "Après l'analyse, tu reçois des conseils personnalisés basés sur tes résultats : routine matin/soir adaptée, ingrédients actifs recommandés (rétinol, niacinamide, acide hyaluronique…) et habitudes de vie à adopter. En suivant une routine skincare cohérente pendant 4 à 8 semaines, la plupart des utilisateurs observent une amélioration visible de leur score peau.",
  },
];

export default function NoteMaPeau() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Note Ma Peau - Test Gratuit IA | Rate My Skin</title>
        <meta name="description" content="Note ma peau gratuitement avec l'IA. Test de peau en 30 secondes, score personnalisé et conseils experts." />
        <meta name="keywords" content="note ma peau, noter sa peau, test peau ia, score peau gratuit, analyse peau ia, diagnostic peau" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://ratemyskin.co/note-ma-peau" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ratemyskin.co/note-ma-peau" />
        <meta property="og:title" content="Note Ma Peau - Test Gratuit IA | Rate My Skin" />
        <meta property="og:description" content="Note ma peau gratuitement avec l'IA. Test de peau en 30 secondes, score personnalisé et conseils experts." />
        <meta property="og:image" content="https://ratemyskin.co/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Note Ma Peau - Test Gratuit IA | Rate My Skin" />
        <meta name="twitter:description" content="Note ma peau gratuitement avec l'IA. Test de peau en 30 secondes, score personnalisé et conseils experts." />
        <meta name="twitter:image" content="https://ratemyskin.co/og-image.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Note Ma Peau - Test Gratuit IA',
          url: 'https://ratemyskin.co/note-ma-peau',
          description: "Note ma peau gratuitement avec l'IA. Test de peau en 30 secondes, score personnalisé et conseils experts.",
          inLanguage: 'fr',
          isPartOf: { '@type': 'WebSite', name: 'Rate My Skin', url: 'https://ratemyskin.co' },
        }) }} />
      </Head>

      {/* Nav */}
      <div className="nav-blur" style={{
        position: 'sticky', top: 0, zIndex: 200,
        padding: '13px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(180,160,140,0.04)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
        <button
          onClick={() => router.push('/')}
          className="btn-liquid-glass"
          style={{ border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 12 }}
        >
          ← Accueil
        </button>
      </div>

      <main style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 88px) 24px 40px', maxWidth: 780, margin: '0 auto' }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 18,
            fontFamily: "'DM Sans', sans-serif",
            background: 'linear-gradient(180deg, #2C241D 0%, #6B4828 12%, #A87449 50%, #6B4828 88%, #2C241D 100%)',
            backgroundSize: '100% 150%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Analyse IA · Gratuit · 30 secondes
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 400,
            color: '#3A2E26', lineHeight: 1.15, margin: '0 0 18px',
          }}>
            Note ma peau gratuitement<br />
            <em>avec l'IA en 30 secondes</em>
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(17px, 2.5vw, 23px)', fontWeight: 300,
            color: '#6B5040', margin: '0 0 28px', lineHeight: 1.4, fontStyle: 'italic',
          }}>
            Découvre ton score peau et tes conseils personnalisés
          </p>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #3A2E26, #5A4035)',
                color: '#fff', border: 'none', borderRadius: 30,
                padding: '16px 36px', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 8px 28px rgba(58,46,38,0.22)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(58,46,38,0.30)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(58,46,38,0.22)'; }}
            >
              Note ma peau maintenant →
            </button>
          </Link>
          <p style={{ margin: '14px 0 0', fontSize: 11, color: '#B9AC9E', fontFamily: "'DM Sans', sans-serif" }}>
            ✓ Gratuit &nbsp;·&nbsp; ✓ Sans inscription &nbsp;·&nbsp; ✓ Photo non stockée
          </p>
        </div>

        {/* ── Trust bubbles ── */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'stretch',
          gap: 12, flexWrap: 'wrap', maxWidth: 580, margin: '0 auto 56px',
          padding: '0 24px',
        }}>
          {[
            { num: '8', label: 'métriques analysées' },
            { num: '100%', label: 'privé — photo non stockée' },
            { num: '~20s', label: 'pour ton rapport complet' },
          ].map(({ num, label }) => (
            <div key={label} className="bubble-nacré" style={{
              flex: '1 1 120px', textAlign: 'center',
              padding: '12px 14px', borderRadius: 24,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            }}>
              <div style={{
                fontSize: 22, fontWeight: 500, fontFamily: "'Cormorant Garamond', serif",
                background: 'linear-gradient(90deg, #A87449 0%, #D4A574 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{num}</div>
              <div style={{
                fontSize: 9, color: '#8C7A6B', letterSpacing: '0.06em', textTransform: 'uppercase',
                marginTop: 2, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: 1.3,
              }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Intro paragraphs ── */}
        <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 24px 56px' }}>
          <div className="card-blur" style={{
            borderRadius: 24,
            padding: 'clamp(24px, 5vw, 44px)',
            boxShadow: '0 8px 32px rgba(168,116,73,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}>
            <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#6F6156', margin: '0 0 22px', fontFamily: "'DM Sans', sans-serif" }}>
              <strong style={{ color: '#3A2E26' }}>Noter sa peau</strong>, c'est obtenir une évaluation objective de l'état de ta peau à un instant donné. Contrairement à une simple observation dans le miroir, le diagnostic peau IA de Rate My Skin analyse plusieurs paramètres cliniques — hydratation, éclat, acné, pores, taches, cernes — pour te donner un <strong style={{ color: '#3A2E26' }}>score peau sur 100</strong>, précis et reproductible.
            </p>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(168,116,73,0.15), transparent)', margin: '0 0 22px' }} />
            <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#6F6156', margin: '0 0 22px', fontFamily: "'DM Sans', sans-serif" }}>
              L'<strong style={{ color: '#3A2E26' }}>analyse de peau par IA</strong> est devenue la méthode la plus accessible pour comprendre sa peau sans rendez-vous dermatologique. En 30 secondes, tu obtiens un rapport complet : les forces de ta peau, les problèmes prioritaires à traiter, et une routine skincare personnalisée. Que tu aies une peau grasse, sèche, mixte ou sensible, l'IA s'adapte à ton profil cutané unique.
            </p>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(168,116,73,0.15), transparent)', margin: '0 0 22px' }} />
            <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#6F6156', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Le <strong style={{ color: '#3A2E26' }}>test de peau IA</strong> est totalement gratuit et ne nécessite aucune inscription. Ta photo est analysée en temps réel et n'est jamais stockée sur nos serveurs. Tu peux noter ta peau autant de fois que tu le souhaites, depuis n'importe quel appareil, pour suivre l'évolution de ton score peau dans le temps.
            </p>
          </div>
        </div>

        {/* ── Steps ── */}
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 64px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 400,
            color: '#3A2E26', textAlign: 'center', margin: '0 0 36px',
          }}>
            Comment noter ma peau en 3 étapes ?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map((step) => (
              <div key={step.num} className="card-blur" style={{
                borderRadius: 20,
                padding: 'clamp(18px, 4vw, 28px) clamp(20px, 4vw, 32px)',
                display: 'flex', alignItems: 'flex-start', gap: 20,
                boxShadow: '0 4px 20px rgba(168,116,73,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}>
                <div style={{
                  flexShrink: 0, width: 46, height: 46, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(197,160,40,0.12), rgba(168,116,73,0.08))',
                  border: '1px solid rgba(197,160,40,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 19, fontWeight: 500, color: WARM,
                }}>
                  {step.num}
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 21, fontWeight: 500, color: '#3A2E26',
                    margin: '0 0 6px',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: 13.5, lineHeight: 1.65, color: '#6F6156',
                    fontFamily: "'DM Sans', sans-serif", margin: 0,
                  }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 64px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 400,
            color: '#3A2E26', textAlign: 'center', margin: '0 0 36px',
          }}>
            Questions fréquentes sur l'analyse de peau
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((faq, i) => (
              <div key={i} className="card-blur" style={{
                borderRadius: 20,
                padding: 'clamp(18px, 4vw, 28px) clamp(20px, 4vw, 32px)',
                boxShadow: '0 4px 20px rgba(168,116,73,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20, fontWeight: 500, color: '#3A2E26',
                  margin: '0 0 10px',
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  fontSize: 13.5, lineHeight: 1.72, color: '#6F6156',
                  fontFamily: "'DM Sans', sans-serif", margin: 0,
                }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Final CTA ── */}
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px 88px', textAlign: 'center' }}>
          <div className="card-blur" style={{
            borderRadius: 28,
            padding: 'clamp(28px, 6vw, 52px) clamp(24px, 5vw, 44px)',
            boxShadow: '0 16px 56px rgba(168,116,73,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}>
            <p style={{
              fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: GOLD, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              margin: '0 0 14px',
            }}>
              ✦ Gratuit · Sans inscription
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 400,
              color: '#2C241D', margin: '0 0 12px', lineHeight: 1.2,
            }}>
              Prêt(e) à noter ta peau ?
            </h2>
            <p style={{
              fontSize: 13, color: '#8C7A6B', lineHeight: 1.7,
              fontFamily: "'DM Sans', sans-serif", margin: '0 0 24px',
            }}>
              Diagnostic peau IA en 30 secondes. Score peau sur 100, analyse de peau gratuite et conseils skincare personnalisés.
            </p>
            <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #3A2E26, #5A4035)',
                  color: '#fff', border: 'none', borderRadius: 20,
                  padding: '16px 32px', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  width: '100%',
                  boxShadow: '0 8px 24px rgba(58,46,38,0.18)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(58,46,38,0.26)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(58,46,38,0.18)'; }}
              >
                Note ma peau maintenant →
              </button>
            </Link>
            <p style={{ margin: '14px 0 0', fontSize: 11, color: '#B9AC9E', fontFamily: "'DM Sans', sans-serif" }}>
              ✓ Photo non stockée &nbsp;·&nbsp; ✓ Résultats en ~20s &nbsp;·&nbsp; ✓ 100% privé
            </p>
          </div>
        </div>

      </main>
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
