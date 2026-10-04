// ═══════════════════════════════════════════════════════════════════
// Call tones — what you HEAR while a call is ringing (web)
//   ringback: the caller's "ring... ring..." while waiting for an answer
//   ringtone: the callee's incoming-call ring
// Synthesised with WebAudio (no asset files). The patterns match the mobile
// app's generated tones (align-app/assets/audio/ringback.wav / ringtone.wav).
// Always call stopCallTones() when the ring ends -- both loop until stopped.
//
// Browsers only let audio start after the user has interacted with the page.
// The caller always has (they clicked Call). A callee who has never clicked
// anything in this tab may get silence; installing the unlock listener at
// import time means any earlier click/keypress is enough.
// ═══════════════════════════════════════════════════════════════════

type Tone = 'ringback' | 'ringtone';

interface Burst { at: number; dur: number; freqs: number[]; gain: number }

const PATTERNS: Record<Tone, { loop: number; bursts: Burst[] }> = {
  // Classic 440 + 480 Hz, 2s on / 4s off.
  ringback: { loop: 6, bursts: [{ at: 0, dur: 2, freqs: [440, 480], gain: 0.18 }] },
  // Two quick two-tone bursts, then a pause.
  ringtone: {
    loop: 2.4,
    bursts: [
      { at: 0.0, dur: 0.38, freqs: [784, 988], gain: 0.2 },
      { at: 0.5, dur: 0.38, freqs: [784, 988], gain: 0.2 },
    ],
  },
};

let ctx: AudioContext | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let activeTone: Tone | null = null;
let liveNodes: OscillatorNode[] = [];

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch { return null; }
  }
  return ctx;
}

// Any click / key / touch before the ring unlocks audio for later.
if (typeof window !== 'undefined') {
  const unlock = () => {
    const c = getCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) =>
    window.addEventListener(e, unlock, { passive: true }),
  );
}

function scheduleLoop(c: AudioContext, tone: Tone, startAt: number) {
  const { bursts } = PATTERNS[tone];
  for (const b of bursts) {
    const t0 = startAt + b.at;
    const t1 = t0 + b.dur;
    const gain = c.createGain();
    // 20ms ramps so there is no click at the burst edges.
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(b.gain, t0 + 0.02);
    gain.gain.setValueAtTime(b.gain, t1 - 0.02);
    gain.gain.linearRampToValueAtTime(0, t1);
    gain.connect(c.destination);
    for (const f of b.freqs) {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start(t0);
      osc.stop(t1 + 0.05);
      liveNodes.push(osc);
      osc.onended = () => { liveNodes = liveNodes.filter((n) => n !== osc); };
    }
  }
}

function play(tone: Tone) {
  if (activeTone === tone) return;
  stopCallTones();
  const c = getCtx();
  if (!c) return;
  activeTone = tone;
  if (c.state === 'suspended') c.resume().catch(() => {});

  const { loop } = PATTERNS[tone];
  let nextAt = c.currentTime + 0.05;
  scheduleLoop(c, tone, nextAt);
  nextAt += loop;
  // Schedule each repetition a little ahead of time so it never gaps.
  timer = setInterval(() => {
    if (!ctx || activeTone !== tone) return;
    while (nextAt < ctx.currentTime + loop) {
      scheduleLoop(ctx, tone, nextAt);
      nextAt += loop;
    }
  }, 500);
}

export function startRingback(): void { play('ringback'); }
export function startRingtone(): void { play('ringtone'); }

export function stopCallTones(): void {
  activeTone = null;
  if (timer) { clearInterval(timer); timer = null; }
  for (const osc of liveNodes) {
    try { osc.stop(); } catch { /* already stopped */ }
  }
  liveNodes = [];
}
