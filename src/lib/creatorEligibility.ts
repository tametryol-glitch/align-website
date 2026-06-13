/**
 * Creator Program eligibility — the Phase-2 self-serve threshold.
 *
 * This computes a member's progress toward qualifying for the monetized
 * Creator role. It is intentionally DISPLAY-FIRST: the ladder is shown
 * to members long before enforcement is switched on, because the bar
 * itself is a motivation engine ("you're 640/1,000 views away").
 *
 * Thresholds are calibrated to Align's growth stage, NOT copied from
 * TikTok/YouTube (whose numbers assume hundreds of millions of users).
 * Tune CREATOR_THRESHOLDS as the user base grows.
 */
import { createClient } from './supabase';

export interface CreatorThresholds {
  followers: number;
  lifetimeViews: number;
  views30d: number;
  videoCount: number;
  accountAgeDays: number;
}

// Phase 2 ("Partner Program") — tuned so roughly the top 10-15% of
// active posters clear it. Ratchet up as the base grows.
export const CREATOR_THRESHOLDS: CreatorThresholds = {
  followers: 100,
  lifetimeViews: 1000,
  views30d: 300,
  videoCount: 10,
  accountAgeDays: 30,
};

export interface EligibilityRequirement {
  key: keyof CreatorThresholds;
  label: string;
  current: number;
  target: number;
  met: boolean;
  /** 0-1 progress toward this requirement (capped at 1). */
  progress: number;
}

export interface CreatorEligibility {
  requirements: EligibilityRequirement[];
  metCount: number;
  totalCount: number;
  /** Average progress across all requirements, 0-100. */
  overallPct: number;
  qualifies: boolean;
}

const REQUIREMENT_LABELS: Record<keyof CreatorThresholds, string> = {
  followers: 'Followers',
  lifetimeViews: 'Total video views',
  views30d: 'Views in last 30 days',
  videoCount: 'Published videos',
  accountAgeDays: 'Account age (days)',
};

function buildEligibility(
  metrics: Record<keyof CreatorThresholds, number>,
): CreatorEligibility {
  const keys = Object.keys(CREATOR_THRESHOLDS) as (keyof CreatorThresholds)[];
  const requirements: EligibilityRequirement[] = keys.map((key) => {
    const target = CREATOR_THRESHOLDS[key];
    const current = metrics[key] ?? 0;
    const progress = target > 0 ? Math.min(1, current / target) : 1;
    return {
      key,
      label: REQUIREMENT_LABELS[key],
      current,
      target,
      met: current >= target,
      progress,
    };
  });
  const metCount = requirements.filter((r) => r.met).length;
  const overallPct = Math.round(
    (requirements.reduce((s, r) => s + r.progress, 0) / requirements.length) * 100,
  );
  return {
    requirements,
    metCount,
    totalCount: requirements.length,
    overallPct,
    qualifies: metCount === requirements.length,
  };
}

/**
 * Compute a member's live progress toward the Creator Program.
 * Best-effort: any sub-query that fails contributes 0 rather than
 * throwing, so the ladder always renders.
 */
export async function getCreatorEligibility(userId: string): Promise<CreatorEligibility> {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  // Followers
  const followersP = supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId);

  // My reels + my video posts (ids + lifetime view counts)
  const reelsP = supabase
    .from('reels')
    .select('id, views_count')
    .eq('creator_id', userId);
  const videoPostsP = supabase
    .from('posts')
    .select('id, video_views_count')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .not('video_url', 'is', null);

  // Account age
  const profileP = supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .maybeSingle();

  const [followersRes, reelsRes, videoPostsRes, profileRes] = await Promise.all([
    followersP, reelsP, videoPostsP, profileP,
  ]);

  const reels = reelsRes.data ?? [];
  const videoPosts = videoPostsRes.data ?? [];
  const reelIds = reels.map((r: any) => r.id);
  const postIds = videoPosts.map((p: any) => p.id);

  // 30-day views: rows in the per-user view logs since the cutoff.
  let views30d = 0;
  if (reelIds.length > 0) {
    const { count } = await supabase
      .from('reel_views')
      .select('reel_id', { count: 'exact', head: true })
      .in('reel_id', reelIds)
      .gte('watched_at', sinceIso);
    views30d += count ?? 0;
  }
  if (postIds.length > 0) {
    const { count } = await supabase
      .from('post_video_views')
      .select('post_id', { count: 'exact', head: true })
      .in('post_id', postIds)
      .gte('watched_at', sinceIso);
    views30d += count ?? 0;
  }

  const lifetimeViews =
    reels.reduce((s: number, r: any) => s + (r.views_count || 0), 0) +
    videoPosts.reduce((s: number, p: any) => s + (p.video_views_count || 0), 0);

  let accountAgeDays = 0;
  const createdAt = profileRes.data?.created_at;
  if (createdAt) {
    accountAgeDays = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  return buildEligibility({
    followers: followersRes.count ?? 0,
    lifetimeViews,
    views30d,
    videoCount: reels.length + videoPosts.length,
    accountAgeDays,
  });
}
