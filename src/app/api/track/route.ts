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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_EVENTS = 50;
const MAX_STR = 512;

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

    // Insert events + touch the session. Fire both; don't fail the request if
    // one has a hiccup — we already validated everything.
    await Promise.allSettled([
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
