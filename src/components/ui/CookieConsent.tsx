'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  // Chromeless mobile-WebView embeds: the banner would cover the globe, and
  // consent is handled by the host app, not the token-free renderer.
  const suppressed =
    (pathname?.startsWith('/zodisphere/embed') || pathname?.startsWith('/zodisphere/globe3d/embed')) ?? false;

  useEffect(() => {
    if (suppressed) return;
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, [suppressed]);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
    // Dispatch a custom event so GoogleAnalytics can pick up the change
    window.dispatchEvent(new Event('cookie-consent-change'));
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="bg-surface-card/95 backdrop-blur border-t border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/80 text-center sm:text-left">
            {t('components.cookieConsent.message')}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
            >
              {t('components.cookieConsent.decline')}
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
            >
              {t('components.cookieConsent.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
