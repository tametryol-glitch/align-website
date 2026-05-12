import { createClient } from './supabase';

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
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'chart_share' | 'reading_share' | 'photo' | 'video' | 'text' | 'transit_alert' | 'compatibility_result';
  content: string;
  imageUrl?: string;
  mediaKind?: 'photo' | 'sticker' | 'gif';
  videoUrl?: string;
  posterUrl?: string;
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
  if (error || !rawPosts?.length) return [];

  const postIds = rawPosts.map((p: any) => p.id);

  // Batch-fetch reactions and comments
  const [reactionsRes, commentsRes] = await Promise.all([
    supabase.from('post_reactions').select('post_id, emoji, user_id').in('post_id', postIds),
    supabase.from('post_comments').select('id, post_id, user_id, text, created_at, profile:profiles!post_comments_user_id_fkey(display_name, avatar_url)').in('post_id', postIds).eq('is_deleted', false).order('created_at', { ascending: true }),
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

  const commentsMap = new Map<string, FeedComment[]>();
  const commentCountMap = new Map<string, number>();
  for (const c of commentsRes.data || []) {
    const profile = c.profile as any;
    const comment: FeedComment = {
      id: c.id,
      userId: c.user_id,
      userName: profile?.display_name || 'User',
      userAvatar: profile?.avatar_url || undefined,
      text: c.text,
      createdAt: c.created_at,
    };
    if (!commentsMap.has(c.post_id)) commentsMap.set(c.post_id, []);
    commentsMap.get(c.post_id)!.push(comment);
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
  style?: { preset?: string; font?: string } | null;
}) {
  const supabase = createClient();
  const styleToSave = post.type === 'text' && post.style?.preset && post.style.preset !== 'default'
    ? post.style : null;

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
      style: styleToSave,
    })
    .select('*, profile:profiles!posts_user_id_fkey(display_name, avatar_url)')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleReaction(postId: string, userId: string, emoji: ReactionEmoji): Promise<PostReaction[]> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from('post_reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_reactions').delete().eq('id', existing.id);
  } else {
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

export async function addComment(postId: string, userId: string, text: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: userId, text })
    .select('id, user_id, text, created_at, profile:profiles!post_comments_user_id_fkey(display_name, avatar_url)')
    .single();

  if (error) throw new Error(error.message);
  const profile = (data as any).profile;
  return {
    id: data.id,
    userId: data.user_id,
    userName: profile?.display_name || 'User',
    userAvatar: profile?.avatar_url || undefined,
    text: data.text,
    createdAt: data.created_at,
  } as FeedComment;
}

export async function getComments(postId: string): Promise<FeedComment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('post_comments')
    .select('id, user_id, text, created_at, profile:profiles!post_comments_user_id_fkey(display_name, avatar_url)')
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data || []).map((c: any) => ({
    id: c.id,
    userId: c.user_id,
    userName: c.profile?.display_name || 'User',
    userAvatar: c.profile?.avatar_url || undefined,
    text: c.text,
    createdAt: c.created_at,
  }));
}

export async function deletePost(postId: string) {
  const supabase = createClient();
  await supabase.from('posts').update({ is_deleted: true }).eq('id', postId);
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
