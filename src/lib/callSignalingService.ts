// ═══════════════════════════════════════════════════════════════════
// Call Signaling Service — Supabase Realtime broadcast for call signals
// Must use the SAME event names & payload shapes as the mobile app
// (align-app/src/services/callSignalingService.ts) for cross-platform compat.
//
// Mobile sends/listens on per-type broadcast events:
//   'incoming-call', 'call-response', 'call-cancelled', 'call-ended'
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────

export interface IncomingCallSignal {
  type: 'incoming-call';
  callerId: string;
  callerName: string;
  callType: 'voice' | 'video';
  channelName: string;
  sessionId: string;
}

export interface CallResponseSignal {
  type: 'call-response';
  accepted: boolean;
  sessionId: string;
}

export interface CallCancelledSignal {
  type: 'call-cancelled';
  sessionId: string;
}

export interface CallEndedSignal {
  type: 'call-ended';
  sessionId: string;
}

export type CallSignal =
  | IncomingCallSignal
  | CallResponseSignal
  | CallCancelledSignal
  | CallEndedSignal;

// ── Broadcast helper (matches mobile's broadcastOnChannel) ────────

/**
 * Subscribe to a Supabase Realtime broadcast channel, wait for
 * SUBSCRIBED status, send the payload, then clean up. This mirrors
 * the mobile app's robust broadcastOnChannel pattern.
 */
async function broadcastOnChannel(
  channelName: string,
  event: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  try {
    const supabase = createClient();

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false, ack: true } },
    });

    // Wait for subscription confirmation
    const subscribed = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), 5000);
      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timer);
          resolve(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timer);
          resolve(false);
        }
      });
    });

    if (!subscribed) {
      console.warn(`[CallSignaling] Failed to subscribe to ${channelName}`);
      try { supabase.removeChannel(channel); } catch { /* */ }
      return false;
    }

    // Send the broadcast
    const result = await channel.send({
      type: 'broadcast',
      event,
      payload,
    });

    // Brief delay to ensure WebSocket flushes
    await new Promise(r => setTimeout(r, 150));
    try { supabase.removeChannel(channel); } catch { /* */ }

    if (result !== 'ok') {
      console.warn(`[CallSignaling] Broadcast send returned: ${result}`);
      return false;
    }

    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[CallSignaling] broadcastOnChannel error:', msg);
    return false;
  }
}

// ── Call log (chat row + push) ─────────────────────────────────────

/**
 * Write the call into the 1:1 conversation and raise the `incoming_call`
 * notification, which rings the callee's phones/browsers through the one
 * authoritative push path (send_push_notification). Resolves false if the RPC
 * is unavailable so the caller can fall back to the legacy push.
 */
export async function logCallStart(
  receiverId: string,
  callType: 'voice' | 'video',
  sessionId: string,
  channelName: string,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.rpc('call_log_start', {
      p_other_id: receiverId,
      p_call_type: callType,
      p_session_id: sessionId,
      p_channel_name: channelName,
    });
    if (error) {
      console.warn('[CallSignaling] call_log_start failed:', error.message);
      return false;
    }
    return true;
  } catch (err: unknown) {
    console.warn('[CallSignaling] call_log_start error:', err);
    return false;
  }
}

// status: accepted | declined | missed | ended. Forward-only on the server, so
// duplicate / late reports (both sides report 'ended') are harmless.
function logCallStatus(sessionId: string, status: string): void {
  if (!sessionId) return;
  try {
    const supabase = createClient();
    void Promise.resolve(
      supabase.rpc('call_log_update', { p_session_id: sessionId, p_status: status }),
    ).catch(() => {});
  } catch { /* the call must never fail because its log did */ }
}

// ── Send Signal ────────────────────────────────────────────────────

/**
 * Send a call signal to a specific user. Uses the same event names
 * as the mobile app so both platforms can interoperate.
 */
