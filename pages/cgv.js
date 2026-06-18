import Head from 'next/head';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useLang } from '../lib/LangContext';

const COPY = {
  fr: {
    metaTitle: "CGV — Conditions Générales de Vente · Rate My Skin",
    metaDesc: "Conditions Générales de Vente de Rate My Skin : prix, paiement, droit de rétractation, garantie satisfait ou remboursé sous 7 jours.",
    eyebrow: "Conditions générales de vente",
    title: "Nos ",
    titleEm: "engagements.",
    sub: "Transparence totale sur ce que tu paies, comment tu paies, et ce qui se passe si tu changes d'avis.",
    lastUpdate: "Dernière mise à jour : 1er janvier 2026",
    sections: [
      {
        title: "1. Objet",
        body: "Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation des services payants proposés par RateMySkin SAS sur le site ratemyskin.co. En procédant à un achat, tu acceptes pleinement et sans réserve les présentes CGV."
      },
      {
        title: "2. Identité du vendeur",
        body: "Le service est édité par RateMySkin SAS, société immatriculée en France. Coordonnées complètes disponibles sur la page Mentions légales. Contact : hello@ratemyskin.co."
      },
      {
        title: "3. Services proposés",
        body: "Rate My Skin propose deux niveaux de service :",
        list: [
          "Diagnostic gratuit : score global sur 100, 3 métriques visibles, carte du visage simplifiée. Sans inscription, sans paiement.",
          "Rapport complet (7,99 €) : 8 métriques détaillées, cartographie complète, 3 priorités avec causes, routine matin & soir personnalisée, plan de progression 8 semaines, rapport PDF téléchargeable."
        ]
      },
      {
        title: "4. Prix et paiement",
        body: "Le rapport complet est facturé 7,99 € TTC en paiement unique, sans abonnement. Le paiement est sécurisé par Stripe. Aucune donnée bancaire n'est conservée sur nos serveurs. Le prix peut être ajusté à la hausse ou à la baisse à tout moment ; le tarif appliqué est celui affiché au moment de la transaction."
      },
      {
        title: "5. Droit de rétractation et garantie",
        body: "Conformément à l'article L.221-28 du Code de la consommation, en achetant un contenu numérique à exécution immédiate, tu renonces expressément à ton droit de rétractation légal de 14 jours. Toutefois, Rate My Skin offre une garantie commerciale satisfait ou remboursé de 7 jours : si tu n'es pas satisfaite de ton rapport, écris à hello@ratemyskin.co dans les 7 jours suivant l'achat pour obtenir un remboursement intégral, sans justification."
      },
      {
        title: "6. Limitation de responsabilité",
        body: "Rate My Skin est un outil d'orientation skincare fondé sur l'analyse visuelle d'une photographie. Il ne constitue en aucun cas un diagnostic médical, une consultation dermatologique ou une prescription. Pour toute condition cutanée persistante, douloureuse, évolutive ou inhabituelle (rosacée sévère, eczéma persistant, acné kystique, mélanome suspect), tu dois impérativement consulter un dermatologue. RateMySkin SAS ne pourra être tenue responsable des conséquences d'un usage des recommandations sans avis médical préalable lorsque la situation le justifie."
      },
      {
        title: "7. Propriété intellectuelle",
        body: "L'ensemble des contenus du site (textes, visuels, code, rapports générés, charte graphique) est protégé par le droit d'auteur et la propriété intellectuelle. Le rapport personnel généré reste utilisable par l'acheteuse pour son usage personnel ; toute revente ou diffusion commerciale est interdite."
      },
      {
        title: "8. Données personnelles",
        body: "Les photos utilisées pour l'analyse ne sont jamais stockées sur nos serveurs : elles transitent uniquement pour le traitement par l'IA et sont immédiatement supprimées. Les seules données conservées sont les résultats du rapport, ton prénom, ton email (si renseigné) et tes préférences d'analyse. Pour le détail, consulte notre Politique de confidentialité."
      },
      {
        title: "9. Service client et litiges",
        body: "Pour toute question, réclamation ou litige, contacte-nous à hello@ratemyskin.co. Nous nous engageons à répondre sous 48 h ouvrées. En cas de litige persistant, tu peux saisir le médiateur de la consommation dont les coordonnées sont disponibles sur economie.gouv.fr/mediation-conso."
      },
      {
        title: "10. Droit applicable",
        body: "Les présentes CGV sont soumises au droit français. Tout litige relatif à leur interprétation ou à leur exécution relève des tribunaux français, sous réserve de l'application des règles impératives de protection des consommateurs."
      },
    ],
    back: "Retour à l'accueil",
  },
  en: {
    metaTitle: "Terms of Sale · Rate My Skin",
    metaDesc: "Rate My Skin Terms of Sale: pricing, payment, withdrawal rights, 7-day money-back guarantee.",
    eyebrow: "Terms of sale",
    title: "Our ",
    titleEm: "commitments.",
    sub: "Full transparency on what you pay, how you pay, and what happens if you change your mind.",
    lastUpdate: "Last updated: January 1, 2026",
    sections: [
      {
        title: "1. Purpose",
        body: "These Terms of Sale govern the use of paid services offered by RateMySkin SAS on ratemyskin.co. By purchasing, you fully accept these terms."
      },
      {
        title: "2. Seller identity",
        body: "The service is operated by RateMySkin SAS, a company registered in France. Full details on the Legal Notice page. Contact: hello@ratemyskin.co."
      },
      {
        title: "3. Services offered",
        body: "Rate My Skin offers two tiers:",
        list: [
          "Free diagnosis: overall score out of 100, 3 visible metrics, simplified face map. No signup, no payment.",
          "Full report (€7.99): 8 detailed metrics, complete mapping, 3 priorities with causes, personalized AM & PM routine, 8-week progression plan, downloadable PDF."
        ]
      },
      {
        title: "4. Pricing and payment",
        body: "The full report is billed €7.99 inc. VAT as a one-time payment, no subscription. Payment is secured via Stripe. No banking data is stored on our servers. Prices may change at any time; the applicable price is the one shown at checkout."
      },
      {
        title: "5. Withdrawal right and guarantee",
        body: "In accordance with Article L.221-28 of the French Consumer Code, by purchasing digital content with immediate execution, you expressly waive your 14-day legal withdrawal right. However, Rate My Skin offers a 7-day satisfaction-or-refund commercial guarantee: if you are not satisfied, email hello@ratemyskin.co within 7 days of purchase to get a full refund, no justification required."
      },
      {
        title: "6. Liability limitation",
        body: "Rate My Skin is a skincare guidance tool based on visual analysis of a photograph. It does not constitute a medical diagnosis, dermatology consultation, or prescription. For any persistent, painful, evolving or unusual skin condition (severe rosacea, persistent eczema, cystic acne, suspected melanoma), you must consult a dermatologist. RateMySkin SAS cannot be held liable for consequences of using the recommendations without prior medical advice when warranted."
      },
      {
        title: "7. Intellectual property",
        body: "All site content (text, visuals, code, generated reports, branding) is protected by copyright and intellectual property laws. The personal report remains usable by the buyer for personal use; any resale or commercial distribution is prohibited."
      },
      {
        title: "8. Personal data",
        body: "Photos used for analysis are never stored on our servers: they are only processed by the AI and immediately deleted. The only data retained are report results, your first name, your email (if provided), and your analysis preferences. See our Privacy Policy for details."
      },
      {
        title: "9. Customer service and disputes",
        body: "For any question, complaint or dispute, contact hello@ratemyskin.co. We commit to replying within 48 business hours. If a dispute persists, you may refer to the consumer mediator listed at economie.gouv.fr/mediation-conso."
      },
      {
        title: "10. Applicable law",
        body: "These Terms are governed by French law. Any dispute relating to their interpretation or execution falls under the jurisdiction of French courts, subject to mandatory consumer protection rules."
      },
    ],
    back: "Back to home",
  }
};

