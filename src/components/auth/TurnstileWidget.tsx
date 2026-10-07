'use client';

// Cloudflare Turnstile — invisible-unless-suspicious bot check for sign-up/login.
// Renders nothing (and reports "not required") until NEXT_PUBLIC_TURNSTILE_SITE_KEY
// is set, so the forms keep working before the keys exist.
//
// Tokens are single-use: bump `resetKey` after every failed attempt to get a new one.

import { useEffect, useRef } from 'react';

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    __turnstileLoading?: Promise<void>;
  }
}

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileLoading) return window.__turnstileLoading;
  window.__turnstileLoading = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { window.__turnstileLoading = undefined; reject(new Error('turnstile script failed')); };
    document.head.appendChild(s);
  });
  return window.__turnstileLoading;
}

interface Props {
  onToken: (token: string | null) => void;
  /** Change this value to force a fresh challenge (tokens can be used once). */
  resetKey?: number;
  className?: string;
}

export function TurnstileWidget({ onToken, resetKey = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ref.current) return;
    let cancelled = false;
    onTokenRef.current(null);
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'dark',
          // Invisible for most people; only shows a checkbox when Cloudflare is unsure.
          appearance: 'interaction-only',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* ignore */ }
      }
      widgetId.current = null;
    };
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className={className} />;
}
