import { sanitizeSearchInput, validateUpload } from './sanitize';

/**
 * Community Service — Web port
 * All CRUD, discovery, moderation, reactions, comments, and reporting for communities.
 * Database tables: communities, community_members, community_posts,
 * community_post_likes, community_post_comments, community_post_reactions,
 * community_reports, community_bans
 */

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// ── Types ───────────────────────────────────────────────────────────

export type CommunityRole = 'owner' | 'admin' | 'member';
export type CommunityCategory = 'sun_sign' | 'moon_sign' | 'rising_sign' | 'transit' | 'synastry' | 'general' | 'learning' | 'spiritual' | 'career' | 'love';
export type PostType = 'discussion' | 'question' | 'announcement' | 'chart_share' | 'transit_checkin' | 'compatibility' | 'reading_request' | 'event' | 'insight';
export type FeedSortMode = 'newest' | 'popular' | 'rising';
export type ReportReason = 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'inappropriate' | 'scam' | 'off_topic' | 'other';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  zodiac_sign?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  rules?: string | null;
  welcome_message?: string | null;
  is_public: boolean;
  member_count: number;
  post_count: number;
  created_by: string;
  created_at: string;
}

export interface CommunityMember {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  sun_sign?: string | null;
  role: CommunityRole;
  joined_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string | null;
  user_role?: CommunityRole;
  content: string;
  image_url?: string | null;
  media_kind?: string | null;
  style?: string | null;
  post_type: PostType;
  topic?: string | null;
  likes: string[];
  reactions: ReactionGroup[];
  comment_count: number;
  created_at: string;
  edited_at?: string | null;
  is_pinned: boolean;
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  user_reacted: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string | null;
  text: string;
  created_at: string;
}

// ── Constants ───────────────────────────────────────────────────────

export const COMMUNITY_CATEGORIES: { id: CommunityCategory; label: string; emoji: string }[] = [
  { id: 'sun_sign', label: 'Sun Signs', emoji: '☀️' },
  { id: 'moon_sign', label: 'Moon Signs', emoji: '🌙' },
  { id: 'rising_sign', label: 'Rising Signs', emoji: '⬆️' },
  { id: 'transit', label: 'Transits', emoji: '🪐' },
  { id: 'synastry', label: 'Synastry', emoji: '💞' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'spiritual', label: 'Spiritual', emoji: '🧘' },
  { id: 'career', label: 'Career', emoji: '💼' },
  { id: 'love', label: 'Love', emoji: '❤️' },
  { id: 'general', label: 'General', emoji: '✨' },
];

export const ZODIAC_OPTIONS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

export const ZODIAC_EMOJIS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export const POST_TYPE_META: Record<PostType, { label: string; emoji: string; color: string }> = {
  discussion:      { label: 'Discussion',      emoji: '💬', color: '#8B5CF6' },
  question:        { label: 'Question',         emoji: '❓', color: '#3B82F6' },
  announcement:    { label: 'Announcement',     emoji: '📣', color: '#F59E0B' },
  chart_share:     { label: 'Chart Share',      emoji: '🗺️', color: '#10B981' },
  transit_checkin:  { label: 'Transit Check-in', emoji: '🪐', color: '#06B6D4' },
  compatibility:   { label: 'Compatibility',    emoji: '💞', color: '#EC4899' },
  reading_request: { label: 'Reading Request',  emoji: '🔮', color: '#8B5CF6' },
  event:           { label: 'Event',            emoji: '📅', color: '#EF4444' },
  insight:         { label: 'Insight',          emoji: '💡', color: '#F5A623' },
};

export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: 'spam', label: 'Spam' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'hate_speech', label: 'Hate Speech' },
  { id: 'misinformation', label: 'Misinformation' },
  { id: 'inappropriate', label: 'Inappropriate Content' },
  { id: 'scam', label: 'Scam' },
  { id: 'off_topic', label: 'Off Topic' },
  { id: 'other', label: 'Other' },
];

export const REACTION_OPTIONS = ['✨', '💜', '🔥', '🌙', '💫', '🙏'];

