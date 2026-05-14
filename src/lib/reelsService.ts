/**
 * Reels / Short Video Service — Core CRUD, feed, and interaction layer (Web)
 *
 * General-purpose short-form video system.  Astrology is ONE supported
 * category among many — it is never forced or required.
 *
 * Adapted from the mobile app's reelsService for the Next.js web client.
 * Uses createClient() from ./supabase and useAuthStore for auth state.
 */

import { createClient } from './supabase';
import { useAuthStore } from '@/stores/authStore';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

/** Broad, expandable content categories — NOT astrology-only */
export type ReelCategory =
  | 'astrology'
  | 'relationships'
  | 'dating'
  | 'humor'
  | 'spirituality'
  | 'lifestyle'
  | 'motivation'
  | 'beauty'
  | 'fashion'
  | 'wellness'
  | 'personal'
  | 'storytelling'
  | 'education'
  | 'memes'
  | 'culture'
  | 'entrepreneurship'
  | 'entertainment'
  | 'other';

export const REEL_CATEGORIES: { value: ReelCategory; label: string; emoji: string }[] = [
  { value: 'astrology',        label: 'Astrology',         emoji: '♈' },
  { value: 'relationships',    label: 'Relationships',     emoji: '💞' },
  { value: 'dating',           label: 'Dating',            emoji: '💘' },
  { value: 'humor',            label: 'Humor',             emoji: '😂' },
  { value: 'spirituality',     label: 'Spirituality',      emoji: '🧘' },
  { value: 'lifestyle',        label: 'Lifestyle',         emoji: '✨' },
  { value: 'motivation',       label: 'Motivation',        emoji: '🔥' },
  { value: 'beauty',           label: 'Beauty',            emoji: '💄' },
  { value: 'fashion',          label: 'Fashion',           emoji: '👗' },
  { value: 'wellness',         label: 'Wellness',          emoji: '🌿' },
  { value: 'personal',         label: 'Personal',          emoji: '💭' },
  { value: 'storytelling',     label: 'Storytelling',      emoji: '📖' },
  { value: 'education',        label: 'Education',         emoji: '📚' },
  { value: 'memes',            label: 'Memes',             emoji: '🤪' },
  { value: 'culture',          label: 'Culture',           emoji: '🌍' },
  { value: 'entrepreneurship', label: 'Entrepreneurship',  emoji: '💼' },
  { value: 'entertainment',    label: 'Entertainment',     emoji: '🎬' },
  { value: 'other',            label: 'Other',             emoji: '🏷️' },
];

export type ReelVisibility = 'public' | 'friends' | 'private';
export type ReelStatus = 'active' | 'processing' | 'removed' | 'flagged';

export interface AstrologyMetadata {
  zodiac_sign?: string;
  planet?: string;
  house?: number;
  transit?: string;
  topic?: string;
}

