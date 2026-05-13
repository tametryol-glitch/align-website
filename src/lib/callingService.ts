// ═══════════════════════════════════════════════════════════════════
// Calling Service — Agora Web SDK wrapper for voice and video calls
// Dynamic import of agora-rtc-sdk-ng, token fetching, track management
// ═══════════════════════════════════════════════════════════════════

const AGORA_APP_ID = '91cc0147b9524587849b7297fbfe6a95';

// ── Types ──────────────────────────────────────────────────────────

export type CallState = 'idle' | 'ringing' | 'connecting' | 'active' | 'ended';
export type CallType = 'voice' | 'video';

export interface CallClient {
  /** Join a channel, create and publish local tracks */
  join(channelName: string, token: string, uid: number): Promise<boolean>;
  /** Unpublish tracks and leave the channel */
  leave(): Promise<void>;
  /** Toggle local audio mute */
  toggleMute(): void;
  /** Check if local audio is muted */
  isMuted(): boolean;
  /** Toggle local camera on/off */
  toggleCamera(): Promise<void>;
  /** Check if local camera is enabled */
  isCameraOn(): boolean;
  /** Toggle speaker — no-op on web (always speaker) */
  toggleSpeaker(): void;
  /** Register callback for when a remote user joins */
  onRemoteUserJoined(callback: (uid: number) => void): void;
  /** Register callback for when a remote user leaves */
  onRemoteUserLeft(callback: (uid: number) => void): void;
  /** Get the local video track for rendering */
  getLocalVideoTrack(): any | null;
  /** Get the remote video track for rendering */
  getRemoteVideoTrack(): any | null;
  /** Clean up all tracks and destroy the client */
  destroy(): Promise<void>;
}

// ── Utility ────────────────────────────────────────────────────────

/**
 * Generate a deterministic channel name from two user IDs.
 * Sorts alphabetically, hashes to a short string. Must match the
 * mobile app's callingService.generateChannelName exactly.
 */
export function generateChannelName(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  const combined = sorted.join('-');
  // Simple hash to get a short channel name (mirrors mobile implementation)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `align_${Math.abs(hash).toString(36)}`;
}

// ── Token Fetching ─────────────────────────────────────────────────

/**
 * Fetch an Agora RTC token from the backend.
 *
 * @param channelName - The channel to request a token for
 * @param uid         - Numeric user ID for the Agora session
 * @returns The token string, or null on failure
 */
export async function fetchAgoraToken(
  channelName: string,
  uid: number,
): Promise<string | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.warn('[Calling] NEXT_PUBLIC_API_URL is not set');
      return null;
    }

    const response = await fetch(`${apiUrl}/agora/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_name: channelName, uid }),
    });

    if (!response.ok) {
      console.warn(`[Calling] Token fetch failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.token || data.rtc_token || null;
  } catch (err: any) {
    console.warn('[Calling] fetchAgoraToken exception:', err?.message);
    return null;
  }
}

// ── Call Client Factory ────────────────────────────────────────────

/**
 * Create a new call client instance wrapping the Agora Web SDK.
 *
 * Usage:
 *   const client = await createCallClient();
 *   const token = await fetchAgoraToken(channelName, uid);
 *   await client.join(channelName, token, uid);
 *   // ... call active ...
 *   await client.leave();
 *   await client.destroy();
 */
