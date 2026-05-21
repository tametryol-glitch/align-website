export interface JourneyLevel {
  level: number;
  name: string;
  description: string;
  daysRequired: number;
  unlockedCategories: string[];
}

export const JOURNEY_LEVELS: JourneyLevel[] = [
  {
    level: 1,
    name: 'First Impressions',
    description: 'Overall compatibility and emotional connection',
    daysRequired: 0,
    unlockedCategories: ['overall', 'emotional'],
  },
  {
    level: 2,
    name: 'Mental Connection',
    description: 'How your minds align',
    daysRequired: 3,
    unlockedCategories: ['overall', 'emotional', 'intellectual'],
  },
  {
    level: 3,
    name: 'Deeper Chemistry',
    description: 'Physical attraction and passion',
    daysRequired: 7,
    unlockedCategories: ['overall', 'emotional', 'intellectual', 'physical', 'attraction', 'passion'],
  },
  {
    level: 4,
    name: 'Long-term Potential',
    description: 'Marriage and stability indicators',
    daysRequired: 14,
    unlockedCategories: ['overall', 'emotional', 'intellectual', 'physical', 'attraction', 'passion', 'marriage', 'stability'],
  },
  {
    level: 5,
    name: 'Full Truth',
    description: 'Complete picture including challenges',
    daysRequired: 30,
    unlockedCategories: ['overall', 'emotional', 'intellectual', 'physical', 'attraction', 'passion', 'marriage', 'stability', 'toxicity', 'violence_risk', 'karmic'],
  },
];

export function getJourneyLevel(journeyStartedAt: string): JourneyLevel {
  const daysSince = Math.floor(
    (Date.now() - new Date(journeyStartedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  let current = JOURNEY_LEVELS[0];
  for (const level of JOURNEY_LEVELS) {
    if (daysSince >= level.daysRequired) {
      current = level;
    } else {
      break;
    }
  }

  return current;
}

export function getNextUnlock(journeyStartedAt: string): {
  level: JourneyLevel;
  daysUntil: number;
} | null {
  const daysSince = Math.floor(
    (Date.now() - new Date(journeyStartedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  for (const level of JOURNEY_LEVELS) {
    if (daysSince < level.daysRequired) {
      return {
        level,
        daysUntil: level.daysRequired - daysSince,
      };
    }
  }

  return null;
}

export function isCategoryUnlocked(
  category: string,
  journeyStartedAt: string,
): boolean {
  const current = getJourneyLevel(journeyStartedAt);
  return current.unlockedCategories.includes(category.toLowerCase());
}

export function getJourneyProgress(journeyStartedAt: string): {
  currentLevel: JourneyLevel;
  nextLevel: JourneyLevel | null;
  daysUntilNext: number;
  progressPercent: number;
} {
  const current = getJourneyLevel(journeyStartedAt);
  const next = getNextUnlock(journeyStartedAt);
  const daysSince = Math.floor(
    (Date.now() - new Date(journeyStartedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (!next) {
    return {
      currentLevel: current,
      nextLevel: null,
      daysUntilNext: 0,
      progressPercent: 100,
    };
  }

  const prevDays = current.daysRequired;
  const nextDays = next.level.daysRequired;
  const elapsed = daysSince - prevDays;
  const span = nextDays - prevDays;
  const progressPercent = Math.min(100, Math.round((elapsed / span) * 100));

  return {
    currentLevel: current,
    nextLevel: next.level,
    daysUntilNext: next.daysUntil,
    progressPercent,
  };
}
