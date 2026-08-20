import { describe, it, expect } from 'vitest';
import {
  rankFeedPosts,
  applyAuthorDiversity,
  seenMultiplier,
  postEngagementVelocity,
  type RankablePost,
} from '../feedRankingEngine';

const HOUR = 60 * 60 * 1000;

function hoursOld(h: number): string {
  return new Date(Date.now() - h * HOUR).toISOString();
}

function post(overrides: Partial<RankablePost> & { id: string }): RankablePost {
  return {
    user_id: `author-${overrides.id}`,
    created_at: hoursOld(1),
    likes_count: 0,
    comments_count: 0,
    reactions_count: 0,
    reposts_count: 0,
    visibility: 'public',
    ...overrides,
  };
}

const ME = 'me';

describe('the stuck-post regression', () => {
  /**
   * The exact reported symptom: one heavily-engaged post that never rotated
   * off the top of the cosmic feed. Under the old algorithm it was still
   * ranked first at 60 days old.
   */
  it('does not let an old high-engagement post outrank fresh posts', () => {
    const posts = [
      post({ id: 'sticky', created_at: hoursOld(24 * 10), reactions_count: 200, comments_count: 60 }),
      post({ id: 'fresh-a', created_at: hoursOld(1), reactions_count: 3 }),
      post({ id: 'fresh-b', created_at: hoursOld(2), reactions_count: 1 }),
      post({ id: 'fresh-c', created_at: hoursOld(4) }),
    ];

    const ranked = rankFeedPosts(posts, ME);
    expect(ranked[0].id).not.toBe('sticky');
    expect(ranked[ranked.length - 1].id).toBe('sticky');
  });

  it('still ranks a post that is hot RIGHT NOW at the top', () => {
    const posts = [
      post({ id: 'hot', created_at: hoursOld(2), reactions_count: 40, comments_count: 12 }),
      post({ id: 'quiet-newer', created_at: hoursOld(1) }),
      post({ id: 'old-big', created_at: hoursOld(24 * 7), reactions_count: 300 }),
    ];
    expect(rankFeedPosts(posts, ME)[0].id).toBe('hot');
  });

  it('scores engagement as a velocity, so age erodes a lifetime total', () => {
    const young = post({ id: 'y', created_at: hoursOld(2), reactions_count: 20 });
    const old = post({ id: 'o', created_at: hoursOld(24 * 10), reactions_count: 20 });
    expect(postEngagementVelocity(young)).toBeGreaterThan(postEngagementVelocity(old) * 10);
  });

  it('compresses engagement logarithmically instead of linearly', () => {
    // 100x the engagement must NOT buy 100x the velocity — that linear
    // relationship is what let one post dominate the normalizer.
    const small = post({ id: 's', reactions_count: 2 });
    const huge = post({ id: 'h', reactions_count: 200 });
    const ratio = postEngagementVelocity(huge) / postEngagementVelocity(small);
    expect(ratio).toBeLessThan(6);
    expect(ratio).toBeGreaterThan(1);
  });

  it('does not let one post suppress the engagement axis for everyone else', () => {
    // Under the old code the batch leader was the denominator, so adding a
    // runaway post dragged every other post's engagement score toward zero.
    const others = [
      post({ id: 'a', reactions_count: 10 }),
      post({ id: 'b', reactions_count: 8 }),
    ];
    const withoutWhale = rankFeedPosts(others, ME);
    const withWhale = rankFeedPosts(
      [...others, post({ id: 'whale', created_at: hoursOld(24 * 14), reactions_count: 5000 })],
      ME,
    );
    const aBefore = withoutWhale.find((p) => p.id === 'a')!._score!;
    const aAfter = withWhale.find((p) => p.id === 'a')!._score!;
    expect(aAfter).toBeGreaterThan(aBefore * 0.9);
  });
});

describe('seen-state damping', () => {
  it('never penalises an unseen post', () => {
    expect(seenMultiplier(0)).toBe(1);
  });

  it('demotes further with each impression, then floors', () => {
    const m1 = seenMultiplier(1);
    const m2 = seenMultiplier(2);
    const m3 = seenMultiplier(3);
    expect(m1).toBeLessThan(1);
    expect(m2).toBeLessThan(m1);
    expect(m3).toBeLessThan(m2);
    expect(seenMultiplier(50)).toBeGreaterThan(0);
    expect(seenMultiplier(50)).toBe(seenMultiplier(100));
  });

  it('pushes a repeatedly-seen post below an unseen one', () => {
    const posts = [
      post({ id: 'seen', created_at: hoursOld(3), reactions_count: 30, seen_count: 5 }),
      post({ id: 'unseen', created_at: hoursOld(6), reactions_count: 2 }),
    ];
    expect(rankFeedPosts(posts, ME)[0].id).toBe('unseen');
  });

  it('accepts seen counts via the options map', () => {
    const posts = [
      post({ id: 'seen', created_at: hoursOld(3), reactions_count: 30 }),
      post({ id: 'unseen', created_at: hoursOld(6), reactions_count: 2 }),
    ];
    const ranked = rankFeedPosts(posts, ME, { seenCounts: { seen: 5 } });
    expect(ranked[0].id).toBe('unseen');
  });

  it('does not seen-penalise the viewer\'s own post', () => {
    const posts = [
      post({ id: 'mine', user_id: ME, created_at: hoursOld(1), reactions_count: 10, seen_count: 9 }),
      post({ id: 'theirs', created_at: hoursOld(1), reactions_count: 10, seen_count: 9 }),
    ];
    const ranked = rankFeedPosts(posts, ME);
    expect(ranked[0].id).toBe('mine');
  });

  it('can be switched off entirely', () => {
    const posts = [
      post({ id: 'seen', created_at: hoursOld(1), reactions_count: 50, seen_count: 8 }),
      post({ id: 'unseen', created_at: hoursOld(1) }),
    ];
    expect(rankFeedPosts(posts, ME, { applySeenPenalty: false })[0].id).toBe('seen');
  });
});

