'use client';

/**
 * useVideoRecorder — in-browser camera capture via getUserMedia + MediaRecorder.
 *
 * Shared by the reel composer and the cosmic feed composer so both record the
 * same way. Hands the finished clip back as a File, ready to upload.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Pick a container the browser can actually record. MP4 first — Safari and iOS
 * can't reliably play WebM, so a WebM clip would be unwatchable for a large
 * share of viewers.
 */
export function pickRecorderMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? null;
}

export interface UseVideoRecorderOptions {
  /** Hard cap on recording length; the recorder stops itself at the limit. */
  maxSeconds?: number;
  /** Called once with the finished clip. */
  onClip: (file: File) => void;
}

export function useVideoRecorder({ maxSeconds = 60, onClip }: UseVideoRecorderOptions) {
  const [canRecord, setCanRecord] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  // Keep the latest callback without restarting the recorder.
  const onClipRef = useRef(onClip);
  useEffect(() => { onClipRef.current = onClip; }, [onClip]);

  useEffect(() => {
    setCanRecord(
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      pickRecorderMime() !== null,
    );
  }, []);

  // Never leave the camera light on if the user navigates away mid-recording.
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  const start = useCallback(async () => {
    setError(null);
    const mime = pickRecorderMime();
    if (!mime) {
      setError('Recording is not supported in this browser. Upload a video instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        await liveVideoRef.current.play().catch(() => {});
      }

      chunksRef.current = [];
      const rec = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setRecording(false);
        const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunksRef.current, { type: mime.split(';')[0] });
        if (blob.size === 0) {
          setError('Nothing was recorded. Try again.');
          return;
        }
        onClipRef.current(new File([blob], `clip-${Date.now()}.${ext}`, { type: blob.type }));
      };

      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsed(0);
    } catch {
      setError('Could not access your camera. Check your browser permissions and try again.');
    }
  }, []);

  // Timer, which also enforces the cap.
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      setElapsed((s) => {
        if (s + 1 >= maxSeconds) { stop(); return maxSeconds; }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [recording, maxSeconds, stop]);

  return { canRecord, recording, elapsed, error, setError, liveVideoRef, start, stop, maxSeconds };
}
