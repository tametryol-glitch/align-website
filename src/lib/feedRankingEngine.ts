/**
 * Feed Ranking Engine
 *
 * Pure function module for ranking feed posts and reels. No side
 * effects, no imports from stores, no UI dependencies.
 *
 * ---------------------------------------------------------------------------
 * Why this was rewritten (2026-08-20)
 * ---------------------------------------------------------------------------
 * The previous post algorithm let a single post camp the top of the feed
 * forever. Three compounding causes:
 *
 *   1. Engagement was scored as a share of the batch leader, and the
 *      normalizer cancelled out algebraically — `engagementScore` reduced to
 *      `raw * 100 / maxEngagement`. The most-engaged post therefore scored a
 *      flat 100 on a 40-point axis in perpetuity, AND it was the denominator
 *      for everybody else, so the more it accumulated the further it pushed
 *      every other post down. Textbook rich-get-richer.
 *   2. Recency capped at 35 points, below the leader's 40-point engagement
 *      floor, so no amount of freshness could ever overtake it. Measured: the
 *      stuck post was still winning at 60 days.
 *   3. Nothing recorded what a user had already been shown, so the ranker had
 *      no way to know you had scrolled past the same post forty times.
 *
 * The replacement borrows the practices the large platforms actually use:
 *
 *   - ENGAGEMENT IS A VELOCITY, NOT A TOTAL. Raw engagement is compressed
 *     logarithmically (10x the reactions is roughly +1 rank unit, not 10x)
 *     and then divided by an age gravity term, the way Hacker News and
 *     Reddit's "hot" ranking do. Lifetime totals stop being an advantage.
 *   - SEEN CONTENT IS DEMOTED. Every impression multiplies a post's score
 *     down for that specific user. This is the mechanism behind Instagram's
 *     "You're All Caught Up" and is what structurally prevents ANY post from
 *     holding a slot, not just the current offender.
 *   - UNDER-EXPOSED POSTS GET AN EXPLORATION BOOST. New posts are guaranteed
 *     a shot at the top before engagement decides their fate (TikTok's
 *     initial traffic pool). Gated to recent posts so it can't resurrect
 *     ancient content nobody happened to see.
 *   - AUTHOR DIVERSITY IS A CONSTRAINT, NOT A BONUS. The old diversity bonus
 *     was assigned by pre-sort index and then the array was re-sorted by
 *     score, which destroyed the very slotting it was meant to create. It is
 *     now a hard post-sort rule: at most N posts per author per page and a
 *     minimum gap between them.
 *
 * ---------------------------------------------------------------------------
 * Algorithm
 * ---------------------------------------------------------------------------
 *   BASE  = engagement*0.40 + recency*0.28 + social*0.17 + exploration*0.15
 *   SCORE = BASE * seenMultiplier
 *   then  author-diversity spread pass
 *
 *   REEL SCORE = (engagementVelocity * 0.5) + (recency * 0.3)
 *              + (creatorScore * 0.2)
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
  /**
   * How many times THIS user has already been shown this post.
   * Drives the seen-penalty. Absent/0 means never seen.
   */
  seen_count?: number;
  /**
   * How many times this post has been shown to ANYONE. Drives the
   * exploration boost for under-exposed content. Absent means unknown,
   * which is treated as zero so brand-new posts still get their boost.
   */
  impressions_count?: number;
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

