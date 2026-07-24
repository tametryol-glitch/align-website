import { createClient } from './supabase';
import { rankFeedPosts, type RankablePost } from './feedRankingEngine';

// ── Types ──────────────────────────────────────────────────────────
export type ReactionEmoji = '✨' | '🔥' | '💜' | '🌙' | '⚡' | '😂';

export interface PostReaction {
  emoji: ReactionEmoji;
  count: number;
  userReacted: boolean;
}

export interface FeedComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  /** null for a top-level comment, the parent's id for a reply. */
  parentCommentId?: string | null;
  replyCount?: number;
  isEdited?: boolean;
}

/** A user tagged in a post (e.g. the two people in a cosmic_match card). */
export interface TaggedUser {
  userId: string;
  userName: string;
  userAvatar?: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'chart_share' | 'reading_share' | 'photo' | 'video' | 'text' | 'transit_alert' | 'compatibility_result' | 'cosmic_match';
  content: string;
  imageUrl?: string;
  mediaKind?: 'photo' | 'sticker' | 'gif';
  videoUrl?: string;
  posterUrl?: string;
  /** Total video plays (unique-per-user log lives in post_video_views). */
  videoViewsCount?: number;
  /**
   * Creator opt-out for video posts. When false no download button is shown.
   * Defaults to true; only meaningful when videoUrl is set.
   */
  allowDownload?: boolean;
  chartData?: any;
  reactions: PostReaction[];
  comments: FeedComment[];
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  visibility: 'friends' | 'public';
  originalPostId?: string;
  originalUserName?: string;
  style?: { preset?: string; font?: string } | null;
  // Users tagged in this post — the two matched people for 'cosmic_match'.
  taggedUsers?: TaggedUser[];
}

