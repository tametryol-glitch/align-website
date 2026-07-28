'use client';

/**
 * MultiTrackTimeline (Phase 2) — the visible multi-track editor timeline.
 *
 * Real track lanes (video / audio / text / overlay), clips positioned by their
 * absolute start, drag to move (within or between same-kind tracks), left/right
 * trim handles, split at the playhead, add/remove tracks, gaps, snapping, zoom.
 * All edits go through useTimelineStore → the tested pure model.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { useTimelineStore } from '@/lib/editor/timelineStore';
import {
  clipEnd, timelineDuration,
  type TimelineClip, type TimelineTrack, type TrackKind, type MediaClip,
} from '@/lib/editor/timelineModel';
import {
  Scissors, Trash2, Plus, Undo2, Redo2, ZoomIn, ZoomOut,
  Volume2, Video, Type, Sparkles, VolumeX, Eye, EyeOff,
} from 'lucide-react';

const LANE_H = 56;
const RULER_H = 26;
const HEADER_W = 132;
const SNAP_PX = 8;
const PAD_RIGHT = 400; // trailing scroll room past the last clip

type DragMode = 'move' | 'trim-start' | 'trim-end';
interface Drag {
  clipId: string;
  mode: DragMode;
  startX: number;
  startY: number;
  origStart: number;
  origTrackId: string;
}

const KIND_ICON: Record<TrackKind, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5" />,
  audio: <Volume2 className="w-3.5 h-3.5" />,
  text: <Type className="w-3.5 h-3.5" />,
  overlay: <Sparkles className="w-3.5 h-3.5" />,
};

const CLIP_COLOR: Record<TrackKind, string> = {
  video: 'from-indigo-500/80 to-indigo-600/80 border-indigo-300/40',
  audio: 'from-emerald-500/80 to-emerald-600/80 border-emerald-300/40',
  text: 'from-amber-500/80 to-amber-600/80 border-amber-300/40',
  overlay: 'from-fuchsia-500/80 to-fuchsia-600/80 border-fuchsia-300/40',
};

function fmt(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const f = Math.floor((t % 1) * 30);
  return `${m}:${s.toString().padStart(2, '0')}.${f.toString().padStart(2, '0')}`;
}

export function MultiTrackTimeline() {
  const data = useTimelineStore((s) => s.data);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const playhead = useTimelineStore((s) => s.playhead);
  const pxPerSec = useTimelineStore((s) => s.pxPerSec);
  const moveClip = useTimelineStore((s) => s.moveClip);
  const trimClip = useTimelineStore((s) => s.trimClip);
  const selectClip = useTimelineStore((s) => s.selectClip);
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);
  const setPxPerSec = useTimelineStore((s) => s.setPxPerSec);
  const splitAtPlayhead = useTimelineStore((s) => s.splitAtPlayhead);
  const removeClip = useTimelineStore((s) => s.removeClip);
  const closeGapBefore = useTimelineStore((s) => s.closeGapBefore);
  const addTrack = useTimelineStore((s) => s.addTrack);
  const removeTrack = useTimelineStore((s) => s.removeTrack);
  const updateTrack = useTimelineStore((s) => s.updateTrack);
  const undo = useTimelineStore((s) => s.undo);
  const redo = useTimelineStore((s) => s.redo);

  const tracks = [...data.tracks].sort((a, b) => a.order - b.order);
  const totalDur = Math.max(timelineDuration(data), 10);
  const contentW = totalDur * pxPerSec + PAD_RIGHT;

  const lanesRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  // Snap a candidate start so the clip's start OR end lands on a nearby edge.
  const snapStart = useCallback((clipId: string, candidate: number, duration: number): number => {
    const snapSec = SNAP_PX / pxPerSec;
    const points: number[] = [0, playhead];
    for (const c of data.clips) {
      if (c.id === clipId) continue;
      points.push(c.start, clipEnd(c));
    }
    let best = candidate;
    let bestD = snapSec;
    for (const p of points) {
      if (Math.abs(candidate - p) < bestD) { best = p; bestD = Math.abs(candidate - p); }
      if (Math.abs(candidate + duration - p) < bestD) { best = p - duration; bestD = Math.abs(candidate + duration - p); }
    }
    return Math.max(0, best);
  }, [data.clips, pxPerSec, playhead]);

  // Which track lane is the pointer over (for cross-track drags)?
  const trackAtY = useCallback((clientY: number): TimelineTrack | null => {
    const el = lanesRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const idx = Math.floor((clientY - rect.top + el.scrollTop) / LANE_H);
    return tracks[idx] ?? null;
  }, [tracks]);

  const onPointerDownClip = (clip: TimelineClip, mode: DragMode, e: React.PointerEvent) => {
    e.stopPropagation();
    selectClip(clip.id);
    setDrag({ clipId: clip.id, mode, startX: e.clientX, startY: e.clientY, origStart: clip.start, origTrackId: clip.trackId });
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const dt = (e.clientX - drag.startX) / pxPerSec;
      const clip = useTimelineStore.getState().data.clips.find((c) => c.id === drag.clipId);
      if (!clip) return;
      if (drag.mode === 'move') {
        let newStart = drag.origStart + dt;
        newStart = snapStart(drag.clipId, newStart, clip.duration);
        // Cross-track: only onto a track of the same kind.
        const overTrack = trackAtY(e.clientY);
        const targetTrackId = overTrack && overTrack.kind === clip.kind ? overTrack.id : clip.trackId;
        moveClip(drag.clipId, newStart, targetTrackId);
      } else if (drag.mode === 'trim-start') {
        trimClip(drag.clipId, 'start', clip.start + (e.clientX - drag.startX) / pxPerSec);
        // Re-anchor so successive moves are relative to the latest position.
        setDrag((d) => (d ? { ...d, startX: e.clientX } : d));
      } else {
        trimClip(drag.clipId, 'end', clipEnd(clip) + (e.clientX - drag.startX) / pxPerSec);
        setDrag((d) => (d ? { ...d, startX: e.clientX } : d));
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, pxPerSec, moveClip, trimClip, snapStart, trackAtY]);

  // Click ruler / lane background to move the playhead.
  const seekFromClientX = (clientX: number) => {
    const el = lanesRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPlayhead((clientX - rect.left + el.scrollLeft) / pxPerSec);
  };

  const selectedClip = data.clips.find((c) => c.id === selectedClipId) || null;

  return (
    <div className="flex flex-col bg-bg-secondary rounded-xl border border-white/10 overflow-hidden select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10 flex-wrap">
        <span className="text-xs font-mono text-text-secondary w-20">{fmt(playhead)}</span>
        <button onClick={() => selectedClip && splitAtPlayhead(selectedClip.trackId)}
          disabled={!selectedClip}
          className="px-2 py-1 rounded-md text-xs flex items-center gap-1 bg-white/5 text-text-secondary hover:bg-white/10 disabled:opacity-30" title="Split at playhead">
          <Scissors className="w-3.5 h-3.5" /> Split
        </button>
        <button onClick={() => selectedClip && closeGapBefore(selectedClip.id)}
          disabled={!selectedClip}
          className="px-2 py-1 rounded-md text-xs bg-white/5 text-text-secondary hover:bg-white/10 disabled:opacity-30" title="Close gap before clip">
          Close gap
        </button>
        <button onClick={() => selectedClip && removeClip(selectedClip.id)}
          disabled={!selectedClip}
          className="px-2 py-1 rounded-md text-xs flex items-center gap-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30" title="Delete clip">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button onClick={undo} className="p-1 rounded-md text-text-secondary hover:bg-white/10" title="Undo"><Undo2 className="w-3.5 h-3.5" /></button>
        <button onClick={redo} className="p-1 rounded-md text-text-secondary hover:bg-white/10" title="Redo"><Redo2 className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button onClick={() => setPxPerSec(pxPerSec / 1.4)} className="p-1 rounded-md text-text-secondary hover:bg-white/10" title="Zoom out"><ZoomOut className="w-3.5 h-3.5" /></button>
        <button onClick={() => setPxPerSec(pxPerSec * 1.4)} className="p-1 rounded-md text-text-secondary hover:bg-white/10" title="Zoom in"><ZoomIn className="w-3.5 h-3.5" /></button>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px] text-text-muted mr-1">Add track:</span>
          {(['video', 'audio', 'text', 'overlay'] as TrackKind[]).map((k) => (
            <button key={k} onClick={() => addTrack(k)}
              className="px-1.5 py-1 rounded-md text-[10px] flex items-center gap-1 bg-white/5 text-text-secondary hover:bg-white/10 capitalize" title={`Add ${k} track`}>
              <Plus className="w-3 h-3" />{KIND_ICON[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex" style={{ maxHeight: 340 }}>
        {/* Track headers (left column) */}
        <div className="flex-shrink-0 border-r border-white/10 bg-bg-tertiary" style={{ width: HEADER_W }}>
          <div style={{ height: RULER_H }} className="border-b border-white/10" />
          {tracks.map((t) => (
            <div key={t.id} style={{ height: LANE_H }}
              className="flex items-center gap-1 px-2 border-b border-white/5">
              <span className="text-text-muted">{KIND_ICON[t.kind]}</span>
              <span className="text-[11px] text-text-secondary truncate flex-1">{t.name}</span>
              {(t.kind === 'audio' || t.kind === 'video') && (
                <button onClick={() => updateTrack(t.id, { muted: !t.muted })} className="text-text-muted hover:text-text-primary" title={t.muted ? 'Unmute' : 'Mute'}>
                  {t.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
              )}
              {(t.kind === 'video' || t.kind === 'overlay' || t.kind === 'text') && (
                <button onClick={() => updateTrack(t.id, { hidden: !t.hidden })} className="text-text-muted hover:text-text-primary" title={t.hidden ? 'Show' : 'Hide'}>
                  {t.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              )}
              <button onClick={() => removeTrack(t.id)} className="text-text-muted hover:text-red-400" title="Delete track"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          {tracks.length === 0 && (
            <div className="p-3 text-[10px] text-text-muted">Add a track to begin →</div>
          )}
        </div>

        {/* Scrollable lanes */}
        <div ref={lanesRef} className="flex-1 overflow-auto relative">
          <div style={{ width: contentW, position: 'relative' }}>
            {/* Ruler */}
            <div style={{ height: RULER_H }}
              className="sticky top-0 z-10 border-b border-white/10 bg-bg-secondary cursor-pointer"
              onPointerDown={(e) => seekFromClientX(e.clientX)}>
              {Array.from({ length: Math.ceil(totalDur) + 1 }).map((_, i) => (
                <div key={i} className="absolute top-0 h-full border-l border-white/10" style={{ left: i * pxPerSec }}>
                  <span className="text-[9px] text-text-muted ml-1">{i}s</span>
                </div>
              ))}
            </div>

            {/* Lanes */}
            {tracks.map((t) => (
              <div key={t.id} style={{ height: LANE_H }}
                className="relative border-b border-white/5"
                onPointerDown={(e) => { if (e.target === e.currentTarget) { selectClip(null); seekFromClientX(e.clientX); } }}>
                {data.clips.filter((c) => c.trackId === t.id).map((c) => (
                  <ClipBlock key={c.id} clip={c} pxPerSec={pxPerSec}
                    selected={c.id === selectedClipId}
                    onPointerDown={onPointerDownClip} />
                ))}
              </div>
            ))}

            {/* Playhead */}
            <div className="absolute top-0 bottom-0 w-px bg-accent-primary z-20 pointer-events-none"
              style={{ left: playhead * pxPerSec }}>
              <div className="w-2.5 h-2.5 -ml-[5px] rotate-45 bg-accent-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClipBlock({ clip, pxPerSec, selected, onPointerDown }: {
  clip: TimelineClip;
  pxPerSec: number;
  selected: boolean;
  onPointerDown: (clip: TimelineClip, mode: DragMode, e: React.PointerEvent) => void;
}) {
  const left = clip.start * pxPerSec;
  const width = Math.max(6, clip.duration * pxPerSec);
  const label = clip.kind === 'text' ? (clip as { text: string }).text || 'Text'
    : clip.kind === 'video' ? 'Video'
    : clip.kind === 'audio' ? 'Audio'
    : (clip as { emoji?: string }).emoji || 'Overlay';
  const media = clip.kind === 'video' || clip.kind === 'audio' ? (clip as MediaClip) : null;

  return (
    <div
      onPointerDown={(e) => onPointerDown(clip, 'move', e)}
      className={`absolute top-1 bottom-1 rounded-md bg-gradient-to-b border cursor-grab active:cursor-grabbing overflow-hidden ${CLIP_COLOR[clip.kind]} ${selected ? 'ring-2 ring-white' : ''}`}
      style={{ left, width }}
      title={`${label} — ${clip.duration.toFixed(2)}s`}
    >
      {/* left trim handle */}
      <div onPointerDown={(e) => onPointerDown(clip, 'trim-start', e)}
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-white/40" />
      {/* right trim handle */}
      <div onPointerDown={(e) => onPointerDown(clip, 'trim-end', e)}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-white/40" />
      <div className="px-2.5 py-1 text-[10px] font-medium text-white truncate pointer-events-none">
        {label}
      </div>
      {media && (
        <div className="absolute bottom-1 left-2.5 right-2.5 text-[9px] text-white/70 pointer-events-none truncate">
          {media.duration.toFixed(1)}s{media.speed !== 1 ? ` · ${media.speed}x` : ''}
        </div>
      )}
    </div>
  );
}
