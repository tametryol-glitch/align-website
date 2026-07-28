/**
 * Video effect overlays — the modern TikTok/CapCut "effect" layer that sits on
 * top of the color grade (grain, light leaks, vignette, chroma split, beat
 * pulse, shake). These are frame-driven CSS/transform effects rendered in the
 * Remotion composition, so preview and (Phase 4) server render match.
 */

export type EffectId =
  | 'grain'
  | 'vignette'
  | 'lightleak'
  | 'rgbsplit'
  | 'zoompulse'
  | 'shake'
  | 'glow'
  | 'dust';

export interface EffectDef {
  id: EffectId;
  name: string;
  /** Short tag shown under the chip. */
  vibe: string;
}

export const EFFECTS: EffectDef[] = [
  { id: 'grain', name: 'Film Grain', vibe: 'Analog' },
  { id: 'vignette', name: 'Vignette', vibe: 'Focus' },
  { id: 'lightleak', name: 'Light Leak', vibe: 'Warm flare' },
  { id: 'rgbsplit', name: 'RGB Split', vibe: 'Glitch' },
  { id: 'zoompulse', name: 'Zoom Pulse', vibe: 'Beat' },
  { id: 'shake', name: 'Shake', vibe: 'Energy' },
  { id: 'glow', name: 'Dream Glow', vibe: 'Soft' },
  { id: 'dust', name: 'Dust', vibe: 'Vintage' },
];

export const EFFECT_IDS = EFFECTS.map((e) => e.id);

// ── Entrance transitions ─────────────────────────────────────────────────────
export type TransitionId = 'none' | 'fade' | 'fade-black' | 'zoom' | 'slide' | 'spin' | 'glitch' | 'whip';

export const TRANSITIONS: Array<{ id: TransitionId; name: string }> = [
  { id: 'none', name: 'None' },
  { id: 'fade', name: 'Fade' },
  { id: 'fade-black', name: 'From black' },
  { id: 'zoom', name: 'Zoom' },
  { id: 'slide', name: 'Slide' },
  { id: 'spin', name: 'Spin' },
  { id: 'whip', name: 'Whip' },
  { id: 'glitch', name: 'Glitch' },
];
