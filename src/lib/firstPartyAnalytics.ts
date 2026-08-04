// =============================================================================
// First-party web analytics client — batches events to /api/track.
// =============================================================================
// Separate from lib/analytics.ts (that file wraps Google Analytics / gtag).
// This one feeds our OWN in-panel dashboard and works alongside GA.
//
// Privacy posture:
//   • Country is derived server-side from IP and the IP is discarded — the
//     client never sends location.
//   • A PERSISTENT cross-session id (anon_id) is only used when the visitor has
//     accepted cookies AND Do-Not-Track is off. Otherwise we fall back to an
//     ephemeral per-session id, so we still get aggregate traffic / geo /
//     language without a durable identifier.
//   • Query strings are stripped from paths before sending.
// Never throws — analytics must never break a page.
// =============================================================================

const ENDPOINT = '/api/track';
const SESSION_IDLE_MS = 30 * 60 * 1000; // new session after 30 min idle
const FLUSH_DEBOUNCE_MS = 4000;
const MAX_QUEUE = 40;

const ANON_KEY = 'align_anon_id';
const EPHEMERAL_KEY = 'align_anon_ephemeral';
const SESSION_KEY = 'align_session_id';
const SESSION_TS_KEY = 'align_session_ts';

type QueuedEvent = {
  event_name: string;
  path?: string | null;
  event_data?: Record<string, unknown>;
  occurred_at: string;
};

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let currentUserId: string | null = null;
let referrerSent = false;

const isBrowser = () => typeof window !== 'undefined';

function dntEnabled(): boolean {
  if (!isBrowser()) return false;
  const dnt =
    (navigator as any).doNotTrack ||
    (window as any).doNotTrack ||
    (navigator as any).msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

function consentGiven(): boolean {
  try {
    return localStorage.getItem('cookie-consent') === 'accepted';
  } catch {
    return false;
  }
}

function randomId(): string {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

// Persistent when allowed, ephemeral otherwise.
function getAnonId(): string {
  try {
    if (consentGiven() && !dntEnabled()) {
      let id = localStorage.getItem(ANON_KEY);
      if (!id) {
        id = randomId();
        localStorage.setItem(ANON_KEY, id);
      }
      return id;
    }
  } catch {}
  // Ephemeral fallback (sessionStorage — cleared when the tab closes)
  try {
    let id = sessionStorage.getItem(EPHEMERAL_KEY);
    if (!id) {
      id = randomId();
      sessionStorage.setItem(EPHEMERAL_KEY, id);
    }
    return id;
  } catch {
    return randomId();
  }
}

function getSessionId(): string {
  try {
    const now = Date.now();
    const lastTs = parseInt(sessionStorage.getItem(SESSION_TS_KEY) || '0', 10);
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id || !lastTs || now - lastTs > SESSION_IDLE_MS) {
      id = randomId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    sessionStorage.setItem(SESSION_TS_KEY, String(now));
    return id;
  } catch {
    return randomId();
  }
}

function getLocale(): string {
  try {
    return (
      localStorage.getItem('i18nextLng') ||
      document.documentElement.lang ||
      navigator.language ||
      'en'
    );
  } catch {
    return 'en';
  }
}

function buildPayload() {
  const referrer =
    !referrerSent && document.referrer && !document.referrer.includes(location.host)
      ? document.referrer
      : undefined;
  referrerSent = true;
  return {
    session_id: getSessionId(),
    anon_id: getAnonId(),
    platform: 'web',
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
    locale: getLocale(),
    referrer,
    user_id: currentUserId || undefined,
    events: queue,
  };
}

function send(useBeacon: boolean) {
  if (!isBrowser() || queue.length === 0) return;
  const payload = buildPayload();
  queue = [];
  try {
    const bodyStr = JSON.stringify(payload);
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([bodyStr], { type: 'application/json' }));
      return;
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // swallow
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    send(false);
  }, FLUSH_DEBOUNCE_MS);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function setAnalyticsUser(userId: string | null) {
  currentUserId = userId;
}

export function track(
  event_name: string,
  opts: { path?: string | null; feature?: string; props?: Record<string, unknown> } = {},
) {
  if (!isBrowser()) return;
  const event_data: Record<string, unknown> = { ...(opts.props || {}) };
  if (opts.feature) event_data.feature = opts.feature;
  queue.push({
    event_name,
    path: opts.path ?? location.pathname,
    event_data,
    occurred_at: new Date().toISOString(),
  });
  if (queue.length >= MAX_QUEUE) send(false);
  else scheduleFlush();
}

export function trackPageView(path?: string) {
  track('page_view', { path: path ?? location.pathname });
}

export function trackFeature(feature: string, props?: Record<string, unknown>) {
  track('feature_opened', { feature, props });
}

export function flushAnalytics(useBeacon = false) {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  send(useBeacon);
}