export const REACTION_OPTIONS: { emoji: ReactionEmoji; label: string }[] = [
  { emoji: '✨', label: 'Resonates' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💜', label: 'Felt That' },
  { emoji: '🌙', label: 'Deep' },
  { emoji: '⚡', label: 'Mind Blown' },
  { emoji: '😂', label: 'Funny' },
];

export const POST_STYLE_PRESETS = [
  { id: 'default', label: 'Default', gradient: ['transparent', 'transparent'], textColor: '' },
  { id: 'midnight', label: 'Midnight', gradient: ['#0F1F4D', '#1E3A8A'], textColor: '#FFFFFF' },
  { id: 'aurora', label: 'Aurora', gradient: ['#8B5CF6', '#EC4899'], textColor: '#FFFFFF' },
  { id: 'sunset', label: 'Sunset', gradient: ['#F97316', '#DC2626'], textColor: '#FFFFFF' },
  { id: 'ocean', label: 'Ocean', gradient: ['#0891B2', '#1E3A8A'], textColor: '#FFFFFF' },
  { id: 'forest', label: 'Forest', gradient: ['#047857', '#065F46'], textColor: '#FFFFFF' },
  { id: 'lavender', label: 'Lavender', gradient: ['#E9D5FF', '#DDD6FE'], textColor: '#3B0764' },
  { id: 'noir', label: 'Noir', gradient: ['#000000', '#1A1A1A'], textColor: '#FFFFFF' },
];

// ── Service ────────────────────────────────────────────────────────

/**
 * Record a view on a feed post's video. Mirrors the reels design:
 * one row per (post, user) in post_video_views = unique-viewer log,
 * plus a denormalized total-plays counter on the post. Best effort.
 */
export async function recordPostVideoView(postId: string, userId: string): Promise<void> {
  try {
    if (!userId) return;
    const supabase = createClient();

    await supabase.from('post_video_views').upsert(
      { post_id: postId, user_id: userId, watched_at: new Date().toISOString() },
      { onConflict: 'post_id,user_id' },
    );

    await supabase.rpc('increment_post_video_views', { p_post_id: postId });
  } catch { /* best effort */ }
}

export async function getFeed(userId: string, before?: string): Promise<FeedPost[]> {
  const supabase = createClient();
  const PAGE = 30;

  let query = supabase
    .from('posts')
    .select('*, profile:profiles!posts_user_id_fkey(display_name, avatar_url, sun_sign)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(PAGE);

  if (before) query = query.lt('created_at', before);

  const { data: rawPosts, error } = await query;
  // Surface real query/RLS errors instead of silently returning an empty feed.
  if (error) { console.error('[getFeed] query failed:', error.code, error.message, error.details); throw new Error(error.message || 'Feed query failed'); }
  if (!rawPosts?.length) return [];

  const postIds = rawPosts.map((p: any) => p.id);

  // Batch-fetch reactions and comments
  const [reactionsRes, commentsRes] = await Promise.all([
    supabase.from('post_reactions').select('post_id, emoji, user_id').in('post_id', postIds),
    supabase.from('post_comments').select('id, post_id, user_id, text, created_at, parent_comment_id').in('post_id', postIds).eq('is_deleted', false).order('created_at', { ascending: true }),
  ]);

  const reactionsMap = new Map<string, PostReaction[]>();
  for (const r of reactionsRes.data || []) {
    if (!reactionsMap.has(r.post_id)) reactionsMap.set(r.post_id, []);
    const arr = reactionsMap.get(r.post_id)!;
    const existing = arr.find((x) => x.emoji === r.emoji);
    if (existing) {
      existing.count++;
      if (r.user_id === userId) existing.userReacted = true;
    } else {
      arr.push({ emoji: r.emoji, count: 1, userReacted: r.user_id === userId });
    }
  }

  // Batch-fetch commenter profiles
  const commentUserIds = Array.from(new Set((commentsRes.data || []).map((c: any) => c.user_id)));
  const commentProfileMap: Record<string, any> = {};
  if (commentUserIds.length > 0) {
    const { data: cProfiles } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', commentUserIds);
    if (cProfiles) cProfiles.forEach((p: any) => { commentProfileMap[p.id] = p; });
  }

  // Batch-fetch tagged users for cosmic_match posts.
  const taggedMap = new Map<string, TaggedUser[]>();
  const taggablePostIds = rawPosts.filter((p: any) => p.type === 'cosmic_match').map((p: any) => p.id);
  if (taggablePostIds.length > 0) {
    const { data: tagRows } = await supabase
      .from('post_tagged_users')
      .select('post_id, tagged_user_id, profile:profiles!post_tagged_users_tagged_user_id_fkey(display_name, avatar_url)')
      .in('post_id', taggablePostIds);
    for (const t of tagRows || []) {
      if (!taggedMap.has(t.post_id)) taggedMap.set(t.post_id, []);
      taggedMap.get(t.post_id)!.push({
        userId: t.tagged_user_id,
        userName: (t as any).profile?.display_name || 'User',
        userAvatar: (t as any).profile?.avatar_url || undefined,
      });
    }
  }

  const commentsMap = new Map<string, FeedComment[]>();
  const commentCountMap = new Map<string, number>();
  for (const c of commentsRes.data || []) {
    const profile = commentProfileMap[c.user_id];
    const comment: FeedComment = {
      id: c.id,
      userId: c.user_id,
      userName: profile?.display_name || 'User',
      userAvatar: profile?.avatar_url || undefined,
      text: c.text,
      createdAt: c.created_at,
      parentCommentId: c.parent_comment_id || null,
    };
    // Replies live under their parent in the sheet — the card preview
    // only shows top-level comments, but the count covers the thread.
    if (!c.parent_comment_id) {
      if (!commentsMap.has(c.post_id)) commentsMap.set(c.post_id, []);
      commentsMap.get(c.post_id)!.push(comment);
    }
    commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
  }

  const feedPosts = rawPosts.map((p: any) => {
    const profile = p.profile as any;
    const comments = commentsMap.get(p.id) || [];
    return {
      id: p.id,
      userId: p.user_id,
      userName: profile?.display_name || 'User',
      userAvatar: profile?.avatar_url || undefined,
      type: p.type,
      content: p.content || '',
      imageUrl: p.image_url || undefined,
      mediaKind: p.media_kind || undefined,
      videoUrl: p.video_url || undefined,
      posterUrl: p.poster_url || undefined,
      videoViewsCount: p.video_views_count || 0,
      // Rows predating the downloads migration have no value — treat those
      // as allowed, matching the DB default.
      allowDownload: p.allow_download !== false,
      chartData: p.chart_data || undefined,
      reactions: reactionsMap.get(p.id) || [],
      comments: comments.slice(0, 3),
      commentCount: commentCountMap.get(p.id) || 0,
      createdAt: p.created_at,
      updatedAt: p.updated_at || undefined,
      visibility: p.visibility || 'public',
      originalPostId: p.original_post_id || undefined,
      originalUserName: p.original_user_name || undefined,
      style: p.style || null,
      taggedUsers: taggedMap.get(p.id) || undefined,
    } as FeedPost;
  });

  // Algorithmic ranking (flip ALGORITHMIC_FEED_ENABLED to true to activate)
  const ALGORITHMIC_FEED_ENABLED = true;
  if (ALGORITHMIC_FEED_ENABLED) {
    const rankable: RankablePost[] = feedPosts.map((fp) => ({
      id: fp.id,
      user_id: fp.userId,
      created_at: fp.createdAt,
      likes_count: 0,
      comments_count: fp.commentCount,
      reactions_count: fp.reactions.reduce((sum: number, r: PostReaction) => sum + r.count, 0),
      reposts_count: 0,
      visibility: fp.visibility,
    }));
    const ranked = rankFeedPosts(rankable, userId);
    const idOrder = ranked.map((r) => r.id);
    return feedPosts.sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));
  }

  return feedPosts;
}

