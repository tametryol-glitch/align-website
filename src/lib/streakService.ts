import { createClient } from '@/lib/supabase';

export interface StreakData {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  total_check_ins: number;
  lost_streak?: number;
  lost_recover_until?: string | null;
  last_recovery_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreakRecovery {
  recoverable: boolean;
  can_recover: boolean;
  lost_streak?: number;
  restore_to?: number;
  days_left?: number;
  recovered?: boolean;
}

/** Whether a lost streak can currently be recovered (48h window, once a month). */
export async function getStreakRecovery(): Promise<StreakRecovery> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('streak_recovery', { p_apply: false });
  if (error) {
    console.error('Error fetching streak recovery:', error);
    return { recoverable: false, can_recover: false };
  }
  return data as StreakRecovery;
}

export async function recoverStreak(): Promise<StreakRecovery> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('streak_recovery', { p_apply: true });
  if (error) throw new Error(`Failed to recover streak: ${error.message}`);
  return data as StreakRecovery;
}

/**
 * Fetch current streak data for a user.
 * Returns null if no streak record exists yet.
 */
export async function getStreak(userId: string): Promise<StreakData | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found — that's fine, anything else is unexpected
    console.error('Error fetching streak:', error);
  }

  return data as StreakData | null;
}

/**
 * Record a daily check-in for the user.
 *
 * Logic:
 * - If last_check_in is today → no-op (already checked in)
 * - If last_check_in is yesterday → increment current_streak
 * - If last_check_in is older → reset current_streak to 1
 * - Update longest_streak if current > longest
 * - Increment total_check_ins
 */
export async function checkIn(userId: string): Promise<StreakData> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Fetch existing record
  const existing = await getStreak(userId);

  if (!existing) {
    // First ever check-in — create the record
    const newStreak: Partial<StreakData> = {
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_check_in: today,
      total_check_ins: 1,
    };

    const { data, error } = await supabase
      .from('user_streaks')
      .insert(newStreak)
      .select()
      .single();

    if (error) throw new Error(`Failed to create streak: ${error.message}`);
    return data as StreakData;
  }

  // Already checked in today — no-op
  if (existing.last_check_in === today) {
    return existing;
  }

  // Determine if yesterday or older
  const lastDate = new Date(existing.last_check_in + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const diffDays = Math.floor(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newCurrentStreak: number;
  const lostFields: Partial<StreakData> = {};
  if (diffDays === 1) {
    // Consecutive day — increment
    newCurrentStreak = existing.current_streak + 1;
  } else {
    // Streak broken — reset, but remember it so it can be recovered for 48h
    newCurrentStreak = 1;
    if (existing.current_streak >= 2) {
      const until = new Date(existing.last_check_in + 'T00:00:00Z');
      until.setUTCDate(until.getUTCDate() + 3);
      lostFields.lost_streak = existing.current_streak;
      lostFields.lost_recover_until = until.toISOString().split('T')[0];
    }
  }

  const newLongestStreak = Math.max(newCurrentStreak, existing.longest_streak);
  const newTotalCheckIns = existing.total_check_ins + 1;

  const { data, error } = await supabase
    .from('user_streaks')
    .update({
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      last_check_in: today,
      total_check_ins: newTotalCheckIns,
      ...lostFields,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update streak: ${error.message}`);
  return data as StreakData;
}

/**
 * Fetch top streaks for a social leaderboard.
 */
export async function getStreakLeaderboard(limit = 10) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_streaks')
    .select('user_id, current_streak, longest_streak, total_check_ins')
    .order('current_streak', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data;
}
