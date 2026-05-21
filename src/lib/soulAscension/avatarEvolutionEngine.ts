/**
 * avatarEvolutionEngine — visual avatar progression system.
 *
 * The player's soul avatar evolves visually based on:
 * - Ascension level (base form tiers)
 * - Dominant choice path (color/aura shifts)
 * - Soul scar healing progress (scar visual fading)
 * - Gift mastery (crown/halo effects)
 * - Boss victories (trophy accessories)
 * - Lifetime count (aging/wisdom marks)
 *
 * Each evolution stage modifies the avatar prompt sent to the
 * image generation API, creating a visual progression over time.
 */

import type { ChoicePath, ScoreState } from './types';

export type AvatarTier = 'nascent' | 'awakened' | 'illuminated' | 'transcendent' | 'cosmic';

export interface AvatarEvolutionState {
  /** Current evolution tier */
  tier: AvatarTier;
  /** Dominant aura color from choice path */
  auraColor: string;
  /** Aura intensity (0-100) */
  auraIntensity: number;
  /** Visual accessories earned */
  accessories: AvatarAccessory[];
  /** Scar visibility (100 = fully visible, 0 = healed) */
  scarVisibility: number;
  /** Crown/halo level from gift mastery */
  crownLevel: number;
  /** Wisdom marks from lifetime count */
  wisdomMarks: number;
  /** Overall evolution score */
  evolutionScore: number;
  /** Prompt modifiers for image generation */
  promptModifiers: string[];
}

