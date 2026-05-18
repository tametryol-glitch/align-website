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
import { useCallback, useEffect } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { PreviewPanel } from './PreviewPanel';
import { TimelinePanel } from './TimelinePanel';
import { ToolBar } from './ToolBar';
import { ToolPanel } from './tools/ToolPanel';
import {
  ChevronLeft, Undo2, Redo2, Download,
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
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedId = useVideoEditorStore.getState().selectedOverlayId;
        if (selectedId) {
          e.preventDefault();
          useVideoEditorStore.getState().removeTextOverlay(selectedId);
          useVideoEditorStore.getState().removeStickerOverlay(selectedId);
          pushHistory();
        }
      }
      if (e.key === 'Escape') {
        useVideoEditorStore.getState().selectOverlay(null);
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

      {/* ── Preview Panel (video + overlays) ─────────────── */}
      <div className="flex-1 min-h-0 flex items-center justify-center bg-black/20 overflow-hidden">
        <PreviewPanel />
      </div>

      {/* ── Tool Bar (icon strip) ────────────────────────── */}
      <ToolBar />

      {/* ── Timeline Panel ───────────────────────────────── */}
      <TimelinePanel />

      {/* ── Active Tool Panel (bottom sheet) ─────────────── */}
      {activeTool !== 'none' && <ToolPanel />}
    </div>
  );
}
