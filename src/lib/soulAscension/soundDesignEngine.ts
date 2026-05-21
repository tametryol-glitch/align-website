/**
 * soundDesignEngine — defines ambient sound cues, event sound effects,
 * and music states for the Soul Ascension game.
 *
 * This engine provides the sound configuration data and playback
 * utilities. Actual audio files are bundled as assets.
 *
 * Sound categories:
 * - ambient: background atmosphere (loops)
 * - sfx: one-shot sound effects for events
 * - music: dynamic music layers that shift with mood
 */

export type SoundCategory = 'ambient' | 'sfx' | 'music';

export interface SoundCue {
  id: string;
  name: string;
  category: SoundCategory;
  /** Relative asset path (from assets/audio/) */
  assetKey: string;
  /** 0.0 to 1.0 */
  volume: number;
  /** Whether this sound loops */
  loop: boolean;
  /** Fade in duration in ms */
  fadeInMs: number;
  /** Fade out duration in ms */
  fadeOutMs: number;
}

export type GameSoundEvent =
  | 'chapter_start'
  | 'choice_made'
  | 'choice_purpose'
  | 'choice_shadow'
  | 'choice_risk'
  | 'choice_comfort'
  | 'score_up'
  | 'score_down'
  | 'boss_appear'
  | 'boss_victory'
  | 'boss_defeat'
  | 'npc_appear'
  | 'relic_unlock'
  | 'prophecy_unlock'
  | 'reincarnation'
  | 'soul_review'
  | 'level_up'
  | 'seasonal_event'
  | 'daily_challenge_complete'
  | 'streak_milestone'
  | 'typewriter_tick';

/**
 * Sound cue registry — maps game events to their audio configuration.
 * Asset keys are placeholders until real audio files are added.
 */
