// =============================================================================
// Where a notification points on the web
// =============================================================================
// Extracted from the notifications page so the web-push relay can send the
// SAME destination in the push payload. A push that lands somewhere different
// from the notification list entry for the same event is a bug waiting to
// happen, so both read this one mapping.
// =============================================================================

export interface LinkableNotification {
  type: string;
  actor_id?: string | null;
  data?: any;
}

export function getNotificationLink(n: LinkableNotification): string {
  switch (n.type) {
    case 'friend_request':
    case 'friend_accepted':
      return n.actor_id ? `/user/${n.actor_id}` : '/friends';
    case 'follow':
      return n.actor_id ? `/user/${n.actor_id}` : '/friends';
    case 'reaction':
    case 'like':
    case 'comment':
    case 'mention':
    case 'story_reaction': {
      // Deep-link to the exact post (and comment) the notification is about.
      const postId = n.data?.post_id;
      if (!postId) return '/feed';
      const commentId = n.type === 'comment' || n.type === 'mention' ? n.data?.comment_id : undefined;
      return commentId
        ? `/feed?postId=${postId}&commentId=${commentId}`
        : `/feed?postId=${postId}`;
    }
    case 'message':
    case 'new_message':
      return n.data?.conversation_id ? `/messages/${n.data.conversation_id}` : '/messages';
    case 'cosmic_alert':
    case 'transit':
    case 'transit_alert':
    case 'moon_phase':
    case 'retrograde':
    case 'eclipse':
      // Cosmic Frequencies rides on the 'transit_alert' type (the only type
      // valid under every version of notifications_type_check) and is
      // distinguished by data.kind, so it has to be checked before the
      // generic /readings fallback.
      if (n.data?.kind === 'cosmic_frequency') return '/readings/cosmic-frequencies';
      // The purpose check-in rides on the same type; the conversation card
      // lives on the dashboard, not in /readings.
      if (n.data?.kind === 'purpose_checkin') return '/dashboard';
      return '/readings';
    case 'cosmic_match_ready':
      // /compatibility/[signs] is the public sign-pair guide, not this user's
      // match — deep-link into the Cosmic Match list and auto-open the card.
      return n.data?.match_id ? `/matches?matchId=${n.data.match_id}` : '/matches';
    case 'cosmic_match_published':
      return '/feed';
    case 'cosmic_match_share_invite':
      return '#'; // intercepted — opens the share modal instead of navigating
    case 'system':
      return '/dashboard';
    case 'announcement':
      return '/settings';
    case 'account':
    case 'subscription':
      return '/settings/account';
    default:
      return '/dashboard';
  }
}
