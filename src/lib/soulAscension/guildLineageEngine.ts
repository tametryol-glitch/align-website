/**
 * guildLineageEngine — cooperative soul families (guilds).
 *
 * Players can form or join Soul Lineages — small groups (3-12 members)
 * that share karma bonuses, unlock collective rewards, and see each
 * other's progress. Guilds have a shared lineage score that grows
 * as members complete lifetimes.
 *
 * Synced via Supabase tables with RLS per-guild.
 */

import type { ScoreState } from './types';

export interface SoulLineage {
  id: string;
  name: string;
  motto: string;
  /** Creator's user ID */
  founderId: string;
  /** Guild creation timestamp */
  createdAt: string;
  /** Current member count */
  memberCount: number;
  /** Max members allowed */
  maxMembers: number;
  /** Combined lineage score */
  lineageScore: number;
  /** Guild tier based on lineage score */
  tier: LineageTier;
  /** Invite code for joining */
  inviteCode: string;
  /** Guild-wide bonuses */
  bonuses: LineageBonuses;
}

export type LineageTier = 'seedling' | 'sapling' | 'tree' | 'grove' | 'forest' | 'cosmos';

export interface LineageBonuses {
  /** Extra XP percentage for all members */
  xpBoostPercent: number;
  /** Karma bonus on each mission */
  karmaBonus: number;
  /** Extra prophecy card slots */
  extraProphecySlots: number;
}

export interface LineageMember {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  soulType: string;
  ascensionLevel: number;
  lifetimesCompleted: number;
  /** Contribution to lineage score */
  contribution: number;
  joinedAt: string;
  role: 'founder' | 'elder' | 'member';
}

/**
 * Tier thresholds based on cumulative lineage score.
 */
const TIER_THRESHOLDS: Array<{ tier: LineageTier; minScore: number; bonuses: LineageBonuses }> = [
  { tier: 'seedling', minScore: 0, bonuses: { xpBoostPercent: 5, karmaBonus: 1, extraProphecySlots: 0 } },
  { tier: 'sapling', minScore: 100, bonuses: { xpBoostPercent: 10, karmaBonus: 2, extraProphecySlots: 1 } },
  { tier: 'tree', minScore: 500, bonuses: { xpBoostPercent: 15, karmaBonus: 3, extraProphecySlots: 1 } },
  { tier: 'grove', minScore: 1500, bonuses: { xpBoostPercent: 20, karmaBonus: 5, extraProphecySlots: 2 } },
  { tier: 'forest', minScore: 5000, bonuses: { xpBoostPercent: 30, karmaBonus: 8, extraProphecySlots: 3 } },
  { tier: 'cosmos', minScore: 15000, bonuses: { xpBoostPercent: 50, karmaBonus: 12, extraProphecySlots: 5 } },
];

/**
 * Determine lineage tier from cumulative score.
 */
export function getLineageTier(lineageScore: number): { tier: LineageTier; bonuses: LineageBonuses } {
  let result = TIER_THRESHOLDS[0];
  for (const threshold of TIER_THRESHOLDS) {
    if (lineageScore >= threshold.minScore) {
      result = threshold;
    }
  }
  return { tier: result.tier, bonuses: result.bonuses };
}

/**
 * Calculate a member's contribution from their scores and lifetime count.
 */
export function calculateMemberContribution(
  scores: ScoreState,
  lifetimesCompleted: number,
  ascensionLevel: number,
): number {
  const scoreContrib = Math.max(0, scores.karma) + scores.purpose + scores.giftMastery;
  const lifetimeContrib = lifetimesCompleted * 10;
  const levelContrib = ascensionLevel * 5;
  return scoreContrib + lifetimeContrib + levelContrib;
}

/**
 * Generate a unique invite code.
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SL-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Generate lineage name suggestions based on member soul types.
 */
export function suggestLineageNames(founderSoulType: string): string[] {
  const suggestions: Record<string, string[]> = {
    Lightbringer: ['The Luminous Circle', 'Order of the Dawn', 'Council of Radiance'],
    'Shadow Walker': ['The Veiled Assembly', 'Brotherhood of Depths', 'The Midnight Pact'],
    'Storm Rider': ['The Tempest Collective', 'League of Lightning', 'The Thunderborn'],
    'Hearth Keeper': ['The Sanctuary Circle', 'Haven of Warmth', 'The Ember Guild'],
    'Karmic Alchemist': ['The Transmutation Order', 'Circle of Change', 'The Karmic Weavers'],
    'Wounded Healer': ['The Healing Covenant', 'Order of Scars', 'The Mended Circle'],
    'Drifting Soul': ['The Wanderer Collective', 'Fellowship of Seekers', 'The Cosmic Drift'],
  };
  return suggestions[founderSoulType] || ['The Soul Lineage', 'Circle of Ascension', 'The Reborn'];
}

