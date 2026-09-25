// =============================================================================
// Views — who saw your posts, photos, videos, reels and stories
// =============================================================================
// Contract: supabase-migration-views.sql
//   posts.viewers_count, photo_views, record_photo_view(), photo_view_counts(),
//   get_viewers(), get_my_view_activity(), get_my_view_stats(),
//   get_my_view_badge(), mark_views_seen().
// Viewer lists only ever come back for content the caller owns (enforced in
// SQL). Every call here is best effort: if the migration is not live yet, or
// the network drops, callers get an empty result and render nothing.
// =============================================================================

import { createClient } from './supabase';

/** What a "who viewed" list can be about. */
export type ViewKind = 'post' | 'video' | 'reel' | 'photo' | 'story';

/** Kinds that appear on the Views page (profile visits included). */
export type ActivityKind = 'profile' | ViewKind;

/** Stat rows also carry 'people' = distinct viewers across everything. */
export type StatKind = ActivityKind | 'people';

export interface Viewer {
  viewer_id: string;
  display_name: string | null;
  avatar_url: string | null;
  sun_sign: string | null;
  viewed_at: string;
  /** Full count for the header, regardless of the page loaded. */
  total: number;
}

export interface ViewActivity {
  kind: ActivityKind;
  /** post/reel/story id or photo_key; null for a profile visit. */
  content_id: string | null;
  thumb_url: string | null;
  snippet: string | null;
  viewer_id: string;
  display_name: string | null;
  avatar_url: string | null;
  sun_sign: string | null;
  viewed_at: string;
}

export interface ViewStat {
  kind: StatKind;
  current_count: number;
  previous_count: number;
}

// ── Recording ──────────────────────────────────────────────────────────────

/** Someone else opened a bare profile photo. The SQL ignores your own. */
export async function recordPhotoView(photoKey: string, ownerId: string, imageUrl?: string | null): Promise<void> {
  if (!photoKey || !ownerId) return;
  try {
    const supabase = createClient();
    await supabase.rpc('record_photo_view', {
      p_photo_key: photoKey,
      p_owner_id: ownerId,
      p_image_url: imageUrl ?? null,
    });
  } catch {
    // Best effort — a missed view never breaks the viewer.
  }
}

// ── Counts ─────────────────────────────────────────────────────────────────

/** photo_key → view count. Keys with no views are absent. */
export async function getPhotoViewCounts(keys: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  if (keys.length === 0) return out;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('photo_view_counts', { p_keys: keys.slice(0, 200) });
    if (error || !Array.isArray(data)) return out;
    for (const row of data as Array<{ photo_key: string; views: number }>) {
      out[row.photo_key] = Number(row.views) || 0;
    }
  } catch { /* graceful */ }
  return out;
}

/** posts.viewers_count for one post; 0 on any failure. */
export async function getPostViewersCount(postId: string): Promise<number> {
  if (!postId) return 0;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('viewers_count')
      .eq('id', postId)
      .maybeSingle();
    if (error || !data) return 0;
    return Number((data as { viewers_count?: number }).viewers_count) || 0;
  } catch {
    return 0;
  }
}

// ── Lists ──────────────────────────────────────────────────────────────────

/**
 * Who viewed one thing you own. Throws on a real error so the sheet can show
 * an error state; returns [] when there is nothing (or you are not the owner).
 */
export async function getViewers(kind: ViewKind, id: string, limit = 50, offset = 0): Promise<Viewer[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_viewers', {
    p_kind: kind,
    p_id: id,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw error;
  return ((data as any[]) || []).map((r) => ({
    viewer_id: r.viewer_id,
    display_name: r.display_name ?? null,
    avatar_url: r.avatar_url ?? null,
    sun_sign: r.sun_sign ?? null,
    viewed_at: r.viewed_at,
    total: Number(r.total) || 0,
  }));
}

/** Everyone who viewed anything of yours, newest first. Throws on error. */
export async function getMyViewActivity(
  limit = 40,
  before: string | null = null,
  kind: ActivityKind | null = null,
): Promise<ViewActivity[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_my_view_activity', {
    p_limit: limit,
    p_before: before,
    p_kind: kind,
  });
  if (error) throw error;
  return (data as ViewActivity[]) || [];
}

/** Last p_days vs the p_days before, per kind. [] on failure. */
export async function getMyViewStats(days = 7): Promise<ViewStat[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_my_view_stats', { p_days: days });
    if (error || !Array.isArray(data)) return [];
    return (data as any[]).map((r) => ({
      kind: r.kind,
      current_count: Number(r.current_count) || 0,
      previous_count: Number(r.previous_count) || 0,
    }));
  } catch {
    return [];
  }
}

// ── Badge ──────────────────────────────────────────────────────────────────

/** New viewers since you last opened /views (capped at 99). 0 on failure. */
export async function getMyViewBadge(): Promise<number> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_my_view_badge');
    if (error) return 0;
    return Number(data) || 0;
  } catch {
    return 0;
  }
}

/** Clear the badge — called when the Views page opens. */
export async function markViewsSeen(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.rpc('mark_views_seen');
  } catch { /* graceful */ }
}
