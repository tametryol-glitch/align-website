/**
 * Video Editor Zustand Store
 *
 * Manages all state for the CapCut-lite video editor:
 * trim, overlays, filters, audio, timeline, export progress.
 *
 * Uses selector pattern — deeply nested components subscribe to
 * only the slices they need to avoid cascade re-renders (e.g.
 * playhead updates at 30fps via rAF).
 */

import { create } from 'zustand';

// ── Types ──────────────────────────────────────────────────────

export interface TextOverlay {
  id: string;
  text: string;
  /** X position as percentage (0–100) of video width */
  x: number;
  /** Y position as percentage (0–100) of video height */
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  startTime: number;
  endTime: number;
  animation: 'none' | 'fade' | 'slide' | 'scale' | 'typewriter' | 'bounce' | 'word-pop' | 'karaoke';
  /** Background color behind text (empty string = transparent) */
  bgColor: string;
  /** Stroke/outline color (empty string = none) */
  strokeColor: string;
  /** Stroke width in px (0 = no stroke) */
  strokeWidth: number;
  /** Text alignment */
  textAlign: 'left' | 'center' | 'right';
  /** Rotation in degrees */
  rotation: number;
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  /** Optional image/GIF URL (when set, renders image instead of emoji) */
  imageUrl?: string;
  /** X position as percentage (0–100) */
  x: number;
  /** Y position as percentage (0–100) */
  y: number;
  scale: number;
  startTime: number;
  endTime: number;
  /** Rotation in degrees */
  rotation: number;
}

/**
 * A piece of the source clip kept on the timeline. The editor stays in legacy
 * single-clip mode until the first split; from then on `segments` is the
 * ordered source of truth (reorderable). Source times are seconds into the
 * original video.
 */
export interface ClipSegment {
  id: string;
  sourceStart: number;
  sourceEnd: number;
  /** Playback speed for this clip (0.5–2). Output length = srcLen / speed. */
  speed?: number;
}

/**
 * A B-roll / overlay clip layered on a second video track. It plays over the
 * main video as picture-in-picture during its window on the main timeline.
 */
export interface BrollClip {
  id: string;
  sourceUrl: string;
  duration: number;       // the b-roll's own source duration
  sourceStart: number;    // in-point within the b-roll source
  sourceEnd: number;
  timelineStart: number;  // where on the MAIN timeline it starts (seconds)
  x: number;              // 0–100 center % of frame width
  y: number;              // 0–100 center % of frame height
  scale: number;          // fraction of frame width (0.1–1)
  opacity: number;        // 0–1
  rotation?: number;      // degrees (optional; defaults to 0)
}

export type FilterPresetId =
  | 'none'
  | 'clean'
  | 'vivid'
  | 'y2k'
  | 'cinematic'
  | 'bleach'
  | 'warm'
  | 'sunset'
  | 'cool'
  | 'moody'
  | 'vintage'
  | 'vhs'
  | 'moss'
  | 'cosmic'
  | 'infrared'
  | 'dreamy'
  | 'bw';

export interface FilterPreset {
  id: FilterPresetId;
  name: string;
  css: string;
}

export interface Transition {
  id: string;
  /** Time point in seconds where the transition is centered */
  atTime: number;
  type: 'crossfade' | 'fade-black' | 'slide-left' | 'zoom-blur' | 'glitch' | 'cosmic-wipe';
  durationMs: number;
}

export type ExportState = 'idle' | 'loading-ffmpeg' | 'processing' | 'done' | 'error';

export type ActiveTool =
  | 'none'
  | 'template'
  | 'captions'
  | 'trim'
  | 'text'
  | 'sticker'
  | 'audio'
  | 'filter'
  | 'adjust'
  | 'transition'
  | 'broll'
  | 'export';

// ── History entry for undo/redo ────────────────────────────────

