// ═══════════════════════════════════════════════════════════════════
// Call Store — Global Zustand state for incoming & active calls
// Lives at the app level so calls can be received on any page.
// ═══════════════════════════════════════════════════════════════════

import { create } from 'zustand';

export interface IncomingCallInfo {
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  channelName: string;
  sessionId: string;
  callerId: string;
}

/**
 * Signals forwarded from the global listener to the messages page.
 * The `_ts` field ensures each signal is treated as unique, even if
 * the payload is identical to a prior one.
 */
export type ActiveCallSignal =
  | { type: 'call-response'; sessionId: string; accepted: boolean; _ts: number }
  | { type: 'call-ended'; sessionId: string; _ts: number };

interface CallStoreState {
  /** Currently ringing incoming call (shown in global overlay) */
  incomingCall: IncomingCallInfo | null;

  /**
   * When the user accepts a call from a page other than /messages,
   * we store the call info here so the messages page can pick it up
   * and connect to Agora once it mounts.
   */
  pendingAcceptedCall: IncomingCallInfo | null;

  /**
   * Active call signals forwarded from the global listener.
   * The messages page watches this to react to call-response and call-ended.
   */
  activeSignal: ActiveCallSignal | null;

  setIncomingCall: (call: IncomingCallInfo | null) => void;
  setPendingAcceptedCall: (call: IncomingCallInfo | null) => void;
  pushActiveSignal: (signal: ActiveCallSignal) => void;
  clearAll: () => void;
}

export const useCallStore = create<CallStoreState>((set) => ({
  incomingCall: null,
  pendingAcceptedCall: null,
  activeSignal: null,

  setIncomingCall: (incomingCall) => set({ incomingCall }),
  setPendingAcceptedCall: (pendingAcceptedCall) => set({ pendingAcceptedCall }),
  pushActiveSignal: (activeSignal) => set({ activeSignal }),
  clearAll: () => set({ incomingCall: null, pendingAcceptedCall: null, activeSignal: null }),
}));
