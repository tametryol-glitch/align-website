// ═══════════════════════════════════════════════════════════════════
// Live Service — Agora broadcast wrapper for live streaming
//
// Deliberately separate from callingService.ts. That file runs the 1:1
// calling flow in Agora's 'rtc' mode, where every participant publishes.
// Live runs in 'live' mode, where exactly one participant publishes and
// everyone else subscribes, and the two cannot share a client config.
//
// Cost note: Agora bills by aggregate resolution tier, and the HD tier
// covers everything up to 921,600 pixels. 720p and 480p therefore cost
// the same, while 1080p costs 2.3x. The publish resolution is capped in
// code here rather than exposed as a setting, because a host raising it
// changes the bill for every viewer-minute of that stream.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────

export type LiveStatus = 'scheduled' | 'live' | 'ended' | 'failed' | 'removed';
export type LiveVisibility = 'public' | 'followers' | 'private';
export type LiveRole = 'host' | 'audience';

export interface LiveSession {
  id: string;
  host_id: string;
  channel_name: string;
  title: string;
  cover_url: string | null;
  category: string;
  status: LiveStatus;
  visibility: LiveVisibility;
  rtc_mode: 'broadcast' | 'interactive';
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  peak_viewers: number;
  total_viewers: number;
  messages_count: number;
  hearts_count: number;
}

export interface LiveMessage {
  id: string;
  session_id: string;
  sender_id: string;
  body: string;
  kind: 'chat' | 'join' | 'gift' | 'system' | 'pinned';
  is_pinned: boolean;
  created_at: string;
}

export interface LiveTokenResult {
  token: string;
  appId: string;
  channelName: string;
  uid: number;
  role: LiveRole;
  rtcMode: 'broadcast' | 'interactive';
  expiresAt: number;
}

// 720p. See the cost note at the top of this file before changing it.
const MAX_PUBLISH_WIDTH = 1280;
const MAX_PUBLISH_HEIGHT = 720;
const PUBLISH_FRAMERATE = 30;
const PUBLISH_BITRATE_KBPS = 1500;

// ── Token ──────────────────────────────────────────────────────────

/**
 * Fetch a role-scoped Agora token for a live session.
 *
 * Note this sends only the session id — the server resolves the channel
 * name itself and decides the Agora role from the session row, so a
 * viewer cannot request a publisher token or name a channel of its own.
 * Requires a signed-in user; the endpoint verifies the JWT properly
 * rather than decoding it unverified.
 */
export async function fetchLiveToken(
  sessionId: string,
  role: LiveRole,
  uid: number = 0,
): Promise<LiveTokenResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not set');

  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('You must be signed in to join a live stream.');

  const response = await fetch(`${apiUrl}/agora/live-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ session_id: sessionId, uid, role }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    // Surface the server's reason — "stream is not live" and "not the
    // host" are both things the UI should say out loud.
    throw new Error(`Live token request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    appId: data.app_id,
    channelName: data.channel_name,
    uid: data.uid,
    role: data.role,
    rtcMode: data.rtc_mode,
    expiresAt: data.expires_at,
  };
}

// ── Session lifecycle ──────────────────────────────────────────────

function generateChannelName(): string {
  // Server-unique via the UNIQUE constraint on live_sessions.channel_name.
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).slice(2, 18);
  return `live_${rand}`;
}