/**
 * Build a create-lineage payload for Supabase.
 */
export function buildCreateLineagePayload(
  name: string,
  motto: string,
  founderId: string,
): Record<string, unknown> {
  return {
    name,
    motto,
    founder_id: founderId,
    invite_code: generateInviteCode(),
    member_count: 1,
    max_members: 12,
    lineage_score: 0,
    tier: 'seedling',
    created_at: new Date().toISOString(),
  };
}

/**
 * Tier display info for UI.
 */
export const TIER_DISPLAY: Record<LineageTier, { emoji: string; label: string; color: string }> = {
  seedling: { emoji: '🌱', label: 'Seedling', color: '#8BC34A' },
  sapling: { emoji: '🌿', label: 'Sapling', color: '#4CAF50' },
  tree: { emoji: '🌳', label: 'Tree', color: '#2E7D32' },
  grove: { emoji: '🌲', label: 'Grove', color: '#1B5E20' },
  forest: { emoji: '🏔️', label: 'Forest', color: '#5EE6A8' },
  cosmos: { emoji: '🌌', label: 'Cosmos', color: '#F0C15C' },
};

// ── Supabase integration ────────────────────────────────────────

/** Minimal supabase client shape (platform-agnostic). */
interface SupabaseClientLike {
  from(table: string): any;
  channel(name: string): any;
  removeChannel(channel: any): void;
}

/**
 * Create a new lineage and add the founder as the first member.
 */
export async function createLineage(
  supabase: SupabaseClientLike,
  name: string,
  motto: string,
  founderId: string,
  displayName: string,
  avatarUrl: string | null,
  soulType: string,
  ascensionLevel: number,
): Promise<SoulLineage> {
  const payload = buildCreateLineagePayload(name, motto, founderId);
  const { data: row, error } = await supabase
    .from('soul_lineages')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(`Create lineage failed: ${error.message}`);

  // Add founder as first member
  const { error: memberErr } = await supabase.from('soul_lineage_members').insert({
    lineage_id: row.id,
    user_id: founderId,
    display_name: displayName,
    avatar_url: avatarUrl,
    soul_type: soulType,
    ascension_level: ascensionLevel,
    lifetimes_done: 0,
    contribution: 0,
    role: 'founder',
  });
  if (memberErr) throw new Error(`Add founder member failed: ${memberErr.message}`);

  return mapLineageRow(row);
}

/**
 * Join an existing lineage by invite code.
 */
export async function joinLineage(
  supabase: SupabaseClientLike,
  inviteCode: string,
  userId: string,
  displayName: string,
  avatarUrl: string | null,
  soulType: string,
  ascensionLevel: number,
): Promise<SoulLineage> {
  // Find lineage by invite code
  const { data: lineage, error: findErr } = await supabase
    .from('soul_lineages')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();
  if (findErr || !lineage) throw new Error('Invalid invite code');
  if (lineage.member_count >= lineage.max_members) throw new Error('Lineage is full');

  // Insert member
  const { error: memberErr } = await supabase.from('soul_lineage_members').insert({
    lineage_id: lineage.id,
    user_id: userId,
    display_name: displayName,
    avatar_url: avatarUrl,
    soul_type: soulType,
    ascension_level: ascensionLevel,
    lifetimes_done: 0,
    contribution: 0,
    role: 'member',
  });
  if (memberErr) throw new Error(`Join lineage failed: ${memberErr.message}`);

  // Increment member count
  const { data: updated, error: updateErr } = await supabase
    .from('soul_lineages')
    .update({ member_count: lineage.member_count + 1, updated_at: new Date().toISOString() })
    .eq('id', lineage.id)
    .select()
    .single();
  if (updateErr) throw new Error(`Update member count failed: ${updateErr.message}`);

  return mapLineageRow(updated);
}

/**
 * Fetch the user's current lineage (if any).
 */
