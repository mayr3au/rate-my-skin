import { useRouter } from "next/router";
import { useLang } from "../lib/LangContext";

/* ════════════════════════════════════════════════════════════════════════
   Footer — partagé sur toutes les pages
   ════════════════════════════════════════════════════════════════════════ */

export default function Footer() {
  const router = useRouter();
  const { lang } = useLang();
  const fr = lang === "fr";
  const year = new Date().getFullYear();

  return (
    <>
      <style jsx global>{`
        .ftr {
          background:
            radial-gradient(ellipse at top, rgba(201,169,97,0.05), transparent 60%),
            linear-gradient(180deg, #F5EBDB 0%, #EFE4D0 100%);
          border-top: 1px solid rgba(201,169,97,0.22);
          padding: 64px 0 32px;
          font-family: 'DM Sans', sans-serif;
          color: #5C4A3A;
          position: relative;
        }
        .ftr::before {
          content: "";
          position: absolute;
          top: -1px; left: 50%;
          transform: translateX(-50%);
          width: 80px; height: 2px;
          background: linear-gradient(90deg, transparent, #C9A961, transparent);
        }
        .ftr-wrap {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 28px;
        }
        .ftr-top {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 48px;
        }
        @media (max-width: 880px) {
          .ftr-top { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 560px) {
          .ftr-top { grid-template-columns: 1fr; gap: 28px; }
        }
        .ftr-brand-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 500;
          color: #2C2416;
          margin-bottom: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }
        .ftr-brand-logo em { font-style: italic; font-weight: 400; }
        .ftr-brand-logo .star { color: #C9A961; font-size: 14px; }
        .ftr-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 15px;
          line-height: 1.55;
          color: #5C4A3A;
          margin: 0 0 16px;
          max-width: 320px;
        }
        .ftr-contact {
          font-size: 12px;
          color: #8A7A6B;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ftr-contact a {
          color: #8B6E26;
          text-decoration: none;
          transition: color 0.2s;
        }
        .ftr-contact a:hover { color: #2C2416; }

        .ftr-col-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #C9A961;
          margin-bottom: 16px;
        }
        .ftr-col-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ftr-col-links a, .ftr-col-links button {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #5C4A3A;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          cursor: pointer;
          transition: color 0.2s;
        }
        .ftr-col-links a:hover, .ftr-col-links button:hover { color: #C9A961; }

        .ftr-bottom {
          padding-top: 28px;
          border-top: 1px solid rgba(201,169,97,0.18);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }
        .ftr-copy {
          font-size: 11.5px;
          color: #8A7A6B;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
        }
        .ftr-meta-links {
          display: inline-flex;
          gap: 18px;
          flex-wrap: wrap;
        }
        .ftr-meta-links a {
          font-size: 11px;
          color: #8A7A6B;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .ftr-meta-links a:hover { color: #2C2416; }

        .ftr-disclaimer {
          margin-top: 18px;
          padding: 14px 18px;
          background: rgba(255,255,255,0.4);
          border: 1px solid rgba(201,169,97,0.18);
          border-radius: 12px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 11.5px;
          color: #8A7A6B;
          line-height: 1.55;
          text-align: center;
        }
      `}</style>

      <footer className="ftr">
        <div className="ftr-wrap">
          {/* Top: 4 colonnes */}
          <div className="ftr-top">

            {/* Brand */}
            <div>
              <button className="ftr-brand-logo" onClick={() => router.push('/')}>
                RateMy <span className="star">✦</span> <em>Skin</em>
              </button>
              <p className="ftr-tagline">
                {fr
                  ? "Le diagnostic dermatologique par IA. Une routine sur-mesure, fondée sur ta peau réelle."
                  : "Dermatology AI diagnosis. A tailored routine, grounded in your real skin."}
              </p>
              <div className="ftr-contact">
                <span>
                  {fr ? "Contact :" : "Contact:"} <a href="mailto:hello@ratemyskin.co">hello@ratemyskin.co</a>
                </span>
                <span>
                  {fr ? "Édité par RateMySkin SAS" : "Edited by RateMySkin SAS"}
                </span>
              </div>
            </div>

            {/* Découvrir */}
            <div>
              <div className="ftr-col-title">{fr ? "Découvrir" : "Discover"}</div>
              <div className="ftr-col-links">
                <a href="/#how">{fr ? "Comment ça marche" : "How it works"}</a>
                <a href="/#results">{fr ? "Résultats" : "Results"}</a>
                <a href="/#pricing">{fr ? "Prix" : "Pricing"}</a>
                <a href="/#faq">FAQ</a>
              </div>
            </div>

            {/* Ressources */}
            <div>
              <div className="ftr-col-title">{fr ? "Ressources" : "Resources"}</div>
              <div className="ftr-col-links">
                <a href="/technologie">{fr ? "Notre technologie" : "Our technology"}</a>
                <a href="/blog">Blog</a>
                <a href="/mes-rapports">{fr ? "Mes rapports" : "My reports"}</a>
                <a href="/">{fr ? "Lancer une analyse" : "Start analysis"}</a>
              </div>
            </div>

            {/* Légal */}
            <div>
              <div className="ftr-col-title">{fr ? "Légal" : "Legal"}</div>
              <div className="ftr-col-links">
                <a href="/mentions-legales">{fr ? "Mentions légales" : "Legal notice"}</a>
                <a href="/privacy">{fr ? "Confidentialité" : "Privacy"}</a>
                <a href="/cgv">{fr ? "CGV" : "Terms"}</a>
                <a href="/mentions-legales#disclaimer">{fr ? "Avertissement médical" : "Medical disclaimer"}</a>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="ftr-disclaimer">
            {fr
              ? "Cette analyse est fournie uniquement à titre informatif et ne remplace pas un avis médical professionnel. Pour toute condition cutanée persistante, douloureuse ou inhabituelle, consulte un dermatologue."
              : "This analysis is provided for informational purposes only and does not replace professional medical advice. For any persistent, painful, or unusual skin condition, consult a dermatologist."}
          </div>

          {/* Bottom: copy + meta links */}
          <div className="ftr-bottom">
            <span className="ftr-copy">
              © {year} RateMy Skin · {fr ? "Tous droits réservés" : "All rights reserved"}
            </span>
            <div className="ftr-meta-links">
              <a href="/mentions-legales">{fr ? "Mentions" : "Notice"}</a>
              <a href="/privacy">{fr ? "Confidentialité" : "Privacy"}</a>
              <a href="/cgv">CGV</a>
              <a href="mailto:hello@ratemyskin.co">{fr ? "Contact" : "Contact"}</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