describe('exploration slots', () => {
  it('lifts a brand-new zero-engagement post above an older seen one', () => {
    const posts = [
      post({ id: 'established', created_at: hoursOld(30), reactions_count: 25, impressions_count: 400, seen_count: 2 }),
      post({ id: 'brand-new', created_at: hoursOld(1), impressions_count: 0 }),
    ];
    expect(rankFeedPosts(posts, ME)[0].id).toBe('brand-new');
  });

  it('gives no exploration boost to posts past the freshness window', () => {
    const posts = [
      post({ id: 'old-unseen', created_at: hoursOld(24 * 30), impressions_count: 0 }),
      post({ id: 'recent', created_at: hoursOld(20), impressions_count: 300 }),
    ];
    expect(rankFeedPosts(posts, ME)[0].id).toBe('recent');
  });

  it('fades the boost as a post accumulates impressions', () => {
    const base = { created_at: hoursOld(2), reactions_count: 5 };
    const [unexposed] = rankFeedPosts([post({ id: 'x', ...base, impressions_count: 0 })], ME);
    const [exposed] = rankFeedPosts([post({ id: 'x', ...base, impressions_count: 500 })], ME);
    expect(unexposed._score!).toBeGreaterThan(exposed._score!);
  });
});

describe('author diversity', () => {
  it('never places two posts by the same author back to back', () => {
    const posts = [
      ...Array.from({ length: 5 }, (_, i) =>
        post({ id: `spam-${i}`, user_id: 'loud', created_at: hoursOld(i + 1), reactions_count: 50 })),
      post({ id: 'other-1', user_id: 'quiet-1', created_at: hoursOld(2) }),
      post({ id: 'other-2', user_id: 'quiet-2', created_at: hoursOld(3) }),
      post({ id: 'other-3', user_id: 'quiet-3', created_at: hoursOld(4) }),
    ];
    const ranked = rankFeedPosts(posts, ME);
    for (let i = 1; i < ranked.length; i++) {
      if (ranked[i].user_id === 'loud' && ranked[i - 1].user_id === 'loud') {
        // Only tolerated once the diverse pool is exhausted and we are in the
        // overflow tail.
        expect(i).toBeGreaterThanOrEqual(6);
      }
    }
  });

  it('caps how many posts one author holds in the main run', () => {
    const posts = Array.from({ length: 8 }, (_, i) =>
      post({ id: `p-${i}`, user_id: i < 6 ? 'loud' : `other-${i}`, created_at: hoursOld(i + 1) }));
    const ranked = applyAuthorDiversity(posts, 3, 2);
    const firstFive = ranked.slice(0, 5).filter((p) => p.user_id === 'loud');
    expect(firstFive.length).toBeLessThanOrEqual(3);
  });

  it('defers rather than drops — every post survives ranking', () => {
    const posts = Array.from({ length: 12 }, (_, i) =>
      post({ id: `p-${i}`, user_id: i % 2 === 0 ? 'a' : 'b', created_at: hoursOld(i + 1) }));
    const ranked = rankFeedPosts(posts, ME);
    expect(ranked).toHaveLength(12);
    expect(new Set(ranked.map((p) => p.id)).size).toBe(12);
  });

  it('does not stall when a single author wrote everything', () => {
    const posts = Array.from({ length: 5 }, (_, i) =>
      post({ id: `p-${i}`, user_id: 'solo', created_at: hoursOld(i + 1) }));
    const ranked = rankFeedPosts(posts, ME);
    expect(ranked).toHaveLength(5);
  });
});

describe('robustness', () => {
  it('returns an empty array for an empty feed', () => {
    expect(rankFeedPosts([], ME)).toEqual([]);
  });

  it('survives an unparseable timestamp without poisoning the batch', () => {
    const posts = [
      post({ id: 'bad', created_at: 'not-a-date', reactions_count: 10 }),
      post({ id: 'good', created_at: hoursOld(1), reactions_count: 5 }),
    ];
    const ranked = rankFeedPosts(posts, ME);
    expect(ranked).toHaveLength(2);
    expect(ranked.every((p) => isFinite(p._score!))).toBe(true);
    expect(ranked[0].id).toBe('good');
  });

  it('handles missing counter fields', () => {
    const ranked = rankFeedPosts(
      [{ id: 'x', user_id: 'u', created_at: hoursOld(1), visibility: 'public' } as RankablePost],
      ME,
    );
    expect(isFinite(ranked[0]._score!)).toBe(true);
  });

  it('is deterministic across repeated calls', () => {
    const posts = [
      post({ id: 'a', created_at: hoursOld(1), reactions_count: 5 }),
      post({ id: 'b', created_at: hoursOld(1), reactions_count: 5 }),
      post({ id: 'c', created_at: hoursOld(2), reactions_count: 5 }),
    ];
    const first = rankFeedPosts(posts, ME).map((p) => p.id);
    const second = rankFeedPosts(posts, ME).map((p) => p.id);
    expect(second).toEqual(first);
  });

  it('boosts friends over strangers, all else equal', () => {
    const posts = [
      post({ id: 'stranger', created_at: hoursOld(2), reactions_count: 4 }),
      post({ id: 'friend', created_at: hoursOld(2), reactions_count: 4, is_friend: true }),
    ];
    expect(rankFeedPosts(posts, ME)[0].id).toBe('friend');
  });
});
