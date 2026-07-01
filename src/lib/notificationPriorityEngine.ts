/**
 * Notification Priority Engine
 * Ranks notifications by importance so the most critical ones surface first.
 *
 * Priority tiers:
 *   CRITICAL (90-100): friend_request, cosmic_match_ready
 *   HIGH     (70-89):  new_message, mention, dating match
 *   MEDIUM   (40-69):  like, comment, follow, story_reaction
 *   LOW      (10-39):  system, transit_alert, announcements
 *
 * Within each tier, recency breaks ties.
 * Unread notifications get a +15 bonus.
 * Grouped notifications (multiple likes on same post) get a +10 bonus.
 *
 * This module is intentionally pure — no side effects, no store imports.
 * Callers provide everything via parameters.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PrioritizableNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
  sender_id?: string;
}

export interface ScoredNotification extends PrioritizableNotification {
  /** Computed priority score (higher = more important) */
  _priority_score: number;
  /** Human-readable tier derived from the score */
  _priority_tier: 'critical' | 'high' | 'medium' | 'low';
  /** True when this notification has been folded into a group representative */
  _grouped?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Base score per notification type. Unknown types default to 20. */
const TYPE_SCORES: Record<string, number> = {
  friend_request: 95,
  cosmic_match_share_invite: 93,
  cosmic_match_ready: 92,
  cosmic_match_published: 88,
  new_message: 85,
  mention: 80,
  dating_match: 78,
  dating_like: 75,
  comment: 60,
  like: 50,
  story_reaction: 48,
  follow: 45,
  transit_alert: 30,
  system: 25,
};

/** Default base score for notification types not listed in TYPE_SCORES. */
const DEFAULT_TYPE_SCORE = 20;

/** Bonus added when the notification has not been read. */
const UNREAD_BONUS = 15;

/** Maximum bonus awarded for very recent notifications. */
const MAX_RECENCY_BONUS = 10;

/** Window (in minutes) over which the recency bonus decays to zero. */
const RECENCY_WINDOW_MINUTES = 60;

/** Bonus for notifications that belong to a group of duplicates. */
const GROUP_BONUS = 10;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Derive the priority tier label from a numeric score.
 *
 * @param score - The computed priority score.
 * @returns The tier label.
 */
function tierFromScore(score: number): ScoredNotification['_priority_tier'] {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Calculate a recency bonus between 0 and {@link MAX_RECENCY_BONUS}.
 *
 * Notifications created within the last {@link RECENCY_WINDOW_MINUTES} minutes
 * receive a linearly-decaying bonus. Anything older gets 0.
 *
 * @param createdAt - ISO-8601 timestamp string.
 * @param now       - Current time in milliseconds since epoch.
 * @returns A number in the range [0, MAX_RECENCY_BONUS].
 */
function recencyBonus(createdAt: string, now: number): number {
  const created = new Date(createdAt).getTime();
  if (isNaN(created)) return 0;

  const minutesAgo = (now - created) / 60_000;
  if (minutesAgo <= 0) return MAX_RECENCY_BONUS;
  if (minutesAgo >= RECENCY_WINDOW_MINUTES) return 0;

  return MAX_RECENCY_BONUS * (1 - minutesAgo / RECENCY_WINDOW_MINUTES);
}

/**
 * Build a grouping key for a notification. Notifications with the same key are
 * considered duplicates that can be collapsed (e.g. "5 people liked your post").
 *
 * The key combines the notification type with a stable target identifier pulled
 * from `data.post_id` or `data.target_id`. If neither is present, each
 * notification is unique (no grouping).
 *
 * @param notification - The notification to derive a key from.
 * @returns A string key, or `null` if the notification cannot be grouped.
 */
function groupKey(notification: PrioritizableNotification): string | null {
  const targetId =
    notification.data?.post_id ??
    notification.data?.target_id ??
    null;

  if (targetId === null || targetId === undefined) return null;
  return `${notification.type}::${String(targetId)}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the priority score for a single notification.
 *
 * Formula: `typeScore + unreadBonus + recencyBonus`
 * (The group bonus is applied separately in {@link prioritizeNotifications}
 * because it depends on the full list.)
 *
 * @param notification - The notification to score.
 * @returns The numeric priority score (before any group bonus).
 */
export function getNotificationScore(
  notification: PrioritizableNotification,
): number {
  const baseScore = TYPE_SCORES[notification.type] ?? DEFAULT_TYPE_SCORE;
  const unread = notification.is_read ? 0 : UNREAD_BONUS;
  const recency = recencyBonus(notification.created_at, Date.now());

  return baseScore + unread + recency;
}

/**
 * Score and sort an array of notifications by descending importance.
 *
 * Each notification receives:
 * - A base score from its `type`
 * - A +15 bonus if unread
 * - A 0-10 recency bonus (linear decay over the last 60 minutes)
 * - A +10 group bonus when multiple notifications share the same type AND target
 *
 * @param notifications - Unsorted array of notifications.
 * @returns A new array of {@link ScoredNotification} sorted highest-first.
 */
export function prioritizeNotifications(
  notifications: PrioritizableNotification[],
): ScoredNotification[] {
  const now = Date.now();

  // Pre-compute group counts so we can award the group bonus.
  const groupCounts = new Map<string, number>();
  for (const n of notifications) {
    const key = groupKey(n);
    if (key !== null) {
      groupCounts.set(key, (groupCounts.get(key) ?? 0) + 1);
    }
  }

  const scored: ScoredNotification[] = notifications.map((n) => {
    const baseScore = TYPE_SCORES[n.type] ?? DEFAULT_TYPE_SCORE;
    const unread = n.is_read ? 0 : UNREAD_BONUS;
    const recency = recencyBonus(n.created_at, now);

    const key = groupKey(n);
    const grouped = key !== null && (groupCounts.get(key) ?? 0) > 1;
    const gBonus = grouped ? GROUP_BONUS : 0;

    const score = baseScore + unread + recency + gBonus;

    return {
      ...n,
      _priority_score: Math.round(score * 100) / 100,
      _priority_tier: tierFromScore(score),
    };
  });

  // Sort descending by score; ties broken by most recent first.
  scored.sort((a, b) => {
    if (b._priority_score !== a._priority_score) {
      return b._priority_score - a._priority_score;
    }
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  return scored;
}

/**
 * Collapse consecutive same-type, same-target notifications into groups.
 *
 * The first notification in each group is kept as the representative.
 * Subsequent duplicates are marked with `_grouped: true` so the UI can
 * either hide them or render a summary ("5 people liked your post").
 *
 * @param notifications - Pre-scored and sorted notifications.
 * @returns A new array with duplicate entries flagged via `_grouped`.
 */
export function groupNotifications(
  notifications: ScoredNotification[],
): ScoredNotification[] {
  if (notifications.length === 0) return [];

  const result: ScoredNotification[] = [];
  const seenGroups = new Set<string>();

  for (const n of notifications) {
    const key = groupKey(n);

    if (key === null) {
      // Not groupable — always include as-is.
      result.push({ ...n });
      continue;
    }

    if (seenGroups.has(key)) {
      // This is a duplicate — mark it as grouped.
      result.push({ ...n, _grouped: true });
    } else {
      // First occurrence — this becomes the group representative.
      seenGroups.add(key);
      result.push({ ...n });
    }
  }

  return result;
}