// ── Helpers ─────────────────────────────────────────────────────────

function getMyId(): string | null {
  return useAuthStore.getState().user?.id || null;
}

async function fetchProfileMap(
  userIds: string[],
): Promise<Map<string, { display_name: string; avatar_url: string | null }>> {
  const map = new Map<string, { display_name: string; avatar_url: string | null }>();
  if (userIds.length === 0) return map;
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', Array.from(new Set(userIds)));
  if (data) {
    for (const p of data) map.set(p.id, { display_name: p.display_name || 'Unknown', avatar_url: p.avatar_url });
  }
  return map;
}

async function getMemberCount(communityId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('community_members')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', communityId);
  return count || 0;
}

async function getPostCount(communityId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', communityId)
    .eq('is_deleted', false);
  return count || 0;
}

// ── Media Uploads ────────────────────────────────────────────────────

/** Upload a community banner image */
export async function uploadCommunityBanner(communityId: string, file: File): Promise<string | null> {
  const err = validateUpload(file, 'image');
  if (err) { console.warn('[Community] banner upload rejected:', err); return null; }

  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${communityId}/banner.${ext}`;
  const { error } = await supabase.storage.from('community-images').upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from('community-images').getPublicUrl(path);
  return data.publicUrl;
}

/** Upload a community avatar image */
export async function uploadCommunityAvatar(communityId: string, file: File): Promise<string | null> {
  const err = validateUpload(file, 'image');
  if (err) { console.warn('[Community] avatar upload rejected:', err); return null; }

  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${communityId}/avatar.${ext}`;
  const { error } = await supabase.storage.from('community-avatars').upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from('community-avatars').getPublicUrl(path);
  return data.publicUrl;
}

/** Upload media for a community post (image or video) */
export async function uploadCommunityPostMedia(communityId: string, file: File): Promise<{ url: string; mediaKind: string } | null> {
  const isVideo = file.type.startsWith('video/');
  const err = validateUpload(file, isVideo ? 'video' : 'image');
  if (err) { console.warn('[Community] post media upload rejected:', err); return null; }

  const supabase = createClient();
  const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const mediaKind = isVideo ? 'video' : 'photo';
  const path = `${communityId}/posts/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('community-images').upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from('community-images').getPublicUrl(path);
  return { url: data.publicUrl, mediaKind };
}

// ── Community CRUD ──────────────────────────────────────────────────

export async function createCommunity(params: {
  name: string;
  description: string;
  category: CommunityCategory;
  zodiac_sign?: string | null;
  rules?: string | null;
  is_public?: boolean;
  welcome_message?: string | null;
}): Promise<{ success: boolean; community?: Community; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };
  const supabase = createClient();

  // Try RPC first (atomic: creates community + owner member)
  try {
    const { data, error } = await supabase.rpc('create_community_with_owner', {
      p_name: params.name,
      p_description: params.description,
      p_category: params.category,
      p_zodiac_sign: params.zodiac_sign || null,
      p_rules: params.rules || null,
      p_is_public: params.is_public ?? true,
    });
    if (!error && data) {
      // Set welcome message if provided
      if (params.welcome_message && data.id) {
        await updateWelcomeMessage(data.id, params.welcome_message);
      }
      return {
        success: true,
        community: { ...data, member_count: 1, post_count: 0 } as Community,
      };
    }
    if (error) throw error;
  } catch {
    // Fallback to manual insert
  }

  // Fallback: manual insert
  const { data: comm, error: insertErr } = await supabase
    .from('communities')
    .insert({
      name: params.name,
      description: params.description,
      category: params.category,
      zodiac_sign: params.zodiac_sign || null,
      rules: params.rules || null,
      welcome_message: params.welcome_message || null,
      is_public: params.is_public ?? true,
      created_by: myId,
    })
    .select()
    .single();

  if (insertErr || !comm) return { success: false, error: insertErr?.message || 'Failed to create' };

  // Add creator as owner
  await supabase.from('community_members').insert({
    community_id: comm.id,
    user_id: myId,
    role: 'owner',
  });

  return {
    success: true,
    community: { ...comm, member_count: 1, post_count: 0 } as Community,
  };
}

export async function getCommunity(communityId: string): Promise<Community | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', communityId)
    .eq('is_deleted', false)
    .single();

  if (error || !data) return null;

  const [memberCount, postCount] = await Promise.all([
    getMemberCount(communityId),
    getPostCount(communityId),
  ]);

  return { ...data, member_count: memberCount, post_count: postCount } as Community;
}

export async function browseCommunities(params?: {
  category?: CommunityCategory;
  search?: string;
  limit?: number;
}): Promise<Community[]> {
  const supabase = createClient();
  let query = supabase
    .from('communities')
    .select('*')
    .eq('is_public', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(params?.limit || 50);

  if (params?.category) query = query.eq('category', params.category);
  if (params?.search) {
    const s = sanitizeSearchInput(params.search);
    query = query.or(`name.ilike.%${s}%,description.ilike.%${s}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  // Batch fetch member + post counts
  const ids = data.map((c: any) => c.id);
  const countMap = new Map<string, { members: number; posts: number }>();

  if (ids.length > 0) {
    const [memberRows, postRows] = await Promise.all([
      supabase.from('community_members').select('community_id').in('community_id', ids),
      supabase.from('community_posts').select('community_id').in('community_id', ids).eq('is_deleted', false),
    ]);

    for (const id of ids) countMap.set(id, { members: 0, posts: 0 });
    if (memberRows.data) {
      for (const r of memberRows.data) {
        const cur = countMap.get(r.community_id);
        if (cur) cur.members++;
      }
    }
    if (postRows.data) {
      for (const r of postRows.data) {
        const cur = countMap.get(r.community_id);
        if (cur) cur.posts++;
      }
    }
  }

  return data.map((c: any) => ({
    ...c,
    member_count: countMap.get(c.id)?.members || 0,
    post_count: countMap.get(c.id)?.posts || 0,
  }));
}

