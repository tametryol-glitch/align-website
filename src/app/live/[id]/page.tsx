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
  loadRecentMessages,
  subscribeLiveMessages,
  subscribeLiveSession,
  type LiveSession,
  type LiveMessage,
  type LiveViewerClient,
} from '@/lib/liveService';
import { Users, Send, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

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

  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState('');

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

        client.onRemoteVideoChanged((track) => {
          if (track && videoRef.current) {
            track.play(videoRef.current);
            setHasVideo(true);
          } else {
            setHasVideo(false);
          }
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

    loadRecentMessages(sessionId).then(setMessages).catch(() => {});

    const offMessages = subscribeLiveMessages(sessionId, (msg) =>
      setMessages((prev) => [...prev, msg]),
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    try {
      await sendLiveMessage(sessionId, body);
    } catch (err: any) {
      setError(err?.message || 'Message not sent.');
    }
  }, [draft, sessionId]);

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
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      <div className="relative flex-1 bg-black">
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
            <span className="tabular-nums">{session?.peak_viewers ?? 0}</span>
          </span>
        </div>

        {error && (
          <div className="absolute bottom-4 inset-x-4 bg-red-500/15 border border-red-500/30
                          text-red-200 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <div className="lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-72 lg:h-auto">
        <div className="px-4 py-3 border-b border-white/10 text-sm font-medium text-white/70">
          Live chat
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {messages.length === 0 && <p className="text-sm text-white/35">Say hello.</p>}
          {messages.map((m) => (
            <div key={m.id} className="text-sm leading-snug">
              <span className="text-white/45">
                {m.sender_id === user?.id ? 'You' : m.sender_id.slice(0, 8)}
              </span>{' '}
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
