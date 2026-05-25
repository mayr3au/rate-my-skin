import Link from 'next/link';
import { useLang } from '../lib/LangContext';

const TEXT = {
  fr: {
    short: "Cette analyse est fournie uniquement à titre informatif et ne remplace pas un avis médical professionnel. Pour tout problème de peau persistant, douloureux ou inhabituel, consultez un dermatologue.",
    readMore: "Lire plus",
  },
  en: {
    short: "This analysis is for informational purposes only and does not replace professional medical advice. For any persistent, painful, or unusual skin condition, please consult a dermatologist.",
    readMore: "Read more",
  },
};

export default function MedicalDisclaimer({ style }) {
  const { lang } = useLang();
  const text = TEXT[lang] || TEXT.fr;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 7,
      padding: '10px 14px',
      background: 'rgba(168, 116, 73, 0.04)',
      border: '1px solid rgba(168, 116, 73, 0.12)',
      borderRadius: 10,
      ...style,
    }}>
      <span style={{ fontSize: 13, color: '#A87449', flexShrink: 0, lineHeight: 1.6, marginTop: 1 }}>ℹ</span>
      <p style={{
        margin: 0,
        fontSize: 11,
        color: '#8C7A6B',
        lineHeight: 1.65,
        fontFamily: "'DM Sans', sans-serif",
        fontStyle: 'italic',
      }}>
        {text.short}{' '}
        <Link href="/mentions-legales" style={{ color: '#A87449', textDecoration: 'underline', whiteSpace: 'nowrap', fontStyle: 'normal' }}>
          {text.readMore}
        </Link>
      </p>
    </div>
  );
}
