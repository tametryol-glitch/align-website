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
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import {
  createLiveSession,
  startLiveSession,
  endLiveSession,
  createLiveHostClient,
  getLiveSession,
  listMediaDevices,
  primeDevicePermissions,
  uploadLiveCover,
  sendLiveMessage,
  toggleMessageHeart,
  loadMyMessageHearts,
  attachReplyContext,
  loadRecentMessages,
  subscribeLiveMessages,
  subscribeLiveSession,
  setLiveMessagePinned,
  type LiveHostClient,
  fetchLiveAuthors,
  authorName,
  type LiveAuthor,
  type LiveMessage,
  type LiveVisibility,
  type LiveDevices,
} from '@/lib/liveService';
import {
  PIP_SCALE_MIN,
  PIP_SCALE_MAX,
  SPLIT_RATIO_MIN,
  SPLIT_RATIO_MAX,
  screenShareSupported,
  type LiveBackgroundOptions,
  type LiveBackgroundMode,
  type LiveLayout,
  type PipCorner,
} from '@/lib/liveBackground';
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
  MonitorUp,
  Camera,
  Volume2,
  Columns2,
  PictureInPicture2,
  Repeat,
  Square,
  X,
  EyeOff,
  UserX,
  Pin,
  Heart,
} from 'lucide-react';
import { FloatingHearts, useFloatingHearts } from '@/components/live/FloatingHearts';
import { MilestoneToast, useMilestones } from '@/components/live/MilestoneToast';
import { GiftBurst, useGiftBursts } from '@/components/live/GiftBurst';
import { getGiftCatalog, type Gift } from '@/lib/coinService';
import { TopHearters } from '@/components/live/TopHearters';
import { mentionMarkup } from '@/lib/mentions';
import { LiveChatMessage } from '@/components/live/LiveChatMessage';
import { LiveComposer, type LiveComposerHandle } from '@/components/live/LiveComposer';
import { CornerUpLeft } from 'lucide-react';
import { hideLiveMessage, ejectFromLive } from '@/lib/liveSafety';

type Stage = 'setup' | 'starting' | 'live' | 'ended';

