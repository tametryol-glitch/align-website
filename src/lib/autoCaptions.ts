/**
 * autoCaptions — generate timed captions from the video's speech via Whisper.
 *
 * Flow: extract a small audio clip (ffmpeg-wasm) → POST to /api/transcribe →
 * group the word timestamps into short caption lines → add them to the editor
 * as text overlays styled with a kinetic preset. Auto-caption overlays use a
 * `cap_` id prefix so they can be cleared as a group.
 */

import { useVideoEditorStore, type TextOverlay } from '@/stores/videoEditorStore';
import { extractAudioForTranscription } from './videoExportService';

interface Word { word: string; start: number; end: number }
interface Line { text: string; start: number; end: number }

export interface CaptionStyle {
  animation: TextOverlay['animation'];
  color: string;
  fontFamily: string;
  fontSize: number;
  strokeColor?: string;
  strokeWidth?: number;
  bgColor?: string;
  y?: number;
}

export const CAPTION_STYLES: { id: string; name: string; style: CaptionStyle }[] = [
  { id: 'karaoke', name: 'Karaoke', style: { animation: 'karaoke', color: '#FFFFFF', fontFamily: 'Arial Black', fontSize: 30, strokeColor: '#000000', strokeWidth: 2, y: 80 } },
  { id: 'word-pop', name: 'Word Pop', style: { animation: 'word-pop', color: '#FFFFFF', fontFamily: 'Arial Black', fontSize: 30, strokeColor: '#000000', strokeWidth: 2, y: 80 } },
  { id: 'clean', name: 'Clean', style: { animation: 'fade', color: '#FFFFFF', fontFamily: 'Inter', fontSize: 24, bgColor: '#000000AA', y: 82 } },
];

const MAX_WORDS = 6;
const MAX_DUR = 2.8;

function groupWords(words: Word[]): Line[] {
  const lines: Line[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    lines.push({
      text: cur.map((w) => w.word.trim()).join(' ').replace(/\s+/g, ' ').trim(),
      start: cur[0].start,
      end: cur[cur.length - 1].end,
    });
    cur = [];
  };
  for (const w of words) {
    if (!w || typeof w.start !== 'number') continue;
    cur.push(w);
    const dur = w.end - cur[0].start;
    const endsSentence = /[.!?]$/.test(w.word.trim());
    if (cur.length >= MAX_WORDS || dur >= MAX_DUR || endsSentence) flush();
  }
  flush();
  return lines.filter((l) => l.text.length > 0 && l.end > l.start);
}

/** Remove previously generated auto-captions (overlays with a `cap_` id). */
export function clearAutoCaptions(): number {
  const s = useVideoEditorStore.getState();
  const ids = s.textOverlays.filter((o) => o.id.startsWith('cap_')).map((o) => o.id);
  ids.forEach((id) => s.removeTextOverlay(id));
  if (ids.length) s.pushHistory();
  return ids.length;
}

/**
 * Generate captions and add them to the timeline. Returns the number of lines.
 * `onStage` reports progress ("Extracting audio…", "Transcribing…", …).
 */
export async function generateCaptions(
  style: CaptionStyle,
  opts?: { language?: string; replace?: boolean; onStage?: (s: string) => void },
): Promise<number> {
  const s = useVideoEditorStore.getState();
  const url = s.sourceVideoUrl;
  if (!url) throw new Error('No video loaded.');

  opts?.onStage?.('Extracting audio…');
  const audio = await extractAudioForTranscription(url);

  opts?.onStage?.('Transcribing…');
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(audio)], { type: 'audio/m4a' }), 'audio.m4a');
  if (opts?.language) form.append('language', opts.language);

  const res = await fetch('/api/transcribe', { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Transcription failed (${res.status}).`);
  }
  const { words } = (await res.json()) as { words: Word[] };
  if (!words || words.length === 0) throw new Error('No speech detected in this video.');

  opts?.onStage?.('Placing captions…');
  if (opts?.replace) clearAutoCaptions();

  const dur = s.videoDuration || Infinity;
  const lines = groupWords(words);
  const fresh = useVideoEditorStore.getState();
  lines.forEach((ln, i) => {
    const overlay: TextOverlay = {
      id: `cap_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 5)}`,
      text: ln.text,
      x: 50,
      y: style.y ?? 80,
      fontSize: style.fontSize,
      color: style.color,
      fontFamily: style.fontFamily,
      startTime: Math.max(0, ln.start),
      endTime: Math.min(dur, ln.end + 0.15),
      animation: style.animation,
      bgColor: style.bgColor ?? '',
      strokeColor: style.strokeColor ?? '',
      strokeWidth: style.strokeWidth ?? 0,
      textAlign: 'center',
      rotation: 0,
    };
    fresh.addTextOverlay(overlay);
  });
  fresh.pushHistory();
  return lines.length;
}
