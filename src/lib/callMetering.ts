// ═══════════════════════════════════════════════════════════════════
// Call metering — records every 1:1 call server-side so usage can be
// attributed to an account and reconciled against the Agora bill.
//
// Before this existed a call left no trace on the server at all, so a
// two-hour video call and a call that never connected looked exactly
// the same from the outside: invisible.
//
// Three calls make up the lifecycle:
//   start()      — quota gate + creates the row
//   heartbeat()  — keeps duration current, enforces the per-call cap
//   end()        — finalises the duration
//
// Everything here FAILS OPEN. If the RPCs are unreachable we let the
// call proceed unmetered rather than break calling over a reporting
// concern — the token endpoint is the real gate, and the per-call cap
// still bounds a runaway call. The one thing we never do is silently
// drop a call the user could have made.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';

/** How often to beat. Must stay well under the sweeper's 120s grace. */
export const HEARTBEAT_MS = 30_000;

export interface StartResult {
  /** Server session id — also used as the signaling session id so both
   *  parties can heartbeat and end the same row. */
  sessionId: string | null;
  allowed: boolean;
  reason: string | null;
  minutesUsed: number;
  minutesLimit: number;
  maxCallSeconds: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether a signaling session id refers to a real metered row.
 *
 * The callee only ever learns the id from the caller's signal, and an
 * older client (or one whose call_start failed) sends its own local id
 * instead. Checking the shape avoids firing RPCs that can only fail.
 */
export function isMeteredSessionId(id: string | null | undefined): id is string {
  return !!id && UUID_RE.test(id);
}

/** User-facing text for a quota denial. */
export function denialMessage(reason: string | null): string {
  switch (reason) {
    case 'blocked':
      return 'Calling is disabled on this account.';
    case 'monthly_limit_reached':
      return "You've used all your calling minutes for this month.";
    case 'not_authenticated':
      return 'Please sign in again to make calls.';
    case 'cap_exceeded':
      return 'This call reached its maximum length.';
    default:
      return 'This call could not be started.';
  }
}

export async function start(
  receiverId: string,
  channelName: string,
  callType: 'voice' | 'video',
  clientSessionId: string,
): Promise<StartResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('call_start', {
      p_receiver_id: receiverId,
      p_channel_name: channelName,
      p_call_type: callType,
      p_client_session_id: clientSessionId,
      p_platform: 'web',
    });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('empty call_start result');

    return {
      sessionId: row.session_id ?? null,
      allowed: !!row.allowed,
      reason: row.reason ?? null,
      minutesUsed: row.minutes_used ?? 0,
      minutesLimit: row.minutes_limit ?? 0,
      maxCallSeconds: row.max_call_seconds ?? 0,
    };
  } catch (err: any) {
    console.warn('[CallMetering] start failed, proceeding unmetered:', err?.message);
    return {
      sessionId: null,
      allowed: true,
      reason: null,
      minutesUsed: 0,
      minutesLimit: 0,
      maxCallSeconds: 0,
    };
  }
}

export async function heartbeat(
  sessionId: string,
): Promise<{ shouldEnd: boolean; reason: string | null; elapsed: number }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('call_heartbeat', { p_session_id: sessionId });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    return {
      shouldEnd: !!row?.should_end,
      reason: row?.reason ?? null,
      elapsed: row?.elapsed_seconds ?? 0,
    };
  } catch (err: any) {
    // A dropped beat must not end a healthy call — the sweeper will
    // close the row from last_heartbeat_at if the client really is gone.
    console.warn('[CallMetering] heartbeat failed:', err?.message);
    return { shouldEnd: false, reason: null, elapsed: 0 };
  }
}

export async function end(
  sessionId: string,
  reason: string = 'hangup',
  clientDuration?: number,
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.rpc('call_end', {
      p_session_id: sessionId,
      p_reason: reason,
      p_client_duration: clientDuration ?? null,
    });
  } catch (err: any) {
    console.warn('[CallMetering] end failed:', err?.message);
  }
}

/**
 * Start a heartbeat loop. Returns a stop function.
 *
 * onForceEnd fires when the server says the call must stop — today that
 * is the per-call cap, which is the mechanism that actually prevents a
 * call running for hours.
 */
export function startHeartbeat(
  sessionId: string,
  onForceEnd: (reason: string) => void,
): () => void {
  let stopped = false;

  const beat = async () => {
    if (stopped) return;
    const res = await heartbeat(sessionId);
    if (!stopped && res.shouldEnd) {
      onForceEnd(res.reason ?? 'cap_exceeded');
    }
  };

  // Beat immediately: the first one stamps connected_at, which is when
  // billing starts. Waiting 30s would under-report every call.
  void beat();
  const timer = setInterval(beat, HEARTBEAT_MS);

  return () => {
    stopped = true;
    clearInterval(timer);
  };
}
