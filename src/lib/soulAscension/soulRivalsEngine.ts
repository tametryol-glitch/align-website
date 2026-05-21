/**
 * soulRivalsEngine — asynchronous PvP rival system.
 *
 * Players are matched with rivals based on opposite soul types.
 * Rivals compete on parallel lifetimes — same chapter structure,
 * opposite scoring incentives. Winner gets bonus ascension XP.
 *
 * Matching uses Supabase Realtime for live updates.
 */

import type { ChoiceRecord, ScoreState } from './types';

export interface SoulRival {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  soulType: string;
  ascensionLevel: number;
  /** Their current scores at time of matching */
  scores: ScoreState;
  /** Their choice history (visible after each chapter) */
  choiceHistory: ChoiceRecord[];
  /** Current chapter they're on */
  currentChapter: number;
  /** Match status */
  status: 'searching' | 'matched' | 'in_progress' | 'completed';
}

export interface RivalMatch {
  id: string;
  createdAt: string;
  /** The player who initiated */
  challengerId: string;
  /** The matched opponent */
  defenderId: string;
  /** Total chapters in this rivalry */
  totalChapters: number;
  /** Current chapter for comparison */
  currentComparisonChapter: number;
  /** Results per chapter */
  chapterResults: RivalChapterResult[];
  /** Overall match status */
  status: 'active' | 'completed' | 'abandoned';
  /** Winner user ID (null if ongoing) */
  winnerId: string | null;
}

export interface RivalChapterResult {
  chapterNumber: number;
  challengerPath: string;
  defenderPath: string;
  challengerScore: number;
  defenderScore: number;
  /** Who won this chapter */
  chapterWinner: 'challenger' | 'defender' | 'draw';
}

/**
 * Calculate a rivalry score from a player's current scores.
 * Used for matchmaking — players with similar rivalry scores
 * but different soul types make the best rivals.
 */
export function calculateRivalryScore(scores: ScoreState): number {
  return Math.abs(scores.karma) + scores.purpose + scores.shadow + scores.giftMastery;
}

/**
 * Determine the ideal rival soul type (opposite archetype).
 */
export function getIdealRivalType(playerSoulType: string): string {
  const opposites: Record<string, string> = {
    Lightbringer: 'Shadow Walker',
    'Shadow Walker': 'Lightbringer',
    'Storm Rider': 'Hearth Keeper',
    'Hearth Keeper': 'Storm Rider',
    'Karmic Alchemist': 'Drifting Soul',
    'Wounded Healer': 'Storm Rider',
    'Drifting Soul': 'Karmic Alchemist',
  };
  return opposites[playerSoulType] || 'Shadow Walker';
}

/**
 * Score a chapter result between two rivals.
 */
export function scoreChapterResult(
  challengerPath: string,
  defenderPath: string,
  challengerScoreDelta: number,
  defenderScoreDelta: number,
): RivalChapterResult['chapterWinner'] {
  const challengerAbs = Math.abs(challengerScoreDelta);
  const defenderAbs = Math.abs(defenderScoreDelta);

  if (challengerAbs > defenderAbs) return 'challenger';
  if (defenderAbs > challengerAbs) return 'defender';
  return 'draw';
}

/**
 * Calculate the overall match winner.
 */
export function determineMatchWinner(results: RivalChapterResult[]): 'challenger' | 'defender' | 'draw' {
  let challengerWins = 0;
  let defenderWins = 0;
  for (const r of results) {
    if (r.chapterWinner === 'challenger') challengerWins++;
    else if (r.chapterWinner === 'defender') defenderWins++;
  }
  if (challengerWins > defenderWins) return 'challenger';
  if (defenderWins > challengerWins) return 'defender';
  return 'draw';
}

/**
 * XP rewards for rivalry outcomes.
 */
export const RIVAL_REWARDS = {
  matchWin: 50,
  matchDraw: 25,
  matchLoss: 10,
  chapterWin: 8,
  chapterDraw: 3,
  chapterLoss: 1,
} as const;

/**
 * Build a rival search payload for Supabase insertion.
 */
export function buildRivalSearchPayload(
  userId: string,
  displayName: string,
  avatarUrl: string | null,
  soulType: string,
  ascensionLevel: number,
  scores: ScoreState,
): Record<string, unknown> {
  return {
    user_id: userId,
    display_name: displayName,
    avatar_url: avatarUrl,
    soul_type: soulType,
    ascension_level: ascensionLevel,
    rivalry_score: calculateRivalryScore(scores),
    ideal_rival_type: getIdealRivalType(soulType),
    status: 'searching',
    created_at: new Date().toISOString(),
  };
}

// ── Supabase integration ────────────────────────────────────────

