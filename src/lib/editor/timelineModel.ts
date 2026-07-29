/**
 * Multi-track timeline model — Phase 1 of the Filmora-style editor rebuild.
 *
 * The old editor stored clips as an ORDER-ONLY list (segments play back-to-back,
 * no positions) which is why clips couldn't have gaps and there was only one
 * audio "bed". This model replaces that with a POSITIONED, MULTI-TRACK layout:
 * a list of tracks, each holding clips with an absolute timeline `start` and a
 * `duration`. Gaps are natural (a gap is just gap = nextClip.start − prevClip.end),
 * you can add any number of tracks, and video/audio/text/overlay all use the
 * same primitives.
 *
 * These are PURE functions (no React, no zustand) so they're unit-testable and
 * the store/UI layers can build on them. Times are in seconds on the timeline.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type TrackKind = 'video' | 'audio' | 'text' | 'overlay';

export interface TimelineTrack {
  id: string;
  kind: TrackKind;
  name: string;
  /** Lane stacking order, ascending = top lane first. */
  order: number;
  muted?: boolean;   // audio / video sound
  hidden?: boolean;  // video / overlay / text visibility
  locked?: boolean;  // prevents edits/moves
  /** Master level for the whole lane (0..2), multiplied with each clip's own
   *  volume. Undefined = 1 (unchanged). */
  volume?: number;
}

interface ClipBase {
  id: string;
  trackId: string;
  /** Absolute timeline position, seconds. */
  start: number;
  /** Timeline length, seconds (already accounts for speed on media clips). */
  duration: number;
}

/** A trimmed slice of a source video/audio file. */
export interface MediaClip extends ClipBase {
  kind: 'video' | 'audio';
  sourceUrl: string;
  /** In/out points within the source file, seconds. */
  sourceStart: number;
  sourceEnd: number;
  /** Full length of the source file, seconds. The right edge can be re-extended
   *  up to this even after trimming shorter (like a real NLE). */
  sourceDuration: number;
  /** Playback rate; timeline duration = (sourceEnd − sourceStart) / speed. */
  speed: number;
  /** 0–1. For video this is its own audio; audio clips use it as gain. */
  volume: number;
  fadeInSec?: number;
  fadeOutSec?: number;
  // Picture-in-picture placement (video used as B-roll / overlay lane).
  x?: number;        // 0–100 center %
  y?: number;        // 0–100 center %
  scale?: number;    // fraction of frame width, 0.1–1
  opacity?: number;  // 0–1
  rotation?: number; // degrees
  // Look (video clips): color grade + manual adjust + effect overlays.
  filter?: string;            // FilterPresetId
  filterIntensity?: number;   // 0–1
  adjust?: { brightness?: number; contrast?: number; saturation?: number; warmth?: number };
  effects?: string[];         // EffectId[] — see lib/editor/effects.ts
  /** Entrance transition played over the clip's opening. */
  transitionIn?: { type: string; durationSec: number };
  /** Ken Burns-style motion animated across the whole clip. See lib/editor/effects.ts MOTIONS. */
  motion?: string;
  /** Manual keyframes — interpolated by clip progress t (0..1). Any subset of
   *  props per keyframe; missing props hold their neighbours. Overrides motion. */
  keyframes?: Array<{ t: number; scale?: number; x?: number; y?: number; opacity?: number; rotation?: number }>;
  /** Green-screen / chroma key. When set, the key colour is made transparent so
   *  lower tracks show through. See remotion/editor/ChromaKeyVideo. */
  chroma?: ChromaOptions;
  /** AI background removal (no green screen needed). When set, on-device
   *  segmentation keeps the person and makes the background transparent.
   *  See remotion/editor/SegmentedVideo. Takes precedence over chroma. */
  bgRemove?: BgRemoveOptions;
  /** Face-tracking AR filter id (see lib/editor/faceFilters). Draws accessories
   *  anchored to the face landmarks. See remotion/editor/FaceFilterVideo. */
  faceFilter?: string;
  /** Full-frame stylization, e.g. 'toon' (cartoon look). See StylizeVideo. */
  stylize?: string;
}

/** Chroma-key (green screen) settings for a video clip. */
export interface ChromaOptions {
  keyColor: string;    // hex, e.g. '#00FF00'
  similarity: number;  // 0..1 — how close to keyColor counts as background
  smoothness: number;  // 0..1 — edge feather width
  spill: number;       // 0..1 — suppress key-colour bleed on the subject
}

/** AI background-removal settings for a video clip. */
export interface BgRemoveOptions {
  feather: number; // 0..1 — soften the person/background edge
}

/** A text card placed on a text lane. */
export interface TextClip extends ClipBase {
  kind: 'text';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bgColor: string;
  strokeColor: string;
  strokeWidth: number;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  animation: 'none' | 'fade' | 'slide' | 'scale' | 'typewriter' | 'bounce' | 'word-pop' | 'karaoke';
}

