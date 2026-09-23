// =============================================================================
// POST /api/track — first-party analytics ingestion (web + app)
// =============================================================================
// • Public, unauthenticated (logged-out visitors + the mobile app both post here).
// • Accepts a BATCH of events per request to stay light (heartbeats are cheap).
// • Country is derived SERVER-SIDE from the request IP (Vercel geo header) and
//   the IP itself is never stored. No GPS, no location permission.
// • Writes via the service role (bypasses RLS). Never throws to the client —
//   analytics must never break a page or the app.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_EVENTS = 50;
const MAX_STR = 512;
// A single engaged-time report can never claim more than this (clients report
// every ~45s, so anything larger is a bug or tampering).
const MAX_ENGAGED_MS = 120_000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

function clip(v: unknown, max = MAX_STR): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

// Strip query string + fragment; cap length. Keeps paths as clean buckets and
// guarantees no PII that might ride in a query string is ever stored.
function cleanPath(v: unknown): string | null {
  const s = clip(v, MAX_STR);
  if (!s) return null;
  return s.split('?')[0].split('#')[0].slice(0, MAX_STR);
}

// ── Time-in-app: sections ────────────────────────────────────────────────────
// Folds a route into a stable section key so web and app land in the same
// bucket (app "/social/feed" and web "/feed" → "feed"). Only a known set of
// parent routes keep their second segment; everything else keeps the first
// segment only, so usernames / ids in dynamic routes never become sections.

const LOCALES = new Set([
  'ar', 'da', 'de', 'en', 'es', 'fi', 'fr', 'hi', 'it', 'ja',
  'ko', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'th', 'tr', 'zh',
]);
const NESTED = new Set(['readings', 'chart', 'settings', 'dating', 'library', 'admin']);
const HOME = new Set(['home', 'index', 'dashboard', '(tabs)']);
const STATIC_SEG = /^[a-z][a-z-]{0,40}$/;

function sectionFor(path: string | null): string {
  if (!path) return 'other';
  const segs = path.toLowerCase().split('/').filter(Boolean);
  if (segs.length > 1 && LOCALES.has(segs[0])) segs.shift();
  if (segs[0] === '(tabs)') segs.shift();
  if (segs[0] === 'social') segs.shift();
  if (!segs.length) return 'home';
  const first = segs[0];
  if (HOME.has(first)) return 'home';
  if (!STATIC_SEG.test(first)) return 'other';
  if (first.endsWith('-in')) return 'placement-pages';
  if (NESTED.has(first) && segs[1] && STATIC_SEG.test(segs[1])) return `${first}/${segs[1]}`;
  return first;
}

// ── Time-in-app: verified identity ───────────────────────────────────────────
// Time is only ever credited to a member whose login we have verified, so no
// one can post time for someone else. The app sends its access token as a
// Bearer header; the web sends its normal Supabase auth cookie. Verified tokens
// are cached briefly so a heartbeat every 45s doesn't hit the auth server each
// time.

const verifiedTokens = new Map<string, { uid: string; until: number }>();
const TOKEN_CACHE_MS = 5 * 60 * 1000;

async function accessTokenFrom(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization');
  if (auth?.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim() || null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return req.cookies.get(name)?.value; },
          set() {},
          remove() {},
        },
      },
    );
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function verifiedUserId(
  req: NextRequest,
  db: ReturnType<typeof admin>,
): Promise<string | null> {
  const token = await accessTokenFrom(req);
  if (!token) return null;
  const now = Date.now();
  const hit = verifiedTokens.get(token);
  if (hit && hit.until > now) return hit.uid;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  if (verifiedTokens.size > 5000) verifiedTokens.clear();
  verifiedTokens.set(token, { uid: data.user.id, until: now + TOKEN_CACHE_MS });
  return data.user.id;
}

