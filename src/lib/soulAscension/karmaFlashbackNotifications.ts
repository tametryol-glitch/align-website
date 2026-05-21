/**
 * karmaFlashbackNotifications — push notification templates
 * for re-engaging lapsed players.
 *
 * These fire based on player absence duration and soul profile.
 * The scheduling is handled by the notification service layer;
 * this module only generates the message content.
 */

import type { SoulProfile, ScoreState } from './types';

export interface KarmaFlashback {
  id: string;
  title: string;
  body: string;
  /** Hours of absence before this fires */
  triggerAfterHours: number;
  /** Whether this is a one-time or recurring notification */
  recurring: boolean;
}

/**
 * Generate a set of flashback notifications personalized to this soul.
 */
export function generateKarmaFlashbacks(
  profile: SoulProfile,
  scores: ScoreState,
): KarmaFlashback[] {
  const flashbacks: KarmaFlashback[] = [];

  // 4-hour gentle nudge
  flashbacks.push({
    id: 'kf-4h',
    title: `${profile.avatarName}, the thread is weakening...`,
    body: `Your ${profile.soulArchetype} soul has unfinished karma. The next chapter awaits.`,
    triggerAfterHours: 4,
    recurring: false,
  });

  // 12-hour shadow whisper
  flashbacks.push({
    id: 'kf-12h',
    title: 'Your shadow grows restless',
    body: `"${profile.soulScar.shadowPhrase}" — Will you face it, or let it consume another lifetime?`,
    triggerAfterHours: 12,
    recurring: false,
  });

  // 24-hour contract call
  flashbacks.push({
    id: 'kf-24h',
    title: `${profile.soulContracts[0].recurringSoulName} is waiting`,
    body: `Your soul contract remains unresolved. Return before the karmic debt compounds.`,
    triggerAfterHours: 24,
    recurring: false,
  });

  // 48-hour score warning
  if (scores.shadow > 40) {
    flashbacks.push({
      id: 'kf-48h-shadow',
      title: 'Shadow integration at critical level',
      body: `Your shadow score is ${scores.shadow}. Without attention, it may consume your gift of ${profile.coreGift}.`,
      triggerAfterHours: 48,
      recurring: false,
    });
  }

  // 72-hour reincarnation tease
  flashbacks.push({
    id: 'kf-72h',
    title: 'A new lifetime is forming...',
    body: `The reincarnation gate pulses with energy. Your ${profile.futurePurpose} destiny cannot wait forever.`,
    triggerAfterHours: 72,
    recurring: false,
  });

  // 7-day dramatic return
  flashbacks.push({
    id: 'kf-7d',
    title: 'The soul forgets what the stars remember',
    body: `Seven days of silence. Your karma balance sits at ${scores.karma}. The cycle continues with or without you.`,
    triggerAfterHours: 168,
    recurring: false,
  });

  return flashbacks;
}

/**
 * Pick the right flashback based on hours since last session.
 */
export function selectFlashbackForAbsence(
  flashbacks: KarmaFlashback[],
  hoursSinceLastSession: number,
): KarmaFlashback | null {
  // Find the most relevant flashback (highest trigger that doesn't exceed absence)
  const eligible = flashbacks
    .filter((fb) => fb.triggerAfterHours <= hoursSinceLastSession)
    .sort((a, b) => b.triggerAfterHours - a.triggerAfterHours);
  return eligible[0] ?? null;
}
