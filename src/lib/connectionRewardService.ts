/**
 * Connection Reward Service — Web version
 *
 * Phase 3: User-facing perks, balance, and redemption.
 * Talks to the same Supabase tables as the mobile app.
 */

import { createClient } from './supabase';

// ── Types ──

export interface RewardBalance {
  user_id: string;
  available_points: number;
  pending_points: number;
  lifetime_points: number;
  reversed_points: number;
  updated_at: string;
}

export interface RewardEvent {
  id: string;
  user_id: string;
  match_id: string | null;
  related_user_id: string | null;
  event_type: string;
  points: number;
  reason: string | null;
  risk_score: number;
  status: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RewardPerk {
  id: string;
  perk_type: string;
  display_name: string;
  description: string;
  icon: string;
  points_cost: number;
  max_active: number;
  cooldown_hours: number;
  duration_hours: number;
  min_tier: string;
  enabled: boolean;
  sort_order: number;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  redemption_type: string;
  points_spent: number;
  status: 'pending' | 'completed' | 'reversed';
  perk_id: string | null;
  expires_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RedeemResult {
  success: boolean;
  redemption_id?: string;
  perk_type?: string;
  points_spent?: number;
  expires_at?: string;
  new_balance?: number;
  reason?: string;
}

// ── API Functions ──

export async function getRewardBalance(userId: string): Promise<RewardBalance | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('connection_reward_balances')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data as RewardBalance;
  } catch {
    return null;
  }
}

export async function getRewardEvents(userId: string, limit: number = 20): Promise<RewardEvent[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('connection_reward_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as RewardEvent[];
  } catch {
    return [];
  }
}

export async function getAvailablePerks(): Promise<RewardPerk[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('connection_reward_perks')
      .select('*')
      .eq('enabled', true)
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data as RewardPerk[];
  } catch {
    return [];
  }
}

export async function getActivePerks(userId: string): Promise<RewardRedemption[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('connection_reward_redemptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true });
    if (error || !data) return [];
    return data as RewardRedemption[];
  } catch {
    return [];
  }
}

export async function redeemPerk(userId: string, perkType: string): Promise<RedeemResult> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.rpc('redeem_reward_perk', {
      p_user_id: userId,
      p_perk_type: perkType,
    });
    if (error) return { success: false, reason: error.message };
    if (!data) return { success: false, reason: 'no_response' };
    return data as RedeemResult;
  } catch (err: any) {
    return { success: false, reason: err?.message || 'unknown_error' };
  }
}
