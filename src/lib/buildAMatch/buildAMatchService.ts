// ═══════════════════════════════════════════════════════════════════
// Build-A-Match — data service (web)
//
// Web twin of align-app/src/services/buildAMatch/buildAMatchService.ts.
// Calls the SAME RPCs, reads the SAME planet_placement_index, and scores
// through the SAME engines — so a build produces identical results on both
// platforms.
//
// See align-app/BUILD_A_MATCH_DISCOVERY.md for the architecture.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';
import { computeAdvancedCompatibility } from '@/lib/engines/advancedCompatibility';
import { computePreferenceMatch } from '@/lib/preferenceMatchingEngine';
import type { RelationshipProfile } from '@/lib/relationshipProfileService';
import { computeCanonicalOverall, bandTextForOverall } from '@/lib/cosmicMatchService';
import {
  scoreBuildFit, explainFit, countsFromOutcomes,
  isPerfectBuild, isCloseBuild, isWildCard, isMutualBuild, isCosmicallyStrong,
  computeBuildRarity, rankRelaxationOptions,
  answeredPreferenceCount, MIN_PREFERENCE_ANSWERS,
  isNewMember, MIN_POOL_FOR_EXACT_COUNT,
} from './buildFitEngine';
import {
  overlaysFor, outcomeHits, outcomeById, signForHouse,
} from './houseSystem';
import {
  computeAllMidpoints, findActivations,
} from './midpointBridge';
import { rankAspects, type SynastryAspect } from './aspectInterpretations';
import type {
  BuildCriterion, BuildMatchResult, BuildRarity, DiscoveryCategory,
  DiscoverySection, PoolCount, RelaxationOption, SavedBuild, SearchMode, BuildMode,
  PreferenceMode, PreferenceBreakdown,
} from './types';

const SHORTLIST_SIZE = 40;

/** Strong agreement on the signup answers, out of 100. */
export const STRONG_PREFERENCE_MATCH = 75;

/** The profile fields Align's preference engine reads. */
const PREFERENCE_FIELDS =
  'relationship_style, relationship_primary_intent, relationship_secondary_intents, ' +
  'relationship_preferences, connection_type_wanted, energetic_pace, ' +
  'spiritual_openness, sexual_orientation';

type PreferenceProfile = Partial<RelationshipProfile> & { user_id: string };

interface PreferenceScore {
  score: number;
  breakdown: PreferenceBreakdown[];
  conflict: boolean;
}

export interface IndexedRow {
  user_id: string;
  planet_name: string;
  sign_name: string;
  house_number: number;
  exact_degree: number;
  zodiac_longitude: number;
  retrograde: boolean;
  birth_time_known: boolean;
}

// ─── Live pool (§7) ─────────────────────────────────────────────────

export async function countMatches(
  criteria: BuildCriterion[],
  searchMode: SearchMode = 'exact',
  datingOnly = false,
  preferenceMode: PreferenceMode = 'soft',
): Promise<PoolCount> {
  const empty: PoolCount = {
    count: 0, suppressed: false, eligiblePool: 0, minPool: MIN_POOL_FOR_EXACT_COUNT,
  };
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('bam_count_matches', {
      p_criteria: criteria,
      p_search_mode: searchMode,
      p_dating_only: datingOnly,
      p_min_pool: MIN_POOL_FOR_EXACT_COUNT,
      p_preference_mode: preferenceMode,
    });
    if (error || !data) return empty;
    const row = typeof data === 'string' ? JSON.parse(data) : data;
    return {
      count: Number(row.count) || 0,
      suppressed: Boolean(row.suppressed),
      eligiblePool: Number(row.eligible_pool) || 0,
      minPool: Number(row.min_pool) || MIN_POOL_FOR_EXACT_COUNT,
    };
  } catch {
    return empty;
  }
}

export async function getBuildRarity(
  criteria: BuildCriterion[],
  searchMode: SearchMode = 'exact',
  datingOnly = false,
  preferenceMode: PreferenceMode = 'soft',
): Promise<BuildRarity> {
  const pool = await countMatches(criteria, searchMode, datingOnly, preferenceMode);
  return computeBuildRarity(pool.count, pool.eligiblePool);
}

// ─── Compatibility from the index (no chart recomputation) ──────────

/**
 * Whole-Sign cusps from an indexed Ascendant. Cosmic Index indexes under
 * Whole Sign, so under that system the cusps ARE the sign boundaries.
 * Null when the birth time is unknown — guessing an angle from a
 * substituted noon is exactly what §38 forbids.
 */
