// ═══════════════════════════════════════════════════════════════════
// Cosmic Match Service — Web port
// Auto-compatibility between friends. Mirrors mobile cosmicMatchService
// but uses web infra (createClient, api.getNatalChart, buildBirthData,
// computeAdvancedCompatibility from engines).
//
// Web now runs the SAME advanced engine as mobile (computeAdvancedCompatibility),
// so passion, marriage, violence, and toxicity are computed and stored on
// whichever client calculates the pair first — no more null (0-displayed) scores.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';
import { api, buildBirthData } from '@/lib/api';
import { computeAdvancedCompatibility, type AdvancedCompatibilityResult } from '@/lib/engines/advancedCompatibility';

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

/** Stable hash of the birth data a calculation was based on (for stale detection). */
function hashBirthData(profile: any): string {
  const parts = [
    profile.birth_date || '',
    profile.birth_time || '',
    profile.latitude || '',
    profile.longitude || '',
  ];
  return parts.join('|');
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
 * Map a full AdvancedCompatibilityResult to the DB row columns.
 *
 * Mirrors the mobile resultToRow so a match calculated on either client writes
 * an identical row (same 9-category overall, same passion/marriage/violence/
 * toxicity, same band text). This is what stops web-first matches from leaving
 * the advanced columns null (displayed as 0).
 */
/**
 * The canonical Align compatibility overall, blended from ALL 9 displayed
 * categories. The base engine only blends 5 (Attraction, Emotional, Mental,
 * Stability, Karmic), ignoring Passion, Marriage, Spiritual and Physical
 * which the advanced modules compute.
 *
 * Exported so every surface showing "Cosmic Compatibility" — the match page,
 * dating, Build-A-Match — reads the same number from the same formula.
 * Mirrors computeCanonicalOverall() in align-app/src/services/cosmicMatchService.ts.
 */
export function computeCanonicalOverall(result: AdvancedCompatibilityResult): number {
  const emotional  = result.emotional_score ?? 0;
  const attraction = result.scores?.Attraction ?? 0;
  const passion    = result.passion?.score ?? 0;
  const marriage   = result.marriage?.score ?? 0;
  const stability  = result.scores?.Stability ?? 0;
  const karmic     = result.scores?.Karmic ?? result.spiritual_score ?? 0;
  const mental     = result.intellectual_score ?? 0;
  const spiritual  = result.spiritual_score ?? 0;
  const physical   = result.physical_score ?? 0;

  const fullOverall = Math.round(
    emotional  * 0.15 +
    attraction * 0.12 +
    passion    * 0.12 +
    marriage   * 0.08 +
    stability  * 0.14 +
    karmic     * 0.09 +
    mental     * 0.10 +
    spiritual  * 0.08 +
    physical   * 0.12
  );
  return Math.max(0, Math.min(100, fullOverall));
}

const OVERALL_BANDS: Array<[number, string]> = [
  [90, 'Rare compatibility — very strong bond, high attraction and support'],
  [80, 'Very strong relationship potential'],
  [70, 'Good compatibility with some friction'],
  [60, 'Mixed but workable if mature'],
  [50, 'Strong pull but inconsistent harmony'],
  [40, 'Difficult, unstable, karmically heavy'],
  [0,  'More lesson than peace'],
];

/** Band text for a canonical overall. Same wording everywhere in Align. */
export function bandTextForOverall(overall: number, fallback = 'Unknown'): string {
  for (const [threshold, text] of OVERALL_BANDS) {
    if (overall >= threshold) return text;
  }
  return fallback;
}

function resultToRow(result: AdvancedCompatibilityResult, profileA: any, profileB: any): Record<string, any> {
  const clampedOverall = computeCanonicalOverall(result);

  // Re-derive band text from the corrected overall
  const bandText = bandTextForOverall(clampedOverall, result.band_text || 'Unknown');

  return {
    status: 'ready' as const,
    overall_score: clampedOverall,
    emotional_score: Math.round(result.emotional_score),
    intellectual_score: Math.round(result.intellectual_score),
    physical_score: Math.round(result.physical_score),
    spiritual_score: Math.round(result.spiritual_score),
    attraction_score: Math.round(result.scores?.Attraction || 0),
    stability_score: Math.round(result.scores?.Stability || 0),
    karmic_score: Math.round(result.scores?.Karmic || 0),
    passion_score: Math.round(result.passion?.score || 0),
    passion_intensity: result.passion?.intensity || null,
    marriage_score: Math.round(result.marriage?.score || 0),
    marriage_level: result.marriage?.level || null,
    violence_risk_score: Math.round(result.violenceRisk?.score || 0),
    toxicity_score: Math.round(result.toxicity?.overallScore || 0),
    marriage_sub_scores: {
      domestic: Math.round(result.marriage?.domesticScore || 0),
      loyalty: Math.round(result.marriage?.loyaltyScore || 0),
      growth: Math.round(result.marriage?.growthTogetherScore || 0),
    },
    violence_sub_scores: {
      control: Math.round(result.violenceRisk?.controlScore || 0),
      volatility: Math.round(result.violenceRisk?.volatilityScore || 0),
      manipulation: Math.round(result.violenceRisk?.manipulationScore || 0),
    },
    toxicity_subcategories: (result.toxicity?.subcategories || []).map(s => ({
      name: s.name, score: Math.round(s.score), icon: s.icon, interpretation: s.interpretation,
    })),
    band_text: bandText,
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
    passion_indicators: (result.passion?.indicators || []).slice(0, 8).map(i => ({
      description: i.description, score: Math.round(i.score * 100) / 100,
    })),
    marriage_indicators: (result.marriage?.indicators || []).slice(0, 8).map(i => ({
      description: i.description, weight: Math.round(i.weight * 100) / 100, type: i.type,
    })),
    midpoint_count: result.midpointCount || 0,
    midpoint_activation_count: result.midpointActivationCount || 0,
    user_a_birth_hash: hashBirthData(profileA),
    user_b_birth_hash: hashBirthData(profileB),
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
 *   6. Run computeAdvancedCompatibility (fallback to sign-based)
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

    // 1b. Has this pair ever produced a result? Drives two things:
    //     - skip pointless recalculation of an already-ready match
    //     - only fire the "Cosmic Match Ready" notification the first time
    const { data: existing } = await supabase
      .from('cosmic_matches')
      .select('status, calculated_at')
      .eq('id', matchId)
      .single();

    if (existing?.status === 'ready' && existing?.calculated_at) {
      const { data: current } = await supabase
        .from('cosmic_matches')
        .select('*')
        .eq('id', matchId)
        .single();
      return (current as CosmicMatch) || null;
    }

    const isFirstResult = !existing?.calculated_at;

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
    let result: AdvancedCompatibilityResult | null = null;

    try {
      const [chart1, chart2] = await Promise.all([
        fetchChartPositions(profileA),
        fetchChartPositions(profileB),
      ]);

      if (chart1 && chart2) {
        result = computeAdvancedCompatibility(
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
        result = computeAdvancedCompatibility(
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
    const matchData = resultToRow(result, profileA, profileB);

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

    // 9. Notify BOTH users — whoever triggered the calculation and the partner.
    // create_notification is SECURITY DEFINER, so a client may write the row
    // for the other user. Only on the first result, so recalculations from a
    // stale profile don't re-notify.
    if (isFirstResult) {
      try {
        const score = matchData.overall_score;
        const band = matchData.band_text || 'See your full match';
        const bodyFor = (otherName: string) =>
          `You and ${otherName} scored ${score}/100 — ${band}`;

        await Promise.all([
          supabase.rpc('create_notification', {
            p_user_id: a,
            p_type: 'cosmic_match_ready',
            p_title: 'Cosmic Match Ready!',
            p_body: bodyFor(profileB.display_name || 'your new friend'),
            p_data: { match_id: matchId, other_user_id: b, score },
          }),
          supabase.rpc('create_notification', {
            p_user_id: b,
            p_type: 'cosmic_match_ready',
            p_title: 'Cosmic Match Ready!',
            p_body: bodyFor(profileA.display_name || 'your new friend'),
            p_data: { match_id: matchId, other_user_id: a, score },
          }),
        ]);
      } catch { /* notifications are best-effort */ }
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
