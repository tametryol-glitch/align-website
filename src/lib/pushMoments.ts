// =============================================================================
// High-intent moments worth asking about notifications at
// =============================================================================
// The browser prompt can only be answered once, ever — a dismissal is
// permanent. So the question is worth spending at the moment its value is
// self-evident, rather than on a timer while someone is still reading the
// page: right after you send a message, accept a friend request, or send one,
// you obviously want to know when they reply. Sending a request is the
// strongest of the three — the answer arrives later, with the tab closed.
//
// Deliberately a window event rather than a direct import: messagingService
// and friendService have no business knowing a notification prompt exists,
// and this keeps the dependency pointing one way.
// =============================================================================

export type PushMoment = 'message_sent' | 'friend_accepted' | 'friend_requested';

export const PUSH_MOMENT_EVENT = 'align:push-moment';

export function notifyPushMoment(reason: PushMoment): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(PUSH_MOMENT_EVENT, { detail: { reason } }));
  } catch {
    // A missing CustomEvent constructor must never break sending a message.
  }
}
