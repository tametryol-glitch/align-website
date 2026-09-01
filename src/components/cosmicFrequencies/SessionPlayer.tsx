'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Headphones, Loader2, Pause, Play } from 'lucide-react';
import { formatClock, getSessionUrl } from '@/lib/cosmicFrequencies/audio';
import type { EntrainmentSession } from '@/data/cosmicFrequencies';

interface Props {
  session: EntrainmentSession;
}

/**
 * Long-form entrainment session: one continuous file, played once.
 *
 * Unlike FrequencyPlayer there is no loop, no pace and no length picker — the
 * file IS the session, and its descent curve only makes sense played end to
 * end. Cutting it short at 10 minutes would stop it before the plateau, which
 * is the part that does the work.
 *
 * The clock comes off the element's own `timeupdate` rather than a interval,
 * so it cannot drift away from the audio, and the session ends on `ended`
 * rather than when a timer says so.
 *
 * Never autoplays, and tears down on unmount so nothing keeps playing after
 * navigation.
 */
export function SessionPlayer({ session }: Props) {
  const { t } = useTranslation();

  const [variantId, setVariantId] = useState(session.variants[0].id);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const variant =
    session.variants.find((v) => v.id === variantId) ?? session.variants[0];

  const stop = useCallback(() => {
    const a = audioRef.current;
    audioRef.current = null;
    if (a) {
      a.pause();
      a.src = '';
    }
    setPlaying(false);
    setRemaining(null);
  }, []);

  // Tear down on unmount, and when the chosen ending changes.
  useEffect(() => {
    return () => { stop(); };
  }, [stop, variant.file]);

  const start = useCallback(async () => {
    setError(false);
    setLoading(true);

    const url = getSessionUrl(variant.file);
    if (!url) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const a = new Audio(url);
      a.preload = 'auto';
      a.addEventListener('timeupdate', () => {
        if (!Number.isFinite(a.duration)) return;
        setRemaining(Math.max(0, Math.round(a.duration - a.currentTime)));
      });
      a.addEventListener('ended', () => { stop(); });
      a.addEventListener('error', () => {
        setError(true);
        setLoading(false);
        stop();
      });

      audioRef.current = a;
      await a.play();

      setLoading(false);
      setPlaying(true);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [variant.file, stop]);

  return (
    <section className="mb-6 p-4 rounded-xl border border-border-primary bg-white/5">
      <div className="flex items-baseline justify-between mb-1 gap-3">
        <h3 className="text-base font-bold text-text-primary">{session.title}</h3>
        <span className="text-xs text-text-muted flex-shrink-0">
          {session.minutes}m · {session.band}
        </span>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        {session.intent}
      </p>

      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => (playing ? stop() : void start())}
          disabled={loading}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-accent-primary transition-opacity hover:opacity-90 disabled:opacity-50 flex-shrink-0"
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
            <p className="text-xl tracking-wide text-text-primary tabular-nums">
              {formatClock(remaining)}
            </p>
          ) : (
            <p className="text-sm text-text-secondary leading-snug">
              {variant.description}
            </p>
          )}
          {error && (
            <p className="text-xs text-gold-primary mt-0.5">
              {t('cosmicFrequencies.listenError', 'Audio could not load. Try again.')}
            </p>
          )}
        </div>
      </div>

      {/* Ending is locked mid-session: switching would restart the descent. */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-xs text-text-muted w-14">
          {t('cosmicFrequencies.endingLabel', 'Ending')}
        </span>
        {session.variants.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setVariantId(v.id)}
            disabled={playing}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-40 ${
              variantId === v.id
                ? 'bg-accent-primary text-white'
                : 'bg-white/10 text-text-muted hover:bg-white/15'
            }`}
          >
            {t(`cosmicFrequencies.sessionVariant.${v.id}`, v.label)}
          </button>
        ))}
      </div>

      {session.headphones && (
        <p className="flex items-start gap-2 text-xs text-text-muted leading-snug">
          <Headphones className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          {t(
            'cosmicFrequencies.headphonesRequired',
            'Headphones required — the effect is built from the difference between your two ears, and laptop speakers collapse it.',
          )}
        </p>
      )}
    </section>
  );
}