export interface Reel {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar?: string;
  creator_username?: string;
  video_url: string;
  thumbnail_url?: string;
  caption: string;
  duration_seconds: number;
  category: ReelCategory;
  tags: string[];
  visibility: ReelVisibility;
  status: ReelStatus;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  shares_count: number;
  views_count: number;
  is_liked: boolean;
  is_saved: boolean;
  is_following_creator: boolean;
  astrology_metadata?: AstrologyMetadata | null;
  topic_metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ReelComment {
  id: string;
  reel_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  text: string;
  likes_count: number;
  is_liked: boolean;
  is_deleted: boolean;
  created_at: string;
}

export type ReelReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'violence'
  | 'misinformation'
  | 'copyright'
  | 'other';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function currentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

// ═══════════════════════════════════════════════════════════════════
// Row mapper
// ═══════════════════════════════════════════════════════════════════

function mapReelRow(
  r: any,
  likedIds: Set<string>,
  savedIds: Set<string>,
  followingIds: Set<string>,
): Reel {
  return {
    id: r.id,
    creator_id: r.creator_id,
    creator_name: r.profiles?.display_name || 'User',
    creator_avatar: r.profiles?.avatar_url || undefined,
    creator_username: r.profiles?.username || undefined,
    video_url: r.video_url,
    thumbnail_url: r.thumbnail_url || undefined,
    caption: r.caption || '',
    duration_seconds: r.duration_seconds || 0,
    category: r.category || 'other',
    tags: r.tags || [],
    visibility: r.visibility || 'public',
    status: r.status || 'active',
    likes_count: r.likes_count || 0,
    comments_count: r.comments_count || 0,
    saves_count: r.saves_count || 0,
    shares_count: r.shares_count || 0,
    views_count: r.views_count || 0,
    is_liked: likedIds.has(r.id),
    is_saved: savedIds.has(r.id),
    is_following_creator: followingIds.has(r.creator_id),
    astrology_metadata: r.astrology_metadata || null,
    topic_metadata: r.topic_metadata || null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Feed / Discovery
// ═══════════════════════════════════════════════════════════════════

/**
 * Fetch the main reels feed.
 *
 * Ranking: recency-weighted, category filter optional,
 * blocked users excluded.
 */
export async function getReelsFeed(options?: {
  category?: ReelCategory;
  limit?: number;
  offset?: number;
}): Promise<Reel[]> {
  try {
    const supabase = createClient();
    const userId = currentUserId();
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    // Build query
    let query = supabase
      .from('reels')
      .select(`
        *,
        profiles:creator_id ( display_name, avatar_url, username )
      `)
      .eq('status', 'active')
      .neq('visibility', 'private')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error('[Reels] getReelsFeed error:', error?.message);
      return [];
    }

    // Get blocked users
    const blockedIds = new Set<string>();
    if (userId) {
      const { data: blocks } = await supabase
        .from('blocks')
        .select('blocked_id, blocker_id')
        .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

      if (blocks) {
        blocks.forEach((b: any) => {
          blockedIds.add(b.blocker_id === userId ? b.blocked_id : b.blocker_id);
        });
      }
    }

    // Get user's likes, saves, follows for this batch
    const likedReelIds = new Set<string>();
    const savedReelIds = new Set<string>();
    const followingIds = new Set<string>();

    if (userId) {
      const reelIds = data.map((r: any) => r.id);

      const [likesRes, savesRes, followsRes] = await Promise.all([
        supabase.from('reel_likes').select('reel_id').eq('user_id', userId).in('reel_id', reelIds),
        supabase.from('reel_saves').select('reel_id').eq('user_id', userId).in('reel_id', reelIds),
        supabase.from('follows').select('following_id').eq('follower_id', userId),
      ]);

      likesRes.data?.forEach((l: any) => likedReelIds.add(l.reel_id));
      savesRes.data?.forEach((s: any) => savedReelIds.add(s.reel_id));
      followsRes.data?.forEach((f: any) => followingIds.add(f.following_id));
    }

    return data
      .filter((r: any) => !blockedIds.has(r.creator_id))
      .map((r: any) => mapReelRow(r, likedReelIds, savedReelIds, followingIds));
  } catch (err) {
    console.error('[Reels] getReelsFeed exception:', err);
    return [];
  }
}

/**
 * Fetch a single reel by ID with creator profile.
 */
export async function getReelById(id: string): Promise<Reel | null> {
  try {
    const supabase = createClient();
    const userId = currentUserId();

    const { data, error } = await supabase
      .from('reels')
      .select(`
        *,
        profiles:creator_id ( display_name, avatar_url, username )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[Reels] getReelById error:', error?.message);
      return null;
    }

    const likedIds = new Set<string>();
    const savedIds = new Set<string>();
    const followingIds = new Set<string>();

    if (userId) {
      const [likeRes, saveRes, followRes] = await Promise.all([
        supabase
          .from('reel_likes')
          .select('reel_id')
          .eq('user_id', userId)
          .eq('reel_id', id)
          .maybeSingle(),
        supabase
          .from('reel_saves')
          .select('reel_id')
          .eq('user_id', userId)
          .eq('reel_id', id)
          .maybeSingle(),
        supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)
          .eq('following_id', data.creator_id)
          .maybeSingle(),
      ]);

      if (likeRes.data) likedIds.add(likeRes.data.reel_id);
      if (saveRes.data) savedIds.add(saveRes.data.reel_id);
      if (followRes.data) followingIds.add(followRes.data.following_id);
    }

    return mapReelRow(data, likedIds, savedIds, followingIds);
  } catch (err) {
    console.error('[Reels] getReelById exception:', err);
    return null;
  }
}

/**
 * Get reels by a specific user.
 */
export async function getUserReels(userId: string, limit = 30): Promise<Reel[]> {
  try {
    const supabase = createClient();
    const myId = currentUserId();

    let query = supabase
      .from('reels')
      .select(`*, profiles:creator_id ( display_name, avatar_url, username )`)
      .eq('creator_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Non-self viewers only see public reels on web
    if (myId !== userId) {
      query = query.eq('visibility', 'public');
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const likedIds = new Set<string>();
    const savedIds = new Set<string>();
    const followingIds = new Set<string>();

    if (myId) {
      const ids = data.map((r: any) => r.id);
      const [l, s, f] = await Promise.all([
        supabase.from('reel_likes').select('reel_id').eq('user_id', myId).in('reel_id', ids),
        supabase.from('reel_saves').select('reel_id').eq('user_id', myId).in('reel_id', ids),
        supabase.from('follows').select('following_id').eq('follower_id', myId),
      ]);
      l.data?.forEach((x: any) => likedIds.add(x.reel_id));
      s.data?.forEach((x: any) => savedIds.add(x.reel_id));
      f.data?.forEach((x: any) => followingIds.add(x.following_id));
    }

    return data.map((r: any) => mapReelRow(r, likedIds, savedIds, followingIds));
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════
// Interactions
// ═══════════════════════════════════════════════════════════════════

/**
 * Toggle like on a reel.  Returns new likes count + liked state.
 */
export async function toggleReelLike(reelId: string): Promise<{ liked: boolean; count: number }> {
  const userId = currentUserId();
  if (!userId) return { liked: false, count: 0 };

  try {
    const supabase = createClient();

    // Check existing
    const { data: existing } = await supabase
      .from('reel_likes')
      .select('id')
      .eq('reel_id', reelId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('reel_likes').delete().eq('id', existing.id);
      await supabase.rpc('decrement_reel_likes', { p_reel_id: reelId });
      const { data: r } = await supabase.from('reels').select('likes_count').eq('id', reelId).single();
      return { liked: false, count: r?.likes_count ?? 0 };
    } else {
      await supabase.from('reel_likes').insert({ reel_id: reelId, user_id: userId });
      await supabase.rpc('increment_reel_likes', { p_reel_id: reelId });
      const { data: r } = await supabase.from('reels').select('likes_count').eq('id', reelId).single();
      return { liked: true, count: r?.likes_count ?? 0 };
    }
  } catch (err) {
    console.error('[Reels] toggleReelLike error:', err);
    return { liked: false, count: 0 };
  }
}

/**
 * Toggle save (bookmark) on a reel.
 */
export async function toggleReelSave(reelId: string): Promise<{ saved: boolean; count: number }> {
  const userId = currentUserId();
  if (!userId) return { saved: false, count: 0 };

  try {
    const supabase = createClient();

    const { data: existing } = await supabase
      .from('reel_saves')
      .select('id')
      .eq('reel_id', reelId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('reel_saves').delete().eq('id', existing.id);
      await supabase.rpc('decrement_reel_saves', { p_reel_id: reelId });
      const { data: r } = await supabase.from('reels').select('saves_count').eq('id', reelId).single();
      return { saved: false, count: r?.saves_count ?? 0 };
    } else {
      await supabase.from('reel_saves').insert({ reel_id: reelId, user_id: userId });
      await supabase.rpc('increment_reel_saves', { p_reel_id: reelId });
      const { data: r } = await supabase.from('reels').select('saves_count').eq('id', reelId).single();
      return { saved: true, count: r?.saves_count ?? 0 };
    }
  } catch {
    return { saved: false, count: 0 };
  }
}

/**
 * Record a view on a reel.
 */
export async function recordReelView(reelId: string): Promise<void> {
  try {
    const userId = currentUserId();
    if (!userId) return;

    const supabase = createClient();

    // Upsert to avoid duplicate view rows
    await supabase.from('reel_views').upsert(
      { reel_id: reelId, user_id: userId, watched_at: new Date().toISOString() },
      { onConflict: 'reel_id,user_id' },
    );

    // Increment counter
    await supabase.rpc('increment_reel_views', { p_reel_id: reelId });
  } catch { /* best effort */ }
}

/**
 * Record a share event.
 */
export async function recordReelShare(reelId: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.rpc('increment_reel_shares', { p_reel_id: reelId });
  } catch { /* best effort */ }
}

// ═══════════════════════════════════════════════════════════════════
// Comments
// ═══════════════════════════════════════════════════════════════════

/**
 * Get comments for a reel.
 */
export async function getReelComments(reelId: string, limit = 50): Promise<ReelComment[]> {
  try {
    const supabase = createClient();
    const userId = currentUserId();

    const { data, error } = await supabase
      .from('reel_comments')
      .select(`*, profiles:user_id ( display_name, avatar_url )`)
      .eq('reel_id', reelId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error || !data) return [];

    // Get liked comment IDs
    const likedCommentIds = new Set<string>();
    if (userId) {
      const commentIds = data.map((c: any) => c.id);
      const { data: likes } = await supabase
        .from('reel_comment_likes')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', commentIds);
      likes?.forEach((l: any) => likedCommentIds.add(l.comment_id));
    }

    return data.map((c: any) => ({
      id: c.id,
      reel_id: c.reel_id,
      user_id: c.user_id,
      user_name: c.profiles?.display_name || 'User',
      user_avatar: c.profiles?.avatar_url || undefined,
      text: c.text,
      likes_count: c.likes_count || 0,
      is_liked: likedCommentIds.has(c.id),
      is_deleted: false,
      created_at: c.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Add a comment to a reel.
 */
export async function addReelComment(
  reelId: string,
  text: string,
): Promise<{ success: boolean; comment?: ReelComment; error?: string }> {
  const userId = currentUserId();
  if (!userId) return { success: false, error: 'Not signed in' };

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('reel_comments')
      .insert({ reel_id: reelId, user_id: userId, text: text.trim() })
      .select(`*, profiles:user_id ( display_name, avatar_url )`)
      .single();

    if (error) return { success: false, error: error.message };

    // Increment counter
    await supabase.rpc('increment_reel_comments', { p_reel_id: reelId });

    return {
      success: true,
      comment: {
        id: data.id,
        reel_id: data.reel_id,
        user_id: data.user_id,
        user_name: data.profiles?.display_name || 'User',
        user_avatar: data.profiles?.avatar_url || undefined,
        text: data.text,
        likes_count: 0,
        is_liked: false,
        is_deleted: false,
        created_at: data.created_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete own comment (soft delete).
 */
export async function deleteReelComment(commentId: string): Promise<boolean> {
  const userId = currentUserId();
  if (!userId) return false;

  try {
    const supabase = createClient();

    // Get the reel_id before deleting
    const { data: comment } = await supabase
      .from('reel_comments')
      .select('reel_id')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();

    const { error } = await supabase
      .from('reel_comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .eq('user_id', userId);

    if (!error && comment?.reel_id) {
      await supabase.rpc('decrement_reel_comments', { p_reel_id: comment.reel_id });
    }

    return !error;
  } catch {
    return false;
  }
}

/**
 * Toggle like on a comment.
 */
export async function toggleCommentLike(commentId: string): Promise<{ liked: boolean; count: number }> {
  const userId = currentUserId();
  if (!userId) return { liked: false, count: 0 };

  try {
    const supabase = createClient();

    const { data: existing } = await supabase
      .from('reel_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('reel_comment_likes').delete().eq('id', existing.id);
      const { data: c } = await supabase.from('reel_comments').select('likes_count').eq('id', commentId).single();
      return { liked: false, count: Math.max(0, (c?.likes_count || 1) - 1) };
    } else {
      await supabase.from('reel_comment_likes').insert({ comment_id: commentId, user_id: userId });
      const { data: c } = await supabase.from('reel_comments').select('likes_count').eq('id', commentId).single();
      return { liked: true, count: (c?.likes_count || 0) + 1 };
    }
  } catch {
    return { liked: false, count: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════
// Reporting
// ═══════════════════════════════════════════════════════════════════

/**
 * Report a reel for moderation.
 */
export async function reportReel(
  reelId: string,
  reason: ReelReportReason,
  description?: string,
): Promise<boolean> {
  const userId = currentUserId();
  if (!userId) return false;

  try {
    const supabase = createClient();

    const { error } = await supabase.from('reel_reports').insert({
      reel_id: reelId,
      reporter_id: userId,
      reason,
      description: description || '',
    });
    return !error;
  } catch {
    return false;
  }
}
