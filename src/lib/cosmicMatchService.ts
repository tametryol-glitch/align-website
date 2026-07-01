// ═══════════════════════════════════════════════════════════════════
// Cosmic Match Service — Web port
// Auto-compatibility between friends. Mirrors mobile cosmicMatchService
// but uses web infra (createClient, api.getNatalChart, buildBirthData,
// computeSynastryCompatibility from engines).
//
// NOTE: Web does NOT have computeAdvancedCompatibility, so passion,
// marriage, violence, and toxicity scores are left null.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';
import { api, buildBirthData } from '@/lib/api';
import { computeSynastryCompatibility, type CompatibilityResult } from '@/lib/engines';

// ── Types ──

export type MatchStatus = 'pending' | 'calculating' | 'ready' | 'stale' | 'error' | 'no_data';

export interface CosmicMatch {
  id: string;
  user_a_id: string;
  user_b_id: string;
  friendship_id: string | null;
  status: MatchStatus;

  // Scores
  overall_score: number | null;
  emotional_score: number | null;
  intellectual_score: number | null;
  physical_score: number | null;
  spiritual_score: number | null;
  attraction_score: number | null;
  stability_score: number | null;
  karmic_score: number | null;
  passion_score: number | null;
  passion_intensity: string | null;
  marriage_score: number | null;
  marriage_level: string | null;
  violence_risk_score: number | null;
  toxicity_score: number | null;

  // Sub-scores
  marriage_sub_scores: { domestic?: number; loyalty?: number; growth?: number };
  violence_sub_scores: { control?: number; volatility?: number; manipulation?: number };
  toxicity_subcategories: Array<{ name: string; score: number; icon: string; interpretation: string }>;

  // Text
  band_text: string | null;
  style_label: string | null;
  summary: string | null;
  strengths: string[];
  challenges: string[];

  // Aspects
  key_aspects: Array<{ inner: string; outer: string; aspect: string; orb: number; strength: number; supportive: boolean }>;
  passion_indicators: Array<{ description: string; score: number }>;
  marriage_indicators: Array<{ description: string; weight: number; type: string }>;

  // Stats
  midpoint_count: number;
  midpoint_activation_count: number;

