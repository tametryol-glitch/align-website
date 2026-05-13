/**
 * Fragment Service — Web port
 * CRUD + cached calculation retrieval for Fragments.
 * Data lives in Supabase `user_fragments` and `fragment_calculations` tables.
 */

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// ── Constants ───────────────────────────────────────────────────────
export const MAX_FRAGMENTS = 20;

// ── Types ───────────────────────────────────────────────────────────

export interface Fragment {
  id: string;
  user_id: string;
  fragment_user_id: string;
  status: 'active' | 'removed';
  created_at: string;
  updated_at: string;
  // Joined from profiles
  display_name?: string;
  avatar_url?: string | null;
  sun_sign?: string | null;
  moon_sign?: string | null;
  rising_sign?: string | null;
}

export interface FragmentCalculation {
  id: string;
  fragment_id: string;
  overall_score: number | null;
  emotional_score: number | null;
  physical_score: number | null;
  intellectual_score: number | null;
  spiritual_score: number | null;
  attraction_score: number | null;
  stability_score: number | null;
  karmic_score: number | null;
  current_cycle: string | null;
  cycle_intensity: number | null;
  cycle_summary: string | null;
  cycle_guidance: string | null;
  calculated_at: string | null;
}

// ── Helpers ─────────────────────────────────────────────────────────

function getMyId(): string | null {
  return useAuthStore.getState().user?.id || null;
}

// ── CRUD ────────────────────────────────────────────────────────────

/** Get all active fragments for the current user, with profile data joined */
export async function getMyFragments(): Promise<Fragment[]> {
  const myId = getMyId();
  if (!myId) return [];
  const supabase = createClient();

  // 1. Get fragment rows
  const { data: fragments, error } = await supabase
    .from('user_fragments')
    .select('id, user_id, fragment_user_id, status, created_at, updated_at')
    .eq('user_id', myId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error || !fragments || fragments.length === 0) return [];

  // 2. Fetch profiles for all fragment users in one query
  const fragmentUserIds = fragments.map(f => f.fragment_user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, sun_sign, moon_sign, rising_sign')
    .in('id', fragmentUserIds);

  const profileMap: Record<string, any> = {};
  if (profiles) {
    for (const p of profiles) profileMap[p.id] = p;
  }

  // 3. Merge
  return fragments.map((row: any) => {
    const prof = profileMap[row.fragment_user_id];
    return {
      id: row.id,
      user_id: row.user_id,
      fragment_user_id: row.fragment_user_id,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      display_name: prof?.display_name,
      avatar_url: prof?.avatar_url,
      sun_sign: prof?.sun_sign,
      moon_sign: prof?.moon_sign,
      rising_sign: prof?.rising_sign,
    };
  });
}

/** Get current fragment count */
export async function getFragmentCount(): Promise<number> {
  const myId = getMyId();
  if (!myId) return 0;
  const supabase = createClient();

  const { count, error } = await supabase
    .from('user_fragments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', myId)
    .eq('status', 'active');

  return error ? 0 : (count || 0);
}

/** Add a person as a Fragment */
export async function addFragment(
  fragmentUserId: string,
): Promise<{ success: boolean; error?: string; fragment?: Fragment }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };
  if (myId === fragmentUserId) return { success: false, error: 'Cannot add yourself' };
  const supabase = createClient();

  // Check count
  const count = await getFragmentCount();
  if (count >= MAX_FRAGMENTS) {
    return { success: false, error: `Maximum ${MAX_FRAGMENTS} Fragments reached` };
  }

  // Check duplicate / reactivation
  const { data: existing } = await supabase
    .from('user_fragments')
    .select('id, status')
    .eq('user_id', myId)
    .eq('fragment_user_id', fragmentUserId)
    .single();

  if (existing) {
    if (existing.status === 'active') {
      return { success: false, error: 'Already a Fragment' };
    }
    // Reactivate previously removed
    const { error } = await supabase
      .from('user_fragments')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Insert new
  const { data, error } = await supabase
    .from('user_fragments')
    .insert({
      user_id: myId,
      fragment_user_id: fragmentUserId,
      status: 'active',
    })
    .select('id, user_id, fragment_user_id, status, created_at, updated_at')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, fragment: data as Fragment };
}

/** Remove a Fragment (soft delete) */
export async function removeFragment(fragmentId: string): Promise<{ success: boolean }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_fragments')
    .update({ status: 'removed', updated_at: new Date().toISOString() })
    .eq('id', fragmentId);

  return { success: !error };
}

/** Get cached calculation for a fragment */
export async function getCachedCalculation(fragmentId: string): Promise<FragmentCalculation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('fragment_calculations')
    .select('*')
    .eq('fragment_id', fragmentId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as FragmentCalculation;
}
