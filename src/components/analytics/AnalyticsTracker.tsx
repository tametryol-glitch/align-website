'use client';

// Mounts once in the root layout. Fires first-party page_view + heartbeat
// events to /api/track (our own analytics — separate from Google Analytics).

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  trackPageView,
  setAnalyticsUser,
  track,
  flushAnalytics,
} from '@/lib/firstPartyAnalytics';

const HEARTBEAT_MS = 45 * 1000;

export function AnalyticsTracker() {
  const pathname = usePathname();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const startedRef = useRef(false);

  // Keep the current user id in sync for attribution.
  useEffect(() => {
    setAnalyticsUser(userId);
  }, [userId]);

  // Page view on every route change (and the first load).
  useEffect(() => {
    if (!pathname) return;
    trackPageView(pathname);
  }, [pathname]);

  // Heartbeat while the tab is visible + flush on hide/unload.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    track('session_start');

    const beat = setInterval(() => {
      if (document.visibilityState === 'visible') track('session_heartbeat');
    }, HEARTBEAT_MS);

    const onHide = () => {
      if (document.visibilityState === 'hidden') flushAnalytics(true);
    };
    const onPageHide = () => flushAnalytics(true);

    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      clearInterval(beat);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  return null;
}
