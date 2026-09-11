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
import {
  LiveStageCompositor,
  DEFAULT_STAGE,
  type LiveBackgroundOptions,
  type LiveStageOptions,
} from '@/lib/liveBackground';
import {
  LiveAudioMixer,
  DEFAULT_AUDIO_LEVELS,
  type LiveAudioLevels,
} from '@/lib/liveAudio';

// ── Types ──────────────────────────────────────────────────────────

export type LiveStatus = 'scheduled' | 'live' | 'ended' | 'failed' | 'removed';
export type LiveVisibility = 'public' | 'followers' | 'private';
// 'guest' is a publisher the host has put on stage. The server
// decides whether that claim is true; this type only says the word
// is sayable.
export type LiveRole = 'host' | 'guest' | 'audience';

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
  /** Who is watching right now, as opposed to the peak. */
  current_viewers: number;
  messages_count: number;
  hearts_count: number;
}

export interface LiveAuthor {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface LiveMessage {
  id: string;
  session_id: string;
  sender_id: string;
  body: string;
  kind: 'chat' | 'join' | 'gift' | 'system' | 'pinned' | 'milestone';
  is_pinned: boolean;
  created_at: string;
  reply_to_id?: string | null;
  hearts_count?: number;
  // Present on history loaded via the join; absent on realtime inserts.
  profile?: { display_name: string | null; avatar_url: string | null } | null;
  // Resolved client-side from the message already in view, so a reply
  // costs no extra query when its parent is on screen.
  reply_to_body?: string | null;
  reply_to_name?: string | null;
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

export async function sendLiveMessage(
  sessionId: string,
  body: string,
  replyToId?: string | null,
): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed) return;

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Sign in to join the conversation.');

  const { error } = await supabase.from('live_messages').insert({
    session_id: sessionId,
    sender_id: auth.user.id,
    // Mention markup inflates length well past what the sender typed,
    // which is why the column allows 2000 rather than 500.
    body: trimmed.slice(0, 2000),
    kind: 'chat',
    reply_to_id: replyToId ?? null,
  });
  if (error) throw new Error(error.message);
}

/**
 * Heart or un-heart a single message. Returns the new state.
 *
 * A comment heart is a toggle owned by one person, unlike the stream
 * hearts which are a running tally anyone can add to.
 */
export async function toggleMessageHeart(
  messageId: string,
  hearted: boolean,
): Promise<boolean> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Sign in to react.');

  if (hearted) {
    const { error } = await supabase
      .from('live_message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', auth.user.id);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase
    .from('live_message_reactions')
    .insert({ message_id: messageId, user_id: auth.user.id });
  // A double-tap racing itself is not an error worth surfacing.
  if (error && !error.message.includes('duplicate')) throw new Error(error.message);
  return true;
}

/** Which of these messages the current user has already hearted. */
export async function loadMyMessageHearts(messageIds: string[]): Promise<Set<string>> {
  if (messageIds.length === 0) return new Set();
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Set();

  const { data } = await supabase
    .from('live_message_reactions')
    .select('message_id')
    .eq('user_id', auth.user.id)
    .in('message_id', messageIds.slice(0, 200));

  return new Set((data || []).map((r: any) => r.message_id));
}

export async function loadRecentMessages(sessionId: string, limit = 50): Promise<LiveMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('live_messages')
    .select('*, profile:profiles!live_messages_sender_id_fkey(display_name, avatar_url)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  // Query descending for the index, render ascending.
  const rows = ((data as LiveMessage[]) || []).reverse();
  return attachReplyContext(rows);
}

/**
 * Resolve display names for chat authors.
 *
 * Realtime INSERT payloads carry the raw row and nothing else — no
 * joins — so a message arriving over the socket has no author attached.
 * Callers keep a cache and ask for the ids they have not seen yet;
 * without this, live chat renders raw UUID fragments at people.
 */
export async function fetchLiveAuthors(ids: string[]): Promise<Record<string, LiveAuthor>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return {};

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', unique);

  if (error) return {};

  const map: Record<string, LiveAuthor> = {};
  for (const row of (data as LiveAuthor[]) || []) map[row.id] = row;
  return map;
}

/** Best display name for a chat line, falling back only as a last resort. */
export function authorName(
  msg: LiveMessage,
  authors: Record<string, LiveAuthor>,
  selfId?: string | null,
): string {
  if (selfId && msg.sender_id === selfId) return 'You';
  return (
    msg.profile?.display_name ||
    authors[msg.sender_id]?.display_name ||
    'Guest'
  );
}