export async function getUserPosts(targetUserId: string, currentUserId: string): Promise<FeedPost[]> {
  const supabase = createClient();

  const { data: rawPosts, error } = await supabase
    .from('posts')
    .select('*, profile:profiles!posts_user_id_fkey(display_name, avatar_url, sun_sign)')
    .eq('user_id', targetUserId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !rawPosts?.length) return [];

  const postIds = rawPosts.map((p: any) => p.id);

  const [reactionsRes, commentsRes] = await Promise.all([
    supabase.from('post_reactions').select('post_id, emoji, user_id').in('post_id', postIds),
    supabase.from('post_comments').select('id, post_id, user_id, text, created_at, parent_comment_id').in('post_id', postIds).eq('is_deleted', false).order('created_at', { ascending: true }),
  ]);

  const reactionsMap = new Map<string, PostReaction[]>();
  for (const r of reactionsRes.data || []) {
    if (!reactionsMap.has(r.post_id)) reactionsMap.set(r.post_id, []);
    const arr = reactionsMap.get(r.post_id)!;
    const existing = arr.find((x) => x.emoji === r.emoji);
    if (existing) {
      existing.count++;
      if (r.user_id === currentUserId) existing.userReacted = true;
    } else {
      arr.push({ emoji: r.emoji, count: 1, userReacted: r.user_id === currentUserId });
    }
  }

  const commentUserIds2 = Array.from(new Set((commentsRes.data || []).map((c: any) => c.user_id)));
  const commentProfileMap2: Record<string, any> = {};
  if (commentUserIds2.length > 0) {
    const { data: cProfiles } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', commentUserIds2);
    if (cProfiles) cProfiles.forEach((p: any) => { commentProfileMap2[p.id] = p; });
  }

  const commentsMap = new Map<string, FeedComment[]>();
  const commentCountMap = new Map<string, number>();
  for (const c of commentsRes.data || []) {
    const profile = commentProfileMap2[c.user_id];
    const comment: FeedComment = {
      id: c.id,
      userId: c.user_id,
      userName: profile?.display_name || 'User',
      userAvatar: profile?.avatar_url || undefined,
      text: c.text,
      createdAt: c.created_at,
      parentCommentId: c.parent_comment_id || null,
    };
    if (!c.parent_comment_id) {
      if (!commentsMap.has(c.post_id)) commentsMap.set(c.post_id, []);
      commentsMap.get(c.post_id)!.push(comment);
    }
    commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
  }

  return rawPosts.map((p: any) => {
    const profile = p.profile as any;
    const comments = commentsMap.get(p.id) || [];
    return {
      id: p.id,
      userId: p.user_id,
      userName: profile?.display_name || 'User',
      userAvatar: profile?.avatar_url || undefined,
      type: p.type,
      content: p.content || '',
      imageUrl: p.image_url || undefined,
      mediaKind: p.media_kind || undefined,
      videoUrl: p.video_url || undefined,
      posterUrl: p.poster_url || undefined,
      videoViewsCount: p.video_views_count || 0,
      // Rows predating the downloads migration have no value — treat those
      // as allowed, matching the DB default.
      allowDownload: p.allow_download !== false,
      chartData: p.chart_data || undefined,
      reactions: reactionsMap.get(p.id) || [],
      comments: comments.slice(0, 3),
      commentCount: commentCountMap.get(p.id) || 0,
      createdAt: p.created_at,
      updatedAt: p.updated_at || undefined,
      visibility: p.visibility || 'public',
      originalPostId: p.original_post_id || undefined,
      originalUserName: p.original_user_name || undefined,
      style: p.style || null,
    } as FeedPost;
  });
}

