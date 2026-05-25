/**
 * Creator Score Engine
 *
 * Pure function module for calculating reputation/authority scores for
 * content creators to rank quality contributors. No side effects,
 * no imports from stores, no UI dependencies.
 *
 * Algorithm overview:
 *
 * CREATOR SCORE = (consistency * 0.25) + (engagementRate * 0.25)
 *               + (followerQuality * 0.15) + (contentVariety * 0.10)
 *               + (communityParticipation * 0.10) + (accountMaturity * 0.10)
 *               - (violationsDeduction * 0.05)
 *
 * All sub-scores are normalized to the 0-100 range before weighting.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreatorTier = 'newcomer' | 'contributor' | 'creator' | 'influencer' | 'luminary';

export interface CreatorBadge {
  emoji: string;
  label: string;
  tier: CreatorTier;
}

export type ScoreTrend = 'rising' | 'stable' | 'declining';

export interface CreatorData {
  id: string;
  account_created_at: string;
  /** Number of posts in the last 30 days */
  posts_last_30d: number;
  /** Total likes received across all posts */
  total_likes: number;
  /** Total comments received across all posts */
  total_comments: number;
  /** Total shares received across all posts */
  total_shares: number;
  /** Total number of posts (lifetime) */
  total_posts: number;
  /** Average follower count at time of posting */
  avg_follower_count: number;
  /** Followers who engaged (liked/commented/shared) in last 30 days */
  engaged_followers_30d: number;
  /** Total follower count */
  total_followers: number;
  /** Number of distinct content types used (1-4: text, image, video, reel) */
  content_types_used: number;
  /** Number of comments made on other users' posts in last 30 days */
  comments_on_others_30d: number;
  /** Number of community contributions (shared resources, answered questions) */
  community_contributions_30d: number;
  /** Number of content filter violations */
  violations_count: number;
}

export interface CreatorScore {
  score: number;
  tier: CreatorTier;
  badge: CreatorBadge;
  trend?: ScoreTrend;
}