function wholeSignCusps(ascLon: number | null, birthTimeKnown: boolean): number[] | null {
  if (ascLon === null || !Number.isFinite(ascLon)) return null;
  if (!birthTimeKnown) return null;
  const start = Math.floor((((ascLon % 360) + 360) % 360) / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => (start + i * 30) % 360);
}

const defaultCusps = () => Array.from({ length: 12 }, (_, i) => i * 30);

function toPositions(rows: IndexedRow[]) {
  return rows.map(r => ({
    name: r.planet_name,
    longitude: Number(r.zodiac_longitude) || 0,
    house: r.house_number || undefined,
  }));
}

export function scorePairFromIndex(
  mine: IndexedRow[],
  theirs: IndexedRow[],
): { overall: number; band: string; aspects: SynastryAspect[] } | null {
  if (!mine?.length || !theirs?.length) return null;
  if (mine.length < 5 || theirs.length < 5) return null;
  try {
    const myAsc = mine.find(r => r.planet_name === 'Ascendant');
    const theirAsc = theirs.find(r => r.planet_name === 'Ascendant');
    const myCusps = wholeSignCusps(myAsc ? Number(myAsc.zodiac_longitude) : null, myAsc?.birth_time_known ?? false) ?? defaultCusps();
    const theirCusps = wholeSignCusps(theirAsc ? Number(theirAsc.zodiac_longitude) : null, theirAsc?.birth_time_known ?? false) ?? defaultCusps();

    const result = computeAdvancedCompatibility(
      toPositions(mine), toPositions(theirs), myCusps, theirCusps,
    );
    const overall = computeCanonicalOverall(result);
    return {
      overall,
      band: bandTextForOverall(overall, result.band_text || ''),
      // The engine already computed the grid; keeping it costs nothing.
      aspects: (result.aspects || []) as SynastryAspect[],
    };
  } catch {
    return null;
  }
}

// ─── Search (§39) ───────────────────────────────────────────────────

interface RawMatchRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  must_hits: number;
  pref_hits: number;
  avoid_hits: number;
  must_total: number;
  pref_total: number;
  fit_score: number;
  joined_at: string | null;
}

