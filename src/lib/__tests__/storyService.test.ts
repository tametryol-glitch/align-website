import { describe, it, expect, vi } from 'vitest';

vi.mock('../supabase', () => ({ createClient: () => ({}) }));

import { buildStoryPath, storyPathFromUrl, storyDurationMs, storyTimeAgo } from '../storyService';

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
