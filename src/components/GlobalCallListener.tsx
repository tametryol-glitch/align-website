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

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useCallStore } from '@/stores/callStore';
import { subscribeToCallSignals, sendCallSignal, type CallSignal } from '@/lib/callSignalingService';
import { IncomingCallOverlay } from '@/components/chat/IncomingCallOverlay';

export function GlobalCallListener() {
  const user = useAuthStore((s) => s.user);
  const incomingCall = useCallStore((s) => s.incomingCall);
  const setIncomingCall = useCallStore((s) => s.setIncomingCall);
  const setPendingAcceptedCall = useCallStore((s) => s.setPendingAcceptedCall);
  const pushActiveSignal = useCallStore((s) => s.pushActiveSignal);
  const router = useRouter();

  // ── Single global subscription to all call signals ──
  useEffect(() => {
    if (!user) return;

    const sub = subscribeToCallSignals(user.id, (signal: CallSignal) => {
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
  }, [user, setIncomingCall, pushActiveSignal]);

  // ── Accept incoming call ──
  const handleAccept = useCallback(() => {
    const call = useCallStore.getState().incomingCall;
    if (!call) return;

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