export async function searchBuild(opts: {
  userId: string;
  criteria: BuildCriterion[];
  searchMode?: SearchMode;
  datingOnly?: boolean;
  preferenceMode?: PreferenceMode;
  limit?: number;
  offset?: number;
  enrich?: boolean;
  /** The viewer's rising sign — required to read results back as houses. */
  risingSign?: string | null;
  /** Which outcomes the viewer picked, so the card can say what landed. */
  outcomeIds?: string[];
}): Promise<BuildMatchResult[]> {
  const {
    userId, criteria, searchMode = 'exact', datingOnly = false,
    preferenceMode = 'soft', limit = 30, offset = 0, enrich = true,
    risingSign = null, outcomeIds = [],
  } = opts;
  if (!userId) return [];

  const supabase = createClient();

  let rows: RawMatchRow[] = [];
  try {
    const { data, error } = await supabase.rpc('bam_search_matches', {
      p_criteria: criteria,
      p_search_mode: searchMode,
      p_dating_only: datingOnly,
      p_limit: Math.min(limit, SHORTLIST_SIZE),
      p_offset: offset,
      p_preference_mode: preferenceMode,
    });
    if (error || !data) return [];
    rows = data as RawMatchRow[];
  } catch {
    return [];
  }
  if (rows.length === 0) return [];

  const candidateIds = rows.map(r => r.user_id);

  // ONE bulk query for the whole shortlist — no N+1.
  const placementsByUser = new Map<string, IndexedRow[]>();
  try {
    const { data: pRows } = await supabase.rpc('bam_placements_for_users', {
      p_user_ids: candidateIds,
      p_dating_only: datingOnly,
    });
    for (const r of (pRows || []) as IndexedRow[]) {
      if (!placementsByUser.has(r.user_id)) placementsByUser.set(r.user_id, []);
      placementsByUser.get(r.user_id)!.push(r);
    }
  } catch { /* fit detail degrades gracefully */ }

  const compatibility = new Map<string, { overall: number; band: string; aspects: SynastryAspect[] }>();
  const reciprocal = new Map<string, number>();
  const preferences = new Map<string, PreferenceScore>();
  let myMidpoints: ReturnType<typeof computeAllMidpoints> = [];

  if (enrich) {
    // Read-through the existing pair cache first (§42).
    try {
      const pairFilter = candidateIds
        .map(id => {
          const [a, b] = userId < id ? [userId, id] : [id, userId];
          return `and(user_a_id.eq.${a},user_b_id.eq.${b})`;
        })
        .join(',');
      const { data: cached } = await supabase
        .from('cosmic_matches')
        .select('user_a_id, user_b_id, overall_score, band_text')
        .or(pairFilter)
        .eq('status', 'ready');
      for (const row of cached || []) {
        const otherId = row.user_a_id === userId ? row.user_b_id : row.user_a_id;
        if (row.overall_score != null) {
          compatibility.set(otherId, {
            overall: row.overall_score,
            band: row.band_text || bandTextForOverall(row.overall_score),
            // cosmic_matches stores scores, not the grid. Filled in below.
            aspects: [],
          });
        }
      }
    } catch { /* a cache miss is normal */ }

    // Local synastry from the index for whatever the cache did not cover.
    // A cache hit keeps its authoritative SCORE but has no aspect grid, so
    // compute the grid locally and merge — the readings appear without the
    // number drifting from the rest of Align.
    const mine = await getMyIndexedRows(userId);

    // My 230 midpoints, computed ONCE for the whole shortlist.
    myMidpoints = computeAllMidpoints(
      mine.map(p => ({ name: p.planet_name, longitude: Number(p.zodiac_longitude) })),
    );
    for (const id of candidateIds) {
      const theirs = placementsByUser.get(id);
      if (!theirs) continue;
      const hit = compatibility.get(id);
      if (hit) {
        if (hit.aspects.length === 0) {
          const local = scorePairFromIndex(mine, theirs);
          if (local) compatibility.set(id, { ...hit, aspects: local.aspects });
        }
        continue;
      }
      const local = scorePairFromIndex(mine, theirs);
      if (local) compatibility.set(id, local);
    }

    try {
      const { data: recip } = await supabase.rpc('bam_reciprocal_fit', {
        p_candidate_ids: candidateIds,
      });
      for (const row of (recip || []) as Array<{ user_id: string; their_fit_of_me: number }>) {
        if (typeof row.their_fit_of_me === 'number') reciprocal.set(row.user_id, row.their_fit_of_me);
      }
    } catch { /* no reciprocal data is a normal state */ }

    // Signup-answer agreement, scored by Align's EXISTING engine. Gender is
    // NOT scored here — it is a hard SQL filter applied before this point.
    try {
      const [mineRes, theirsRes] = await Promise.all([
        supabase.from('profiles').select(PREFERENCE_FIELDS).eq('id', userId).single(),
        supabase.rpc('bam_preference_profiles', {
          p_user_ids: candidateIds,
          p_dating_only: datingOnly,
          p_preference_mode: preferenceMode,
        }),
      ]);
      const me = mineRes.data as Partial<RelationshipProfile> | null;
      const theirs = theirsRes.data as PreferenceProfile[] | null;
      // If either side has barely answered, the engine's neutral defaults
      // dominate and the score describes our padding, not two people.
      if (me && theirs && answeredPreferenceCount(me) >= MIN_PREFERENCE_ANSWERS) {
        for (const row of theirs) {
          if (answeredPreferenceCount(row) < MIN_PREFERENCE_ANSWERS) continue;
          const result = computePreferenceMatch(me, row);
          const conflict = result.breakdown.some(
            b => (b.category === 'Dealbreakers' || b.category === 'Style')
              && b.alignment === 'conflict',
          );
          preferences.set(row.user_id, {
            score: result.score, breakdown: result.breakdown, conflict,
          });
        }
      }
    } catch { /* preferences are a tuning layer — never break a search */ }
  }

  return rows.map(r => {
    const theirRows = placementsByUser.get(r.user_id) || [];
    const signMap: Record<string, string> = {};
    for (const p of theirRows) signMap[p.planet_name] = p.sign_name;

    const outcomes = explainFit(criteria, signMap);
    const counts = theirRows.length > 0
      ? {
          must_hits: r.must_hits, pref_hits: r.pref_hits, avoid_hits: r.avoid_hits,
          must_total: r.must_total, pref_total: r.pref_total,
        }
      : countsFromOutcomes(outcomes);

    const fit = typeof r.fit_score === 'number' ? r.fit_score : scoreBuildFit(counts);
    const compat = compatibility.get(r.user_id) ?? null;
    const recip = reciprocal.has(r.user_id) ? reciprocal.get(r.user_id)! : null;
    const pref = preferences.get(r.user_id) ?? null;

    return {
      userId: r.user_id,
      displayName: r.display_name || 'Align member',
      avatarUrl: r.avatar_url,
      sunSign: r.sun_sign,
      moonSign: r.moon_sign,
      risingSign: r.rising_sign,
      buildFit: fit,
      counts,
      outcomes,
      cosmicCompatibility: compat ? compat.overall : null,
      compatibilityBand: compat ? compat.band : null,
      reciprocalFit: recip,
      preferenceMatch: pref ? pref.score : null,
      preferenceBreakdown: pref ? pref.breakdown : null,
      hasPreferenceConflict: pref ? pref.conflict : false,
      isPerfectBuild: isPerfectBuild(counts),
      isCloseBuild: isCloseBuild(counts),
      isWildCard: isWildCard(fit, compat ? compat.overall : null),
      isMutualBuild: isMutualBuild(fit, recip),
      birthTimeKnown: theirRows.some(p => p.birth_time_known),
      joinedAt: r.joined_at ?? null,

      // The named cross-aspects, strongest first. The engine already
      // computed these; until now they were thrown away.
      aspects: compat ? rankAspects(compat.aspects, 3) : [],

      // Their bodies landing on my midpoints, within 1°.
      midpointActivations: myMidpoints.length
        ? findActivations(
            myMidpoints,
            theirRows.map(p => ({
              name: p.planet_name, longitude: Number(p.zodiac_longitude),
            })),
            3,
          ).map(m => ({
            activatingBody: m.activatingBody,
            a: m.a,
            b: m.b,
            aspect: m.aspect,
            orb: m.orb,
            strength: m.strength,
            isShadow: m.isShadow,
            name: m.reading?.name ?? null,
            light: m.reading?.light ?? null,
            shadow: m.reading?.shadow ?? null,
          }))
        : [],

      // Read their placements back as houses of MINE. Empty without a
      // rising sign — we will not guess an Ascendant.
      houseOverlays: risingSign ? overlaysFor(signMap, risingSign) : [],
      outcomeResults: risingSign
        ? outcomeIds.flatMap(id => {
            const outcome = outcomeById(id);
            if (!outcome) return [];
            const { hit, missed } = outcomeHits(outcome, signMap, risingSign);
            return [{ outcomeId: id, label: outcome.label, hit, missed }];
          })
        : [],
    } satisfies BuildMatchResult;
  });
}

