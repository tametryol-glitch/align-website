/**
 * leaderboardSync — upsert scores, fetch rankings, subscribe to Realtime.
 *
 * Platform-agnostic: accepts a supabase client so it works on both
 * React Native (direct client) and Next.js (browser client).
 */

import type { ScoreState, SoulAscensionGameState } from './types';

// ── Types ────────────────────────────────────────────────────────

/** Minimal supabase client shape so we don't import the full SDK. */
interface SupabaseClientLike {
  from(table: string): any;
  rpc(fn: string, params: Record<string, unknown>): any;
  channel(name: string): any;
  removeChannel(channel: any): void;
}

export interface LeaderboardRow {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  avatar_name: string;
  karma: number;
  purpose: number;
  shadow: number;
  relationship: number;
  gift_mastery: number;
  ascension_level: number;
  lifetime_index: number;
  soul_xp: number;
  composite_score: number;
  updated_at: string;
  is_self: boolean;
}

// ── Upsert ───────────────────────────────────────────────────────

export async function upsertLeaderboardScore(
  supabase: SupabaseClientLike,
  userId: string,
  displayName: string,
  avatarUrl: string | null,
  state: SoulAscensionGameState,
): Promise<void> {
  const { scores, ascensionLevel, lifetimeIndex, soulXp, profile } = state;
  await supabase.from('soul_ascension_leaderboard').upsert(
    {
      user_id: userId,
      display_name: displayName || '',
      avatar_url: avatarUrl,
      avatar_name: profile.avatarName || '',
      karma: scores.karma,
      purpose: scores.purpose,
      shadow: scores.shadow,
      relationship: scores.relationship,
      gift_mastery: scores.giftMastery,
      ascension_level: ascensionLevel,
      lifetime_index: lifetimeIndex,
      soul_xp: soulXp,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
}

// ── Fetch ────────────────────────────────────────────────────────

export async function fetchLeaderboard(
  supabase: SupabaseClientLike,
  userId: string,
  limit = 50,
): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('get_soul_ascension_leaderboard', {
    p_user_id: userId,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

// ── Realtime ─────────────────────────────────────────────────────

export function subscribeToLeaderboard(
  supabase: SupabaseClientLike,
  userId: string,
  onUpdate: (rows: LeaderboardRow[]) => void,
): { unsubscribe: () => void } {
  const channelName = `sa-lb:${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'soul_ascension_leaderboard' },
      () => {
        // On any row change, refetch via the ranked RPC
        fetchLeaderboard(supabase, userId).then(onUpdate).catch(() => {});
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
