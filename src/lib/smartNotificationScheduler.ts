/**
 * Smart Notification Scheduling Engine
 *
 * Pure function module for tracking user engagement patterns and
 * scheduling notifications for optimal delivery. No side effects,
 * no imports from stores, no UI dependencies.
 *
 * Algorithm overview:
 *
 * ENGAGEMENT PATTERN = weighted hourly heatmap (24 slots, 0-100 each)
 *   - Recent activity (last 7 days) weighted 3x vs older activity
 *   - Normalized so peak hour = 100
 *
 * DELIVERY SCORE = (engagementWeight * 0.6) + (typeModifier * 0.25)
 *                + (freshnessPenalty * 0.15)
 *
 * High-urgency notifications bypass scheduling entirely.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single user activity event. */
export interface ActivityEntry {
  /** Type of activity performed */
  type: ActivityType;
  /** ISO timestamp of the activity */
  timestamp: string;
  /** Duration in seconds (for time-on-screen metrics) */
  duration?: number;
}

/** Hourly engagement heatmap (24 slots, index 0 = midnight, index 23 = 11 PM). */
export interface EngagementPattern {
  /** Engagement score per hour (0-100), index = hour of day */
  hourlyScores: number[];
  /** Peak engagement hour (0-23) */
  peakHour: number;
  /** Secondary peak hour (0-23) */
  secondaryPeakHour: number;
  /** Total activity count used to build this pattern */
  totalActivities: number;
  /** Whether this is a default pattern (insufficient data) */
  isDefault: boolean;
}

/** Recommendation for when to deliver a notification. */
export interface DeliveryRecommendation {
  /** Recommended hour (0-23) */
  optimalHour: number;
  /** Confidence score 0-100 (higher = more data supporting this choice) */
  confidence: number;
  /** Whether to send immediately (bypasses scheduling) */
  sendImmediately: boolean;
  /** Reason for the recommendation */
  reason: string;
  /** Fallback hour if optimal is missed */
  fallbackHour: number;
}

export type ActivityType =
  | 'app_open'
  | 'message_read'
  | 'post_like'
  | 'post_comment'
  | 'reel_watch'
  | 'profile_view';

export type NotificationType =
  | 'match'
  | 'message'
  | 'like'
  | 'comment'
  | 'cosmic_event'
  | 'reengagement';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum activities needed before we trust the pattern over defaults. */
const MIN_ACTIVITIES_THRESHOLD = 15;

/** Number of days considered "recent" for decay weighting. */
const RECENT_WINDOW_DAYS = 7;

/** Weight multiplier for recent activity vs older. */
const RECENT_WEIGHT_MULTIPLIER = 3;

/** Activity type weights (some activities indicate stronger engagement). */
const ACTIVITY_WEIGHTS: Record<ActivityType, number> = {
  app_open: 1.0,
  message_read: 2.0,
  post_like: 1.5,
  post_comment: 2.5,
  reel_watch: 1.2,
  profile_view: 1.8,
} as const;

/** Notification urgency levels. High-urgency bypasses scheduling. */
const NOTIFICATION_URGENCY: Record<NotificationType, 'high' | 'medium' | 'low'> = {
  match: 'high',
  message: 'high',
  like: 'medium',
  comment: 'medium',
  cosmic_event: 'low',
  reengagement: 'low',
} as const;

