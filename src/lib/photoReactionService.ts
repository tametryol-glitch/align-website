// ═══════════════════════════════════════════════════════════════════
// Photo Reaction Service (web) — Facebook-style profile photo reactions
//
// Mirror of align-app/src/services/photoReactionService.ts. A photo in a
// profile is either post-backed (reactions live in post_reactions, in
// sync with the feed) or a bare profile photo — avatar, cover, dating
// photo — whose reactions live in photo_reactions.
//
// See align-app/supabase-migration-photo-reactions.sql for the schema.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from './supabase';
import { toggleReaction, type ReactionEmoji, type PostReaction } from './feedService';

export type PhotoTarget =
  | { kind: 'post'; postId: string; imageUrl: string }
  | { kind: 'profile'; photoKey: string; ownerId: string; imageUrl: string };

export interface PhotoReactor {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  sunSign: string | null;
  emoji: ReactionEmoji;
}

/**
 * Derive a stable key for a profile photo from its URL — storage path
 * only, so public and signed URLs for the same file collapse to one key.
 * MUST stay identical to the mobile implementation.
 */
export function photoKeyFromUrl(url: string): string {
  if (!url) return '';
  const clean = url.split('#')[0].split('?')[0];
  const marker = clean.match(/\/object\/(?:public|sign|authenticated)\/(.+)$/);
  if (marker && marker[1]) return `p:${marker[1]}`;
  const withoutScheme = clean.replace(/^https?:\/\/[^/]+/, '');
  return `p:${withoutScheme || clean}`;
}

export function photoTargetId(target: PhotoTarget): string {
  return target.kind === 'post' ? `post:${target.postId}` : target.photoKey;
}

export function profilePhotoTarget(imageUrl: string, ownerId: string): PhotoTarget {
  return { kind: 'profile', photoKey: photoKeyFromUrl(imageUrl), ownerId, imageUrl };
}

function group(
  rows: Array<{ emoji: string; user_id: string }>,
  myId: string | null,
): PhotoReaction[] {
  const map = new Map<ReactionEmoji, PhotoReaction>();
  for (const r of rows) {
    const key = r.emoji as ReactionEmoji;
    if (!map.has(key)) map.set(key, { emoji: key, count: 0, userReacted: false });
    const entry = map.get(key)!;
    entry.count++;
    if (myId && r.user_id === myId) entry.userReacted = true;
  }
  return Array.from(map.values());
}

export type PhotoReaction = PostReaction;

// ── Read ─────────────────────────────────────────────────────────────

export async function getPhotoReactions(
  target: PhotoTarget,
  userId: string | null,
): Promise<PhotoReaction[]> {
  const supabase = createClient();
  try {
    if (target.kind === 'post') {
      const { data } = await supabase
        .from('post_reactions')
        .select('emoji, user_id')
        .eq('post_id', target.postId);
      return group(data || [], userId);
    }
    const { data } = await supabase
      .from('photo_reactions')
      .select('emoji, user_id')
      .eq('photo_key', target.photoKey);
    return group(data || [], userId);
  } catch {
    // Table may not exist yet — reactions are never allowed to break a gallery.
    return [];
  }
}

/** Batch-fetch reactions for a gallery. Returns photoTargetId() → reactions. */
export async function batchGetPhotoReactions(
  targets: PhotoTarget[],
  userId: string | null,
): Promise<Map<string, PhotoReaction[]>> {
  const result = new Map<string, PhotoReaction[]>();
  if (targets.length === 0) return result;

  const supabase = createClient();
  const postIds = targets.filter(t => t.kind === 'post').map(t => (t as { postId: string }).postId);
  const photoKeys = targets.filter(t => t.kind === 'profile').map(t => (t as { photoKey: string }).photoKey);

  await Promise.all([
    (async () => {
      if (postIds.length === 0) return;
      try {
        const { data } = await supabase
          .from('post_reactions')
          .select('post_id, emoji, user_id')
          .in('post_id', postIds);
        const byPost = new Map<string, Array<{ emoji: string; user_id: string }>>();
        for (const r of data || []) {
          if (!byPost.has(r.post_id)) byPost.set(r.post_id, []);
          byPost.get(r.post_id)!.push(r);
        }
        for (const [postId, rows] of Array.from(byPost.entries())) {
          result.set(`post:${postId}`, group(rows, userId));
        }
      } catch { /* graceful */ }
    })(),
    (async () => {
      if (photoKeys.length === 0) return;
      try {
        const { data } = await supabase
          .from('photo_reactions')
          .select('photo_key, emoji, user_id')
          .in('photo_key', photoKeys);
        const byKey = new Map<string, Array<{ emoji: string; user_id: string }>>();
        for (const r of data || []) {
          if (!byKey.has(r.photo_key)) byKey.set(r.photo_key, []);
          byKey.get(r.photo_key)!.push(r);
        }
        for (const [key, rows] of Array.from(byKey.entries())) {
          result.set(key, group(rows, userId));
        }
      } catch { /* graceful */ }
    })(),
  ]);

  return result;
}

// ── Write ────────────────────────────────────────────────────────────

/** Toggle a reaction — same single-reaction-per-user rule as posts. */
export async function togglePhotoReaction(
  target: PhotoTarget,
  userId: string,
  emoji: ReactionEmoji,
): Promise<PhotoReaction[]> {
  if (target.kind === 'post') return toggleReaction(target.postId, userId, emoji);

  const supabase = createClient();
  try {
    const { data: sameEmoji } = await supabase
      .from('photo_reactions')
      .select('id')
      .eq('photo_key', target.photoKey)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .maybeSingle();

    if (sameEmoji) {
      await supabase.from('photo_reactions').delete().eq('id', sameEmoji.id);
    } else {
      await supabase.from('photo_reactions')
        .delete()
        .eq('photo_key', target.photoKey)
        .eq('user_id', userId);
      await supabase.from('photo_reactions').insert({
        photo_key: target.photoKey,
        owner_id: target.ownerId,
        image_url: target.imageUrl,
        user_id: userId,
        emoji,
      });
    }

    return getPhotoReactions(target, userId);
  } catch {
    return [];
  }
}

// ── Who reacted ──────────────────────────────────────────────────────

export async function getReactorsForPhoto(
  target: PhotoTarget,
  filterEmoji?: ReactionEmoji,
): Promise<PhotoReactor[]> {
  const supabase = createClient();
  try {
    const table = target.kind === 'post' ? 'post_reactions' : 'photo_reactions';
    let query = supabase
      .from(table)
      .select('emoji, user_id, profiles:user_id ( display_name, avatar_url, sun_sign )')
      .order('created_at', { ascending: false });

    query = target.kind === 'post'
      ? query.eq('post_id', target.postId)
      : query.eq('photo_key', target.photoKey);

    if (filterEmoji) query = query.eq('emoji', filterEmoji);

    const { data, error } = await query;
    if (error || !data) return [];

    return (data as unknown as Array<{
      emoji: string;
      user_id: string;
      profiles?: { display_name?: string; avatar_url?: string | null; sun_sign?: string | null } | null;
    }>).map(r => ({
      userId: r.user_id,
      displayName: r.profiles?.display_name || 'User',
      avatarUrl: r.profiles?.avatar_url || null,
      sunSign: r.profiles?.sun_sign || null,
      emoji: r.emoji as ReactionEmoji,
    }));
  } catch {
    return [];
  }
}
