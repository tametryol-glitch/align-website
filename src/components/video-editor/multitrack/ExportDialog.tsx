'use client';

/**
 * Export progress + result. Replaces the inline status strip: while rendering
 * it shows real progress and what's happening; when done it shows the finished
 * video with the next actions (post, download); on failure, why and a retry.
 */

import { Check, Download, Loader2, X, AlertTriangle } from 'lucide-react';

export function ExportDialog({
  exporting, progress, error, resultUrl, postLabel, onPost, onRetry, onClose,
}: {
  exporting: boolean;
  progress: number;
  error: string | null;
  resultUrl: string | null;
  postLabel: string;
  onPost: () => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  if (!exporting && !error && !resultUrl) return null;

  const stage =
    progress < 30 ? 'Uploading your clips…'
    : progress < 40 ? 'Getting ready to render…'
    : 'Rendering your video…';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Export">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl p-6 text-center">
        {exporting && (
          <>
            <Loader2 className="w-8 h-8 mx-auto text-accent-primary animate-spin" />
            <h2 className="mt-4 text-base font-semibold text-text-primary">{stage}</h2>
            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-accent-primary transition-all duration-500" style={{ width: `${Math.max(4, progress)}%` }} />
            </div>
            <p className="mt-2 text-xs text-text-muted">{progress}% · longer videos take a few minutes. Keep this tab open.</p>
          </>
        )}

        {!exporting && error && (
          <>
            <AlertTriangle className="w-8 h-8 mx-auto text-red-400" />
            <h2 className="mt-4 text-base font-semibold text-text-primary">Export didn&apos;t finish</h2>
            <p className="mt-2 text-sm text-text-muted break-words">{error}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={onClose} className="flex-1 px-4 py-2 rounded-full bg-white/10 text-text-primary text-sm font-medium hover:bg-white/15">Back to editing</button>
              <button onClick={onRetry} className="flex-1 px-4 py-2 rounded-full bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90">Try again</button>
            </div>
          </>
        )}

        {!exporting && !error && resultUrl && (
          <>
            <div className="relative">
              <button onClick={onClose} aria-label="Close" className="absolute -top-2 -right-2 p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="mt-3 text-base font-semibold text-text-primary">Your video is ready</h2>
            </div>
            <video src={resultUrl} controls playsInline className="mt-4 w-full max-h-[320px] rounded-xl bg-black" />
            <div className="mt-5 flex flex-col gap-2">
              <button onClick={onPost} className="w-full px-4 py-2.5 rounded-full bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90">
                {postLabel}
              </button>
              <a
                href={resultUrl} target="_blank" rel="noopener noreferrer" download
                className="w-full px-4 py-2.5 rounded-full bg-white/10 text-text-primary text-sm font-medium hover:bg-white/15 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </a>
              <button onClick={onClose} className="text-xs text-text-muted hover:text-text-primary py-1">Keep editing</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
