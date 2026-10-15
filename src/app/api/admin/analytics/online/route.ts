// =============================================================================
// GET /api/admin/analytics/online — which accounts make up "Online right now".
// =============================================================================
// Same definition as the live banner (analytics_sessions.last_seen_at in the
// last 5 minutes). Signed-in members are listed by account; signed-out visitors
// are only counted. Admin-only: web cookie or app Bearer token (lib/adminAuth).
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient as getAdminClient, verifyAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 5 * 60 * 1000;

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const db = getAdminClient();
    const since = new Date(Date.now() - WINDOW_MS).toISOString();

    const { data: sessions, error } = await db
      .from('analytics_sessions')
      .select('user_id, anon_id, platform, app_version, country, started_at, last_seen_at')
      .gt('last_seen_at', since)
      .order('last_seen_at', { ascending: false })
      .limit(2000);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // One row per account: latest session wins, platforms are merged.
    const byUser = new Map<string, {
      user_id: string; platforms: Set<string>; last_seen_at: string; started_at: string;
      country: string | null; app_version: string | null;
    }>();
    const anon = new Set<string>();
    for (const s of sessions || []) {
      if (!s.user_id) { if (s.anon_id) anon.add(s.anon_id); continue; }
      const cur = byUser.get(s.user_id);
      if (!cur) {
        byUser.set(s.user_id, {
          user_id: s.user_id,
          platforms: new Set(s.platform ? [s.platform] : []),
          last_seen_at: s.last_seen_at,
          started_at: s.started_at,
          country: s.country,
          app_version: s.app_version,
        });
      } else {
        if (s.platform) cur.platforms.add(s.platform);
        if (s.started_at < cur.started_at) cur.started_at = s.started_at;
      }
    }

    const ids = Array.from(byUser.keys());
    const profiles = new Map<string, {
      id: string; username: string | null; display_name: string | null; avatar_url: string | null;
      subscription_tier: string | null; is_subscribed: boolean | null; is_service_account: boolean | null;
    }>();
    for (let i = 0; i < ids.length; i += 200) {
      const { data } = await db
        .from('profiles')
        .select('id, username, display_name, avatar_url, subscription_tier, is_subscribed, is_service_account')
        .in('id', ids.slice(i, i + 200));
      for (const p of data || []) profiles.set(p.id, p);
    }

    const members = Array.from(byUser.values())
      .filter((u) => !profiles.get(u.user_id)?.is_service_account)
      .map((u) => {
        const p = profiles.get(u.user_id);
        return {
          id: u.user_id,
          username: p?.username ?? null,
          display_name: p?.display_name ?? null,
          avatar_url: p?.avatar_url ?? null,
          tier: p?.subscription_tier ?? (p?.is_subscribed ? 'paid' : 'free'),
          platforms: Array.from(u.platforms),
          country: u.country,
          app_version: u.app_version,
          started_at: u.started_at,
          last_seen_at: u.last_seen_at,
        };
      })
      .sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at));

    return NextResponse.json({
      members,
      anonymous: anon.size,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
