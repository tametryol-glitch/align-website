'use client';

// ═══════════════════════════════════════════════════════════════════
// Go Live — host broadcast screen
//
// Order of operations matters here. The host publishes into the channel
// BEFORE the session flips to 'live', so a viewer who joins the instant
// it appears in the rail never lands in an empty channel and sees a
// black square. Ending reverses it: stop publishing, then close the row.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  createLiveSession,
  startLiveSession,
  endLiveSession,
  createLiveHostClient,
  listMediaDevices,
  primeDevicePermissions,
  uploadLiveCover,
  sendLiveMessage,
  loadRecentMessages,
  subscribeLiveMessages,
  subscribeLiveSession,
  type LiveHostClient,
  fetchLiveAuthors,
  authorName,
  type LiveAuthor,
  type LiveMessage,
  type LiveVisibility,
  type LiveDevices,
} from '@/lib/liveService';
import type { LiveBackgroundOptions, LiveBackgroundMode } from '@/lib/liveBackground';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  SwitchCamera,
  Users,
  Send,
  Loader2,
  AlertCircle,
  Radio,
  ImagePlus,
  Sparkles,
} from 'lucide-react';

type Stage = 'setup' | 'starting' | 'live' | 'ended';

export default function GoLivePage() {
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuthStore();

  const [stage, setStage] = useState<Stage>('setup');
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<LiveVisibility>('public');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [peakViewers, setPeakViewers] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  // Pre-live setup
  const [devices, setDevices] = useState<LiveDevices>({ cameras: [], microphones: [] });
  const [cameraId, setCameraId] = useState<string>('');
  const [micId, setMicId] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [bgMode, setBgMode] = useState<LiveBackgroundMode>('none');
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [authors, setAuthors] = useState<Record<string, LiveAuthor>>({});

  const videoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<LiveHostClient | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Guards ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login?next=/live/go');
      return;
    }
    // Phase 1 is founder-only. This is the courtesy redirect; the
    // enforceable gate is the RLS policy on live_sessions, because a
    // client-side check is only ever a suggestion.
    if (profile && !profile.is_admin) router.replace('/feed');
  }, [isAuthenticated, profile, router]);

  // ── Devices ──────────────────────────────────────────────────────
  // Labels stay blank until permission has been granted once, so ask
  // first — otherwise the picker can only offer "Camera 1", "Camera 2".
  useEffect(() => {
    if (stage !== 'setup') return;
    let cancelled = false;
    (async () => {
      await primeDevicePermissions();
      const found = await listMediaDevices();
      if (cancelled) return;
      setDevices(found);
      setCameraId((prev) => prev || found.cameras[0]?.deviceId || '');
      setMicId((prev) => prev || found.microphones[0]?.deviceId || '');
    })();
    return () => {
      cancelled = true;
    };
  }, [stage]);

  // ── Elapsed timer ────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'live') return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [stage]);

  // ── Local preview ────────────────────────────────────────────────
  // Attach here rather than at publish time. The stage container only
  // exists once stage === 'live', so playing the track any earlier is a
  // no-op against a null ref — which shows the host a black rectangle
  // while their camera is in fact publishing perfectly well.
  // Re-runs on cameraOff so toggling the camera back on re-attaches.
  useEffect(() => {
    if (stage !== 'live' || cameraOff) return;
    const track = clientRef.current?.getLocalVideoTrack();
    if (track && videoRef.current) track.play(videoRef.current);
  }, [stage, cameraOff]);

  // ── Chat + session subscriptions ─────────────────────────────────
  useEffect(() => {
    if (!sessionId || stage !== 'live') return;

    loadRecentMessages(sessionId).then(setMessages).catch(() => {});

    const offMessages = subscribeLiveMessages(sessionId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    const offSession = subscribeLiveSession(sessionId, (s) => {
      setPeakViewers(s.peak_viewers);

      // A moderator can end this stream from the admin panel. Without
      // this the host's browser keeps publishing into a dead session —
      // the viewers are gone but the Agora meter is still running.
      if (s.status !== 'live') {
        setNotice('This stream was ended by a moderator.');
        clientRef.current?.stop().catch(() => {});
        clientRef.current = null;
        setStage('ended');
      }
    });

    return () => {
      offMessages();
      offSession();
    };
  }, [sessionId, stage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime inserts arrive without an author, so resolve any sender we
  // have not seen yet and cache it. Without this, chat shows UUIDs.
  useEffect(() => {
    const missing = messages
      .filter((m) => !m.profile?.display_name && !authors[m.sender_id])
      .map((m) => m.sender_id);
    if (missing.length === 0) return;
    fetchLiveAuthors(missing).then((found) => {
      if (Object.keys(found).length > 0) setAuthors((prev) => ({ ...prev, ...found }));
    });
  }, [messages, authors]);


  // ── Leaving the page while live must not strand the session ──────
  useEffect(() => {
    if (stage !== 'live') return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [stage]);

  // ── Go live ──────────────────────────────────────────────────────
  const handleGoLive = useCallback(async () => {
    setError(null);
    setStage('starting');
    try {
      const session = await createLiveSession({
        title: title.trim() || 'Live',
        visibility,
        coverUrl,
      });
      setSessionId(session.id);

      const background: LiveBackgroundOptions = {
        mode: bgMode,
        imageUrl: bgImageUrl,
        blurPx: 14,
      };
      const client = await createLiveHostClient({
        cameraId: cameraId || null,
        microphoneId: micId || null,
        background,
      });
      client.onError((message) => setNotice(message));
      clientRef.current = client;

      // Publish first, then announce. See the note at the top.
      await client.start(session.id);

      // The preview is attached by the effect below, not here: this runs
      // while the setup screen is still mounted, so the stage container
      // does not exist yet and play() would silently do nothing.
      await startLiveSession(session.id);
      setStage('live');

      // Tell friends. Deliberately not awaited into the critical path:
      // a failed notification must never take down a working broadcast.
      fetch('/api/live/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id }),
      }).catch(() => {});
    } catch (err: any) {
      setError(err?.message || 'Could not start the broadcast.');
      setStage('setup');
      // Clean up a half-started client so the next attempt is not
      // fighting a stale one holding the camera.
      await clientRef.current?.stop().catch(() => {});
      clientRef.current = null;
    }
  }, [title, visibility, coverUrl, cameraId, micId, bgMode, bgImageUrl]);

  // ── End ──────────────────────────────────────────────────────────
  const handleEnd = useCallback(async () => {
    try {
      await clientRef.current?.stop();
    } catch {
      /* stopping the client must never block ending the session */
    }
    clientRef.current = null;
    if (sessionId) {
      try {
        await endLiveSession(sessionId, 'host_ended');
      } catch (err: any) {
        setError(err?.message || 'The stream stopped but the session did not close cleanly.');
      }
    }
    setStage('ended');
  }, [sessionId]);

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || !sessionId) return;
    setDraft('');
    try {
      await sendLiveMessage(sessionId, body);
    } catch (err: any) {
      setNotice(err?.message || 'Message not sent.');
    }
  }, [draft, sessionId]);

  const handleCoverPick = useCallback(async (file: File) => {
    setCoverUploading(true);
    setError(null);
    try {
      setCoverUrl(await uploadLiveCover(file));
    } catch (err: any) {
      setError(err?.message || 'Could not upload that thumbnail.');
    } finally {
      setCoverUploading(false);
    }
  }, []);

  // Background images stay local: an object URL is enough to composite
  // with, and uploading one the viewers never receive would be waste.
  const handleBackgroundPick = useCallback((file: File) => {
    setBgImageUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setBgMode('image');
  }, []);

  /** Change the background mid-broadcast without a republish flicker. */
  const applyBackground = useCallback(
    async (mode: LiveBackgroundMode, imageUrl?: string | null) => {
      setBgMode(mode);
      const url = imageUrl !== undefined ? imageUrl : bgImageUrl;
      if (stage !== 'live') return;
      try {
        await clientRef.current?.setBackground({ mode, imageUrl: url, blurPx: 14 });
      } catch (err: any) {
        setNotice(err?.message || 'Could not change the background.');
      }
    },
    [stage, bgImageUrl],
  );

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Setup ────────────────────────────────────────────────────────
  if (stage === 'setup' || stage === 'starting') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <Radio className="w-5 h-5 text-red-500" />
            <h1 className="text-2xl font-semibold">Go live</h1>
          </div>

          <label className="block text-sm text-white/60 mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="What are you talking about?"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 mb-5
                       text-white placeholder-white/30 focus:outline-none focus:border-red-500/60"
          />

          <label className="block text-sm text-white/60 mb-1.5">Who can watch</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as LiveVisibility)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 mb-6
                       text-white focus:outline-none focus:border-red-500/60"
          >
            <option value="public">Everyone</option>
            <option value="followers">Friends only</option>
            <option value="private">Just me (test run)</option>
          </select>

          {/* Thumbnail */}
          <label className="block text-sm text-white/60 mb-1.5">Thumbnail</label>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleCoverPick(f);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            className="w-full mb-5 rounded-lg border border-dashed border-white/15 hover:border-white/30
                       overflow-hidden disabled:opacity-60"
          >
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Stream thumbnail" className="w-full h-32 object-cover" />
            ) : (
              <span className="flex items-center justify-center gap-2 h-20 text-sm text-white/45">
                {coverUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4" /> Add a thumbnail
                  </>
                )}
              </span>
            )}
          </button>

          {/* Camera */}
          <label className="block text-sm text-white/60 mb-1.5">Camera</label>
          <select
            value={cameraId}
            onChange={(e) => setCameraId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 mb-5
                       text-white focus:outline-none focus:border-red-500/60"
          >
            {devices.cameras.length === 0 && <option value="">No camera found</option>}
            {devices.cameras.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Microphone */}
          <label className="block text-sm text-white/60 mb-1.5">Microphone</label>
          <select
            value={micId}
            onChange={(e) => setMicId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 mb-5
                       text-white focus:outline-none focus:border-red-500/60"
          >
            {devices.microphones.length === 0 && <option value="">No microphone found</option>}
            {devices.microphones.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Background */}
          <label className="block text-sm text-white/60 mb-1.5">Background</label>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleBackgroundPick(f);
              e.target.value = '';
            }}
          />
          <div className="flex gap-2 mb-6">
            {([
              { key: 'none', label: 'None' },
              { key: 'blur', label: 'Blur' },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setBgMode(opt.key)}
                className={`flex-1 rounded-lg py-2.5 text-sm border transition-colors ${
                  bgMode === opt.key
                    ? 'bg-white/15 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => (bgImageUrl ? setBgMode('image') : bgInputRef.current?.click())}
              className={`flex-1 rounded-lg py-2.5 text-sm border flex items-center justify-center gap-1.5 transition-colors ${
                bgMode === 'image'
                  ? 'bg-white/15 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Image
            </button>
          </div>

          {bgMode === 'image' && (
            <button
              onClick={() => bgInputRef.current?.click()}
              className="w-full mb-6 -mt-3 text-xs text-white/45 hover:text-white/70 text-left"
            >
              {bgImageUrl ? 'Change background image' : 'Choose a background image…'}
            </button>
          )}

          {error && (
            <div className="flex items-start gap-2 mb-5 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGoLive}
            disabled={stage === 'starting'}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60
                       rounded-lg py-3 font-medium flex items-center justify-center gap-2"
          >
            {stage === 'starting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Starting…
              </>
            ) : (
              'Go live'
            )}
          </button>

          <p className="text-xs text-white/40 mt-4 leading-relaxed">
            Your camera and microphone start when you go live. Streaming at 720p.
            Background replacement runs on your device and can be demanding on older machines.
          </p>
        </div>
      </div>
    );
  }

  // ── Ended ────────────────────────────────────────────────────────
  if (stage === 'ended') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold mb-6">Stream ended</h1>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white/5 rounded-lg py-4">
              <div className="text-2xl font-semibold tabular-nums">{fmt(elapsed)}</div>
              <div className="text-xs text-white/50 mt-1">Duration</div>
            </div>
            <div className="bg-white/5 rounded-lg py-4">
              <div className="text-2xl font-semibold tabular-nums">{peakViewers}</div>
              <div className="text-xs text-white/50 mt-1">Peak viewers</div>
            </div>
          </div>
          <button
            onClick={() => router.push('/feed')}
            className="w-full bg-white/10 hover:bg-white/15 rounded-lg py-3 font-medium"
          >
            Back to feed
          </button>
        </div>
      </div>
    );
  }

  // ── Live ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      {/* Stage */}
      <div className="relative flex-1 bg-black">
        <div ref={videoRef} className="absolute inset-0 [&>video]:object-cover" />

        {/* Top HUD */}
        <div className="absolute top-0 inset-x-0 p-4 flex items-center gap-3
                        bg-gradient-to-b from-black/70 to-transparent">
          <span className="flex items-center gap-1.5 bg-red-600 rounded px-2 py-1 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <span className="text-sm tabular-nums text-white/80">{fmt(elapsed)}</span>
          <span className="flex items-center gap-1.5 text-sm text-white/80">
            <Users className="w-4 h-4" />
            <span className="tabular-nums">{viewerCount || peakViewers}</span>
          </span>
          <button
            onClick={handleEnd}
            className="ml-auto bg-white/15 hover:bg-white/25 rounded-lg px-3.5 py-1.5 text-sm font-medium"
          >
            End
          </button>
        </div>

        {notice && (
          <div className="absolute top-16 inset-x-4 bg-amber-500/15 border border-amber-500/30
                          text-amber-200 text-sm rounded-lg px-3 py-2">
            {notice}
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 inset-x-0 p-5 flex items-center justify-center gap-3
                        bg-gradient-to-t from-black/70 to-transparent">
          <button
            onClick={() => setMuted(clientRef.current?.toggleMute() ?? false)}
            aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            {muted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={async () => setCameraOff(!(await clientRef.current?.toggleCamera()))}
            aria-label={cameraOff ? 'Turn camera on' : 'Turn camera off'}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            {cameraOff ? <VideoOff className="w-5 h-5 text-red-400" /> : <VideoIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => clientRef.current?.switchCamera()}
            aria-label="Switch camera"
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              // Cycle none → blur → image, skipping image when none is set.
              const next: LiveBackgroundMode =
                bgMode === 'none' ? 'blur' : bgMode === 'blur' && bgImageUrl ? 'image' : 'none';
              applyBackground(next);
            }}
            aria-label="Change background"
            title={`Background: ${bgMode}`}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              bgMode === 'none' ? 'bg-white/10 hover:bg-white/20' : 'bg-white/25 hover:bg-white/35'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-72 lg:h-auto">
        <div className="px-4 py-3 border-b border-white/10 text-sm font-medium text-white/70">
          Live chat
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {messages.length === 0 && (
            <p className="text-sm text-white/35">No messages yet.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="text-sm leading-snug">
              <span className="text-white/45">{authorName(m, authors, user?.id)}</span>{' '}
              <span className="text-white/90">{m.body}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-3 border-t border-white/10 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            maxLength={500}
            placeholder="Say something…"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
                       placeholder-white/30 focus:outline-none focus:border-white/25"
          />
          <button
            onClick={handleSend}
            aria-label="Send message"
            className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