export interface AvatarAccessory {
  id: string;
  name: string;
  description: string;
  /** How it was earned */
  source: 'boss_victory' | 'branch_unlock' | 'seasonal_reward' | 'ascension' | 'guild_tier';
  /** Visual prompt fragment */
  promptFragment: string;
  /** Rarity tier */
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * Tier thresholds based on ascension level.
 */
const TIER_THRESHOLDS: Array<{ tier: AvatarTier; minLevel: number }> = [
  { tier: 'nascent', minLevel: 0 },
  { tier: 'awakened', minLevel: 3 },
  { tier: 'illuminated', minLevel: 7 },
  { tier: 'transcendent', minLevel: 12 },
  { tier: 'cosmic', minLevel: 20 },
];

/**
 * Aura colors mapped to dominant choice paths.
 */
const PATH_AURAS: Record<ChoicePath, { color: string; description: string }> = {
  purpose: { color: '#5EE6A8', description: 'radiant emerald aura of purpose' },
  shadow: { color: '#E05D5D', description: 'deep crimson shadow aura' },
  risk: { color: '#4ECBD6', description: 'crackling electric blue storm aura' },
  comfort: { color: '#F5A623', description: 'warm golden sanctuary aura' },
  neutral: { color: '#A8B0C0', description: 'soft silver balanced aura' },
};

/**
 * Crown/halo descriptions by level.
 */
const CROWN_DESCRIPTIONS = [
  '', // level 0 — no crown
  'a faint halo of light above the head',
  'a glowing halo with gentle pulses of energy',
  'a radiant crown of woven starlight',
  'a blazing celestial crown with orbiting motes of light',
  'an ethereal cosmic crown trailing nebula-like wisps',
];

/**
 * Tier visual descriptions for prompt generation.
 */
const TIER_VISUALS: Record<AvatarTier, string> = {
  nascent: 'young soul, simple robes, uncertain gaze, faint spiritual energy',
  awakened: 'awakened soul, flowing garments, confident stance, visible spiritual energy',
  illuminated: 'illuminated being, luminous garments, peaceful expression, strong spiritual glow',
  transcendent: 'transcendent entity, ethereal form, serene presence, powerful radiance, semi-transparent edges',
  cosmic: 'cosmic being, body made of starlight, galaxies reflected in eyes, overwhelming divine presence',
};

/**
 * Determine the avatar tier from ascension level.
 */
export function getAvatarTier(ascensionLevel: number): AvatarTier {
  let result: AvatarTier = 'nascent';
  for (const threshold of TIER_THRESHOLDS) {
    if (ascensionLevel >= threshold.minLevel) {
      result = threshold.tier;
    }
  }
  return result;
}

/**
 * Calculate the full avatar evolution state from game data.
 */
export function calculateEvolution(
  ascensionLevel: number,
  lifetimeIndex: number,
  scores: ScoreState,
  dominantPath: ChoicePath,
  bossVictories: number,
  scarHealed: boolean,
): AvatarEvolutionState {
  const tier = getAvatarTier(ascensionLevel);
  const aura = PATH_AURAS[dominantPath] || PATH_AURAS.neutral;

  // Aura intensity scales with how many choices on the dominant path
  const auraIntensity = Math.min(100, ascensionLevel * 8 + scores.purpose + Math.abs(scores.karma));

  // Scar visibility decreases as it heals
  const scarVisibility = scarHealed ? 0 : Math.max(10, 100 - scores.giftMastery);

  // Crown level from gift mastery (0-5)
  const crownLevel = Math.min(5, Math.floor(scores.giftMastery / 20));

  // Wisdom marks from lifetimes (visual aging indicators)
  const wisdomMarks = Math.min(10, lifetimeIndex);

  // Build prompt modifiers
  const promptModifiers: string[] = [
    TIER_VISUALS[tier],
    aura.description,
  ];

  if (crownLevel > 0 && crownLevel < CROWN_DESCRIPTIONS.length) {
    promptModifiers.push(CROWN_DESCRIPTIONS[crownLevel]);
  }

  if (scarVisibility > 50) {
    promptModifiers.push('a visible glowing scar across the chest, pulsing with unresolved energy');
  } else if (scarVisibility > 0) {
    promptModifiers.push('a fading scar mark, nearly healed, with traces of golden light');
  }

  if (wisdomMarks >= 5) {
    promptModifiers.push('ancient knowing eyes, subtle age lines that glow with wisdom');
  } else if (wisdomMarks >= 2) {
    promptModifiers.push('eyes carrying the weight of past lives');
  }

  if (bossVictories >= 3) {
    promptModifiers.push('battle-worn armor fragments woven into spiritual garments');
  } else if (bossVictories >= 1) {
    promptModifiers.push('a small trophy charm hanging from the garments');
  }

  // Evolution score is a composite
  const evolutionScore =
    ascensionLevel * 10 +
    lifetimeIndex * 5 +
    scores.giftMastery +
    Math.max(0, scores.karma) +
    bossVictories * 15 +
    (scarHealed ? 25 : 0);

  return {
    tier,
    auraColor: aura.color,
    auraIntensity,
    accessories: [],
    scarVisibility,
    crownLevel,
    wisdomMarks,
    evolutionScore,
    promptModifiers,
  };
}

/**
 * Generate the full avatar image prompt from evolution state
 * and the base appearance description.
 */
export function buildEvolvedAvatarPrompt(
  baseAppearance: string,
  evolution: AvatarEvolutionState,
): string {
  const modifiers = evolution.promptModifiers.filter(Boolean).join(', ');
  return `${baseAppearance}. Evolution: ${modifiers}. Style: ethereal fantasy portrait, cinematic lighting, dark cosmic background with stars.`;
}

/**
 * Predefined accessories that can be earned.
 */
export const EARNABLE_ACCESSORIES: AvatarAccessory[] = [
  {
    id: 'acc-mirror-shard',
    name: 'Mirror Shard Pendant',
    description: 'Earned by defeating The Mirror Self',
    source: 'boss_victory',
    promptFragment: 'wearing a pendant made of a broken mirror reflecting shadow light',
    rarity: 'rare',
  },
  {
    id: 'acc-contract-chain',
    name: 'Contract Chain',
    description: 'Earned by defeating The Contract Keeper',
    source: 'boss_victory',
    promptFragment: 'a chain of broken contracts wrapped around one arm like armor',
    rarity: 'epic',
  },
  {
    id: 'acc-scar-crystal',
    name: 'Scar Crystal',
    description: 'Earned by defeating The Soul Scar Incarnate',
    source: 'boss_victory',
    promptFragment: 'a crystallized scar embedded in the chest, glowing with healed light',
    rarity: 'legendary',
  },
  {
    id: 'acc-light-mantle',
    name: 'Mantle of Light',
    description: 'Earned by unlocking The Luminous Path',
    source: 'branch_unlock',
    promptFragment: 'a flowing mantle of pure golden light draped over the shoulders',
    rarity: 'epic',
  },
  {
    id: 'acc-shadow-cloak',
    name: 'Cloak of Depths',
    description: 'Earned by unlocking The Abyss Descent',
    source: 'branch_unlock',
    promptFragment: 'a dark cloak with swirling shadow tendrils at the edges',
    rarity: 'epic',
  },
  {
    id: 'acc-storm-gauntlets',
    name: 'Storm Gauntlets',
    description: 'Earned by unlocking The Tempest Road',
    source: 'branch_unlock',
    promptFragment: 'gauntlets crackling with contained lightning',
    rarity: 'epic',
  },
  {
    id: 'acc-hearth-flower',
    name: 'Hearth Bloom',
    description: 'Earned by unlocking The Sanctuary Way',
    source: 'branch_unlock',
    promptFragment: 'a living flower growing from the heart, radiating warmth',
    rarity: 'epic',
  },
  {
    id: 'acc-eclipse-eye',
    name: 'Eclipse Eye',
    description: 'Earned during Eclipse Season event',
    source: 'seasonal_reward',
    promptFragment: 'one eye replaced by a miniature eclipse, dark and radiant',
    rarity: 'rare',
  },
  {
    id: 'acc-solstice-wings',
    name: 'Solstice Wings',
    description: 'Earned during Summer Solstice Festival',
    source: 'seasonal_reward',
    promptFragment: 'small wings of condensed sunlight extending from the back',
    rarity: 'rare',
  },
  {
    id: 'acc-cosmos-crown',
    name: 'Crown of the Cosmos',
    description: 'Reached Cosmic tier (Ascension Level 20)',
    source: 'ascension',
    promptFragment: 'a crown made of orbiting planets and miniature galaxies',
    rarity: 'legendary',
  },
];

/**
 * Determine which accessories the player has earned.
 */
export function getEarnedAccessories(
  bossesDefeated: string[],
  branchesUnlocked: string[],
  seasonalRewards: string[],
  ascensionLevel: number,
): AvatarAccessory[] {
  const earned: AvatarAccessory[] = [];

  for (const acc of EARNABLE_ACCESSORIES) {
    switch (acc.source) {
      case 'boss_victory':
        if (
          (acc.id === 'acc-mirror-shard' && bossesDefeated.includes('boss-mirror')) ||
          (acc.id === 'acc-contract-chain' && bossesDefeated.includes('boss-contract')) ||
          (acc.id === 'acc-scar-crystal' && bossesDefeated.includes('boss-scar'))
        ) earned.push(acc);
        break;
      case 'branch_unlock':
        if (
          (acc.id === 'acc-light-mantle' && branchesUnlocked.includes('branch-lightpath')) ||
          (acc.id === 'acc-shadow-cloak' && branchesUnlocked.includes('branch-shadowdepth')) ||
          (acc.id === 'acc-storm-gauntlets' && branchesUnlocked.includes('branch-stormpath')) ||
          (acc.id === 'acc-hearth-flower' && branchesUnlocked.includes('branch-hearthpath'))
        ) earned.push(acc);
        break;
      case 'seasonal_reward':
        if (
          (acc.id === 'acc-eclipse-eye' && seasonalRewards.includes('eclipse-season')) ||
          (acc.id === 'acc-solstice-wings' && seasonalRewards.includes('solstice-light'))
        ) earned.push(acc);
        break;
      case 'ascension':
        if (acc.id === 'acc-cosmos-crown' && ascensionLevel >= 20) earned.push(acc);
        break;
    }
  }

  return earned;
}

/**
 * Tier display info for the UI.
 */
export const TIER_DISPLAY: Record<AvatarTier, { emoji: string; label: string; color: string; description: string }> = {
  nascent: { emoji: '🌱', label: 'Nascent Soul', color: '#A8B0C0', description: 'A new soul beginning its journey' },
  awakened: { emoji: '✨', label: 'Awakened Soul', color: '#4ECBD6', description: 'The soul stirs with growing awareness' },
  illuminated: { emoji: '🌟', label: 'Illuminated Soul', color: '#5EE6A8', description: 'Light radiates from within' },
  transcendent: { emoji: '💫', label: 'Transcendent Soul', color: '#F0C15C', description: 'Beyond the boundaries of form' },
  cosmic: { emoji: '🌌', label: 'Cosmic Soul', color: '#E8D5B5', description: 'One with the universe itself' },
};