// Streams end themselves at two hours. Tokens now renew, so this is a
// deliberate ceiling rather than a technical one: an unattended stream
// that never ends bills Agora for every viewer still sitting on it.
const MAX_STREAM_SECONDS = 2 * 60 * 60;
const WARN_AT_SECONDS = MAX_STREAM_SECONDS - 5 * 60;

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
  const [heartsCount, setHeartsCount] = useState(0);
  const { petals, burst } = useFloatingHearts();
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

  // Multi-source stage
  const [hasSecond, setHasSecond] = useState(false);
  const [layout, setLayout] = useState<LiveLayout>('solo');
  const [pipScale, setPipScale] = useState(0.28);
  const [pipCorner, setPipCorner] = useState<PipCorner>('br');
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [showStage, setShowStage] = useState(false);
  const [busySource, setBusySource] = useState(false);
  const [screenHasAudio, setScreenHasAudio] = useState(false);
  const [pickingCamera, setPickingCamera] = useState(false);
  const [micGain, setMicGain] = useState(1);
  const [screenGain, setScreenGain] = useState(0.7);

  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [authors, setAuthors] = useState<Record<string, LiveAuthor>>({});
  const [replyTo, setReplyTo] = useState<LiveMessage | null>(null);
  const [heartedIds, setHeartedIds] = useState<Set<string>>(new Set());
  const composerRef = useRef<LiveComposerHandle | null>(null);
  const milestone = useMilestones(messages, user?.id, authors);

  const videoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<LiveHostClient | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [giftCatalog, setGiftCatalog] = useState<Gift[]>([]);

  useEffect(() => {
    getGiftCatalog().then(setGiftCatalog);
  }, []);

  // The host is the person a gift is FOR, so they are the one who most
  // needs to see who sent it.
  const nameFor = useCallback(
    (id: string) => authors[id]?.display_name || 'Someone',
    [authors],
  );

  const { celebration } = useGiftBursts(sessionId, giftCatalog, nameFor);

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

  // ── Two hour ceiling ─────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'live') return;
    if (elapsed === WARN_AT_SECONDS) {
      setNotice('Five minutes left — this stream ends automatically at two hours.');
    }
    if (elapsed >= MAX_STREAM_SECONDS) {
      void endBroadcast('duration_limit');
    }
  }, [elapsed, stage]);

  // ── Local preview ────────────────────────────────────────────────
  // Every path that can change what is being published funnels through
  // here. The preview binds to a specific track object, so switching
  // camera, changing background, or altering the layout all replace it
  // — and without a re-attach the element keeps rendering a dead track,
  // which looks exactly like a broken camera.
  const attachPreview = useCallback((track?: any | null) => {
    const el = videoRef.current;
    if (!el) return;
    const t = track ?? clientRef.current?.getLocalVideoTrack();
    if (!t) return;
    el.innerHTML = '';
    try {
      t.play(el);
    } catch {
      /* a track mid-swap can refuse; the next change re-attaches */
    }
  }, []);

  // The stage container only exists once stage === 'live', so attaching
  // any earlier is a no-op against a null ref.
  useEffect(() => {
    if (stage !== 'live' || cameraOff) return;
    attachPreview();
  }, [stage, cameraOff, attachPreview]);

  // ── Chat + session subscriptions ─────────────────────────────────
  useEffect(() => {
    if (!sessionId || stage !== 'live') return;

    loadRecentMessages(sessionId)
      .then(async (rows) => {
        setMessages(rows);
        setHeartedIds(await loadMyMessageHearts(rows.map((r) => r.id)));
      })
      .catch(() => {});

    // Realtime UPDATE payloads carry only the raw row -- no joined
    // profile, no reply context. Merge the changed columns and keep
    // what the client already resolved, or hearting a comment would
    // blank out its author.
    const onUpdate = (u: LiveMessage) =>
      setMessages((prev) =>
        prev.map((m) =>
          m.id === u.id
            ? {
                ...m,
                ...u,
                profile: m.profile,
                reply_to_body: m.reply_to_body,
                reply_to_name: m.reply_to_name,
              }
            : m,
        ),
      );
    const offMessages = subscribeLiveMessages(
      sessionId,
      (msg) => setMessages((prev) => attachReplyContext([...prev, msg])),
      onUpdate,
    );
    const offSession = subscribeLiveSession(sessionId, (s) => {
      setPeakViewers(s.peak_viewers);
      setViewerCount(s.current_viewers ?? 0);
      // Animate the difference so the host sees hearts arriving rather
      // than just a number ticking upward.
      setHeartsCount((prev) => {
        const next = Number(s.hearts_count ?? 0);
        if (next > prev) burst(Math.min(6, next - prev));
        return next;
      });

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
  }, [sessionId, stage, burst]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  // Notices are transient by nature -- a failed pin, a device that would
  // not switch. Left on screen they pile onto the same corner as the
  // hearters strip and read as a permanent fault.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(t);
  }, [notice]);

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


  // ── Poll as a safety net ──────────────────────────────────────────
  // Everything the host sees about their own stream — hearts, who is
  // watching, a moderator ending it — arrives on one realtime UPDATE.
  // When that event does not land the host is simply blind, with no
  // error to explain it, so a slow poll backs it up.
  useEffect(() => {
    if (stage !== 'live' || !sessionId) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const s = await getLiveSession(sessionId);
        if (cancelled || !s) return;
        setPeakViewers(s.peak_viewers);
        setViewerCount(s.current_viewers ?? 0);
        setHeartsCount((prev) => {
          const next = Number(s.hearts_count ?? 0);
          if (next > prev) burst(Math.min(6, next - prev));
          return next;
        });
      } catch {
        /* a missed poll is not worth surfacing */
      }
    };

    const id = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [stage, sessionId, burst]);

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
      // Re-bind the preview whenever the published track is replaced.
      client.onVideoTrackChanged((track) => attachPreview(track));
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
  }, [title, visibility, coverUrl, cameraId, micId, bgMode, bgImageUrl, attachPreview]);

  // ── End ──────────────────────────────────────────────────────────
  const endBroadcast = useCallback(
    async (reason: string) => {
      try {
        await clientRef.current?.stop();
      } catch {
        /* stopping the client must never block ending the session */
      }
      clientRef.current = null;
      if (sessionId) {
        try {
          await endLiveSession(sessionId, reason);
        } catch (err: any) {
          setError(err?.message || 'The stream stopped but the session did not close cleanly.');
        }
      }
      setStage('ended');
    },
    [sessionId],
  );

  const handleEnd = useCallback(() => endBroadcast('host_ended'), [endBroadcast]);

  const handleMessageHeart = useCallback(
    async (m: LiveMessage) => {
      const was = heartedIds.has(m.id);
      // Optimistic: a heart that waits on a round trip feels broken.
      setHeartedIds((prev) => {
        const next = new Set(prev);
        if (was) next.delete(m.id);
        else next.add(m.id);
        return next;
      });
      setMessages((prev) =>
        prev.map((x) =>
          x.id === m.id
            ? { ...x, hearts_count: Math.max(0, (x.hearts_count ?? 0) + (was ? -1 : 1)) }
            : x,
        ),
      );
      try {
        await toggleMessageHeart(m.id, was);
      } catch {
        // Put it back rather than leaving a lie on screen.
        setHeartedIds((prev) => {
          const next = new Set(prev);
          if (was) next.add(m.id);
          else next.delete(m.id);
          return next;
        });
      }
    },
    [heartedIds],
  );

  const startReply = useCallback((m: LiveMessage) => {
    setReplyTo(m);
    // Seed a readable "@Name"; the composer remembers who it points at
    // and converts to markup on send.
    composerRef.current?.addMention({
      id: m.sender_id,
      displayName: m.profile?.display_name || 'them',
    });
  }, []);

  /** One click turns a milestone into an interaction. */
  const thankHearter = useCallback(
    async (who: { id: string; name: string }) => {
      if (!sessionId) return;
      try {
        await sendLiveMessage(
          sessionId,
          `Thanks ${mentionMarkup({ id: who.id, displayName: who.name })}!`,
        );
      } catch {
        /* a thank-you that fails to send is not worth an alert */
      }
    },
    [sessionId],
  );

  const handlePin = useCallback(
    async (m: LiveMessage) => {
      if (!sessionId) return;
      try {
        await setLiveMessagePinned(sessionId, m.id, !m.is_pinned);
        setMessages((prev) =>
          prev.map((x) =>
            x.id === m.id ? { ...x, is_pinned: !m.is_pinned } : { ...x, is_pinned: false },
          ),
        );
      } catch (err: any) {
        setNotice(err?.message || 'Could not pin that message.');
      }
    },
    [sessionId],
  );

  const handleHide = useCallback(async (m: LiveMessage) => {
    const res = await hideLiveMessage(m.id);
    if (res.ok) setMessages((prev) => prev.filter((x) => x.id !== m.id));
    else setNotice(res.error || 'Could not hide that message.');
  }, []);

  const handleEject = useCallback(
    async (m: LiveMessage) => {
      if (!sessionId) return;
      const ok = window.confirm(
        'Remove this person from the stream? Everything they have said is hidden and they cannot rejoin.',
      );
      if (!ok) return;
      const res = await ejectFromLive(sessionId, m.sender_id);
      if (res.ok) {
        setMessages((prev) => prev.filter((x) => x.sender_id !== m.sender_id));
        setNotice('Removed from this stream.');
      } else {
        setNotice(res.error || 'Could not remove them.');
      }
    },
    [sessionId],
  );

  const handleSend = useCallback(async (markup?: string) => {
    const body = (markup ?? draft).trim();
    if (!body || !sessionId) return;
    setDraft('');
    const parent = replyTo;
    setReplyTo(null);
    try {
      await sendLiveMessage(sessionId, body, parent?.id ?? null);
    } catch (err: any) {
      setNotice(err?.message || 'Message not sent.');
    }
  }, [draft, sessionId, replyTo]);

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

  // ── Stage controls ───────────────────────────────────────────────
  const pushStage = useCallback(
    async (next: Partial<{
      layout: LiveLayout;
      pipScale: number;
      pipCorner: PipCorner;
      splitRatio: number;
      swapped: boolean;
    }>) => {
      try {
        await clientRef.current?.setStage(next);
      } catch (err: any) {
        setNotice(err?.message || 'Could not change the layout.');
      }
    },
    [],
  );

  const addSource = useCallback(
    async (kind: 'camera' | 'screen', deviceId?: string) => {
      setBusySource(true);
      setNotice(null);
      setPickingCamera(false);
      try {
        await clientRef.current?.addSecondarySource(
          kind,
          kind === 'camera' ? deviceId : undefined,
        );
        const nowHas = clientRef.current?.hasSecondarySource() ?? false;
        setHasSecond(nowHas);
        if (nowHas) setLayout('pip');

        const withAudio = clientRef.current?.hasScreenAudio() ?? false;
        setScreenHasAudio(withAudio);
        if (kind === 'screen' && nowHas && !withAudio) {
          setNotice(
            'Sharing without sound. To let viewers hear the video, stop sharing and pick it again with "Share tab audio" ticked.',
          );
        }
      } finally {
        setBusySource(false);
      }
    },
    [],
  );

  const dropSource = useCallback(async () => {
    setBusySource(true);
    try {
      await clientRef.current?.removeSecondarySource();
      setHasSecond(false);
      setScreenHasAudio(false);
      setLayout('solo');
    } finally {
      setBusySource(false);
    }
  }, []);

  const pushLevels = useCallback(
    async (next: { micGain?: number; screenGain?: number }) => {
      try {
        await clientRef.current?.setAudioLevels(next);
      } catch {
        /* levels are cosmetic; never interrupt a broadcast for them */
      }
    },
    [],
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
                       text-white focus:outline-none focus:border-red-500/60 [&>option]:bg-neutral-900 [&>option]:text-white"
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
                       text-white focus:outline-none focus:border-red-500/60 [&>option]:bg-neutral-900 [&>option]:text-white"
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
                       text-white focus:outline-none focus:border-red-500/60 [&>option]:bg-neutral-900 [&>option]:text-white"
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
            <div className="bg-white/5 rounded-lg py-4">
              <div className="text-2xl font-semibold tabular-nums">{heartsCount}</div>
              <div className="text-xs text-white/50 mt-1">Hearts</div>
            </div>
            <div className="bg-white/5 rounded-lg py-4 flex flex-col items-center justify-center">
              <Link href="/live/standing" className="text-sm text-amber-300 hover:text-amber-200">
                View standing
              </Link>
              <span className="text-[11px] text-white/40 mt-1">Tier &amp; reach</span>
            </div>
          </div>

          {/* Who actually showed up for you. During the stream this is a
              glance; afterwards it is the part worth reading. */}
          <div className="mb-8">
            <TopHearters sessionId={sessionId} variant="summary" />
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
    <div className="h-[100dvh] overflow-hidden bg-black text-white flex flex-col lg:flex-row">
      {/* Stage */}
      <div className="relative flex-1 min-h-0 bg-black">
        <div ref={videoRef} className="absolute inset-0 [&>video]:object-cover" />
        <FloatingHearts petals={petals} />
        <GiftBurst celebration={celebration} />
        <MilestoneToast
          milestone={milestone}
          onThank={(m) => thankHearter({ id: m.senderId, name: m.senderName })}
        />
        <TopHearters
          sessionId={sessionId}
          onPressHearter={(h) =>
            thankHearter({ id: h.viewer_id, name: h.display_name || 'friend' })
          }
        />

        {/* Top HUD */}
        <div className="absolute top-0 inset-x-0 p-4 flex items-center gap-3
                        bg-gradient-to-b from-black/70 to-transparent">
          <span className="flex items-center gap-1.5 bg-red-600 rounded px-2 py-1 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <span
            className={`text-sm tabular-nums ${
              elapsed >= WARN_AT_SECONDS ? 'text-amber-300' : 'text-white/80'
            }`}
            title={
              elapsed >= WARN_AT_SECONDS
                ? 'Ends automatically at two hours'
                : undefined
            }
          >
            {fmt(elapsed)}
            {elapsed >= WARN_AT_SECONDS &&
              ` · ${fmt(Math.max(0, MAX_STREAM_SECONDS - elapsed))} left`}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-white/80">
            <Users className="w-4 h-4" />
            <span className="tabular-nums">{viewerCount}</span>
          </span>
          {heartsCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-white/70">
              <Heart className="w-3.5 h-3.5 text-red-400" fill="currentColor" />
              <span className="tabular-nums">{heartsCount}</span>
            </span>
          )}
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

        {/* Views & layout */}
        {showStage && (
          <div className="absolute bottom-24 inset-x-0 px-5">
            <div className="mx-auto max-w-md bg-black/80 backdrop-blur border border-white/10
                            rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">Views</span>
                <button
                  onClick={() => setShowStage(false)}
                  aria-label="Close"
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Second source */}
              {!hasSecond ? (
                pickingCamera ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">Which camera?</span>
                      <button
                        onClick={() => setPickingCamera(false)}
                        className="text-xs text-white/40 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                    {/* The camera already broadcasting is excluded — two
                        views of the same lens is not a second view. */}
                    {devices.cameras
                      .filter((d) => d.deviceId !== cameraId)
                      .map((d) => (
                        <button
                          key={d.deviceId}
                          onClick={() => addSource('camera', d.deviceId)}
                          disabled={busySource}
                          className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-left
                                     bg-white/10 hover:bg-white/20 disabled:opacity-40"
                        >
                          <Camera className="w-4 h-4 shrink-0" />
                          <span className="truncate">{d.label}</span>
                        </button>
                      ))}
                  </div>
                ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const others = devices.cameras.filter((d) => d.deviceId !== cameraId);
                      // One candidate is not a choice worth interrupting
                      // for; more than one must never be picked for them.
                      if (others.length === 1) addSource('camera', others[0].deviceId);
                      else setPickingCamera(true);
                    }}
                    disabled={busySource || devices.cameras.length < 2}
                    title={
                      devices.cameras.length < 2
                        ? 'Only one camera detected'
                        : 'Add a second camera'
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm
                               bg-white/10 hover:bg-white/20 disabled:opacity-40"
                  >
                    <Camera className="w-4 h-4" /> 2nd camera
                  </button>
                  <button
                    onClick={() => addSource('screen')}
                    disabled={busySource || !screenShareSupported()}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm
                               bg-white/10 hover:bg-white/20 disabled:opacity-40"
                  >
                    <MonitorUp className="w-4 h-4" /> Share screen
                  </button>
                </div>
                )
              ) : (
                <div className="space-y-3">
                  {/* Layout */}
                  <div className="flex gap-2">
                    {([
                      { key: 'solo', label: 'Single', Icon: Square },
                      { key: 'pip', label: 'Inset', Icon: PictureInPicture2 },
                      { key: 'split', label: 'Split', Icon: Columns2 },
                    ] as const).map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setLayout(key);
                          pushStage({ layout: key });
                        }}
                        className={`flex-1 flex flex-col items-center gap-1 rounded-lg py-2.5 text-xs border ${
                          layout === key
                            ? 'bg-white/20 border-white/30 text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Size */}
                  {layout === 'pip' && (
                    <div>
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>Inset size</span>
                        <span className="tabular-nums">{Math.round(pipScale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={PIP_SCALE_MIN * 100}
                        max={PIP_SCALE_MAX * 100}
                        value={Math.round(pipScale * 100)}
                        onChange={(e) => {
                          const v = Number(e.target.value) / 100;
                          setPipScale(v);
                          pushStage({ pipScale: v });
                        }}
                        className="w-full accent-red-500"
                      />
                      <div className="flex gap-1.5 mt-2">
                        {([
                          { key: 'tl', label: 'Top left' },
                          { key: 'tr', label: 'Top right' },
                          { key: 'bl', label: 'Bottom left' },
                          { key: 'br', label: 'Bottom right' },
                        ] as const).map((c) => (
                          <button
                            key={c.key}
                            onClick={() => {
                              setPipCorner(c.key);
                              pushStage({ pipCorner: c.key });
                            }}
                            className={`flex-1 rounded py-1.5 text-[11px] ${
                              pipCorner === c.key
                                ? 'bg-white/20 text-white'
                                : 'bg-white/5 text-white/50 hover:text-white'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {layout === 'split' && (
                    <div>
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>Balance</span>
                        <span className="tabular-nums">
                          {Math.round(splitRatio * 100)} / {100 - Math.round(splitRatio * 100)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={SPLIT_RATIO_MIN * 100}
                        max={SPLIT_RATIO_MAX * 100}
                        value={Math.round(splitRatio * 100)}
                        onChange={(e) => {
                          const v = Number(e.target.value) / 100;
                          setSplitRatio(v);
                          pushStage({ splitRatio: v });
                        }}
                        className="w-full accent-red-500"
                      />
                    </div>
                  )}

                  {/* Audio mix — only meaningful once a second sound
                      source is actually in the stream. */}
                  {screenHasAudio && (
                    <div className="pt-1 border-t border-white/10 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-white/60 pt-2">
                        <Volume2 className="w-3.5 h-3.5" />
                        Audio mix
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-white/50 mb-1">
                          <span>Your voice</span>
                          <span className="tabular-nums">{Math.round(micGain * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={150}
                          value={Math.round(micGain * 100)}
                          onChange={(e) => {
                            const v = Number(e.target.value) / 100;
                            setMicGain(v);
                            pushLevels({ micGain: v });
                          }}
                          className="w-full accent-red-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-white/50 mb-1">
                          <span>Shared sound</span>
                          <span className="tabular-nums">{Math.round(screenGain * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={150}
                          value={Math.round(screenGain * 100)}
                          onChange={(e) => {
                            const v = Number(e.target.value) / 100;
                            setScreenGain(v);
                            pushLevels({ screenGain: v });
                          }}
                          className="w-full accent-red-500"
                        />
                      </div>
                      <p className="text-[11px] text-white/35 leading-relaxed">
                        Wear headphones. Through speakers your microphone picks the
                        video back up and viewers hear it twice.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() =>
                        pushStage({ swapped: !(clientRef.current?.getStage().swapped ?? false) })
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm
                                 bg-white/10 hover:bg-white/20"
                    >
                      <Repeat className="w-4 h-4" /> Swap
                    </button>
                    <button
                      onClick={dropSource}
                      disabled={busySource}
                      className="flex-1 rounded-lg py-2.5 text-sm bg-white/10 hover:bg-white/20
                                 text-red-300 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
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
          <button
            onClick={() => setShowStage((v) => !v)}
            aria-label="Views and layout"
            title="Views and layout"
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              hasSecond ? 'bg-white/25 hover:bg-white/35' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <Columns2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-72 lg:h-auto shrink-0 lg:shrink min-h-0">
        <div className="px-4 py-3 border-b border-white/10 text-sm font-medium text-white/70">
          Live chat
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2.5">
          {messages.length === 0 && (
            <p className="text-sm text-white/35">No messages yet.</p>
          )}
          {messages.map((m) => (
            <LiveChatMessage
              key={m.id}
              message={m}
              authors={authors}
              selfId={user?.id}
              isHost
              hearted={heartedIds.has(m.id)}
              onHeart={handleMessageHeart}
              onReply={startReply}
              onPin={handlePin}
              onHide={handleHide}
              onEject={handleEject}
            />
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-3 border-t border-white/10">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-white/5 text-xs">
              <CornerUpLeft className="w-3 h-3 text-white/40 shrink-0" />
              <span className="flex-1 truncate text-white/55">
                Replying to {authorName(replyTo, authors, user?.id)}
              </span>
              <button
                onClick={() => setReplyTo(null)}
                aria-label="Cancel reply"
                className="text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
          <LiveComposer
            value={draft}
            onChange={setDraft}
            onSubmit={handleSend}
            excludeUserId={user?.id}
            registerRef={(h) => {
              composerRef.current = h;
            }}
          />
          <button
            onClick={() => handleSend()}
            aria-label="Send message"
            className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