/** Minimal supabase client shape (platform-agnostic). */
interface SupabaseClientLike {
  from(table: string): any;
  rpc(fn: string, params: Record<string, unknown>): any;
  channel(name: string): any;
  removeChannel(channel: any): void;
}

/**
 * Insert a rival search entry and invoke the match RPC.
 * Returns a match ID if an opponent was found immediately, else null.
 */
export async function startRivalSearch(
  supabase: SupabaseClientLike,
  userId: string,
  displayName: string,
  avatarUrl: string | null,
  soulType: string,
  ascensionLevel: number,
  scores: ScoreState,
): Promise<string | null> {
  const payload = buildRivalSearchPayload(userId, displayName, avatarUrl, soulType, ascensionLevel, scores);
  const { error: insertErr } = await supabase.from('soul_rival_searches').upsert(payload, { onConflict: 'user_id,status' });
  if (insertErr) throw new Error(`Rival search insert failed: ${insertErr.message}`);

  // Attempt auto-match via server-side RPC
  const { data, error: rpcErr } = await supabase.rpc('match_soul_rivals', { p_user_id: userId });
  if (rpcErr) throw new Error(`Rival match RPC failed: ${rpcErr.message}`);
  return data as string | null;
}

/**
 * Fetch the current active match for a user (as challenger or defender).
 */
export async function fetchActiveMatch(
  supabase: SupabaseClientLike,
  userId: string,
): Promise<RivalMatch | null> {
  const { data, error } = await supabase
    .from('soul_rival_matches')
    .select('*')
    .or(`challenger_id.eq.${userId},defender_id.eq.${userId}`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Fetch active match failed: ${error.message}`);
  if (!data) return null;
  return mapMatchRow(data);
}

/**
 * Submit a chapter result to an active match.
 */
export async function submitChapterResult(
  supabase: SupabaseClientLike,
  matchId: string,
  result: RivalChapterResult,
  totalChapters: number,
): Promise<RivalMatch> {
  // Fetch current match
  const { data: row, error: fetchErr } = await supabase
    .from('soul_rival_matches')
    .select('*')
    .eq('id', matchId)
    .single();
  if (fetchErr || !row) throw new Error(`Fetch match failed: ${fetchErr?.message ?? 'not found'}`);

  const results: RivalChapterResult[] = [...(row.chapter_results || []), result];
  const nextChapter = result.chapterNumber + 1;
  const isComplete = nextChapter > totalChapters;

  const winner = isComplete ? determineMatchWinner(results) : null;
  let winnerId: string | null = null;
  if (winner === 'challenger') winnerId = row.challenger_id;
  else if (winner === 'defender') winnerId = row.defender_id;

  const { data: updated, error: updateErr } = await supabase
    .from('soul_rival_matches')
    .update({
      chapter_results: results,
      current_comparison_ch: isComplete ? totalChapters : nextChapter,
      status: isComplete ? 'completed' : 'active',
      winner_id: winnerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single();
  if (updateErr) throw new Error(`Update match failed: ${updateErr.message}`);
  return mapMatchRow(updated);
}

/**
 * Fetch the rival's profile from their search entry.
 */
export async function fetchRivalProfile(
  supabase: SupabaseClientLike,
  rivalUserId: string,
): Promise<SoulRival | null> {
  const { data, error } = await supabase
    .from('soul_rival_searches')
    .select('*')
    .eq('user_id', rivalUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Fetch rival profile failed: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    soulType: data.soul_type,
    ascensionLevel: data.ascension_level,
    scores: { karma: 0, purpose: 0, shadow: 0, relationship: 0, giftMastery: 0 },
    choiceHistory: [],
    currentChapter: 1,
    status: data.status,
  };
}

/**
 * Subscribe to real-time match updates.
 */
export function subscribeToMatch(
  supabase: SupabaseClientLike,
  matchId: string,
  onUpdate: (match: RivalMatch) => void,
): { unsubscribe: () => void } {
  const channel = supabase
    .channel(`rival_match_${matchId}`)
    .on(
      'postgres_changes' as any,
      { event: 'UPDATE', schema: 'public', table: 'soul_rival_matches', filter: `id=eq.${matchId}` },
      (payload: any) => onUpdate(mapMatchRow(payload.new)),
    )
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

/** Map a DB row to a RivalMatch object. */
function mapMatchRow(row: any): RivalMatch {
  return {
    id: row.id,
    createdAt: row.created_at,
    challengerId: row.challenger_id,
    defenderId: row.defender_id,
    totalChapters: row.total_chapters,
    currentComparisonChapter: row.current_comparison_ch,
    chapterResults: row.chapter_results || [],
    status: row.status,
    winnerId: row.winner_id,
  };
}
