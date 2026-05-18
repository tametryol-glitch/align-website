'use client';

/**
 * ExportTool — export the edited video via FFmpeg-wasm.
 * Shows progress bar during processing and download/upload buttons when done.
 */

import { useCallback } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { Download, Upload, Loader2, AlertCircle, Check } from 'lucide-react';

export function ExportTool() {
  const exportState = useVideoEditorStore((s) => s.exportState);
  const exportProgress = useVideoEditorStore((s) => s.exportProgress);
  const exportedBlobUrl = useVideoEditorStore((s) => s.exportedBlobUrl);
  const exportError = useVideoEditorStore((s) => s.exportError);
  const setExportState = useVideoEditorStore((s) => s.setExportState);
  const setExportProgress = useVideoEditorStore((s) => s.setExportProgress);
  const setExportedBlobUrl = useVideoEditorStore((s) => s.setExportedBlobUrl);
  const setExportError = useVideoEditorStore((s) => s.setExportError);

  const handleExport = useCallback(async () => {
    try {
      setExportState('loading-ffmpeg');
      setExportProgress(0);
      setExportError(null);

      // Dynamically import the export service to keep the main bundle small
      const { exportVideo } = await import('@/lib/videoExportService');

      setExportState('processing');

      const blobUrl = await exportVideo((progress) => {
        setExportProgress(Math.round(progress * 100));
      });

      setExportedBlobUrl(blobUrl);
      setExportState('done');
    } catch (err: any) {
      console.error('[Export] Failed:', err);
      setExportError(err?.message || 'Export failed');
      setExportState('error');
    }
  }, [setExportState, setExportProgress, setExportError, setExportedBlobUrl]);

  const handleDownload = useCallback(() => {
    if (!exportedBlobUrl) return;
    const a = document.createElement('a');
    a.href = exportedBlobUrl;
    a.download = `cosmic-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [exportedBlobUrl]);

  return (
    <div className="space-y-4">
      {/* Idle state */}
      {exportState === 'idle' && (
        <>
          <p className="text-sm text-text-secondary">
            Export your edited video as MP4. This runs entirely in your browser.
          </p>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-200">
              First export may take a moment to download the processing engine (~30MB).
              Subsequent exports will be faster.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export Video
          </button>
        </>
      )}

      {/* Loading FFmpeg */}
      {exportState === 'loading-ffmpeg' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
          <p className="text-sm text-text-secondary">Loading video processor...</p>
          <p className="text-xs text-text-muted">This only happens once per session</p>
        </div>
      )}

      {/* Processing */}
      {exportState === 'processing' && (
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Exporting...</span>
            <span className="text-sm font-mono text-accent-primary">{exportProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent-primary transition-[width] duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted text-center">
            Processing video in your browser. Keep this tab open.
          </p>
        </div>
      )}

      {/* Done */}
      {exportState === 'done' && exportedBlobUrl && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Export complete!</span>
          </div>

          {/* Preview */}
          <div className="w-full max-w-[240px] mx-auto rounded-xl overflow-hidden bg-black">
            <video
              src={exportedBlobUrl}
              controls
              className="w-full aspect-[9/16] object-contain"
              playsInline
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => {
                setExportState('idle');
                setExportProgress(0);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 text-text-secondary text-sm font-medium hover:bg-white/15 transition-colors"
            >
              Re-export
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {exportState === 'error' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Export failed</span>
          </div>
          <p className="text-xs text-text-muted">{exportError}</p>
          <button
            onClick={() => {
              setExportState('idle');
              setExportError(null);
            }}
            className="w-full py-2.5 rounded-xl bg-white/10 text-text-secondary text-sm font-medium hover:bg-white/15 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
