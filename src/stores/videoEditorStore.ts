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
  animation: 'none' | 'fade' | 'slide' | 'scale' | 'typewriter';
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  /** X position as percentage (0–100) */
  x: number;
  /** Y position as percentage (0–100) */
  y: number;
  scale: number;
  startTime: number;
  endTime: number;
}

export type FilterPresetId =
  | 'none'
  | 'warm'
  | 'cool'
  | 'vintage'
  | 'cosmic'
  | 'bw'
  | 'dreamy';

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
  | 'trim'
  | 'text'
  | 'sticker'
  | 'audio'
  | 'filter'
  | 'transition'
  | 'export';

// ── History entry for undo/redo ────────────────────────────────

interface HistorySnapshot {
  trimStart: number;
  trimEnd: number;
  textOverlays: TextOverlay[];
  stickerOverlays: StickerOverlay[];
  activeFilter: FilterPresetId;
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

  // Playback
  currentTime: number;
  isPlaying: boolean;

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

  // Trim
  setTrimStart: (t: number) => void;
  setTrimEnd: (t: number) => void;

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
  currentTime: 0,
  isPlaying: false,
  textOverlays: [] as TextOverlay[],
  selectedOverlayId: null as string | null,
  stickerOverlays: [] as StickerOverlay[],
  musicTrackUrl: null as string | null,
  musicTrimStart: 0,
  musicTrimEnd: 0,
  musicVolume: 0.3,
  originalAudioVolume: 1,
  activeFilter: 'none' as FilterPresetId,
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
    textOverlays: state.textOverlays.map((o) => ({ ...o })),
    stickerOverlays: state.stickerOverlays.map((o) => ({ ...o })),
    activeFilter: state.activeFilter,
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

  // Trim
  setTrimStart: (t) => set({ trimStart: Math.max(0, t) }),
  setTrimEnd: (t) => set((s) => ({ trimEnd: Math.min(s.videoDuration, t) })),

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
