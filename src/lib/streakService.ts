import { createClient } from '@/lib/supabase';

export interface StreakData {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  total_check_ins: number;
  created_at: string;
  updated_at: string;
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
  if (diffDays === 1) {
    // Consecutive day — increment
    newCurrentStreak = existing.current_streak + 1;
  } else {
    // Streak broken — reset
    newCurrentStreak = 1;
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
