// =============================================================================
// Stories — 24h disappearing photo / video / text frames
// =============================================================================
// Contract: supabase-migration-stories.sql
//   stories, story_views, story_reactions tables + get_story_rail() RPC,
//   media in the public 'story-media' bucket under <user_id>/.
// The 'story_reaction' notification is written by a DB trigger — never from
// here.
// =============================================================================

import { createClient } from './supabase';

export type StoryType = 'text' | 'image' | 'video';
export type StoryVisibility = 'public' | 'friends';

export interface Story {
  id: string;
  type: StoryType;
  content: string | null;
  media_url: string | null;
  /** Poster frame for video stories (rail preview); null for older stories. */
  thumbnail_url: string | null;
  background_color: string | null;
  duration_seconds: number | null;
  visibility: StoryVisibility;
  /** Only populated for the viewer's own stories. */
  view_count: number | null;
  created_at: string;
  expires_at: string;
  seen: boolean;
}

export interface StoryGroup {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  all_seen: boolean;
  latest_at: string;
  /** Oldest → newest. */
  stories: Story[];
}

export interface StoryViewer {
  viewer_id: string;
  viewed_at: string;
  display_name: string | null;
  avatar_url: string | null;
  emoji: string | null;
}

export interface StoryReaction {
  user_id: string;
  emoji: string;
  created_at: string;
}

export const STORY_BUCKET = 'story-media';
export const STORY_MAX_CHARS = 500;
export const STORY_MAX_VIDEO_SECONDS = 60;
export const STORY_IMAGE_SECONDS = 5;
export const STORY_REACTIONS = ['❤️', '🔥', '😂', '😮', '😢', '👏'] as const;
export const STORY_BACKGROUNDS = ['#7C3AED', '#DB2777', '#2563EB', '#059669', '#EA580C', '#111827'] as const;

// SVG is allowed for post images elsewhere; stories are photos, so keep to
// raster formats only.
const STORY_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

/** Validation failures carry a code so the UI can show a translated message. */
export type StoryErrorCode = 'upload' | 'textTooLong' | 'empty' | 'noFile' | 'imageType' | 'videoLength' | 'videoTooLong';

function storyError(code: StoryErrorCode, message: string): Error & { code: StoryErrorCode } {
  return Object.assign(new Error(message), { code });
}

/** How long a frame stays on screen, in milliseconds. */
export function storyDurationMs(story: Pick<Story, 'type' | 'duration_seconds'>): number {
  if (story.type === 'video') {
    const s = Number(story.duration_seconds);
    if (Number.isFinite(s) && s > 0) return Math.min(s, STORY_MAX_VIDEO_SECONDS) * 1000;
  }
  return STORY_IMAGE_SECONDS * 1000;
}

/** Storage path: first folder MUST be the uploader's uid (bucket RLS). */
export function buildStoryPath(userId: string, fileName: string, now: number = Date.now()): string {
  const raw = (fileName.split('.').pop() || '').toLowerCase();
  const ext = /^[a-z0-9]{1,5}$/.test(raw) && raw !== fileName.toLowerCase() ? raw : 'bin';
  return `${userId}/${now}.${ext}`;
}

/** Object path inside the bucket from a public URL, or null if it isn't one of ours. */
export function storyPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/object/public/${STORY_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = url.slice(i + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
}

/** Reads a local video file's duration in seconds (browser only). */
export function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    const done = (fn: () => void) => { URL.revokeObjectURL(url); fn(); };
    video.onloadedmetadata = () => done(() => {
      const d = video.duration;
      if (Number.isFinite(d) && d > 0) resolve(d);
      else reject(new Error('Could not read the video length'));
    });
    video.onerror = () => done(() => reject(new Error('This video format could not be read')));
    video.src = url;
  });
}

function normaliseStory(s: any): Story {
  return {
    id: s.id,
    type: s.type,
    content: s.content ?? null,
    media_url: s.media_url ?? null,
    thumbnail_url: s.thumbnail_url ?? null,
    background_color: s.background_color ?? null,
    duration_seconds: s.duration_seconds == null ? null : Number(s.duration_seconds),
    visibility: s.visibility === 'friends' ? 'friends' : 'public',
    view_count: s.view_count == null ? null : Number(s.view_count),
    created_at: s.created_at,
    expires_at: s.expires_at,
    seen: !!s.seen,
  };
}

export async function getStoryRail(): Promise<StoryGroup[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_story_rail');
  if (error) throw new Error(error.message);
  const now = Date.now();
  return ((data as any[]) || [])
    .map((g) => ({
      user_id: g.user_id,
      display_name: g.display_name ?? null,
      avatar_url: g.avatar_url ?? null,
      all_seen: !!g.all_seen,
      latest_at: g.latest_at,
      stories: (Array.isArray(g.stories) ? g.stories : [])
        .map(normaliseStory)
        // A frame can expire between the query and the render.
        .filter((s: Story) => new Date(s.expires_at).getTime() > now),
    }))
    .filter((g) => g.stories.length > 0);
}