export interface RankFeedOptions {
  /** post_id -> number of times the current user has been shown it. */
  seenCounts?: Record<string, number>;
  /** Maximum posts by a single author in one ranked page. Default 3. */
  maxPerAuthor?: number;
  /** Minimum number of slots between two posts by the same author. Default 2. */
  minAuthorGap?: number;
  /**
   * Set false to skip the seen-penalty (e.g. a profile timeline, where the
   * whole point is to show one author's posts in order).
   */
  applySeenPenalty?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Post time-decay constant for the recency term. Half-life ~17 hours. */
const POST_DECAY = 0.04;

/** Reel time-decay constant. Half-life ~12 hours. */
const REEL_DECAY = 0.06;

/**
 * Age gravity for the engagement velocity term.
 * velocity = log10(1 + raw) / (ageHours + GRAVITY_OFFSET) ^ GRAVITY
 * Higher GRAVITY punishes age harder. 1.2 keeps a genuinely hot day-old post
 * competitive while making a week-old post effectively inert.
 */
const GRAVITY = 1.2;
const GRAVITY_OFFSET = 2;

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

/** Composite weights. Must sum to 1. */
const W_ENGAGEMENT = 0.40;
const W_RECENCY = 0.28;
const W_SOCIAL = 0.17;
const W_EXPLORATION = 0.15;

/**
 * Seen-penalty. Each impression multiplies the score by SEEN_DECAY, down to
 * SEEN_FLOOR. 1 view -> 0.55x, 2 -> 0.30x, 3 -> 0.17x, 4+ -> floor.
 * A post you have already seen four times is effectively out of contention
 * unless nothing else exists, which is exactly the intent.
 */
const SEEN_DECAY = 0.55;
const SEEN_FLOOR = 0.08;

/**
 * Exploration. A post is considered "adequately exposed" once it has been
 * shown EXPLORE_TARGET times, at which point the boost reaches zero. The
 * boost only applies to posts younger than EXPLORE_MAX_AGE_HOURS, so it acts
 * as a guaranteed initial audience rather than a way for old unseen posts to
 * climb back up.
 */
const EXPLORE_TARGET = 50;
const EXPLORE_MAX_AGE_HOURS = 72;

/** Author diversity defaults. */
const DEFAULT_MAX_PER_AUTHOR = 3;
const DEFAULT_MIN_AUTHOR_GAP = 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the number of hours between `isoTimestamp` and now.
 * Always returns a non-negative value. Unparseable timestamps are treated as
 * very old rather than as NaN, so one bad row cannot poison the batch max.
 */
function hoursAgo(isoTimestamp: string): number {
  const then = new Date(isoTimestamp).getTime();
  if (!isFinite(then)) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, (Date.now() - then) / (1000 * 60 * 60));
}

/**
 * Clamp a value into the [0, 100] range. NaN collapses to 0.
 */
function clamp100(value: number): number {
  if (!isFinite(value)) return 0;
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
    (post.likes_count || 0) * POST_ENGAGEMENT_WEIGHTS.likes +
    (post.comments_count || 0) * POST_ENGAGEMENT_WEIGHTS.comments +
    (post.reactions_count || 0) * POST_ENGAGEMENT_WEIGHTS.reactions +
    (post.reposts_count || 0) * POST_ENGAGEMENT_WEIGHTS.reposts
  );
}

/**
 * Engagement velocity — log-compressed engagement over an age gravity term.
 *
 * The log compression is what stops a runaway post from dwarfing everything
 * else: going from 10 to 100 weighted engagement adds the same amount as
 * going from 100 to 1000. The gravity divisor is what stops lifetime totals
 * from being an advantage: the same engagement is worth far less once it has
 * had a week to accumulate.
 *
 * Returned unnormalized — `rankFeedPosts` scales it against the batch max.
 */
export function postEngagementVelocity(post: RankablePost): number {
  const raw = rawPostEngagement(post);
  if (raw <= 0) return 0;
  const age = hoursAgo(post.created_at);
  const gravity = Math.pow(age + GRAVITY_OFFSET, GRAVITY);
  const velocity = Math.log10(1 + raw) / gravity;
  return isFinite(velocity) ? velocity : 0;
}

/**
 * Recency score (0-100).
 *
 * Uses exponential time-decay: `100 * e^(-decay * hoursAge)`.
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
 * Exploration score (0-100) — a guaranteed shot at visibility for posts that
 * have barely been shown to anyone yet.
 *
 * Decays logarithmically with total impressions and is gated to posts younger
 * than EXPLORE_MAX_AGE_HOURS. A post nobody has seen scores 100; one that has
 * been shown EXPLORE_TARGET times scores 0.
 */
function explorationScore(post: RankablePost): number {
  if (hoursAgo(post.created_at) > EXPLORE_MAX_AGE_HOURS) return 0;
  const impressions = Math.max(0, post.impressions_count || 0);
  const ratio = Math.log10(1 + impressions) / Math.log10(1 + EXPLORE_TARGET);
  return clamp100(100 * (1 - ratio));
}

/**
 * Per-user seen multiplier in (0, 1]. Never seen -> 1 (no penalty).
 */
export function seenMultiplier(seenCount: number): number {
  const seen = Math.max(0, Math.floor(seenCount || 0));
  if (seen === 0) return 1;
  return Math.max(SEEN_FLOOR, Math.pow(SEEN_DECAY, seen));
}

/**
 * Calculate the composite score for a single post.
 *
 * @param post          - The post to score.
 * @param maxVelocity   - Highest engagement velocity in the batch, used to
 *                        normalize the engagement axis to 0-100.
 * @param seenCount     - Times the current user has already been shown it.
 * @param withSeen      - Whether to apply the seen penalty at all.
 */
function computePostScore(
  post: RankablePost,
  maxVelocity: number,
  seenCount: number,
  withSeen: boolean,
): number {
  const velocity = postEngagementVelocity(post);
  const engagement = maxVelocity > 0 ? clamp100((velocity / maxVelocity) * 100) : 0;
  const recency = recencyScore(post.created_at, POST_DECAY);
  const social = socialScore(post);
  const exploration = explorationScore(post);

  const base =
    engagement * W_ENGAGEMENT +
    recency * W_RECENCY +
    social * W_SOCIAL +
    exploration * W_EXPLORATION;

  return withSeen ? base * seenMultiplier(seenCount) : base;
}

