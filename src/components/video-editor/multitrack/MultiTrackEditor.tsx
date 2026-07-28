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
import { FILTER_PRESETS } from '@/lib/videoFilters';
import { EFFECTS, TRANSITIONS, MOTIONS } from '@/lib/editor/effects';
import { createClient } from '@/lib/supabase';
import { requestRender, getRenderStatus } from '@/lib/cosmicVideoService';
import { detectBeats } from '@/lib/editor/beatDetect';
import { LOOKS, type Look } from '@/lib/editor/looks';
import { saveDraft, loadDraft, agoLabel, type EditorDraft } from '@/lib/editor/drafts';
import { Music, Type, X, Plus, Wand2, Download, Loader2, Check, Activity, Zap, Sparkles, Mic } from 'lucide-react';

const MultiTrackPlayer = dynamic(() => import('@/remotion/editor/MultiTrackPlayer'), { ssr: false });

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
  const [sheet, setSheet] = useState<'music' | 'sfx' | 'text' | 'filters' | 'edittext' | 'looks' | 'voiceover' | 'keyframes' | null>(null);

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
    setData(initialTimeline(sourceUrl, Math.max(0.1, sourceDuration)));
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

  // Find (or lazily create) the first track of a kind, returning its id.
  const ensureTrack = (kind: TimelineTrack['kind'], name?: string): string => {
    const existing = useTimelineStore.getState().data.tracks.find((t) => t.kind === kind);
    if (existing) return existing.id;
    addTrack(kind, name);
    // addTrack appended; grab the newest of that kind.
    const after = useTimelineStore.getState().data.tracks.filter((t) => t.kind === kind);
    return after[after.length - 1].id;
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
          <div data-testid="mt-preview" className="rounded-xl overflow-hidden bg-black mx-auto"
            style={{ width: 240, aspectRatio: `${aspect.w} / ${aspect.h}`, maxHeight: 420 }}>
            <MultiTrackPlayer timeline={data} width={aspect.w} height={aspect.h} />
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
          <div className="flex gap-2">
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
            <button onClick={() => setSheet('filters')} disabled={!selectedVideo}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-fuchsia-500/15 text-fuchsia-300 text-sm font-medium hover:bg-fuchsia-500/25 disabled:opacity-30"
              title={selectedVideo ? 'Filters & effects for the selected clip' : 'Select a video clip first'}>
              <Wand2 className="w-4 h-4" /> Filters &amp; FX
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
            <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Export ready.</span>
              <a href={resultUrl} target="_blank" rel="noopener noreferrer" download
                className="ml-auto px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-200 font-medium hover:bg-emerald-500/30">
                Download / Open
              </a>
            </div>
          )}
          <p className="text-xs text-text-muted">
            {data.tracks.length} track{data.tracks.length !== 1 ? 's' : ''} · {data.clips.length} clip{data.clips.length !== 1 ? 's' : ''} · {timelineDuration(data).toFixed(1)}s
          </p>
          {sheet === 'music' && <MusicSheet kind="music" onPick={addMusic} onClose={() => setSheet(null)} />}
          {sheet === 'sfx' && <MusicSheet kind="sfx" onPick={addSfx} onClose={() => setSheet(null)} />}
          {sheet === 'voiceover' && <VoiceoverSheet onGenerate={addVoiceover} onClose={() => setSheet(null)} />}
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
        </div>
      </div>

      {/* Timeline */}
      <MultiTrackTimeline />
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