export async function getMyCommunities(): Promise<Community[]> {
  const myId = getMyId();
  if (!myId) return [];
  const supabase = createClient();

  const { data: memberships } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('user_id', myId);

  if (!memberships || memberships.length === 0) return [];

  const communityIds = memberships.map(m => m.community_id);
  const { data: communities } = await supabase
    .from('communities')
    .select('*')
    .in('id', communityIds)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (!communities) return [];

  // Batch counts
  const countMap = new Map<string, { members: number; posts: number }>();
  const [memberRows, postRows] = await Promise.all([
    supabase.from('community_members').select('community_id').in('community_id', communityIds),
    supabase.from('community_posts').select('community_id').in('community_id', communityIds).eq('is_deleted', false),
  ]);

  for (const id of communityIds) countMap.set(id, { members: 0, posts: 0 });
  if (memberRows.data) for (const r of memberRows.data) { const c = countMap.get(r.community_id); if (c) c.members++; }
  if (postRows.data) for (const r of postRows.data) { const c = countMap.get(r.community_id); if (c) c.posts++; }

  return communities.map((c: any) => ({
    ...c,
    member_count: countMap.get(c.id)?.members || 0,
    post_count: countMap.get(c.id)?.posts || 0,
  }));
}

// ── Membership ──────────────────────────────────────────────────────

export async function joinCommunity(communityId: string): Promise<boolean> {
  const myId = getMyId();
  if (!myId) return false;
  const supabase = createClient();
  const { error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, user_id: myId, role: 'member' });
  return !error;
}

export async function leaveCommunity(communityId: string): Promise<boolean> {
  const myId = getMyId();
  if (!myId) return false;
  const supabase = createClient();
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', myId);
  return !error;
}

export async function isMember(communityId: string): Promise<{ member: boolean; role?: CommunityRole }> {
  const myId = getMyId();
  if (!myId) return { member: false };
  const supabase = createClient();
  const { data } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', myId)
    .single();
  if (!data) return { member: false };
  return { member: true, role: data.role as CommunityRole };
}

