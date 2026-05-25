/**
 * Content Virality Predictor Engine
 *
 * Pure function module for scoring posts/reels on their viral potential
 * and boosting high-potential content in the feed. No side effects,
 * no imports from stores, no UI dependencies.
 *
 * Algorithm overview:
 *
 * VIRAL SCORE = (earlyEngagementVelocity * 0.30)
 *             + (contentTypeBonus * 0.20)
 *             + (optimalPostingTime * 0.15)
 *             + (creatorScoreInfluence * 0.15)
 *             + (captionQualitySignals * 0.10)
 *             + (trendAlignment * 0.10)
 *
 * All sub-scores are normalized to the 0-100 range before weighting.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViralTier = 'dormant' | 'warming' | 'rising' | 'viral' | 'supernova';

export interface ContentMetrics {
  id: string;
  created_at: string;
  content_type: 'video' | 'image_text' | 'image' | 'text';
  likes_count: number;
  comments_count: number;
  impressions_count: number;
  caption: string;
  creator_score: number;
  follower_count: number;
  /** Populated by the engine so callers can inspect/debug scores */
  _viral_score?: number;
}

export interface ViralScore {
  score: number;
  tier: ViralTier;
  shouldBoost: boolean;
}

export interface ViralFactors {
  earlyEngagementVelocity: number;
  contentTypeBonus: number;
  optimalPostingTime: number;
  creatorScoreInfluence: number;
  captionQualitySignals: number;
  trendAlignment: number;
  dominantFactor: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Content type multipliers: Video > Image+Text > Image > Text-only */
const CONTENT_TYPE_MULTIPLIERS: Record<ContentMetrics['content_type'], number> = {
  video: 1.5,
  image_text: 1.3,
  image: 1.1,
  text: 1.0,
} as const;

/** Peak engagement hours (24h format) */
const PEAK_HOURS: number[][] = [
  [7, 9],   // Morning commute
  [12, 14], // Lunch break
  [19, 22], // Evening wind-down
];

/** Trending zodiac topics that receive a bonus */
const TRENDING_TOPICS: string[] = [
  'retrograde',
  'eclipse',
  'full moon',
  'new moon',
  'mercury retrograde',
  'venus retrograde',
  'saturn return',
  'chiron return',
  'solar return',
  'lunar eclipse',
  'equinox',
  'solstice',
];

/** Maximum age (hours) for a post to be eligible for boosting */
const BOOST_MAX_AGE_HOURS = 24;

/** Minimum viral score to qualify for boosting */
const BOOST_MIN_SCORE = 60;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the number of hours between `isoTimestamp` and now.
 * Always returns a non-negative value.
 */
function hoursAgo(isoTimestamp: string): number {
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  return Math.max(0, diff / (1000 * 60 * 60));
}

/**
 * Clamp a value into the [0, 100] range.
 */
function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Extract the hour (0-23) from an ISO timestamp.
 */
function getHourFromTimestamp(isoTimestamp: string): number {
  return new Date(isoTimestamp).getHours();
}

// ---------------------------------------------------------------------------
// Sub-score calculations
// ---------------------------------------------------------------------------

/**
 * Early engagement velocity (0-100).
 *
 * Measures (likes + comments) in the first hour relative to impressions.
 * A 10% engagement rate in the first hour is considered exceptional (score 100).
 *
 * @param post - The post to evaluate.
 */
function calcEarlyEngagementVelocity(post: ContentMetrics): number {
  const age = hoursAgo(post.created_at);
  const impressions = Math.max(post.impressions_count, 1);

  // For posts older than 1 hour, use full engagement count
  // For posts less than 1 hour old, project the rate
  const engagements = post.likes_count + post.comments_count;
  const hourlyRate = age < 1 ? engagements / Math.max(age, 0.1) : engagements;

  const velocityRate = hourlyRate / impressions;
  // 10% engagement-to-impression ratio = perfect score
  return clamp100(velocityRate * 1000);
}

/**
 * Content type bonus (0-100).
 *
 * Video content scores highest, text-only scores lowest.
 * Normalized so the max multiplier (1.5) maps to 100.
 *
 * @param contentType - The type of content.
 */
function calcContentTypeBonus(contentType: ContentMetrics['content_type']): number {
  const multiplier = CONTENT_TYPE_MULTIPLIERS[contentType];
  // Normalize: 1.0 maps to ~67, 1.5 maps to 100
  return clamp100((multiplier / 1.5) * 100);
}

/**
 * Optimal posting time bonus (0-100).
 *
 * Posts during peak hours receive maximum score. Posts within 1 hour
 * of a peak window get partial credit.
 *
 * @param createdAt - ISO timestamp of the post.
 */
function calcOptimalPostingTime(createdAt: string): number {
  const hour = getHourFromTimestamp(createdAt);

  for (const [start, end] of PEAK_HOURS) {
    if (hour >= start && hour <= end) {
      return 100;
    }
    // Partial credit for being within 1 hour of a peak window
    if (hour === start - 1 || hour === end + 1) {
      return 50;
    }
  }

  return 20; // Base score for off-peak
}

/**
 * Creator score influence (0-100).
 *
 * Maps the creator's existing reputation score (0-100) directly.
 * Higher creator score = higher baseline viral potential.
 *
 * @param creatorScore - The creator's authority score (0-100).
 */
function calcCreatorScoreInfluence(creatorScore: number): number {
  return clamp100(creatorScore);
}

/**
 * Caption quality signals (0-100).
 *
 * Evaluates caption characteristics:
 * - Has hashtags: +25
 * - Has emoji: +15
 * - Optimal length (50-200 chars): +25
 * - Contains a question: +25
 * - Base: +10
 *
 * @param caption - The post caption text.
 */
function calcCaptionQualitySignals(caption: string): number {
  let score = 10; // Base score for having any caption

  // Has hashtags
  if (/#\w+/.test(caption)) {
    score += 25;
  }

  // Has emoji (heuristic: non-ASCII chars beyond common diacritics suggest emoji usage)
  if (/[^\x00-\xFF]/.test(caption)) {
    score += 15;
  }

  // Optimal length (50-200 characters)
  if (caption.length >= 50 && caption.length <= 200) {
    score += 25;
  }

  // Contains a question
  if (caption.includes('?')) {
    score += 25;
  }

  return clamp100(score);
}

/**
 * Trend alignment (0-100).
 *
 * Checks if the caption mentions any trending zodiac topics.
 * Each matching topic adds 30 points (capped at 100).
 *
 * @param caption - The post caption text.
 */
function calcTrendAlignment(caption: string): number {
  const lowerCaption = caption.toLowerCase();
  let score = 0;

  for (const topic of TRENDING_TOPICS) {
    if (lowerCaption.includes(topic)) {
      score += 30;
    }
  }

  return clamp100(score);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Predict the viral potential of a post.
 *
 * Calculates a composite score (0-100) using weighted factors:
 *   - Early engagement velocity: 30%
 *   - Content type bonus: 20%
 *   - Optimal posting time: 15%
 *   - Creator score influence: 15%
 *   - Caption quality signals: 10%
 *   - Trend alignment: 10%
 *
 * @param post - Content metrics for the post to evaluate.
 * @returns A numeric viral potential score (0-100).
 */
export function predictViralScore(post: ContentMetrics): number {
  const velocity = calcEarlyEngagementVelocity(post);
  const contentType = calcContentTypeBonus(post.content_type);
  const timing = calcOptimalPostingTime(post.created_at);
  const creator = calcCreatorScoreInfluence(post.creator_score);
  const caption = calcCaptionQualitySignals(post.caption);
  const trend = calcTrendAlignment(post.caption);

  return (
    velocity * 0.30 +
    contentType * 0.20 +
    timing * 0.15 +
    creator * 0.15 +
    caption * 0.10 +
    trend * 0.10
  );
}

/**
 * Map a viral score to its tier label.
 *
 * Tiers:
 *   - 0-20:  'dormant'
 *   - 21-40: 'warming'
 *   - 41-60: 'rising'
 *   - 61-80: 'viral'
 *   - 81-100: 'supernova'
 *
 * @param score - The viral score (0-100).
 * @returns The corresponding tier label.
 */
export function getViralTier(score: number): ViralTier {
  if (score <= 20) return 'dormant';
  if (score <= 40) return 'warming';
  if (score <= 60) return 'rising';
  if (score <= 80) return 'viral';
  return 'supernova';
}

/**
 * Determine whether a post should be boosted in the feed.
 *
 * A post qualifies for boosting if:
 *   - Its viral score exceeds 60
 *   - It was posted less than 24 hours ago
 *
 * @param post              - The post to evaluate.
 * @param currentViralScore - Pre-computed viral score for the post.
 * @returns True if the post should receive a feed boost.
 */
export function shouldBoostPost(post: ContentMetrics, currentViralScore: number): boolean {
  const age = hoursAgo(post.created_at);
  return currentViralScore > BOOST_MIN_SCORE && age < BOOST_MAX_AGE_HOURS;
}

/**
 * Get a detailed breakdown of which factors contributed to the viral score.
 *
 * Returns each sub-score (0-100) and identifies the dominant factor
 * (the one with the highest weighted contribution).
 *
 * @param post - Content metrics for the post to analyze.
 * @returns Breakdown of all contributing factors.
 */
export function getViralFactors(post: ContentMetrics): ViralFactors {
  const earlyEngagementVelocity = calcEarlyEngagementVelocity(post);
  const contentTypeBonus = calcContentTypeBonus(post.content_type);
  const optimalPostingTime = calcOptimalPostingTime(post.created_at);
  const creatorScoreInfluence = calcCreatorScoreInfluence(post.creator_score);
  const captionQualitySignals = calcCaptionQualitySignals(post.caption);
  const trendAlignment = calcTrendAlignment(post.caption);

  // Determine dominant factor by weighted contribution
  const weighted: Record<string, number> = {
    earlyEngagementVelocity: earlyEngagementVelocity * 0.30,
    contentTypeBonus: contentTypeBonus * 0.20,
    optimalPostingTime: optimalPostingTime * 0.15,
    creatorScoreInfluence: creatorScoreInfluence * 0.15,
    captionQualitySignals: captionQualitySignals * 0.10,
    trendAlignment: trendAlignment * 0.10,
  };

  const dominantFactor = Object.entries(weighted).reduce(
    (max, [key, val]) => (val > max[1] ? [key, val] : max),
    ['', 0],
  )[0];

  return {
    earlyEngagementVelocity,
    contentTypeBonus,
    optimalPostingTime,
    creatorScoreInfluence,
    captionQualitySignals,
    trendAlignment,
    dominantFactor,
  };
}

/**
 * Estimate the total reach (impressions) a post could achieve
 * based on its viral score and the creator's follower count.
 *
 * Multiplier logic:
 *   - dormant:   1x followers
 *   - warming:   2x followers
 *   - rising:    5x followers
 *   - viral:     15x followers
 *   - supernova: 50x followers
 *
 * @param viralScore    - The viral potential score (0-100).
 * @param followerCount - The creator's current follower count.
 * @returns Estimated total impressions.
 */
export function estimateReach(viralScore: number, followerCount: number): number {
  const tier = getViralTier(viralScore);
  const multipliers: Record<ViralTier, number> = {
    dormant: 1,
    warming: 2,
    rising: 5,
    viral: 15,
    supernova: 50,
  };

  return Math.round(followerCount * multipliers[tier]);
}