export async function uploadPostMedia(userId: string, file: File): Promise<string> {
  const { validateUpload } = await import('./sanitize');
  const category = file.type.startsWith('video/') ? 'video' as const : 'image' as const;
  const err = validateUpload(file, category);
  if (err) throw new Error(err);

  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('post-media')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(path);
  return urlData.publicUrl;
}

export async function createPost(post: {
  userId: string;
  type: FeedPost['type'];
  content: string;
  visibility: 'friends' | 'public';
  imageUrl?: string;
  mediaKind?: string;
  videoUrl?: string;
  /** Defaults to true — creators opt out, not in. Video posts only. */
  allowDownload?: boolean;
  style?: { preset?: string; font?: string } | null;
}) {
  const supabase = createClient();
  const styleToSave = post.type === 'text' && post.style?.preset && post.style.preset !== 'default'
    ? post.style : null;

  // Duplicate guard: if an identical post by this user landed in the last
  // ~15s (double-submit, network retry, double render), return it instead of
  // inserting a second copy. Short window so deliberate re-posts still work.
  {
    const dupContent = (post.content ?? '').trim();
    if (dupContent || post.imageUrl || post.videoUrl) {
      const since = new Date(Date.now() - 15 * 1000).toISOString();
      let dupQ = supabase
        .from('posts')
        .select('*, profile:profiles!posts_user_id_fkey(display_name, avatar_url, sun_sign)')
        .eq('user_id', post.userId)
        .eq('type', post.type)
        .eq('is_deleted', false)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1) as any;
      if (dupContent) dupQ = dupQ.eq('content', post.content);
      if (post.imageUrl) dupQ = dupQ.eq('image_url', post.imageUrl);
      if (post.videoUrl) dupQ = dupQ.eq('video_url', post.videoUrl);
      const { data: existing } = await dupQ;
      if (existing && existing.length > 0) return existing[0];
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: post.userId,
      type: post.type,
      content: post.content,
      visibility: post.visibility,
      image_url: post.imageUrl || null,
      media_kind: post.mediaKind || null,
      video_url: post.videoUrl || null,
      allow_download: post.allowDownload !== false,
      style: styleToSave,
      // Set explicitly — the feed filters `.eq('is_deleted', false)`, so a
      // null default here would make new posts invisible.
      is_deleted: false,
    })
    .select('*, profile:profiles!posts_user_id_fkey(display_name, avatar_url)')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleReaction(postId: string, userId: string, emoji: ReactionEmoji): Promise<PostReaction[]> {
  const supabase = createClient();

  // Check if user already reacted with THIS emoji (toggle off)
  const { data: sameEmoji } = await supabase
    .from('post_reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle();

  if (sameEmoji) {
    // User clicked the same emoji again — remove it (toggle off)
    await supabase.from('post_reactions').delete().eq('id', sameEmoji.id);
  } else {
    // Remove any existing reaction from this user on this post (enforce single reaction)
    await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', userId);
    // Add the new reaction
    await supabase.from('post_reactions').insert({ post_id: postId, user_id: userId, emoji });
  }

  // Return updated reactions
  const { data: allReactions } = await supabase
    .from('post_reactions')
    .select('emoji, user_id')
    .eq('post_id', postId);

  const reactionMap = new Map<ReactionEmoji, PostReaction>();
  for (const r of allReactions || []) {
    const key = r.emoji as ReactionEmoji;
    if (!reactionMap.has(key)) reactionMap.set(key, { emoji: key, count: 0, userReacted: false });
    const entry = reactionMap.get(key)!;
    entry.count++;
    if (r.user_id === userId) entry.userReacted = true;
  }

  return Array.from(reactionMap.values());
}

/**
 * Post a comment, or a reply when `parentCommentId` is given. Replies are
 * one level deep — the DB rejects a reply to a reply.
 */
export async function addComment(
  postId: string,
  userId: string,
  text: string,
  parentCommentId?: string | null,
) {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated — please refresh and log in again');

  const effectiveUserId = session.user.id;

  const row: Record<string, any> = { post_id: postId, user_id: effectiveUserId, text };
  if (parentCommentId) row.parent_comment_id = parentCommentId;

  const { error: insertError } = await supabase.from('post_comments').insert(row);

  if (insertError) throw new Error(`Insert failed: ${insertError.message} (code: ${insertError.code})`);

  // Read the row back separately — a notification trigger failing on the
  // SELECT must never look like the INSERT failed.
  let readback = supabase
    .from('post_comments')
    .select('id, created_at')
    .eq('post_id', postId)
    .eq('user_id', effectiveUserId)
    .order('created_at', { ascending: false })
    .limit(1);
  readback = parentCommentId
    ? readback.eq('parent_comment_id', parentCommentId)
    : readback.is('parent_comment_id', null);

  const [commentRes, profileRes] = await Promise.all([
    readback.maybeSingle(),
    supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', effectiveUserId)
      .single(),
  ]);

  return {
    id: commentRes.data?.id || crypto.randomUUID(),
    userId: effectiveUserId,
    userName: profileRes.data?.display_name || 'User',
    userAvatar: profileRes.data?.avatar_url || undefined,
    text,
    createdAt: commentRes.data?.created_at || new Date().toISOString(),
    parentCommentId: parentCommentId || null,
    replyCount: 0,
    isEdited: false,
  } as FeedComment;
}

const COMMENT_COLUMNS = 'id, user_id, text, created_at, parent_comment_id, reply_count, is_edited';

async function hydrateComments(rows: any[]): Promise<FeedComment[]> {
  if (!rows.length) return [];
  const supabase = createClient();
  const userIds = Array.from(new Set(rows.map((c: any) => c.user_id)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds);

  const profileMap: Record<string, any> = {};
  if (profiles) profiles.forEach((p: any) => { profileMap[p.id] = p; });

  return rows.map((c: any) => {
    const p = profileMap[c.user_id];
    return {
      id: c.id,
      userId: c.user_id,
      userName: p?.display_name || 'User',
      userAvatar: p?.avatar_url || undefined,
      text: c.text,
      createdAt: c.created_at,
      parentCommentId: c.parent_comment_id || null,
      replyCount: c.reply_count || 0,
      isEdited: !!c.is_edited,
    };
  });
}

/** Top-level comments on a post, oldest first. Replies load on demand. */
export async function getComments(postId: string): Promise<FeedComment[]> {
  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from('post_comments')
    .select(COMMENT_COLUMNS)
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: true });

  if (error || !rows) return [];
  return hydrateComments(rows);
}