/**
 * Send hearts.
 *
 * Taps are batched by the caller and the server ignores anything faster
 * than roughly once a second, so a held-down button costs one round trip
 * per second rather than one per tap. Returns the stream's running total.
 */
export async function sendLiveHearts(sessionId: string, count: number): Promise<number | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('live_react', {
    p_session_id: sessionId,
    p_count: Math.max(1, Math.min(30, Math.round(count))),
    p_emoji: '❤️',
  });
  // A dropped heart is never worth an error in front of the viewer.
  if (error) return null;
  return typeof data === 'number' ? data : null;
}

/** Pin or unpin a message. Host only, enforced by RLS. */
export async function setLiveMessagePinned(
  sessionId: string,
  messageId: string,
  pinned: boolean,
): Promise<void> {
  const supabase = createClient();
  // Only one pinned message at a time, or the banner becomes a second
  // chat log.
  if (pinned) {
    await supabase
      .from('live_messages')
      .update({ is_pinned: false })
      .eq('session_id', sessionId)
      .eq('is_pinned', true);
  }
  const { error } = await supabase
    .from('live_messages')
    .update({ is_pinned: pinned })
    .eq('id', messageId);
  if (error) throw new Error(error.message);
}

/** The currently pinned message, if any. */
export async function getPinnedMessage(sessionId: string): Promise<LiveMessage | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('live_messages')
    .select('*, profile:profiles!live_messages_sender_id_fkey(display_name, avatar_url)')
    .eq('session_id', sessionId)
    .eq('is_pinned', true)
    .limit(1)
    .maybeSingle();
  return (data as LiveMessage) || null;
}

/**
 * Fill in what each reply was replying to, from the messages already
 * loaded. Replies to something scrolled out of history simply show no
 * quote rather than costing a query per message.
 */
export function attachReplyContext(rows: LiveMessage[]): LiveMessage[] {
  const byId = new Map(rows.map((m) => [m.id, m]));
  return rows.map((m) => {
    if (!m.reply_to_id) return m;
    const parent = byId.get(m.reply_to_id);
    if (!parent) return m;
    return {
      ...m,
      reply_to_body: parent.body.slice(0, 80),
      reply_to_name: parent.profile?.display_name || null,
    };
  });
}

/** Subscribe to new chat messages. Returns an unsubscribe function. */
export function subscribeLiveMessages(
  sessionId: string,
  onMessage: (msg: LiveMessage) => void,
  /**
   * Row changes to messages already on screen: hearts_count (kept by a
   * trigger), hiding and pinning.
   *
   * Without this every client saw only its own optimistic heart, so a
   * comment five people hearted read "1" to each of them.
   */
  onUpdate?: (msg: LiveMessage) => void,
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
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload: any) => onUpdate?.(payload.new as LiveMessage),
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

// ── Devices ────────────────────────────────────────────────────────

/**
 * Cameras and microphones available to this browser.
 *
 * Labels are empty until the user has granted permission at least once,
 * which is why this is worth calling again after the first publish —
 * before then the picker can only offer "Camera 1", "Camera 2".
 */
export async function listMediaDevices(): Promise<LiveDevices> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return { cameras: [], microphones: [] };
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  const pick = (kind: MediaDeviceKind, fallback: string) =>
    devices
      .filter((d) => d.kind === kind && d.deviceId)
      .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `${fallback} ${i + 1}` }));

  return {
    cameras: pick('videoinput', 'Camera'),
    microphones: pick('audioinput', 'Microphone'),
  };
}

/**
 * Ask for camera and mic once so device labels become readable.
 * Returns false if the user declined — the caller should say so rather
 * than presenting an empty picker as if nothing were connected.
 */
