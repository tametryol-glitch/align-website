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
import { useRouter } from 'next/navigation';
import { useTimelineStore } from '@/lib/editor/timelineStore';
import { MultiTrackTimeline } from './MultiTrackTimeline';
import {
  nextId, _resetIds, timelineDuration,
  type TimelineState, type TimelineClip, type MediaClip, type TextClip, type StickerClip, type TimelineTrack,
} from '@/lib/editor/timelineModel';
import { useAudioLibrary, trackUrl, type MusicTrack } from '@/lib/musicLibrary';
import { FILTER_PRESETS } from '@/lib/videoFilters';
import { EFFECTS, TRANSITIONS, MOTIONS } from '@/lib/editor/effects';
import { createClient } from '@/lib/supabase';
import { requestRender, getRenderStatus } from '@/lib/cosmicVideoService';
import { detectBeats } from '@/lib/editor/beatDetect';
import { LOOKS, type Look } from '@/lib/editor/looks';
import { saveDraft, loadDraft, agoLabel, type EditorDraft } from '@/lib/editor/drafts';
import { EMOJI_CATEGORIES } from '@/lib/editor/emojiData';
import { FACE_FILTERS } from '@/lib/editor/faceFilters';
import { Music, Type, X, Plus, Wand2, Download, Loader2, Check, Activity, Zap, Sparkles, Mic, Film, Smile, Layers, Volume2 } from 'lucide-react';

const MultiTrackPlayer = dynamic(() => import('@/remotion/editor/MultiTrackPlayer'), { ssr: false });

/** Best-effort: does this video have an audio track? Remotion's server render
 *  CRASHES trying to mix a video that has NO audio when other audio is present,
 *  so silent videos must be muted. Detection uses mozHasAudio / audioTracks, or
 *  a brief muted play to populate Chrome's webkitAudioDecodedByteCount. */
function probeHasAudio(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const v = document.createElement('video');
    const finish = (val: boolean) => {
      if (done) return; done = true;
      try { v.pause(); v.removeAttribute('src'); v.load(); } catch { /* noop */ }
      resolve(val);
    };
    v.muted = true;
    v.preload = 'auto';
    v.onloadeddata = () => {
      const a = v as unknown as { mozHasAudio?: boolean; audioTracks?: { length: number }; webkitAudioDecodedByteCount?: number };
      if (a.mozHasAudio || (a.audioTracks && a.audioTracks.length > 0)) return finish(true);
      v.play().then(() => setTimeout(() => finish(!!a.webkitAudioDecodedByteCount), 300)).catch(() => finish(true));
    };
    v.onerror = () => finish(false);
    v.src = url;
    setTimeout(() => finish(true), 4000); // slow network: don't silence by mistake
  });
}

/** Probe a video file's duration (seconds) from a blob/URL in the browser. */
function readVideoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => resolve(isFinite(v.duration) ? v.duration : 0);
      v.onerror = () => resolve(0);
      v.src = url;
    } catch { resolve(0); }
  });
}

/** Probe an audio/video file's duration (seconds) in the browser. */
function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const a = new Audio();
      a.preload = 'metadata';
      a.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(isFinite(a.duration) ? a.duration : 0); };
      a.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
      a.src = url;
    } catch { resolve(0); }
  });
}

/** Draggable handles over the preview — move text/captions/stickers/emojis to
 *  any position. Shows the elements active at the current playhead; dragging
 *  updates the clip's x/y (% of the frame). */