export async function getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
  const supabase = createClient();
  const { data: members } = await supabase
    .from('community_members')
    .select('user_id, role, joined_at')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: true });

  if (!members || members.length === 0) return [];

  const profileMap = await fetchProfileMap(members.map(m => m.user_id));

  return members.map((m: any) => {
    const prof = profileMap.get(m.user_id);
    return {
      user_id: m.user_id,
      display_name: prof?.display_name || 'Unknown',
      avatar_url: prof?.avatar_url || null,
      role: m.role as CommunityRole,
      joined_at: m.joined_at,
    };
  });
}

export async function promoteMember(communityId: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('community_members')
    .update({ role: 'admin' })
    .eq('community_id', communityId)
    .eq('user_id', userId);
  return !error;
}

export async function removeMember(communityId: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId);
  return !error;
}

// ── Posts ────────────────────────────────────────────────────────────

export async function createCommunityPost(
  communityId: string,
  content: string,
  postType: PostType = 'discussion',
  topic?: string,
  imageUrl?: string,
  mediaKind?: string,
  style?: string,
): Promise<{ success: boolean; post?: CommunityPost; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };
  const supabase = createClient();

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      community_id: communityId,
      user_id: myId,
      content,
      post_type: postType,
      topic: topic || null,
      image_url: imageUrl || null,
      media_kind: mediaKind || null,
      ...(style ? { style } : {}),
      is_pinned: false,
      is_deleted: false,
    })
    .select()
    .single();

  if (error || !data) return { success: false, error: error?.message || 'Failed' };

  const profileMap = await fetchProfileMap([myId]);
  const prof = profileMap.get(myId);

  return {
    success: true,
    post: {
      id: data.id,
      community_id: communityId,
      user_id: myId,
      user_name: prof?.display_name || 'You',
      user_avatar: prof?.avatar_url,
      content: data.content,
      image_url: data.image_url,
      media_kind: data.media_kind,
      style: data.style,
      post_type: data.post_type || 'discussion',
      topic: data.topic,
      likes: [],
      reactions: [],
      comment_count: 0,
      created_at: data.created_at,
      is_pinned: false,
    },
  };
}

