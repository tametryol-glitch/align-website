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
  if (content.length > STORY_MAX_CHARS) throw new Error(`Keep it under ${STORY_MAX_CHARS} characters`);

  let mediaUrl: string | null = null;
  let uploadedPath: string | null = null;

  if (input.type === 'text') {
    if (!content) throw new Error('Write something first');
  } else {
    const file = input.file;
    if (!file) throw new Error('Choose a photo or video');
    const { validateUpload } = await import('./sanitize');
    const err = validateUpload(file, input.type === 'video' ? 'video' : 'image');
    if (err) throw new Error(err);
    if (input.type === 'image' && !STORY_IMAGE_TYPES.has(file.type.toLowerCase())) {
      throw new Error('Use a JPG, PNG, GIF or WebP image');
    }
    if (input.type === 'video') {
      const d = Number(input.durationSeconds);
      if (!Number.isFinite(d) || d <= 0) throw new Error('Could not read the video length');
      if (d > STORY_MAX_VIDEO_SECONDS + 0.5) throw new Error(`Videos can be up to ${STORY_MAX_VIDEO_SECONDS} seconds`);
    }

    uploadedPath = buildStoryPath(input.userId, file.name);
    const { error: upErr } = await supabase.storage
      .from(STORY_BUCKET)
      .upload(uploadedPath, file, { contentType: file.type, upsert: false });
    if (upErr) throw new Error(upErr.message);
    mediaUrl = supabase.storage.from(STORY_BUCKET).getPublicUrl(uploadedPath).data.publicUrl;
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

  const { error } = await supabase.from('stories').insert(row);
  if (error) {
    // Don't leave an orphaned file behind a failed insert.
    if (uploadedPath) await supabase.storage.from(STORY_BUCKET).remove([uploadedPath]).catch(() => {});
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

export async function deleteStory(story: Pick<Story, 'id' | 'media_url'>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('stories').delete().eq('id', story.id);
  if (error) throw new Error(error.message);
  const path = storyPathFromUrl(story.media_url);
  if (path) {
    // Best effort: the row is gone either way, a stray file is harmless.
    try { await supabase.storage.from(STORY_BUCKET).remove([path]); } catch { /* ignore */ }
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
