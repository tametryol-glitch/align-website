/**
 * Feed Ranking Engine
 *
 * Pure function module for ranking feed posts and reels using an
 * engagement-weighted algorithm. No side effects, no imports from
 * stores, no UI dependencies.
 *
 * Algorithm overview:
 *
 * POST SCORE = (engagementScore * 0.4) + (recencyScore * 0.35)
 *            + (socialScore * 0.15) + (diversityBonus * 0.1)
 *
 * REEL SCORE = (engagementVelocity * 0.5) + (recency * 0.3)
 *            + (creatorScore * 0.2)
 *
 * All sub-scores are normalized to the 0-100 range before weighting.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RankablePost {
  id: string;
  user_id: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  reactions_count: number;
  reposts_count: number;
  visibility: string;
  /** Provided by the caller when available */
  is_friend?: boolean;
  /** Provided by the caller when available */
  is_following?: boolean;
  /** True when a friend of the current user has engaged with this post */
  friend_engaged?: boolean;
  /** Populated by the ranking engine so callers can inspect/debug scores */
  _score?: number;
}

export interface RankableReel {
  id: string;
  creator_id: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  shares_count: number;
  views_count: number;
  creator_verified?: boolean;
  creator_follower_count?: number;
  /** Populated by the ranking engine so callers can inspect/debug scores */
  _score?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Post time-decay constant. Half-life ~17 hours. */
const POST_DECAY = 0.04;

/** Reel time-decay constant. Half-life ~12 hours. */
const REEL_DECAY = 0.06;

/** Weight multipliers for each engagement type on posts. */
const POST_ENGAGEMENT_WEIGHTS = {
  likes: 2,
  comments: 3,
  reactions: 1.5,
  reposts: 4,
} as const;

/** Weight multipliers for each engagement type on reels. */
const REEL_ENGAGEMENT_WEIGHTS = {
  likes: 1,
  comments: 2,
  saves: 3,
  shares: 4,
} as const;

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

// ---------------------------------------------------------------------------
// Post scoring
// ---------------------------------------------------------------------------

/**
 * Compute the raw engagement total for a single post, using the
 * weighted formula:
 *   likes*2 + comments*3 + reactions*1.5 + reposts*4
 */
function rawPostEngagement(post: RankablePost): number {
  return (
    post.likes_count * POST_ENGAGEMENT_WEIGHTS.likes +
    post.comments_count * POST_ENGAGEMENT_WEIGHTS.comments +
    post.reactions_count * POST_ENGAGEMENT_WEIGHTS.reactions +
    post.reposts_count * POST_ENGAGEMENT_WEIGHTS.reposts
  );
}

/**
 * Engagement score (0-100).
 *
 * Normalized by dividing by `(1 + log10(maxEngagement))` to prevent
 * runaway scores when one post has vastly more engagement than the rest.
 *
 * @param raw           - The raw engagement total for this post.
 * @param maxEngagement - The highest raw engagement in the current batch.
 */
function engagementScore(raw: number, maxEngagement: number): number {
  if (maxEngagement <= 0) return 0;
  const normalizer = 1 + Math.log10(Math.max(1, maxEngagement));
  return clamp100((raw / normalizer) * (100 / (maxEngagement / normalizer)));
}

/**
 * Recency score (0-100).
 *
 * Uses exponential time-decay: `100 * e^(-decay * hoursAge)`.
 *
 * @param createdAt - ISO timestamp of the post.
 * @param decay     - Decay constant (default: POST_DECAY for ~17h half-life).
 */
function recencyScore(createdAt: string, decay: number = POST_DECAY): number {
  const age = hoursAgo(createdAt);
  return clamp100(100 * Math.exp(-decay * age));
}

/**
 * Social score (0-100).
 *
 * - Post is by a friend: +50
 * - Post is by someone the user follows: +30
 * - Post has engagement from friends: +20
 */
function socialScore(post: RankablePost): number {
  let score = 0;
  if (post.is_friend) score += 50;
  if (post.is_following) score += 30;
  if (post.friend_engaged) score += 20;
  return clamp100(score);
}

/**
 * Calculate the composite score for a single post.
 *
 * SCORE = (engagement * 0.4) + (recency * 0.35)
 *       + (social * 0.15) + (diversityBonus * 0.1)
 *
 * Note: diversityBonus is applied at the batch level in `rankFeedPosts`,
 * so this function always receives it as a parameter (defaults to 0).
 *
 * @param post             - The post to score.
 * @param _currentUserId   - The current user's ID (reserved for future use).
 * @param maxEngagement    - Highest raw engagement in the batch.
 * @param diversityBonus   - Diversity bonus assigned at the batch level.
 */
function computePostScore(
  post: RankablePost,
  _currentUserId: string,
  maxEngagement: number,
  diversityBonus: number = 0,
): number {
  const raw = rawPostEngagement(post);
  const engagement = engagementScore(raw, maxEngagement);
  const recency = recencyScore(post.created_at, POST_DECAY);
  const social = socialScore(post);
  const diversity = clamp100(diversityBonus);

  return engagement * 0.4 + recency * 0.35 + social * 0.15 + diversity * 0.1;
}

// ---------------------------------------------------------------------------
// Public API — Posts
// ---------------------------------------------------------------------------

/**
 * Calculate the engagement score for a single post.
 *
 * Useful for debugging or displaying score badges. Because this function
 * operates on a single post it cannot compute the batch-relative engagement
 * normalization — it uses the post's own raw engagement as the max.
 *
 * @param post          - The post to score.
 * @param currentUserId - The current user's ID.
 * @returns A numeric score (higher = more relevant).
 */
export function calculatePostScore(
  post: RankablePost,
  currentUserId: string,
): number {
  const raw = rawPostEngagement(post);
  return computePostScore(post, currentUserId, raw, 0);
}

/**
 * Rank an array of posts using the blended engagement-weighted algorithm.
 *
 * Algorithm:
 *   SCORE = (engagementScore * 0.4) + (recencyScore * 0.35)
 *         + (socialScore * 0.15) + (diversityBonus * 0.1)
 *
 * Diversity logic:
 *   - Every 3rd slot, boost a post from someone who hasn't appeared
 *     consecutively: +40
 *   - Sprinkle in public posts from non-connections: +20
 *
 * Each returned post has its `_score` property set so callers can
 * inspect the ranking decision.
 *
 * @param posts         - Posts with engagement data already attached.
 * @param currentUserId - The current user's ID.
 * @returns A new array sorted by descending score.
 */
export function rankFeedPosts(
  posts: RankablePost[],
  currentUserId: string,
): RankablePost[] {
  if (posts.length === 0) return [];

  // 1. Compute the batch-wide max raw engagement for normalization.
  const maxEngagement = posts.reduce(
    (max, p) => Math.max(max, rawPostEngagement(p)),
    0,
  );

  // 2. Score every post without diversity bonus first.
  const scored = posts.map((post) => ({
    post,
    baseScore: computePostScore(post, currentUserId, maxEngagement, 0),
  }));

  // 3. Sort by base score descending to get a preliminary order.
  scored.sort((a, b) => b.baseScore - a.baseScore);

  // 4. Apply diversity bonuses in a second pass.
  const result: RankablePost[] = [];
  const recentAuthors: string[] = [];

  for (let i = 0; i < scored.length; i++) {
    const { post, baseScore } = scored[i];
    let diversityBonus = 0;

    // Every 3rd slot, boost a post from someone new.
    if ((i + 1) % 3 === 0 && !recentAuthors.includes(post.user_id)) {
      diversityBonus += 40;
    }

    // Sprinkle in public posts from non-connections.
    if (
      post.visibility === 'public' &&
      !post.is_friend &&
      !post.is_following &&
      post.user_id !== currentUserId
    ) {
      diversityBonus += 20;
    }

    const finalScore =
      computePostScore(post, currentUserId, maxEngagement, diversityBonus);

    result.push({ ...post, _score: finalScore });
    recentAuthors.push(post.user_id);

    // Keep the recent-authors window to the last 2 entries so "consecutive"
    // means the immediately preceding posts.
    if (recentAuthors.length > 2) {
      recentAuthors.shift();
    }
  }

  // 5. Re-sort by final score (diversity bonuses may have shifted order).
  result.sort((a, b) => (b._score ?? 0) - (a._score ?? 0));

  return result;
}

// ---------------------------------------------------------------------------
// Reel scoring
// ---------------------------------------------------------------------------

/**
 * Compute engagement velocity for a reel.
 *
 * Formula: (likes + comments*2 + saves*3 + shares*4) / hoursAge
 *
 * This rewards FAST engagement, not just total.
 */
function reelEngagementVelocity(reel: RankableReel): number {
  const rawEngagement =
    reel.likes_count * REEL_ENGAGEMENT_WEIGHTS.likes +
    reel.comments_count * REEL_ENGAGEMENT_WEIGHTS.comments +
    reel.saves_count * REEL_ENGAGEMENT_WEIGHTS.saves +
    reel.shares_count * REEL_ENGAGEMENT_WEIGHTS.shares;

  const age = Math.max(hoursAgo(reel.created_at), 0.1); // avoid division by zero
  return rawEngagement / age;
}

/**
 * Creator score (0-100).
 *
 * - photo_verified: +20
 * - follower_count (log-scaled): up to +40
 * - engagement_rate (avg likes per reel): up to +40
 *
 * Since we only have per-reel data, engagement_rate is approximated
 * as likes / max(views, 1).
 */
function creatorScore(reel: RankableReel): number {
  let score = 0;

  // Verification bonus
  if (reel.creator_verified) {
    score += 20;
  }

  // Follower count (log-scaled, 0-40)
  const followers = reel.creator_follower_count ?? 0;
  if (followers > 0) {
    // log10(1000) = 3, log10(1_000_000) = 6 — scale so 1M followers = 40
    score += clamp100(Math.log10(followers) * (40 / 6)) * (40 / 100);
  }

  // Engagement rate: likes / views, scaled 0-40
  const views = Math.max(reel.views_count, 1);
  const engagementRate = reel.likes_count / views;
  // A 10% engagement rate is excellent — map it to 40
  score += clamp100(engagementRate * 1000) * (40 / 100);

  return clamp100(score);
}

// ---------------------------------------------------------------------------
// Public API — Reels
// ---------------------------------------------------------------------------

/**
 * Rank an array of reels using the engagement-velocity algorithm.
 *
 * Algorithm:
 *   REEL_SCORE = (engagementVelocity * 0.5) + (recency * 0.3)
 *              + (creatorScore * 0.2)
 *
 * Each returned reel has its `_score` property set for debugging.
 *
 * @param reels - Reels with engagement data already attached.
 * @returns A new array sorted by descending score.
 */
export function rankReels(reels: RankableReel[]): RankableReel[] {
  if (reels.length === 0) return [];

  // 1. Compute velocity for every reel so we can normalize.
  const velocities = reels.map((r) => reelEngagementVelocity(r));
  const maxVelocity = Math.max(...velocities);

  // 2. Score each reel.
  const scored: Array<{ reel: RankableReel; score: number }> = reels.map(
    (reel, i) => {
      const velocityNormalized =
        maxVelocity > 0
          ? clamp100((velocities[i] / maxVelocity) * 100)
          : 0;

      const recency = recencyScore(reel.created_at, REEL_DECAY);
      const creator = creatorScore(reel);

      const score =
        velocityNormalized * 0.5 + recency * 0.3 + creator * 0.2;

      return { reel, score };
    },
  );

  // 3. Sort descending and attach _score.
  scored.sort((a, b) => b.score - a.score);

  return scored.map(({ reel, score }) => ({ ...reel, _score: score }));
}