/**
 * Has the viewer told us their gender AND who they're interested in?
 * bam_gender_compatible() is permissive when either side is unset, so a
 * viewer who hasn't answered gets no filtering — the UI must say so.
 */
export async function hasOrientationPreferences(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('gender_identity, interested_in_genders')
      .eq('id', userId)
      .single();
    return !!data?.gender_identity
      && Array.isArray(data?.interested_in_genders)
      && data.interested_in_genders.length > 0;
  } catch {
    return false;
  }
}

async function getMyIndexedRows(userId: string): Promise<IndexedRow[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('planet_placement_index')
      .select('planet_name, sign_name, house_number, exact_degree, zodiac_longitude, retrograde, birth_time_known')
      .eq('user_id', userId);
    return (data || []).map((p: any) => ({ user_id: userId, ...p })) as IndexedRow[];
  } catch {
    return [];
  }
}

// ─── Zero-result recovery (§14) ─────────────────────────────────────

export async function getRelaxationOptions(
  criteria: BuildCriterion[],
  datingOnly = false,
  preferenceMode: PreferenceMode = 'soft',
): Promise<RelaxationOption[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('bam_relaxation_impact', {
      p_criteria: criteria,
      p_dating_only: datingOnly,
      p_preference_mode: preferenceMode,
    });
    if (error || !data) return [];
    return rankRelaxationOptions(
      (data as Array<{ body: string; sign: string; pool_if_relaxed: number }>).map(r => ({
        body: r.body, sign: r.sign, poolIfRelaxed: Number(r.pool_if_relaxed) || 0,
      })),
    );
  } catch {
    return [];
  }
}

// ─── Discovery sections (§10) ───────────────────────────────────────

const SECTION_COPY: Record<DiscoveryCategory, { title: string; subtitle: string }> = {
  best:              { title: 'Your Best Build Matches', subtitle: 'Closest to what you asked for' },
  perfect:           { title: 'Perfect Build',           subtitle: 'Every must-have satisfied' },
  mutual:            { title: 'Mutual Build',            subtitle: 'You both independently built something very close to each other' },
  cosmically_strong: { title: 'Cosmically Strong',       subtitle: 'Exceptional compatibility from your actual charts' },
  aligned_on_paper:  { title: 'Aligned On Paper',        subtitle: 'They want the same kind of relationship you do' },
  wild_cards:        { title: 'Wild Cards',              subtitle: "You wouldn't have built them. Your charts say you should look twice." },
  close:             { title: 'Close Builds',            subtitle: 'Missing only one or two of your criteria' },
  new:               { title: 'New Matches',             subtitle: 'They joined recently and already fit this build' },
  rare:              { title: 'Rare Matches',            subtitle: 'Uncommon combinations that closely satisfy your build' },
};