function countryFromReq(req: NextRequest): string | null {
  // Vercel populates these on every request (IP-based). We read the country and
  // discard the IP. Header casing per Vercel: x-vercel-ip-country = 'US', etc.
  const c =
    req.headers.get('x-vercel-ip-country') ||
    (req as any).geo?.country ||
    null;
  if (!c) return null;
  const up = c.toUpperCase();
  return /^[A-Z]{2}$/.test(up) ? up : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new NextResponse(null, { status: 204 });
    }

    const rawEvents = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : [];
    if (rawEvents.length === 0) return new NextResponse(null, { status: 204 });

    const sessionId = clip(body.session_id, 128);
    const anonId = clip(body.anon_id, 128);
    const platformIn = clip(body.platform, 16);
    const platform =
      platformIn === 'web' || platformIn === 'ios' || platformIn === 'android'
        ? platformIn
        : 'web';
    const appVersion = clip(body.app_version, 32);
    const locale = clip(body.locale, 32);
    const referrer = cleanPath(body.referrer);
    const utmSource = clip(body.utm_source, 128);
    const utmMedium = clip(body.utm_medium, 128);
    const utmCampaign = clip(body.utm_campaign, 128);

    // user_id must be a real UUID or NULL (the FK + logged-out visitors).
    const userIdIn = clip(body.user_id, 64);
    const userId = userIdIn && UUID_RE.test(userIdIn) ? userIdIn : null;

    const country = countryFromReq(req);
    const nowMs = Date.now();

    const rows = rawEvents
      .map((e: any) => {
        const name = clip(e?.event_name ?? e?.name, 64);
        if (!name) return null;
        // Accept a client timestamp (buffered/offline events may be older) but
        // never trust the future or the distant past.
        let created = clip(e?.occurred_at ?? e?.created_at, 40);
        const t = created ? Date.parse(created) : NaN;
        if (isNaN(t) || t > nowMs + 60_000 || t < nowMs - 7 * 864e5) {
          created = new Date(nowMs).toISOString();
        }
        const props =
          e?.event_data && typeof e.event_data === 'object'
            ? e.event_data
            : e?.props && typeof e.props === 'object'
            ? e.props
            : {};
        return {
          event_name: name,
          event_data: props,
          user_id: userId,
          created_at: created,
          session_id: sessionId,
          anon_id: anonId,
          platform,
          app_version: appVersion,
          path: cleanPath(e?.path),
          country,
          locale,
          referrer,
        };
      })
      .filter(Boolean);

    if (rows.length === 0) return new NextResponse(null, { status: 204 });

    const db = admin();

    // Engaged time → per-member daily ledger (verified members only).
    const timeBuckets = new Map<string, { day: string; section: string; ms: number }>();
    for (const r of rows as { path: string | null; created_at: string; event_data: any }[]) {
      const raw = Number(r.event_data?.engaged_ms);
      if (!Number.isFinite(raw) || raw <= 0) continue;
      const ms = Math.min(Math.round(raw), MAX_ENGAGED_MS);
      const day = r.created_at.slice(0, 10);
      const section = sectionFor(r.path);
      const key = `${day}|${section}`;
      const b = timeBuckets.get(key);
      if (b) b.ms += ms;
      else timeBuckets.set(key, { day, section, ms });
    }
    const timeUserId = timeBuckets.size ? await verifiedUserId(req, db).catch(() => null) : null;

    // Insert events + touch the session. Fire all; don't fail the request if
    // one has a hiccup — we already validated everything.
    await Promise.allSettled([
      timeUserId
        ? db.rpc('analytics_add_time', {
            p_user_id: timeUserId,
            p_platform: platform,
            p_rows: Array.from(timeBuckets.values()),
          })
        : Promise.resolve(),
      db.from('analytics_events').insert(rows),
      sessionId
        ? db.rpc('analytics_touch_session', {
            p_session_id: sessionId,
            p_user_id: userId,
            p_anon_id: anonId,
            p_platform: platform,
            p_app_version: appVersion,
            p_country: country,
            p_locale: locale,
            p_referrer: referrer,
            p_utm_source: utmSource,
            p_utm_medium: utmMedium,
            p_utm_campaign: utmCampaign,
            p_n: rows.length,
          })
        : Promise.resolve(),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch {
    // Analytics must never surface an error to the caller.
    return new NextResponse(null, { status: 204 });
  }
}