export interface ScoreBreakdown {
  consistency: number;
  engagementRate: number;
  followerQuality: number;
  contentVariety: number;
  communityParticipation: number;
  accountMaturity: number;
  violationsDeduction: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Optimal posting range: 1-3 posts per day (30-90 per 30 days) */
const OPTIMAL_POSTS_MIN = 30;
const OPTIMAL_POSTS_MAX = 90;

/** Spam threshold: > 5 posts/day (150 per 30 days) */
const SPAM_THRESHOLD = 150;

/** Inactive threshold: < 1 post/week (< 4 per 30 days) */
const INACTIVE_THRESHOLD = 4;

/** Maximum content types possible */
const MAX_CONTENT_TYPES = 4;

/** Account maturity cap in days (1 year) */
const MATURITY_CAP_DAYS = 365;

/** Engagement rate benchmarks */
const ENGAGEMENT_BENCHMARKS = {
  low: 0.01,
  good: 0.05,
  great: 0.10,
  exceptional: 0.10,
} as const;

/** Badge definitions for each tier */
const TIER_BADGES: Record<CreatorTier, CreatorBadge> = {
  newcomer: { emoji: '\u{1F331}', label: 'Newcomer', tier: 'newcomer' },
  contributor: { emoji: '\u{2B50}', label: 'Contributor', tier: 'contributor' },
  creator: { emoji: '\u{1F52E}', label: 'Creator', tier: 'creator' },
  influencer: { emoji: '\u{1F48E}', label: 'Influencer', tier: 'influencer' },
  luminary: { emoji: '\u{1F451}', label: 'Luminary', tier: 'luminary' },
} as const;

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
 * Returns the number of days since the given ISO timestamp.
 * Always returns a non-negative value.
 */
function daysSince(isoTimestamp: string): number {
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  return Math.max(0, diff / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Sub-score calculations
// ---------------------------------------------------------------------------

/**
 * Consistency score (0-100).
 *
 * Optimal posting frequency is 1-3 posts/day (30-90 per 30 days).
 * Score drops for inactivity (< 1/week) or spam (> 5/day).
 *
 * @param postsLast30d - Number of posts in the last 30 days.
 */
function calcConsistency(postsLast30d: number): number {
  // Optimal range: 30-90 posts in 30 days
  if (postsLast30d >= OPTIMAL_POSTS_MIN && postsLast30d <= OPTIMAL_POSTS_MAX) {
    return 100;
  }

  // Below optimal but active
  if (postsLast30d >= INACTIVE_THRESHOLD && postsLast30d < OPTIMAL_POSTS_MIN) {
    return clamp100((postsLast30d / OPTIMAL_POSTS_MIN) * 80);
  }

  // Inactive: < 4 posts in 30 days
  if (postsLast30d < INACTIVE_THRESHOLD) {
    return clamp100((postsLast30d / INACTIVE_THRESHOLD) * 30);
  }

  // Above optimal but not spam
  if (postsLast30d > OPTIMAL_POSTS_MAX && postsLast30d <= SPAM_THRESHOLD) {
    const excess = postsLast30d - OPTIMAL_POSTS_MAX;
    const range = SPAM_THRESHOLD - OPTIMAL_POSTS_MAX;
    return clamp100(100 - (excess / range) * 50);
  }

  // Spam territory: > 150 posts in 30 days
  return 20;
}

/**
 * Engagement rate score (0-100).
 *
 * Calculates (total likes + comments + shares) / (total posts x avg followers).
 * Benchmarks: <1% = low, 1-5% = good, 5-10% = great, >10% = exceptional.
 *
 * @param data - Creator data with engagement metrics.
 */
function calcEngagementRate(data: CreatorData): number {
  const totalEngagement = data.total_likes + data.total_comments + data.total_shares;
  const divisor = Math.max(data.total_posts, 1) * Math.max(data.avg_follower_count, 1);
  const rate = totalEngagement / divisor;

  if (rate >= ENGAGEMENT_BENCHMARKS.exceptional) {
    return 100;
  }
  if (rate >= ENGAGEMENT_BENCHMARKS.good) {
    // 5-10% maps to 70-100
    const normalized = (rate - ENGAGEMENT_BENCHMARKS.good) /
      (ENGAGEMENT_BENCHMARKS.great - ENGAGEMENT_BENCHMARKS.good);
    return clamp100(70 + normalized * 30);
  }
  if (rate >= ENGAGEMENT_BENCHMARKS.low) {
    // 1-5% maps to 30-70
    const normalized = (rate - ENGAGEMENT_BENCHMARKS.low) /
      (ENGAGEMENT_BENCHMARKS.good - ENGAGEMENT_BENCHMARKS.low);
    return clamp100(30 + normalized * 40);
  }

  // < 1% maps to 0-30
  return clamp100((rate / ENGAGEMENT_BENCHMARKS.low) * 30);
}

/**
 * Follower quality score (0-100).
 *
 * Ratio of engaged followers (interacted in last 30d) to total followers.
 * A 50% engagement ratio is considered exceptional.
 *
 * @param data - Creator data with follower metrics.
 */
function calcFollowerQuality(data: CreatorData): number {
  if (data.total_followers <= 0) return 0;
  const ratio = data.engaged_followers_30d / data.total_followers;
  // 50% engaged = 100, linear scale
  return clamp100(ratio * 200);
}

/**
 * Content variety score (0-100).
 *
 * Uses multiple content types (text, image, video, reel) for diversity.
 * Score scales linearly with the number of types used.
 *
 * @param contentTypesUsed - Number of distinct content types used (1-4).
 */
function calcContentVariety(contentTypesUsed: number): number {
  return clamp100((contentTypesUsed / MAX_CONTENT_TYPES) * 100);
}

/**
 * Community participation score (0-100).
 *
 * Measures comments on others' posts and community contributions.
 * 20+ comments on others and 5+ contributions = perfect score.
 *
 * @param data - Creator data with community metrics.
 */
function calcCommunityParticipation(data: CreatorData): number {
  // Comments on others: up to 60 points (20 comments = max)
  const commentScore = clamp100((data.comments_on_others_30d / 20) * 100) * 0.6;

  // Community contributions: up to 40 points (5 contributions = max)
  const contributionScore = clamp100((data.community_contributions_30d / 5) * 100) * 0.4;

  return clamp100(commentScore + contributionScore);
}

/**
 * Account maturity score (0-100).
 *
 * Uses a logarithmic scale, capping at 1 year.
 * New accounts ramp up quickly but plateau after ~1 year.
 *
 * @param accountCreatedAt - ISO timestamp of account creation.
 */
function calcAccountMaturity(accountCreatedAt: string): number {
  const age = daysSince(accountCreatedAt);
  const cappedAge = Math.min(age, MATURITY_CAP_DAYS);
  // log(365) ~ 5.9, so we normalize by that
  if (cappedAge <= 0) return 0;
  return clamp100((Math.log(cappedAge) / Math.log(MATURITY_CAP_DAYS)) * 100);
}

/**
 * Violations deduction (0-100).
 *
 * Each violation deducts 20 points from the maximum.
 * 5+ violations = full deduction.
 *
 * @param violationsCount - Number of content filter violations.
 */
function calcViolationsDeduction(violationsCount: number): number {
  return clamp100(violationsCount * 20);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate the creator authority score.
 *
 * Computes a composite score (0-100) using weighted components:
 *   - Consistency: 25%
 *   - Engagement rate: 25%
 *   - Follower quality: 15%
 *   - Content variety: 10%
 *   - Community participation: 10%
 *   - Account maturity: 10%
 *   - Violations deduction: 5%
 *
 * @param creatorData - All metrics for the creator.
 * @returns A numeric authority score (0-100).
 */
export function calculateCreatorScore(creatorData: CreatorData): number {
  const consistency = calcConsistency(creatorData.posts_last_30d);
  const engagement = calcEngagementRate(creatorData);
  const quality = calcFollowerQuality(creatorData);
  const variety = calcContentVariety(creatorData.content_types_used);
  const community = calcCommunityParticipation(creatorData);
  const maturity = calcAccountMaturity(creatorData.account_created_at);
  const violations = calcViolationsDeduction(creatorData.violations_count);

  const score =
    consistency * 0.25 +
    engagement * 0.25 +
    quality * 0.15 +
    variety * 0.10 +
    community * 0.10 +
    maturity * 0.10 -
    violations * 0.05;

  return clamp100(score);
}

/**
 * Map a creator score to its tier label.
 *
 * Tiers:
 *   - 0-20:   'newcomer'
 *   - 21-40:  'contributor'
 *   - 41-60:  'creator'
 *   - 61-80:  'influencer'
 *   - 81-100: 'luminary'
 *
 * @param score - The creator score (0-100).
 * @returns The corresponding tier label.
 */
export function getCreatorTier(score: number): CreatorTier {
  if (score <= 20) return 'newcomer';
  if (score <= 40) return 'contributor';
  if (score <= 60) return 'creator';
  if (score <= 80) return 'influencer';
  return 'luminary';
}

/**
 * Get the badge (emoji + label) for a creator tier.
 *
 * Badges:
 *   - newcomer:    Seedling Newcomer
 *   - contributor: Star Contributor
 *   - creator:     Crystal Ball Creator
 *   - influencer:  Gem Stone Influencer
 *   - luminary:    Crown Luminary
 *
 * @param tier - The creator tier.
 * @returns Badge object with emoji, label, and tier.
 */
export function getCreatorBadge(tier: CreatorTier): CreatorBadge {
  return TIER_BADGES[tier];
}

/**
 * Calculate the score trend between two measurements.
 *
 * - Rising:    current > previous by more than 5 points
 * - Declining: current < previous by more than 5 points
 * - Stable:    within +/- 5 points
 *
 * @param currentScore  - The current creator score.
 * @param previousScore - The previous creator score.
 * @returns The trend direction.
 */
export function calculateTrend(currentScore: number, previousScore: number): ScoreTrend {
  const diff = currentScore - previousScore;
  if (diff > 5) return 'rising';
  if (diff < -5) return 'declining';
  return 'stable';
}

/**
 * Get the top 3 actionable improvement tips based on the creator's data.
 *
 * Analyzes which components are weakest and returns specific,
 * actionable suggestions to improve the overall score.
 *
 * @param creatorData - All metrics for the creator.
 * @returns Array of up to 3 improvement tip strings.
 */
export function getImprovementTips(creatorData: CreatorData): string[] {
  const scores: Array<{ component: string; score: number; tip: string }> = [
    {
      component: 'consistency',
      score: calcConsistency(creatorData.posts_last_30d),
      tip: creatorData.posts_last_30d < OPTIMAL_POSTS_MIN
        ? 'Post more regularly — aim for 1-3 posts per day to build momentum with your audience.'
        : 'Reduce posting frequency slightly — quality over quantity keeps engagement high.',
    },
    {
      component: 'engagement',
      score: calcEngagementRate(creatorData),
      tip: 'Boost engagement by asking questions in captions, responding to comments, and posting during peak hours (7-9AM, 12-2PM, 7-10PM).',
    },
    {
      component: 'followerQuality',
      score: calcFollowerQuality(creatorData),
      tip: 'Improve follower quality by engaging with your audience directly — reply to comments and create interactive content like polls.',
    },
    {
      component: 'contentVariety',
      score: calcContentVariety(creatorData.content_types_used),
      tip: 'Diversify your content — try mixing videos, images, text posts, and reels to reach different audience preferences.',
    },
    {
      component: 'community',
      score: calcCommunityParticipation(creatorData),
      tip: 'Be more active in the community — comment on others\' posts and contribute to group discussions to build your network.',
    },
    {
      component: 'maturity',
      score: calcAccountMaturity(creatorData.account_created_at),
      tip: 'Keep building your presence — account authority grows naturally over time with consistent activity.',
    },
  ];

  // Sort by score ascending (weakest first) and return top 3 tips
  scores.sort((a, b) => a.score - b.score);
  return scores.slice(0, 3).map((s) => s.tip);
}

/**
 * Get a full breakdown of all score components.
 *
 * Useful for debugging or displaying a detailed score card.
 *
 * @param creatorData - All metrics for the creator.
 * @returns Object with each component score and the total.
 */
export function getScoreBreakdown(creatorData: CreatorData): ScoreBreakdown {
  const consistency = calcConsistency(creatorData.posts_last_30d);
  const engagementRate = calcEngagementRate(creatorData);
  const followerQuality = calcFollowerQuality(creatorData);
  const contentVariety = calcContentVariety(creatorData.content_types_used);
  const communityParticipation = calcCommunityParticipation(creatorData);
  const accountMaturity = calcAccountMaturity(creatorData.account_created_at);
  const violationsDeduction = calcViolationsDeduction(creatorData.violations_count);

  return {
    consistency,
    engagementRate,
    followerQuality,
    contentVariety,
    communityParticipation,
    accountMaturity,
    violationsDeduction,
    total: calculateCreatorScore(creatorData),
  };
}