export default function CGV() {
  const router = useRouter();
  const { lang } = useLang();
  const t = COPY[lang === 'fr' ? 'fr' : 'en'];

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="canonical" href="https://ratemyskin.co/cgv" />
      </Head>

      <NavBar />

      <style jsx global>{`
        .cgv-root {
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,181,116,0.08) 0%, transparent 60%),
            linear-gradient(180deg, #FBF6EE 0%, #F8F1E5 50%, #F5EBDB 100%);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #2C2416;
          padding-bottom: 80px;
        }
        .cgv-wrap { max-width: 760px; margin: 0 auto; padding: 0 28px; }
        .cgv-hero {
          padding: clamp(56px, 9vw, 100px) 0 clamp(40px, 6vw, 64px);
          text-align: center;
        }
        .cgv-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #C9A961;
          margin-bottom: 16px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .cgv-eyebrow::before, .cgv-eyebrow::after {
          content: "";
          width: 28px; height: 1px;
          background: linear-gradient(90deg, transparent, #C9A961, transparent);
        }
        .cgv-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 400;
          color: #2C2416;
          line-height: 1.05;
          letter-spacing: -0.015em;
          margin: 0 0 16px;
        }
        .cgv-title em { font-style: italic; color: #B0885E; }
        .cgv-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 17px;
          color: #5C4A3A;
          line-height: 1.55;
          max-width: 560px;
          margin: 0 auto 12px;
        }
        .cgv-meta {
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #B0885E;
          font-weight: 600;
        }
        .cgv-body {
          background: linear-gradient(135deg, #FFFFFF 0%, #FDFAF4 100%);
          border: 1px solid rgba(201,169,97,0.22);
          border-radius: 22px;
          padding: clamp(28px, 4vw, 48px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 18px 48px rgba(168,116,73,0.06);
        }
        .cgv-section { margin-bottom: 32px; }
        .cgv-section:last-child { margin-bottom: 0; }
        .cgv-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 2.5vw, 26px);
          font-weight: 500;
          color: #2C2416;
          margin: 0 0 12px;
          letter-spacing: -0.005em;
        }
        .cgv-section p, .cgv-section li {
          font-size: 14px;
          color: #5C4A3A;
          line-height: 1.7;
        }
        .cgv-section p { margin: 0 0 10px; }
        .cgv-section ul {
          margin: 10px 0 0;
          padding-left: 22px;
        }
        .cgv-section li { margin-bottom: 8px; }
        .cgv-section li::marker { color: #C9A961; }

        .cgv-back {
          margin-top: 36px;
          text-align: center;
        }
        .cgv-back button {
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(201,169,97,0.32);
          border-radius: 100px;
          padding: 12px 24px;
          font-family: 'DM Sans';
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #2C2416;
          cursor: pointer;
          transition: all 0.25s;
        }
        .cgv-back button:hover {
          background: rgba(201,169,97,0.12);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="cgv-root">
        <div className="cgv-wrap">
          <div className="cgv-hero">
            <div style={{ color: '#C9A961', fontSize: 14, opacity: 0.7, marginBottom: 14 }}>✦</div>
            <div className="cgv-eyebrow">{t.eyebrow}</div>
            <h1 className="cgv-title">{t.title}<em>{t.titleEm}</em></h1>
            <p className="cgv-sub">{t.sub}</p>
            <div className="cgv-meta">{t.lastUpdate}</div>
          </div>

          <div className="cgv-body">
            {t.sections.map((sec, i) => (
              <div key={i} className="cgv-section">
                <h2>{sec.title}</h2>
                <p>{sec.body}</p>
                {sec.list && (
                  <ul>
                    {sec.list.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="cgv-back">
            <button onClick={() => router.push('/')}>← {t.back}</button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
