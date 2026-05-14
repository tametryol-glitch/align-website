/**
 * Cosmic Index Service -- Planet Placement Discovery Engine (Web port)
 *
 * Indexes natal placements per user and enables discovery:
 *   - "Show me everyone with Mars in Virgo"
 *   - "Show me everyone near my Moon degree"
 *   - Cosmic Tribes, rarity stats, degree soul groups
 *
 * Uses the FastAPI backend for chart computation and Supabase RPCs
 * for indexed placement storage/search.
 */

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';

// =====================================================================
// Constants
// =====================================================================

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const INDEXABLE_PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter',
  'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'North Node', 'South Node', 'Ascendant', 'MC', 'Chiron',
  'Juno', 'Vesta', 'Pallas', 'Lilith', 'Eros', 'Psyche', 'Ceres',
] as const;

export const PLANET_EMOJIS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  'North Node': '☊', 'South Node': '☋', Ascendant: '↑', MC: '★', Chiron: '⚷',
  Juno: '⚵', Vesta: '⚶', Pallas: '⚴', Lilith: '⚸', Eros: '❣', Psyche: 'Ψ', Ceres: '⚳',
};

export const SIGN_EMOJIS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export const ELEMENT_FOR_SIGN: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

export const BROWSE_PLANETS = [
  { name: 'Sun', glyph: '☉', color: '#F59E0B', label: 'Identity' },
  { name: 'Moon', glyph: '☽', color: '#8B5CF6', label: 'Emotions' },
  { name: 'Mercury', glyph: '☿', color: '#3B82F6', label: 'Mind' },
  { name: 'Venus', glyph: '♀', color: '#EC4899', label: 'Love' },
  { name: 'Mars', glyph: '♂', color: '#EF4444', label: 'Drive' },
  { name: 'Jupiter', glyph: '♃', color: '#10B981', label: 'Growth' },
  { name: 'Saturn', glyph: '♄', color: '#6B7280', label: 'Lessons' },
  { name: 'Ascendant', glyph: '↑', color: '#F97316', label: 'Persona' },
] as const;

// =====================================================================
// Types
// =====================================================================

export interface IndexedPlacement {
  planet_name: string;
  sign_name: string;
  sign_number: number;
  house_number: number;
  exact_degree: number;
  degree_whole: number;
  degree_minute: number;
  zodiac_longitude: number;
  retrograde: boolean;
}

export interface PlacementSearchResult {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  planet_name: string;
  sign_name: string;
  house_number: number;
  exact_degree: number;
  degree_whole: number;
  degree_minute: number;
  retrograde: boolean;
}

export interface PlacementRarity {
  total_users: number;
  sign_count: number;
  sign_percent: number;
  house_count: number;
  house_percent: number;
  both_count: number;
  both_percent: number;
}

export interface CosmicTribe {
  planet: string;
  sign: string;
  house?: number;
  count: number;
  label: string;
  emoji: string;
  description: string;
}

export interface PlacementSuggestion {
  label: string;
  emoji: string;
  description: string;
  planet: string;
  sign: string;
  house?: number;
  degreeMin?: number;
  degreeMax?: number;
  count: number;
}

export type MatchVibe =
  | 'High spark'
  | 'Emotionally familiar'
  | 'Similar drive'
  | 'Shared love style'
  | 'Karmic echo'
  | 'Soul resonance'
  | 'Grounded ally'
  | 'Intellectual match';

// =====================================================================
// Helpers
// =====================================================================

function getMyId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

/** Format degree as 14 deg 23' */
export function formatDegree(whole: number, minute: number): string {
  return `${whole}°${String(minute).padStart(2, '0')}'`;
}

/** Format placement badge */
export function formatPlacementBadge(p: {
  planet_name: string;
  sign_name: string;
  degree_whole: number;
  degree_minute: number;
  house_number?: number;
  retrograde?: boolean;
}): string {
  const pe = PLANET_EMOJIS[p.planet_name] || '';
  const se = SIGN_EMOJIS[p.sign_name] || '';
  const deg = formatDegree(p.degree_whole, p.degree_minute);
  const rx = p.retrograde ? ' ℞' : '';
  const house = p.house_number ? ` · ${p.house_number}H` : '';
  return `${p.planet_name} ${pe} in ${p.sign_name} ${se} ${deg}${rx}${house}`;
}

