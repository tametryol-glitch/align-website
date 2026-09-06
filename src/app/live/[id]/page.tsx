'use client';

// ═══════════════════════════════════════════════════════════════════
// Live viewer
//
// The client here is audience-role only. It never creates a local track,
// which is both a safety property (a viewer cannot publish into someone
// else's broadcast) and a billing one — audience minutes are charged at
// roughly half the rate of publisher minutes.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import {
  getLiveSession,
  createLiveViewerClient,
  sendLiveMessage,
  toggleMessageHeart,
  loadMyMessageHearts,
  attachReplyContext,
  loadRecentMessages,
  subscribeLiveMessages,
  subscribeLiveSession,
  sendLiveHearts,
  getPinnedMessage,
  type LiveSession,
  fetchLiveAuthors,
  authorName,
  type LiveAuthor,
  type LiveMessage,
  type LiveViewerClient,
} from '@/lib/liveService';
import { Users, Send, Loader2, AlertCircle, ArrowLeft, MoreVertical, Flag, Ban, Heart, Share2, Pin, Check } from 'lucide-react';
import { FloatingHearts, useFloatingHearts } from '@/components/live/FloatingHearts';
import { MilestoneToast, useMilestones } from '@/components/live/MilestoneToast';
import { LiveChatMessage } from '@/components/live/LiveChatMessage';
import { LiveComposer, type LiveComposerHandle } from '@/components/live/LiveComposer';
import { CornerUpLeft, X } from 'lucide-react';
import {
  reportLiveStream,
  reportLiveMessage,
  blockLiveUser,
  LIVE_REPORT_REASONS,
  type LiveReportReason,
} from '@/lib/liveSafety';

type Phase = 'loading' | 'watching' | 'ended' | 'error';