/**
 * Author diversity, applied as a hard constraint AFTER scoring.
 *
 * Walks the score-ordered list and places the highest-scoring post that does
 * not violate the minimum author gap. Posts beyond `maxPerAuthor` are pushed
 * to the tail of the page rather than dropped, so nothing ever disappears —
 * it just stops monopolising the top.
 *
 * O(n^2) in the page size, which is fine for the 30-post pages the feed
 * fetches and keeps the placement logic obvious.
 */
export function applyAuthorDiversity(
  sorted: RankablePost[],
  maxPerAuthor: number = DEFAULT_MAX_PER_AUTHOR,
  minAuthorGap: number = DEFAULT_MIN_AUTHOR_GAP,
): RankablePost[] {
  if (sorted.length <= 1) return sorted;

  const queue = [...sorted];
  const out: RankablePost[] = [];
  const overflow: RankablePost[] = [];
  const perAuthor = new Map<string, number>();

  const gapViolated = (userId: string): boolean => {
    const from = Math.max(0, out.length - minAuthorGap);
    for (let i = from; i < out.length; i++) {
      if (out[i].user_id === userId) return true;
    }
    return false;
  };

  while (queue.length > 0) {
    // Prefer the best-scoring post that respects the author gap. If every
    // remaining post violates it (e.g. one author wrote everything left),
    // fall back to the best available so we never stall.
    let idx = queue.findIndex((p) => !gapViolated(p.user_id));
    if (idx === -1) idx = 0;

    const [post] = queue.splice(idx, 1);
    const used = perAuthor.get(post.user_id) || 0;

    if (used >= maxPerAuthor) {
      overflow.push(post);
      continue;
    }

    perAuthor.set(post.user_id, used + 1);
    out.push(post);
  }

  return [...out, ...overflow];
}

// ---------------------------------------------------------------------------
// Public API — Posts
// ---------------------------------------------------------------------------

/**
 * Calculate the score for a single post in isolation.
 *
 * Useful for debugging or score badges. Because it operates on one post it
 * cannot compute batch-relative engagement normalization, so the engagement
 * axis is always 100 for a post with any engagement at all. Use
 * `rankFeedPosts` for anything that affects ordering.
 */
export function calculatePostScore(
  post: RankablePost,
  _currentUserId: string,
): number {
  const velocity = postEngagementVelocity(post);
  return computePostScore(post, velocity, post.seen_count || 0, true);
}

/**
 * Rank an array of posts.
 *
 *   BASE  = engagement*0.40 + recency*0.28 + social*0.17 + exploration*0.15
 *   SCORE = BASE * seenMultiplier(seenCount)
 *   then  author-diversity spread pass
 *
 * Each returned post has `_score` set so callers can inspect the decision.
 *
 * @param posts         - Posts with engagement data already attached.
 * @param currentUserId - The current user's ID.
 * @param options       - Seen counts and diversity limits.
 * @returns A new array in display order.
 */
export function rankFeedPosts(
  posts: RankablePost[],
  currentUserId: string,
  options: RankFeedOptions = {},
): RankablePost[] {
  if (posts.length === 0) return [];

  const {
    seenCounts = {},
    maxPerAuthor = DEFAULT_MAX_PER_AUTHOR,
    minAuthorGap = DEFAULT_MIN_AUTHOR_GAP,
    applySeenPenalty = true,
  } = options;

  // 1. Batch-wide max velocity, used to normalize the engagement axis.
  const maxVelocity = posts.reduce(
    (max, p) => Math.max(max, postEngagementVelocity(p)),
    0,
  );

  // 2. Score every post. A post authored by the current user is never
  //    seen-penalised into oblivion by their own re-reads of it.
  const scored = posts.map((post) => {
    const seen = post.seen_count ?? seenCounts[post.id] ?? 0;
    const withSeen = applySeenPenalty && post.user_id !== currentUserId;
    return {
      ...post,
      seen_count: seen,
      _score: computePostScore(post, maxVelocity, seen, withSeen),
    };
  });

  // 3. Sort by score, then by recency as a deterministic tiebreak so equal
  //    scores do not shuffle between renders.
  scored.sort((a, b) => {
    const diff = (b._score ?? 0) - (a._score ?? 0);
    if (diff !== 0) return diff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 4. Author diversity as a hard constraint on the final order.
  return applyAuthorDiversity(scored, maxPerAuthor, minAuthorGap);
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