/** Get a lightweight vibe label based on the planet being searched */
export function getMatchVibe(planet: string): MatchVibe {
  switch (planet) {
    case 'Sun': return 'Soul resonance';
    case 'Moon': return 'Emotionally familiar';
    case 'Mercury': return 'Intellectual match';
    case 'Venus': return 'Shared love style';
    case 'Mars': return 'Similar drive';
    case 'Jupiter': return 'High spark';
    case 'Saturn': return 'Grounded ally';
    case 'Juno': return 'Shared love style';
    case 'Vesta': return 'Soul resonance';
    case 'Eros': return 'High spark';
    case 'Psyche': return 'Emotionally familiar';
    case 'Lilith': return 'Karmic echo';
    case 'Pallas': return 'Intellectual match';
    case 'Ceres': return 'Emotionally familiar';
    case 'Chiron': return 'Karmic echo';
    default: return 'Karmic echo';
  }
}

/** Get a human-readable rarity label for a placement percentage */
export function getRarityLabel(percent: number): { label: string; color: string } {
  if (percent <= 1) return { label: 'Extremely Rare', color: '#FFD700' };
  if (percent <= 3) return { label: 'Very Rare', color: '#F5A623' };
  if (percent <= 5) return { label: 'Rare', color: '#9B6FF6' };
  if (percent <= 10) return { label: 'Uncommon', color: '#3B82F6' };
  return { label: 'Common', color: '#7B849A' };
}

/** Format a count as a compact number (1.2K, 45) */
export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function ordinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

// =====================================================================
// Indexing -- Compute + Store placements
// =====================================================================

/**
 * Index the current user's natal placements.
 * Computes chart via the API, then upserts into planet_placement_index via RPC.
 */
export async function indexMyPlacements(): Promise<boolean> {
  try {
    const myId = getMyId();
    if (!myId) {
      console.warn('[CosmicIndex] Not authenticated');
      return false;
    }

    const supabase = createClient();

    // Get profile birth data
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('birth_date, birth_time, latitude, longitude, timezone, display_name, birth_location')
      .eq('id', myId)
      .single();

    if (!profileRow?.birth_date || !profileRow?.latitude || !profileRow?.longitude) {
      console.warn('[CosmicIndex] No birth data available');
      return false;
    }

    // Compute chart via API
    const birthData = buildBirthData(profileRow);
    const chart = await api.getNatalChart(birthData);

    const positions = chart?.positions || chart?.planets || [];
    if (!positions.length) {
      console.warn('[CosmicIndex] Chart computation returned no planets');
      return false;
    }

    // Convert to index records
    const records: IndexedPlacement[] = [];
    for (const p of positions) {
      if (!(INDEXABLE_PLANETS as readonly string[]).includes(p.name)) continue;
      const signIndex = (SIGNS as readonly string[]).indexOf(p.sign);
      if (signIndex < 0) continue;

      const deg = p.sign_degree ?? p.degree ?? 0;
      const degreeWhole = Math.floor(deg);
      const degreeMinute = Math.round((deg - degreeWhole) * 60);

      records.push({
        planet_name: p.name,
        sign_name: p.sign,
        sign_number: signIndex,
        house_number: p.house || 1,
        exact_degree: Math.round(deg * 10000) / 10000,
        degree_whole: degreeWhole,
        degree_minute: Math.min(degreeMinute, 59),
        zodiac_longitude: Math.round(p.longitude * 10000) / 10000,
        retrograde: p.is_retrograde ?? p.retrograde ?? false,
      });
    }

    if (records.length === 0) return false;

    // Upsert via RPC
    const { error } = await supabase.rpc('upsert_planet_placements', {
      p_user_id: myId,
      p_placements: records,
    });

    if (error) {
      console.error('[CosmicIndex] upsert error:', error.message);
      return false;
    }

    console.log(`[CosmicIndex] Indexed ${records.length} placements for user`);
    return true;
  } catch (err) {
    console.error('[CosmicIndex] indexMyPlacements failed:', err);
    return false;
  }
}

/**
 * Check if the current user already has indexed placements.
 */
export async function hasIndexedPlacements(): Promise<boolean> {
  const myId = getMyId();
  if (!myId) return false;

  const supabase = createClient();
  const { count } = await supabase
    .from('planet_placement_index')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', myId);

  return (count ?? 0) > 0;
}

/**
 * Get the current user's own indexed placements.
 */
