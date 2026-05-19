import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '../components/Logo';
import { useLang } from '../lib/LangContext';

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {['en', 'fr'].map((l, i) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {i > 0 && <span style={{ color: '#ddd', fontSize: 11, lineHeight: 1 }}>|</span>}
          <button
            onClick={() => setLang(l)}
            style={{
              background: 'none', border: 'none',
              fontSize: 11, fontWeight: lang === l ? 700 : 400,
              color: lang === l ? '#0d0d0d' : '#bbb',
              cursor: 'pointer', padding: '2px 5px',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

export default function Privacy() {
  const router = useRouter();
  const { lang, t } = useLang();

  // Content for English and French
  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: May 19, 2026',
      intro: 'At Rate My Skin, we are committed to protecting your privacy. This Privacy Policy describes how we collect, use, and handle your data when you use our website and services.',
      
      sections: [
        {
          title: '1. Photo Processing (Our Strict Privacy Commitment)',
          body: 'We value your privacy above all. Photos you upload for AI skin analysis are processed in real-time. We NEVER store, save, or share your photos on our servers. They are permanently discarded immediately after the analysis is completed.'
        },
        {
          title: '2. Data We Collect',
          body: 'We collect the following information when you use our service:\n• Email Address: To link your reports to your device, allow access to past analyses (via "My Reports"), and send weekly skin tips (only if you subscribe).\n• Skincare Context: Optional data such as age, environment/climate, and allergies to personalize your results.'
        },
        {
          title: '3. Payment Processing',
          body: 'All payments are handled securely by Stripe. We do not store or have access to your credit card details or payment credentials.'
        },
        {
          title: '4. Third-Party Services',
          body: 'We use secure industry-standard third-party providers:\n• Supabase: To store email-to-report relationships and settings securely.\n• Anthropic: To run the AI models that analyze your skin metrics.\n• Stripe: For handling payments.'
        },
        {
          title: '5. Web Storage and Cookies',
          body: 'We use local storage and session storage on your browser to remember your language preferences, session IDs, and temporary report states. We do not use tracking or advertising cookies.'
        },
        {
          title: '6. Your Rights',
          body: 'You have the right to access, update, or request the deletion of your email address and associated reports from our database. To make a request, please contact us.'
        }
      ],
      back: '← Back to Home'
    },
    fr: {
      title: 'Politique de Confidentialité',
      lastUpdated: 'Dernière mise à jour : 19 mai 2026',
      intro: 'Chez Rate My Skin, nous prenons la protection de votre vie privée très au sérieux. Cette Politique de Confidentialité décrit comment nous recueillons, utilisons et traitons vos données lorsque vous utilisez notre site web et nos services.',
      
      sections: [
        {
          title: '1. Traitement des Photos (Engagement Strict)',
          body: 'Votre vie privée est notre priorité absolue. Les photos que vous téléchargez pour l\'analyse par IA sont traitées en temps réel. Nous ne stockons, ne sauvegardons et ne partageons JAMAIS vos photos sur nos serveurs. Elles sont définitivement supprimées immédiatement après la fin de l\'analyse.'
        },
        {
          title: '2. Données Collectées',
          body: 'Nous collectons les informations suivantes lors de votre utilisation de nos services :\n• Adresse E-mail : Pour lier vos rapports à votre appareil, vous permettre d\'accéder à vos analyses passées (via "Mes rapports") et vous envoyer des conseils beauté hebdomadaires (uniquement si vous y consentez).\n• Contexte Cutané : Données facultatives telles que l\'âge, le type d\'environnement/climat et les allergies pour personnaliser votre analyse.'
        },
        {
          title: '3. Traitement des Paiements',
          body: 'Tous les paiements sont traités de manière sécurisée par Stripe. Nous ne stockons pas et n\'avons pas accès à vos informations bancaires ou de carte de crédit.'
        },
        {
          title: '4. Services Tiers',
          body: 'Nous utilisons des prestataires tiers de confiance respectant les standards de l\'industrie :\n• Supabase : Pour stocker de manière sécurisée les relations e-mail/rapports.\n• Anthropic : Pour exécuter les modèles d\'IA analysant vos paramètres de peau.\n• Stripe : Pour le traitement des transactions.'
        },
        {
          title: '5. Stockage Web et Cookies',
          body: 'Nous utilisons le stockage local (localStorage/sessionStorage) de votre navigateur pour mémoriser vos préférences de langue, vos identifiants de session et l\'état de vos rapports temporaires. Nous n\'utilisons pas de cookies de suivi publicitaire.'
        },
        {
          title: '6. Vos Droits',
          body: 'Vous disposez d\'un droit d\'accès, de modification ou de suppression de votre adresse e-mail et de vos rapports associés de notre base de données. Pour toute demande, veuillez nous contacter.'
        }
      ],
      back: '← Retour à l\'accueil'
    }
  };

  const activeContent = content[lang] || content.en;

  return (
    <>
      <Head>
        <title>{activeContent.title} — Rate My Skin</title>
        <meta name="description" content={lang === 'fr' ? "Politique de confidentialité de Rate My Skin — analyse de peau par IA." : "Privacy policy for Rate My Skin — AI skin analysis."} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://ratemyskin.co/privacy" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ratemyskin.co/privacy" />
        <meta property="og:title" content={`${activeContent.title} — Rate My Skin`} />
        <meta property="og:description" content={lang === 'fr' ? "Politique de confidentialité de Rate My Skin — analyse de peau par IA." : "Privacy policy for Rate My Skin — AI skin analysis."} />
        <meta property="og:image" content="https://ratemyskin.co/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${activeContent.title} — Rate My Skin`} />
        <meta name="twitter:description" content={lang === 'fr' ? "Politique de confidentialité de Rate My Skin — analyse de peau par IA." : "Privacy policy for Rate My Skin — AI skin analysis."} />
        <meta name="twitter:image" content="https://ratemyskin.co/og-image.png" />
      </Head>

      {/* Sticky nav */}
      <div className="nav-blur" style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '13px 26px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        animation: 'slideDown 0.55s ease',
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LangToggle />
          <button
            onClick={() => router.push('/')}
            className="btn-liquid-glass"
            style={{
              borderRadius: 10,
              padding: '9px 18px', fontSize: 12,
              border: 'none',
            }}
          >
            {activeContent.back}
          </button>
        </div>
      </div>

      {/* Privacy Policy Container */}
      <div style={{ maxWidth: 720, margin: '40px auto 80px', padding: '0 24px' }}>
        <div className="card-blur" style={{
          borderRadius: 24,
          padding: 'clamp(24px, 5vw, 48px)',
          boxShadow: '0 12px 48px rgba(168,116,73,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
          animation: 'scaleIn 0.5s ease-out',
        }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(28px, 6vw, 42px)',
            fontWeight: 400,
            color: '#3A2E26',
            marginBottom: 8,
            lineHeight: 1.2,
          }}>
            {activeContent.title}
          </h1>
          <p style={{
            fontSize: 12,
            color: '#A87449',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.04em',
            marginBottom: 24,
          }}>
            {activeContent.lastUpdated}
          </p>

          <p style={{
            fontSize: 14.5,
            lineHeight: 1.75,
            color: '#6F6156',
            marginBottom: 32,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {activeContent.intro}
          </p>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(168,116,73,0.15), transparent)', marginBottom: 32 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {activeContent.sections.map((section, idx) => (
              <div key={idx}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 500,
                  color: '#3A2E26',
                  marginBottom: 10,
                }}>
                  {section.title}
                </h2>
                <p style={{
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  color: '#6F6156',
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: 'pre-line',
                }}>
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(168,116,73,0.15), transparent)', marginTop: 40, marginBottom: 32 }} />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/')}
              className="btn-liquid-glass-dark"
              style={{
                borderRadius: 12,
                padding: '14px 28px',
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
              }}
            >
              {activeContent.back}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
