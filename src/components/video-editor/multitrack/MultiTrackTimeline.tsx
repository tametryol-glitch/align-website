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
import { getPeaks, getCachedPeaks } from '@/lib/editor/waveform';

const MAX_VOL = 2; // 200% — top of the on-clip volume line

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

  // Which track lane is the pointer over (for cross-track drags)? Rows sit
  // below the sticky ruler, so subtract RULER_H.
  const trackAtY = useCallback((clientY: number): TimelineTrack | null => {
    const el = lanesRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const idx = Math.floor((clientY - rect.top - RULER_H + el.scrollTop) / LANE_H);
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

  // Click ruler / lane background to move the playhead. `laneEl` is the ruler or
  // lane element whose left edge is timeline t=0 (getBoundingClientRect accounts
  // for horizontal scroll).
  const seekFromClientX = (clientX: number, laneEl: HTMLElement) => {
    setPlayhead((clientX - laneEl.getBoundingClientRect().left) / pxPerSec);
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

      {/* Single scroll container — sticky ruler (top) + sticky headers (left) so
          headers and lanes scroll together, both vertically and horizontally. */}
      <div ref={lanesRef} className="overflow-auto relative" style={{ minHeight: 240, maxHeight: 460 }}>
        <div style={{ width: HEADER_W + contentW, position: 'relative' }}>
          {/* Ruler row */}
          <div className="sticky top-0 z-40 flex" style={{ height: RULER_H }}>
            <div className="sticky left-0 z-50 flex-shrink-0 bg-bg-tertiary border-r border-b border-white/10" style={{ width: HEADER_W }} />
            <div className="relative bg-bg-secondary border-b border-white/10 cursor-pointer"
              style={{ width: contentW, height: RULER_H }}
              onPointerDown={(e) => seekFromClientX(e.clientX, e.currentTarget)}>
              {Array.from({ length: Math.ceil(totalDur) + 1 }).map((_, i) => (
                <div key={i} className="absolute top-0 h-full border-l border-white/10" style={{ left: i * pxPerSec }}>
                  <span className="text-[9px] text-text-muted ml-1">{i}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Track rows: sticky header + lane */}
          {tracks.map((t) => (
            <div key={t.id} className="flex" style={{ height: LANE_H }}>
              <div className="sticky left-0 z-30 flex-shrink-0 bg-bg-tertiary border-r border-b border-white/5 flex flex-col justify-center gap-1 px-2" style={{ width: HEADER_W }}>
                <div className="flex items-center gap-1">
                  <span className="text-text-muted">{KIND_ICON[t.kind]}</span>
                  <span className="text-[11px] text-text-secondary truncate flex-1">{t.name}</span>
                  {(t.kind === 'video' || t.kind === 'overlay' || t.kind === 'text') && (
                    <button onClick={() => updateTrack(t.id, { hidden: !t.hidden })} className="text-text-muted hover:text-text-primary" title={t.hidden ? 'Show' : 'Hide'}>
                      {t.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  )}
                  <button onClick={() => removeTrack(t.id)} className="text-text-muted hover:text-red-400" title="Delete track"><Trash2 className="w-3 h-3" /></button>
                </div>
                {(t.kind === 'audio' || t.kind === 'video') && (
                  <div className="flex items-center gap-1" title="Track volume — applies to every clip on this lane">
                    <button onClick={() => updateTrack(t.id, { muted: !t.muted })} className="text-text-muted hover:text-text-primary flex-shrink-0" title={t.muted ? 'Unmute lane' : 'Mute lane'}>
                      {t.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                    <input type="range" min={0} max={2} step={0.05} value={t.muted ? 0 : (t.volume ?? 1)}
                      disabled={t.muted}
                      onChange={(e) => updateTrack(t.id, { volume: parseFloat(e.target.value) })}
                      className="flex-1 h-1 accent-teal-400 disabled:opacity-40 min-w-0" />
                    <span className="text-[8px] text-text-muted w-5 text-right flex-shrink-0">{t.muted ? 'M' : Math.round((t.volume ?? 1) * 100)}</span>
                  </div>
                )}
              </div>
              <div className="relative border-b border-white/5" style={{ width: contentW, height: LANE_H }}
                onPointerDown={(e) => { if (e.target === e.currentTarget) { selectClip(null); seekFromClientX(e.clientX, e.currentTarget); } }}>
                {data.clips.filter((c) => c.trackId === t.id).map((c) => (
                  <ClipBlock key={c.id} clip={c} pxPerSec={pxPerSec}
                    selected={c.id === selectedClipId}
                    trackVolume={t.muted ? 0 : (t.volume ?? 1)}
                    onPointerDown={onPointerDownClip} />
                ))}
              </div>
            </div>
          ))}
          {tracks.length === 0 && (
            <div className="p-3 text-[10px] text-text-muted">Add a track to begin.</div>
          )}

          {/* Playhead — spans the lanes, offset past the sticky header column */}
          <div className="absolute w-px bg-accent-primary z-20 pointer-events-none"
            style={{ left: HEADER_W + playhead * pxPerSec, top: RULER_H, bottom: 0 }}>
            <div className="w-2.5 h-2.5 -ml-[5px] -mt-[5px] rotate-45 bg-accent-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Decode + cache a clip's audio peaks for the timeline waveform.
function useWaveform(url?: string): number[] | null {
  const [peaks, setPeaks] = useState<number[] | null>(() => (url ? getCachedPeaks(url) ?? null : null));
  useEffect(() => {
    if (!url) { setPeaks(null); return; }
    const cached = getCachedPeaks(url);
    if (cached) { setPeaks(cached); return; }
    let alive = true;
    getPeaks(url).then((p) => { if (alive) setPeaks(p); }).catch(() => { if (alive) setPeaks(null); });
    return () => { alive = false; };
  }, [url]);
  return peaks;
}

function ClipBlock({ clip, pxPerSec, selected, trackVolume, onPointerDown }: {
  clip: TimelineClip;
  pxPerSec: number;
  selected: boolean;
  trackVolume: number;
  onPointerDown: (clip: TimelineClip, mode: DragMode, e: React.PointerEvent) => void;
}) {
  const updateClip = useTimelineStore((s) => s.updateClip);
  const left = clip.start * pxPerSec;
  const width = Math.max(6, clip.duration * pxPerSec);
  const label = clip.kind === 'text' ? (clip as { text: string }).text || 'Text'
    : clip.kind === 'video' ? 'Video'
    : clip.kind === 'audio' ? 'Audio'
    : (clip as { emoji?: string }).emoji || 'Overlay';
  const media = clip.kind === 'video' || clip.kind === 'audio' ? (clip as MediaClip) : null;
  const peaks = useWaveform(media?.sourceUrl);
  const vol = media?.volume ?? 1;
  // What the clip actually plays at = its own level × the lane master. The
  // waveform is drawn at this height so it shrinks/grows with the volume.
  const effVol = vol * trackVolume;
  const volPct = Math.min(1, vol / MAX_VOL); // 0..1 up from the bottom
  const lineTop = `${(1 - volPct) * 100}%`;

  // Drag the volume line up/down to set THIS clip's level (Filmora-style).
  const onVolDown = (e: React.PointerEvent) => {
    if (!media) return;
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const apply = (clientY: number) => {
      const frac = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      updateClip(media.id, { volume: Math.round(frac * MAX_VOL * 20) / 20 } as Partial<TimelineClip>);
    };
    apply(e.clientY);
    const move = (ev: PointerEvent) => apply(ev.clientY);
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div
      onPointerDown={(e) => onPointerDown(clip, 'move', e)}
      className={`absolute top-1 bottom-1 rounded-md bg-gradient-to-b border cursor-grab active:cursor-grabbing overflow-hidden ${CLIP_COLOR[clip.kind]} ${selected ? 'ring-2 ring-white' : ''}`}
      style={{ left, width }}
      title={`${label} — ${clip.duration.toFixed(2)}s${media ? ` · ${Math.round(vol * 100)}% vol` : ''}`}
    >
      {/* waveform — height scales with the effective volume, like Filmora */}
      {media && peaks && (
        <Waveform peaks={peaks} sourceStart={media.sourceStart} sourceEnd={media.sourceEnd}
          sourceDuration={media.sourceDuration} volumeScale={effVol} />
      )}

      {/* left / right trim handles */}
      <div onPointerDown={(e) => onPointerDown(clip, 'trim-start', e)}
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-white/40 z-20" />
      <div onPointerDown={(e) => onPointerDown(clip, 'trim-end', e)}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-white/40 z-20" />

      <div className="px-2.5 py-1 text-[10px] font-medium text-white truncate pointer-events-none relative z-10">
        {label}
      </div>

      {/* volume line + drag band (media clips) */}
      {media && width > 24 && (
        <>
          <div className="absolute left-0 right-0 z-10 pointer-events-none"
            style={{ top: lineTop, height: 0, borderTop: `2px solid ${vol === 0 ? 'rgba(248,113,113,0.95)' : 'rgba(253,224,71,0.95)'}` }} />
          <div onPointerDown={onVolDown}
            className="absolute left-2 right-2 z-20 cursor-ns-resize"
            style={{ top: `calc(${lineTop} - 6px)`, height: 12 }}
            title="Drag to set volume" />
          <span className="absolute right-1 z-10 text-[8px] font-semibold text-white/90 pointer-events-none px-0.5 rounded bg-black/30"
            style={{ top: `calc(${lineTop} - 12px)` }}>
            {vol === 0 ? 'muted' : `${Math.round(vol * 100)}%`}
          </span>
        </>
      )}

      {media && (
        <div className="absolute bottom-1 left-2.5 text-[9px] text-white/70 pointer-events-none truncate z-10">
          {media.duration.toFixed(1)}s{media.speed !== 1 ? ` · ${media.speed}x` : ''}
        </div>
      )}
    </div>
  );
}

// Symmetric amplitude waveform for the trimmed [sourceStart, sourceEnd] slice.
// `volumeScale` is the effective level (clip × track): the bar heights track it
// so lowering the volume visibly shrinks the wave, and muting flattens it.
function Waveform({ peaks, sourceStart, sourceEnd, sourceDuration, volumeScale }: {
  peaks: number[];
  sourceStart: number;
  sourceEnd: number;
  sourceDuration: number;
  volumeScale: number;
}) {
  const total = peaks.length;
  const a = Math.max(0, Math.floor((sourceStart / Math.max(0.001, sourceDuration)) * total));
  const b = Math.min(total, Math.ceil((sourceEnd / Math.max(0.001, sourceDuration)) * total));
  const slice = peaks.slice(a, Math.max(a + 1, b));
  const N = Math.min(slice.length, 500);
  if (N <= 1) return null;
  const step = slice.length / N;
  const bars: number[] = [];
  for (let i = 0; i < N; i++) {
    let m = 0;
    const s = Math.floor(i * step), e = Math.max(s + 1, Math.floor((i + 1) * step));
    for (let j = s; j < e; j++) if (slice[j] > m) m = slice[j];
    bars.push(m);
  }
  // 100% volume fills the lane; boosts go taller (clamped), mute → flat line.
  const gain = Math.min(1.15, volumeScale) * 46;
  const muted = volumeScale <= 0.001;
  const H = (p: number) => (muted ? 0.6 : Math.max(0.6, Math.min(48, p * gain)));
  // Build one filled, mirrored area path so it reads as a solid waveform
  // (not spaced bars): trace the top envelope, then back along the bottom.
  let top = `M0,${50 - H(bars[0])}`;
  for (let i = 1; i < N; i++) top += `L${i},${(50 - H(bars[i])).toFixed(2)}`;
  let bottom = '';
  for (let i = N - 1; i >= 0; i--) bottom += `L${i},${(50 + H(bars[i])).toFixed(2)}`;
  const d = `${top}${bottom}Z`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${Math.max(1, N - 1)} 100`} preserveAspectRatio="none">
      <path d={d} fill={muted ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.52)'} />
    </svg>
  );
}
