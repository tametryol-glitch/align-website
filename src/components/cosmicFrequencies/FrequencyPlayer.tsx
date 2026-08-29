'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Headphones, Loader2, Pause, Play } from 'lucide-react';
import {
  BEDS,
  BED_VOLUME,
  DEFAULT_BED,
  DEFAULT_MINUTES,
  DEFAULT_TEMPO,
  SESSION_MINUTES,
  TEMPO_GAP_MS,
  TEMPO_ORDER,
  formatClock,
  getBedUrl,
  getClipUrl,
  getPreferredVoice,
  setPreferredVoice,
  VOICES,
  bedsForVoice,
  isBedAllowed,
  secondsToNextBar,
  type SessionMinutes,
  type Tempo,
} from '@/lib/cosmicFrequencies/audio';
import type { CosmicFrequency } from '@/data/cosmicFrequencies';

interface Props {
  frequency: CosmicFrequency;
}

/**
 * Listening session: the recitation on a loop for a set length of time.
 *
 * The clip holds ONE recitation, so the loop is driven here — play, wait the
 * tempo gap, play again — rather than by the audio element's own `loop`,
 * which would give no control over pacing.
 *
 * Never autoplays. Playback starts on an explicit press, and the timer ends
 * the session rather than running indefinitely.
 */
