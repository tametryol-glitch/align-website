/**
 * seasonalEventsEngine — time-limited world events that all players
 * experience simultaneously, tied to real astrological transits.
 *
 * Events rotate monthly and affect score modifiers, unlock special
 * missions, and provide seasonal rewards.
 */

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  emoji: string;
  /** Start date (inclusive) MMDD */
  startMMDD: string;
  /** End date (inclusive) MMDD */
  endMMDD: string;
  /** Score modifier during event */
  scoreModifier: {
    karma?: number;
    purpose?: number;
    shadow?: number;
  };
  /** Bonus XP multiplier */
  xpMultiplier: number;
  /** Special unlock text */
  specialReward: string;
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: 'eclipse-season',
    name: 'Eclipse Season',
    description: 'The cosmic veil thins. Shadow choices carry double weight, but also double insight.',
    emoji: '🌑',
    startMMDD: '0401',
    endMMDD: '0430',
    scoreModifier: { shadow: 2 },
    xpMultiplier: 1.5,
    specialReward: 'Eclipse Relic — a shadow artifact that reveals hidden truths',
  },
  {
    id: 'solstice-light',
    name: 'Summer Solstice Festival',
    description: 'The longest day. Purpose choices are amplified by solar energy.',
    emoji: '☀️',
    startMMDD: '0615',
    endMMDD: '0715',
    scoreModifier: { purpose: 2 },
    xpMultiplier: 1.5,
    specialReward: 'Solar Crown — a purpose artifact that strengthens your gift',
  },
  {
    id: 'mercury-retrograde',
    name: 'Mercury Retrograde',
    description: 'Communication breaks down. Choices carry unexpected consequences — for better or worse.',
    emoji: '☿️',
    startMMDD: '0825',
    endMMDD: '0915',
    scoreModifier: { karma: -1 },
    xpMultiplier: 2.0,
    specialReward: 'Retrograde Mirror — shows you what you missed the first time',
  },
  {
    id: 'samhain-veil',
    name: 'Samhain — Veil Between Worlds',
    description: 'The barrier between lifetimes weakens. Past lives whisper louder. All scores swing wider.',
    emoji: '🎃',
    startMMDD: '1028',
    endMMDD: '1103',
    scoreModifier: { karma: 2, shadow: 1, purpose: 1 },
    xpMultiplier: 2.0,
    specialReward: 'Ancestor Codex — unlocks memories from 3 additional past lives',
  },
  {
    id: 'winter-solstice',
    name: 'Winter Solstice Rebirth',
    description: 'The darkest night gives birth to light. Reincarnation bonuses doubled.',
    emoji: '❄️',
    startMMDD: '1218',
    endMMDD: '0105',
    scoreModifier: { purpose: 1 },
    xpMultiplier: 1.75,
    specialReward: 'Rebirth Crystal — +1 Ascension Level on next reincarnation',
  },
];

/**
 * Get the currently active seasonal event (if any).
 */
export function getActiveEvent(date: Date = new Date()): SeasonalEvent | null {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

  for (const event of SEASONAL_EVENTS) {
    // Handle year-wrapping events (e.g., 1218 to 0105)
    if (event.startMMDD > event.endMMDD) {
      if (mmdd >= event.startMMDD || mmdd <= event.endMMDD) return event;
    } else {
      if (mmdd >= event.startMMDD && mmdd <= event.endMMDD) return event;
    }
  }

  return null;
}

/**
 * Apply seasonal score modifier to raw effects.
 */
export function applySeasonalModifier(
  effects: Record<string, number>,
  event: SeasonalEvent | null,
): Record<string, number> {
  if (!event) return effects;

  const modified = { ...effects };
  if (event.scoreModifier.karma && modified.karma != null) {
    modified.karma = Math.round(modified.karma * event.scoreModifier.karma);
  }
  if (event.scoreModifier.purpose && modified.purpose != null) {
    modified.purpose = Math.round(modified.purpose * event.scoreModifier.purpose);
  }
  if (event.scoreModifier.shadow && modified.shadow != null) {
    modified.shadow = Math.round(modified.shadow * event.scoreModifier.shadow);
  }
  return modified;
}
