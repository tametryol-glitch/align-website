'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { bcp47For, kokoroFor } from './kokoroVoices';

/**
 * Speaks a streaming assistant reply sentence-by-sentence.
 *
 * The point is time-to-first-audio. Waiting for a whole reply before
 * synthesising means several seconds of silence on a CPU-bound Kokoro sidecar;
 * speaking the first sentence as soon as it lands puts audio in the user's ear
 * in well under a second, and later sentences are synthesised while earlier
 * ones play.
 *
 * Two engines:
 *  - Kokoro (`/api/tts`) for the 8 locales it covers — good quality, free.
 *  - The browser's own `speechSynthesis` for the other 12, and as the fallback
 *    whenever a Kokoro call fails for any reason. Robotic, but it always works.
 */

/** Sentence terminators, including CJK full-width punctuation. */
const SENTENCE_RE = /[^.!?…。！？\n]*[.!?…。！？\n]+["')\]]*\s*/;
/**
 * Don't send a fragment to TTS unless it has real content — "..." or " ! "
 * would just cost a round-trip and produce a click.
 *
 * Avoids Unicode property escapes (`\p{L}`), which need an ES6+ tsconfig
 * target; stripping punctuation and whitespace works on every target and keeps
 * CJK, which has no spaces, intact.
 */
const PUNCT_ONLY = /[\s.!?…。！？"')\]\[(,;:—–-]/g;

function isSpeakable(text: string): boolean {
  return text.replace(PUNCT_ONLY, '').length >= 2;
}

interface Prepared {
  kind: 'audio' | 'browser';
  url?: string;
  text: string;
}

export function useStreamingSpeech(locale: string) {
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const bufferRef = useRef('');
  const queueRef = useRef<{ text: string; prepared: Promise<Prepared | null> }[]>([]);
  const pumpingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** Bumped on cancel so in-flight work from a previous turn is discarded. */
  const genRef = useRef(0);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  /** Synthesise one sentence. Never throws — falls back to OS voices. */
  const prepare = useCallback(
    async (text: string, gen: number): Promise<Prepared | null> => {
      const kokoro = kokoroFor(locale);
      if (!kokoro) return { kind: 'browser', text };

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: kokoro.voice,
            lang: kokoro.lang,
            format: 'mp3',
          }),
        });
        if (!res.ok) return { kind: 'browser', text };
        const blob = await res.blob();
        if (gen !== genRef.current) return null; // cancelled while in flight
        return { kind: 'audio', url: URL.createObjectURL(blob), text };
      } catch {
        return { kind: 'browser', text };
      }
    },
    [locale],
  );

  const playPrepared = useCallback(
    (item: Prepared, gen: number) =>
      new Promise<void>((resolve) => {
        if (gen !== genRef.current) return resolve();

        if (item.kind === 'audio' && item.url) {
          const audio = new Audio(item.url);
          audioRef.current = audio;
          const done = () => {
            URL.revokeObjectURL(item.url!);
            audioRef.current = null;
            resolve();
          };
          audio.onended = done;
          audio.onerror = done;
          audio.play().catch(done); // autoplay blocked → don't hang the queue
          return;
        }

        if (typeof window === 'undefined' || !window.speechSynthesis) return resolve();
        const utter = new SpeechSynthesisUtterance(item.text);
        utter.lang = bcp47For(locale);
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        window.speechSynthesis.speak(utter);
      }),
    [locale],
  );

  const pump = useCallback(async () => {
    if (pumpingRef.current) return;
    pumpingRef.current = true;
    setSpeaking(true);

    while (queueRef.current.length) {
      const gen = genRef.current;
      const next = queueRef.current.shift()!;
      const prepared = await next.prepared;
      if (!prepared || gen !== genRef.current) break;
      await playPrepared(prepared, gen);
    }

    pumpingRef.current = false;
    setSpeaking(false);
  }, [playPrepared]);

  /**
   * Queue one sentence. Synthesis starts immediately rather than at playback
   * time, so it overlaps with whatever is currently speaking. Sentences arrive
   * at LLM streaming pace, which keeps concurrency naturally low.
   */
  const enqueue = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || !isSpeakable(clean)) return;
      const gen = genRef.current;
      queueRef.current.push({ text: clean, prepared: prepare(clean, gen) });
      void pump();
    },
    [prepare, pump],
  );

  /** Feed streaming deltas; complete sentences are spoken as they close. */
  const feed = useCallback(
    (delta: string) => {
      if (!enabledRef.current) return;
      bufferRef.current += delta;
      while (true) {
        const match = SENTENCE_RE.exec(bufferRef.current);
        if (!match || match.index !== 0) break;
        const sentence = match[0];
        bufferRef.current = bufferRef.current.slice(sentence.length);
        enqueue(sentence);
      }
    },
    [enqueue],
  );

  /** Speak whatever is left when the stream ends without final punctuation. */
  const flush = useCallback(() => {
    if (!enabledRef.current) return;
    const rest = bufferRef.current;
    bufferRef.current = '';
    if (rest.trim()) enqueue(rest);
  }, [enqueue]);

  /** Stop immediately and discard everything queued or in flight. */
  const cancel = useCallback(() => {
    genRef.current += 1;
    bufferRef.current = '';
    queueRef.current = [];
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    pumpingRef.current = false;
    setSpeaking(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  return {
    enabled,
    setEnabled,
    speaking,
    feed,
    flush,
    cancel,
    /** True when this locale gets the good voice rather than the OS one. */
    usingKokoro: !!kokoroFor(locale),
  };
}
