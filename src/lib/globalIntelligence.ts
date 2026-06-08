/**
 * Global Intelligence — Web service layer.
 * Queries gi_* tables via Supabase (public read RLS).
 */
import { createClient } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────

export interface GICountry {
  id: string;
  name: string;
  iso_alpha2: string | null;
  iso_alpha3: string | null;
  flag_emoji: string | null;
  region: string | null;
  subregion: string | null;
  capital: string | null;
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  currency_code: string | null;
}

export interface GICountryChart {
  id: string;
  country_id: string;
  chart_type: string;
  event_title: string;
  event_date: string;
  event_time: string | null;
  time_confidence: string;
  location_name: string | null;
  source_name: string | null;
  source_reliability: string;
  chart_data_json: any | null;
  is_primary: boolean;
}

export interface GIScores {
  economic_momentum: number;
  political_stability: number;
  conflict_pressure: number;
  public_mood: number;
  overall_energy: number;
  labels: {
    economic: string;
    political: string;
    conflict: string;
    mood: string;
    energy: string;
  };
}

export interface GIDailyIntel {
  id: string;
  country_id: string;
  scan_date: string;
  engine_version: string;
  transits_json: any | null;
  progressions_json: any | null;
  midpoints_json: any | null;
  solar_arc_json: any | null;
  scores_json: GIScores | null;
  summary: string | null;
}

export interface GICountryEvent {
  id: string;
  country_id: string;
  title: string;
  summary: string | null;
  category: string;
  subcategory: string | null;
  event_date: string;
  severity: string;
  source_name: string | null;
  verification_status: string;
}

// ─── Queries ─────────────────────────────────────────────────

export async function listCountries(): Promise<GICountry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gi_countries')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return (data || []) as GICountry[];
}

export async function getCountry(iso: string): Promise<GICountry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gi_countries')
    .select('*')
    .eq('iso_alpha2', iso.toUpperCase())
    .single();
  if (error) return null;
  return data as GICountry;
}

export async function getPrimaryChart(countryId: string): Promise<GICountryChart | null> {
  const supabase = createClient();
  // Order by chart_data_json not null first so we prefer computed charts
  const { data, error } = await supabase
    .from('gi_country_charts')
    .select('*')
    .eq('country_id', countryId)
    .eq('is_primary', true)
    .eq('is_active', true)
    .not('chart_data_json', 'is', null)
    .limit(1);
  if (error || !data?.length) {
    // Fallback: get any primary chart even without computed data
    const { data: fallback } = await supabase
      .from('gi_country_charts')
      .select('*')
      .eq('country_id', countryId)
      .eq('is_primary', true)
      .eq('is_active', true)
      .limit(1);
    return fallback?.[0] as GICountryChart || null;
  }
  return data[0] as GICountryChart;
}

export async function getDailyIntel(countryId: string, date?: string): Promise<GIDailyIntel | null> {
  const supabase = createClient();
  if (date) {
    // Explicit date — strict match
    const { data, error } = await supabase
      .from('gi_country_daily_intel')
      .select('*')
      .eq('country_id', countryId)
      .eq('scan_date', date)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) return null;
    return data as GIDailyIntel;
  }
  // No date — get the most recent available intel
  // Handles gap between midnight UTC and the 04:00 UTC cron
  const { data, error } = await supabase
    .from('gi_country_daily_intel')
    .select('*')
    .eq('country_id', countryId)
    .not('scores_json', 'is', null)
    .order('scan_date', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data as GIDailyIntel;
}

/** Batch-fetch the most recent scores for all countries in a single query.
 *  If no date is given, fetches all rows with scores and keeps the newest per country.
 *  This handles the midnight-to-cron gap where "today" has no data yet. */
export async function getAllDailyScores(date?: string): Promise<Record<string, GIScores>> {
  const supabase = createClient();
  if (date) {
    const { data, error } = await supabase
      .from('gi_country_daily_intel')
      .select('country_id, scores_json')
      .eq('scan_date', date)
      .not('scores_json', 'is', null);
    if (error || !data) return {};
    const map: Record<string, GIScores> = {};
    for (const row of data) {
      if (row.scores_json && !map[row.country_id]) {
        map[row.country_id] = row.scores_json as GIScores;
      }
    }
    return map;
  }
  // No date — get the most recent scan_date that has data
  const { data: latest, error: latestErr } = await supabase
    .from('gi_country_daily_intel')
    .select('scan_date')
    .not('scores_json', 'is', null)
    .order('scan_date', { ascending: false })
    .limit(1)
    .single();
  if (latestErr || !latest) return {};
  const { data, error } = await supabase
    .from('gi_country_daily_intel')
    .select('country_id, scores_json')
    .eq('scan_date', latest.scan_date)
    .not('scores_json', 'is', null);
  if (error || !data) return {};
  const map: Record<string, GIScores> = {};
  for (const row of data) {
    if (row.scores_json && !map[row.country_id]) {
      map[row.country_id] = row.scores_json as GIScores;
    }
  }
  return map;
}

// ─── Category Midpoints (Asteroid-Enhanced) ────────────────

export interface CategoryMidpointEntry {
  pair: [string, string];
  midpoint_longitude: number;
  sign: string;
  degree: number;
  house: number;
  category: string;
  category_label: string;
  is_activated: boolean;
  activating_transit?: string;
  activation_orb?: number;
  activation_aspect?: string;
  mundane_significance?: string;
}

export interface CategoryMidpointReport {
  country: string;
  iso: string;
  date: string;
  categories: Record<string, CategoryMidpointEntry[]>;
  activated_count: number;
  total_count: number;
  skipped_asteroids: Array<{ name: string; mpc_number: number; reason: string }>;
  engine_version: string;
}

export interface MidpointCategoryInfo {
  key: string;
  label: string;
  planets: string[];
  points: string[];
  asteroids: string[];
  total_bodies: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';

export async function getCategoryMidpoints(
  iso: string,
  date?: string,
  category?: string,
): Promise<CategoryMidpointReport | null> {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (category) params.set('category', category);
  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const res = await fetch(
      `${API_BASE}/global-intelligence/countries/${iso.toUpperCase()}/midpoints${qs}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getMidpointCategories(): Promise<MidpointCategoryInfo[]> {
  try {
    const res = await fetch(
      `${API_BASE}/global-intelligence/midpoint-categories`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch {
    return [];
  }
}

export async function getCountryEvents(countryId: string, limit = 10): Promise<GICountryEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gi_country_events')
    .select('*')
    .eq('country_id', countryId)
    .order('event_date', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []) as GICountryEvent[];
}
