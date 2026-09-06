// ═══════════════════════════════════════════════════════════════════
// Live audio mixer — the host's voice and shared-screen audio combined
// into one published track.
//
// Agora publishes a single audio track, so "they can hear the video and
// me at the same time" is a mixing problem, not a publishing one. Both
// sources feed a Web Audio graph whose destination becomes the track
// that gets published.
//
// Independent gain on each side matters more than it sounds: a YouTube
// video at full volume buries a speaking voice completely, and a host
// mid-broadcast has no way to fix that except in here.
//
// Browser reality: getDisplayMedia audio capture is Chromium-only in
// practice. Firefox does not offer it, Safari does not support it at
// all, and even in Chrome the user must tick "Share tab audio" / "Share
// system audio" in the picker — if they miss it there is simply no
// audio track to mix, which is why callers must check hasScreenAudio.
// ═══════════════════════════════════════════════════════════════════

export interface LiveAudioLevels {
  /** 0..1.5 — above 1 boosts, for a quiet microphone. */
  micGain: number;
  /** 0..1.5 — shared screen / video audio. */
  screenGain: number;
}

export const DEFAULT_AUDIO_LEVELS: LiveAudioLevels = {
  micGain: 1,
  // Slightly under the voice by default: the point of speaking over a
  // video is being heard over it.
  screenGain: 0.7,
};

export const GAIN_MAX = 1.5;

/**
 * Mixes the microphone with an optional screen-audio track.
 *
 * `start()` returns the track to publish. The mixer stays valid across
 * screen shares starting and stopping, so the published audio track
 * never has to be swapped once mixing is active.
 */
export class LiveAudioMixer {
  private ctx: AudioContext;
  private destination: MediaStreamAudioDestinationNode;

  private micSource: MediaStreamAudioSourceNode | null = null;
  private micGain: GainNode;
  private screenSource: MediaStreamAudioSourceNode | null = null;
  private screenGainNode: GainNode;

  private screenTrack: MediaStreamTrack | null = null;
  private levels: LiveAudioLevels;
  private micMuted = false;

  constructor(micTrack: MediaStreamTrack, levels: LiveAudioLevels = DEFAULT_AUDIO_LEVELS) {
    this.levels = { ...levels };
    const Ctor: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new Ctor();
    this.destination = this.ctx.createMediaStreamDestination();

    this.micGain = this.ctx.createGain();
    this.micGain.gain.value = this.levels.micGain;
    this.micGain.connect(this.destination);

    this.screenGainNode = this.ctx.createGain();
    this.screenGainNode.gain.value = this.levels.screenGain;
    this.screenGainNode.connect(this.destination);

    this.attachMic(micTrack);
  }

  private attachMic(track: MediaStreamTrack): void {
    this.micSource?.disconnect();
    this.micSource = this.ctx.createMediaStreamSource(new MediaStream([track]));
    this.micSource.connect(this.micGain);
  }

  /** The mixed track to publish. */
  get outputTrack(): MediaStreamTrack | null {
    return this.destination.stream.getAudioTracks()[0] ?? null;
  }

  get hasScreenAudio(): boolean {
    return this.screenTrack !== null;
  }

  async start(): Promise<MediaStreamTrack> {
    // Autoplay policy can hand back a suspended context.
    if (this.ctx.state === 'suspended') await this.ctx.resume().catch(() => {});
    const track = this.outputTrack;
    if (!track) throw new Error('Could not create a mixed audio track.');
    return track;
  }

  /** Swap the microphone, e.g. when the host picks a different input. */
  replaceMic(track: MediaStreamTrack): void {
    this.attachMic(track);
  }

  /**
   * Attach or clear the shared screen's audio. Passing null is safe at
   * any time — a screen share stopped from the browser's own bar ends
   * the track without telling us.
   */
  setScreenTrack(track: MediaStreamTrack | null): void {
    this.screenSource?.disconnect();
    this.screenSource = null;
    this.screenTrack = null;

    if (!track) return;

    this.screenTrack = track;
    this.screenSource = this.ctx.createMediaStreamSource(new MediaStream([track]));
    this.screenSource.connect(this.screenGainNode);
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {});
  }

  setLevels(next: Partial<LiveAudioLevels>): void {
    this.levels = { ...this.levels, ...next };
    // Muting is applied on top of gain so un-muting restores the level
    // the host actually chose, rather than snapping back to 1.
    this.micGain.gain.value = this.micMuted ? 0 : this.levels.micGain;
    this.screenGainNode.gain.value = this.levels.screenGain;
  }

  getLevels(): LiveAudioLevels {
    return { ...this.levels };
  }

  /**
   * Mute only the host's voice. The shared video keeps playing, which is
   * what a host wants when they step away mid-clip — muting everything
   * would look like the stream had frozen.
   */
  setMicMuted(muted: boolean): void {
    this.micMuted = muted;
    this.micGain.gain.value = muted ? 0 : this.levels.micGain;
  }

  isMicMuted(): boolean {
    return this.micMuted;
  }

  stop(): void {
    this.micSource?.disconnect();
    this.screenSource?.disconnect();
    this.micGain.disconnect();
    this.screenGainNode.disconnect();
    this.micSource = null;
    this.screenSource = null;
    this.screenTrack = null;
    void this.ctx.close().catch(() => {});
  }
}

/** Whether this browser can capture audio from a shared screen. */
export function screenAudioSupported(): boolean {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) return false;
  if (typeof (navigator.mediaDevices as any).getDisplayMedia !== 'function') return false;
  // Chromium exposes it; Firefox and Safari do not implement audio
  // capture for display media, and there is no feature query for it.
  const ua = navigator.userAgent;
  const isChromium = /Chrome|Chromium|Edg\//.test(ua) && !/Firefox/.test(ua);
  return isChromium;
}
