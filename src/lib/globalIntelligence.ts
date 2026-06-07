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
  const targetDate = date || new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('gi_country_daily_intel')
    .select('*')
    .eq('country_id', countryId)
    .eq('scan_date', targetDate)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data as GIDailyIntel;
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
