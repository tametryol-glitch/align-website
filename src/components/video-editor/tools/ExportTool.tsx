'use client';

/**
 * ExportTool — export the edited video via FFmpeg-wasm.
 * Shows progress bar during processing, then download + upload buttons.
 */

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { createClient } from '@/lib/supabase';
import { Download, Upload, Loader2, AlertCircle, Check, Send } from 'lucide-react';

export function ExportTool() {
  const exportState = useVideoEditorStore((s) => s.exportState);
  const exportProgress = useVideoEditorStore((s) => s.exportProgress);
  const exportedBlobUrl = useVideoEditorStore((s) => s.exportedBlobUrl);
  const exportError = useVideoEditorStore((s) => s.exportError);
  const setExportState = useVideoEditorStore((s) => s.setExportState);
  const setExportProgress = useVideoEditorStore((s) => s.setExportProgress);
  const setExportedBlobUrl = useVideoEditorStore((s) => s.setExportedBlobUrl);
  const setExportError = useVideoEditorStore((s) => s.setExportError);

  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [postingToFeed, setPostingToFeed] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    try {
      setExportState('loading-ffmpeg');
      setExportProgress(0);
      setExportError(null);
      setUploadedUrl(null);
      setUploadError(null);

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

  /** Upload the export and return its public URL, or null on failure. */
  const uploadExport = useCallback(async (): Promise<string | null> => {
    if (!exportedBlobUrl) return null;
    if (uploadedUrl) return uploadedUrl;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUploadError('Not signed in. Please sign in to upload.');
        return null;
      }

      // Fetch the blob from the blob URL
      const resp = await fetch(exportedBlobUrl);
      const blob = await resp.blob();
      const file = new File([blob], `edited-${Date.now()}.mp4`, { type: 'video/mp4' });

      const path = `${user.id}/cosmic-video-${Date.now()}.mp4`;
      const { error } = await supabase.storage
        .from('post-media')
        .upload(path, file, { contentType: 'video/mp4', upsert: false });

      if (error) {
        console.error('[Export] Upload error:', error.message);
        setUploadError(error.message);
        return null;
      }

      const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(path);
      setUploadedUrl(urlData.publicUrl);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('[Export] Upload exception:', err);
      setUploadError(err?.message || 'Upload failed');
      return null;
    }
  }, [exportedBlobUrl, uploadedUrl]);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    setUploadError(null);
    await uploadExport();
    setUploading(false);
  }, [uploadExport]);

  /**
   * Upload (if needed) and hand the render to the composer it came from —
   * the reel composer when opened with ?returnTo=reel, otherwise the feed.
   */
  const handlePost = useCallback(async () => {
    setPostingToFeed(true);
    setUploadError(null);
    const url = await uploadExport();
    if (!url) { setPostingToFeed(false); return; }
    const returnTo = new URLSearchParams(window.location.search).get('returnTo');
    const dest = returnTo === 'reel'
      ? `/reels/create?editedVideoUrl=${encodeURIComponent(url)}`
      : `/feed?editedVideoUrl=${encodeURIComponent(url)}`;
    router.push(dest);
  }, [uploadExport, router]);

  const returnToReel =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('returnTo') === 'reel';

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

          {/* Primary: send the render to the composer so the editor isn't a
              dead end. Download / Save to Cloud stay available below. */}
          <button
            onClick={handlePost}
            disabled={postingToFeed}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
          >
            {postingToFeed ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</>
            ) : (
              <><Send className="w-4 h-4" /> {returnToReel ? 'Continue to reel' : 'Post to Cosmic Feed'}</>
            )}
          </button>

          {/* Download + Upload buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || postingToFeed || !!uploadedUrl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 text-text-secondary text-sm font-medium hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : uploadedUrl ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Uploaded
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Save to Cloud
                </>
              )}
            </button>
          </div>

          {/* Upload success */}
          {uploadedUrl && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-green-300">
                Video saved to your cloud storage. You can use it in posts and messages.
              </p>
            </div>
          )}

          {/* Upload error */}
          {uploadError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-300">{uploadError}</p>
            </div>
          )}

          {/* Re-export */}
          <button
            onClick={() => {
              setExportState('idle');
              setExportProgress(0);
              setUploadedUrl(null);
              setUploadError(null);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-text-muted text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Re-export
          </button>
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
