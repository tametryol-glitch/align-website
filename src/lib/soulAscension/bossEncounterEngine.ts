/**
 * bossEncounterEngine — special high-stakes encounters at key chapters.
 *
 * Boss encounters appear at chapters 3, 5, and the final chapter.
 * They have higher stakes (bigger score swings), unique narrative,
 * and special rewards upon victory.
 */

import type { ChoicePath, ScoreState, SoulProfile } from './types';

export interface BossEncounter {
  id: string;
  name: string;
  title: string;
  description: string;
  dialogue: string;
  weakness: ChoicePath;
  /** Score multiplier for this encounter */
  stakeMultiplier: number;
  /** Chapter number where this boss appears */
  chapterTrigger: number;
  victoryReward: string;
  defeatConsequence: string;
}

/**
 * Generate boss encounters personalized to the soul profile.
 */
export function generateBossEncounters(profile: SoulProfile): BossEncounter[] {
  return [
    {
      id: 'boss-mirror',
      name: 'The Mirror Self',
      title: 'Your Shadow Twin Appears',
      description: `A perfect reflection of ${profile.avatarName} steps from the darkness — but this version chose every temptation you resisted.`,
      dialogue: `"I am you, but honest. I chose ${profile.mainTemptation} every time. And I am stronger for it. Are you?"`,
      weakness: 'shadow',
      stakeMultiplier: 2.0,
      chapterTrigger: 3,
      victoryReward: 'Shadow Integration +15, Soul Scar weakened',
      defeatConsequence: 'Shadow +20, Karma -15',
    },
    {
      id: 'boss-contract',
      name: 'The Contract Keeper',
      title: 'The Karmic Debt Collector',
      description: `A figure made of old promises and broken contracts appears. It holds the ledger of every soul contract ${profile.soulContracts[0].recurringSoulName} has ever broken.`,
      dialogue: `"Your contract with ${profile.soulContracts[0].recurringSoulName} has ${profile.soulContracts[0].status === 'healed' ? 'nearly healed' : 'festered for lifetimes'}. Pay now, or carry it forward."`,
      weakness: 'purpose',
      stakeMultiplier: 2.5,
      chapterTrigger: 5,
      victoryReward: 'Contract accelerated toward healing, Karma +20',
      defeatConsequence: 'Contract regresses, Relationship -25',
    },
    {
      id: 'boss-scar',
      name: 'The Soul Scar Incarnate',
      title: 'Your Deepest Wound Takes Form',
      description: `The soul scar "${profile.soulScar.name}" rips itself from your chest and stands before you — alive, angry, and hungry.`,
      dialogue: `"${profile.soulScar.shadowPhrase} — I have said this to you across a thousand lifetimes. You cannot kill me. You can only understand me."`,
      weakness: 'comfort',
      stakeMultiplier: 3.0,
      chapterTrigger: -1, // Final chapter (dynamic)
      victoryReward: 'Soul Scar healed, Gift Mastery +20, Ascension bonus',
      defeatConsequence: 'Soul Scar deepens, carries into next lifetime',
    },
  ];
}

/**
 * Check if the current chapter triggers a boss encounter.
 */
export function getBossForChapter(
  bosses: BossEncounter[],
  chapterNumber: number,
  totalChapters: number,
): BossEncounter | null {
  // Check for final-chapter boss first
  if (chapterNumber === totalChapters) {
    return bosses.find((b) => b.chapterTrigger === -1) ?? null;
  }
  return bosses.find((b) => b.chapterTrigger === chapterNumber) ?? null;
}

/**
 * Apply the boss stake multiplier to score effects.
 */
export function applyBossMultiplier(
  effects: Record<string, number>,
  multiplier: number,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(effects)) {
    result[key] = Math.round(value * multiplier);
  }
  return result;
}
