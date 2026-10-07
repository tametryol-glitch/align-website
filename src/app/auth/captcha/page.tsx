'use client';

// Chromeless Turnstile page for the mobile app's WebView. Holds no data or
// secrets: it only runs the bot check and hands the token back via postMessage.
//   → {type:'disabled'}          no site key configured; app proceeds without a token
//   → {type:'token', token}      check passed
//   → {type:'error'}             check failed / script blocked
//   ← {type:'reset'}             app asks for a fresh token (tokens are single-use)

import { useEffect, useState } from 'react';
import { TurnstileWidget, TURNSTILE_SITE_KEY } from '@/components/auth/TurnstileWidget';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

function post(payload: Record<string, unknown>) {
  try {
    window.ReactNativeWebView?.postMessage(JSON.stringify(payload));
  } catch { /* not inside the app */ }
}

export default function CaptchaPage() {
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) post({ type: 'disabled' });
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.type === 'reset') setResetKey((n) => n + 1);
      } catch { /* ignore */ }
    };
    window.addEventListener('message', onMessage);
    document.addEventListener('message', onMessage as EventListener); // Android WebView
    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('message', onMessage as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <TurnstileWidget
        resetKey={resetKey}
        onToken={(token) => post(token ? { type: 'token', token } : { type: 'error' })}
      />
    </div>
  );
}
