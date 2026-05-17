'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      setConsentGiven(localStorage.getItem('cookie-consent') === 'accepted');
    };

    checkConsent();

    // Listen for consent changes from the CookieConsent banner
    window.addEventListener('cookie-consent-change', checkConsent);
    return () => window.removeEventListener('cookie-consent-change', checkConsent);
  }, []);

  if (!GA_ID || !consentGiven) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
