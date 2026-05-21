/**
 * referralKarma — referral link generation and karma reward system.
 *
 * Each player gets a unique referral code. When a new player
 * starts through a referral, both receive karma XP bonuses.
 */

export interface ReferralState {
  referralCode: string;
  referralCount: number;
  karmaEarned: number;
}

export const REFERRAL_KARMA_REWARD = 25;
export const REFEREE_KARMA_BONUS = 10;

/**
 * Generate a unique referral code from user ID.
 */
export function generateReferralCode(userId: string): string {
  // Short hash from user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const ch = userId.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return `SOUL-${Math.abs(hash).toString(36).toUpperCase().slice(0, 6)}`;
}

/**
 * Generate a shareable referral message.
 */
export function generateReferralMessage(
  code: string,
  avatarName: string,
  soulType?: string,
): string {
  const typeStr = soulType ? ` I'm a ${soulType}.` : '';
  return [
    `🌟 ${avatarName} invites you to discover your Soul Type.${typeStr}`,
    '',
    `Use my referral code: ${code}`,
    'We both earn +25 Karma when you start your first lifetime.',
    '',
    '#SoulAscension #AlignApp',
  ].join('\n');
}

/**
 * Calculate total karma earned from referrals.
 */
export function referralKarmaTotal(referralCount: number): number {
  return referralCount * REFERRAL_KARMA_REWARD;
}
