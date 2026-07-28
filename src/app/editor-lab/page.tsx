'use client';

/**
 * /editor-lab — Phase 2 testbed for the multi-track timeline (branch only).
 * Seeds a demo timeline with gaps + multiple track kinds so the drag / trim /
 * split / add-track mechanics can be verified without the auth-gated editor.
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTimelineStore } from '@/lib/editor/timelineStore';
import { MultiTrackTimeline } from '@/components/video-editor/multitrack/MultiTrackTimeline';
import { nextId, _resetIds, type TimelineState, type MediaClip, type TextClip } from '@/lib/editor/timelineModel';

const MultiTrackPlayer = dynamic(() => import('@/remotion/editor/MultiTrackPlayer'), { ssr: false });

function seed(): TimelineState {
  _resetIds();
  const vId = nextId('trk'), aId = nextId('trk'), tId = nextId('trk');
  const tracks = [
    { id: vId, kind: 'video' as const, name: 'Video 1', order: 0 },
    { id: aId, kind: 'audio' as const, name: 'Music', order: 1 },
    { id: tId, kind: 'text' as const, name: 'Text', order: 2 },
  ];
  const vClip = (start: number, s0: number, s1: number): MediaClip => ({
    id: nextId('clip'), trackId: vId, kind: 'video', start, duration: s1 - s0,
    sourceUrl: '/lab-sample.mp4', sourceStart: s0, sourceEnd: s1, sourceDuration: 30, speed: 1, volume: 1,
  });
  const music: MediaClip = {
    id: nextId('clip'), trackId: aId, kind: 'audio', start: 0, duration: 8,
    sourceUrl: '/lab-song.mp3', sourceStart: 0, sourceEnd: 8, sourceDuration: 45, speed: 1, volume: 0.6,
  };
  const text: TextClip = {
    id: nextId('clip'), trackId: tId, kind: 'text', start: 1, duration: 2.5,
    text: 'Hello ✨', x: 50, y: 50, fontSize: 48, color: '#fff', fontFamily: 'Inter',
    bgColor: '', strokeColor: '', strokeWidth: 0, textAlign: 'center', rotation: 0, animation: 'fade',
  };
  // Two video clips with a GAP between them (4s–6s empty).
  return { tracks, clips: [vClip(0, 0, 4), vClip(6, 10, 14), music, text] };
}

export default function EditorLabPage() {
  const setData = useTimelineStore((s) => s.setData);
  const data = useTimelineStore((s) => s.data);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const playhead = useTimelineStore((s) => s.playhead);

  useEffect(() => { setData(seed()); }, [setData]);

  // Branch-only test hook so the timeline can be driven from the console.
  useEffect(() => { (window as unknown as { __timeline?: unknown }).__timeline = useTimelineStore; }, []);

  const sel = data.clips.find((c) => c.id === selectedClipId);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Timeline Lab</h1>
        <p className="text-sm text-text-muted">
          Phase 2 testbed. Drag clips to move (and between same-kind tracks), drag edges to trim,
          Split at the playhead, add tracks, leave gaps. Click the ruler to move the playhead.
        </p>
      </div>

      <div className="flex gap-4 items-start">
        <div className="w-[220px] flex-shrink-0 aspect-[9/16] rounded-xl overflow-hidden bg-black">
          <MultiTrackPlayer timeline={data} />
        </div>
        <div className="flex-1 min-w-0">
          <MultiTrackTimeline />
        </div>
      </div>

      <div className="text-xs text-text-muted font-mono space-y-1">
        <div>playhead: {playhead.toFixed(2)}s · tracks: {data.tracks.length} · clips: {data.clips.length}</div>
        <div>selected: {sel ? `${sel.kind} @ ${sel.start.toFixed(2)}s, len ${sel.duration.toFixed(2)}s` : 'none'}</div>
        <div data-testid="clip-positions">
          {data.clips.map((c) => `${c.kind}[${c.start.toFixed(1)}→${(c.start + c.duration).toFixed(1)}]`).join('  ')}
        </div>
      </div>

      <button onClick={() => setData(seed())} className="px-3 py-1.5 rounded-lg bg-white/5 text-text-secondary text-xs hover:bg-white/10">
        Reset demo
      </button>
    </div>
  );
}