/** Create a session row in 'scheduled' state, ready for pre-live setup. */
export async function createLiveSession(opts: {
  title: string;
  category?: string;
  visibility?: LiveVisibility;
  coverUrl?: string | null;
}): Promise<LiveSession> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You must be signed in to go live.');

  const { data, error } = await supabase
    .from('live_sessions')
    .insert({
      host_id: auth.user.id,
      channel_name: generateChannelName(),
      title: opts.title?.trim() || 'Live',
      category: opts.category || 'other',
      visibility: opts.visibility || 'public',
      cover_url: opts.coverUrl ?? null,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as LiveSession;
}

/** Flip a scheduled session to live. Viewers can only join after this. */
export async function startLiveSession(sessionId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('live_sessions')
    .update({ status: 'live', started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) throw new Error(error.message);
}

/**
 * End a session. Goes through the RPC rather than a direct update so
 * open attendance rows are closed and viewer_minutes is finalised in
 * the same transaction.
 */
export async function endLiveSession(
  sessionId: string,
  reason: string = 'host_ended',
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc('live_end_session', {
    p_session_id: sessionId,
    p_reason: reason,
  });
  if (error) throw new Error(error.message);
}

export async function getLiveSession(sessionId: string): Promise<LiveSession | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as LiveSession) || null;
}

/** Everyone currently broadcasting, newest first. Powers the live rail. */
export async function listActiveLiveSessions(limit = 20): Promise<LiveSession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('status', 'live')
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as LiveSession[]) || [];
}

// ── Presence ───────────────────────────────────────────────────────

/** Idempotent: rejoining after a drop reuses the open attendance row. */
export async function joinLive(sessionId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc('live_join', { p_session_id: sessionId });
  if (error) throw new Error(error.message);
}

export async function leaveLive(sessionId: string): Promise<void> {
  const supabase = createClient();
  // Best-effort: a viewer closing the tab should not see an error, and
  // live_end_session sweeps any row this misses.
  const { error } = await supabase.rpc('live_leave', { p_session_id: sessionId });
  if (error) console.warn('[Live] leaveLive failed:', error.message);
}

// ── Chat ───────────────────────────────────────────────────────────

export async function sendLiveMessage(sessionId: string, body: string): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed) return;

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Sign in to join the conversation.');

  const { error } = await supabase.from('live_messages').insert({
    session_id: sessionId,
    sender_id: auth.user.id,
    body: trimmed.slice(0, 500),
    kind: 'chat',
  });
  if (error) throw new Error(error.message);
}

export async function loadRecentMessages(sessionId: string, limit = 50): Promise<LiveMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('live_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  // Query descending for the index, render ascending.
  return ((data as LiveMessage[]) || []).reverse();
}

/** Subscribe to new chat messages. Returns an unsubscribe function. */
export function subscribeLiveMessages(
  sessionId: string,
  onMessage: (msg: LiveMessage) => void,
): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`live_chat_${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'live_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload: any) => onMessage(payload.new as LiveMessage),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Subscribe to session-row changes — viewer counts, and the host ending. */
export function subscribeLiveSession(
  sessionId: string,
  onChange: (session: LiveSession) => void,
): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`live_session_${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload: any) => onChange(payload.new as LiveSession),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ── Agora clients ──────────────────────────────────────────────────

export interface LiveHostClient {
  start(sessionId: string): Promise<void>;
  stop(): Promise<void>;
  toggleMute(): boolean;
  toggleCamera(): Promise<boolean>;
  switchCamera(): Promise<void>;
  getLocalVideoTrack(): any | null;
  onError(cb: (message: string) => void): void;
}

export interface LiveViewerClient {
  watch(sessionId: string): Promise<void>;
  stop(): Promise<void>;
  onRemoteVideoChanged(cb: (track: any | null) => void): void;
  onHostLeft(cb: () => void): void;
  onError(cb: (message: string) => void): void;
}

/**
 * Host client — publishes one camera + mic stream into a live channel.
 */