export async function getMyPlacements(): Promise<IndexedPlacement[]> {
  const myId = getMyId();
  if (!myId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('planet_placement_index')
    .select('planet_name, sign_name, sign_number, house_number, exact_degree, degree_whole, degree_minute, zodiac_longitude, retrograde')
    .eq('user_id', myId)
    .order('sign_number', { ascending: true });

  if (error || !data) return [];
  return data as IndexedPlacement[];
}

// =====================================================================
// Search / Discovery
// =====================================================================

/**
 * Search users by placement criteria via the search_placements RPC.
 */
export async function searchPlacements(params: {
  planet?: string;
  sign?: string;
  house?: number;
  degreeMin?: number;
  degreeMax?: number;
  limit?: number;
  offset?: number;
}): Promise<PlacementSearchResult[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('search_placements', {
      p_planet: params.planet || null,
      p_sign: params.sign || null,
      p_house: params.house || null,
      p_degree_min: params.degreeMin ?? null,
      p_degree_max: params.degreeMax ?? null,
      p_limit: params.limit || 50,
      p_offset: params.offset || 0,
    });

    if (error) {
      console.error('[CosmicIndex] search error:', error.message);
      return [];
    }

    return (data || []) as PlacementSearchResult[];
  } catch (err) {
    console.error('[CosmicIndex] searchPlacements failed:', err);
    return [];
  }
}

/**
 * Get the count of users matching placement criteria.
 */
export async function getPlacementCount(params: {
  planet?: string;
  sign?: string;
  house?: number;
  degreeMin?: number;
  degreeMax?: number;
}): Promise<number> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('count_placements', {
      p_planet: params.planet || null,
      p_sign: params.sign || null,
      p_house: params.house || null,
      p_degree_min: params.degreeMin ?? null,
      p_degree_max: params.degreeMax ?? null,
    });

    if (error) return 0;
    return typeof data === 'number' ? data : 0;
  } catch {
    return 0;
  }
}

/**
 * Get rarity stats for a specific placement.
 */
export async function getPlacementRarity(
  planet: string,
  sign: string,
  house?: number,
): Promise<PlacementRarity | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('placement_rarity', {
      p_planet: planet,
      p_sign: sign,
      p_house: house ?? null,
    });

    if (error || !data) return null;
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    return result as PlacementRarity;
  } catch {
    return null;
  }
}

/**
 * Search for users near a specific degree (+/- orb).
 */
export async function searchNearDegree(params: {
  planet: string;
  sign: string;
  targetDegree: number;
  orbDegrees?: number;
  house?: number;
  limit?: number;
}): Promise<PlacementSearchResult[]> {
  const orb = params.orbDegrees ?? 2;
  return searchPlacements({
    planet: params.planet,
    sign: params.sign,
    house: params.house,
    degreeMin: Math.max(0, params.targetDegree - orb),
    degreeMax: Math.min(30, params.targetDegree + orb),
    limit: params.limit || 50,
  });
}

// =====================================================================
// Cosmic Tribes
// =====================================================================

/**
 * Generate "Cosmic Tribes" for the current user based on their placements.
 */
export async function getMyCosmicTribes(): Promise<CosmicTribe[]> {
  const placements = await getMyPlacements();
  if (placements.length === 0) return [];

  const tribePlanets = ['Sun', 'Moon', 'Venus', 'Mars', 'Saturn', 'Ascendant', 'Mercury', 'Jupiter'];
  const tribes: CosmicTribe[] = [];

  for (const planetName of tribePlanets) {
    const p = placements.find(pl => pl.planet_name === planetName);
    if (!p) continue;

    const count = await getPlacementCount({ planet: planetName, sign: p.sign_name });
    if (count === 0) continue;

    const pe = PLANET_EMOJIS[planetName] || '✦';
    const se = SIGN_EMOJIS[p.sign_name] || '';

    const descriptions: Record<string, string> = {
      Sun: `Others who share your core identity — ${p.sign_name} Sun`,
      Moon: `People who feel emotions the way you do — ${p.sign_name} Moon`,
      Venus: `People who love like you — Venus in ${p.sign_name}`,
      Mars: `People who fight and strive like you — Mars in ${p.sign_name}`,
      Saturn: `People with your same life lessons — Saturn in ${p.sign_name}`,
      Ascendant: `People the world sees the same way — ${p.sign_name} Rising`,
      Mercury: `People who think and communicate like you — Mercury in ${p.sign_name}`,
      Jupiter: `People who grow and expand in the same way — Jupiter in ${p.sign_name}`,
    };

    tribes.push({
      planet: planetName,
      sign: p.sign_name,
      house: p.house_number,
      count,
      label: `${planetName} in ${p.sign_name}`,
      emoji: `${pe}${se}`,
      description: descriptions[planetName] || `${planetName} in ${p.sign_name} community`,
    });
  }

  return tribes;
}

