import '../styles/globals.css';
import { LangProvider } from '../lib/LangContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App({ Component, pageProps }) {
  return (
    <LangProvider>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </LangProvider>
  );
}
