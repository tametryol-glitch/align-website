/**
 * dailyChallengeEngine — generates a unique daily soul challenge
 * based on the current date + player's soul profile.
 *
 * The challenge rotates at midnight UTC. Completing a challenge
 * grants bonus soulXp and a streak increment.
 */

import type { ChoicePath, SoulAscensionGameState, SoulProfile } from './types';

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  path: ChoicePath;
  xpReward: number;
}

export interface DailyChallengeState {
  currentChallenge: DailyChallenge | null;
  completedToday: boolean;
  streak: number;
  lastCompletedDate: string | null;
  totalCompleted: number;
}

const CHALLENGE_TEMPLATES: Array<{
  title: string;
  description: (profile: SoulProfile) => string;
  path: ChoicePath;
}> = [
  {
    title: 'Face the Shadow',
    description: (p) => `Acknowledge your ${p.emotionalWound} without flinching. Sit with the feeling for one full minute, then let it pass.`,
    path: 'shadow',
  },
  {
    title: 'Comfort Zone Exit',
    description: (p) => `Do the opposite of your ${p.mainTemptation} instinct today. Choose discomfort once on purpose.`,
    path: 'risk',
  },
  {
    title: 'Gift Practice',
    description: (p) => `Use your ${p.coreGift} to help someone today — even a stranger. Document how it felt.`,
    path: 'purpose',
  },
  {
    title: 'Karmic Awareness',
    description: (p) => `Notice one moment where you repeat the ${p.pastLifePattern} pattern. Pause. Choose differently.`,
    path: 'purpose',
  },
  {
    title: 'Soul Contract Check-In',
    description: (p) => `Reflect on your relationship with ${p.soulContracts[0].recurringSoulName}. What lesson appeared today?`,
    path: 'comfort',
  },
  {
    title: 'Fear Confrontation',
    description: (p) => `Your main fear is ${p.mainFear}. Do one small thing today that brings you closer to that fear.`,
    path: 'shadow',
  },
  {
    title: 'North Node Alignment',
    description: (p) => `Take one deliberate step toward ${p.futurePurpose}. It can be tiny — intention matters more than scale.`,
    path: 'purpose',
  },
  {
    title: 'Emotional Nature Observation',
    description: (p) => `Your emotional nature is ${p.emotionalNature}. Notice it three times today without judging it.`,
    path: 'neutral',
  },
  {
    title: 'Scar Healing',
    description: (p) => `Your soul scar "${p.soulScar.name}" whispers: "${p.soulScar.shadowPhrase}." Counter it with one act of self-compassion.`,
    path: 'shadow',
  },
  {
    title: 'Hidden Gift Discovery',
    description: (p) => `Your hidden gift is ${p.hiddenGift}. Find a way to express it today, even if it feels unfamiliar.`,
    path: 'risk',
  },
  {
    title: 'Strength Amplification',
    description: (p) => `Double down on one of your strengths today: ${p.strengths[0]}. Use it intentionally in a new context.`,
    path: 'purpose',
  },
  {
    title: 'Weakness Awareness',
    description: (p) => `Your weakness "${p.weaknesses[0]}" may surface today. Watch for it without self-criticism.`,
    path: 'comfort',
  },
  {
    title: 'Temptation Test',
    description: (p) => `When ${p.mainTemptation} calls, resist for 10 minutes. Notice what happens after the urge passes.`,
    path: 'shadow',
  },
  {
    title: 'Soul Archetype Embodiment',
    description: (p) => `Embody your ${p.soulArchetype} archetype fully for one hour. What decisions would that version of you make?`,
    path: 'risk',
  },
];

/** Simple deterministic hash from a string to a number */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash);
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateDailyChallenge(
  state: SoulAscensionGameState,
): DailyChallenge {
  const today = getTodayDateString();
  const seed = hashCode(`${today}:${state.chart.signature}`);
  const template = CHALLENGE_TEMPLATES[seed % CHALLENGE_TEMPLATES.length];
  const baseXp = 15;
  const streakBonus = Math.min(state.ascensionLevel * 2, 20);

  return {
    id: `dc-${today}`,
    date: today,
    title: template.title,
    description: template.description(state.profile),
    path: template.path,
    xpReward: baseXp + streakBonus,
  };
}

export function initDailyChallengeState(): DailyChallengeState {
  return {
    currentChallenge: null,
    completedToday: false,
    streak: 0,
    lastCompletedDate: null,
    totalCompleted: 0,
  };
}

export function completeDailyChallenge(
  challengeState: DailyChallengeState,
  challenge: DailyChallenge,
): DailyChallengeState {
  const today = getTodayDateString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isConsecutive = challengeState.lastCompletedDate === yesterday;

  return {
    currentChallenge: challenge,
    completedToday: true,
    streak: isConsecutive ? challengeState.streak + 1 : 1,
    lastCompletedDate: today,
    totalCompleted: challengeState.totalCompleted + 1,
  };
}