/**
 * Generate personalized placement suggestions for the user.
 */
export async function getPlacementSuggestions(): Promise<PlacementSuggestion[]> {
  const placements = await getMyPlacements();
  if (placements.length === 0) return [];

  const suggestions: PlacementSuggestion[] = [];

  // 1. People who share your exact Mars sign
  const mars = placements.find(p => p.planet_name === 'Mars');
  if (mars) {
    const count = await getPlacementCount({ planet: 'Mars', sign: mars.sign_name });
    if (count > 0) {
      suggestions.push({
        label: `Mars in ${mars.sign_name}`,
        emoji: `♂${SIGN_EMOJIS[mars.sign_name] || ''}`,
        description: 'People with the same drive and energy as you',
        planet: 'Mars', sign: mars.sign_name,
        count,
      });
    }
  }

  // 2. People near your Moon degree (+/-2 deg)
  const moon = placements.find(p => p.planet_name === 'Moon');
  if (moon) {
    const count = await getPlacementCount({
      planet: 'Moon', sign: moon.sign_name,
      degreeMin: Math.max(0, moon.exact_degree - 2),
      degreeMax: Math.min(30, moon.exact_degree + 2),
    });
    if (count > 0) {
      suggestions.push({
        label: `Moon in ${moon.sign_name} near ${moon.degree_whole}°`,
        emoji: `☽${SIGN_EMOJIS[moon.sign_name] || ''}`,
        description: 'People who feel emotions almost identically to you',
        planet: 'Moon', sign: moon.sign_name,
        degreeMin: Math.max(0, moon.exact_degree - 2),
        degreeMax: Math.min(30, moon.exact_degree + 2),
        count,
      });
    }
  }

  // 3. People with Venus in your 7th house sign
  const asc = placements.find(p => p.planet_name === 'Ascendant');
  if (asc) {
    const oppIndex = ((SIGNS as readonly string[]).indexOf(asc.sign_name) + 6) % 12;
    const seventhSign = SIGNS[oppIndex];
    const count = await getPlacementCount({ planet: 'Venus', sign: seventhSign });
    if (count > 0) {
      suggestions.push({
        label: `Venus in ${seventhSign}`,
        emoji: `♀${SIGN_EMOJIS[seventhSign] || ''}`,
        description: `People whose love style matches your 7th house — natural partners`,
        planet: 'Venus', sign: seventhSign,
        count,
      });
    }
  }

  // 4. People with your exact Ascendant sign
  if (asc) {
    const count = await getPlacementCount({ planet: 'Ascendant', sign: asc.sign_name });
    if (count > 0) {
      suggestions.push({
        label: `${asc.sign_name} Rising`,
        emoji: `↑${SIGN_EMOJIS[asc.sign_name] || ''}`,
        description: 'People the world sees the exact same way as you',
        planet: 'Ascendant', sign: asc.sign_name,
        count,
      });
    }
  }

  // 5. People near your Sun degree
  const sun = placements.find(p => p.planet_name === 'Sun');
  if (sun) {
    const count = await getPlacementCount({
      planet: 'Sun', sign: sun.sign_name,
      degreeMin: Math.max(0, sun.exact_degree - 1),
      degreeMax: Math.min(30, sun.exact_degree + 1),
    });
    if (count > 0) {
      suggestions.push({
        label: `Sun in ${sun.sign_name} near ${sun.degree_whole}°`,
        emoji: `☉${SIGN_EMOJIS[sun.sign_name] || ''}`,
        description: 'Your cosmic birthday twins — born within a day of you',
        planet: 'Sun', sign: sun.sign_name,
        degreeMin: Math.max(0, sun.exact_degree - 1),
        degreeMax: Math.min(30, sun.exact_degree + 1),
        count,
      });
    }
  }

  // 6. Saturn in same house
  const saturn = placements.find(p => p.planet_name === 'Saturn');
  if (saturn) {
    const count = await getPlacementCount({ planet: 'Saturn', house: saturn.house_number });
    if (count > 0) {
      suggestions.push({
        label: `Saturn in ${saturn.house_number}${ordinal(saturn.house_number)} house`,
        emoji: '♄',
        description: 'People with your same life lessons and karmic tests',
        planet: 'Saturn', sign: saturn.sign_name,
        count,
      });
    }
  }

  return suggestions;
}