interface HistorySnapshot {
  trimStart: number;
  trimEnd: number;
  segments: ClipSegment[];
  brollClips: BrollClip[];
  textOverlays: TextOverlay[];
  stickerOverlays: StickerOverlay[];
  activeFilter: FilterPresetId;
  filterIntensity: number;
  adjustBrightness: number;
  adjustContrast: number;
  adjustSaturation: number;
  adjustWarmth: number;
  musicTrackUrl: string | null;
  musicVolume: number;
  originalAudioVolume: number;
  musicTrimStart: number;
  musicTrimEnd: number;
  transitions: Transition[];
}

// ── Store state + actions ──────────────────────────────────────

interface VideoEditorState {
  // Source
  sourceVideoUrl: string;
  videoDuration: number;

  // Trim
  trimStart: number;
  trimEnd: number;

  // Segments (cut / rearrange). Empty = legacy single-clip mode.
  segments: ClipSegment[];
  selectedSegmentId: string | null;

  // B-roll / overlay track
  brollClips: BrollClip[];
  selectedBrollId: string | null;

  // Playback
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.25, 0.5, 1, 1.5, 2
  loopPlayback: boolean;

  // Text overlays
  textOverlays: TextOverlay[];
  selectedOverlayId: string | null;

  // Sticker overlays
  stickerOverlays: StickerOverlay[];

  // Audio
  musicTrackUrl: string | null;
  musicTrimStart: number;
  musicTrimEnd: number;
  musicVolume: number;
  originalAudioVolume: number;

  // Filter
  activeFilter: FilterPresetId;
  /** Filter intensity 0–1 (1 = full strength) */
  filterIntensity: number;

  // Manual adjustments (range: -1 to +1, 0 = neutral)
  adjustBrightness: number;
  adjustContrast: number;
  adjustSaturation: number;
  adjustWarmth: number;

  // Transitions
  transitions: Transition[];

  // Timeline
  timelineZoom: number; // px per second

  // Active tool panel
  activeTool: ActiveTool;

  // Export
  exportState: ExportState;
  exportProgress: number;
  exportedBlobUrl: string | null;
  exportError: string | null;

  // Undo/redo
  history: HistorySnapshot[];
  historyIndex: number;

  // ── Actions ────────────────────────────────────────────────

  // Init
  init: (videoUrl: string, duration: number) => void;
  reset: () => void;

  // Playback
  setCurrentTime: (t: number) => void;
  setIsPlaying: (p: boolean) => void;
  setPlaybackSpeed: (s: number) => void;
  setLoopPlayback: (l: boolean) => void;

  // Trim
  setTrimStart: (t: number) => void;
  setTrimEnd: (t: number) => void;

  // Segments
  getEffectiveSegments: () => ClipSegment[];
  splitAtPlayhead: () => void;
  reorderSegments: (from: number, to: number) => void;
  removeSegment: (id: string) => void;
  selectSegment: (id: string | null) => void;
  duplicateSegment: (id: string) => void;
  setSegmentSpeed: (id: string, speed: number) => void;

  // B-roll
  addBroll: (clip: BrollClip) => void;
  updateBroll: (id: string, partial: Partial<BrollClip>) => void;
  removeBroll: (id: string) => void;
  selectBroll: (id: string | null) => void;
  duplicateBroll: (id: string) => void;