/** An emoji / image / GIF sticker placed on an overlay lane. */
export interface StickerClip extends ClipBase {
  kind: 'overlay';
  emoji?: string;
  imageUrl?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export type TimelineClip = MediaClip | TextClip | StickerClip;

export interface TimelineState {
  tracks: TimelineTrack[];
  clips: TimelineClip[];
}

// ── Id helpers (seedable so callers/tests stay deterministic) ────────────────

let _counter = 0;
export function nextId(prefix: string): string {
  _counter += 1;
  return `${prefix}_${_counter.toString(36)}`;
}
/** Test hook: reset the id counter so ids are reproducible. */
export function _resetIds(n = 0): void {
  _counter = n;
}

// ── Queries ─────────────────────────────────────────────────────────────────

export const clipEnd = (c: TimelineClip): number => c.start + c.duration;

/** Clips on a track, left-to-right. */
export function clipsOnTrack(state: TimelineState, trackId: string): TimelineClip[] {
  return state.clips.filter((c) => c.trackId === trackId).sort((a, b) => a.start - b.start);
}

/** Furthest clip end across all tracks — the timeline's total length. */
export function timelineDuration(state: TimelineState): number {
  return state.clips.reduce((max, c) => Math.max(max, clipEnd(c)), 0);
}

/** Would a clip at [start, start+duration) overlap any OTHER clip on the track? */
export function wouldOverlap(
  state: TimelineState,
  trackId: string,
  start: number,
  duration: number,
  ignoreClipId?: string,
): boolean {
  const end = start + duration;
  return state.clips.some(
    (c) =>
      c.trackId === trackId &&
      c.id !== ignoreClipId &&
      start < clipEnd(c) &&
      end > c.start,
  );
}

/** The clip on `trackId` covering timeline time `t`, if any. */
export function clipAt(state: TimelineState, trackId: string, t: number): TimelineClip | undefined {
  return state.clips.find((c) => c.trackId === trackId && t >= c.start && t < clipEnd(c));
}

// ── Track mutations ─────────────────────────────────────────────────────────

export function addTrack(state: TimelineState, kind: TrackKind, name?: string): TimelineState {
  const order = state.tracks.length ? Math.max(...state.tracks.map((t) => t.order)) + 1 : 0;
  const track: TimelineTrack = {
    id: nextId('trk'),
    kind,
    name: name ?? defaultTrackName(kind, state),
    order,
  };
  return { ...state, tracks: [...state.tracks, track] };
}

function defaultTrackName(kind: TrackKind, state: TimelineState): string {
  const n = state.tracks.filter((t) => t.kind === kind).length + 1;
  const label = kind === 'video' ? 'Video' : kind === 'audio' ? 'Audio' : kind === 'text' ? 'Text' : 'Overlay';
  return `${label} ${n}`;
}

export function removeTrack(state: TimelineState, trackId: string): TimelineState {
  return {
    tracks: state.tracks.filter((t) => t.id !== trackId),
    clips: state.clips.filter((c) => c.trackId !== trackId),
  };
}

export function updateTrack(state: TimelineState, trackId: string, patch: Partial<TimelineTrack>): TimelineState {
  return {
    ...state,
    tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, ...patch, id: t.id } : t)),
  };
}

// ── Clip mutations ──────────────────────────────────────────────────────────

/** Add a clip. Rejected (returns state unchanged) if it would overlap on-track. */
export function addClip(state: TimelineState, clip: TimelineClip): TimelineState {
  if (wouldOverlap(state, clip.trackId, clip.start, clip.duration, clip.id)) return state;
  return { ...state, clips: [...state.clips, clip] };
}

export function removeClip(state: TimelineState, clipId: string): TimelineState {
  return { ...state, clips: state.clips.filter((c) => c.id !== clipId) };
}

export function updateClip(state: TimelineState, clipId: string, patch: Partial<TimelineClip>): TimelineState {
  return {
    ...state,
    clips: state.clips.map((c) => (c.id === clipId ? ({ ...c, ...patch, id: c.id, kind: c.kind } as TimelineClip) : c)),
  };
}

/**
 * Move a clip to a new timeline start (optionally to a different track). Clamps
 * to ≥0. Gaps are allowed; overlaps are not — an overlapping move is rejected so
 * the clip keeps its place (the UI can snap instead). Locked clips don't move.
 */
export function moveClip(
  state: TimelineState,
  clipId: string,
  newStart: number,
  newTrackId?: string,
): TimelineState {
  const clip = state.clips.find((c) => c.id === clipId);
  if (!clip) return state;
  const track = state.tracks.find((t) => t.id === (newTrackId ?? clip.trackId));
  if (track?.locked) return state;
  const start = Math.max(0, newStart);
  const trackId = newTrackId ?? clip.trackId;
  if (wouldOverlap(state, trackId, start, clip.duration, clipId)) return state;
  return updateClip(state, clipId, { start, trackId } as Partial<TimelineClip>);
}