/**
 * Grab one frame of a local video as a JPEG, for the rail preview card.
 * Browser only. Resolves null rather than failing the post: a missing
 * poster just means the card falls back to loading the video itself.
 */
export function captureVideoPoster(file: File, maxWidth = 540): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    let settled = false;
    const finish = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    const timer = setTimeout(() => finish(null), 8000);
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      // A little way in: frame 0 is often black.
      const d = Number.isFinite(video.duration) ? video.duration : 0;
      video.currentTime = Math.min(0.5, d / 2);
    };
    video.onseeked = () => {
      try {
        const w = video.videoWidth, h = video.videoHeight;
        if (!w || !h) return finish(null);
        const scale = Math.min(1, maxWidth / w);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return finish(null);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => finish(b), 'image/jpeg', 0.8);
      } catch {
        finish(null);
      }
    };
    video.onerror = () => finish(null);
    video.src = url;
  });
}

export async function createStory(input: {
  userId: string;
  type: StoryType;
  content?: string;
  file?: File | null;
  backgroundColor?: string | null;
  durationSeconds?: number | null;
  visibility: StoryVisibility;
}): Promise<void> {
  const supabase = createClient();
  const content = (input.content || '').trim();
  if (content.length > STORY_MAX_CHARS) throw storyError('textTooLong', `Keep it under ${STORY_MAX_CHARS} characters`);

  let mediaUrl: string | null = null;
  let uploadedPath: string | null = null;
  let thumbUrl: string | null = null;
  let thumbPath: string | null = null;

  if (input.type === 'text') {
    if (!content) throw storyError('empty', 'Write something first');
  } else {
    const file = input.file;
    if (!file) throw storyError('noFile', 'Choose a photo or video');
    const { validateUpload } = await import('./sanitize');
    const err = validateUpload(file, input.type === 'video' ? 'video' : 'image');
    if (err) throw storyError('upload', err);
    if (input.type === 'image' && !STORY_IMAGE_TYPES.has(file.type.toLowerCase())) {
      throw storyError('imageType', 'Use a JPG, PNG, GIF or WebP image');
    }
    if (input.type === 'video') {
      const d = Number(input.durationSeconds);
      if (!Number.isFinite(d) || d <= 0) throw storyError('videoLength', 'Could not read the video length');
      if (d > STORY_MAX_VIDEO_SECONDS + 0.5) throw storyError('videoTooLong', `Videos can be up to ${STORY_MAX_VIDEO_SECONDS} seconds`);
    }

    uploadedPath = buildStoryPath(input.userId, file.name);
    const { error: upErr } = await supabase.storage
      .from(STORY_BUCKET)
      .upload(uploadedPath, file, { contentType: file.type, upsert: false });
    if (upErr) throw new Error(upErr.message);
    mediaUrl = supabase.storage.from(STORY_BUCKET).getPublicUrl(uploadedPath).data.publicUrl;

    if (input.type === 'video') {
      // Optional: the story posts fine without it.
      const poster = await captureVideoPoster(file);
      if (poster) {
        const p = uploadedPath.replace(/\.[a-z0-9]+$/, '') + '_thumb.jpg';
        const { error: thErr } = await supabase.storage
          .from(STORY_BUCKET)
          .upload(p, poster, { contentType: 'image/jpeg', upsert: false });
        if (!thErr) {
          thumbPath = p;
          thumbUrl = supabase.storage.from(STORY_BUCKET).getPublicUrl(p).data.publicUrl;
        }
      }
    }
  }

  const row: Record<string, unknown> = {
    user_id: input.userId,
    type: input.type,
    content: content || null,
    media_url: mediaUrl,
    visibility: input.visibility,
  };
  if (input.type === 'text') row.background_color = input.backgroundColor || STORY_BACKGROUNDS[0];
  if (input.type === 'video') row.duration_seconds = Math.round(Number(input.durationSeconds) * 100) / 100;
  if (thumbUrl) row.thumbnail_url = thumbUrl;

  const { error } = await supabase.from('stories').insert(row);
  if (error) {
    // Don't leave an orphaned file behind a failed insert.
    const orphans = [uploadedPath, thumbPath].filter((x): x is string => !!x);
    if (orphans.length) await supabase.storage.from(STORY_BUCKET).remove(orphans).catch(() => {});
    throw new Error(error.message);
  }
}

