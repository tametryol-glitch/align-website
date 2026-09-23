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
const UTM_KEY = 'align_utm'; // first-touch UTM for this session

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

// First-touch UTM: read utm_* from the landing URL once, keep for the session.
function getUtm(): { source?: string; medium?: string; campaign?: string } {
  try {
    const stored = sessionStorage.getItem(UTM_KEY);
    if (stored) return JSON.parse(stored);
    const p = new URLSearchParams(location.search);
    const source = p.get('utm_source') || undefined;
    const medium = p.get('utm_medium') || undefined;
    const campaign = p.get('utm_campaign') || undefined;
    const utm = { source, medium, campaign };
    // Only persist if there's actually a source, so we don't pin "no campaign".
    if (source) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    return utm;
  } catch {
    return {};
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
  const utm = getUtm();
  return {
    session_id: getSessionId(),
    anon_id: getAnonId(),
    platform: 'web',
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
    locale: getLocale(),
    referrer,
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_campaign: utm.campaign,
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
  const next = path ?? location.pathname;
  // Close out the time spent on the page we're leaving before switching.
  reportEngagedTime();
  engagedPath = next;
  track('page_view', { path: next });
}

// ── Engaged time (time in app, to the second) ────────────────────────────────
// Counts milliseconds while the tab is visible AND the visitor is actually
// there: some input in the last IDLE_MS, or a video playing. A tab left open on
// a desk stops counting after IDLE_MS. The total rides on heartbeats and on a
// final engaged_time event when the page changes or the tab is hidden; the
// server credits it to the member's permanent daily ledger.

const IDLE_MS = 3 * 60 * 1000;
const CLOCK_TICK_MS = 1000;
const MAX_TICK_GAP_MS = 15_000; // a longer gap means the device slept — don't count it

let engagedMs = 0;
let engagedPath: string | null = null;
let lastTick = 0;
let lastInput = 0;
let wasEngaged = false;
let clockStarted = false;

function videoPlaying(): boolean {
  try {
    const vids = document.getElementsByTagName('video');
    for (let i = 0; i < vids.length; i++) {
      if (!vids[i].paused && !vids[i].ended) return true;
    }
  } catch {}
  return false;
}

function engagedNow(now: number): boolean {
  return (
    document.visibilityState === 'visible' &&
    (now - lastInput < IDLE_MS || videoPlaying())
  );
}

// Credit the interval since the last tick if we were engaged during it.
function accrue() {
  const now = Date.now();
  const gap = now - lastTick;
  if (wasEngaged && gap > 0 && gap <= MAX_TICK_GAP_MS) engagedMs += gap;
  lastTick = now;
  wasEngaged = engagedNow(now);
}

function onInput() {
  const now = Date.now();
  if (!wasEngaged) accrue(); // close the idle stretch uncounted
  lastInput = now;
  wasEngaged = document.visibilityState === 'visible';
}

/** Start the engaged-time clock. Idempotent. */
export function startEngagementClock() {
  if (!isBrowser() || clockStarted) return;
  clockStarted = true;
  const now = Date.now();
  lastTick = now;
  lastInput = now;
  engagedPath = engagedPath ?? location.pathname;
  wasEngaged = engagedNow(now);

  setInterval(accrue, CLOCK_TICK_MS);
  document.addEventListener('visibilitychange', accrue);
  const opts = { passive: true, capture: true } as AddEventListenerOptions;
  for (const type of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart']) {
    document.addEventListener(type, onInput, opts);
  }
}

/** Take the engaged milliseconds accumulated since the last report. */
export function takeEngagedMs(): number {
  if (!clockStarted) return 0;
  accrue();
  const ms = Math.round(engagedMs);
  engagedMs = 0;
  return ms;
}

/** Queue an engaged_time event for the current page if any time accrued. */
export function reportEngagedTime() {
  const ms = takeEngagedMs();
  if (ms <= 0) return;
  track('engaged_time', { path: engagedPath ?? location.pathname, props: { engaged_ms: ms } });
}

/** Heartbeat that also carries the engaged time since the last report. */
export function trackHeartbeat() {
  const ms = takeEngagedMs();
  track('session_heartbeat', {
    path: engagedPath ?? location.pathname,
    props: ms > 0 ? { engaged_ms: ms } : undefined,
  });
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

// ── Monetization ─────────────────────────────────────────────────────────────
// Mirrors the mobile paywall vocabulary so analytics_paywall_funnel() sees one
// funnel across both platforms rather than two half-funnels.

export function trackPaywallShown(feature: string, requiredTier?: string) {
  track('paywall_shown', { props: { feature, required_tier: requiredTier } });
}

export function trackCheckoutStarted(productId: string, feature?: string) {
  track('checkout_started', { props: { product_id: productId, feature } });
}

export function trackPurchaseCompleted(productId: string, feature?: string) {
  track('purchase_completed', { props: { product_id: productId, feature } });
}

export function trackPurchaseFailed(productId: string, reason: string) {
  track('purchase_failed', { props: { product_id: productId, reason } });
}

// ── Sharing & virality ───────────────────────────────────────────────────────

export function trackShared(kind: string, destination?: string) {
  track('content_shared', { props: { kind, destination } });
}

export function trackInviteSent(channel: string) {
  track('invite_sent', { props: { channel } });
}

// ── Search & empty states ────────────────────────────────────────────────────

export function trackSearch(surface: string, term: string, resultCount: number) {
  track('search_performed', {
    props: {
      surface,
      term: term.slice(0, 80),
      result_count: resultCount,
      zero_results: resultCount === 0,
    },
  });
}

export function trackEmptyState(surface: string, reason?: string) {
  track('empty_state', { props: { surface, reason } });
}

// ── Reliability ──────────────────────────────────────────────────────────────

export function trackClientError(message: string, context?: Record<string, unknown>) {
  track('client_error', {
    props: { message: String(message).slice(0, 300), ...(context || {}) },
  });
}

export function trackApiError(endpoint: string, status: number, message?: string) {
  track('api_error', {
    props: {
      endpoint,
      status,
      message: message ? String(message).slice(0, 300) : undefined,
    },
  });
}

// ── Web vitals ───────────────────────────────────────────────────────────────
// Emitted as perf_timing so they land in the same p50/p95/p99 rollup as the
// mobile traces (analytics_tech_health reads event_data.name + .ms).

export function trackWebVital(name: string, ms: number) {
  track('perf_timing', { props: { name, ms: Math.round(ms) } });
}

// ── Frustration signals ──────────────────────────────────────────────────────

export function trackRageClick(selector: string, count: number) {
  track('rage_click', { props: { selector: selector.slice(0, 120), count } });
}

export function trackScrollDepth(path: string, pct: number) {
  track('scroll_depth', { path, props: { pct } });
}
