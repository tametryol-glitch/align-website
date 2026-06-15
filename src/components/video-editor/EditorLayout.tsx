'use client';

/**
 * EditorLayout — main container for the video editor.
 *
 * Structure:
 *  ┌─────────────────────┐
 *  │  Top Bar (back/undo)│
 *  ├─────────────────────┤
 *  │                     │
 *  │   Preview Panel     │
 *  │   (video + overlays)│
 *  │                     │
 *  ├─────────────────────┤
 *  │   Tool Bar          │
 *  ├─────────────────────┤
 *  │   Timeline Panel    │
 *  ├─────────────────────┤
 *  │   Tool Panel (opt.) │
 *  └─────────────────────┘
 */

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { PreviewPanel } from './PreviewPanel';
import { TimelinePanel } from './TimelinePanel';
import { ToolBar } from './ToolBar';
import { ToolPanel } from './tools/ToolPanel';
import { ShortcutHelp } from './ShortcutHelp';
import {
  ChevronLeft, Undo2, Redo2, Download, Keyboard,
} from 'lucide-react';

interface EditorLayoutProps {
  videoId: string;
}

export function EditorLayout({ videoId }: EditorLayoutProps) {
  const router = useRouter();
  const activeTool = useVideoEditorStore((s) => s.activeTool);
  const undo = useVideoEditorStore((s) => s.undo);
  const redo = useVideoEditorStore((s) => s.redo);
  const canUndo = useVideoEditorStore((s) => s.canUndo);
  const canRedo = useVideoEditorStore((s) => s.canRedo);
  const setActiveTool = useVideoEditorStore((s) => s.setActiveTool);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Push initial history snapshot
  useEffect(() => {
    pushHistory();
  }, [pushHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      // Split at playhead (S) — the core editing key. Skip when Ctrl/Cmd is held
      // so the browser's own shortcuts (e.g. Ctrl+S save) aren't hijacked.
      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const before = useVideoEditorStore.getState().segments.length;
        useVideoEditorStore.getState().splitAtPlayhead();
        // Only record history if a split actually happened.
        if (useVideoEditorStore.getState().segments.length !== before) pushHistory();
      }
      // Delete the currently selected overlay / clip / B-roll.
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const st = useVideoEditorStore.getState();
        const { selectedOverlayId, selectedSegmentId, selectedBrollId } = st;
        if (selectedOverlayId || selectedSegmentId || selectedBrollId) {
          e.preventDefault();
          if (selectedOverlayId) {
            st.removeTextOverlay(selectedOverlayId);
            st.removeStickerOverlay(selectedOverlayId);
          }
          if (selectedSegmentId) st.removeSegment(selectedSegmentId);
          if (selectedBrollId) st.removeBroll(selectedBrollId);
          pushHistory();
        }
      }
      // Zoom the timeline in / out.
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        const st = useVideoEditorStore.getState();
        st.setTimelineZoom(st.timelineZoom + 10);
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        const st = useVideoEditorStore.getState();
        st.setTimelineZoom(st.timelineZoom - 10);
      }
      // Toggle the keyboard-shortcut cheat sheet (?).
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      }
      if (e.key === 'Escape') {
        useVideoEditorStore.getState().selectOverlay(null);
        useVideoEditorStore.getState().selectSegment(null);
        useVideoEditorStore.getState().selectBroll(null);
        setShowShortcuts(false);
        setActiveTool('none');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, pushHistory, setActiveTool]);

  const handleBack = useCallback(() => {
    router.push('/cosmic-video');
  }, [router]);

  const handleExport = useCallback(() => {
    setActiveTool('export');
  }, [setActiveTool]);

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* ── Top Bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary"
            title="Back to videos"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-text-primary">Edit Video</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="ml-2 flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* ── Main: preview column (+ desktop tool rail) ───── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview + toolbar column */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 flex items-center justify-center bg-black/20 overflow-hidden">
            <PreviewPanel />
          </div>
          <ToolBar />
        </div>

        {/* Desktop: dock the active tool panel to the right to use the space */}
        {activeTool !== 'none' && (
          <div className="hidden lg:block lg:w-[380px] shrink-0 border-l border-white/10 bg-black/30 overflow-y-auto">
            <ToolPanel />
          </div>
        )}
      </div>

      {/* ── Timeline Panel (full width) ──────────────────── */}
      <TimelinePanel />

      {/* ── Mobile: tool panel as a bottom sheet ─────────── */}
      {activeTool !== 'none' && (
        <div className="lg:hidden">
          <ToolPanel />
        </div>
      )}

      {/* ── Keyboard shortcut cheat sheet ────────────────── */}
      {showShortcuts && <ShortcutHelp onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
