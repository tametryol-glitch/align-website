/**
 * Timeline store (Phase 2) — a Zustand wrapper around the pure timelineModel.
 * Holds the multi-track state plus UI state (selection, playhead, zoom) and an
 * undo/redo history. All structural edits delegate to the tested model fns.
 */

import { create } from 'zustand';
import {
  EMPTY_TIMELINE,
  addTrack as mAddTrack,
  removeTrack as mRemoveTrack,
  updateTrack as mUpdateTrack,
  addClip as mAddClip,
  removeClip as mRemoveClip,
  updateClip as mUpdateClip,
  moveClip as mMoveClip,
  trimClip as mTrimClip,
  splitAt as mSplitAt,
  closeGapBefore as mCloseGap,
  timelineDuration,
  type TimelineState,
  type TimelineClip,
  type TimelineTrack,
  type TrackKind,
} from './timelineModel';

interface TimelineStore {
  data: TimelineState;
  selectedClipId: string | null;
  playhead: number; // seconds
  pxPerSec: number; // zoom
  history: TimelineState[];
  historyIndex: number;

  // queries
  duration: () => number;

  // seeding / bulk
  setData: (data: TimelineState) => void;

  // tracks
  addTrack: (kind: TrackKind, name?: string) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, patch: Partial<TimelineTrack>) => void;

  // clips
  addClip: (clip: TimelineClip) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, patch: Partial<TimelineClip>) => void;
  moveClip: (clipId: string, newStart: number, newTrackId?: string) => void;
  trimClip: (clipId: string, edge: 'start' | 'end', newTime: number) => void;
  splitAtPlayhead: (trackId: string) => void;
  closeGapBefore: (clipId: string) => void;

  // ui
  selectClip: (clipId: string | null) => void;
  setPlayhead: (t: number) => void;
  setPxPerSec: (px: number) => void;

  // history
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 60;

export const useTimelineStore = create<TimelineStore>((set, get) => {
  /** Apply a pure model transform and record it in history. */
  const commit = (fn: (d: TimelineState) => TimelineState) => {
    set((s) => {
      const next = fn(s.data);
      if (next === s.data) return {}; // no-op (e.g. rejected overlap) → no history
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const history = [...trimmed, next].slice(-MAX_HISTORY);
      return { data: next, history, historyIndex: history.length - 1 };
    });
  };

  return {
    data: EMPTY_TIMELINE,
    selectedClipId: null,
    playhead: 0,
    pxPerSec: 50,
    history: [EMPTY_TIMELINE],
    historyIndex: 0,

    duration: () => timelineDuration(get().data),

    setData: (data) => set({ data, history: [data], historyIndex: 0, selectedClipId: null }),

    addTrack: (kind, name) => commit((d) => mAddTrack(d, kind, name)),
    removeTrack: (trackId) => {
      commit((d) => mRemoveTrack(d, trackId));
      if (get().data.clips.every((c) => c.id !== get().selectedClipId)) {
        set({ selectedClipId: null });
      }
    },
    updateTrack: (trackId, patch) => commit((d) => mUpdateTrack(d, trackId, patch)),

    addClip: (clip) => { commit((d) => mAddClip(d, clip)); set({ selectedClipId: clip.id }); },
    removeClip: (clipId) => {
      commit((d) => mRemoveClip(d, clipId));
      if (get().selectedClipId === clipId) set({ selectedClipId: null });
    },
    updateClip: (clipId, patch) => commit((d) => mUpdateClip(d, clipId, patch)),
    moveClip: (clipId, newStart, newTrackId) => commit((d) => mMoveClip(d, clipId, newStart, newTrackId)),
    trimClip: (clipId, edge, newTime) => commit((d) => mTrimClip(d, clipId, edge, newTime)),
    splitAtPlayhead: (trackId) => commit((d) => mSplitAt(d, trackId, get().playhead)),
    closeGapBefore: (clipId) => commit((d) => mCloseGap(d, clipId)),

    selectClip: (clipId) => set({ selectedClipId: clipId }),
    setPlayhead: (t) => set({ playhead: Math.max(0, t) }),
    setPxPerSec: (px) => set({ pxPerSec: Math.max(10, Math.min(240, px)) }),

    undo: () => set((s) => {
      if (s.historyIndex <= 0) return {};
      const i = s.historyIndex - 1;
      return { data: s.history[i], historyIndex: i };
    }),
    redo: () => set((s) => {
      if (s.historyIndex >= s.history.length - 1) return {};
      const i = s.historyIndex + 1;
      return { data: s.history[i], historyIndex: i };
    }),
    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,
  };
});