export const SOUND_CUES: Record<GameSoundEvent, SoundCue> = {
  chapter_start: {
    id: 'snd-chapter-start',
    name: 'Chapter Begin',
    category: 'sfx',
    assetKey: 'chapter_start.mp3',
    volume: 0.7,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  choice_made: {
    id: 'snd-choice-made',
    name: 'Choice Confirmed',
    category: 'sfx',
    assetKey: 'choice_confirm.mp3',
    volume: 0.6,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  choice_purpose: {
    id: 'snd-choice-purpose',
    name: 'Purpose Path Chosen',
    category: 'sfx',
    assetKey: 'choice_purpose.mp3',
    volume: 0.5,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  choice_shadow: {
    id: 'snd-choice-shadow',
    name: 'Shadow Path Chosen',
    category: 'sfx',
    assetKey: 'choice_shadow.mp3',
    volume: 0.5,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  choice_risk: {
    id: 'snd-choice-risk',
    name: 'Risk Path Chosen',
    category: 'sfx',
    assetKey: 'choice_risk.mp3',
    volume: 0.5,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  choice_comfort: {
    id: 'snd-choice-comfort',
    name: 'Comfort Path Chosen',
    category: 'sfx',
    assetKey: 'choice_comfort.mp3',
    volume: 0.5,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  score_up: {
    id: 'snd-score-up',
    name: 'Score Increase',
    category: 'sfx',
    assetKey: 'score_up.mp3',
    volume: 0.4,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  score_down: {
    id: 'snd-score-down',
    name: 'Score Decrease',
    category: 'sfx',
    assetKey: 'score_down.mp3',
    volume: 0.4,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  boss_appear: {
    id: 'snd-boss-appear',
    name: 'Boss Emergence',
    category: 'sfx',
    assetKey: 'boss_appear.mp3',
    volume: 0.8,
    loop: false,
    fadeInMs: 200,
    fadeOutMs: 0,
  },
  boss_victory: {
    id: 'snd-boss-victory',
    name: 'Boss Defeated',
    category: 'sfx',
    assetKey: 'boss_victory.mp3',
    volume: 0.7,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  boss_defeat: {
    id: 'snd-boss-defeat',
    name: 'Boss Lost',
    category: 'sfx',
    assetKey: 'boss_defeat.mp3',
    volume: 0.6,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  npc_appear: {
    id: 'snd-npc-appear',
    name: 'NPC Speaks',
    category: 'sfx',
    assetKey: 'npc_appear.mp3',
    volume: 0.5,
    loop: false,
    fadeInMs: 100,
    fadeOutMs: 0,
  },
  relic_unlock: {
    id: 'snd-relic-unlock',
    name: 'Relic Discovered',
    category: 'sfx',
    assetKey: 'relic_unlock.mp3',
    volume: 0.7,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  prophecy_unlock: {
    id: 'snd-prophecy-unlock',
    name: 'Prophecy Revealed',
    category: 'sfx',
    assetKey: 'prophecy_unlock.mp3',
    volume: 0.6,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  reincarnation: {
    id: 'snd-reincarnation',
    name: 'Reincarnation',
    category: 'sfx',
    assetKey: 'reincarnation.mp3',
    volume: 0.8,
    loop: false,
    fadeInMs: 500,
    fadeOutMs: 1000,
  },
  soul_review: {
    id: 'snd-soul-review',
    name: 'Soul Review',
    category: 'music',
    assetKey: 'soul_review_theme.mp3',
    volume: 0.35,
    loop: true,
    fadeInMs: 2000,
    fadeOutMs: 1500,
  },
  level_up: {
    id: 'snd-level-up',
    name: 'Ascension Level Up',
    category: 'sfx',
    assetKey: 'level_up.mp3',
    volume: 0.8,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  seasonal_event: {
    id: 'snd-seasonal',
    name: 'Seasonal Event Active',
    category: 'sfx',
    assetKey: 'seasonal_event.mp3',
    volume: 0.5,
    loop: false,
    fadeInMs: 300,
    fadeOutMs: 0,
  },
  daily_challenge_complete: {
    id: 'snd-daily-complete',
    name: 'Daily Challenge Done',
    category: 'sfx',
    assetKey: 'daily_complete.mp3',
    volume: 0.6,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  streak_milestone: {
    id: 'snd-streak',
    name: 'Streak Milestone',
    category: 'sfx',
    assetKey: 'streak_milestone.mp3',
    volume: 0.7,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
  typewriter_tick: {
    id: 'snd-typewriter',
    name: 'Typewriter Tick',
    category: 'sfx',
    assetKey: 'typewriter_tick.mp3',
    volume: 0.15,
    loop: false,
    fadeInMs: 0,
    fadeOutMs: 0,
  },
};

/**
 * Ambient atmosphere presets for different game moods.
 */
export interface AmbientPreset {
  id: string;
  name: string;
  /** Asset keys to layer together */
  layers: Array<{ assetKey: string; volume: number }>;
  fadeInMs: number;
  fadeOutMs: number;
}

export const AMBIENT_PRESETS: Record<string, AmbientPreset> = {
  mystical: {
    id: 'amb-mystical',
    name: 'Mystical Realm',
    layers: [
      { assetKey: 'ambient_cosmic_hum.mp3', volume: 0.2 },
      { assetKey: 'ambient_wind_chimes.mp3', volume: 0.12 },
    ],
    fadeInMs: 3000,
    fadeOutMs: 2000,
  },
  shadow: {
    id: 'amb-shadow',
    name: 'Shadow Depths',
    layers: [
      { assetKey: 'ambient_dark_drone.mp3', volume: 0.25 },
      { assetKey: 'ambient_heartbeat.mp3', volume: 0.08 },
    ],
    fadeInMs: 2000,
    fadeOutMs: 1500,
  },
  celestial: {
    id: 'amb-celestial',
    name: 'Celestial Heights',
    layers: [
      { assetKey: 'ambient_choir_pad.mp3', volume: 0.18 },
      { assetKey: 'ambient_crystal_bells.mp3', volume: 0.1 },
    ],
    fadeInMs: 2500,
    fadeOutMs: 2000,
  },
  storm: {
    id: 'amb-storm',
    name: 'Tempest',
    layers: [
      { assetKey: 'ambient_thunder_distant.mp3', volume: 0.22 },
      { assetKey: 'ambient_rain_light.mp3', volume: 0.15 },
    ],
    fadeInMs: 1500,
    fadeOutMs: 1000,
  },
  sanctuary: {
    id: 'amb-sanctuary',
    name: 'Sanctuary',
    layers: [
      { assetKey: 'ambient_fire_crackle.mp3', volume: 0.2 },
      { assetKey: 'ambient_soft_strings.mp3', volume: 0.12 },
    ],
    fadeInMs: 2000,
    fadeOutMs: 1500,
  },
};

/**
 * Map a choice path to its appropriate ambient preset.
 */
export function getAmbientForPath(path: string): AmbientPreset {
  switch (path) {
    case 'shadow': return AMBIENT_PRESETS.shadow;
    case 'purpose': return AMBIENT_PRESETS.celestial;
    case 'risk': return AMBIENT_PRESETS.storm;
    case 'comfort': return AMBIENT_PRESETS.sanctuary;
    default: return AMBIENT_PRESETS.mystical;
  }
}

/**
 * Sound settings stored per-player.
 */
export interface SoundSettings {
  masterVolume: number; // 0.0 to 1.0
  sfxEnabled: boolean;
  musicEnabled: boolean;
  ambientEnabled: boolean;
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  masterVolume: 0.7,
  sfxEnabled: true,
  musicEnabled: true,
  ambientEnabled: true,
};

/**
 * Calculate the effective volume for a sound cue given player settings.
 */
export function getEffectiveVolume(cue: SoundCue, settings: SoundSettings): number {
  if (cue.category === 'sfx' && !settings.sfxEnabled) return 0;
  if (cue.category === 'music' && !settings.musicEnabled) return 0;
  if (cue.category === 'ambient' && !settings.ambientEnabled) return 0;
  return cue.volume * settings.masterVolume;
}