export async function createLiveHostClient(): Promise<LiveHostClient> {
  const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

  // 'live' mode, not 'rtc'. In live mode Agora optimises for one-to-many
  // and only a client with the host role is permitted to publish.
  const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

  let audioTrack: any = null;
  let videoTrack: any = null;
  let errorCb: ((m: string) => void) | null = null;
  let currentSessionId: string | null = null;

  return {
    async start(sessionId: string) {
      currentSessionId = sessionId;
      const t = await fetchLiveToken(sessionId, 'host');

      // Role must be set before join, or Agora rejects the publish.
      await client.setClientRole('host');
      await client.join(t.appId, t.channelName, t.token, t.uid || null);

      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      } catch (err: any) {
        errorCb?.(`Microphone unavailable: ${err?.message || 'permission denied'}`);
        throw err;
      }

      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: { ideal: MAX_PUBLISH_WIDTH, max: MAX_PUBLISH_WIDTH },
            height: { ideal: MAX_PUBLISH_HEIGHT, max: MAX_PUBLISH_HEIGHT },
            frameRate: PUBLISH_FRAMERATE,
            bitrateMax: PUBLISH_BITRATE_KBPS,
          },
        });
      } catch (err: any) {
        // Audio-only is a legitimate fallback and costs far less than
        // video, so we keep the stream alive rather than aborting.
        errorCb?.(`Camera unavailable — going audio-only: ${err?.message || 'permission denied'}`);
      }

      const toPublish = [audioTrack, videoTrack].filter(Boolean);
      await client.publish(toPublish);
    },

    async stop() {
      try {
        audioTrack?.stop();
        audioTrack?.close();
        videoTrack?.stop();
        videoTrack?.close();
        await client.leave();
      } finally {
        audioTrack = null;
        videoTrack = null;
        if (currentSessionId) await leaveLive(currentSessionId);
        currentSessionId = null;
      }
    },

    toggleMute() {
      if (!audioTrack) return false;
      const nextMuted = audioTrack.enabled;
      audioTrack.setEnabled(!nextMuted);
      return nextMuted;
    },

    async toggleCamera() {
      if (!videoTrack) return false;
      const nextOff = videoTrack.enabled;
      await videoTrack.setEnabled(!nextOff);
      return !nextOff;
    },

    async switchCamera() {
      if (!videoTrack) return;
      const devices = await AgoraRTC.getCameras();
      if (devices.length < 2) return;
      const currentId = videoTrack.getTrackLabel();
      const next = devices.find((d: any) => d.label !== currentId) || devices[0];
      await videoTrack.setDevice(next.deviceId);
    },

    getLocalVideoTrack() {
      return videoTrack;
    },

    onError(cb) {
      errorCb = cb;
    },
  };
}

/**
 * Viewer client — subscribes to the host's stream, publishes nothing.
 */
export async function createLiveViewerClient(): Promise<LiveViewerClient> {
  const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
  const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

  let videoCb: ((t: any | null) => void) | null = null;
  let hostLeftCb: (() => void) | null = null;
  let errorCb: ((m: string) => void) | null = null;
  let currentSessionId: string | null = null;

  client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
    try {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      } else {
        videoCb?.(user.videoTrack || null);
      }
    } catch (err: any) {
      errorCb?.(err?.message || 'Could not play the stream.');
    }
  });

  client.on('user-unpublished', (_user: any, mediaType: 'audio' | 'video') => {
    if (mediaType === 'video') videoCb?.(null);
  });

  // In live mode only the host publishes, so a host leaving means the
  // broadcast is over even if the session row has not caught up yet.
  client.on('user-left', () => {
    videoCb?.(null);
    hostLeftCb?.();
  });

  return {
    async watch(sessionId: string) {
      currentSessionId = sessionId;
      const t = await fetchLiveToken(sessionId, 'audience');

      // Audience role keeps this client from ever publishing, and is
      // what puts the stream on Agora's cheaper audience billing tier.
      await client.setClientRole('audience');
      await client.join(t.appId, t.channelName, t.token, t.uid || null);
      await joinLive(sessionId);
    },

    async stop() {
      try {
        await client.leave();
      } finally {
        if (currentSessionId) await leaveLive(currentSessionId);
        currentSessionId = null;
      }
    },

    onRemoteVideoChanged(cb) {
      videoCb = cb;
    },
    onHostLeft(cb) {
      hostLeftCb = cb;
    },
    onError(cb) {
      errorCb = cb;
    },
  };
}
