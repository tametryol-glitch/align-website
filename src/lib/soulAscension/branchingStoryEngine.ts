/**
 * branchingStoryEngine — extends the chapter mission system with
 * branching narrative paths based on cumulative choices.
 *
 * After certain chapters, the story can fork based on the player's
 * dominant choice pattern. This creates replay value — different
 * paths lead to different endings, NPCs, and rewards.
 */

import type { ChoicePath, ChoiceRecord, ChapterMission } from './types';

export interface StoryBranch {
  id: string;
  name: string;
  description: string;
  requiredPath: ChoicePath;
  /** Min percentage of choices on this path to unlock */
  thresholdPercent: number;
  /** Bonus XP for staying on this branch */
  bonusXp: number;
  /** Unique dialogue flavor for this branch */
  narrativeFlavor: string;
}

export const STORY_BRANCHES: StoryBranch[] = [
  {
    id: 'branch-lightpath',
    name: 'The Luminous Path',
    description: 'Your consistent purpose-driven choices have opened a rare storyline. The Light Council summons you.',
    requiredPath: 'purpose',
    thresholdPercent: 60,
    bonusXp: 30,
    narrativeFlavor: 'The golden thread of purpose weaves through every decision you have made. The Council of Light takes notice.',
  },
  {
    id: 'branch-shadowdepth',
    name: 'The Abyss Descent',
    description: 'Your willingness to face the shadow has unlocked the deepest caverns of the soul. The Shadow Oracle awaits.',
    requiredPath: 'shadow',
    thresholdPercent: 60,
    bonusXp: 35,
    narrativeFlavor: 'Darkness recognizes courage. The Shadow Oracle has watched your descent with respect.',
  },
  {
    id: 'branch-stormpath',
    name: 'The Tempest Road',
    description: 'Risk after risk — you have earned the Storm Path. The Thunder Sage challenges you to the ultimate gamble.',
    requiredPath: 'risk',
    thresholdPercent: 60,
    bonusXp: 40,
    narrativeFlavor: 'Lightning favors the bold. The Thunder Sage salutes your reckless courage.',
  },
  {
    id: 'branch-hearthpath',
    name: 'The Sanctuary Way',
    description: 'Your choices of comfort have revealed the hidden Sanctuary — a place of deep healing most souls never find.',
    requiredPath: 'comfort',
    thresholdPercent: 60,
    bonusXp: 25,
    narrativeFlavor: 'True strength sometimes looks like rest. The Sanctuary Keeper has kept a place warm for you.',
  },
];

/**
 * Calculate the dominant path from choice history.
 */
export function getDominantPath(history: ChoiceRecord[]): { path: ChoicePath; percent: number } | null {
  if (history.length === 0) return null;

  const counts: Record<ChoicePath, number> = { comfort: 0, shadow: 0, purpose: 0, neutral: 0, risk: 0 };
  for (const record of history) {
    counts[record.path] = (counts[record.path] || 0) + 1;
  }

  let maxPath: ChoicePath = 'neutral';
  let maxCount = 0;
  for (const [path, count] of Object.entries(counts) as Array<[ChoicePath, number]>) {
    if (count > maxCount) {
      maxCount = count;
      maxPath = path;
    }
  }

  return { path: maxPath, percent: Math.round((maxCount / history.length) * 100) };
}

/**
 * Determine which story branch the player has unlocked (if any).
 */
export function getUnlockedBranch(history: ChoiceRecord[]): StoryBranch | null {
  const dominant = getDominantPath(history);
  if (!dominant) return null;

  return STORY_BRANCHES.find(
    (branch) => branch.requiredPath === dominant.path && dominant.percent >= branch.thresholdPercent,
  ) ?? null;
}

/**
 * Inject branching narrative flavor into a mission's story text.
 */
export function applyBranchFlavor(
  mission: ChapterMission,
  branch: StoryBranch | null,
): ChapterMission {
  if (!branch) return mission;

  return {
    ...mission,
    storyScene: `${branch.narrativeFlavor}\n\n${mission.storyScene}`,
  };
}