/** Default engagement pattern for new users (bimodal: morning + evening). */
const DEFAULT_HOURLY_WEIGHTS: number[] = [
  5, 3, 2, 2, 3, 5,     // 0-5 AM: low activity
  15, 40, 70, 60, 35, 30, // 6-11 AM: morning peak at 8 AM
  25, 30, 25, 20, 25, 35, // 12-5 PM: afternoon dip
  50, 75, 85, 70, 45, 20, // 6-11 PM: evening peak at 8 PM
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp a value into the [0, 100] range.
 */
function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Calculate the number of days between a timestamp and now.
 */
function daysAgo(isoTimestamp: string): number {
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  return Math.max(0, diff / (1000 * 60 * 60 * 24));
}

/**
 * Get the hour (0-23) from an ISO timestamp.
 */
function hourFromTimestamp(isoTimestamp: string): number {
  return new Date(isoTimestamp).getHours();
}

/**
 * Calculate the decay factor for an activity based on recency.
 * Activities within RECENT_WINDOW_DAYS get RECENT_WEIGHT_MULTIPLIER.
 * Older activities decay linearly over 30 days to a floor of 0.3.
 */
function decayFactor(isoTimestamp: string): number {
  const age = daysAgo(isoTimestamp);
  if (age <= RECENT_WINDOW_DAYS) {
    return RECENT_WEIGHT_MULTIPLIER;
  }
  // Linear decay from 1.0 at day 7 to 0.3 at day 30
  const decayRange = 30 - RECENT_WINDOW_DAYS;
  const decayProgress = Math.min((age - RECENT_WINDOW_DAYS) / decayRange, 1.0);
  return 1.0 - decayProgress * 0.7;
}

/**
 * Find the index of the maximum value in an array.
 */
function indexOfMax(arr: number[]): number {
  let maxIdx = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[maxIdx]) maxIdx = i;
  }
  return maxIdx;
}

/**
 * Find the second-highest peak that is at least 3 hours away from the primary peak.
 */
