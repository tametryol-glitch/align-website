'use client';

/**
 * /editor-lab — Phase 3.5 testbed for the full MultiTrackEditor (branch only).
 * Loads a demo video so the init-from-video, add-music/text, split/trim/gaps,
 * and live preview can be verified without the auth-gated editor.
 */

import { useEffect } from 'react';
import { useTimelineStore } from '@/lib/editor/timelineStore';
import { MultiTrackEditor } from '@/components/video-editor/multitrack/MultiTrackEditor';
import { timelineDuration } from '@/lib/editor/timelineModel';
import { detectBeats } from '@/lib/editor/beatDetect';

export default function EditorLabPage() {
  const data = useTimelineStore((s) => s.data);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const playhead = useTimelineStore((s) => s.playhead);

  // Branch-only test hook so the timeline can be driven from the console.
  useEffect(() => {
    const w = window as unknown as { __timeline?: unknown; __detectBeats?: unknown };
    w.__timeline = useTimelineStore;
    w.__detectBeats = detectBeats;
  }, []);

  const sel = data.clips.find((c) => c.id === selectedClipId);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-3">
      <div>
        <h1 className="text-lg font-bold text-text-primary">Multi-Track Editor (lab)</h1>
        <p className="text-xs text-text-muted">Phase 3.5 — real editor seeded with a demo video.</p>
      </div>

      <div className="h-[560px] rounded-xl border border-white/10 bg-bg-secondary">
        <MultiTrackEditor sourceUrl="/lab-sample.mp4" sourceDuration={30} />
      </div>

      <div className="text-xs text-text-muted font-mono space-y-1">
        <div>playhead: {playhead.toFixed(2)}s · tracks: {data.tracks.length} · clips: {data.clips.length} · dur: {timelineDuration(data).toFixed(1)}s</div>
        <div>selected: {sel ? `${sel.kind} @ ${sel.start.toFixed(2)}s, len ${sel.duration.toFixed(2)}s` : 'none'}</div>
        <div data-testid="clip-positions">
          {data.clips.map((c) => `${c.kind}[${c.start.toFixed(1)}→${(c.start + c.duration).toFixed(1)}]`).join('  ')}
        </div>
      </div>
    </div>
  );
}
