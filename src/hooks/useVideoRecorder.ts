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

const CAMERA_KEY = 'align.recorder.cameraId';
const MIC_KEY = 'align.recorder.micId';

/** Camera / microphone choices, for <DevicePicker />. */
export interface DeviceControls {
  cams: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
  cameraId: string;
  micId: string;
  setCameraId: (id: string) => void;
  setMicId: (id: string) => void;
  refreshDevices: (askPermission?: boolean) => Promise<void>;
  /** False until the browser has granted access once (names are hidden before that). */
  labelsKnown: boolean;
}

export interface UseVideoRecorderOptions {
  /** Hard cap on recording length; the recorder stops itself at the limit. */
  maxSeconds?: number;
  /** Called once with the finished clip. */
  onClip: (file: File) => void;
  /** Record picture only (e.g. a song is playing and must not be picked up by the mic). */
  muteMic?: boolean;
}

export function useVideoRecorder({ maxSeconds = 60, onClip, muteMic = false }: UseVideoRecorderOptions) {
  const [canRecord, setCanRecord] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Which camera / microphone to use. '' = the browser's default.
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraIdState] = useState('');
  const [micId, setMicIdState] = useState('');
  const [labelsKnown, setLabelsKnown] = useState(false);

  const setCameraId = useCallback((id: string) => {
    setCameraIdState(id);
    try { localStorage.setItem(CAMERA_KEY, id); } catch { /* storage blocked */ }
  }, []);
  const setMicId = useCallback((id: string) => {
    setMicIdState(id);
    try { localStorage.setItem(MIC_KEY, id); } catch { /* storage blocked */ }
  }, []);

  /**
   * List the cameras and mics. Browsers hide device names until the user has
   * granted access once, so `askPermission` opens (and immediately closes) a
   * stream to unlock them.
   */
  const refreshDevices = useCallback(async (askPermission = false) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    if (askPermission) {
      for (const c of [{ video: true, audio: true }, { video: true }, { audio: true }]) {
        try {
          const s = await navigator.mediaDevices.getUserMedia(c);
          s.getTracks().forEach((t) => t.stop());
          break;
        } catch { /* try the next combination */ }
      }
    }
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setCams(all.filter((d) => d.kind === 'videoinput'));
      setMics(all.filter((d) => d.kind === 'audioinput'));
      setLabelsKnown(all.some((d) => !!d.label));
    } catch { /* leave the lists as they were */ }
  }, []);

  useEffect(() => {
    try {
      setCameraIdState(localStorage.getItem(CAMERA_KEY) || '');
      setMicIdState(localStorage.getItem(MIC_KEY) || '');
    } catch { /* storage blocked */ }
    refreshDevices(false);
    const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
    const onChange = () => { refreshDevices(false); };
    md?.addEventListener?.('devicechange', onChange);
    return () => md?.removeEventListener?.('devicechange', onChange);
  }, [refreshDevices]);

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

  // Attach the live stream once the preview <video> is actually mounted. The
  // element is rendered only while `recording` is true, so attaching inside
  // start() (before setRecording(true)) finds a null ref and leaves the preview
  // black — do it here, after the mount, whenever both are present.
  useEffect(() => {
    const v = liveVideoRef.current;
    const s = streamRef.current;
    if (recording && v && s && v.srcObject !== s) {
      v.srcObject = s;
      v.play().catch(() => {});
    }
  }, [recording]);

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
      // Ask for a 30fps target explicitly. Without a frameRate hint, cameras
      // asked for a high resolution often negotiate a low-fps mode (e.g. 15fps),
      // which makes both the live preview and the recorded clip look choppy.
      // 720×1280 is a mode virtually every camera hits at a smooth 30fps and is
      // plenty for portrait reels.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          // The user's own pick wins; otherwise the front camera.
          ...(cameraId ? { deviceId: { exact: cameraId } } : { facingMode: 'user' }),
          width: { ideal: 720 },
          height: { ideal: 1280 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: muteMic ? false : micId ? { deviceId: { exact: micId } } : true,
      });
      streamRef.current = stream;
      refreshDevices(false); // names are available now that access is granted
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
    } catch (e) {
      const name = (e as { name?: string } | null)?.name;
      if ((cameraId || micId) && (name === 'OverconstrainedError' || name === 'NotFoundError')) {
        // The saved device was unplugged: forget it so the user can choose again.
        setCameraId('');
        setMicId('');
        setError('That camera or microphone is no longer available. Pick one again and retry.');
      } else {
        setError('Could not access your camera. Check your browser permissions and try again.');
      }
    }
  }, [muteMic, cameraId, micId, refreshDevices, setCameraId, setMicId]);

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

  const deviceControls: DeviceControls = { cams, mics, cameraId, micId, setCameraId, setMicId, refreshDevices, labelsKnown };
  return { canRecord, recording, elapsed, error, setError, liveVideoRef, start, stop, maxSeconds, deviceControls };
}