export async function primeDevicePermissions(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

// ── Cover image ────────────────────────────────────────────────────

/** Upload a stream thumbnail. Shares the public post-media bucket. */
export async function uploadLiveCover(file: File): Promise<string> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You must be signed in.');

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `live-covers/${auth.user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('post-media').getPublicUrl(path);
  return data.publicUrl;
}

/** Update a session's cover after creation. */
export async function setLiveCover(sessionId: string, coverUrl: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('live_sessions')
    .update({ cover_url: coverUrl, updated_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) throw new Error(error.message);
}

// ── Agora clients ──────────────────────────────────────────────────

export interface MediaDeviceOption {
  deviceId: string;
  label: string;
}

export interface LiveDevices {
  cameras: MediaDeviceOption[];
  microphones: MediaDeviceOption[];
}

export interface LiveHostOptions {
  cameraId?: string | null;
  microphoneId?: string | null;
  background?: LiveBackgroundOptions;
}

export type SecondarySourceKind = 'camera' | 'screen';

export interface LiveHostClient {
  start(sessionId: string): Promise<void>;
  stop(): Promise<void>;
  /**
   * The guest's camera, once the host has put someone on stage.
   *
   * The host client is otherwise publish-only -- it subscribes to
   * nobody, because in an ordinary broadcast there is nobody to
   * subscribe to. Their audio plays automatically; only the video needs
   * somewhere to go.
   */
  onGuestVideoChanged(cb: (track: any | null) => void): void;
  toggleMute(): boolean;
  toggleCamera(): Promise<boolean>;
  switchCamera(): Promise<void>;
  /** Switch to a specific camera mid-broadcast. */
  setCamera(deviceId: string): Promise<void>;
  /** Switch to a specific microphone mid-broadcast. */
  setMicrophone(deviceId: string): Promise<void>;
  /** Change or clear the background without interrupting the stream. */
  setBackground(options: LiveBackgroundOptions): Promise<void>;
  /**
   * Add a second view — another camera, or a shared screen. Both are
   * composited into the one published track, so a second source costs
   * the audience nothing extra.
   */
  addSecondarySource(kind: SecondarySourceKind, deviceId?: string): Promise<void>;
  removeSecondarySource(): Promise<void>;
  hasSecondarySource(): boolean;
  /** Layout, inset size, split ratio, corner, and which source leads. */
  setStage(options: Partial<LiveStageOptions>): Promise<void>;
  getStage(): LiveStageOptions;
  /**
   * Whether the shared screen actually supplied an audio track. False
   * when the host forgot to tick "share audio" in the browser picker,
   * which is the usual reason viewers hear nothing from a video.
   */
  hasScreenAudio(): boolean;
  /** Balance the host's voice against the shared video's audio. */
  setAudioLevels(levels: Partial<LiveAudioLevels>): Promise<void>;
  getAudioLevels(): LiveAudioLevels;
  getLocalVideoTrack(): any | null;
  onError(cb: (message: string) => void): void;
  /**
   * Fired whenever the published video track is replaced. The local
   * preview is bound to a specific track object, so without this it
   * keeps rendering a track that is no longer being published.
   */
  onVideoTrackChanged(cb: (track: any | null) => void): void;
}

export interface LiveViewerClient {
  watch(sessionId: string): Promise<void>;
  stop(): Promise<void>;
  /** `source` says whose stream it is. With a guest on stage there are two. */
  onRemoteVideoChanged(cb: (track: any | null, source: 'host' | 'guest') => void): void;
  onHostLeft(cb: () => void): void;
  onError(cb: (message: string) => void): void;

  /**
   * Go on stage.
   *
   * This rejoins the channel rather than switching role in place: the
   * Agora uid is fixed at join time, and a guest has to arrive as
   * LIVE_UID_GUEST for anyone to tell their stream from the host's.
   * The cost is a second of black while the swap happens.
   */
  goOnStage(sessionId: string, withVideo: boolean): Promise<void>;
  /** Step down and return to being an ordinary viewer. */
  leaveStage(sessionId: string): Promise<void>;
  /** The guest's own preview, so they can see what they are publishing. */
  onLocalVideoChanged(cb: (track: any | null) => void): void;
  setStageMuted(muted: boolean): void;
  setStageCameraOff(off: boolean): void;
}

/**
 * Host client — publishes one camera + mic stream into a live channel.
 */
export async function createLiveHostClient(
  opts: LiveHostOptions = {},
): Promise<LiveHostClient> {
  const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

  // 'live' mode, not 'rtc'. In live mode Agora optimises for one-to-many
  // and only a client with the host role is permitted to publish.
  const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

  let guestVideoCb: ((t: any | null) => void) | null = null;

  // Subscribe to the guest, and only the guest. Publisher uids are
  // fixed server-side so this is a reliable test; anything else in the
  // channel is audience and has nothing to publish.
  client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
    if (Number(user?.uid) !== LIVE_UID_GUEST) return;
    try {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio') user.audioTrack?.play();
      else guestVideoCb?.(user.videoTrack || null);
    } catch {
      /* the host can take them off stage if this persists */
    }
  });

  client.on('user-unpublished', (user: any, mediaType: 'audio' | 'video') => {
    if (Number(user?.uid) === LIVE_UID_GUEST && mediaType === 'video') {
      guestVideoCb?.(null);
    }
  });

  client.on('user-left', (user: any) => {
    if (Number(user?.uid) === LIVE_UID_GUEST) guestVideoCb?.(null);
  });

  // Agora tokens expire. Without renewal the host is cut off at the
  // token TTL mid-sentence, with no warning and no way to recover — the
  // SDK fires this ~30s before expiry precisely so it never happens.
  client.on('token-privilege-will-expire', async () => {
    if (!currentSessionId) return;
    try {
      const t = await fetchLiveToken(currentSessionId, 'host');
      await client.renewToken(t.token);
    } catch {
      errorCb?.('Could not renew the streaming credential — the broadcast may end shortly.');
    }
  });

  let audioTrack: any = null;
  // The raw camera. When a background is active this is NOT what gets
  // published — it feeds the processor instead.
  let cameraTrack: any = null;
  // What is actually published: either cameraTrack, or a custom track
  // carrying the processed canvas.
  let publishedVideo: any = null;
  let processor: LiveStageCompositor | null = null;
  // Held so it can be stopped on teardown; a shared screen keeps the
  // browser's "you are sharing" bar up until its track is stopped.
  let secondaryTrack: MediaStreamTrack | null = null;
  // Audio from the shared screen, when the host allowed it.
  let screenAudioTrack: MediaStreamTrack | null = null;
  let mixer: LiveAudioMixer | null = null;
  // What is actually published: the plain mic, or the mixer's output.
  let publishedAudio: any = null;
  let audioLevels: LiveAudioLevels = { ...DEFAULT_AUDIO_LEVELS };

  let errorCb: ((m: string) => void) | null = null;
  let videoChangedCb: ((track: any | null) => void) | null = null;
  let currentSessionId: string | null = null;
  let stage: LiveStageOptions = {
    ...DEFAULT_STAGE,
    background: opts.background ?? { mode: 'none' },
  };

  /** Compositing is needed for a background OR a second source. */
  function needsCompositor(): boolean {
    return stage.background.mode !== 'none' || secondaryTrack !== null;
  }

  /** Mixing is only needed once there is a second audio source. */
  function needsMixer(): boolean {
    return screenAudioTrack !== null;
  }

  /**
   * Swap the published audio track when the shape changes - plain mic to
   * mixed, or back. Kept separate from the video republish so a layout
   * change never disturbs the audio, and vice versa.
   */
  async function republishAudio(): Promise<void> {
    if (!audioTrack) return;
    const previous = publishedAudio;

    let next: any;
    if (needsMixer()) {
      if (!mixer) {
        mixer = new LiveAudioMixer(audioTrack.getMediaStreamTrack(), audioLevels);
        await mixer.start();
      }
      mixer.setScreenTrack(screenAudioTrack);
      const mixed = mixer.outputTrack;
      next = mixed
        ? AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: mixed })
        : audioTrack;
    } else {
      mixer?.stop();
      mixer = null;
      next = audioTrack;
    }

    if (previous === next) return;
    if (previous) await client.unpublish([previous]);
    if (previous && previous !== audioTrack) {
      previous.stop();
      previous.close();
    }
    publishedAudio = next;
    if (publishedAudio) await client.publish([publishedAudio]);
  }

  const encoderConfig = {
    width: { ideal: MAX_PUBLISH_WIDTH, max: MAX_PUBLISH_WIDTH },
    height: { ideal: MAX_PUBLISH_HEIGHT, max: MAX_PUBLISH_HEIGHT },
    frameRate: PUBLISH_FRAMERATE,
    bitrateMax: PUBLISH_BITRATE_KBPS,
  };

  /**
   * Build the track to publish from the current camera + background.
   * Falls back to the plain camera if processing cannot start, because a
   * missing background is a cosmetic loss and a dead stream is not.
   */
  async function buildVideoTrack(): Promise<any> {
    if (!cameraTrack) return null;
    if (!needsCompositor()) return cameraTrack;

    try {
      processor?.stop();
      processor = new LiveStageCompositor(cameraTrack.getMediaStreamTrack(), stage);
      if (secondaryTrack) await processor.setSecondary(secondaryTrack);
      const processed = await processor.start();
      return AgoraRTC.createCustomVideoTrack({
        mediaStreamTrack: processed,
        bitrateMax: PUBLISH_BITRATE_KBPS,
      });
    } catch (err: any) {
      processor?.stop();
      processor = null;
      errorCb?.(`Effects unavailable: ${err?.message || 'not supported here'}`);
      return cameraTrack;
    }
  }

  /**
   * Swap the published video track in place. Needed whenever the
   * pipeline shape changes - plain camera to composited or back - which
   * is the only time a republish is unavoidable.
   */
  async function republishVideo(): Promise<void> {
    if (!cameraTrack) return;
    const previous = publishedVideo;
    const rebuilt = await buildVideoTrack();

    if (previous) await client.unpublish([previous]);
    if (previous && previous !== cameraTrack) {
      previous.stop();
      previous.close();
    }
    if (!needsCompositor()) {
      processor?.stop();
      processor = null;
    }
    publishedVideo = rebuilt;
    if (publishedVideo) await client.publish([publishedVideo]);
    // The preview holds the previous track object; tell it to re-bind.
    videoChangedCb?.(publishedVideo);
  }

  async function attachSecondary(
    kind: SecondarySourceKind,
    deviceId: string | undefined,
    onEnded: () => void,
  ): Promise<boolean> {
    try {
      if (kind === 'screen') {
        // audio:true is what lets viewers hear a shared video. The host
        // still has to tick "share audio" in the browser's own picker;
        // if they do not, getAudioTracks() is simply empty.
        const display = await (navigator.mediaDevices as any).getDisplayMedia({
          video: { frameRate: PUBLISH_FRAMERATE },
          audio: {
            // Leave the media untouched - these are tuned for speech and
            // would chew up music.
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        secondaryTrack = display.getVideoTracks()[0] ?? null;
        screenAudioTrack = display.getAudioTracks()[0] ?? null;
        screenAudioTrack?.addEventListener('ended', () => {
          screenAudioTrack = null;
          void republishAudio();
        });
        // The browser's own "Stop sharing" button ends the track without
        // telling us, so listen for it or the layout keeps showing a
        // frozen final frame forever.
        secondaryTrack?.addEventListener('ended', onEnded);
      } else {
        const media = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false,
        });
        secondaryTrack = media.getVideoTracks()[0] ?? null;
      }
    } catch (err: any) {
      errorCb?.(
        kind === 'screen'
          ? 'Screen share was cancelled or is unavailable.'
          : 'Could not open that camera. Some machines cannot run two cameras at once.',
      );
      return false;
    }
    return secondaryTrack !== null;
  }

  /** setDevice keeps the same track object, so a processor reading from
   *  it picks up the new camera with no republish needed. */
  async function applyCamera(deviceId: string): Promise<void> {
    if (!cameraTrack) return;
    await cameraTrack.setDevice(deviceId);
    // setDevice hands back a different underlying MediaStreamTrack, so
    // a running compositor must be re-pointed at it or it keeps reading
    // the old, now-ended one and renders black.
    if (processor) {
      await processor.setPrimary(cameraTrack.getMediaStreamTrack());
    } else {
      // Not compositing: the preview is bound to the Agora track, which
      // survives setDevice - but re-announce so callers can re-attach
      // defensively.
      videoChangedCb?.(publishedVideo);
    }
  }

  async function applyStage(next: Partial<LiveStageOptions>): Promise<void> {
    const wasCompositing = needsCompositor();
    stage = { ...stage, ...next };

    // Same pipeline shape: retune the running compositor. No republish,
    // so viewers see the change without a flicker.
    if (wasCompositing && needsCompositor() && processor) {
      await processor.setOptions(stage);
      return;
    }
    await republishVideo();
  }

  async function removeSecondary(): Promise<void> {
    secondaryTrack?.stop();
    secondaryTrack = null;
    if (screenAudioTrack) {
      screenAudioTrack.stop();
      screenAudioTrack = null;
      await republishAudio();
    }
    stage = { ...stage, layout: 'solo', swapped: false };
    if (processor && needsCompositor()) {
      await processor.setSecondary(null);
      await processor.setOptions(stage);
      return;
    }
    await republishVideo();
  }

  return {
    async start(sessionId: string) {
      currentSessionId = sessionId;
      const t = await fetchLiveToken(sessionId, 'host');

      // Role must be set before join, or Agora rejects the publish.
      await client.setClientRole('host');
      await client.join(t.appId, t.channelName, t.token, t.uid || null);

      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack(
          opts.microphoneId ? { microphoneId: opts.microphoneId } : {},
        );
      } catch (err: any) {
        errorCb?.(`Microphone unavailable: ${err?.message || 'permission denied'}`);
        throw err;
      }

      try {
        cameraTrack = await AgoraRTC.createCameraVideoTrack({
          ...(opts.cameraId ? { cameraId: opts.cameraId } : {}),
          encoderConfig,
        });
      } catch (err: any) {
        // Audio-only is a legitimate fallback and costs far less than
        // video, so we keep the stream alive rather than aborting.
        errorCb?.(`Camera unavailable — going audio-only: ${err?.message || 'permission denied'}`);
      }

      publishedVideo = await buildVideoTrack();

      publishedAudio = audioTrack;
      const toPublish = [publishedAudio, publishedVideo].filter(Boolean);
      await client.publish(toPublish);
      videoChangedCb?.(publishedVideo);
    },

    onGuestVideoChanged(cb) {
      guestVideoCb = cb;
    },

    async stop() {
      try {
        processor?.stop();
        mixer?.stop();
        secondaryTrack?.stop();
        screenAudioTrack?.stop();
        if (publishedAudio && publishedAudio !== audioTrack) {
          publishedAudio.stop();
          publishedAudio.close();
        }
        audioTrack?.stop();
        audioTrack?.close();
        if (publishedVideo && publishedVideo !== cameraTrack) {
          publishedVideo.stop();
          publishedVideo.close();
        }
        cameraTrack?.stop();
        cameraTrack?.close();
        await client.leave();
      } finally {
        processor = null;
        mixer = null;
        secondaryTrack = null;
        screenAudioTrack = null;
        publishedAudio = null;
        audioTrack = null;
        cameraTrack = null;
        publishedVideo = null;
        if (currentSessionId) await leaveLive(currentSessionId);
        currentSessionId = null;
      }
    },

    toggleMute() {
      if (!audioTrack) return false;
      // While mixing, mute the voice only — silencing the shared video
      // too would look to viewers like the stream had frozen.
      if (mixer) {
        const next = !mixer.isMicMuted();
        mixer.setMicMuted(next);
        return next;
      }
      const nextMuted = audioTrack.enabled;
      audioTrack.setEnabled(!nextMuted);
      return nextMuted;
    },

    async toggleCamera() {
      if (!publishedVideo) return false;
      const nextOff = publishedVideo.enabled;
      await publishedVideo.setEnabled(!nextOff);
      return !nextOff;
    },

    async switchCamera() {
      const devices = await AgoraRTC.getCameras();
      if (devices.length < 2 || !cameraTrack) return;
      const currentLabel = cameraTrack.getTrackLabel();
      const next = devices.find((d: any) => d.label !== currentLabel) || devices[0];
      await applyCamera(next.deviceId);
    },

    async setCamera(deviceId: string) {
      await applyCamera(deviceId);
    },

    async setMicrophone(deviceId: string) {
      if (!audioTrack) return;
      await audioTrack.setDevice(deviceId);
      // setDevice acquires a new underlying track, so a running mixer
      // would otherwise keep reading the old, ended one.
      mixer?.replaceMic(audioTrack.getMediaStreamTrack());
    },

    async setBackground(next: LiveBackgroundOptions) {
      await applyStage({ background: next });
    },

    async setStage(next: Partial<LiveStageOptions>) {
      await applyStage(next);
    },

    getStage() {
      return processor ? processor.getOptions() : { ...stage };
    },

    async addSecondarySource(kind: SecondarySourceKind, deviceId?: string) {
      const ok = await attachSecondary(kind, deviceId, () => {
        void removeSecondary();
      });
      if (!ok) return;

      // Mix in the shared audio before touching the video, so sound and
      // picture arrive together rather than a beat apart.
      if (screenAudioTrack) await republishAudio();

      // Give it somewhere to show, rather than adding an invisible source.
      if (stage.layout === 'solo') stage = { ...stage, layout: 'pip' };

      if (processor) {
        await processor.setSecondary(secondaryTrack);
        await processor.setOptions(stage);
        return;
      }
      await republishVideo();
    },

    async removeSecondarySource() {
      await removeSecondary();
    },

    hasSecondarySource() {
      return secondaryTrack !== null;
    },

    hasScreenAudio() {
      return screenAudioTrack !== null;
    },

    async setAudioLevels(levels: Partial<LiveAudioLevels>) {
      audioLevels = { ...audioLevels, ...levels };
      mixer?.setLevels(audioLevels);
    },

    getAudioLevels() {
      return mixer ? mixer.getLevels() : { ...audioLevels };
    },

    getLocalVideoTrack() {
      return publishedVideo;
    },

    onError(cb) {
      errorCb = cb;
    },

    onVideoTrackChanged(cb) {
      videoChangedCb = cb;
    },
  };
}

/**
 * Viewer client — subscribes to the host's stream, publishes nothing.
 */
export async function createLiveViewerClient(): Promise<LiveViewerClient> {
  const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
  const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

  let videoCb: ((t: any | null, source: 'host' | 'guest') => void) | null = null;
  let localVideoCb: ((t: any | null) => void) | null = null;
  let hostLeftCb: (() => void) | null = null;
  let errorCb: ((m: string) => void) | null = null;
  let currentSessionId: string | null = null;

  // Publishing state, only set while this viewer is on stage.
  let onStage = false;
  let micTrack: any = null;
  let camTrack: any = null;

  /**
   * Whose stream this is.
   *
   * Publisher uids are fixed server-side precisely so this is knowable.
   * Anything else is another audience member and has nothing to show.
   */
  const sourceOf = (uid: any): 'host' | 'guest' | null => {
    const n = Number(uid);
    if (n === LIVE_UID_HOST) return 'host';
    if (n === LIVE_UID_GUEST) return 'guest';
    return null;
  };

  // Tokens expire. Without renewal every viewer is silently dropped an
  // hour into a long stream while the host carries on talking to nobody.
  client.on('token-privilege-will-expire', async () => {
    if (!currentSessionId) return;
    try {
      const t = await fetchLiveToken(currentSessionId, onStage ? 'guest' : 'audience');
      await client.renewToken(t.token);
    } catch {
      // A guest whose renewal fails has most likely been taken off
      // stage, which is not an error worth alarming them about.
      if (!onStage) errorCb?.('Lost the connection to this stream.');
    }
  });

  client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
    const source = sourceOf(user?.uid);
    if (!source) return;
    try {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      } else {
        videoCb?.(user.videoTrack || null, source);
      }
    } catch (err: any) {
      errorCb?.(err?.message || 'Could not play the stream.');
    }
  });

  client.on('user-unpublished', (user: any, mediaType: 'audio' | 'video') => {
    const source = sourceOf(user?.uid);
    if (source && mediaType === 'video') videoCb?.(null, source);
  });

  // A guest stepping down is not the broadcast ending. Before publisher
  // uids were fixed this could not be told apart, and any departure
  // would have blacked out the stream for everyone.
  client.on('user-left', (user: any) => {
    const source = sourceOf(user?.uid);
    if (!source) return;
    videoCb?.(null, source);
    if (source === 'host') hostLeftCb?.();
  });

  /** Tear down whatever this viewer is publishing. Safe to call twice. */
  const closeLocal = () => {
    try {
      micTrack?.stop();
      micTrack?.close();
      camTrack?.stop();
      camTrack?.close();
    } catch {
      /* already gone */
    }
    micTrack = null;
    camTrack = null;
    localVideoCb?.(null);
  };

  const joinAs = async (sessionId: string, role: 'audience' | 'guest') => {
    const t = await fetchLiveToken(sessionId, role);
    await client.setClientRole(role === 'guest' ? 'host' : 'audience');
    await client.join(t.appId, t.channelName, t.token, t.uid || null);
  };

  return {
    async watch(sessionId: string) {
      currentSessionId = sessionId;
      // Audience role keeps this client from ever publishing, and is
      // what puts the stream on Agora's cheaper audience billing tier.
      await joinAs(sessionId, 'audience');
      await joinLive(sessionId);
    },

    async stop() {
      try {
        closeLocal();
        onStage = false;
        await client.leave();
      } finally {
        if (currentSessionId) await leaveLive(currentSessionId);
        currentSessionId = null;
      }
    },

    async goOnStage(sessionId: string, withVideo: boolean) {
      currentSessionId = sessionId;

      // Acquire the devices BEFORE leaving the channel. If the browser
      // refuses the microphone, the viewer stays where they were rather
      // than being dropped out of a stream they were happily watching.
      micTrack = await AgoraRTC.createMicrophoneAudioTrack();
      if (withVideo) {
        try {
          camTrack = await AgoraRTC.createCameraVideoTrack({
            encoderConfig: { width: 640, height: 360, frameRate: 24 },
          });
        } catch {
          // Camera refused but the mic worked: go on as audio only
          // rather than failing the whole thing.
          camTrack = null;
        }
      }

      try {
        await client.leave();
        await joinAs(sessionId, 'guest');
        await client.publish(camTrack ? [micTrack, camTrack] : [micTrack]);
        onStage = true;
        localVideoCb?.(camTrack);
      } catch (err: any) {
        closeLocal();
        onStage = false;
        // Get back to watching rather than leaving them nowhere.
        try {
          await joinAs(sessionId, 'audience');
        } catch {
          /* the caller will surface the original failure */
        }
        throw err;
      }
    },

    async leaveStage(sessionId: string) {
      onStage = false;
      try {
        if (micTrack || camTrack) {
          await client.unpublish(
            [micTrack, camTrack].filter(Boolean) as any[],
          );
        }
      } catch {
        /* already unpublished */
      }
      closeLocal();
      await client.leave();
      await joinAs(sessionId, 'audience');
    },

    setStageMuted(muted: boolean) {
      micTrack?.setEnabled?.(!muted);
    },

    setStageCameraOff(off: boolean) {
      camTrack?.setEnabled?.(!off);
    },

    onRemoteVideoChanged(cb) {
      videoCb = cb;
    },
    onLocalVideoChanged(cb) {
      localVideoCb = cb;
    },
    onHostLeft(cb) {
      hostLeftCb = cb;
    },
    onError(cb) {
      errorCb = cb;
    },
  };
}

export interface LiveEligibility {
  eligible: boolean;
  is_founder: boolean;
  followers: number;
  signups: number;
  paid_conversions: number;
  followers_required: number;
  signups_required: number;
  paid_required: number;
}

/**
 * Whether this user may open a broadcast, and how close they are if not.
 *
 * Advisory only -- the enforceable gate is the live_sessions INSERT
 * policy, which calls the same function server-side. This exists so the
 * apps can hide an entry point that would fail, and so the numbers can
 * be shown to an affiliate working toward it.
 */
export async function getLiveEligibility(): Promise<LiveEligibility | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('live_eligibility');
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as LiveEligibility) || null;
}

// ── Guests on stage ──────────────────────────────────────────────

export interface StageEntry {
  request_id: string;
  viewer_id: string;
  display_name: string | null;
  avatar_url: string | null;
  with_video: boolean;
  status: 'pending' | 'invited' | 'live';
  requested_at: string;
}

/**
 * Agora uids for the two publishers, assigned server-side.
 *
 * Every client needs these to tell the host's stream from the guest's.
 * They must match LIVE_UID_HOST / LIVE_UID_GUEST in align-api-v2.
 */
export const LIVE_UID_HOST = 1;
export const LIVE_UID_GUEST = 2;

/** Ask the host to come on stage. The caller picks audio-only or video. */
export async function requestToJoinStage(
  sessionId: string,
  withVideo: boolean,
): Promise<{ ok: true; requestId: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('live_request_guest', {
    p_session_id: sessionId,
    p_with_video: withVideo,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, requestId: data as string };
}

/**
 * Host approves a pending request, or an invited viewer accepts.
 *
 * Both land here because both end the same way -- someone goes on
 * stage and the channel flips to interactive billing.
 */
export async function acceptStageGuest(
  requestId: string,
  withVideo?: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const { error } = await supabase.rpc('live_accept_guest', {
    p_request_id: requestId,
    p_with_video: withVideo ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Decline, withdraw, or take someone off stage. Same call for all three. */
export async function endStageGuest(
  requestId: string,
  reason?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const { error } = await supabase.rpc('live_end_guest', {
    p_request_id: requestId,
    p_reason: reason ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Who is on stage and who is waiting. RLS decides what the caller sees. */
export async function getStage(sessionId: string): Promise<StageEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('live_stage', { p_session_id: sessionId });
  if (error) return [];
  return (data as StageEntry[]) || [];
}

/**
 * Stage changes, pushed.
 *
 * Both INSERT and UPDATE matter: a host needs a new request to appear
 * without polling, and a guest needs to know the instant they are
 * approved or taken off.
 */
export function subscribeStage(sessionId: string, onChange: () => void): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`live_stage_${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'live_guest_requests',
        filter: `session_id=eq.${sessionId}`,
      },
      () => onChange(),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export interface TopHearter {
  viewer_id: string;
  count: number;
  display_name: string | null;
  avatar_url: string | null;
}

/**
 * Who is sending the most hearts in this stream.
 *
 * This is the thing hosts actually respond to — naming the people
 * carrying the room. The data already exists in live_reactions; without
 * surfacing it the host only ever sees an anonymous total.
 */
export async function getTopHearters(sessionId: string, limit = 5): Promise<TopHearter[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('live_reactions')
    .select('viewer_id, count, profile:profiles!live_reactions_viewer_id_fkey(display_name, avatar_url)')
    .eq('session_id', sessionId)
    .order('count', { ascending: false })
    .limit(limit);

  if (error) return [];
  return ((data as any[]) || []).map((r) => ({
    viewer_id: r.viewer_id,
    count: r.count ?? 0,
    display_name: r.profile?.display_name ?? null,
    avatar_url: r.profile?.avatar_url ?? null,
  }));
}
