'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { bcp47For } from './kokoroVoices';

/**
 * Microphone input via the browser's built-in SpeechRecognition.
 *
 * Free and on-device — no server round-trip and no per-minute cost, which is
 * why this is preferred over posting audio to the Whisper sidecar. Chrome,
 * Edge and Safari support it; Firefox does not, so `supported` is false there
 * and the caller should just keep the text box.
 *
 * Recognition is single-utterance: it stops on its own when the speaker pauses,
 * and calls `onFinal` with the transcript. Interim results stream to
 * `transcript` so the user can see themselves being heard.
 */
export function useSpeechInput(locale: string, onFinal: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recogRef = useRef<any>(null);
  // Keep the latest callback without re-creating the recognizer each render.
  const onFinalRef = useRef(onFinal);
  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Ctor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recog = new Ctor();
    recog.continuous = false;
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    recog.lang = bcp47For(locale);

    recog.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += chunk;
        else interim += chunk;
      }
      setTranscript(final || interim);
      if (final.trim()) {
        onFinalRef.current(final.trim());
        setTranscript('');
      }
    };

    recog.onerror = (event: any) => {
      // "aborted" and "no-speech" are normal user behaviour, not failures.
      if (event?.error === 'aborted' || event?.error === 'no-speech') {
        setListening(false);
        return;
      }
      setError(
        event?.error === 'not-allowed'
          ? 'Microphone access denied. Enable it in your browser settings.'
          : `Speech input error: ${event?.error || 'unknown'}`,
      );
      setListening(false);
    };

    recog.onend = () => setListening(false);

    recogRef.current = recog;
    return () => {
      try {
        recog.abort();
      } catch {}
      recogRef.current = null;
    };
  }, [locale]);

  const start = useCallback(() => {
    if (!recogRef.current || listening) return;
    setError(null);
    setTranscript('');
    try {
      recogRef.current.start();
      setListening(true);
    } catch {
      // start() throws if already running — harmless.
    }
  }, [listening]);

  const stop = useCallback(() => {
    if (!recogRef.current) return;
    try {
      recogRef.current.stop();
    } catch {}
    setListening(false);
  }, []);

  return { supported, listening, transcript, error, start, stop };
}
