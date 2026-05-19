import '../styles/globals.css';
import { LangProvider } from '../lib/LangContext';
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <LangProvider>
      <Component {...pageProps} />
      <Analytics />
    </LangProvider>
  );
}