export function sendCallSignal(targetUserId: string, signal: CallSignal): void {
  const channelName = `call-signal:${targetUserId}`;

  switch (signal.type) {
    case 'incoming-call':
      broadcastOnChannel(channelName, 'incoming-call', {
        sessionId: signal.sessionId,
        callerId: signal.callerId,
        callerName: signal.callerName,
        callerAvatar: null,
        channelName: signal.channelName,
        callType: signal.callType,
      });
      break;

    case 'call-response':
      // Mobile uses { response: 'accepted' | 'declined' }, web also sends { accepted: bool }
      broadcastOnChannel(channelName, 'call-response', {
        sessionId: signal.sessionId,
        response: signal.accepted ? 'accepted' : 'declined',
        accepted: signal.accepted,
      });
      logCallStatus(signal.sessionId, signal.accepted ? 'accepted' : 'declined');
      break;

    case 'call-cancelled':
      broadcastOnChannel(channelName, 'call-cancelled', {
        sessionId: signal.sessionId,
      });
      // Caller gave up or nobody answered in time: a missed call.
      logCallStatus(signal.sessionId, 'missed');
      break;

    case 'call-ended':
      broadcastOnChannel(channelName, 'call-ended', {
        sessionId: signal.sessionId,
      });
      logCallStatus(signal.sessionId, 'ended');
      break;
  }
}

// ── Subscribe to Signals ───────────────────────────────────────────

/**
 * Subscribe to incoming call signals for the current user.
 * Listens on four separate broadcast events matching the mobile app's
 * signaling protocol.
 */
export function subscribeToCallSignals(
  userId: string,
  onSignal: (signal: CallSignal) => void,
): { unsubscribe: () => void } {
  try {
    const supabase = createClient();
    const channelName = `call-signal:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'incoming-call' }, (msg) => {
        try {
          const p = msg.payload as Record<string, unknown>;
          onSignal({
            type: 'incoming-call',
            callerId: p.callerId as string,
            callerName: p.callerName as string,
            callType: p.callType as 'voice' | 'video',
            channelName: p.channelName as string,
            sessionId: p.sessionId as string,
          });
        } catch (err: unknown) {
          console.warn('[CallSignaling] incoming-call handler error:', err);
        }
      })
      .on('broadcast', { event: 'call-response' }, (msg) => {
        try {
          const p = msg.payload as Record<string, unknown>;
          // Mobile sends { response: 'accepted'|'declined' }, web sends { accepted: bool }
          // Handle both formats
          const accepted = p.accepted === true || p.response === 'accepted';
          onSignal({
            type: 'call-response',
            accepted,
            sessionId: p.sessionId as string,
          });
        } catch (err: unknown) {
          console.warn('[CallSignaling] call-response handler error:', err);
        }
      })
      .on('broadcast', { event: 'call-cancelled' }, (msg) => {
        try {
          const p = msg.payload as Record<string, unknown>;
          onSignal({
            type: 'call-cancelled',
            sessionId: p.sessionId as string,
          });
        } catch (err: unknown) {
          console.warn('[CallSignaling] call-cancelled handler error:', err);
        }
      })
      .on('broadcast', { event: 'call-ended' }, (msg) => {
        try {
          const p = msg.payload as Record<string, unknown>;
          onSignal({
            type: 'call-ended',
            sessionId: p.sessionId as string,
          });
        } catch (err: unknown) {
          console.warn('[CallSignaling] call-ended handler error:', err);
        }
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[CallSignaling] ✓ Listening on ${channelName}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[CallSignaling] Listener failed: ${status}`);
        }
      });

    return {
      unsubscribe: () => {
        try {
          supabase.removeChannel(channel);
        } catch { /* already removed */ }
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[CallSignaling] subscribeToCallSignals error:', msg);
    return { unsubscribe: () => {} };
  }
}

// ── Utility ────────────────────────────────────────────────────────

/**
 * Generate a unique session ID for a call.
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}