export async function getCommunityPosts(
  communityId: string,
  options?: {
    limit?: number;
    sortBy?: FeedSortMode;
    search?: string;
    postType?: PostType;
  },
): Promise<CommunityPost[]> {
  const myId = getMyId();
  const supabase = createClient();
  const limit = options?.limit || 50;

  let query = supabase
    .from('community_posts')
    .select('*')
    .eq('community_id', communityId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (options?.search) query = query.ilike('content', `%${sanitizeSearchInput(options.search)}%`);
  if (options?.postType) query = query.eq('post_type', options.postType);

  const { data: posts, error } = await query;
  if (error || !posts || posts.length === 0) return [];

  const postIds = posts.map((p: any) => p.id);
  const userIds = Array.from(new Set(posts.map((p: any) => p.user_id)));

  // Batch fetch: profiles, likes, comment counts, reactions, member roles
  const [profileMap, likesResult, commentsResult, reactionsResult, rolesResult] = await Promise.all([
    fetchProfileMap(userIds),
    supabase.from('community_post_likes').select('post_id, user_id').in('post_id', postIds),
    supabase.from('community_post_comments').select('post_id').in('post_id', postIds).eq('is_deleted', false),
    Promise.resolve(supabase.from('community_post_reactions').select('post_id, user_id, emoji').in('post_id', postIds)).catch(() => ({ data: null, error: null })),
    supabase.from('community_members').select('user_id, role').eq('community_id', communityId).in('user_id', userIds),
  ]);

  // Build lookup maps
  const likesMap = new Map<string, string[]>();
  if (likesResult.data) {
    for (const l of likesResult.data) {
      if (!likesMap.has(l.post_id)) likesMap.set(l.post_id, []);
      likesMap.get(l.post_id)!.push(l.user_id);
    }
  }

  const commentCountMap = new Map<string, number>();
  if (commentsResult.data) {
    for (const c of commentsResult.data) {
      commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
    }
  }

  const reactionsMap = new Map<string, ReactionGroup[]>();
  if (reactionsResult.data) {
    const byPost = new Map<string, Map<string, { count: number; userReacted: boolean }>>();
    for (const r of reactionsResult.data as any[]) {
      if (!byPost.has(r.post_id)) byPost.set(r.post_id, new Map());
      const emojiMap = byPost.get(r.post_id)!;
      if (!emojiMap.has(r.emoji)) emojiMap.set(r.emoji, { count: 0, userReacted: false });
      const entry = emojiMap.get(r.emoji)!;
      entry.count++;
      if (r.user_id === myId) entry.userReacted = true;
    }
    Array.from(byPost.entries()).forEach(([postId, emojiMap]) => {
      reactionsMap.set(postId, Array.from(emojiMap.entries()).map(([emoji, data]) => ({
        emoji, count: data.count, user_reacted: data.userReacted,
      })));
    });
  }

  const roleMap = new Map<string, CommunityRole>();
  if (rolesResult.data) {
    for (const r of rolesResult.data) roleMap.set(r.user_id, r.role as CommunityRole);
  }

  let result: CommunityPost[] = posts.map((p: any) => {
    const prof = profileMap.get(p.user_id);
    return {
      id: p.id,
      community_id: p.community_id,
      user_id: p.user_id,
      user_name: prof?.display_name || 'Unknown',
      user_avatar: prof?.avatar_url || null,
      user_role: roleMap.get(p.user_id),
      content: p.content,
      image_url: p.image_url,
      media_kind: p.media_kind,
      style: p.style,
      post_type: p.post_type || 'discussion',
      topic: p.topic,
      likes: likesMap.get(p.id) || [],
      reactions: reactionsMap.get(p.id) || [],
      comment_count: commentCountMap.get(p.id) || 0,
      created_at: p.created_at,
      edited_at: p.edited_at,
      is_pinned: p.is_pinned || false,
    };
  });

  // Sort pinned first, then by sort mode
  const pinned = result.filter(p => p.is_pinned);
  const unpinned = result.filter(p => !p.is_pinned);

  if (options?.sortBy === 'popular') {
    unpinned.sort((a, b) => {
      const engA = a.likes.length + a.comment_count + a.reactions.reduce((s, r) => s + r.count, 0);
      const engB = b.likes.length + b.comment_count + b.reactions.reduce((s, r) => s + r.count, 0);
      return engB - engA;
    });
  } else if (options?.sortBy === 'rising') {
    const now = Date.now();
    unpinned.sort((a, b) => {
      const ageA = Math.max(1, (now - new Date(a.created_at).getTime()) / 3600000);
      const ageB = Math.max(1, (now - new Date(b.created_at).getTime()) / 3600000);
      const engA = (a.likes.length + a.comment_count) / ageA;
      const engB = (b.likes.length + b.comment_count) / ageB;
      return engB - engA;
    });
  }

  return [...pinned, ...unpinned];
}

export async function editCommunityPost(
  postId: string,
  newContent: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('community_posts')
    .update({ content: newContent, edited_at: new Date().toISOString() })
    .eq('id', postId);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteCommunityPost(communityId: string, postId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('community_posts')
    .update({ is_deleted: true })
    .eq('id', postId);
  return !error;
}

export async function togglePinPost(communityId: string, postId: string): Promise<boolean> {
  const supabase = createClient();
  // Get current state
  const { data } = await supabase
    .from('community_posts')
    .select('is_pinned')
    .eq('id', postId)
    .single();
  if (!data) return false;
  const { error } = await supabase
    .from('community_posts')
    .update({ is_pinned: !data.is_pinned })
    .eq('id', postId);
  return !error;
}

// ── Likes ───────────────────────────────────────────────────────────

export async function likeCommunityPost(postId: string): Promise<string[]> {
  const myId = getMyId();
  if (!myId) return [];
  const supabase = createClient();

  // Check if already liked
  const { data: existing } = await supabase
    .from('community_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', myId)
    .single();

  if (existing) {
    await supabase.from('community_post_likes').delete().eq('id', existing.id);
  } else {
    await supabase.from('community_post_likes').insert({ post_id: postId, user_id: myId });
  }

  const { data: allLikes } = await supabase
    .from('community_post_likes')
    .select('user_id')
    .eq('post_id', postId);
  return (allLikes || []).map((l: any) => l.user_id);
}

// ── Reactions ───────────────────────────────────────────────────────

export async function toggleCommunityReaction(
  postId: string,
  emoji: string,
): Promise<ReactionGroup[]> {
  const myId = getMyId();
  if (!myId) return [];
  const supabase = createClient();

  try {
    // Check if user already reacted with THIS emoji (toggle off)
    const { data: existing } = await supabase
      .from('community_post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', myId)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      // Same emoji — remove it (toggle off)
      await supabase.from('community_post_reactions').delete().eq('id', existing.id);
    } else {
      // Different emoji or no reaction — remove ALL existing reactions by this user on this post first
      await supabase.from('community_post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', myId);
      // Then insert the new one
      await supabase.from('community_post_reactions').insert({
        post_id: postId, user_id: myId, emoji,
      });
    }
  } catch {
    // Table may not exist yet
  }

  return getCommunityPostReactions(postId);
}

export async function getCommunityPostReactions(postId: string): Promise<ReactionGroup[]> {
  const myId = getMyId();
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from('community_post_reactions')
      .select('emoji, user_id')
      .eq('post_id', postId);
    if (!data) return [];
    const grouped = new Map<string, { count: number; user_reacted: boolean }>();
    for (const r of data) {
      if (!grouped.has(r.emoji)) grouped.set(r.emoji, { count: 0, user_reacted: false });
      const g = grouped.get(r.emoji)!;
      g.count++;
      if (r.user_id === myId) g.user_reacted = true;
    }
    return Array.from(grouped.entries()).map(([emoji, d]) => ({
      emoji, count: d.count, user_reacted: d.user_reacted,
    }));
  } catch {
    return [];
  }
}