export default function LiveViewerPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = String(params?.id || '');
  const { user, isAuthenticated } = useAuthStore();

  const [phase, setPhase] = useState<Phase>('loading');
  const [session, setSession] = useState<LiveSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [remoteTrack, setRemoteTrack] = useState<any>(null);

  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [authors, setAuthors] = useState<Record<string, LiveAuthor>>({});
  const [replyTo, setReplyTo] = useState<LiveMessage | null>(null);
  const [heartedIds, setHeartedIds] = useState<Set<string>>(new Set());
  const composerRef = useRef<LiveComposerHandle | null>(null);
  const milestone = useMilestones(messages, user?.id, authors);
  const [showMenu, setShowMenu] = useState(false);
  const [reporting, setReporting] = useState<null | { messageId?: string; senderId: string; body?: string }>(null);
  const [safetyNote, setSafetyNote] = useState<string | null>(null);
  const [pinned, setPinned] = useState<LiveMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const { petals, burst } = useFloatingHearts();
  const pendingHearts = useRef(0);

  const videoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<LiveViewerClient | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) router.replace(`/auth/login?next=/live/${sessionId}`);
  }, [isAuthenticated, router, sessionId]);

  // ── Join ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId || !isAuthenticated) return;
    let cancelled = false;

    (async () => {
      try {
        const s = await getLiveSession(sessionId);
        if (cancelled) return;
        if (!s) {
          setError('This stream does not exist.');
          setPhase('error');
          return;
        }
        setSession(s);
        if (s.status !== 'live') {
          setPhase('ended');
          return;
        }

        const client = await createLiveViewerClient();
        clientRef.current = client;

        // Only record the track here. The host can start publishing
        // before this component switches to the watching phase, and the
        // stage container does not exist until it does — playing against
        // a null ref is a silent no-op that leaves the viewer on black.
        client.onRemoteVideoChanged((track) => {
          setRemoteTrack(track);
          setHasVideo(!!track);
        });
        client.onHostLeft(() => setPhase('ended'));
        client.onError((m) => setError(m));

        await client.watch(sessionId);
        if (cancelled) {
          await client.stop();
          return;
        }
        setPhase('watching');
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || 'Could not join this stream.');
        setPhase('error');
      }
    })();

    return () => {
      cancelled = true;
      // Always release the seat. Without this the viewer stays counted
      // as present and their watch time never closes.
      clientRef.current?.stop().catch(() => {});
      clientRef.current = null;
    };
  }, [sessionId, isAuthenticated]);

  // ── Chat ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId || phase !== 'watching') return;

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
      setSession(s);
      // The host ending is pushed through the session row, so a viewer
      // finds out even if the RTC disconnect event is missed.
      if (s.status !== 'live') setPhase('ended');
    });

    return () => {
      offMessages();
      offSession();
    };
  }, [sessionId, phase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  // Attach the remote stream once the stage container is actually
  // mounted. Ordering between the host publishing and this component
  // reaching the watching phase is not guaranteed either way.
  useEffect(() => {
    if (phase !== 'watching' || !remoteTrack || !videoRef.current) return;
    remoteTrack.play(videoRef.current);
  }, [phase, remoteTrack]);

  // A backgrounded tab can have its media suspended by the OS -- most
  // aggressively on iOS, where Safari freezes the page outright. Agora
  // reconnects on its own, but the video element is not re-played, so
  // returning would otherwise leave the viewer staring at a dead frame.
  useEffect(() => {
    if (phase !== 'watching') return;
    const resume = () => {
      if (document.visibilityState !== 'visible') return;
      if (remoteTrack && videoRef.current) remoteTrack.play(videoRef.current);
    };
    document.addEventListener('visibilitychange', resume);
    return () => document.removeEventListener('visibilitychange', resume);
  }, [phase, remoteTrack]);

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


  // ── Hearts ───────────────────────────────────────────────────────
  // Taps animate immediately and accumulate; the server hears from us at
  // most once a second. A round trip per tap would be both laggy and a
  // needless flood of writes.
  useEffect(() => {
    if (phase !== 'watching') return;
    const id = setInterval(() => {
      const n = pendingHearts.current;
      if (n <= 0) return;
      pendingHearts.current = 0;
      void sendLiveHearts(sessionId, n);
    }, 1000);
    return () => clearInterval(id);
  }, [phase, sessionId]);

  const tapHeart = useCallback(() => {
    pendingHearts.current += 1;
    burst(1);
  }, [burst]);

  // ── Pinned message ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'watching') return;
    getPinnedMessage(sessionId).then(setPinned).catch(() => {});
  }, [phase, sessionId, messages.length]);

  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: session?.title || 'Live on Align', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the user dismissed the share sheet; nothing to report */
    }
  }, [session]);

  const submitReport = useCallback(
    async (reason: LiveReportReason) => {
      const target = reporting;
      setReporting(null);
      if (!target || !session) return;

      const res = target.messageId
        ? await reportLiveMessage({
            sessionId: sessionId,
            messageId: target.messageId,
            senderId: target.senderId,
            body: target.body || '',
            reason,
          })
        : await reportLiveStream({
            sessionId: sessionId,
            hostId: session.host_id,
            title: session.title,
            reason,
          });

      setSafetyNote(
        res.ok
          ? 'Thanks — reported. We review these within 24 hours.'
          : res.error || 'Could not send that report.',
      );
    },
    [reporting, session, sessionId],
  );

  const handleBlockHost = useCallback(async () => {
    if (!session) return;
    setShowMenu(false);
    const res = await blockLiveUser(session.host_id);
    if (res.ok) {
      // Staying in the room after blocking its host makes no sense.
      await clientRef.current?.stop().catch(() => {});
      router.push('/feed');
      return;
    }
    setSafetyNote(res.error || 'Could not block.');
  }, [session, router]);

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

  const handleSend = useCallback(async (markup?: string) => {
    const body = (markup ?? draft).trim();
    if (!body) return;
    setDraft('');
    const parent = replyTo;
    setReplyTo(null);
    try {
      await sendLiveMessage(sessionId, body, parent?.id ?? null);
    } catch (err: any) {
      setError(err?.message || 'Message not sent.');
    }
  }, [draft, sessionId, replyTo]);

  // ── States ───────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">
        <div className="max-w-sm text-center">
          <AlertCircle className="w-7 h-7 text-red-400 mx-auto mb-3" />
          <p className="text-white/80 mb-6">{error}</p>
          <Link href="/feed" className="inline-block bg-white/10 hover:bg-white/15 rounded-lg px-5 py-2.5 text-sm">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'ended') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold mb-2">This stream has ended</h1>
          {session && (
            <p className="text-sm text-white/50 mb-6">
              {session.title} · {session.peak_viewers} peak {session.peak_viewers === 1 ? 'viewer' : 'viewers'}
            </p>
          )}
          <Link href="/feed" className="inline-block bg-white/10 hover:bg-white/15 rounded-lg px-5 py-2.5 text-sm">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-black text-white flex flex-col lg:flex-row">
      {/* Report reason picker */}
      {reporting && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-5">
          <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-xl p-5">
            <h2 className="text-base font-semibold mb-1">
              {reporting.messageId ? 'Report this message' : 'Report this stream'}
            </h2>
            <p className="text-xs text-white/45 mb-4">
              Reports are reviewed within 24 hours. Blocking is immediate.
            </p>
            <div className="space-y-1.5">
              {LIVE_REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => submitReport(r.value)}
                  className="w-full text-left text-sm px-3.5 py-2.5 rounded-lg bg-white/5
                             hover:bg-white/10 text-white/85"
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setReporting(null)}
              className="w-full mt-4 py-2.5 text-sm text-white/50 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {safetyNote && (
        <div className="fixed top-4 inset-x-4 z-50 mx-auto max-w-sm bg-neutral-900 border
                        border-white/15 rounded-lg px-4 py-3 text-sm text-white/85 flex items-start gap-3">
          <span className="flex-1">{safetyNote}</span>
          <button onClick={() => setSafetyNote(null)} className="text-white/40 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      <div className="relative flex-1 min-h-0 bg-black">
        <div ref={videoRef} className="absolute inset-0 [&>video]:object-contain" />

        {!hasVideo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/45">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Waiting for the host&rsquo;s camera…</p>
          </div>
        )}

        <div className="absolute top-0 inset-x-0 p-4 flex items-center gap-3
                        bg-gradient-to-b from-black/70 to-transparent">
          <button
            onClick={() => router.push('/feed')}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="flex items-center gap-1.5 bg-red-600 rounded px-2 py-1 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <span className="text-sm text-white/85 truncate">{session?.title}</span>
          <span className="ml-auto flex items-center gap-1.5 text-sm text-white/80 shrink-0">
            <Users className="w-4 h-4" />
            <span className="tabular-nums">{session?.current_viewers ?? 0}</span>
          </span>
          <button
            onClick={handleShare}
            aria-label="Share this stream"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu((v) => !v)}
              aria-label="More options"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-neutral-900 border border-white/10
                              rounded-lg overflow-hidden z-10">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (session) setReporting({ senderId: session.host_id });
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-white/85
                             hover:bg-white/10 text-left"
                >
                  <Flag className="w-4 h-4" /> Report this stream
                </button>
                <button
                  onClick={handleBlockHost}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-red-300
                             hover:bg-white/10 text-left"
                >
                  <Ban className="w-4 h-4" /> Block this host
                </button>
              </div>
            )}
          </div>
        </div>

        <FloatingHearts petals={petals} />
        <MilestoneToast milestone={milestone} />

        {pinned && (
          <div className="absolute top-16 inset-x-4 flex items-start gap-2 bg-black/65 backdrop-blur
                          border border-white/15 rounded-lg px-3 py-2 text-sm">
            <Pin className="w-3.5 h-3.5 mt-0.5 text-amber-300 shrink-0" />
            <span className="text-white/85">{pinned.body}</span>
          </div>
        )}

        <button
          onClick={tapHeart}
          aria-label="Send a heart"
          className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20
                     backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
        >
          <Heart className="w-6 h-6 text-red-400" fill="currentColor" />
        </button>

        {(session?.hearts_count ?? 0) > 0 && (
          <span className="absolute bottom-7 right-20 text-xs text-white/60 tabular-nums">
            {session?.hearts_count}
          </span>
        )}

        {error && (
          <div className="absolute bottom-4 inset-x-4 bg-red-500/15 border border-red-500/30
                          text-red-200 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <div className="lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-72 lg:h-auto shrink-0 lg:shrink min-h-0">
        <div className="px-4 py-3 border-b border-white/10 text-sm font-medium text-white/70">
          Live chat
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2.5">
          {messages.length === 0 && <p className="text-sm text-white/35">Say hello.</p>}
          {messages.map((m) => (
            <LiveChatMessage
              key={m.id}
              message={m}
              authors={authors}
              selfId={user?.id}
              hearted={heartedIds.has(m.id)}
              onHeart={handleMessageHeart}
              onReply={startReply}
              onReport={(msg) =>
                setReporting({ messageId: msg.id, senderId: msg.sender_id, body: msg.body })
              }
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