  // Meta
  calculated_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Helpers ──

/**
 * Normalize a user pair so the smaller UUID is always first.
 * This matches the DB constraint on cosmic_matches.
 */
function normalizePair(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

// Sign to approximate zodiacal longitude (middle of sign)
const SIGN_LONGITUDES: Record<string, number> = {
  Aries: 15, Taurus: 45, Gemini: 75, Cancer: 105,
  Leo: 135, Virgo: 165, Libra: 195, Scorpio: 225,
  Sagittarius: 255, Capricorn: 285, Aquarius: 315, Pisces: 345,
};

/**
 * Build approximate planet positions from sun/moon/rising signs
 * when full ephemeris chart data is unavailable.
 */
function buildSignBasedPositions(
  profile: any,
): Array<{ name: string; longitude: number; house?: number }> {
  const positions: Array<{ name: string; longitude: number; house?: number }> = [];

  if (profile.sun_sign && SIGN_LONGITUDES[profile.sun_sign] !== undefined) {
    positions.push({ name: 'Sun', longitude: SIGN_LONGITUDES[profile.sun_sign] });
  }
  if (profile.moon_sign && SIGN_LONGITUDES[profile.moon_sign] !== undefined) {
    positions.push({ name: 'Moon', longitude: SIGN_LONGITUDES[profile.moon_sign] });
  }
  if (profile.rising_sign && SIGN_LONGITUDES[profile.rising_sign] !== undefined) {
    positions.push({ name: 'Ascendant', longitude: SIGN_LONGITUDES[profile.rising_sign] });
  }

  // Ensure Sun is always present
  const sunLon = SIGN_LONGITUDES[profile.sun_sign] || 0;
  if (!positions.find(p => p.name === 'Sun')) {
    positions.push({ name: 'Sun', longitude: sunLon });
  }

  // Mercury is always within 28 deg of Sun
  positions.push({ name: 'Mercury', longitude: (sunLon + 15) % 360 });
  // Venus is always within 47 deg of Sun
  positions.push({ name: 'Venus', longitude: (sunLon + 30) % 360 });

  return positions;
}

/** Equal house system starting at 0 deg Aries as a fallback. */
function buildDefaultHouseCusps(): number[] {
  return Array.from({ length: 12 }, (_, i) => i * 30);
}

/**
 * Fetch chart positions for a profile via the API.
 * Returns null on any failure so the caller can fall back to sign-based.
 */
async function fetchChartPositions(profile: any): Promise<{
  positions: Array<{ name: string; longitude: number; house?: number }>;
  houseCusps: number[];
} | null> {
  try {
    if (!profile.birth_date || !profile.latitude || !profile.longitude) return null;

    const chartData = await api.getNatalChart(buildBirthData(profile));

    const planets = chartData?.planets || chartData?.positions || [];
    if (!planets || planets.length === 0) return null;

    const positions = planets.map((p: any) => ({
      name: p.name || p.planet || '',
      longitude: p.longitude ?? 0,
      house: p.house || undefined,
    }));

    const houseCusps = chartData?.house_cusps || [];

    return { positions, houseCusps: houseCusps.length > 0 ? houseCusps : buildDefaultHouseCusps() };
  } catch {
    return null;
  }
}

/**
 * Map a base-engine CompatibilityResult to the DB row columns.
 * Advanced scores (passion, marriage, violence, toxicity) are set to null
 * because the web does not have the advanced compatibility module.
 */
function resultToRow(result: CompatibilityResult): Record<string, any> {
  return {
    status: 'ready' as const,
    overall_score: Math.round(result.overall_score),
    emotional_score: Math.round(result.emotional_score),
    intellectual_score: Math.round(result.intellectual_score),
    physical_score: Math.round(result.physical_score),
    spiritual_score: Math.round(result.spiritual_score),
    attraction_score: Math.round(result.scores?.Attraction || 0),
    stability_score: Math.round(result.scores?.Stability || 0),
    karmic_score: Math.round(result.scores?.Karmic || 0),

    // Advanced modules not available on web
    passion_score: null,
    passion_intensity: null,
    marriage_score: null,
    marriage_level: null,
    violence_risk_score: null,
    toxicity_score: null,
    marriage_sub_scores: {},
    violence_sub_scores: {},
    toxicity_subcategories: [],
    passion_indicators: [],
    marriage_indicators: [],

    band_text: result.band_text || '',
    style_label: result.style_label || '',
    summary: result.summary || '',
    strengths: result.strengths || [],
    challenges: result.challenges || [],
    key_aspects: (result.aspects || []).slice(0, 10).map(a => ({
      inner: a.inner,
      outer: a.outer,
      aspect: a.aspect,
      orb: Math.round(a.orb * 100) / 100,
      strength: Math.round(a.strength * 100) / 100,
      supportive: a.supportive,
    })),

    midpoint_count: 0,
    midpoint_activation_count: 0,
    calculated_at: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════

/**
 * Get all cosmic matches involving this user.
 * Returns matches that are ready, stale, or currently calculating.
 */
export async function getMyCosmicMatches(userId: string): Promise<CosmicMatch[]> {
  try {
    if (!userId) return [];
    const supabase = createClient();

    const { data, error } = await supabase
      .from('cosmic_matches')
      .select('*')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .in('status', ['ready', 'stale', 'calculating'])
      .order('overall_score', { ascending: false, nullsFirst: false });

    if (error || !data) return [];
    return data as CosmicMatch[];
  } catch {
    return [];
  }
}

/**
 * Get the cosmic match between the current user and another user.
 */
export async function getCosmicMatch(
  userId: string,
  otherUserId: string,
): Promise<CosmicMatch | null> {
  try {
    if (!userId || !otherUserId) return null;
    const supabase = createClient();

    const [a, b] = normalizePair(userId, otherUserId);

    const { data, error } = await supabase
      .from('cosmic_matches')
      .select('*')
      .eq('user_a_id', a)
      .eq('user_b_id', b)
      .single();

    if (error || !data) return null;
    return data as CosmicMatch;
  } catch {
    return null;
  }
}

/**
 * Opt in to sharing a rare cosmic match to the public feed (double opt-in).
 * Flips this user's flag; the public post is only created once BOTH users
 * have opted in (enforced server-side in opt_in_cosmic_match_share).
 */
export interface ShareOptInResult {
  success: boolean;
  published: boolean;
  waitingOnOther?: boolean;
  postId?: string;
  error?: string;
}

export async function optInCosmicMatchShare(matchId: string): Promise<ShareOptInResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('opt_in_cosmic_match_share', {
      p_match_id: matchId,
    });
    if (error || !data) {
      return { success: false, published: false, error: error?.message || 'rpc_failed' };
    }
    return {
      success: !!data.success,
      published: !!data.published,
      waitingOnOther: !!data.waiting_on_other,
      postId: data.post_id || undefined,
      error: data.error || undefined,
    };
  } catch (err: any) {
    return { success: false, published: false, error: err?.message || 'unknown' };
  }
}

/**
 * Trigger a cosmic match calculation for a friend pair.
 *
 * Steps:
 *   1. Get or create match record via RPC
 *   2. Mark as calculating
 *   3. Fetch both profiles
 *   4. Check birth data
 *   5. Get charts via api.getNatalChart
 *   6. Run computeSynastryCompatibility (fallback to sign-based)
 *   7. Map results to DB columns
 *   8. Upsert
 */
export async function triggerCosmicMatchCalculation(
  userId: string,
  otherUserId: string,
): Promise<CosmicMatch | null> {
  try {
    if (!userId || !otherUserId) return null;
    const supabase = createClient();

    const [a, b] = normalizePair(userId, otherUserId);

    // 1. Get or create the match record
    const { data: matchId } = await supabase.rpc('get_or_create_cosmic_match', {
      p_user1: userId,
      p_user2: otherUserId,
    });

    if (!matchId) return null;

    // 2. Mark as calculating
    await supabase
      .from('cosmic_matches')
      .update({ status: 'calculating' })
      .eq('id', matchId);

    // 3. Fetch both profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, birth_date, birth_time, birth_location, latitude, longitude, timezone, sun_sign, moon_sign, rising_sign')
      .in('id', [userId, otherUserId]);

    if (!profiles || profiles.length < 2) {
      await supabase
        .from('cosmic_matches')
        .update({ status: 'no_data' })
        .eq('id', matchId);
      return null;
    }

    const profileA = profiles.find(p => p.id === a)!;
    const profileB = profiles.find(p => p.id === b)!;

    // 4. Check if both have birth data
    if (!profileA?.birth_date || !profileB?.birth_date) {
      await supabase
        .from('cosmic_matches')
        .update({ status: 'no_data' })
        .eq('id', matchId);
      return null;
    }

    // 5. Try to get chart positions from API
    let result: CompatibilityResult | null = null;

    try {
      const [chart1, chart2] = await Promise.all([
        fetchChartPositions(profileA),
        fetchChartPositions(profileB),
      ]);

      if (chart1 && chart2) {
        result = computeSynastryCompatibility(
          chart1.positions,
          chart2.positions,
          chart1.houseCusps,
          chart2.houseCusps,
        );
      }
    } catch {
      // API failed — will fall back to sign-based below
    }

    // 6. Fallback: sign-based estimation if full chart not available
    if (!result) {
      const signPositions1 = buildSignBasedPositions(profileA);
      const signPositions2 = buildSignBasedPositions(profileB);
      const defaultCusps = buildDefaultHouseCusps();

      try {
        result = computeSynastryCompatibility(
          signPositions1,
          signPositions2,
          defaultCusps,
          defaultCusps,
        );
      } catch {
        // Even fallback failed
        await supabase
          .from('cosmic_matches')
          .update({ status: 'error' })
          .eq('id', matchId);
        return null;
      }
    }

    // 7. Map results to DB columns
    const matchData = resultToRow(result);

    // 8. Upsert
    const { data: updated, error: updateError } = await supabase
      .from('cosmic_matches')
      .update(matchData)
      .eq('id', matchId)
      .select()
      .single();

    if (updateError) {
      await supabase
        .from('cosmic_matches')
        .update({ status: 'error' })
        .eq('id', matchId);
      return null;
    }

    return updated as CosmicMatch;
  } catch {
    return null;
  }
}

/**
 * Subscribe to real-time cosmic match updates for a user.
 * Listens on both user_a_id and user_b_id columns.
 */
export function subscribeToCosmicMatches(
  userId: string,
  onUpdate: (match: CosmicMatch) => void,
): { unsubscribe: () => void } {
  if (!userId) return { unsubscribe: () => {} };

  const supabase = createClient();

  const channel = supabase
    .channel('cosmic-matches')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cosmic_matches',
        filter: `user_a_id=eq.${userId}`,
      },
      (payload) => { if (payload.new) onUpdate(payload.new as CosmicMatch); },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cosmic_matches',
        filter: `user_b_id=eq.${userId}`,
      },
      (payload) => { if (payload.new) onUpdate(payload.new as CosmicMatch); },
    )
    .subscribe();

  return {
    unsubscribe: () => { supabase.removeChannel(channel); },
  };
}