  // Text overlays
  addTextOverlay: (overlay: TextOverlay) => void;
  updateTextOverlay: (id: string, partial: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
  selectOverlay: (id: string | null) => void;

  // Sticker overlays
  addStickerOverlay: (sticker: StickerOverlay) => void;
  updateStickerOverlay: (id: string, partial: Partial<StickerOverlay>) => void;
  removeStickerOverlay: (id: string) => void;

  // Audio
  setMusicTrackUrl: (url: string | null) => void;
  setMusicTrimStart: (t: number) => void;
  setMusicTrimEnd: (t: number) => void;
  setMusicVolume: (v: number) => void;
  setOriginalAudioVolume: (v: number) => void;

  // Filter
  setActiveFilter: (f: FilterPresetId) => void;
  setFilterIntensity: (v: number) => void;

  // Manual adjustments
  setAdjustBrightness: (v: number) => void;
  setAdjustContrast: (v: number) => void;
  setAdjustSaturation: (v: number) => void;
  setAdjustWarmth: (v: number) => void;

  // Transitions
  addTransition: (t: Transition) => void;
  removeTransition: (id: string) => void;
  updateTransition: (id: string, partial: Partial<Transition>) => void;

  // Timeline
  setTimelineZoom: (z: number) => void;

  // Tool
  setActiveTool: (tool: ActiveTool) => void;

  // Export
  setExportState: (s: ExportState) => void;
  setExportProgress: (p: number) => void;
  setExportedBlobUrl: (url: string | null) => void;
  setExportError: (err: string | null) => void;

  // Undo/redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// ── Initial values ─────────────────────────────────────────────

const INITIAL_STATE = {
  sourceVideoUrl: '',
  videoDuration: 0,
  trimStart: 0,
  trimEnd: 0,
  segments: [] as ClipSegment[],
  selectedSegmentId: null as string | null,
  brollClips: [] as BrollClip[],
  selectedBrollId: null as string | null,
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,
  loopPlayback: false,
  textOverlays: [] as TextOverlay[],
  selectedOverlayId: null as string | null,
  stickerOverlays: [] as StickerOverlay[],
  musicTrackUrl: null as string | null,
  musicTrimStart: 0,
  musicTrimEnd: 0,
  musicVolume: 0.3,
  originalAudioVolume: 1,
  activeFilter: 'none' as FilterPresetId,
  filterIntensity: 1,
  adjustBrightness: 0,
  adjustContrast: 0,
  adjustSaturation: 0,
  adjustWarmth: 0,
  transitions: [] as Transition[],
  timelineZoom: 40,
  activeTool: 'none' as ActiveTool,
  exportState: 'idle' as ExportState,
  exportProgress: 0,
  exportedBlobUrl: null as string | null,
  exportError: null as string | null,
  history: [] as HistorySnapshot[],
  historyIndex: -1,
};

// ── Helpers ────────────────────────────────────────────────────

function takeSnapshot(state: VideoEditorState): HistorySnapshot {
  return {
    trimStart: state.trimStart,
    trimEnd: state.trimEnd,
    segments: state.segments.map((g) => ({ ...g })),
    brollClips: state.brollClips.map((b) => ({ ...b })),
    textOverlays: state.textOverlays.map((o) => ({ ...o })),
    stickerOverlays: state.stickerOverlays.map((o) => ({ ...o })),
    activeFilter: state.activeFilter,
    filterIntensity: state.filterIntensity,
    adjustBrightness: state.adjustBrightness,
    adjustContrast: state.adjustContrast,
    adjustSaturation: state.adjustSaturation,
    adjustWarmth: state.adjustWarmth,
    musicTrackUrl: state.musicTrackUrl,
    musicVolume: state.musicVolume,
    originalAudioVolume: state.originalAudioVolume,
    musicTrimStart: state.musicTrimStart,
    musicTrimEnd: state.musicTrimEnd,
    transitions: state.transitions.map((t) => ({ ...t })),
  };
}

// ── Store ──────────────────────────────────────────────────────

export const useVideoEditorStore = create<VideoEditorState>((set, get) => ({
  ...INITIAL_STATE,

  // Init
  init: (videoUrl, duration) =>
    set({
      ...INITIAL_STATE,
      sourceVideoUrl: videoUrl,
      videoDuration: duration,
      trimEnd: duration,
      musicTrimEnd: duration,
    }),

  reset: () => set(INITIAL_STATE),

  // Playback
  setCurrentTime: (t) => set({ currentTime: t }),
  setIsPlaying: (p) => set({ isPlaying: p }),
  setPlaybackSpeed: (s) => set({ playbackSpeed: s }),
  setLoopPlayback: (l) => set({ loopPlayback: l }),

  // Trim
  setTrimStart: (t) => set({ trimStart: Math.max(0, t) }),
  setTrimEnd: (t) => set((s) => ({ trimEnd: Math.min(s.videoDuration, t) })),

  // Segments — legacy single-clip until the first split, then ordered pieces.
  getEffectiveSegments: () => {
    const s = get();
    if (s.segments.length > 0) return s.segments;
    return [{ id: 'seg_base', sourceStart: s.trimStart, sourceEnd: s.trimEnd }];
  },
  splitAtPlayhead: () =>
    set((s) => {
      const segs = s.segments.length > 0
        ? s.segments
        : [{ id: 'seg_base', sourceStart: s.trimStart, sourceEnd: s.trimEnd }];
      const t = s.currentTime;
      const idx = segs.findIndex((g) => t > g.sourceStart + 0.1 && t < g.sourceEnd - 0.1);
      if (idx === -1) return {}; // playhead not inside a splittable segment
      const g = segs[idx];
      const mk = () => `seg_${Date.now()}_${Math.round(t * 1000)}_${Math.random().toString(36).slice(2, 5)}`;
      const a: ClipSegment = { id: mk(), sourceStart: g.sourceStart, sourceEnd: t, speed: g.speed ?? 1 };
      const b: ClipSegment = { id: mk(), sourceStart: t, sourceEnd: g.sourceEnd, speed: g.speed ?? 1 };
      return { segments: [...segs.slice(0, idx), a, b, ...segs.slice(idx + 1)] };
    }),
  reorderSegments: (from, to) =>
    set((s) => {
      const segs = s.segments.length > 0
        ? [...s.segments]
        : [{ id: 'seg_base', sourceStart: s.trimStart, sourceEnd: s.trimEnd }];
      if (from < 0 || from >= segs.length || to < 0 || to >= segs.length) return {};
      const [moved] = segs.splice(from, 1);
      segs.splice(to, 0, moved);
      return { segments: segs };
    }),
  removeSegment: (id) =>
    set((s) => {
      if (s.segments.length === 0) return {};
      const next = s.segments.filter((g) => g.id !== id);
      // Keep at least one segment; dropping the last clears segment mode.
      return {
        segments: next.length > 0 ? next : [],
        selectedSegmentId: s.selectedSegmentId === id ? null : s.selectedSegmentId,
      };
    }),
  selectSegment: (id) => set({ selectedSegmentId: id }),
  duplicateSegment: (id) =>
    set((s) => {
      if (s.segments.length === 0) return {};
      const idx = s.segments.findIndex((g) => g.id === id);
      if (idx === -1) return {};
      const g = s.segments[idx];
      const copy: ClipSegment = {
        ...g,
        id: `seg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      };
      return { segments: [...s.segments.slice(0, idx + 1), copy, ...s.segments.slice(idx + 1)] };
    }),
  setSegmentSpeed: (id, speed) =>
    set((s) => ({
      segments: s.segments.map((g) => (g.id === id ? { ...g, speed: Math.max(0.5, Math.min(2, speed)) } : g)),
    })),

  // B-roll
  addBroll: (clip) => set((s) => ({ brollClips: [...s.brollClips, clip], selectedBrollId: clip.id })),
  updateBroll: (id, partial) =>
    set((s) => ({ brollClips: s.brollClips.map((b) => (b.id === id ? { ...b, ...partial } : b)) })),
  removeBroll: (id) =>
    set((s) => ({
      brollClips: s.brollClips.filter((b) => b.id !== id),
      selectedBrollId: s.selectedBrollId === id ? null : s.selectedBrollId,
    })),
  selectBroll: (id) => set({ selectedBrollId: id }),
  duplicateBroll: (id) =>
    set((s) => {
      const b = s.brollClips.find((x) => x.id === id);
      if (!b) return {};
      const len = b.sourceEnd - b.sourceStart;
      const copy: BrollClip = {
        ...b,
        id: `broll_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        timelineStart: Math.max(0, Math.min(s.videoDuration - len, b.timelineStart + len)),
      };
      return { brollClips: [...s.brollClips, copy], selectedBrollId: copy.id };
    }),

  // Text overlays
  addTextOverlay: (overlay) =>
    set((s) => ({ textOverlays: [...s.textOverlays, overlay] })),
  updateTextOverlay: (id, partial) =>
    set((s) => ({
      textOverlays: s.textOverlays.map((o) =>
        o.id === id ? { ...o, ...partial } : o,
      ),
    })),
  removeTextOverlay: (id) =>
    set((s) => ({
      textOverlays: s.textOverlays.filter((o) => o.id !== id),
      selectedOverlayId: s.selectedOverlayId === id ? null : s.selectedOverlayId,
    })),
  selectOverlay: (id) => set({ selectedOverlayId: id }),

  // Sticker overlays
  addStickerOverlay: (sticker) =>
    set((s) => ({ stickerOverlays: [...s.stickerOverlays, sticker] })),
  updateStickerOverlay: (id, partial) =>
    set((s) => ({
      stickerOverlays: s.stickerOverlays.map((o) =>
        o.id === id ? { ...o, ...partial } : o,
      ),
    })),
  removeStickerOverlay: (id) =>
    set((s) => ({
      stickerOverlays: s.stickerOverlays.filter((o) => o.id !== id),
      selectedOverlayId: s.selectedOverlayId === id ? null : s.selectedOverlayId,
    })),

  // Audio
  setMusicTrackUrl: (url) => set({ musicTrackUrl: url }),
  setMusicTrimStart: (t) => set({ musicTrimStart: Math.max(0, t) }),
  setMusicTrimEnd: (t) => set({ musicTrimEnd: t }),
  setMusicVolume: (v) => set({ musicVolume: Math.max(0, Math.min(1, v)) }),
  setOriginalAudioVolume: (v) =>
    set({ originalAudioVolume: Math.max(0, Math.min(1, v)) }),

  // Filter
  setActiveFilter: (f) => set({ activeFilter: f }),
  setFilterIntensity: (v) => set({ filterIntensity: Math.max(0, Math.min(1, v)) }),

  // Manual adjustments
  setAdjustBrightness: (v) => set({ adjustBrightness: Math.max(-1, Math.min(1, v)) }),
  setAdjustContrast: (v) => set({ adjustContrast: Math.max(-1, Math.min(1, v)) }),
  setAdjustSaturation: (v) => set({ adjustSaturation: Math.max(-1, Math.min(1, v)) }),
  setAdjustWarmth: (v) => set({ adjustWarmth: Math.max(-1, Math.min(1, v)) }),

  // Transitions
  addTransition: (t) => set((s) => ({ transitions: [...s.transitions, t] })),
  removeTransition: (id) =>
    set((s) => ({ transitions: s.transitions.filter((t) => t.id !== id) })),
  updateTransition: (id, partial) =>
    set((s) => ({
      transitions: s.transitions.map((t) =>
        t.id === id ? { ...t, ...partial } : t,
      ),
    })),

  // Timeline
  setTimelineZoom: (z) => set({ timelineZoom: Math.max(20, Math.min(200, z)) }),

  // Tool
  setActiveTool: (tool) => set({ activeTool: tool }),

  // Export
  setExportState: (s) => set({ exportState: s }),
  setExportProgress: (p) => set({ exportProgress: p }),
  setExportedBlobUrl: (url) => set({ exportedBlobUrl: url }),
  setExportError: (err) => set({ exportError: err }),

  // Undo/redo
  pushHistory: () =>
    set((s) => {
      const snapshot = takeSnapshot(s);
      // Trim future history if we've undone something
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const newHistory = [...trimmed, snapshot].slice(-50); // keep last 50
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    }),

  undo: () => {
    const s = get();
    if (s.historyIndex <= 0) return;
    const prev = s.history[s.historyIndex - 1];
    set({
      ...prev,
      historyIndex: s.historyIndex - 1,
    });
  },

  redo: () => {
    const s = get();
    if (s.historyIndex >= s.history.length - 1) return;
    const next = s.history[s.historyIndex + 1];
    set({
      ...next,
      historyIndex: s.historyIndex + 1,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