export async function markStoryViewed(storyId: string, viewerId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('story_views')
    .upsert({ story_id: storyId, viewer_id: viewerId }, { onConflict: 'story_id,viewer_id', ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

export async function reactToStory(storyId: string, userId: string, emoji: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('story_reactions')
    .upsert({ story_id: storyId, user_id: userId, emoji }, { onConflict: 'story_id,user_id' });
  if (error) throw new Error(error.message);
}

export async function getStoryReactions(storyId: string): Promise<StoryReaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('story_reactions')
    .select('user_id, emoji, created_at')
    .eq('story_id', storyId);
  if (error) throw new Error(error.message);
  return (data as StoryReaction[]) || [];
}

/** Owner only (RLS): who has seen a frame, newest first, with their reaction. */
export async function getStoryViewers(storyId: string): Promise<StoryViewer[]> {
  const supabase = createClient();
  const [viewsRes, reactions] = await Promise.all([
    supabase
      .from('story_views')
      .select('viewer_id, viewed_at, profile:profiles!story_views_viewer_id_fkey(display_name, avatar_url)')
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false }),
    getStoryReactions(storyId).catch(() => [] as StoryReaction[]),
  ]);
  if (viewsRes.error) throw new Error(viewsRes.error.message);
  const emojiBy = new Map(reactions.map((r) => [r.user_id, r.emoji]));
  const viewers: StoryViewer[] = ((viewsRes.data as any[]) || []).map((v) => {
    const p = Array.isArray(v.profile) ? v.profile[0] : v.profile;
    return {
      viewer_id: v.viewer_id,
      viewed_at: v.viewed_at,
      display_name: p?.display_name ?? null,
      avatar_url: p?.avatar_url ?? null,
      emoji: emojiBy.get(v.viewer_id) ?? null,
    };
  });
  return viewers;
}

export async function deleteStory(story: Pick<Story, 'id' | 'media_url'> & { thumbnail_url?: string | null }): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('stories').delete().eq('id', story.id);
  if (error) throw new Error(error.message);
  const paths = [storyPathFromUrl(story.media_url), storyPathFromUrl(story.thumbnail_url)]
    .filter((x): x is string => !!x);
  if (paths.length) {
    // Best effort: the row is gone either way, a stray file is harmless.
    try { await supabase.storage.from(STORY_BUCKET).remove(paths); } catch { /* ignore */ }
  }
}

/** "now", "5m", "3h" — stories never live past 24h. */
export function storyTimeAgo(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ── Reply to a story by direct message ───────────────────────────────
// A story reply is an ordinary 'text' DM (messages_type_check has no story
// type) carrying a snapshot of the story in metadata, so the chat can show
// what was replied to even after the story row is gone. Push for the DM is
// handled by the messages DB trigger — never from here.

export const STORY_REPLY_KIND = 'story_reply';
export const STORY_REPLY_QUOTE_CHARS = 140;
export const STORY_REPLY_MAX_CHARS = 1000;

export interface StoryReplyMetadata {
  kind: typeof STORY_REPLY_KIND;
  story_id: string;
  story_owner_id: string;
  story_type: StoryType;
  /** null for text stories. */
  story_media_url: string | null;
  story_text: string | null;
  story_background_color: string | null;
  story_expires_at: string;
}

export function buildStoryReplyMetadata(
  story: Pick<Story, 'id' | 'type' | 'content' | 'media_url' | 'background_color' | 'expires_at'>,
  ownerId: string,
): StoryReplyMetadata {
  const text = (story.content || '').trim();
  const quoted = text.length > STORY_REPLY_QUOTE_CHARS
    ? `${text.slice(0, STORY_REPLY_QUOTE_CHARS - 1).trimEnd()}…`
    : text;
  return {
    kind: STORY_REPLY_KIND,
    story_id: story.id,
    story_owner_id: ownerId,
    story_type: story.type,
    story_media_url: story.type === 'text' ? null : story.media_url || null,
    story_text: quoted || null,
    story_background_color: story.background_color || null,
    story_expires_at: story.expires_at,
  };
}

/** True when a message's metadata is a story reply. */
export function isStoryReplyMetadata(m: unknown): m is StoryReplyMetadata {
  return !!m && typeof m === 'object' && (m as any).kind === STORY_REPLY_KIND && typeof (m as any).story_id === 'string';
}

export async function replyToStory(
  story: Pick<Story, 'id' | 'type' | 'content' | 'media_url' | 'background_color' | 'expires_at'>,
  ownerId: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  const body = text.trim().slice(0, STORY_REPLY_MAX_CHARS);
  if (!body) return { success: false, error: 'Write a reply first' };
  // Lazy: keeps the messaging layer (auth store, push prompts) out of every
  // story import and out of the pure-helper unit tests.
  const { getOrCreateConversation, sendMessage } = await import('./messagingService');
  const conversationId = await getOrCreateConversation(ownerId);
  if (!conversationId) return { success: false, error: 'Could not open a conversation' };
  const res = await sendMessage(conversationId, body, 'text', buildStoryReplyMetadata(story, ownerId));
  return res.success ? { success: true } : { success: false, error: res.error || 'Could not send your reply' };
}
