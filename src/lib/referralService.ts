import { createClient } from '@/lib/supabase';

const REWARD_AMOUNT = 5;

export interface ReferralReward {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_type: string;
  reward_amount: number;
  claimed: boolean;
  created_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  bonusReadings: number;
  rewards: ReferralReward[];
}

/**
 * Process a referral after signup: looks up referrer by align_code,
 * creates referral_rewards row for both, increments both users'
 * bonus_readings by 5, increments referrer's total_referrals.
 */
export async function processReferral(referrerCode: string, newUserId: string): Promise<boolean> {
  const supabase = createClient();

  // Look up referrer by align_code
  const { data: referrer, error: lookupError } = await supabase
    .from('profiles')
    .select('id, bonus_readings, total_referrals')
    .eq('align_code', referrerCode)
    .single();

  if (lookupError || !referrer) {
    console.error('Referral: could not find referrer with code', referrerCode);
    return false;
  }

  // Don't allow self-referral
  if (referrer.id === newUserId) {
    return false;
  }

  // Create reward row (unique constraint prevents duplicates)
  const { error: insertError } = await supabase
    .from('referral_rewards')
    .insert({
      referrer_id: referrer.id,
      referred_id: newUserId,
      reward_type: 'bonus_readings',
      reward_amount: REWARD_AMOUNT,
    });

  if (insertError) {
    // Likely duplicate — already processed
    console.error('Referral: insert error', insertError.message);
    return false;
  }

  // Increment referrer's bonus_readings and total_referrals
  await supabase
    .from('profiles')
    .update({
      bonus_readings: (referrer.bonus_readings || 0) + REWARD_AMOUNT,
      total_referrals: (referrer.total_referrals || 0) + 1,
    })
    .eq('id', referrer.id);

  // Increment new user's bonus_readings
  const { data: newUser } = await supabase
    .from('profiles')
    .select('bonus_readings')
    .eq('id', newUserId)
    .single();

  await supabase
    .from('profiles')
    .update({
      bonus_readings: ((newUser?.bonus_readings as number) || 0) + REWARD_AMOUNT,
    })
    .eq('id', newUserId);

  return true;
}

/**
 * Get referral stats for a user: total referrals, bonus readings, and reward history.
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = createClient();

  // Get profile stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_referrals, bonus_readings')
    .eq('id', userId)
    .single();

  // Get reward history
  const { data: rewards } = await supabase
    .from('referral_rewards')
    .select('*')
    .or(`referrer_id.eq.${userId},referred_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  return {
    totalReferrals: profile?.total_referrals || 0,
    bonusReadings: profile?.bonus_readings || 0,
    rewards: (rewards as ReferralReward[]) || [],
  };
}

/**
 * Get the full referral invite link for a user's align_code.
 */
export function getMyReferralLink(alignCode: string): string {
  return `https://aligncosmic.com/join/${alignCode}`;
}

/**
 * Mark a reward as claimed.
 */
export async function claimReward(rewardId: string, userId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('referral_rewards')
    .update({ claimed: true })
    .eq('id', rewardId)
    .or(`referrer_id.eq.${userId},referred_id.eq.${userId}`);

  return !error;
}
