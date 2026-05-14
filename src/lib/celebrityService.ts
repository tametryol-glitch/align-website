/**
 * Celebrity Matches Service (Web)
 *
 * Ported from mobile celebrityService.ts.
 * Uses createClient() from @/lib/supabase for Supabase access,
 * useAuthStore for user ID, and the api singleton for backend chart calls.
 */

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type CelebrityCategory =
  | 'music' | 'film_tv' | 'sports' | 'politics' | 'influencers'
  | 'legends' | 'business' | 'fashion' | 'comedy' | 'science' | 'other';

export const CELEBRITY_CATEGORIES: { value: CelebrityCategory; label: string; emoji: string }[] = [
  { value: 'music',       label: 'Music',           emoji: '🎵' },
  { value: 'film_tv',     label: 'Film / TV',       emoji: '🎬' },
  { value: 'sports',      label: 'Sports',          emoji: '⚽' },
  { value: 'politics',    label: 'Politics',        emoji: '🏛️' },
  { value: 'influencers', label: 'Influencers',     emoji: '📱' },
  { value: 'legends',     label: 'Legends / Icons', emoji: '⭐' },
  { value: 'business',    label: 'Business',        emoji: '💼' },
  { value: 'fashion',     label: 'Fashion',         emoji: '👗' },
  { value: 'comedy',      label: 'Comedy',          emoji: '😂' },
  { value: 'science',     label: 'Science',         emoji: '🔬' },
  { value: 'other',       label: 'Other',           emoji: '🌟' },
];

export type SourceConfidence = 'verified' | 'reported' | 'unknown';

export interface Celebrity {
  id: string;
  name: string;
  slug: string;
  photo_url?: string;
  profession: string;
  category: CelebrityCategory;
  short_bio?: string;
  birth_date: string;
  birth_time?: string;
  birth_place?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  source_confidence: SourceConfidence;
  time_known: boolean;
  popularity_score: number;
  tags: string[];
  sun_sign?: string;
  moon_sign?: string;
  rising_sign?: string;
  created_at: string;
}

export interface NatalPlanet {
  name: string;
  longitude: number;
  sign: string;
  house?: number;
  retrograde?: boolean;
}

export interface NatalAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

export interface HouseCusp {
  house: number;
  longitude: number;
}

export interface CelebrityChartData {
  celebrity_id: string;
  planets: NatalPlanet[];
  houses: HouseCusp[];
  aspects: NatalAspect[];
  ascendant?: number;
  midheaven?: number;
  chart_signature?: ChartSignature;
  summary_cache?: string;
  last_calculated_at: string;
}

export interface ChartSignature {
  dominant_element?: string;
  dominant_modality?: string;
  dominant_planet?: string;
  stellium_sign?: string;
  stellium_house?: number;
  sun_sign: string;
  moon_sign?: string;
  rising_sign?: string;
  key_aspects: string[];
}

export interface CelebrityCompatibility {
  id: string;
  user_id: string;
  celebrity_id: string;
  overall_score: number;
  attraction_score: number;
  emotional_score: number;
  romantic_score: number;
  sexual_chemistry_score: number;
  friendship_score: number;
  long_term_score: number;
  conflict_risk_score: number;
  karmic_intensity_score: number;
  best_aspects: CompatAspect[];
  hardest_aspects: CompatAspect[];
  summary: string;
  relationship_feel: string;
  partial_data: boolean;
  calculated_at: string;
}

export interface CompatAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  description: string;
  supportive: boolean;
}

export interface CelebrityForecast {
  celebrity_id: string;
  now_summary: string;
  next_30_days: string;
  next_3_months: string;
  major_turning_points: TurningPoint[];
  love_text: string;
  career_text: string;
  money_text: string;
  image_text: string;
  inner_life_text: string;
  generated_at: string;
  partial_data: boolean;
}

export interface TurningPoint {
  title: string;
  date_range: string;
  description: string;
  category: string;
  intensity: 'high' | 'medium' | 'low';
}

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function currentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function lonToSign(lon: number): string {
  return SIGNS[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

// ═══════════════════════════════════════════════════════════════════
// Search & Browse
// ═══════════════════════════════════════════════════════════════════

export async function searchCelebrities(query: string, limit = 20): Promise<Celebrity[]> {
  try {
    if (!query.trim()) return [];
    const supabase = createClient();
    const { data, error } = await supabase
      .from('celebrities')
      .select('*')
      .or(`name.ilike.%${query}%,profession.ilike.%${query}%,tags.cs.{${query.toLowerCase()}}`)
      .eq('status', 'active')
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Celebrity] search error:', error.message);
      return [];
    }
    return (data || []).map(mapCelebRow);
  } catch {
    return [];
  }
}

