'use client';

// ═══════════════════════════════════════════════════════════════════
// Global Call Listener — App-wide Supabase call signal subscription
// Renders <IncomingCallOverlay /> when a call arrives, regardless of
// which page the user is currently viewing.
//
// Signal routing:
//   incoming-call  → show overlay (handled here)
//   call-cancelled → dismiss overlay (handled here)
//   call-response  → forwarded to callStore for messages page
//   call-ended     → forwarded to callStore for messages page
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useCallStore } from '@/stores/callStore';
import { subscribeToCallSignals, sendCallSignal, type CallSignal } from '@/lib/callSignalingService';
import { IncomingCallOverlay } from '@/components/chat/IncomingCallOverlay';
import { createClient } from '@/lib/supabase';
import { startRingtone, stopCallTones } from '@/lib/callTones';

// A ring older than this has been answered, missed or timed out (callers give
// up after 30s). Matches the window the call bubble uses to call it missed.
const RING_WINDOW_MS = 40_000;

export function GlobalCallListener() {
  const user = useAuthStore((s) => s.user);
  const incomingCall = useCallStore((s) => s.incomingCall);
  const setIncomingCall = useCallStore((s) => s.setIncomingCall);
  const setPendingAcceptedCall = useCallStore((s) => s.setPendingAcceptedCall);
  const pushActiveSignal = useCallStore((s) => s.pushActiveSignal);
  const router = useRouter();

  // ── Single global subscription to all call signals ──
  // Keyed on the user's ID, not the user object: the auth store hands out a
  // new object on every token refresh, which tore the subscription down and
  // rebuilt it -- and supabase-js returns the still-closing old channel for
  // the same topic, leaving a listener that never fires.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;

    const sub = subscribeToCallSignals(userId, (signal: CallSignal) => {
      switch (signal.type) {
        case 'incoming-call':
          setIncomingCall({
            callerName: signal.callerName,
            callerAvatar: undefined,
            callType: signal.callType,
            channelName: signal.channelName,
            sessionId: signal.sessionId,
            callerId: signal.callerId,
          });
          break;

        case 'call-cancelled': {
          // Dismiss the overlay if it matches the ringing call
          handledSessions.current.add(signal.sessionId);
          const current = useCallStore.getState().incomingCall;
          if (current && signal.sessionId === current.sessionId) {
            setIncomingCall(null);
          }
          break;
        }

        case 'call-response':
          // Forward to store — messages page will react
          pushActiveSignal({
            type: 'call-response',
            sessionId: signal.sessionId,
            accepted: signal.accepted,
            _ts: Date.now(),
          });
          break;

        case 'call-ended':
          // Forward to store — messages page will react
          pushActiveSignal({
            type: 'call-ended',
            sessionId: signal.sessionId,
            _ts: Date.now(),
          });
          break;
      }
    });

    return () => sub.unsubscribe();
  }, [userId, setIncomingCall, pushActiveSignal]);

  // ── Ring while an incoming call is showing ──
  // Stops on accept / decline / cancel (incomingCall goes null) and on unmount.
  const isRinging = !!incomingCall;
  useEffect(() => {
    if (!isRinging) return;
    startRingtone();
    return () => stopCallTones();
  }, [isRinging]);

  // ── Recover a call that is still ringing ──
  // The realtime broadcast only reaches a tab that was open and subscribed.
  // Someone who taps the "X is calling" push (or opens the site mid-ring) gets
  // no broadcast, so look for a live ring in their own call rows instead.
  const handledSessions = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const recover = async () => {
      try {
        const supabase = createClient();
        const since = new Date(Date.now() - RING_WINDOW_MS).toISOString();
        const { data } = await supabase
          .from('messages')
          .select('sender_id, metadata, created_at')
          .eq('type', 'call')
          .neq('sender_id', userId)
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(5);
        if (cancelled || !data) return;
        const live = data.find((m: any) =>
          m.metadata?.status === 'ringing'
          && m.metadata?.callee_id === userId
          && m.metadata?.session_id
          && !handledSessions.current.has(m.metadata.session_id),
        );
        if (!live || useCallStore.getState().incomingCall) return;
        const md = live.metadata as Record<string, any>;
        setIncomingCall({
          callerName: md.caller_name || 'Someone',
          callerAvatar: undefined,
          callType: md.call_type === 'video' ? 'video' : 'voice',
          channelName: md.channel_name,
          sessionId: md.session_id,
          callerId: live.sender_id,
        });
      } catch { /* ringing falls back to the broadcast alone */ }
    };

    recover();
    const onVisible = () => { if (document.visibilityState === 'visible') recover(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId, setIncomingCall]);

  // ── Accept incoming call ──
  const handleAccept = useCallback(() => {
    const call = useCallStore.getState().incomingCall;
    if (!call) return;
    handledSessions.current.add(call.sessionId);

    // Tell the caller we accepted
    sendCallSignal(call.callerId, {
      type: 'call-response',
      accepted: true,
      sessionId: call.sessionId,
    });

    // Store as pending so messages page can connect to Agora
    setPendingAcceptedCall(call);
    setIncomingCall(null);

    // Navigate to messages (if already there, the useEffect still fires)
    router.push('/messages');
  }, [setIncomingCall, setPendingAcceptedCall, router]);

  // ── Decline incoming call ──
  const handleDecline = useCallback(() => {
    const call = useCallStore.getState().incomingCall;
    if (call) {
      handledSessions.current.add(call.sessionId);
      sendCallSignal(call.callerId, {
        type: 'call-response',
        accepted: false,
        sessionId: call.sessionId,
      });
    }
    setIncomingCall(null);
  }, [setIncomingCall]);

  // Only render when there's an incoming call to show
  if (!incomingCall) return null;

  return (
    <IncomingCallOverlay
      isVisible={true}
      callerName={incomingCall.callerName}
      callerAvatar={incomingCall.callerAvatar}
      callType={incomingCall.callType}
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  );
}
