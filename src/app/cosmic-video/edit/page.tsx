'use client';

/**
 * Cosmic Video Editor — CapCut-lite editing page.
 *
 * Reads ?videoId=xxx&url=encodedVideoUrl from the query string,
 * loads the source video, and renders the full editor UI.
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { EditorLayout } from '@/components/video-editor/EditorLayout';
import { Loader2 } from 'lucide-react';

function EditorPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('url') || '';
  const videoId = searchParams.get('videoId') || '';
  const init = useVideoEditorStore((s) => s.init);
  const sourceVideoUrl = useVideoEditorStore((s) => s.sourceVideoUrl);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) {
      setError('No video URL provided.');
      setLoading(false);
      return;
    }

    // Probe the video to get its duration
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) {
        setError('Could not read video duration.');
        setLoading(false);
        return;
      }
      init(videoUrl, duration);
      setLoading(false);
    };

    video.onerror = () => {
      setError('Failed to load video. The URL may be invalid or expired.');
      setLoading(false);
    };

    video.src = videoUrl;

    return () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      video.src = '';
    };
  }, [videoUrl, init]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-red-400 text-center max-w-md">
          <p className="text-lg font-medium mb-2">Could not load video</p>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
        <button
          onClick={() => router.push('/cosmic-video')}
          className="px-6 py-2 rounded-xl bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors"
        >
          Back to Videos
        </button>
      </div>
    );
  }

  if (loading || !sourceVideoUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        <p className="text-text-muted text-sm">Loading editor...</p>
      </div>
    );
  }

  return <EditorLayout videoId={videoId} />;
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        </div>
      }
    >
      <EditorPageInner />
    </Suspense>
  );
}