// ── Comments ────────────────────────────────────────────────────────

export async function commentOnCommunityPost(
  postId: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };
  const supabase = createClient();
  const { error } = await supabase
    .from('community_post_comments')
    .insert({ post_id: postId, user_id: myId, text });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function getCommunityPostComments(postId: string): Promise<CommunityComment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('community_post_comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return [];

  const profileMap = await fetchProfileMap(data.map((c: any) => c.user_id));

  return data.map((c: any) => {
    const prof = profileMap.get(c.user_id);
    return {
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      user_name: prof?.display_name || 'Unknown',
      user_avatar: prof?.avatar_url || null,
      text: c.text,
      created_at: c.created_at,
    };
  });
}

// ── Reporting ───────────────────────────────────────────────────────

export async function reportCommunityPost(
  communityId: string,
  postId: string,
  reason: ReportReason,
  details?: string,
): Promise<{ success: boolean; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };
  const supabase = createClient();
  const { error } = await supabase
    .from('community_reports')
    .insert({
      community_id: communityId,
      post_id: postId,
      reporter_id: myId,
      reason,
      details: details || null,
      status: 'pending',
    });
  return error ? { success: false, error: error.message } : { success: true };
}

// ── Welcome Message ─────────────────────────────────────────────────

export async function updateWelcomeMessage(communityId: string, message: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('communities')
    .update({ welcome_message: message })
    .eq('id', communityId);
  return !error;
}

/** Update a community's banner URL in the database */
export async function updateCommunityBanner(communityId: string, bannerUrl: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('communities')
    .update({ banner_url: bannerUrl })
    .eq('id', communityId);
  return !error;
}

/** Update a community's avatar URL in the database */
export async function updateCommunityAvatar(communityId: string, avatarUrl: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('communities')
    .update({ avatar_url: avatarUrl })
    .eq('id', communityId);
  return !error;
}

// ── Topics ──────────────────────────────────────────────────────────

export async function getCommunityTopics(communityId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('community_posts')
    .select('topic')
    .eq('community_id', communityId)
    .eq('is_deleted', false)
    .not('topic', 'is', null);
  if (!data) return [];
  return Array.from(new Set(data.map((d: any) => d.topic).filter(Boolean)));
}
