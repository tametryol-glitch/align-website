'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  disabled?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'error';

const MAX_DURATION = 120; // seconds
const BAR_COUNT = 24;

// ── Helpers ────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getSupportedMimeType(): string {
  const types = ['audio/webm', 'audio/ogg', 'audio/mp4'];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

// ── Component ──────────────────────────────────────────────────────

export function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(new Array(BAR_COUNT).fill(4));
  const [errorMessage, setErrorMessage] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const durationRef = useRef(0);

  // ── Cleanup ──

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    chunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // ── Waveform animation ──

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Sample evenly across the frequency range
    const step = Math.floor(dataArray.length / BAR_COUNT);
    const heights = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      const value = dataArray[i * step] || 0;
      // Normalize to 4-28 pixel range
      const height = Math.max(4, Math.round((value / 255) * 28));
      heights.push(height);
    }
    setBarHeights(heights);

    animFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  // ── Start recording ──

  const startRecording = useCallback(async () => {
    setErrorMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis for waveform
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const finalDuration = durationRef.current;
        cleanup();
        setState('idle');
        setDuration(0);
        durationRef.current = 0;
        setBarHeights(new Array(BAR_COUNT).fill(4));

        if (blob.size > 0 && finalDuration > 0) {
          onRecordingComplete(blob, finalDuration);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100); // Collect data every 100ms

      // Start duration timer
      durationRef.current = 0;
      setDuration(0);
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);

        // Auto-stop at max duration
        if (durationRef.current >= MAX_DURATION) {
          stopRecording();
        }
      }, 1000);

      // Start waveform animation
      updateWaveform();

      setState('recording');
    } catch (err: any) {
      cleanup();
      setState('error');
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access required');
      } else {
        setErrorMessage('Could not start recording');
      }
      // Clear error after 3 seconds
      setTimeout(() => {
        setState('idle');
        setErrorMessage('');
      }, 3000);
    }
  }, [cleanup, onRecordingComplete, updateWaveform]);

  // ── Stop recording (send) ──

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Cancel recording (discard) ──

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Stop the recorder without triggering onstop callback's send logic
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }

    cleanup();
    setState('idle');
    setDuration(0);
    durationRef.current = 0;
    setBarHeights(new Array(BAR_COUNT).fill(4));
  }, [cleanup]);

  // ── Idle state: mic button ──

  if (state === 'idle' || state === 'error') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="p-2 text-text-muted hover:text-accent-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Record voice message"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Error tooltip */}
        {errorMessage && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs whitespace-nowrap">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }

  // ── Recording state: expanded bar ──

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-red-500/10 border border-red-500/20">
      {/* Pulsing red dot */}
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>

      {/* Timer */}
      <span className="text-xs text-red-400 font-mono font-medium tabular-nums min-w-[40px]">
        {formatTime(duration)}
      </span>

      {/* Waveform bars */}
      <div className="flex items-center gap-[2px] h-7">
        {barHeights.map((height, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-red-400/70 transition-[height] duration-75"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>

      {/* Cancel button */}
      <button
        type="button"
        onClick={cancelRecording}
        className="p-1.5 rounded-full text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title="Cancel recording"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Stop / Send button */}
      <button
        type="button"
        onClick={stopRecording}
        className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        title="Stop and send"
      >
        <Square className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