export async function getTrendingCelebrities(limit = 10): Promise<Celebrity[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('celebrities')
      .select('*')
      .eq('status', 'active')
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []).map(mapCelebRow);
  } catch {
    return [];
  }
}

export async function getRecentCelebrities(limit = 10): Promise<Celebrity[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('celebrities')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []).map(mapCelebRow);
  } catch {
    return [];
  }
}

export async function getCelebritiesByCategory(
  category: CelebrityCategory,
  limit = 20,
): Promise<Celebrity[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('celebrities')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []).map(mapCelebRow);
  } catch {
    return [];
  }
}

export async function getCelebrityById(id: string): Promise<Celebrity | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('celebrities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapCelebRow(data);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Chart Data
// ═══════════════════════════════════════════════════════════════════

export async function getCelebrityChart(celeb: Celebrity): Promise<CelebrityChartData | null> {
  try {
    const supabase = createClient();

    // Check cache first
    const { data: cached } = await supabase
      .from('celebrity_chart_data')
      .select('*')
      .eq('celebrity_id', celeb.id)
      .single();

    if (cached?.planets_json) {
      return {
        celebrity_id: celeb.id,
        planets: cached.planets_json,
        houses: cached.houses_json || [],
        aspects: cached.aspects_json || [],
        ascendant: cached.angles_json?.ascendant,
        midheaven: cached.angles_json?.midheaven,
        chart_signature: cached.chart_signature_json,
        summary_cache: cached.summary_cache,
        last_calculated_at: cached.last_calculated_at,
      };
    }

    // Calculate fresh via backend API
    if (!celeb.birth_date || !celeb.latitude || !celeb.longitude) return null;

    const birthTime = celeb.time_known && celeb.birth_time ? celeb.birth_time : '12:00';

    const chart = await api.getNatalChart({
      name: celeb.name,
      date: celeb.birth_date,
      time: birthTime,
      latitude: celeb.latitude,
      longitude: celeb.longitude,
      timezone: celeb.timezone || 'UTC',
      location: celeb.birth_place || '',
      house_system: 'Whole Sign',
    });

    if (!chart || !chart.positions) return null;

    // Map API response to our types
    const planets: NatalPlanet[] = (chart.positions || []).map((p: any) => ({
      name: p.name,
      longitude: p.longitude,
      sign: p.sign || lonToSign(p.longitude),
      house: p.house,
      retrograde: p.retrograde || false,
    }));

    const aspects: NatalAspect[] = (chart.aspects || []).map((a: any) => ({
      planet1: a.planet1,
      planet2: a.planet2,
      type: a.type || a.aspect,
      orb: a.orb || 0,
    }));

    const houses: HouseCusp[] = celeb.time_known
      ? (chart.houses || []).map((h: any) => ({
          house: h.house || h.number,
          longitude: h.longitude || h.cusp,
        }))
      : [];

    const ascendant = celeb.time_known ? chart.ascendant?.longitude || chart.ascendant : undefined;
    const midheaven = celeb.time_known ? chart.midheaven?.longitude || chart.midheaven : undefined;

    // Build chart signature
    const signature = buildChartSignature(planets, aspects, celeb, ascendant);

    // Build summary
    const summaryCache = buildChartSummary(celeb, signature);

    // Cache result
    const cacheRow = {
      celebrity_id: celeb.id,
      planets_json: planets,
      houses_json: houses,
      aspects_json: aspects,
      angles_json: celeb.time_known ? { ascendant, midheaven } : null,
      chart_signature_json: signature,
      summary_cache: summaryCache,
      last_calculated_at: new Date().toISOString(),
    };

    await supabase.from('celebrity_chart_data').upsert(cacheRow, { onConflict: 'celebrity_id' });

    return {
      celebrity_id: celeb.id,
      planets,
      houses,
      aspects,
      ascendant,
      midheaven,
      chart_signature: signature,
      summary_cache: summaryCache,
      last_calculated_at: cacheRow.last_calculated_at,
    };
  } catch (err) {
    console.error('[Celebrity] getCelebrityChart error:', err);
    return null;
  }
}

function buildChartSignature(
  planets: NatalPlanet[],
  aspects: NatalAspect[],
  celeb: Celebrity,
  ascendant?: number,
): ChartSignature {
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');
  const asc = celeb.time_known && ascendant ? lonToSign(ascendant) : undefined;

  const elemCount: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modCount: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  const signCount: Record<string, number> = {};

  const fireS = new Set(['Aries', 'Leo', 'Sagittarius']);
  const earthS = new Set(['Taurus', 'Virgo', 'Capricorn']);
  const airS = new Set(['Gemini', 'Libra', 'Aquarius']);
  const cardS = new Set(['Aries', 'Cancer', 'Libra', 'Capricorn']);
  const fixedS = new Set(['Taurus', 'Leo', 'Scorpio', 'Aquarius']);

  const mainPlanets = planets.filter(p =>
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(p.name)
  );

  for (const p of mainPlanets) {
    const sign = p.sign || lonToSign(p.longitude);
    if (fireS.has(sign)) elemCount.Fire++;
    else if (earthS.has(sign)) elemCount.Earth++;
    else if (airS.has(sign)) elemCount.Air++;
    else elemCount.Water++;

    if (cardS.has(sign)) modCount.Cardinal++;
    else if (fixedS.has(sign)) modCount.Fixed++;
    else modCount.Mutable++;

    signCount[sign] = (signCount[sign] || 0) + 1;
  }

  const domElement = Object.entries(elemCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const domMod = Object.entries(modCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  let stelliumSign: string | undefined;
  for (const [sign, count] of Object.entries(signCount)) {
    if (count >= 3) { stelliumSign = sign; break; }
  }

  const keyAspects = aspects
    .filter(a => a.orb < 3)
    .slice(0, 5)
    .map(a => `${a.planet1} ${a.type} ${a.planet2}`);

  return {
    sun_sign: sun?.sign || celeb.sun_sign || 'Unknown',
    moon_sign: moon?.sign || celeb.moon_sign,
    rising_sign: asc || celeb.rising_sign,
    dominant_element: domElement,
    dominant_modality: domMod,
    stellium_sign: stelliumSign,
    key_aspects: keyAspects,
  };
}

function buildChartSummary(celeb: Celebrity, sig: ChartSignature): string {
  const parts: string[] = [];

  parts.push(`${celeb.name} is a ${sig.sun_sign} Sun`);
  if (sig.moon_sign) parts[0] += ` with a ${sig.moon_sign} Moon`;
  if (sig.rising_sign) parts[0] += ` and ${sig.rising_sign} Rising`;
  parts[0] += '.';

  if (sig.dominant_element) {
    parts.push(`Their chart is ${sig.dominant_element}-dominant, making them ${
      sig.dominant_element === 'Fire' ? 'passionate, bold, and action-oriented' :
      sig.dominant_element === 'Earth' ? 'grounded, practical, and security-driven' :
      sig.dominant_element === 'Air' ? 'intellectual, communicative, and socially fluid' :
      'emotionally deep, intuitive, and empathically wired'
    }.`);
  }

  if (sig.stellium_sign) {
    parts.push(`A stellium in ${sig.stellium_sign} concentrates their energy intensely in that sign's themes.`);
  }

  if (sig.key_aspects.length > 0) {
    parts.push(`Notable tight aspects include ${sig.key_aspects.slice(0, 3).join(', ')}.`);
  }

  if (!celeb.time_known) {
    parts.push('Note: Birth time is unknown, so house positions and rising sign are not available.');
  }

  return parts.join(' ');
}

// ═══════════════════════════════════════════════════════════════════
// Compatibility — uses backend synastry API
// ═══════════════════════════════════════════════════════════════════

export async function calculateCelebrityCompatibility(
  celeb: Celebrity,
  celebChart: CelebrityChartData,
): Promise<CelebrityCompatibility | null> {
  try {
    const userId = currentUserId();
    const profile = useAuthStore.getState().profile;
    if (!userId || !profile) return null;

    const supabase = createClient();

    // Check cache
    const { data: cached } = await supabase
      .from('celebrity_compatibility_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('celebrity_id', celeb.id)
      .single();

    if (cached?.compatibility_scores_json) {
      return {
        id: cached.id,
        user_id: userId,
        celebrity_id: celeb.id,
        ...cached.compatibility_scores_json,
        best_aspects: cached.key_aspects_json?.best || [],
        hardest_aspects: cached.key_aspects_json?.hardest || [],
        summary: cached.summary_text || '',
        relationship_feel: cached.compatibility_scores_json.relationship_feel || '',
        partial_data: cached.compatibility_scores_json.partial_data || false,
        calculated_at: cached.calculated_at,
      };
    }

    // Need user birth data
    if (!profile.birth_date || !profile.latitude || !profile.longitude) return null;

    // Call backend synastry API
    const userBirthData = buildBirthData(profile);
    const celebBirthData = {
      name: celeb.name,
      date: celeb.birth_date,
      time: celeb.time_known && celeb.birth_time ? celeb.birth_time : '12:00',
      latitude: celeb.latitude,
      longitude: celeb.longitude,
      timezone: celeb.timezone || 'UTC',
      location: celeb.birth_place || '',
      house_system: 'Whole Sign',
    };

    const result = await api.getSynastry({
      person1: userBirthData,
      person2: celebBirthData,
    });

    const partialData = !celeb.time_known;

    // Map synastry aspects to compat aspects
    const synAspects = result.aspects || [];

    const bestAspects: CompatAspect[] = synAspects
      .filter((a: any) => ['Trine', 'Sextile', 'Conjunction'].includes(a.type || a.aspect))
      .slice(0, 5)
      .map((a: any) => ({
        planet1: `Your ${a.planet1}`,
        planet2: `Their ${a.planet2}`,
        aspect: a.type || a.aspect,
        description: getAspectDescription(a.planet1, a.planet2, a.type || a.aspect, true),
        supportive: true,
      }));

    const hardestAspects: CompatAspect[] = synAspects
      .filter((a: any) => ['Square', 'Opposition'].includes(a.type || a.aspect))
      .slice(0, 5)
      .map((a: any) => ({
        planet1: `Your ${a.planet1}`,
        planet2: `Their ${a.planet2}`,
        aspect: a.type || a.aspect,
        description: getAspectDescription(a.planet1, a.planet2, a.type || a.aspect, false),
        supportive: false,
      }));

    // Calculate scores from aspect counts
    const totalAspects = synAspects.length || 1;
    const harmonious = synAspects.filter((a: any) =>
      ['Trine', 'Sextile', 'Conjunction'].includes(a.type || a.aspect)
    ).length;
    const challenging = synAspects.filter((a: any) =>
      ['Square', 'Opposition'].includes(a.type || a.aspect)
    ).length;

    const harmonyRatio = harmonious / totalAspects;
    const overallScore = Math.round(harmonyRatio * 100);

    // Derive category scores from aspect types involving specific planets
    const hasVenusAspect = synAspects.some((a: any) =>
      a.planet1 === 'Venus' || a.planet2 === 'Venus'
    );
    const hasMarsAspect = synAspects.some((a: any) =>
      a.planet1 === 'Mars' || a.planet2 === 'Mars'
    );
    const hasMoonAspect = synAspects.some((a: any) =>
      a.planet1 === 'Moon' || a.planet2 === 'Moon'
    );
    const hasSaturnAspect = synAspects.some((a: any) =>
      a.planet1 === 'Saturn' || a.planet2 === 'Saturn'
    );

    const attractionScore = Math.min(100, overallScore + (hasVenusAspect ? 15 : -10) + (hasMarsAspect ? 10 : 0));
    const emotionalScore = Math.min(100, overallScore + (hasMoonAspect ? 15 : -5));
    const romanticScore = Math.round((attractionScore + emotionalScore) / 2);
    const sexualChemistryScore = Math.min(100, overallScore + (hasMarsAspect ? 20 : -10));
    const friendshipScore = Math.min(100, overallScore + (hasMoonAspect ? 5 : 0));
    const longTermScore = Math.min(100, overallScore + (hasSaturnAspect ? 15 : -5));
    const conflictRiskScore = Math.min(100, Math.round((challenging / totalAspects) * 100));
    const karmicIntensityScore = Math.min(100, conflictRiskScore + (hasSaturnAspect ? 15 : 0));

    const compatData: CelebrityCompatibility = {
      id: '',
      user_id: userId,
      celebrity_id: celeb.id,
      overall_score: Math.max(0, Math.min(100, overallScore)),
      attraction_score: Math.max(0, Math.min(100, attractionScore)),
      emotional_score: Math.max(0, Math.min(100, emotionalScore)),
      romantic_score: Math.max(0, Math.min(100, romanticScore)),
      sexual_chemistry_score: Math.max(0, Math.min(100, sexualChemistryScore)),
      friendship_score: Math.max(0, Math.min(100, friendshipScore)),
      long_term_score: Math.max(0, Math.min(100, longTermScore)),
      conflict_risk_score: Math.max(0, Math.min(100, conflictRiskScore)),
      karmic_intensity_score: Math.max(0, Math.min(100, karmicIntensityScore)),
      best_aspects: bestAspects,
      hardest_aspects: hardestAspects,
      summary: generateCompatSummary(overallScore, celeb, partialData, result),
      relationship_feel: generateRelationshipFeel(emotionalScore, sexualChemistryScore, friendshipScore, celeb),
      partial_data: partialData,
      calculated_at: new Date().toISOString(),
    };

    // Cache
    await supabase.from('celebrity_compatibility_cache').upsert({
      user_id: userId,
      celebrity_id: celeb.id,
      compatibility_scores_json: {
        overall_score: compatData.overall_score,
        attraction_score: compatData.attraction_score,
        emotional_score: compatData.emotional_score,
        romantic_score: compatData.romantic_score,
        sexual_chemistry_score: compatData.sexual_chemistry_score,
        friendship_score: compatData.friendship_score,
        long_term_score: compatData.long_term_score,
        conflict_risk_score: compatData.conflict_risk_score,
        karmic_intensity_score: compatData.karmic_intensity_score,
        partial_data: partialData,
        relationship_feel: compatData.relationship_feel,
      },
      summary_text: compatData.summary,
      key_aspects_json: { best: bestAspects, hardest: hardestAspects },
      calculated_at: compatData.calculated_at,
    }, { onConflict: 'user_id,celebrity_id' });

    return compatData;
  } catch (err) {
    console.error('[Celebrity] calculateCompatibility error:', err);
    return null;
  }
}

function getAspectDescription(planet1: string, planet2: string, aspect: string, supportive: boolean): string {
  const verb = supportive
    ? { Conjunction: 'merges with', Trine: 'flows with', Sextile: 'harmonizes with', Opposition: 'balances', Square: 'activates' }
    : { Conjunction: 'intensifies with', Trine: 'flows with', Sextile: 'links to', Opposition: 'clashes with', Square: 'tensions with' };
  return `Your ${planet1} ${(verb as any)[aspect] || 'connects with'} their ${planet2}`;
}

function generateCompatSummary(score: number, celeb: Celebrity, partial: boolean, result: any): string {
  const band = score >= 80 ? 'deeply magnetic' : score >= 65 ? 'genuinely strong' :
    score >= 50 ? 'interesting and layered' : score >= 35 ? 'complex and challenging' : 'difficult but potentially transformative';

  let s = `Your connection with ${celeb.name} is ${band} (${score}%).`;

  if (result?.strengths?.length > 0) {
    s += ` Strengths: ${result.strengths.slice(0, 2).join('. ')}.`;
  }
  if (result?.challenges?.length > 0) {
    s += ` Watch for: ${result.challenges.slice(0, 2).join('. ')}.`;
  }
  if (partial) {
    s += ' Note: Without a confirmed birth time, house-based insights are estimates.';
  }

  return s;
}

function generateRelationshipFeel(e: number, p: number, i: number, celeb: Celebrity): string {
  if (p > 75 && e > 70) return 'Electric attraction meets emotional depth — this would feel passionate and consuming.';
  if (e > 75 && i > 70) return 'Deep emotional understanding paired with stimulating conversation — a soulmate feeling.';
  if (p > 75 && e < 50) return 'Physical magnetism is high, but emotional wavelengths differ — exciting but potentially unstable.';
  if (i > 75) return "A strong mental connection — you'd never run out of things to talk about.";
  if (e > 70) return `You'd feel emotionally safe and understood with ${celeb.name} — a nurturing bond.`;
  return 'A nuanced connection with layers worth exploring — not instant fireworks, but potentially rewarding over time.';
}

// ═══════════════════════════════════════════════════════════════════
// Forecasts
// ═══════════════════════════════════════════════════════════════════

export async function getCelebrityForecast(
  celeb: Celebrity,
  celebChart: CelebrityChartData,
): Promise<CelebrityForecast | null> {
  try {
    const supabase = createClient();

    // Check cache (valid for 7 days)
    const { data: cached } = await supabase
      .from('celebrity_forecasts')
      .select('*')
      .eq('celebrity_id', celeb.id)
      .eq('period_type', 'full')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.generated_at).getTime();
      if (age < 7 * 24 * 60 * 60 * 1000) {
        return {
          celebrity_id: celeb.id,
          now_summary: cached.summary_text || '',
          next_30_days: cached.love_text ? '' : cached.summary_text || '',
          next_3_months: cached.career_text || '',
          major_turning_points: cached.major_windows_json || [],
          love_text: cached.love_text || '',
          career_text: cached.career_text || '',
          money_text: cached.money_text || '',
          image_text: cached.image_text || '',
          inner_life_text: cached.inner_life_text || '',
          generated_at: cached.generated_at,
          partial_data: !celeb.time_known,
        };
      }
    }

    // Generate fresh forecast from transits
    const forecast = generateForecastFromTransits(celeb, celebChart);

    // Cache
    await supabase.from('celebrity_forecasts').upsert({
      celebrity_id: celeb.id,
      period_type: 'full',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      summary_text: forecast.now_summary,
      love_text: forecast.love_text,
      career_text: forecast.career_text,
      money_text: forecast.money_text,
      image_text: forecast.image_text,
      inner_life_text: forecast.inner_life_text,
      major_windows_json: forecast.major_turning_points,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'celebrity_id,period_type' });

    return forecast;
  } catch (err) {
    console.error('[Celebrity] getCelebrityForecast error:', err);
    return null;
  }
}

// ── Approximate planet positions ──

const PLANET_DATA: Record<string, { epoch: number; daily: number; period_years: number }> = {
  Sun:     { epoch: 280.46, daily: 0.9856,  period_years: 1 },
  Moon:    { epoch: 0,      daily: 13.176,   period_years: 0.0748 },
  Mercury: { epoch: 252.25, daily: 4.0923,  period_years: 0.2408 },
  Venus:   { epoch: 181.98, daily: 1.6021,  period_years: 0.6152 },
  Mars:    { epoch: 355.43, daily: 0.5240,  period_years: 1.881 },
  Jupiter: { epoch: 34.35,  daily: 0.08309, period_years: 11.86 },
  Saturn:  { epoch: 49.94,  daily: 0.03346, period_years: 29.46 },
  Uranus:  { epoch: 313.23, daily: 0.01173, period_years: 84.01 },
  Neptune: { epoch: 304.88, daily: 0.006,   period_years: 164.8 },
  Pluto:   { epoch: 238.92, daily: 0.004,   period_years: 247.9 },
};

function getApproxLon(planet: string, date: Date): number {
  const d = PLANET_DATA[planet];
  if (!d) return 0;
  const j2000 = new Date('2000-01-01T12:00:00Z');
  const days = (date.getTime() - j2000.getTime()) / 86400000;
  return ((d.epoch + d.daily * days) % 360 + 360) % 360;
}

function getAspectType(angle: number): { type: string; orb: number } | null {
  const aspects = [
    { name: 'Conjunction', angle: 0, maxOrb: 8 },
    { name: 'Opposition', angle: 180, maxOrb: 8 },
    { name: 'Square', angle: 90, maxOrb: 7 },
    { name: 'Trine', angle: 120, maxOrb: 7 },
    { name: 'Sextile', angle: 60, maxOrb: 5 },
  ];
  for (const a of aspects) {
    let diff = Math.abs(angle - a.angle);
    if (diff > 180) diff = 360 - diff;
    if (diff <= a.maxOrb) return { type: a.name, orb: diff };
  }
  return null;
}

function generateForecastFromTransits(
  celeb: Celebrity,
  chart: CelebrityChartData,
): CelebrityForecast {
  const now = new Date();
  const in30 = new Date(Date.now() + 30 * 86400000);
  const in90 = new Date(Date.now() + 90 * 86400000);
  const partial = !celeb.time_known;

  const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const natalPlanets = chart.planets.filter(p =>
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(p.name)
  );

  interface TransitHit {
    transit: string; natal: string; aspect: string; orb: number;
    category: string; timeframe: 'now' | '30d' | '90d';
  }
  const hits: TransitHit[] = [];

  for (const tp of outerPlanets) {
    const nowLon = getApproxLon(tp, now);
    const lon30 = getApproxLon(tp, in30);
    const lon90 = getApproxLon(tp, in90);

    for (const np of natalPlanets) {
      let diff = Math.abs(nowLon - np.longitude);
      if (diff > 180) diff = 360 - diff;
      const asp = getAspectType(diff);
      if (asp) {
        hits.push({
          transit: tp, natal: np.name, aspect: asp.type, orb: asp.orb,
          category: categorizeTransit(tp, np.name), timeframe: 'now',
        });
      }

      diff = Math.abs(lon30 - np.longitude);
      if (diff > 180) diff = 360 - diff;
      const asp30 = getAspectType(diff);
      if (asp30 && !asp) {
        hits.push({
          transit: tp, natal: np.name, aspect: asp30.type, orb: asp30.orb,
          category: categorizeTransit(tp, np.name), timeframe: '30d',
        });
      }

      diff = Math.abs(lon90 - np.longitude);
      if (diff > 180) diff = 360 - diff;
      const asp90 = getAspectType(diff);
      if (asp90 && !asp && !asp30) {
        hits.push({
          transit: tp, natal: np.name, aspect: asp90.type, orb: asp90.orb,
          category: categorizeTransit(tp, np.name), timeframe: '90d',
        });
      }
    }
  }

  const nowHits = hits.filter(h => h.timeframe === 'now');
  const month1Hits = hits.filter(h => h.timeframe === '30d');
  const qHits = hits.filter(h => h.timeframe === '90d');

  const nowText = nowHits.length > 0
    ? nowHits.map(h => transitNarrative(h.transit, h.natal, h.aspect, celeb.name)).join(' ')
    : `${celeb.name} is in a relatively stable cosmic phase right now, with no major outer-planet pressure on their key natal points.`;

  const monthText = month1Hits.length > 0
    ? month1Hits.map(h => transitNarrative(h.transit, h.natal, h.aspect, celeb.name)).join(' ')
    : `The next 30 days look steady for ${celeb.name}, without dramatic planetary shifts hitting their chart.`;

  const quarterText = qHits.length > 0
    ? qHits.map(h => transitNarrative(h.transit, h.natal, h.aspect, celeb.name)).join(' ')
    : `Over the next three months, ${celeb.name}'s chart shows a period of gradual unfolding rather than sudden change.`;

  const turningPoints: TurningPoint[] = hits
    .filter(h => ['Saturn', 'Uranus', 'Pluto'].includes(h.transit))
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 4)
    .map(h => ({
      title: `${h.transit} ${h.aspect} natal ${h.natal}`,
      date_range: h.timeframe === 'now' ? 'Active now' : h.timeframe === '30d' ? 'Within 30 days' : 'Within 3 months',
      description: turningPointText(h.transit, h.natal, h.aspect, celeb.name),
      category: h.category,
      intensity: (h.orb < 2 ? 'high' : h.orb < 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    }));

  const loveCat = hits.filter(h => h.category === 'love');
  const careerCat = hits.filter(h => h.category === 'career');
  const moneyCat = hits.filter(h => h.category === 'money');
  const imageCat = hits.filter(h => h.category === 'image');

  return {
    celebrity_id: celeb.id,
    now_summary: nowText,
    next_30_days: monthText,
    next_3_months: quarterText,
    major_turning_points: turningPoints,
    love_text: loveCat.length > 0
      ? loveCat.map(h => transitNarrative(h.transit, h.natal, h.aspect, celeb.name)).join(' ')
      : `No major romantic pressure points are activating ${celeb.name}'s chart right now. Emotional life is flowing at its own pace.`,
    career_text: careerCat.length > 0
      ? careerCat.map(h => transitNarrative(h.transit, h.natal, h.aspect, celeb.name)).join(' ')
      : `${celeb.name}'s professional energy looks steady, without dramatic career-shaking transits in the near term.`,
    money_text: moneyCat.length > 0
      ? moneyCat.map(h => transitNarrative(h.transit, h.natal, h.aspect, celeb.name)).join(' ')
      : `Financial planets are not making intense contacts to ${celeb.name}'s chart currently. A stable financial phase.`,
    image_text: imageCat.length > 0
      ? imageCat.map(h => transitNarrative(h.transit, h.natal, h.aspect, celeb.name)).join(' ')
      : `${celeb.name}'s public image is evolving naturally, without a dramatic reinvention cycle in the near future.`,
    inner_life_text: generateInnerLifeText(hits, celeb),
    generated_at: new Date().toISOString(),
    partial_data: partial,
  };
}

function categorizeTransit(transit: string, natal: string): string {
  if (['Venus', 'Moon'].includes(natal)) return 'love';
  if (['Sun', 'Jupiter', 'Saturn'].includes(natal) && ['Saturn', 'Jupiter', 'Pluto'].includes(transit)) return 'career';
  if (['Jupiter'].includes(transit) && ['Venus'].includes(natal)) return 'money';
  if (['Uranus', 'Neptune'].includes(transit) && ['Sun', 'Mercury'].includes(natal)) return 'image';
  if (['Neptune', 'Pluto'].includes(transit) && ['Moon'].includes(natal)) return 'inner';
  return 'career';
}

function transitNarrative(transit: string, natal: string, aspect: string, name: string): string {
  const narratives: Record<string, Record<string, string>> = {
    Jupiter: {
      Conjunction: `Jupiter is blessing ${name}'s natal ${natal} — an expansion window that brings opportunities, optimism, and visibility.`,
      Trine: `Jupiter trines ${name}'s ${natal}, creating a smooth growth cycle where things flow more easily.`,
      Square: `Jupiter squares ${name}'s ${natal}, bringing growth through tension — an overextension risk, but also a push toward bigger things.`,
      Opposition: `Jupiter opposes ${name}'s ${natal}, highlighting the tension between ambition and balance.`,
      Sextile: `Jupiter sextiles ${name}'s ${natal}, offering a window of opportunity if they choose to act on it.`,
    },
    Saturn: {
      Conjunction: `Saturn is sitting on ${name}'s natal ${natal} — a defining moment of maturity, restructuring, and long-term decisions.`,
      Trine: `Saturn trines ${name}'s ${natal}, providing structural support for lasting achievements.`,
      Square: `Saturn squares ${name}'s ${natal} — a pressure test. This is where they prove what they're made of.`,
      Opposition: `Saturn opposes ${name}'s ${natal}, demanding accountability and hard choices about direction.`,
      Sextile: `Saturn sextiles ${name}'s ${natal}, bringing subtle discipline and solidifying progress.`,
    },
    Uranus: {
      Conjunction: `Uranus is conjunct ${name}'s natal ${natal} — expect the unexpected. This is a personal revolution.`,
      Trine: `Uranus trines ${name}'s ${natal}, inspiring creative breakthroughs and electrifying change.`,
      Square: `Uranus squares ${name}'s ${natal} — disruption and liberation. Something breaks open.`,
      Opposition: `Uranus opposes ${name}'s ${natal}, shaking up the status quo and demanding authenticity.`,
      Sextile: `Uranus sextiles ${name}'s ${natal}, inviting exciting but manageable changes.`,
    },
    Neptune: {
      Conjunction: `Neptune dissolves and reimagines ${name}'s natal ${natal} — identity, clarity, or creativity may be going through a fog-to-vision cycle.`,
      Trine: `Neptune trines ${name}'s ${natal}, heightening intuition, artistry, and spiritual sensitivity.`,
      Square: `Neptune squares ${name}'s ${natal} — illusions may be tested. What's real versus what's a projection?`,
      Opposition: `Neptune opposes ${name}'s ${natal}, blurring boundaries and testing discernment.`,
      Sextile: `Neptune sextiles ${name}'s ${natal}, softly inspiring dreams and imagination.`,
    },
    Pluto: {
      Conjunction: `Pluto is transforming ${name}'s natal ${natal} — a deep, irreversible metamorphosis. Power, control, and rebirth themes dominate.`,
      Trine: `Pluto trines ${name}'s ${natal}, channeling transformative energy into empowered action.`,
      Square: `Pluto squares ${name}'s ${natal} — an intense power struggle, internally or externally. Something must die for something new to be born.`,
      Opposition: `Pluto opposes ${name}'s ${natal}, surfacing hidden dynamics and forcing confrontation with shadow material.`,
      Sextile: `Pluto sextiles ${name}'s ${natal}, offering controlled transformation and deeper self-knowledge.`,
    },
  };

  return narratives[transit]?.[aspect] || `${transit} ${aspect.toLowerCase()}s ${name}'s ${natal}, activating change.`;
}

function turningPointText(transit: string, natal: string, aspect: string, name: string): string {
  if (transit === 'Pluto') return `A deep transformation of ${name}'s ${natal} themes — power, control, rebirth.`;
  if (transit === 'Saturn') return `A maturation point for ${name} — responsibility, limits, and real-world tests around ${natal} themes.`;
  if (transit === 'Uranus') return `A liberation or disruption for ${name} involving their ${natal} — expect unexpected shifts.`;
  return `${transit} activates ${name}'s ${natal} in a significant way.`;
}

function generateInnerLifeText(hits: any[], celeb: Celebrity): string {
  const moonHits = hits.filter((h: any) => h.natal === 'Moon');
  if (moonHits.length > 0) {
    const h = moonHits[0];
    return `${h.transit} is touching ${celeb.name}'s Moon — their emotional inner world is being stirred. Processing, releasing, and recalibrating feelings are likely themes.`;
  }
  return `${celeb.name}'s inner world is in a reflective rhythm. No major outer-planet pressure on their Moon suggests emotional processing is happening privately and naturally.`;
}

// ═══════════════════════════════════════════════════════════════════
// Favorites
// ═══════════════════════════════════════════════════════════════════

export async function getFavorites(): Promise<Celebrity[]> {
  try {
    const userId = currentUserId();
    if (!userId) return [];

    const supabase = createClient();
    const { data, error } = await supabase
      .from('celebrity_favorites')
      .select('celebrity_id, celebrities(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data
      .filter((d: any) => d.celebrities)
      .map((d: any) => mapCelebRow(d.celebrities));
  } catch {
    return [];
  }
}

export async function toggleFavorite(celebId: string): Promise<boolean> {
  const userId = currentUserId();
  if (!userId) return false;

  try {
    const supabase = createClient();
    const { data: existing } = await supabase
      .from('celebrity_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('celebrity_id', celebId)
      .maybeSingle();

    if (existing) {
      await supabase.from('celebrity_favorites').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('celebrity_favorites').insert({ user_id: userId, celebrity_id: celebId });
      return true;
    }
  } catch {
    return false;
  }
}

export async function isFavorite(celebId: string): Promise<boolean> {
  const userId = currentUserId();
  if (!userId) return false;

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('celebrity_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('celebrity_id', celebId)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Row mapper
// ═══════════════════════════════════════════════════════════════════

function mapCelebRow(r: any): Celebrity {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug || '',
    photo_url: r.photo_url || undefined,
    profession: r.profession || '',
    category: r.category || 'other',
    short_bio: r.short_bio || undefined,
    birth_date: r.birth_date,
    birth_time: r.birth_time || undefined,
    birth_place: r.birth_place || undefined,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone || undefined,
    source_confidence: r.source_confidence || 'unknown',
    time_known: r.time_known || false,
    popularity_score: r.popularity_score || 0,
    tags: r.tags || [],
    sun_sign: r.sun_sign || undefined,
    moon_sign: r.moon_sign || undefined,
    rising_sign: r.rising_sign || undefined,
    created_at: r.created_at,
  };
}