export function createCallClient(): CallClient {
  // Internal state — set once join() is called
  let agoraClient: any = null;
  let localAudioTrack: any = null;
  let localVideoTrack: any = null;
  let remoteVideoTrack: any = null;
  let muted = false;
  let cameraOn = false;
  let joined = false;

  // Callback holders
  let onJoinedCallback: ((uid: number) => void) | null = null;
  let onLeftCallback: ((uid: number) => void) | null = null;

  return {
    async join(channelName: string, token: string, uid: number): Promise<boolean> {
      try {
        // Dynamic import to avoid SSR issues
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

        agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

        // Register remote user event handlers
        agoraClient.on('user-published', async (user: any, mediaType: string) => {
          try {
            await agoraClient.subscribe(user, mediaType);
            if (mediaType === 'audio') {
              // Explicitly play remote audio — required by Agora Web SDK 4.x.
              // Without this, Chrome's autoplay policy silently blocks audio
              // when the subscribe happens outside a direct user-gesture context
              // (e.g. after page navigation from the global call listener).
              try {
                user.audioTrack?.play();
              } catch (audioErr: any) {
                console.warn('[Calling] Remote audio play() blocked:', audioErr?.message);
              }
            }
            if (mediaType === 'video') {
              remoteVideoTrack = user.videoTrack || null;
            }
            if (onJoinedCallback) {
              onJoinedCallback(user.uid);
            }
          } catch (err: any) {
            console.warn('[Calling] Subscribe to remote user failed:', err?.message);
          }
        });

        agoraClient.on('user-unpublished', (user: any, mediaType: string) => {
          if (mediaType === 'video') {
            remoteVideoTrack = null;
          }
          if (mediaType === 'audio') {
            try { user.audioTrack?.stop(); } catch { /* already stopped */ }
          }
        });

        agoraClient.on('user-left', (user: any) => {
          remoteVideoTrack = null;
          if (onLeftCallback) {
            onLeftCallback(user.uid);
          }
        });

        // Join the channel
        await agoraClient.join(AGORA_APP_ID, channelName, token, uid);
        joined = true;

        // Create and publish local audio track
        try {
          localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          await agoraClient.publish([localAudioTrack]);
        } catch (err: any) {
          console.warn('[Calling] Failed to create/publish audio track:', err?.message);
        }

        return true;
      } catch (err: any) {
        console.warn('[Calling] join() failed:', err?.message);
        return false;
      }
    },

    async leave(): Promise<void> {
      try {
        // Unpublish and close local tracks
        if (localAudioTrack) {
          try {
            localAudioTrack.close();
          } catch { /* already closed */ }
          localAudioTrack = null;
        }
        if (localVideoTrack) {
          try {
            localVideoTrack.close();
          } catch { /* already closed */ }
          localVideoTrack = null;
        }

        remoteVideoTrack = null;

        if (agoraClient && joined) {
          try {
            await agoraClient.leave();
          } catch { /* best effort */ }
          joined = false;
        }
      } catch (err: any) {
        console.warn('[Calling] leave() error:', err?.message);
      }
    },

    toggleMute(): void {
      try {
        if (localAudioTrack) {
          muted = !muted;
          // setMuted sends silence while keeping the track alive.
          // setEnabled stops/restarts the microphone capture entirely
          // and can silently fail on re-enable, leaving the mic stuck off.
          if (typeof localAudioTrack.setMuted === 'function') {
            localAudioTrack.setMuted(muted).catch((e: any) =>
              console.warn('[Calling] setMuted error:', e?.message)
            );
          } else {
            // Fallback for older SDK versions
            localAudioTrack.setEnabled(!muted);
          }
        }
      } catch (err: any) {
        console.warn('[Calling] toggleMute error:', err?.message);
      }
    },

    isMuted(): boolean {
      return muted;
    },

    async toggleCamera(): Promise<void> {
      try {
        if (cameraOn && localVideoTrack) {
          // Turn off camera
          try {
            await agoraClient?.unpublish([localVideoTrack]);
            localVideoTrack.close();
          } catch { /* best effort */ }
          localVideoTrack = null;
          cameraOn = false;
        } else if (!cameraOn) {
          // Turn on camera
          const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
          localVideoTrack = await AgoraRTC.createCameraVideoTrack();
          if (agoraClient && joined) {
            await agoraClient.publish([localVideoTrack]);
          }
          cameraOn = true;
        }
      } catch (err: any) {
        console.warn('[Calling] toggleCamera error:', err?.message);
      }
    },

    isCameraOn(): boolean {
      return cameraOn;
    },

    toggleSpeaker(): void {
      // No-op on web — audio always plays through speakers/headphones
    },

    onRemoteUserJoined(callback: (uid: number) => void): void {
      onJoinedCallback = callback;
    },

    onRemoteUserLeft(callback: (uid: number) => void): void {
      onLeftCallback = callback;
    },

    getLocalVideoTrack(): any | null {
      return localVideoTrack;
    },

    getRemoteVideoTrack(): any | null {
      return remoteVideoTrack;
    },

    async destroy(): Promise<void> {
      try {
        // Leave first if still joined
        if (joined) {
          await this.leave();
        }

        // Clean up client
        if (agoraClient) {
          agoraClient.removeAllListeners();
          agoraClient = null;
        }

        onJoinedCallback = null;
        onLeftCallback = null;
      } catch (err: any) {
        console.warn('[Calling] destroy() error:', err?.message);
      }
    },
  };
}
