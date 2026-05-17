'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

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
            We use cookies to improve your experience. By continuing, you agree to our use of cookies.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
