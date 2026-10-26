import { describe, it, expect } from 'vitest';
import { projectDuration, timelineDuration, type TimelineState, type MediaClip } from '../timelineModel';

const media = (kind: 'video' | 'audio', trackId: string, start: number, duration: number): MediaClip => ({
  id: `${kind}_${start}`, trackId, kind, start, duration,
  sourceUrl: 'https://x/a', sourceStart: 0, sourceEnd: duration, sourceDuration: duration, speed: 1, volume: 1,
});

const tracks: TimelineState['tracks'] = [
  { id: 'v', kind: 'video', name: 'Video 1', order: 0 },
  { id: 'a', kind: 'audio', name: 'Music', order: 1 },
] as TimelineState['tracks'];

describe('projectDuration', () => {
  it('ends where the picture ends, even if a song runs on', () => {
    const state: TimelineState = { tracks, clips: [media('video', 'v', 0, 22.7), media('audio', 'a', 0, 150.3)] };
    expect(timelineDuration(state)).toBeCloseTo(150.3);
    expect(projectDuration(state)).toBeCloseTo(22.7);
  });
  it('falls back to the audio length for audio-only projects', () => {
    const state: TimelineState = { tracks, clips: [media('audio', 'a', 0, 30)] };
    expect(projectDuration(state)).toBe(30);
  });
  it('is 0 for an empty timeline', () => {
    expect(projectDuration({ tracks, clips: [] })).toBe(0);
  });
});