export async function fetchMyLineage(
  supabase: SupabaseClientLike,
  userId: string,
): Promise<{ lineage: SoulLineage; members: LineageMember[] } | null> {
  // Find membership
  const { data: membership, error: memErr } = await supabase
    .from('soul_lineage_members')
    .select('lineage_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (memErr) throw new Error(`Fetch membership failed: ${memErr.message}`);
  if (!membership) return null;

  // Fetch lineage
  const { data: lineageRow, error: linErr } = await supabase
    .from('soul_lineages')
    .select('*')
    .eq('id', membership.lineage_id)
    .single();
  if (linErr) throw new Error(`Fetch lineage failed: ${linErr.message}`);

  // Fetch all members
  const { data: memberRows, error: mbErr } = await supabase
    .from('soul_lineage_members')
    .select('*')
    .eq('lineage_id', membership.lineage_id)
    .order('contribution', { ascending: false });
  if (mbErr) throw new Error(`Fetch members failed: ${mbErr.message}`);

  return {
    lineage: mapLineageRow(lineageRow),
    members: (memberRows || []).map(mapMemberRow),
  };
}

/**
 * Update a member's contribution and recalculate lineage score.
 */
export async function updateMemberContribution(
  supabase: SupabaseClientLike,
  lineageId: string,
  userId: string,
  scores: ScoreState,
  lifetimesCompleted: number,
  ascensionLevel: number,
): Promise<void> {
  const contribution = calculateMemberContribution(scores, lifetimesCompleted, ascensionLevel);

  // Update member row
  const { error: memErr } = await supabase
    .from('soul_lineage_members')
    .update({ contribution, lifetimes_done: lifetimesCompleted, ascension_level: ascensionLevel })
    .eq('lineage_id', lineageId)
    .eq('user_id', userId);
  if (memErr) throw new Error(`Update contribution failed: ${memErr.message}`);

  // Recalculate total lineage score
  const { data: members, error: fetchErr } = await supabase
    .from('soul_lineage_members')
    .select('contribution')
    .eq('lineage_id', lineageId);
  if (fetchErr) throw new Error(`Fetch contributions failed: ${fetchErr.message}`);

  const totalScore = (members || []).reduce((sum: number, m: any) => sum + m.contribution, 0);
  const { tier } = getLineageTier(totalScore);

  const { error: linErr } = await supabase
    .from('soul_lineages')
    .update({ lineage_score: totalScore, tier, updated_at: new Date().toISOString() })
    .eq('id', lineageId);
  if (linErr) throw new Error(`Update lineage score failed: ${linErr.message}`);
}

/**
 * Subscribe to real-time lineage updates.
 */
export function subscribeToLineage(
  supabase: SupabaseClientLike,
  lineageId: string,
  onUpdate: (lineage: SoulLineage) => void,
  onMemberChange: (members: LineageMember[]) => void,
): { unsubscribe: () => void } {
  const channel = supabase
    .channel(`lineage_${lineageId}`)
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'soul_lineages', filter: `id=eq.${lineageId}` },
      (payload: any) => {
        if (payload.new) onUpdate(mapLineageRow(payload.new));
      },
    )
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'soul_lineage_members', filter: `lineage_id=eq.${lineageId}` },
      async () => {
        // Re-fetch all members on any member change
        const { data } = await supabase
          .from('soul_lineage_members')
          .select('*')
          .eq('lineage_id', lineageId)
          .order('contribution', { ascending: false });
        if (data) onMemberChange(data.map(mapMemberRow));
      },
    )
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

/** Map a DB row to a SoulLineage object. */
function mapLineageRow(row: any): SoulLineage {
  const { tier, bonuses } = getLineageTier(row.lineage_score);
  return {
    id: row.id,
    name: row.name,
    motto: row.motto,
    founderId: row.founder_id,
    createdAt: row.created_at,
    memberCount: row.member_count,
    maxMembers: row.max_members,
    lineageScore: row.lineage_score,
    tier,
    inviteCode: row.invite_code,
    bonuses,
  };
}

/** Map a DB row to a LineageMember object. */
function mapMemberRow(row: any): LineageMember {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    soulType: row.soul_type,
    ascensionLevel: row.ascension_level,
    lifetimesCompleted: row.lifetimes_done,
    contribution: row.contribution,
    joinedAt: row.joined_at,
    role: row.role,
  };
}
