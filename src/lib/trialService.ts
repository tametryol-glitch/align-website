import { createClient } from '@/lib/supabase';

export interface TrialStatus {
  isOnTrial: boolean;
  daysRemaining: number;
  trialEnd: string;
}

/**
 * Start a 7-day premium trial for a user.
 * Sets trial_start, trial_end, and trial_used in the profiles table.
 */
export async function startTrial(userId: string): Promise<boolean> {
  const supabase = createClient();
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('profiles')
    .update({
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
      trial_used: true,
    })
    .eq('id', userId);

  return !error;
}

/**
 * Get the current trial status for a user.
 * Returns null if the user has never started a trial.
 */
export async function getTrialStatus(userId: string): Promise<TrialStatus | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('trial_start, trial_end, trial_used')
    .eq('id', userId)
    .single();

  if (error || !data?.trial_end) return null;

  const now = new Date();
  const trialEnd = new Date(data.trial_end);
  const msRemaining = trialEnd.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
  const isOnTrial = msRemaining > 0;

  return {
    isOnTrial,
    daysRemaining,
    trialEnd: data.trial_end,
  };
}

/**
 * Check if a user's trial is currently active (trial_end > now).
 */
export async function isTrialActive(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('trial_end')
    .eq('id', userId)
    .single();

  if (error || !data?.trial_end) return false;

  return new Date(data.trial_end).getTime() > Date.now();
}

/**
 * Check if a user has ever used a trial (prevent re-trials).
 */
export async function hasUsedTrial(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('trial_used')
    .eq('id', userId)
    .single();

  if (error || !data) return false;

  return data.trial_used === true;
}
