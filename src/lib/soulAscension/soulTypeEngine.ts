/**
 * soulTypeEngine — generates a shareable "Soul Type" result
 * based on choice history and final scores.
 *
 * Used after completing a lifetime to give the player a personality
 * archetype label they can share on social media.
 */

import type { ChoicePath, ChoiceRecord, ScoreState } from './types';

export interface SoulTypeResult {
  type: string;
  emoji: string;
  title: string;
  description: string;
  dominantPath: ChoicePath;
  /** Percentage breakdown by path */
  pathBreakdown: Record<ChoicePath, number>;
  /** Shareable one-liner */
  shareText: string;
}

interface SoulTypeTemplate {
  type: string;
  emoji: string;
  title: string;
  description: string;
  dominantPath: ChoicePath;
  condition: (paths: Record<ChoicePath, number>, scores: ScoreState) => boolean;
}

const SOUL_TYPES: SoulTypeTemplate[] = [
  {
    type: 'THE LIGHTBRINGER',
    emoji: '✨',
    title: 'The Lightbringer',
    description: 'You chose purpose above all else. Your soul burns bright with intention, illuminating paths others fear to walk. You are rare — one who faces discomfort for meaning.',
    dominantPath: 'purpose',
    condition: (p) => p.purpose >= 50,
  },
  {
    type: 'THE SHADOW WALKER',
    emoji: '🌑',
    title: 'The Shadow Walker',
    description: 'You did not run from darkness — you walked into it, eyes open. Your courage to face the shadow is what heals not just you, but every soul you touch.',
    dominantPath: 'shadow',
    condition: (p) => p.shadow >= 50,
  },
  {
    type: 'THE STORM RIDER',
    emoji: '⚡',
    title: 'The Storm Rider',
    description: 'Risk called and you answered. You chose the uncertain path, the leap of faith, the road no soul remembers. Your karmic imprint is one of fearless evolution.',
    dominantPath: 'risk',
    condition: (p) => p.risk >= 50,
  },
  {
    type: 'THE HEARTH KEEPER',
    emoji: '🏠',
    title: 'The Hearth Keeper',
    description: 'Comfort was your compass — not from weakness, but from wisdom. You understand that healing often needs warmth, not war. The soul grows in safety too.',
    dominantPath: 'comfort',
    condition: (p) => p.comfort >= 50,
  },
  {
    type: 'THE KARMIC ALCHEMIST',
    emoji: '⚗️',
    title: 'The Karmic Alchemist',
    description: 'No single path defined you — you transmuted all experience into wisdom. Shadow, comfort, risk, purpose: you sampled every flavor of karma and emerged transformed.',
    dominantPath: 'neutral',
    condition: (_, scores) => scores.karma > 30 && scores.purpose > 40,
  },
  {
    type: 'THE WOUNDED HEALER',
    emoji: '💫',
    title: 'The Wounded Healer',
    description: 'Your choices carried the weight of shadow and the light of purpose in equal measure. From your own wounds, you learned to heal. This is the rarest gift.',
    dominantPath: 'shadow',
    condition: (p) => p.shadow >= 30 && p.purpose >= 30,
  },
  {
    type: 'THE DRIFTING SOUL',
    emoji: '🌊',
    title: 'The Drifting Soul',
    description: 'You floated between paths, sampling each without committing. This is not failure — it is the soul exploring. Next lifetime, the current may pull you somewhere specific.',
    dominantPath: 'neutral',
    condition: () => true, // fallback
  },
];

function calculatePathBreakdown(history: ChoiceRecord[]): Record<ChoicePath, number> {
  const counts: Record<ChoicePath, number> = {
    comfort: 0,
    shadow: 0,
    purpose: 0,
    neutral: 0,
    risk: 0,
  };

  for (const choice of history) {
    counts[choice.path] = (counts[choice.path] || 0) + 1;
  }

  const total = history.length || 1;
  const percentages: Record<ChoicePath, number> = {
    comfort: Math.round((counts.comfort / total) * 100),
    shadow: Math.round((counts.shadow / total) * 100),
    purpose: Math.round((counts.purpose / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    risk: Math.round((counts.risk / total) * 100),
  };

  return percentages;
}

export function generateSoulType(
  choiceHistory: ChoiceRecord[],
  scores: ScoreState,
): SoulTypeResult {
  const breakdown = calculatePathBreakdown(choiceHistory);
  const template = SOUL_TYPES.find((t) => t.condition(breakdown, scores)) ?? SOUL_TYPES[SOUL_TYPES.length - 1];

  return {
    type: template.type,
    emoji: template.emoji,
    title: template.title,
    description: template.description,
    dominantPath: template.dominantPath,
    pathBreakdown: breakdown,
    shareText: `${template.emoji} I am ${template.title} — ${template.type}. My soul chose ${template.dominantPath} ${breakdown[template.dominantPath]}% of the time. What's your Soul Type? #SoulAscension #AlignApp`,
  };
}
