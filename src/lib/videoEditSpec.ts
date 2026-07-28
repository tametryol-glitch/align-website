/**
 * videoEditSpec — serialises the video-editor Zustand store into the
 * `VideoEditSpec` the server Remotion renderer (align-video-renderer's
 * UserVideoEdit composition) consumes, AND the shape the in-editor
 * @remotion/player preview renders. One spec drives both, so the live
 * preview is exactly what the server posts.
 *
 * This TYPE is the web-side mirror of
 * align-video-renderer/src/remotion/templates/UserVideoEdit.tsx → VideoEditSpec.
 * Keep the two in sync until they're extracted into a shared package.
 */
import type {
  TextOverlay,
  StickerOverlay,
  BrollClip,
  ClipSegment,
  Transition,
  FilterPresetId,
} from '@/stores/videoEditorStore';

// ── Spec types (mirror of the server composition) ───────────────────────────
export interface EditTextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
  startTime: number;
  endTime: number;
  animation?: 'none' | 'fade' | 'slide' | 'scale' | 'typewriter' | 'bounce' | 'word-pop' | 'karaoke';
  bgColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  rotation?: number;
}

export interface EditStickerOverlay {
  id: string;
  emoji?: string;
  imageUrl?: string;
  x: number;
  y: number;
  scale: number;
  startTime: number;
  endTime: number;
  rotation?: number;
}

export interface EditBrollClip {
  id: string;
  sourceUrl: string;
  timelineStart: number;
  duration: number; // how long it SHOWS (seconds) = source out − in
  sourceStart?: number;
  x: number;
  y: number;
  scale: number;
  opacity?: number;
  rotation?: number;
}

export interface EditSegment {
  id: string;
  sourceStart: number;
  sourceEnd: number;
  speed?: number;
}

export interface EditTransition {
  id: string;
  atTime: number;
  type: 'crossfade' | 'fade-black' | 'slide-left' | 'zoom-blur' | 'glitch' | 'cosmic-wipe';
  durationMs: number;
}

export type EditFilterId = FilterPresetId;

export interface VideoEditSpec {
  sourceVideoUrl: string;
  trimStart: number;
  trimEnd: number;
  speed?: number;
  segments?: EditSegment[];
  filter?: EditFilterId;
  filterIntensity?: number;
  adjustBrightness?: number;
  adjustContrast?: number;
  adjustSaturation?: number;
  adjustWarmth?: number;
  originalAudioVolume?: number;
  musicUrl?: string | null;
  musicVolume?: number;
  musicTrimStart?: number;
  musicTrimEnd?: number;
  textOverlays?: EditTextOverlay[];
  stickerOverlays?: EditStickerOverlay[];
  brollClips?: EditBrollClip[];
  transitions?: EditTransition[];
  watermarkHandle?: string;
  watermarkLogoUrl?: string;
}

/** The store fields the spec is built from (structural — pass getState()). */
export interface EditorSpecSource {
  sourceVideoUrl: string;
  trimStart: number;
  trimEnd: number;
  playbackSpeed: number;
  segments: ClipSegment[];
  activeFilter: FilterPresetId;
  filterIntensity: number;
  adjustBrightness: number;
  adjustContrast: number;
  adjustSaturation: number;
  adjustWarmth: number;
  originalAudioVolume: number;
  musicTrackUrl: string | null;
  musicVolume: number;
  musicTrimStart: number;
  musicTrimEnd: number;
  textOverlays: TextOverlay[];
  stickerOverlays: StickerOverlay[];
  brollClips: BrollClip[];
  transitions: Transition[];
}

export interface StoreToSpecOptions {
  /** Override the source URL — the export path swaps the local blob for the
   *  uploaded, server-reachable URL before rendering. */
  sourceVideoUrl?: string;
  /** Brand handle shown in the watermark (default '@align.app'). */
  watermarkHandle?: string;
}

/**
 * Map the editor store to a `VideoEditSpec`. UI-only state (currentTime,
 * isPlaying, loopPlayback, timelineZoom, activeTool, export*, history,
 * selection ids, videoDuration) is intentionally excluded.
 */
export function storeToEditSpec(s: EditorSpecSource, opts: StoreToSpecOptions = {}): VideoEditSpec {
  const hasSegments = s.segments.length > 0;
  const hasMusic = !!s.musicTrackUrl;

  const spec: VideoEditSpec = {
    sourceVideoUrl: opts.sourceVideoUrl ?? s.sourceVideoUrl,
    trimStart: s.trimStart,
    trimEnd: s.trimEnd,
    speed: s.playbackSpeed && s.playbackSpeed > 0 ? s.playbackSpeed : 1,
    filter: s.activeFilter,
    filterIntensity: s.filterIntensity,
    adjustBrightness: s.adjustBrightness || undefined,
    adjustContrast: s.adjustContrast || undefined,
    adjustSaturation: s.adjustSaturation || undefined,
    adjustWarmth: s.adjustWarmth || undefined,
    originalAudioVolume: s.originalAudioVolume,
    watermarkHandle: opts.watermarkHandle ?? '@align.app',
    textOverlays: s.textOverlays.map((o) => ({ ...o })),
    stickerOverlays: s.stickerOverlays.map((o) => ({ ...o })),
    // Server `duration` = how long the b-roll SHOWS = its trimmed length.
    brollClips: s.brollClips.map((b) => ({
      id: b.id,
      sourceUrl: b.sourceUrl,
      timelineStart: b.timelineStart,
      duration: Math.max(0.1, b.sourceEnd - b.sourceStart),
      sourceStart: b.sourceStart,
      x: b.x,
      y: b.y,
      scale: b.scale,
      opacity: b.opacity,
      rotation: b.rotation ?? 0,
    })),
  };

  // Only send segments once the user has actually split — otherwise the server
  // stays in the simpler trim path.
  if (hasSegments) {
    spec.segments = s.segments.map((g) => ({
      id: g.id,
      sourceStart: g.sourceStart,
      sourceEnd: g.sourceEnd,
      speed: g.speed && g.speed > 0 ? g.speed : 1,
    }));
  }

  if (s.transitions.length > 0) {
    spec.transitions = s.transitions.map((t) => ({ ...t }));
  }

  if (hasMusic) {
    spec.musicUrl = s.musicTrackUrl;
    spec.musicVolume = s.musicVolume;
    spec.musicTrimStart = s.musicTrimStart || undefined;
    spec.musicTrimEnd = s.musicTrimEnd || undefined;
  }

  return spec;
}

/**
 * Output duration (seconds) of a spec — MUST match the server's derivation in
 * align-video-renderer/src/renderer.ts. Segments sum their per-piece length;
 * otherwise the trimmed window divided by whole-clip speed. Clamped 1–120s.
 */
export function editSpecDurationSeconds(spec: VideoEditSpec): number {
  let len: number;
  if (spec.segments && spec.segments.length > 0) {
    len = spec.segments.reduce((acc, g) => {
      const sp = g.speed && g.speed > 0 ? g.speed : 1;
      return acc + Math.max(0, (g.sourceEnd || 0) - (g.sourceStart || 0)) / sp;
    }, 0);
  } else {
    const rawLen = spec.trimEnd != null && spec.trimStart != null ? spec.trimEnd - spec.trimStart : 10;
    const speed = spec.speed && spec.speed > 0 ? spec.speed : 1;
    len = rawLen / speed;
  }
  return Math.max(1, Math.min(120, Math.round(len) || 10));
}