export function FrequencyPlayer({ frequency }: Props) {
  const { t } = useTranslation();

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [tempo, setTempo] = useState<Tempo>(DEFAULT_TEMPO);
  const [minutes, setMinutes] = useState<SessionMinutes>(DEFAULT_MINUTES);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [bedId, setBedId] = useState<string | null>(DEFAULT_BED);
  // Read from storage after mount: touching localStorage during render would
  // mismatch the server-rendered markup.
  const [voiceId, setVoiceId] = useState<string>(VOICES[0].id);
  useEffect(() => setVoiceId(getPreferredVoice()), []);

  const availableBeds = bedsForVoice(voiceId);

  // Switching voice can invalidate the chosen bed (Still Waters is Heart
  // only). Fall back to silence rather than silently starting a pairing the
  // rules forbid.
  useEffect(() => {
    if (!isBedAllowed(bedId, voiceId)) setBedId(null);
  }, [voiceId, bedId]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bedRef = useRef<HTMLAudioElement | null>(null);
  const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  // Read inside the 'ended' handler, so changing tempo mid-session takes
  // effect on the next loop without re-binding the listener.
  const tempoRef = useRef<Tempo>(tempo);
  tempoRef.current = tempo;
  // Tempo of the bed currently playing, or null when the bed is a plain wash
  // (or silence). Set at start, cleared on stop.
  const syncBpmRef = useRef<number | null>(null);

  const url = getClipUrl(frequency.id, voiceId);

  const stop = useCallback(() => {
    if (gapTimer.current) { clearTimeout(gapTimer.current); gapTimer.current = null; }
    if (tick.current) { clearInterval(tick.current); tick.current = null; }
    const a = audioRef.current;
    if (a) { a.pause(); a.currentTime = 0; }
    const b = bedRef.current;
    if (b) { b.pause(); b.currentTime = 0; }
    syncBpmRef.current = null;
    setPlaying(false);
    setRemaining(null);
  }, []);

  // Stop when the frequency changes or the component goes away — otherwise
  // audio keeps running behind a closed overlay.
  useEffect(() => stop, [stop, frequency.id]);

  const start = useCallback(async () => {
    if (!url) return;
    setError(false);
    setLoading(true);

    let a = audioRef.current;
    if (a && a.src !== url) {
      // Voice changed since this element was made — rebuild it, or the old
      // voice keeps playing.
      a.pause();
      a = null;
      audioRef.current = null;
    }
    if (!a) {
      a = new Audio(url);
      a.preload = 'auto';
      audioRef.current = a;
      a.addEventListener('ended', () => {
        // With a beat-aligned bed, the next recitation starts on the bed's
        // next bar line rather than after a fixed gap, so the phrase always
        // begins on a downbeat. Reading the bed's real position each time is
        // self-correcting: a tempo-estimate error is absorbed every bar
        // instead of accumulating across the session.
        const bed = bedRef.current;
        const bpm = syncBpmRef.current;
        const waitMs =
          bpm && bed && !bed.paused
            ? secondsToNextBar(bed.currentTime, bpm) * 1000
            : TEMPO_GAP_MS[tempoRef.current];

        gapTimer.current = setTimeout(() => {
          const el = audioRef.current;
          if (!el) return;
          el.currentTime = 0;
          el.play().catch(() => setError(true));
        }, waitMs);
      });
      a.addEventListener('error', () => { setError(true); setLoading(false); });
    }

    try {
      await a.play();
    } catch {
      setError(true);
      setLoading(false);
      return;
    }

    // The bed loops natively — it is continuous, so it needs no gap logic.
    // A bed that fails to load must not take the session down with it.
    const bed = BEDS.find((x) => x.id === bedId);
    const bedUrl = bed ? getBedUrl(bed.file) : null;
    if (bedUrl) {
      let b = bedRef.current;
      if (!b || b.src !== bedUrl) {
        b?.pause();
        b = new Audio(bedUrl);
        b.loop = true;
        bedRef.current = b;
      }
      b.volume = BED_VOLUME;
      b.play().catch(() => { /* voice continues without it */ });
      syncBpmRef.current = bed?.bpm ?? null;
    }

    setLoading(false);
    setPlaying(true);

    const total = minutes * 60;
    setRemaining(total);
    tick.current = setInterval(() => {
      setRemaining((r) => {
        if (r === null) return null;
        if (r <= 1) { stop(); return null; }
        return r - 1;
      });
    }, 1000);
  }, [url, minutes, bedId, stop]);

  if (!url) return null;

  return (
    <section className="mb-5 p-4 rounded-xl border border-border-primary bg-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Headphones className="w-4 h-4 text-accent-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t('cosmicFrequencies.listen', 'Listening session')}
        </h3>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={playing ? stop : start}
          disabled={loading}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, rgb(139,92,246), rgb(236,72,153))' }}
          aria-label={playing ? t('common.pause', 'Pause') : t('common.play', 'Play')}
        >
          {loading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : playing
              ? <Pause className="w-5 h-5" />
              : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <div className="min-w-0">
          {playing && remaining !== null ? (
            <p className="text-lg font-mono text-text-primary">{formatClock(remaining)}</p>
          ) : (
            <p className="text-sm text-text-secondary">
              {t(
                'cosmicFrequencies.listenHint',
                'Earbuds in. The sequence repeats, one digit at a time.',
              )}
            </p>
          )}
          {error && (
            <p className="text-xs text-amber-400 mt-0.5">
              {t('cosmicFrequencies.listenError', 'Audio could not load. Try again.')}
            </p>
          )}
        </div>
      </div>

      {/* Voice — remembered across sessions */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-[11px] text-text-muted w-12">
          {t('cosmicFrequencies.voiceLabel', 'Voice')}
        </span>
        {VOICES.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setVoiceId(v.id);
              setPreferredVoice(v.id);
            }}
            disabled={playing}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors disabled:opacity-40 ${
              voiceId === v.id
                ? 'bg-accent-primary text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            {t(`cosmicFrequencies.voices.${v.id}`, v.label)}
          </button>
        ))}
      </div>

      {/* Sound — silence first, because forcing music loses people */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-[11px] text-text-muted w-12">
          {t('cosmicFrequencies.soundLabel', 'Sound')}
        </span>
        <button
          onClick={() => setBedId(null)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
            bedId === null
              ? 'bg-accent-primary text-white'
              : 'bg-white/5 text-text-muted hover:bg-white/10'
          }`}
        >
          {t('cosmicFrequencies.beds.none', 'None')}
        </button>
        {availableBeds.map((b) => (
          <button
            key={b.id}
            onClick={() => setBedId(b.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              bedId === b.id
                ? 'bg-accent-primary text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            {t(`cosmicFrequencies.beds.${b.id}`, b.label)}
          </button>
        ))}
      </div>

      {/* Tempo */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-text-muted w-12">
          {t('cosmicFrequencies.tempoLabel', 'Pace')}
        </span>
        {TEMPO_ORDER.map((tp) => (
          <button
            key={tp}
            onClick={() => setTempo(tp)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              tempo === tp
                ? 'bg-accent-primary text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            {t(`cosmicFrequencies.tempo.${tp}`, tp)}
          </button>
        ))}
      </div>

      {/* Length — locked during a session so the countdown cannot jump */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-text-muted w-12">
          {t('cosmicFrequencies.lengthLabel', 'Length')}
        </span>
        {SESSION_MINUTES.map((m) => (
          <button
            key={m}
            onClick={() => setMinutes(m)}
            disabled={playing}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors disabled:opacity-40 ${
              minutes === m
                ? 'bg-accent-primary text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            {m}m
          </button>
        ))}
      </div>
    </section>
  );
}
