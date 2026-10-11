// Presence helpers shared by the app and the web (keep align-app/src/utils/presence.ts and
// align-web/src/lib/presence.ts identical).
//
// Clients ping every PING_INTERVAL_MS while the UI is on screen and send an offline ping when it
// is left. A crash or lost connection can't send that, so "online" is only trusted while the last
// heartbeat is younger than FRESH_MS. The server applies the same rule (see
// supabase-migration-presence.sql).

export const PING_INTERVAL_MS = 45_000;
export const FRESH_MS = 120_000;

export function isFreshOnline(
  isOnline: boolean | null | undefined,
  lastSeen: string | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!isOnline || !lastSeen) return false;
  const t = new Date(lastSeen).getTime();
  if (Number.isNaN(t)) return false;
  return now - t < FRESH_MS;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function clock(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Real, local-time "last seen" wording. Empty string when there is no timestamp. */
export function formatLastSeen(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60_000) return 'Last seen just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `Last seen ${mins} min ago`;
  const dayDiff = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (dayDiff <= 0) return `Last seen today at ${clock(d)}`;
  if (dayDiff === 1) return `Last seen yesterday at ${clock(d)}`;
  if (dayDiff < 7) {
    return `Last seen ${d.toLocaleDateString(undefined, { weekday: 'long' })} at ${clock(d)}`;
  }
  const sameYear = d.getFullYear() === now.getFullYear();
  return `Last seen ${d.toLocaleDateString(undefined, sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export interface PresenceInfo {
  isOnline: boolean;
  lastSeen: string | null;
  /** The person turned off "show online status": show neither the dot nor a last-seen time. */
  hidden: boolean;
}