/** The replies under one top-level comment, oldest first. */
export async function getReplies(parentCommentId: string): Promise<FeedComment[]> {
  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from('post_comments')
    .select(COMMENT_COLUMNS)
    .eq('parent_comment_id', parentCommentId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error || !rows) return [];
  return hydrateComments(rows);
}

/** Which top-level comment a reply belongs to (notification deep-links). */
export async function getCommentParentId(commentId: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('post_comments')
    .select('parent_comment_id')
    .eq('id', commentId)
    .maybeSingle();
  return (data as any)?.parent_comment_id || null;
}

/** Edit your own comment. RLS enforces ownership. */
export async function editComment(commentId: string, text: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('post_comments')
    .update({ text, is_edited: true, edited_at: new Date().toISOString() })
    .eq('id', commentId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const supabase = createClient();
  await supabase.from('post_comments').update({ is_deleted: true }).eq('id', commentId);
}

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('posts').update({ is_deleted: true }).eq('id', postId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function editPost(postId: string, content: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('posts')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', postId);
  if (error) throw new Error(error.message);
}

export async function repostPost(userId: string, originalPost: FeedPost) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      type: originalPost.type,
      content: originalPost.content,
      visibility: 'public',
      image_url: originalPost.imageUrl || null,
      video_url: originalPost.videoUrl || null,
      original_post_id: originalPost.id,
      original_user_name: originalPost.userName,
    })
    .select('*, profile:profiles!posts_user_id_fkey(display_name, avatar_url)')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function reportPost(postId: string, userId: string, reason: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('reports')
    .insert({ post_id: postId, reporter_id: userId, reason });
  if (error) throw new Error(error.message);
}

export async function toggleBookmark(postId: string, userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return false; // unbookmarked
  } else {
    await supabase.from('bookmarks').insert({ post_id: postId, user_id: userId });
    return true; // bookmarked
  }
}

export async function getUserBookmarks(userId: string): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase
    .from('bookmarks')
    .select('post_id')
    .eq('user_id', userId);
  return new Set((data || []).map(b => b.post_id));
}
