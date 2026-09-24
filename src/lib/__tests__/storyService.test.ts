import { describe, it, expect, vi } from 'vitest';

vi.mock('../supabase', () => ({ createClient: () => ({}) }));

import {
  buildStoryPath, storyPathFromUrl, storyDurationMs, storyTimeAgo,
  buildStoryReplyMetadata, isStoryReplyMetadata, STORY_REPLY_QUOTE_CHARS,
} from '../storyService';

describe('buildStoryPath', () => {
  it('puts the uploader uid first (bucket RLS) and keeps the extension', () => {
    expect(buildStoryPath('u1', 'clip.MP4', 123)).toBe('u1/123.mp4');
    expect(buildStoryPath('u1', 'photo.jpeg', 5)).toBe('u1/5.jpeg');
  });

  it('never lets a file name inject extra path segments', () => {
    expect(buildStoryPath('u1', 'noext', 1)).toBe('u1/1.bin');
    expect(buildStoryPath('u1', 'a.b/../../x', 1)).toBe('u1/1.bin');
  });
});

describe('storyPathFromUrl', () => {
  it('extracts the object path from a public URL', () => {
    expect(storyPathFromUrl('https://x.supabase.co/storage/v1/object/public/story-media/u1/123.mp4'))
      .toBe('u1/123.mp4');
  });

  it('ignores other buckets and empty values', () => {
    expect(storyPathFromUrl('https://x.supabase.co/storage/v1/object/public/post-media/u1/1.jpg')).toBeNull();
    expect(storyPathFromUrl(null)).toBeNull();
  });
});

describe('storyDurationMs', () => {
  it('shows images and text for 5 seconds', () => {
    expect(storyDurationMs({ type: 'image', duration_seconds: null })).toBe(5000);
    expect(storyDurationMs({ type: 'text', duration_seconds: 30 })).toBe(5000);
  });

  it('plays video for its own length, capped at 60s', () => {
    expect(storyDurationMs({ type: 'video', duration_seconds: 12.5 })).toBe(12500);
    expect(storyDurationMs({ type: 'video', duration_seconds: 90 })).toBe(60000);
    expect(storyDurationMs({ type: 'video', duration_seconds: null })).toBe(5000);
  });
});

describe('storyTimeAgo', () => {
  it('formats minutes and hours', () => {
    const now = Date.parse('2026-09-24T12:00:00Z');
    expect(storyTimeAgo('2026-09-24T11:59:40Z', now)).toBe('now');
    expect(storyTimeAgo('2026-09-24T11:45:00Z', now)).toBe('15m');
    expect(storyTimeAgo('2026-09-24T09:00:00Z', now)).toBe('3h');
  });
});

describe('buildStoryReplyMetadata', () => {
  const base = {
    id: 's1',
    type: 'image' as const,
    content: 'sunset',
    media_url: 'https://x.supabase.co/storage/v1/object/public/story-media/u2/1.jpg',
    background_color: null,
    expires_at: '2026-09-25T12:00:00Z',
  };

  it('snapshots an image story for the chat bubble', () => {
    expect(buildStoryReplyMetadata(base, 'u2')).toEqual({
      kind: 'story_reply',
      story_id: 's1',
      story_owner_id: 'u2',
      story_type: 'image',
      story_media_url: base.media_url,
      story_text: 'sunset',
      story_background_color: null,
      story_expires_at: '2026-09-25T12:00:00Z',
    });
  });

  it('never carries a media URL for text stories and keeps the colour', () => {
    const m = buildStoryReplyMetadata({ ...base, type: 'text', media_url: 'stray', background_color: '#DB2777', content: '  hi  ' }, 'u2');
    expect(m.story_media_url).toBeNull();
    expect(m.story_background_color).toBe('#DB2777');
    expect(m.story_text).toBe('hi');
  });

  it('truncates the quoted story text to 140 characters', () => {
    const m = buildStoryReplyMetadata({ ...base, content: 'a'.repeat(500) }, 'u2');
    expect(m.story_text!.length).toBe(STORY_REPLY_QUOTE_CHARS);
    expect(m.story_text!.endsWith('…')).toBe(true);
    expect(buildStoryReplyMetadata({ ...base, content: 'a'.repeat(140) }, 'u2').story_text).toBe('a'.repeat(140));
  });

  it('stores null text for a caption-less video', () => {
    const m = buildStoryReplyMetadata({ ...base, type: 'video', content: null }, 'u2');
    expect(m.story_text).toBeNull();
    expect(m.story_type).toBe('video');
  });
});

describe('isStoryReplyMetadata', () => {
  it('recognises only story reply metadata', () => {
    expect(isStoryReplyMetadata({ kind: 'story_reply', story_id: 's1' })).toBe(true);
    expect(isStoryReplyMetadata({ pinned: true })).toBe(false);
    expect(isStoryReplyMetadata(null)).toBe(false);
  });
});