export async function getDiscoverySections(opts: {
  userId: string;
  criteria: BuildCriterion[];
  searchMode?: SearchMode;
  datingOnly?: boolean;
  preferenceMode?: PreferenceMode;
  risingSign?: string | null;
  outcomeIds?: string[];
}): Promise<DiscoverySection[]> {
  const {
    userId, criteria, searchMode = 'exact', datingOnly = false,
    preferenceMode = 'soft', risingSign = null, outcomeIds = [],
  } = opts;
  const wideMode: SearchMode = searchMode === 'exact' ? 'close' : searchMode;

  const results = await searchBuild({
    userId, criteria, searchMode: wideMode, datingOnly, preferenceMode,
    risingSign, outcomeIds,
    limit: SHORTLIST_SIZE, enrich: true,
  });
  if (results.length === 0) return [];

  const byFit = [...results].sort((a, b) => b.buildFit - a.buildFit);
  const byCompat = [...results].sort(
    (a, b) => (b.cosmicCompatibility ?? -1) - (a.cosmicCompatibility ?? -1),
  );
  const byPreference = [...results].sort(
    (a, b) => (b.preferenceMatch ?? -1) - (a.preferenceMatch ?? -1),
  );

  const mk = (key: DiscoveryCategory, rs: BuildMatchResult[]): DiscoverySection =>
    ({ key, ...SECTION_COPY[key], results: rs });

  return [
    mk('best', byFit.filter(r => r.buildFit > 0).slice(0, 12)),
    mk('perfect', byFit.filter(r => r.isPerfectBuild)),
    mk('mutual', byFit.filter(r => r.isMutualBuild)),
    mk('cosmically_strong', byCompat.filter(r => isCosmicallyStrong(r.cosmicCompatibility) && !r.isWildCard)),
    mk('aligned_on_paper', byPreference.filter(
      r => (r.preferenceMatch ?? 0) >= STRONG_PREFERENCE_MATCH && !r.hasPreferenceConflict,
    )),
    mk('wild_cards', byCompat.filter(r => r.isWildCard)),
    mk('new', byFit.filter(r => isNewMember(r.joinedAt))),
    mk('close', byFit.filter(r => r.isCloseBuild)),
  ].filter(s => s.results.length > 0);
}

// ─── Saved builds (§27) ─────────────────────────────────────────────

export async function getMyBuilds(userId: string): Promise<SavedBuild[]> {
  if (!userId) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('build_a_match_builds')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });
    if (error || !data) return [];
    return data.map(normalizeBuild);
  } catch {
    return [];
  }
}

export async function saveBuild(input: {
  userId: string;
  name: string;
  criteria: BuildCriterion[];
  searchMode?: SearchMode;
  mode?: BuildMode;
  datingOnly?: boolean;
}): Promise<SavedBuild | null> {
  if (!input.userId) return null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('build_a_match_builds')
      .insert({
        owner_id: input.userId,
        name: input.name.trim().slice(0, 60) || 'My Build',
        criteria: input.criteria,
        search_mode: input.searchMode || 'exact',
        mode: input.mode || 'manual',
        dating_only: input.datingOnly ?? false,
      })
      .select()
      .single();
    if (error || !data) return null;
    return normalizeBuild(data);
  } catch {
    return null;
  }
}

export async function deleteBuild(userId: string, buildId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('build_a_match_builds')
      .delete()
      .eq('id', buildId)
      .eq('owner_id', userId);
    return !error;
  } catch {
    return false;
  }
}

function normalizeBuild(row: any): SavedBuild {
  return {
    id: row.id,
    owner_id: row.owner_id,
    name: row.name,
    mode: row.mode || 'manual',
    search_mode: row.search_mode || 'exact',
    criteria: Array.isArray(row.criteria) ? row.criteria : [],
    advanced_criteria: row.advanced_criteria || {},
    dating_only: !!row.dating_only,
    is_active: row.is_active !== false,
    visibility: row.visibility === 'shareable' ? 'shareable' : 'private',
    notify_on_new_match: !!row.notify_on_new_match,
    version: row.version || 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
