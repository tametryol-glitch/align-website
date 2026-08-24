'use client';

// Mounts once in the root layout. Fires first-party page_view + heartbeat
// events to /api/track (our own analytics — separate from Google Analytics).
//
// It also collects the signals that need no per-page wiring:
//   • Core Web Vitals (LCP / INP / CLS) → perf_timing
//   • Uncaught errors + unhandled promise rejections → client_error
//   • Rage clicks (3+ clicks on the same element inside 1s) → rage_click
//   • Scroll depth milestones (25/50/75/100%) → scroll_depth
//
// Everything here is best-effort and wrapped so analytics can never break a
// page. All of it respects the same consent/DNT posture as the rest of the
// tracker, because it goes through the same track() queue.

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  trackPageView,
  setAnalyticsUser,
  track,
  flushAnalytics,
  trackClientError,
  trackWebVital,
  trackRageClick,
  trackScrollDepth,
} from '@/lib/firstPartyAnalytics';

const HEARTBEAT_MS = 45 * 1000;
const RAGE_WINDOW_MS = 1000;
const RAGE_THRESHOLD = 3;
const SCROLL_MILESTONES = [25, 50, 75, 100];

/** Short, stable-ish description of an element for rage-click reporting. */
function describe(el: Element | null): string {
  if (!el) return 'unknown';
  const tag = el.tagName.toLowerCase();
  const id = (el as HTMLElement).id;
  if (id) return `${tag}#${id}`;
  const cls = (el.getAttribute('class') || '').trim().split(/\s+/).slice(0, 2).join('.');
  return cls ? `${tag}.${cls}` : tag;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const startedRef = useRef(false);
  const milestonesRef = useRef<Set<number>>(new Set());

  // Keep the current user id in sync for attribution.
  useEffect(() => {
    setAnalyticsUser(userId);
  }, [userId]);

  // Page view on every route change (and the first load).
  useEffect(() => {
    if (!pathname) return;
    trackPageView(pathname);
    milestonesRef.current = new Set();
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

  // ── Uncaught errors ────────────────────────────────────────────────────────
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      try {
        trackClientError(e.message || 'error', {
          source: e.filename ? String(e.filename).slice(-120) : undefined,
          line: e.lineno,
        });
      } catch {
        /* never throw from the error handler */
      }
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      try {
        const reason = e.reason;
        const msg =
          typeof reason === 'string'
            ? reason
            : reason?.message || 'unhandled rejection';
        trackClientError(msg, { kind: 'unhandled_rejection' });
      } catch {
        /* swallow */
      }
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  // ── Core Web Vitals ────────────────────────────────────────────────────────
  // Uses PerformanceObserver directly rather than pulling in a library, so this
  // adds no bundle weight. Unsupported browsers simply report nothing.
  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;
    const observers: PerformanceObserver[] = [];

    const observe = (type: string, cb: (entries: PerformanceEntryList) => void) => {
      try {
        const po = new PerformanceObserver((list) => cb(list.getEntries()));
        po.observe({ type, buffered: true } as PerformanceObserverInit);
        observers.push(po);
      } catch {
        /* unsupported entry type */
      }
    };

    // LCP — report the last candidate when the page is hidden.
    let lcp = 0;
    observe('largest-contentful-paint', (entries) => {
      const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      if (last) lcp = last.startTime;
    });

    // CLS — cumulative, excluding shifts that follow recent user input.
    let cls = 0;
    observe('layout-shift', (entries) => {
      for (const e of entries as unknown as Array<{ value: number; hadRecentInput: boolean }>) {
        if (!e.hadRecentInput) cls += e.value;
      }
    });

    // INP approximation — worst event duration seen.
    let inp = 0;
    observe('event', (entries) => {
      for (const e of entries as unknown as Array<{ duration: number }>) {
        if (e.duration > inp) inp = e.duration;
      }
    });

    const report = () => {
      try {
        if (lcp > 0) trackWebVital('web_vital_lcp', lcp);
        if (inp > 0) trackWebVital('web_vital_inp', inp);
        // CLS is unitless; ×1000 keeps it an integer in the same ms column.
        if (cls > 0) trackWebVital('web_vital_cls', cls * 1000);
        lcp = 0;
        inp = 0;
        cls = 0;
      } catch {
        /* swallow */
      }
    };

    const onHide = () => {
      if (document.visibilityState === 'hidden') report();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', report);

    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', report);
      observers.forEach((o) => {
        try {
          o.disconnect();
        } catch {
          /* already gone */
        }
      });
    };
  }, []);

  // ── Rage clicks ────────────────────────────────────────────────────────────
  useEffect(() => {
    let lastTarget: Element | null = null;
    let count = 0;
    let firstAt = 0;
    let reported = false;

    const onClick = (e: MouseEvent) => {
      try {
        const target = e.target as Element | null;
        const now = Date.now();
        if (target !== lastTarget || now - firstAt > RAGE_WINDOW_MS) {
          lastTarget = target;
          firstAt = now;
          count = 1;
          reported = false;
          return;
        }
        count += 1;
        if (count >= RAGE_THRESHOLD && !reported) {
          reported = true;
          trackRageClick(describe(target), count);
        }
      } catch {
        /* swallow */
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // ── Scroll depth ───────────────────────────────────────────────────────────
  useEffect(() => {
    let ticking = false;

    const measure = () => {
      ticking = false;
      try {
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - window.innerHeight;
        if (scrollable <= 0) return;
        const pct = Math.min(100, Math.round(((window.scrollY || 0) / scrollable) * 100));
        for (const m of SCROLL_MILESTONES) {
          if (pct >= m && !milestonesRef.current.has(m)) {
            milestonesRef.current.add(m);
            trackScrollDepth(pathname || '/', m);
          }
        }
      } catch {
        /* swallow */
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}
