import '../styles/globals.css';
import { LangProvider } from '../lib/LangContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <LangProvider>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-DMB015RX5X"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-DMB015RX5X');
        `}
      </Script>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </LangProvider>
  );
}