function findSecondaryPeak(scores: number[], primaryPeak: number): number {
  let bestIdx = -1;
  let bestVal = -1;
  for (let i = 0; i < scores.length; i++) {
    const distance = Math.min(Math.abs(i - primaryPeak), 24 - Math.abs(i - primaryPeak));
    if (distance >= 3 && scores[i] > bestVal) {
      bestVal = scores[i];
      bestIdx = i;
    }
  }
  return bestIdx >= 0 ? bestIdx : (primaryPeak + 12) % 24;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build an engagement heatmap from a user's activity history.
 *
 * Produces a 24-slot array where each slot represents the normalized
 * engagement level for that hour of day (0 = midnight, 23 = 11 PM).
 * Recent activity (last 7 days) is weighted 3x heavier than older data.
 *
 * Returns a default bimodal pattern (8 AM + 8 PM peaks) when insufficient
 * data is available.
 *
 * @param activityHistory - Array of user activity events.
 * @returns EngagementPattern with hourly scores and metadata.
 */
export function getUserEngagementPattern(activityHistory: ActivityEntry[]): EngagementPattern {
  // Fall back to default pattern if insufficient data
  if (activityHistory.length < MIN_ACTIVITIES_THRESHOLD) {
    const peakHour = indexOfMax(DEFAULT_HOURLY_WEIGHTS);
    const secondaryPeakHour = findSecondaryPeak(DEFAULT_HOURLY_WEIGHTS, peakHour);
    return {
      hourlyScores: [...DEFAULT_HOURLY_WEIGHTS],
      peakHour,
      secondaryPeakHour,
      totalActivities: activityHistory.length,
      isDefault: true,
    };
  }

  // Accumulate weighted scores per hour
  const rawScores = new Array(24).fill(0);

  for (const activity of activityHistory) {
    const hour = hourFromTimestamp(activity.timestamp);
    const typeWeight = ACTIVITY_WEIGHTS[activity.type];
    const recencyWeight = decayFactor(activity.timestamp);
    const durationBonus = activity.duration ? Math.min(activity.duration / 300, 2.0) : 1.0;

    rawScores[hour] += typeWeight * recencyWeight * durationBonus;
  }

  // Normalize to 0-100 range (peak = 100)
  const maxRaw = Math.max(...rawScores, 1);
  const hourlyScores = rawScores.map((score) => clamp100((score / maxRaw) * 100));

  const peakHour = indexOfMax(hourlyScores);
  const secondaryPeakHour = findSecondaryPeak(hourlyScores, peakHour);

  return {
    hourlyScores,
    peakHour,
    secondaryPeakHour,
    totalActivities: activityHistory.length,
    isDefault: false,
  };
}

/**
 * Determine the optimal delivery time for a notification type given
 * a user's engagement pattern.
 *
 * High-urgency notifications (match, message) always recommend immediate
 * delivery. Low-urgency notifications (reengagement, cosmic_event) target
 * the user's peak engagement window.
 *
 * @param engagementPattern - The user's hourly engagement heatmap.
 * @param notificationType  - The type of notification to schedule.
 * @returns DeliveryRecommendation with optimal hour and confidence.
 */
export function getOptimalDeliveryTime(
  engagementPattern: EngagementPattern,
  notificationType: NotificationType,
): DeliveryRecommendation {
  const urgency = NOTIFICATION_URGENCY[notificationType];

  // High-urgency notifications bypass scheduling
  if (urgency === 'high') {
    return {
      optimalHour: new Date().getHours(),
      confidence: 100,
      sendImmediately: true,
      reason: `${notificationType} notifications are time-sensitive and delivered immediately.`,
      fallbackHour: engagementPattern.peakHour,
    };
  }

  const { hourlyScores, peakHour, secondaryPeakHour, isDefault } = engagementPattern;

  // For medium urgency, target peak or secondary peak
  let targetHour: number;
  let reason: string;

  if (urgency === 'medium') {
    targetHour = peakHour;
    reason = `Scheduled for peak engagement hour (${peakHour}:00) for ${notificationType} notification.`;
  } else {
    // Low urgency: use secondary peak to avoid notification fatigue at primary peak
    targetHour = secondaryPeakHour;
    reason = `Scheduled for secondary peak (${secondaryPeakHour}:00) to avoid cluttering primary engagement window.`;
  }

  // Confidence is based on the score at the target hour and data quality
  const baseConfidence = hourlyScores[targetHour];
  const dataQualityMultiplier = isDefault ? 0.5 : 1.0;
  const confidence = clamp100(baseConfidence * dataQualityMultiplier);

  // Fallback: the other peak
  const fallbackHour = targetHour === peakHour ? secondaryPeakHour : peakHour;

  return {
    optimalHour: targetHour,
    confidence,
    sendImmediately: false,
    reason,
    fallbackHour,
  };
}

/**
 * Determine whether a notification should be sent right now based on
 * the user's engagement pattern, current hour, and notification urgency.
 *
 * Rules:
 * - High urgency (match, message): always returns true
 * - Medium urgency (like, comment): true if current hour score >= 50
 * - Low urgency (cosmic_event, reengagement): true only if current hour
 *   is within 1 hour of peak or secondary peak
 *
 * @param engagementPattern - The user's hourly engagement heatmap.
 * @param currentHour       - Current hour (0-23).
 * @param urgency           - Notification urgency level.
 * @returns Whether the notification should be sent now.
 */
export function shouldSendNow(
  engagementPattern: EngagementPattern,
  currentHour: number,
  urgency: 'high' | 'medium' | 'low',
): boolean {
  // High urgency always sends immediately
  if (urgency === 'high') {
    return true;
  }

  const { hourlyScores, peakHour, secondaryPeakHour } = engagementPattern;
  const currentScore = hourlyScores[currentHour] ?? 0;

  if (urgency === 'medium') {
    // Send if we're in a reasonably active period
    return currentScore >= 50;
  }

  // Low urgency: only send near peaks
  const distanceToPeak = Math.min(
    Math.abs(currentHour - peakHour),
    24 - Math.abs(currentHour - peakHour),
  );
  const distanceToSecondary = Math.min(
    Math.abs(currentHour - secondaryPeakHour),
    24 - Math.abs(currentHour - secondaryPeakHour),
  );

  return distanceToPeak <= 1 || distanceToSecondary <= 1;
}