function PositioningOverlay() {
  const clips = useTimelineStore((s) => s.data.clips);
  const playhead = useTimelineStore((s) => s.playhead);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const selectClip = useTimelineStore((s) => s.selectClip);
  const updateClip = useTimelineStore((s) => s.updateClip);
  const ref = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const positionable = clips.filter((c) =>
    (c.kind === 'text' || c.kind === 'overlay') && playhead >= c.start - 0.02 && playhead < c.start + c.duration,
  ) as Array<TextClip | StickerClip>;

  useEffect(() => {
    if (!dragId) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      updateClip(dragId, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } as Partial<TimelineClip>);
    };
    const onUp = () => setDragId(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [dragId, updateClip]);

  return (
    <div ref={ref} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      {positionable.map((c) => {
        const isText = c.kind === 'text';
        const sticker = c as StickerClip;
        const sel = c.id === selectedClipId;
        return (
          <div key={c.id}
            onPointerDown={(e) => { e.stopPropagation(); selectClip(c.id); setDragId(c.id); }}
            style={{
              position: 'absolute', left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto', cursor: dragId === c.id ? 'grabbing' : 'grab', touchAction: 'none',
              border: sel ? '1.5px solid #fff' : '1px dashed rgba(255,255,255,0.6)', borderRadius: 6,
              padding: isText ? '1px 5px' : '2px', maxWidth: '86%', background: 'rgba(0,0,0,0.12)',
            }}>
            {!isText && sticker.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sticker.imageUrl} alt="" style={{ width: 38, height: 38, objectFit: 'contain', display: 'block', pointerEvents: 'none' }} />
            ) : (
              <span style={{ fontSize: isText ? 10 : 22, lineHeight: 1.1, color: '#fff', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 170 }}>
                {isText ? ((c as TextClip).text || 'Text') : (sticker.emoji || '🙂')}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StickerSheet({ onPick, onClose }: { onPick: (opts: { emoji?: string; imageUrl?: string }) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'emoji' | 'gif'>('emoji');
  const [emojiCat, setEmojiCat] = useState(EMOJI_CATEGORIES[0].id);
  const [q, setQ] = useState('');
  const [gifs, setGifs] = useState<Array<{ id: string; preview: string; full: string }>>([]);
  const [loading, setLoading] = useState(false);

  const loadGifs = async (query: string) => {
    setLoading(true);
    try {
      const svc = await import('@/lib/giphyService');
      const res = query.trim() ? await svc.searchStickers(query) : await svc.getTrendingStickers();
      setGifs((res.data || []).map((g) => ({ id: g.id, preview: g.images.fixed_height?.url || g.images.preview_gif?.url, full: g.images.original?.url || g.images.fixed_height?.url })));
    } catch { setGifs([]); }
    setLoading(false);
  };

  useEffect(() => { if (tab === 'gif' && gifs.length === 0) loadGifs(''); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3">
      <div className="flex items-center gap-2 mb-2">
        <Smile className="w-4 h-4 text-pink-400" />
        <div className="flex gap-1">
          <button onClick={() => setTab('emoji')} className={`px-2 py-0.5 rounded-md text-xs ${tab === 'emoji' ? 'bg-pink-500/20 text-pink-200' : 'text-text-muted hover:text-text-secondary'}`}>Emoji</button>
          <button onClick={() => setTab('gif')} className={`px-2 py-0.5 rounded-md text-xs ${tab === 'gif' ? 'bg-pink-500/20 text-pink-200' : 'text-text-muted hover:text-text-secondary'}`}>GIF</button>
        </div>
        <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>

      {tab === 'emoji' ? (
        <div>
          {/* category tabs */}
          <div className="flex gap-0.5 mb-2 overflow-x-auto pb-1">
            {EMOJI_CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setEmojiCat(c.id)} title={c.name}
                className={`flex-shrink-0 text-lg leading-none rounded-md px-1.5 py-1 ${emojiCat === c.id ? 'bg-pink-500/25' : 'hover:bg-white/10 opacity-70'}`}>
                {c.icon}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-1 max-h-56 overflow-auto">
            {(EMOJI_CATEGORIES.find((c) => c.id === emojiCat) || EMOJI_CATEGORIES[0]).emojis.map((e, i) => (
              <button key={i} onClick={() => onPick({ emoji: e })} className="text-xl leading-none hover:bg-white/10 rounded p-1">{e}</button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') loadGifs(q); }}
              placeholder="Search GIFs…"
              className="flex-1 px-3 py-1.5 rounded-lg bg-bg-primary border border-border-primary text-xs text-text-primary focus:outline-none focus:border-accent-primary" />
            <button onClick={() => loadGifs(q)} className="px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-200 text-xs font-medium hover:bg-pink-500/30">Search</button>
          </div>
          {loading ? (
            <p className="text-xs text-text-muted py-4 text-center">Loading…</p>
          ) : (
            <div className="grid grid-cols-4 gap-1 max-h-40 overflow-auto">
              {gifs.map((g) => (
                // eslint-disable-next-line @next/next/no-img-element
                <button key={g.id} onClick={() => onPick({ imageUrl: g.full })} className="rounded overflow-hidden hover:ring-2 hover:ring-pink-400">
                  <img src={g.preview} alt="" className="w-full h-16 object-cover" />
                </button>
              ))}
              {gifs.length === 0 && <p className="col-span-4 text-xs text-text-muted py-4 text-center">No GIFs — try a search.</p>}
            </div>
          )}
          <p className="text-[9px] text-text-muted text-center mt-1">Powered by GIPHY</p>
        </div>
      )}
      <p className="text-[10px] text-text-muted mt-2">Tap to add, then drag it anywhere on the video.</p>
    </div>
  );
}

const VOICE_FX: Array<[string, number]> = [
  ['Normal', 1], ['Chipmunk', 1.6], ['Squeaky', 1.35], ['Deep', 0.7], ['Slow-mo', 0.8], ['Fast', 1.3],
];

const ASPECTS = [
  { id: '9:16', w: 1080, h: 1920 },
  { id: '1:1', w: 1080, h: 1080 },
  { id: '4:5', w: 1080, h: 1350 },
  { id: '16:9', w: 1920, h: 1080 },
];

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
  const updateClip = useTimelineStore((s) => s.updateClip);
  const setClipSpeed = useTimelineStore((s) => s.setClipSpeed);
  const aspect = useTimelineStore((s) => s.aspect);
  const setAspect = useTimelineStore((s) => s.setAspect);
  const playhead = useTimelineStore((s) => s.playhead);
  const selectedClipId = useTimelineStore((s) => s.selectedClipId);
  const [sheet, setSheet] = useState<'music' | 'sfx' | 'text' | 'filters' | 'edittext' | 'looks' | 'voiceover' | 'keyframes' | 'voicefx' | 'stickers' | 'background' | 'volume' | 'facefx' | null>(null);

  const applyLook = (look: Look) => {
    const store = useTimelineStore.getState();
    store.data.clips.filter((c) => c.kind === 'video').forEach((c) => {
      store.updateClip(c.id, {
        filter: look.filter, filterIntensity: look.filterIntensity, motion: look.motion || undefined,
        transitionIn: look.transition === 'none' ? undefined : { type: look.transition, durationSec: 0.5 },
        effects: [...look.effects],
      } as Partial<MediaClip>);
    });
    setSheet(null);
  };

  const selectedClip = data.clips.find((c) => c.id === selectedClipId);
  const selectedVideo = selectedClip && selectedClip.kind === 'video' ? selectedClip : null;
  const selectedText = selectedClip && selectedClip.kind === 'text' ? selectedClip : null;
  const selectedAudio = selectedClip && selectedClip.kind === 'audio' ? selectedClip : null;
  // Any clip that carries audio (music/SFX/voiceover clips, or a video clip's own sound).
  const selectedMedia = selectedAudio || selectedVideo;

  // ── Auto-captions: free local Whisper → karaoke caption clips ──
  const [capBusy, setCapBusy] = useState(false);
  const [capMsg, setCapMsg] = useState<string | null>(null);
  const autoCaptions = async (audioClip: MediaClip) => {
    setCapBusy(true); setCapMsg(null);
    try {
      const blob = await (await fetch(audioClip.sourceUrl)).blob();
      const fd = new FormData();
      fd.append('file', new File([blob], 'audio.mp3', { type: blob.type || 'audio/mpeg' }));
      const r = await fetch('/api/transcribe', { method: 'POST', body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Transcribe failed');
      const words: Array<{ word: string; start: number; end: number }> = data.words || [];
      if (!words.length) { setCapMsg('No speech detected in that clip.'); setCapBusy(false); return; }

      // Group words into short caption lines (≤5 words, break on a >0.7s gap).
      const lines: Array<typeof words> = [];
      let cur: typeof words = [];
      for (const w of words) {
        if (cur.length && (cur.length >= 5 || w.start - cur[cur.length - 1].end > 0.7)) { lines.push(cur); cur = []; }
        cur.push(w);
      }
      if (cur.length) lines.push(cur);

      const objs = lines.map((ln) => ({ startT: ln[0].start, endT: ln[ln.length - 1].end, text: ln.map((w) => w.word).join(' ').replace(/\s+/g, ' ').trim() }));
      for (let i = 0; i < objs.length; i++) {
        if (i + 1 < objs.length && objs[i].endT > objs[i + 1].startT) objs[i].endT = objs[i + 1].startT - 0.02;
      }
      const trackId = ensureNamedTrack('text', 'Captions');
      const store = useTimelineStore.getState();
      objs.forEach((o) => {
        const start = audioClip.start + (o.startT - audioClip.sourceStart);
        const dur = Math.max(0.4, o.endT - o.startT);
        store.addClip({
          id: nextId('clip'), trackId, kind: 'text', start, duration: dur, text: o.text,
          x: 50, y: 82, fontSize: 58, color: '#ffffff', fontFamily: 'Inter',
          bgColor: '', strokeColor: '#000000', strokeWidth: 5, textAlign: 'center', rotation: 0, animation: 'karaoke',
        } as TextClip);
      });
      setCapMsg(`${words.length} words · ${objs.length} caption lines${data.engine === 'local' ? ' · free (local Whisper)' : ''}`);
    } catch (e: any) {
      setCapMsg(`Auto-captions failed: ${e.message}`);
    }
    setCapBusy(false);
  };

  // ── Beat sync: cut the video to the selected song's beats ─────
  const [beatBusy, setBeatBusy] = useState(false);
  const [beatMsg, setBeatMsg] = useState<string | null>(null);
  const syncToBeat = async (audioClip: MediaClip) => {
    setBeatBusy(true); setBeatMsg(null);
    try {
      const beats = await detectBeats(audioClip.sourceUrl);
      const store = useTimelineStore.getState();
      const videoTrack = store.data.tracks.find((t) => t.kind === 'video');
      if (!videoTrack) { setBeatMsg('Add a video first.'); setBeatBusy(false); return; }
      // Map each beat (source time) to a timeline time within the clip's window,
      // and cut the video there. Iterate so each split sees the updated state.
      let cuts = 0;
      for (const b of beats) {
        if (b < audioClip.sourceStart || b > audioClip.sourceEnd) continue;
        const tl = audioClip.start + (b - audioClip.sourceStart);
        const before = useTimelineStore.getState().data.clips.filter((c) => c.trackId === videoTrack.id).length;
        useTimelineStore.getState().splitAt(videoTrack.id, tl);
        if (useTimelineStore.getState().data.clips.filter((c) => c.trackId === videoTrack.id).length > before) cuts++;
      }
      setBeatMsg(`${beats.length} beats detected · ${cuts} cuts made`);
    } catch (e: any) {
      setBeatMsg(`Beat sync failed: ${e.message}`);
    }
    setBeatBusy(false);
  };

  // ── Export ────────────────────────────────────────────────────
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // When the editor was opened from the feed/reels record flow (?returnTo=),
  // hand the finished render back to that composer to post — not a dead end.
  const router = useRouter();
  const returnTo = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('returnTo') : null;
  const postToComposer = (url: string) => {
    const dest = returnTo === 'reel'
      ? `/reels/create?editedVideoUrl=${encodeURIComponent(url)}`
      : `/feed?editedVideoUrl=${encodeURIComponent(url)}`;
    router.push(dest);
  };

  const handleExport = async () => {
    setExporting(true); setProgress(3); setExportError(null); setResultUrl(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to export.');

      // Upload any local (blob:) clip sources to public storage; the renderer
      // fetches media by URL. Already-hosted http(s) URLs pass straight through.
      const state = useTimelineStore.getState().data;
      const uniqueBlobs = Array.from(new Set(state.clips.map((c) => (c as MediaClip).sourceUrl).filter((u) => u && u.startsWith('blob:'))));
      const urlMap = new Map<string, string>();
      for (let i = 0; i < uniqueBlobs.length; i++) {
        const blobUrl = uniqueBlobs[i];
        const resp = await fetch(blobUrl);
        const blob = await resp.blob();
        const ext = blob.type.includes('audio') ? 'mp3' : 'mp4';
        const file = new File([blob], `edit.${ext}`, { type: blob.type || 'video/mp4' });
        const path = `${user.id}/mt-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error } = await supabase.storage.from('post-media').upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error(`Upload failed: ${error.message}`);
        urlMap.set(blobUrl, supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl);
        setProgress(5 + Math.round((i + 1) / uniqueBlobs.length * 25));
      }

      const timeline = {
        tracks: state.tracks,
        clips: state.clips.map((c) => {
          const m = c as MediaClip;
          return m.sourceUrl && urlMap.has(m.sourceUrl) ? { ...c, sourceUrl: urlMap.get(m.sourceUrl) } : c;
        }),
      };
      const durationSeconds = Math.max(1, Math.round(timelineDuration(state as never)));
      setProgress(35);

      const job = await requestRender({
        template_id: 'user_video_edit',
        astro_data: {},
        audio_option: { type: 'none' },
        customizations: { edit_spec: { __multitrack: { timeline, durationSeconds, width: aspect.w, height: aspect.h } } as unknown as Record<string, unknown> },
      });
      const jobId = job.id || job.job_id;
      if (!jobId) throw new Error('Render did not start.');

      let final: string | null = null;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const st = await getRenderStatus(jobId);
        setProgress(Math.min(95, 40 + i * 3));
        if (st.status === 'ready' && st.video_url) { final = st.video_url; break; }
        if (st.status === 'failed') throw new Error(st.error || 'Render failed on the server.');
      }
      if (!final) throw new Error('Render timed out. Try again.');
      setProgress(100);
      setResultUrl(final);
    } catch (e: any) {
      setExportError(e.message);
    }
    setExporting(false);
  };

  // Seed once from the loaded video, capturing any prior draft to offer restore.
  const [restoreDraft, setRestoreDraft] = useState<EditorDraft | null>(null);
  useEffect(() => {
    const d = loadDraft();
    if (d && d.sourceUrl === sourceUrl && (d.data?.clips?.length ?? 0) > 1) setRestoreDraft(d);
    const initial = initialTimeline(sourceUrl, Math.max(0.1, sourceDuration));
    setData(initial);
    // Mute the source in render if it has no audio track (else the server render crashes).
    const vClip = initial.clips.find((c) => c.kind === 'video');
    if (vClip) probeHasAudio(sourceUrl).then((has) => { if (!has) useTimelineStore.getState().updateClip(vClip.id, { volume: 0 }); });
  }, [sourceUrl, sourceDuration, setData]);

  // Auto-save the edit to localStorage (debounced) so nothing is lost.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const unsub = useTimelineStore.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const st = useTimelineStore.getState();
        saveDraft({ sourceUrl, data: st.data, aspect: st.aspect, savedAt: Date.now() });
      }, 1500);
    });
    return () => { clearTimeout(timer); unsub(); };
  }, [sourceUrl]);

  const applyRestore = () => {
    if (!restoreDraft) return;
    setData(restoreDraft.data);
    setAspect(restoreDraft.aspect.w, restoreDraft.aspect.h);
    setRestoreDraft(null);
  };

  // Find (or create) a track of a kind by name (Music/SFX/Voiceover lanes, Captions).
  const ensureNamedTrack = (kind: TimelineTrack['kind'], name: string): string => {
    const existing = useTimelineStore.getState().data.tracks.find((t) => t.kind === kind && t.name === name);
    if (existing) return existing.id;
    addTrack(kind, name);
    const after = useTimelineStore.getState().data.tracks.filter((t) => t.kind === kind);
    return after[after.length - 1].id;
  };
  const ensureAudioTrack = (name: string) => ensureNamedTrack('audio', name);

  // Find a track (of kind, name-prefixed) with room for [start, start+duration);
  // create a new one if all overlap. Lets multiple stickers/texts stack in time
  // as separate layers instead of being rejected.
  const freeTrackFor = (kind: TimelineTrack['kind'], prefix: string, start: number, duration: number): string => {
    const st = () => useTimelineStore.getState();
    const tracks = st().data.tracks.filter((t) => t.kind === kind && t.name.startsWith(prefix));
    for (const t of tracks) {
      const overlap = st().data.clips.some((c) => c.trackId === t.id && start < c.start + c.duration && start + duration > c.start);
      if (!overlap) return t.id;
    }
    addTrack(kind, tracks.length === 0 ? prefix : `${prefix} ${tracks.length + 1}`);
    const after = st().data.tracks.filter((t) => t.kind === kind);
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
    const trackId = ensureAudioTrack('Music');
    const len = mt.durationSeconds > 0 ? mt.durationSeconds : Math.min(sourceDuration, 30);
    const start = freeStartOnTrack(trackId, playhead, len);
    const clip: MediaClip = {
      id: nextId('clip'), trackId, kind: 'audio', start, duration: len,
      sourceUrl: trackUrl(mt), sourceStart: 0, sourceEnd: len, sourceDuration: len, speed: 1, volume: 0.7,
    };
    addClip(clip);
    setSheet(null);
  };

  const addVoiceover = async (text: string, voice: string) => {
    const res = await fetch('/api/tts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, format: 'mp3' }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || `TTS failed (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const duration = await readDuration(new File([blob], 'vo.mp3', { type: 'audio/mpeg' })) || 3;
    const trackId = ensureAudioTrack('Voiceover');
    const start = freeStartOnTrack(trackId, playhead, duration);
    addClip({
      id: nextId('clip'), trackId, kind: 'audio', start, duration,
      sourceUrl: url, sourceStart: 0, sourceEnd: duration, sourceDuration: duration, speed: 1, volume: 1,
    });
    setSheet(null);
  };

  // Import a second video as an overlay / B-roll clip (picture-in-picture).
  const videoInputRef = useRef<HTMLInputElement>(null);
  const onPickOverlayVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const dur = (await readVideoDuration(url)) || 5;
    const hasAudio = await probeHasAudio(url);
    const trackId = ensureNamedTrack('overlay', 'Overlay');
    const start = freeStartOnTrack(trackId, playhead, dur);
    addClip({
      id: nextId('clip'), trackId, kind: 'video', start, duration: dur,
      sourceUrl: url, sourceStart: 0, sourceEnd: dur, sourceDuration: dur, speed: 1, volume: hasAudio ? 1 : 0,
      x: 50, y: 50, scale: 0.6, opacity: 1,
    });
  };

  const addSticker = (opts: { emoji?: string; imageUrl?: string }) => {
    const start = playhead;
    const trackId = freeTrackFor('overlay', 'Stickers', start, 3);
    addClip({
      id: nextId('clip'), trackId, kind: 'overlay', emoji: opts.emoji, imageUrl: opts.imageUrl,
      x: 50, y: 45, scale: 1, rotation: 0, start, duration: 3,
    } as StickerClip);
    setSheet(null);
  };

  const addSfx = (mt: MusicTrack) => {
    const trackId = ensureAudioTrack('SFX');
    const len = mt.durationSeconds > 0 ? mt.durationSeconds : 2;
    const start = freeStartOnTrack(trackId, playhead, len);
    const clip: MediaClip = {
      id: nextId('clip'), trackId, kind: 'audio', start, duration: len,
      sourceUrl: trackUrl(mt), sourceStart: 0, sourceEnd: len, sourceDuration: len, speed: 1, volume: 0.9,
    };
    addClip(clip);
    setSheet(null);
  };

  const addText = (text: string) => {
    const len = 2.5;
    const start = playhead;
    const trackId = freeTrackFor('text', 'Text', start, len);
    const clip: TextClip = {
      id: nextId('clip'), trackId, kind: 'text', start, duration: len,
      text: text || 'Your text', x: 50, y: 50, fontSize: 64, color: '#ffffff', fontFamily: 'Inter',
      bgColor: '', strokeColor: '#000000', strokeWidth: 0, textAlign: 'center', rotation: 0, animation: 'fade',
    };
    addClip(clip);
    setSheet(null);
  };

  return (
    <div className="flex flex-col gap-3 p-3 h-full min-h-0 overflow-y-auto">
      {restoreDraft && (
        <div className="flex items-center gap-2 text-xs bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-lg">
          <span className="text-indigo-200">You have an unsaved edit from {agoLabel(restoreDraft.savedAt, Date.now())}.</span>
          <button onClick={applyRestore} className="ml-auto px-2.5 py-1 rounded-md bg-indigo-500/25 text-indigo-100 font-medium hover:bg-indigo-500/35">Restore</button>
          <button onClick={() => setRestoreDraft(null)} className="px-2 py-1 rounded-md text-text-muted hover:text-text-primary">Dismiss</button>
        </div>
      )}
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="flex-shrink-0">
          <div data-testid="mt-preview" className="relative rounded-xl overflow-hidden bg-black mx-auto"
            style={{ width: 240, aspectRatio: `${aspect.w} / ${aspect.h}`, maxHeight: 420 }}>
            <MultiTrackPlayer timeline={data} width={aspect.w} height={aspect.h} />
            <PositioningOverlay />
          </div>
          {/* Aspect ratio */}
          <div className="flex gap-1 mt-2 justify-center">
            {ASPECTS.map((a) => {
              const active = aspect.w === a.w && aspect.h === a.h;
              return (
                <button key={a.id} onClick={() => setAspect(a.w, a.h)}
                  className={`px-2 py-1 rounded-md text-[10px] border ${active ? 'border-accent-primary bg-accent-primary/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                  {a.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add tools */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/15 text-indigo-300 text-sm font-medium hover:bg-indigo-500/25"
              title="Import a second video as a B-roll / overlay clip">
              <Film className="w-4 h-4" /> Add video
            </button>
            <input ref={videoInputRef} type="file" accept="video/*,.mp4,.mov,.webm,.mkv" onChange={onPickOverlayVideo} className="hidden" />
            <button onClick={() => setSheet('music')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-sm font-medium hover:bg-emerald-500/25">
              <Music className="w-4 h-4" /> Add music
            </button>
            <button onClick={() => setSheet('sfx')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500/15 text-teal-300 text-sm font-medium hover:bg-teal-500/25">
              <Zap className="w-4 h-4" /> Sound FX
            </button>
            <button onClick={() => setSheet('looks')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/15 text-purple-300 text-sm font-medium hover:bg-purple-500/25">
              <Sparkles className="w-4 h-4" /> Templates
            </button>
            <button onClick={() => setSheet('voiceover')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/15 text-rose-300 text-sm font-medium hover:bg-rose-500/25">
              <Mic className="w-4 h-4" /> Voiceover
            </button>
            <button onClick={() => setSheet('text')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-300 text-sm font-medium hover:bg-amber-500/25">
              <Type className="w-4 h-4" /> Add text
            </button>
            <button onClick={() => setSheet('stickers')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/15 text-pink-300 text-sm font-medium hover:bg-pink-500/25">
              <Smile className="w-4 h-4" /> Stickers
            </button>
            <button onClick={() => setSheet('filters')} disabled={!selectedVideo}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-fuchsia-500/15 text-fuchsia-300 text-sm font-medium hover:bg-fuchsia-500/25 disabled:opacity-30"
              title={selectedVideo ? 'Filters & effects for the selected clip' : 'Select a video clip first'}>
              <Wand2 className="w-4 h-4" /> Filters &amp; FX
            </button>
            <button onClick={() => setSheet('background')} disabled={!selectedVideo}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/15 text-green-300 text-sm font-medium hover:bg-green-500/25 disabled:opacity-30"
              title={selectedVideo ? 'Remove background: AI cut-out or green screen' : 'Select a video clip first'}>
              <Layers className="w-4 h-4" /> Background
            </button>
            <button onClick={() => setSheet('facefx')} disabled={!selectedVideo}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/15 text-pink-300 text-sm font-medium hover:bg-pink-500/25 disabled:opacity-30"
              title={selectedVideo ? 'Face filters — glasses, crowns, ears, that track your face' : 'Select a video clip first'}>
              <Smile className="w-4 h-4" /> Face FX
            </button>
            {selectedVideo && (
              <button onClick={() => setSheet('keyframes')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/15 text-indigo-300 text-sm font-medium hover:bg-indigo-500/25"
                title="Animate scale/position/opacity with keyframes">
                <Activity className="w-4 h-4" /> Keyframes
              </button>
            )}
            {selectedText && (
              <button onClick={() => setSheet('edittext')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-300 text-sm font-medium hover:bg-amber-500/25">
                <Type className="w-4 h-4" /> Edit text
              </button>
            )}
            {selectedMedia && (
              <button onClick={() => setSheet('volume')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500/15 text-teal-300 text-sm font-medium hover:bg-teal-500/25"
                title="Adjust the volume of the selected clip">
                <Volume2 className="w-4 h-4" /> Volume
              </button>
            )}
            {selectedAudio && (
              <button onClick={() => syncToBeat(selectedAudio)} disabled={beatBusy}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-sm font-medium hover:bg-emerald-500/25 disabled:opacity-40"
                title="Cut the video to this song's beats">
                {beatBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />} Beat sync
              </button>
            )}
            {selectedAudio && (
              <button onClick={() => autoCaptions(selectedAudio)} disabled={capBusy}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/15 text-sky-300 text-sm font-medium hover:bg-sky-500/25 disabled:opacity-40"
                title="Transcribe this clip into karaoke captions (free, local)">
                {capBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />} Auto-captions
              </button>
            )}
            {selectedAudio && (
              <button onClick={() => setSheet('voicefx')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/15 text-rose-300 text-sm font-medium hover:bg-rose-500/25"
                title="Pitch / speed voice effects">
                <Mic className="w-4 h-4" /> Voice FX
              </button>
            )}
            <button onClick={handleExport} disabled={exporting || data.clips.length === 0}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90 disabled:opacity-40">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? `Exporting… ${progress}%` : 'Export'}
            </button>
          </div>

          {beatMsg && <p className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-2 rounded-lg">{beatMsg}</p>}
          {capMsg && <p className="text-xs text-sky-300 bg-sky-500/10 px-3 py-2 rounded-lg">{capMsg}</p>}
          {exportError && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{exportError}</p>}
          {resultUrl && (
            <div className="flex items-center flex-wrap gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Export ready.</span>
              <button onClick={() => postToComposer(resultUrl)}
                className="ml-auto px-2.5 py-1 rounded-md bg-accent-primary text-white font-semibold hover:bg-accent-primary/90">
                {returnTo === 'reel' ? 'Continue to reel' : 'Post to Cosmic Feed'}
              </button>
              <a href={resultUrl} target="_blank" rel="noopener noreferrer" download
                className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-200 font-medium hover:bg-emerald-500/30">
                Download
              </a>
            </div>
          )}
          <p className="text-xs text-text-muted">
            {data.tracks.length} track{data.tracks.length !== 1 ? 's' : ''} · {data.clips.length} clip{data.clips.length !== 1 ? 's' : ''} · {timelineDuration(data).toFixed(1)}s
          </p>
          {sheet === 'music' && <MusicSheet kind="music" onPick={addMusic} onClose={() => setSheet(null)} />}
          {sheet === 'sfx' && <MusicSheet kind="sfx" onPick={addSfx} onClose={() => setSheet(null)} />}
          {sheet === 'voiceover' && <VoiceoverSheet onGenerate={addVoiceover} onClose={() => setSheet(null)} />}
          {sheet === 'stickers' && <StickerSheet onPick={addSticker} onClose={() => setSheet(null)} />}
          {sheet === 'volume' && selectedMedia && (
            <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-text-secondary">
                  Volume — {selectedMedia.kind === 'audio' ? 'audio clip' : 'video sound'}
                </span>
                <button onClick={() => setSheet(null)} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                <span>Level</span>
                <span className="text-text-primary font-medium">
                  {(selectedMedia.volume ?? 1) === 0 ? 'Muted' : `${Math.round((selectedMedia.volume ?? 1) * 100)}%`}
                </span>
              </div>
              <input type="range" min={0} max={2} step={0.05} value={selectedMedia.volume ?? 1}
                onChange={(e) => updateClip(selectedMedia.id, { volume: parseFloat(e.target.value) } as Partial<TimelineClip>)}
                className="w-full accent-teal-400" />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {([['Mute', 0], ['50%', 0.5], ['100%', 1], ['150%', 1.5]] as Array<[string, number]>).map(([label, v]) => {
                  const active = (selectedMedia.volume ?? 1) === v;
                  return (
                    <button key={label} onClick={() => updateClip(selectedMedia.id, { volume: v } as Partial<TimelineClip>)}
                      className={`px-2 py-1.5 rounded-md text-[11px] border ${active ? 'border-teal-400 bg-teal-500/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-text-muted mt-2">Slide past 100% to boost quiet clips. Set to Mute to silence a clip while keeping it on the track.</p>
            </div>
          )}
          {sheet === 'voicefx' && selectedAudio && (
            <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-medium text-text-secondary">Voice FX</span>
                <button onClick={() => setSheet(null)} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {VOICE_FX.map(([name, rate]) => {
                  const active = (selectedAudio.speed || 1) === rate;
                  return (
                    <button key={name} onClick={() => setClipSpeed(selectedAudio.id, rate)}
                      className={`px-2 py-2 rounded-md text-[11px] border ${active ? 'border-rose-400 bg-rose-500/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                      {name}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-text-muted mt-2">Voice FX shift pitch &amp; speed together (classic chipmunk / deep-voice style).</p>
            </div>
          )}
          {sheet === 'looks' && (
            <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-text-secondary">Templates — one tap, applies to all clips</span>
                <button onClick={() => setSheet(null)} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {LOOKS.map((l) => (
                  <button key={l.id} onClick={() => applyLook(l)}
                    className="px-2 py-2.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-center">
                    <span className="block text-lg leading-none mb-0.5">{l.emoji}</span>
                    <span className="block text-[10px] font-medium text-text-primary">{l.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {sheet === 'text' && <TextSheet onAdd={addText} onClose={() => setSheet(null)} />}
          {sheet === 'filters' && selectedVideo && (
            <FiltersSheet clip={selectedVideo} onChange={(patch) => updateClip(selectedVideo.id, patch)}
              onSpeed={(sp) => setClipSpeed(selectedVideo.id, sp)} onClose={() => setSheet(null)} />
          )}
          {sheet === 'edittext' && selectedText && (
            <TextEditSheet clip={selectedText} onChange={(patch) => updateClip(selectedText.id, patch)} onClose={() => setSheet(null)} />
          )}
          {sheet === 'keyframes' && selectedVideo && (
            <KeyframeSheet clip={selectedVideo} playhead={playhead} onChange={(patch) => updateClip(selectedVideo.id, patch)} onClose={() => setSheet(null)} />
          )}
          {sheet === 'background' && selectedVideo && (
            <BackgroundSheet clip={selectedVideo} onChange={(patch) => updateClip(selectedVideo.id, patch)} onClose={() => setSheet(null)} />
          )}
          {sheet === 'facefx' && selectedVideo && (
            <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3">
              <div className="flex items-center gap-2 mb-2">
                <Smile className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-medium text-text-secondary">Face Filters</span>
                <button onClick={() => setSheet(null)} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-56 overflow-auto">
                <button onClick={() => updateClip(selectedVideo.id, { faceFilter: undefined } as Partial<TimelineClip>)}
                  className={`px-1.5 py-2 rounded-md text-center border ${!selectedVideo.faceFilter ? 'border-pink-400 bg-pink-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <span className="block text-lg leading-none mb-0.5">🚫</span>
                  <span className="block text-[9px] font-medium text-text-primary">Off</span>
                </button>
                {FACE_FILTERS.map((flt) => {
                  const active = selectedVideo.faceFilter === flt.id;
                  return (
                    <button key={flt.id} onClick={() => updateClip(selectedVideo.id, { faceFilter: flt.id } as Partial<TimelineClip>)}
                      className={`px-1.5 py-2 rounded-md text-center border ${active ? 'border-pink-400 bg-pink-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <span className="block text-lg leading-none mb-0.5">{flt.icon}</span>
                      <span className="block text-[9px] font-medium text-text-primary truncate">{flt.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-text-muted mt-2">Filters track your face and follow it as you move — they render into the exported video too. Works best when your face is clearly visible.</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <MultiTrackTimeline />
    </div>
  );
}

const DEFAULT_CHROMA = { keyColor: '#00FF00', similarity: 0.4, smoothness: 0.1, spill: 0.12 };
const DEFAULT_BG = { feather: 0.15 };

function BackgroundSheet({ clip, onChange, onClose }: {
  clip: MediaClip;
  onChange: (patch: Partial<MediaClip>) => void;
  onClose: () => void;
}) {
  const mode: 'off' | 'ai' | 'green' = clip.bgRemove ? 'ai' : clip.chroma ? 'green' : 'off';
  const chroma = clip.chroma || DEFAULT_CHROMA;
  const bg = clip.bgRemove || DEFAULT_BG;
  const setChroma = (patch: Partial<typeof DEFAULT_CHROMA>) => onChange({ chroma: { ...chroma, ...patch }, bgRemove: undefined });
  const setBg = (patch: Partial<typeof DEFAULT_BG>) => onChange({ bgRemove: { ...bg, ...patch }, chroma: undefined });

  const CHROMA_SLIDERS: Array<['similarity' | 'smoothness' | 'spill', string, string]> = [
    ['similarity', 'Amount', 'How much of the colour to remove'],
    ['smoothness', 'Softness', 'Feather the cut-out edges'],
    ['spill', 'Spill', 'Remove colour glow on the subject'],
  ];
  const PRESETS: Array<[string, string]> = [['#00FF00', 'Green'], ['#0047FF', 'Blue'], ['#FF00FF', 'Magenta']];
  const modeBtn = (m: 'off' | 'ai' | 'green', label: string) => (
    <button onClick={() => onChange(m === 'off' ? { chroma: undefined, bgRemove: undefined } : m === 'ai' ? { bgRemove: DEFAULT_BG, chroma: undefined } : { chroma: DEFAULT_CHROMA, bgRemove: undefined })}
      className={`flex-1 px-2 py-2 rounded-md text-[11px] font-medium border ${mode === m ? 'border-green-400 bg-green-500/20 text-green-200' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
      {label}
    </button>
  );

  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium text-text-secondary">Background</span>
        <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex gap-1.5">
        {modeBtn('off', 'Off')}
        {modeBtn('ai', 'AI Remove')}
        {modeBtn('green', 'Green Screen')}
      </div>

      {mode === 'ai' && (
        <>
          <p className="text-[10px] text-text-muted">Removes the background automatically — no green screen needed. Put another clip on a lower track to show behind you.</p>
          <div>
            <div className="flex justify-between text-[10px] text-text-muted mb-0.5">
              <span>Edge softness</span><span>{Math.round(bg.feather * 100)}%</span>
            </div>
            <input type="range" min={0} max={0.6} step={0.01} value={bg.feather}
              onChange={(e) => setBg({ feather: parseFloat(e.target.value) })} className="w-full accent-green-400" />
          </div>
        </>
      )}

      {mode === 'green' && (
        <>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Key colour</p>
            <div className="flex items-center gap-1.5">
              {PRESETS.map(([hex, name]) => (
                <button key={hex} onClick={() => setChroma({ keyColor: hex })}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] border ${chroma.keyColor.toLowerCase() === hex.toLowerCase() ? 'border-green-400 bg-green-500/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                  <span className="w-3 h-3 rounded-sm border border-white/20" style={{ background: hex }} />{name}
                </button>
              ))}
              <label className="ml-auto flex items-center gap-1 text-[10px] text-text-muted cursor-pointer">
                Pick
                <input type="color" value={chroma.keyColor} onChange={(e) => setChroma({ keyColor: e.target.value })}
                  className="w-7 h-7 rounded bg-transparent border border-white/10 cursor-pointer" />
              </label>
            </div>
          </div>
          {CHROMA_SLIDERS.map(([key, label, hint]) => (
            <div key={key}>
              <div className="flex justify-between text-[10px] text-text-muted mb-0.5">
                <span>{label}</span><span>{Math.round((chroma[key] as number) * 100)}%</span>
              </div>
              <input type="range" min={0} max={key === 'similarity' ? 0.9 : 0.5} step={0.01} value={chroma[key] as number}
                onChange={(e) => setChroma({ [key]: parseFloat(e.target.value) } as Partial<typeof DEFAULT_CHROMA>)}
                className="w-full accent-green-400" />
              <p className="text-[9px] text-text-muted">{hint}</p>
            </div>
          ))}
          <p className="text-[10px] text-text-muted">Shoot against an evenly-lit solid backdrop for the cleanest cut.</p>
        </>
      )}
    </div>
  );
}

function FiltersSheet({ clip, onChange, onSpeed, onClose }: {
  clip: MediaClip;
  onChange: (patch: Partial<MediaClip>) => void;
  onSpeed: (speed: number) => void;
  onClose: () => void;
}) {
  const adjust = clip.adjust || {};
  const effects = clip.effects || [];
  const setAdjust = (k: 'brightness' | 'contrast' | 'saturation' | 'warmth', v: number) =>
    onChange({ adjust: { ...adjust, [k]: v } });
  const toggleEffect = (id: string) =>
    onChange({ effects: effects.includes(id) ? effects.filter((e) => e !== id) : [...effects, id] });

  const ADJ: Array<['brightness' | 'contrast' | 'saturation' | 'warmth', string]> = [
    ['brightness', 'Brightness'], ['contrast', 'Contrast'], ['saturation', 'Saturation'], ['warmth', 'Warmth'],
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-fuchsia-400" />
        <span className="text-sm font-medium text-text-secondary">Filters &amp; Effects</span>
        <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>

      {/* Filter presets */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Filter</p>
        <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-auto">
          {FILTER_PRESETS.map((p) => {
            const active = (clip.filter || 'none') === p.id;
            return (
              <button key={p.id}
                onClick={() => onChange({ filter: p.id, filterIntensity: clip.filterIntensity ?? 1 })}
                className={`px-1.5 py-1.5 rounded-md text-[10px] border ${active ? 'border-fuchsia-400 bg-fuchsia-500/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                {p.name}
              </button>
            );
          })}
        </div>
        {clip.filter && clip.filter !== 'none' && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-text-muted mb-0.5">
              <span>Intensity</span><span>{Math.round((clip.filterIntensity ?? 1) * 100)}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.01} value={clip.filterIntensity ?? 1}
              onChange={(e) => onChange({ filterIntensity: parseFloat(e.target.value) })}
              className="w-full accent-fuchsia-400" />
          </div>
        )}
      </div>

      {/* Effects */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Effects</p>
        <div className="grid grid-cols-4 gap-1.5">
          {EFFECTS.map((e) => {
            const active = effects.includes(e.id);
            return (
              <button key={e.id} onClick={() => toggleEffect(e.id)}
                className={`px-1.5 py-1.5 rounded-md text-left border ${active ? 'border-fuchsia-400 bg-fuchsia-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <span className="block text-[10px] font-medium text-text-primary truncate">{e.name}</span>
                <span className="block text-[9px] text-text-muted">{e.vibe}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Speed */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Speed</p>
        <div className="grid grid-cols-6 gap-1.5">
          {[0.5, 1, 1.5, 2, 3, 4].map((sp) => {
            const active = (clip.speed || 1) === sp;
            return (
              <button key={sp} onClick={() => onSpeed(sp)}
                className={`px-1.5 py-1.5 rounded-md text-[10px] border ${active ? 'border-fuchsia-400 bg-fuchsia-500/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                {sp}×
              </button>
            );
          })}
        </div>
      </div>

      {/* Motion (Ken Burns) */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Motion</p>
        <div className="grid grid-cols-4 gap-1.5">
          {MOTIONS.map((mo) => {
            const active = (clip.motion || 'none') === mo.id;
            return (
              <button key={mo.id} onClick={() => onChange({ motion: mo.id === 'none' ? undefined : mo.id })}
                className={`px-1.5 py-1.5 rounded-md text-[10px] border ${active ? 'border-fuchsia-400 bg-fuchsia-500/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                {mo.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transition in */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Transition in</p>
        <div className="grid grid-cols-4 gap-1.5">
          {TRANSITIONS.map((tr) => {
            const active = (clip.transitionIn?.type || 'none') === tr.id;
            return (
              <button key={tr.id}
                onClick={() => onChange({ transitionIn: tr.id === 'none' ? undefined : { type: tr.id, durationSec: clip.transitionIn?.durationSec || 0.5 } })}
                className={`px-1.5 py-1.5 rounded-md text-[10px] border ${active ? 'border-fuchsia-400 bg-fuchsia-500/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                {tr.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Adjust */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-text-muted uppercase tracking-wider">Adjust</p>
        {ADJ.map(([k, label]) => (
          <div key={k}>
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>{label}</span><span>{Math.round((adjust[k] || 0) * 100)}</span>
            </div>
            <input type="range" min={-1} max={1} step={0.01} value={adjust[k] || 0}
              onChange={(e) => setAdjust(k, parseFloat(e.target.value))}
              className="w-full accent-fuchsia-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

const TEXT_ANIMATIONS: Array<[string, string]> = [
  ['none', 'None'], ['fade', 'Fade'], ['slide', 'Slide up'], ['scale', 'Pop in'],
  ['bounce', 'Bounce'], ['typewriter', 'Typewriter'], ['word-pop', 'Word pop'], ['karaoke', 'Karaoke'],
];

function KeyframeSheet({ clip, playhead, onChange, onClose }: {
  clip: MediaClip;
  playhead: number;
  onChange: (patch: Partial<MediaClip>) => void;
  onClose: () => void;
}) {
  const progress = Math.max(0, Math.min(1, (playhead - clip.start) / Math.max(0.001, clip.duration)));
  const [scale, setScale] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0);
  const kfs = [...(clip.keyframes || [])].sort((a, b) => a.t - b.t);

  const addKeyframe = () => {
    const next = kfs.filter((k) => Math.abs(k.t - progress) > 0.005);
    next.push({ t: +progress.toFixed(3), scale, x, y, opacity, rotation });
    next.sort((a, b) => a.t - b.t);
    onChange({ keyframes: next });
  };
  const removeKeyframe = (t: number) => onChange({ keyframes: kfs.filter((k) => k.t !== t) });

  const Slider = ({ label, val, set, min, max, step }: { label: string; val: number; set: (n: number) => void; min: number; max: number; step: number }) => (
    <label className="flex items-center gap-2 text-[11px] text-text-muted">
      <span className="w-14">{label}</span>
      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(parseFloat(e.target.value))} className="flex-1 accent-indigo-400" />
      <span className="w-9 text-right font-mono">{val}</span>
    </label>
  );

  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-text-secondary">Keyframes</span>
        <span className="text-[10px] text-text-muted">· playhead at {Math.round(progress * 100)}% of clip</span>
        <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>
      <Slider label="Scale" val={scale} set={setScale} min={0.3} max={3} step={0.01} />
      <Slider label="X %" val={x} set={setX} min={-60} max={60} step={1} />
      <Slider label="Y %" val={y} set={setY} min={-60} max={60} step={1} />
      <Slider label="Opacity" val={opacity} set={setOpacity} min={0} max={1} step={0.01} />
      <Slider label="Rotate°" val={rotation} set={setRotation} min={-180} max={180} step={1} />
      <button onClick={addKeyframe}
        className="w-full px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-200 text-sm font-medium hover:bg-indigo-500/30">
        + Add keyframe at playhead ({Math.round(progress * 100)}%)
      </button>
      {kfs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {kfs.map((k) => (
            <span key={k.t} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-text-secondary">
              {Math.round(k.t * 100)}%
              <button onClick={() => removeKeyframe(k.t)} className="text-text-muted hover:text-red-400"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-text-muted">Move the playhead, set values, add a keyframe. Two+ keyframes animate between them.</p>
    </div>
  );
}

const VOICES: Array<[string, string]> = [
  ['af_heart', 'Heart (US ♀)'], ['af_bella', 'Bella (US ♀)'], ['am_michael', 'Michael (US ♂)'],
  ['am_fenrir', 'Fenrir (US ♂)'], ['bf_emma', 'Emma (UK ♀)'], ['bm_george', 'George (UK ♂)'],
];

function VoiceoverSheet({ onGenerate, onClose }: {
  onGenerate: (text: string, voice: string) => Promise<void>;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('af_heart');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const go = async () => {
    if (!text.trim()) return;
    setBusy(true); setErr(null);
    try { await onGenerate(text.trim(), voice); }
    catch (e: any) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Mic className="w-4 h-4 text-rose-400" />
        <span className="text-sm font-medium text-text-secondary">AI Voiceover</span>
        <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
        placeholder="Type what the narrator should say…"
        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-primary text-sm text-text-primary focus:outline-none focus:border-accent-primary resize-none" />
      <div className="flex items-center gap-2">
        <select value={voice} onChange={(e) => setVoice(e.target.value)}
          className="text-xs px-2 py-1.5 rounded-md bg-bg-primary border border-border-primary text-text-secondary">
          {VOICES.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <button onClick={go} disabled={busy || !text.trim()}
          className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 text-sm font-medium hover:bg-rose-500/30 disabled:opacity-40">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
          {busy ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {err && <p className="text-xs text-red-400 bg-red-500/10 px-2 py-1.5 rounded-lg">{err}</p>}
    </div>
  );
}

function TextEditSheet({ clip, onChange, onClose }: {
  clip: TextClip;
  onChange: (patch: Partial<TextClip>) => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-text-secondary">Edit text</span>
        <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
      </div>
      <input value={clip.text} onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Your text…"
        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-primary text-sm text-text-primary focus:outline-none focus:border-accent-primary" />

      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Animation</p>
        <div className="grid grid-cols-4 gap-1.5">
          {TEXT_ANIMATIONS.map(([id, label]) => {
            const active = (clip.animation || 'none') === id;
            return (
              <button key={id} onClick={() => onChange({ animation: id as TextClip['animation'] })}
                className={`px-1.5 py-1.5 rounded-md text-[10px] border ${active ? 'border-amber-400 bg-amber-500/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-[11px] text-text-muted">
          Color
          <input type="color" value={clip.color} onChange={(e) => onChange({ color: e.target.value })}
            className="w-6 h-6 rounded bg-transparent border border-white/10" />
        </label>
        <label className="flex-1 flex items-center gap-2 text-[11px] text-text-muted">
          Size
          <input type="range" min={24} max={140} step={1} value={clip.fontSize}
            onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })} className="flex-1 accent-amber-400" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 text-[11px] text-text-muted">X
          <input type="range" min={0} max={100} value={clip.x} onChange={(e) => onChange({ x: parseInt(e.target.value) })} className="flex-1 accent-amber-400" />
        </label>
        <label className="flex items-center gap-2 text-[11px] text-text-muted">Y
          <input type="range" min={0} max={100} value={clip.y} onChange={(e) => onChange({ y: parseInt(e.target.value) })} className="flex-1 accent-amber-400" />
        </label>
      </div>
    </div>
  );
}

function MusicSheet({ kind, onPick, onClose }: { kind: 'music' | 'sfx'; onPick: (t: MusicTrack) => void; onClose: () => void }) {
  const lib = useAudioLibrary();
  const items = kind === 'sfx' ? lib.sfx : lib.music;
  const loading = lib.loading;
  const [genre, setGenre] = useState('all');
  const genres = Array.from(new Set(items.map((m) => m.category).filter(Boolean))).sort();
  const shown = genre === 'all' ? items : items.filter((m) => m.category === genre);

  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-text-secondary">{kind === 'sfx' ? 'Sound effects' : 'Music library'}</span>
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
