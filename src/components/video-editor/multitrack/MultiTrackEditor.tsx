'use client';

/**
 * MultiTrackEditor (Phase 3.5) — the real, usable multi-track editor.
 *
 * Initialises the timeline store from a loaded video (one video track + a clip
 * spanning it), then lets the user add music CLIPS from the genre library (at
 * their true length, splittable, gappable), add text clips, split/trim/move on
 * every lane, and see it all in the live WYSIWYG preview.
 */

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTimelineStore } from '@/lib/editor/timelineStore';
import { MultiTrackTimeline } from './MultiTrackTimeline';
import {
  nextId, _resetIds, timelineDuration,
  type TimelineState, type MediaClip, type TextClip, type TimelineTrack,
} from '@/lib/editor/timelineModel';
import { useAudioLibrary, trackUrl, type MusicTrack } from '@/lib/musicLibrary';
import { Music, Type, X, Plus } from 'lucide-react';

const MultiTrackPlayer = dynamic(() => import('@/remotion/editor/MultiTrackPlayer'), { ssr: false });

/** Build the starting timeline: one video track holding the whole source clip. */
function initialTimeline(sourceUrl: string, duration: number): TimelineState {
  _resetIds();
  const vId = nextId('trk');
  const track: TimelineTrack = { id: vId, kind: 'video', name: 'Video 1', order: 0 };
  const clip: MediaClip = {
    id: nextId('clip'), trackId: vId, kind: 'video', start: 0, duration,
    sourceUrl, sourceStart: 0, sourceEnd: duration, sourceDuration: duration, speed: 1, volume: 1,
  };
  return { tracks: [track], clips: [clip] };
}

export function MultiTrackEditor({ sourceUrl, sourceDuration }: { sourceUrl: string; sourceDuration: number }) {
  const setData = useTimelineStore((s) => s.setData);
  const data = useTimelineStore((s) => s.data);
  const addTrack = useTimelineStore((s) => s.addTrack);
  const addClip = useTimelineStore((s) => s.addClip);
  const playhead = useTimelineStore((s) => s.playhead);
  const [sheet, setSheet] = useState<'music' | 'text' | null>(null);

  // Seed once from the loaded video.
  useEffect(() => {
    setData(initialTimeline(sourceUrl, Math.max(0.1, sourceDuration)));
  }, [sourceUrl, sourceDuration, setData]);

  // Find (or lazily create) the first track of a kind, returning its id.
  const ensureTrack = (kind: TimelineTrack['kind'], name?: string): string => {
    const existing = useTimelineStore.getState().data.tracks.find((t) => t.kind === kind);
    if (existing) return existing.id;
    addTrack(kind, name);
    // addTrack appended; grab the newest of that kind.
    const after = useTimelineStore.getState().data.tracks.filter((t) => t.kind === kind);
    return after[after.length - 1].id;
  };

  // Place a new clip at the playhead, or slide right to the next free slot.
  const freeStartOnTrack = (trackId: string, want: number, len: number): number => {
    const clips = useTimelineStore.getState().data.clips
      .filter((c) => c.trackId === trackId).sort((a, b) => a.start - b.start);
    let start = Math.max(0, want);
    for (const c of clips) {
      const cEnd = c.start + c.duration;
      if (start < cEnd && start + len > c.start) start = cEnd; // bump past any overlap
    }
    return start;
  };

  const addMusic = (mt: MusicTrack) => {
    const trackId = ensureTrack('audio', 'Music');
    const len = mt.durationSeconds > 0 ? mt.durationSeconds : Math.min(sourceDuration, 30);
    const start = freeStartOnTrack(trackId, playhead, len);
    const clip: MediaClip = {
      id: nextId('clip'), trackId, kind: 'audio', start, duration: len,
      sourceUrl: trackUrl(mt), sourceStart: 0, sourceEnd: len, sourceDuration: len, speed: 1, volume: 0.7,
    };
    addClip(clip);
    setSheet(null);
  };

  const addText = (text: string) => {
    const trackId = ensureTrack('text', 'Text');
    const len = 2.5;
    const start = freeStartOnTrack(trackId, playhead, len);
    const clip: TextClip = {
      id: nextId('clip'), trackId, kind: 'text', start, duration: len,
      text: text || 'Your text', x: 50, y: 50, fontSize: 64, color: '#ffffff', fontFamily: 'Inter',
      bgColor: '', strokeColor: '#000000', strokeWidth: 0, textAlign: 'center', rotation: 0, animation: 'fade',
    };
    addClip(clip);
    setSheet(null);
  };

  return (
    <div className="flex flex-col gap-3 p-3 h-full">
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="w-[240px] flex-shrink-0 aspect-[9/16] rounded-xl overflow-hidden bg-black">
          <MultiTrackPlayer timeline={data} />
        </div>

        {/* Add tools */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setSheet('music')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-sm font-medium hover:bg-emerald-500/25">
              <Music className="w-4 h-4" /> Add music
            </button>
            <button onClick={() => setSheet('text')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-300 text-sm font-medium hover:bg-amber-500/25">
              <Type className="w-4 h-4" /> Add text
            </button>
          </div>
          <p className="text-xs text-text-muted">
            {data.tracks.length} track{data.tracks.length !== 1 ? 's' : ''} · {data.clips.length} clip{data.clips.length !== 1 ? 's' : ''} · {timelineDuration(data).toFixed(1)}s
          </p>
          {sheet === 'music' && <MusicSheet onPick={addMusic} onClose={() => setSheet(null)} />}
          {sheet === 'text' && <TextSheet onAdd={addText} onClose={() => setSheet(null)} />}
        </div>
      </div>

      {/* Timeline */}
      <MultiTrackTimeline />
    </div>
  );
}

function MusicSheet({ onPick, onClose }: { onPick: (t: MusicTrack) => void; onClose: () => void }) {
  const { music, loading } = useAudioLibrary();
  const [genre, setGenre] = useState('all');
  const genres = Array.from(new Set(music.map((m) => m.category).filter(Boolean))).sort();
  const shown = genre === 'all' ? music : music.filter((m) => m.category === genre);

  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-text-secondary">Music library</span>
        {genres.length > 0 && (
          <select value={genre} onChange={(e) => setGenre(e.target.value)}
            className="ml-auto text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-text-secondary">
            <option value="all">All genres</option>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        )}
        <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>
      {loading ? (
        <p className="text-xs text-text-muted py-4 text-center">Loading library…</p>
      ) : shown.length === 0 ? (
        <p className="text-xs text-text-muted py-4 text-center">No tracks yet — upload songs in /admin/audio.</p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-auto">
          {shown.map((m) => (
            <button key={m.id} onClick={() => onPick(m)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-md text-left border border-white/10 bg-white/5 hover:bg-white/10">
              <Plus className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-xs font-medium text-text-primary truncate">{m.name}</span>
                <span className="block text-[10px] text-text-muted truncate">
                  {m.category || 'Music'}{m.durationSeconds ? ` · ${Math.round(m.durationSeconds)}s` : ''}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TextSheet({ onAdd, onClose }: { onAdd: (text: string) => void; onClose: () => void }) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3">
      <div className="flex items-center gap-2">
        <input ref={ref} value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onAdd(text); }}
          placeholder="Type your caption…"
          className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-border-primary text-sm text-text-primary focus:outline-none focus:border-accent-primary" />
        <button onClick={() => onAdd(text)}
          className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/30">Add</button>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
