'use client';

/**
 * CaptionsTool — auto-generate timed captions from the video's speech (Whisper)
 * and drop them on the timeline styled with a kinetic preset.
 */

import { useState } from 'react';
import { CAPTION_STYLES, generateCaptions, clearAutoCaptions } from '@/lib/autoCaptions';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { Sparkles, Loader2, Trash2 } from 'lucide-react';

export function CaptionsTool() {
  const [styleId, setStyleId] = useState('karaoke');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const captionCount = useVideoEditorStore((s) => s.textOverlays.filter((o) => o.id.startsWith('cap_')).length);

  const run = async () => {
    setBusy(true); setError(null); setResult(null);
    try {
      const entry = CAPTION_STYLES.find((s) => s.id === styleId) ?? CAPTION_STYLES[0];
      const n = await generateCaptions(entry.style, { replace: true, onStage: setStage });
      setResult(n);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Caption generation failed.');
    } finally {
      setBusy(false);
      setStage('');
    }
  };

  const clear = () => {
    const removed = clearAutoCaptions();
    setResult(null);
    if (removed) setError(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Transcribes the speech in your video and lays captions on the timeline,
        timed to each word. Edit or restyle any of them afterward in Text.
      </p>

      {/* Style picker */}
      <div>
        <p className="text-xs text-text-muted mb-1.5">Caption style</p>
        <div className="grid grid-cols-3 gap-1.5">
          {CAPTION_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyleId(s.id)}
              disabled={busy}
              className={`px-2 py-2 rounded-md text-xs border transition-colors ${
                styleId === s.id
                  ? 'border-accent-primary bg-accent-primary/10 text-text-primary'
                  : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={run}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-60"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {busy ? (stage || 'Working…') : captionCount > 0 ? 'Regenerate captions' : 'Auto-generate captions'}
      </button>

      {result !== null && !busy && (
        <p className="text-xs text-emerald-300">Added {result} caption{result === 1 ? '' : 's'} to the timeline.</p>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {captionCount > 0 && !busy && (
        <button
          onClick={clear}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear {captionCount} caption{captionCount === 1 ? '' : 's'}
        </button>
      )}

      <p className="text-[10px] text-text-muted border-t border-white/10 pt-2">
        Uses OpenAI Whisper. Works best on clear speech in a supported language.
      </p>
    </div>
  );
}
