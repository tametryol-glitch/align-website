// ═══════════════════════════════════════════════════════════════════
// Presence (web) — mirror of align-app/src/services/presenceService.ts
//
// "Online" means the Align UI is actually on screen: the tab is visible and the person has done
// something in the last IDLE_MS. We ping every PING_INTERVAL_MS while that is true and send an
// offline ping the moment it stops being true (tab hidden, idle, closed). A crash or lost
// connection can't send that, so readers only trust "online" for FRESH_MS after the last ping.
//
// Schema: align-app/supabase-migration-presence.sql
// ═══════════════════════════════════════════════════════════════════

import { createClient } from './supabase';
import { PING_INTERVAL_MS, type PresenceInfo } from './presence';

const IDLE_MS = 3 * 60_000;

/** Start the heartbeat for the signed-in user. Returns a cleanup function. */
export function startWebPresence(): () => void {
  if (typeof document === 'undefined') return () => {};
  const supabase = createClient();
  let online = false;
  let lastActivity = Date.now();
  let token: string | null = null;

  supabase.auth.getSession().then(({ data }) => { token = data.session?.access_token ?? null; });
  const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
    token = session?.access_token ?? null;
  });

  const visible = () => document.visibilityState === 'visible';
  const active = () => visible() && Date.now() - lastActivity < IDLE_MS;

  async function ping(on: boolean) {
    try { await supabase.rpc('presence_ping', { p_online: on }); } catch { /* best effort */ }
  }

  function tick() {
    if (active()) {
      online = true;
      void ping(true);
    } else if (online) {
      online = false;
      void ping(false);
    }
  }

  // Page is being closed or navigated away: a normal request can be cancelled, a keepalive one is not.
  function leaveNow() {
    if (!online || !token) return;
    online = false;
    try {
      void fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/presence_ping`, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ p_online: false }),
      });
    } catch { /* best effort */ }
  }

  const onVisibility = () => {
    if (visible()) lastActivity = Date.now();
    tick();
  };
  const onActivity = () => {
    const wasIdle = Date.now() - lastActivity >= IDLE_MS;
    lastActivity = Date.now();
    if (wasIdle) tick();
  };

  const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
  events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', leaveNow);

  tick();
  const timer = setInterval(tick, PING_INTERVAL_MS);

  return () => {
    clearInterval(timer);
    events.forEach((e) => window.removeEventListener(e, onActivity));
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', leaveNow);
    authSub.subscription.unsubscribe();
    if (online) {
      online = false;
      void ping(false);
    }
  };
}

/** Presence for people you chat with or are friends with, privacy and freshness applied server-side. */
export async function fetchPresence(userIds: string[]): Promise<Record<string, PresenceInfo>> {
  const out: Record<string, PresenceInfo> = {};
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return out;
  try {
    const { data, error } = await createClient().rpc('get_presence', { p_user_ids: ids });
    if (error || !data) return out;
    for (const r of data as Array<{ user_id: string; is_online: boolean; last_seen: string | null; hidden: boolean }>) {
      out[r.user_id] = { isOnline: !!r.is_online, lastSeen: r.last_seen, hidden: !!r.hidden };
    }
  } catch { /* callers fall back to what they already have */ }
  return out;
}