/**
 * Trim a clip's edge on the timeline. `edge` 'start' drags the left handle
 * (moves start + eats into the head of the source), 'end' drags the right handle
 * (extends/shrinks the tail). Respects source bounds for media clips and a
 * minimum length. Returns unchanged if the trim is invalid or would overlap.
 */
export function trimClip(
  state: TimelineState,
  clipId: string,
  edge: 'start' | 'end',
  newTime: number,
  minLen = 0.1,
): TimelineState {
  const clip = state.clips.find((c) => c.id === clipId);
  if (!clip) return state;
  const isMedia = clip.kind === 'video' || clip.kind === 'audio';
  const speed = isMedia ? (clip as MediaClip).speed || 1 : 1;

  if (edge === 'start') {
    const maxStart = clipEnd(clip) - minLen;
    let start = Math.min(Math.max(0, newTime), maxStart);
    const deltaTimeline = start - clip.start;
    const duration = clip.duration - deltaTimeline;
    const patch: Partial<TimelineClip> = { start, duration } as Partial<TimelineClip>;
    if (isMedia) {
      const m = clip as MediaClip;
      const newSourceStart = m.sourceStart + deltaTimeline * speed;
      if (newSourceStart < 0) {
        // Can't pull earlier than the source's head — clamp to it.
        start = clip.start - (m.sourceStart / speed);
        (patch as Partial<MediaClip>).sourceStart = 0;
        patch.start = Math.max(0, start);
        patch.duration = clipEnd(clip) - (patch.start as number);
      } else {
        (patch as Partial<MediaClip>).sourceStart = newSourceStart;
      }
    }
    if (wouldOverlap(state, clip.trackId, patch.start as number, patch.duration as number, clipId)) return state;
    return updateClip(state, clipId, patch);
  }

  // edge === 'end'
  let end = Math.max(clip.start + minLen, newTime);
  let duration = end - clip.start;
  const patch: Partial<TimelineClip> = {} as Partial<TimelineClip>;
  if (isMedia) {
    const m = clip as MediaClip;
    // Right edge can extend until sourceEnd reaches the full source length —
    // so trimming shorter then longer recovers the tail (real-NLE behaviour).
    const maxSourceLen = m.sourceDuration - m.sourceStart;
    const maxDuration = maxSourceLen / speed;
    if (duration > maxDuration) {
      duration = maxDuration;
      end = clip.start + duration;
    }
    (patch as Partial<MediaClip>).sourceEnd = m.sourceStart + duration * speed;
  }
  patch.duration = duration;
  if (wouldOverlap(state, clip.trackId, clip.start, duration, clipId)) return state;
  return updateClip(state, clipId, patch);
}

/**
 * Split the clip covering timeline time `t` on `trackId` into two clips at `t`.
 * The second piece starts exactly at `t` (no gap). For media clips the source
 * in/out is divided proportionally by speed. No-op if `t` isn't strictly inside
 * a clip.
 */
export function splitAt(state: TimelineState, trackId: string, t: number, minLen = 0.1): TimelineState {
  const clip = clipAt(state, trackId, t);
  if (!clip) return state;
  if (t <= clip.start + minLen || t >= clipEnd(clip) - minLen) return state;

  const firstDur = t - clip.start;
  const secondDur = clipEnd(clip) - t;

  const second: TimelineClip = { ...clip, id: nextId('clip'), start: t, duration: secondDur };
  const firstPatch: Partial<TimelineClip> = { duration: firstDur } as Partial<TimelineClip>;

  if (clip.kind === 'video' || clip.kind === 'audio') {
    const m = clip as MediaClip;
    const speed = m.speed || 1;
    const splitSource = m.sourceStart + firstDur * speed;
    (firstPatch as Partial<MediaClip>).sourceEnd = splitSource;
    (second as MediaClip).sourceStart = splitSource;
  }

  const withFirst = updateClip(state, clip.id, firstPatch);
  return { ...withFirst, clips: [...withFirst.clips, second] };
}

/**
 * Close the gap before a clip by pulling it (and everything after it on the same
 * track) left so it butts against the previous clip — Filmora's "ripple"/close-gap.
 */
export function closeGapBefore(state: TimelineState, clipId: string): TimelineState {
  const clip = state.clips.find((c) => c.id === clipId);
  if (!clip) return state;
  const onTrack = clipsOnTrack(state, clip.trackId);
  const idx = onTrack.findIndex((c) => c.id === clipId);
  const prevEnd = idx > 0 ? clipEnd(onTrack[idx - 1]) : 0;
  const shift = clip.start - prevEnd;
  if (shift <= 0) return state;
  const idsToShift = new Set(onTrack.slice(idx).map((c) => c.id));
  return {
    ...state,
    clips: state.clips.map((c) => (idsToShift.has(c.id) ? { ...c, start: c.start - shift } : c)),
  };
}

export const EMPTY_TIMELINE: TimelineState = { tracks: [], clips: [] };
