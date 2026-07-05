/**
 * Zodisphere Service -- the Align community globe.
 *
 * PRIVACY MODEL (do not weaken):
 *  - All community counts come from zodisphere_public_area_stats(), a
 *    SECURITY DEFINER RPC that suppresses areas below k=10 members and
 *    returns BANDS (e.g. "25-49"), never exact numbers.
 *  - Feeds/members/events come from block- & mute-aware RPCs; the client
 *    never filters visibility itself.
 *  - Exact event venues are only reachable via zodisphere_event_venue()
 *    (registration/purchase-gated; venue columns are not selectable).
 *  - A user's place is a manually selected AREA (city/region/country),
 *    never a device location. Default visibility is HIDDEN.
 */

import { createClient } from './supabase';

// ===================================================================
// Types
// ===================================================================

export type GeographicLevel = 'country' | 'region' | 'island' | 'state' | 'province' | 'city';
export type VisibilityMode = 'hidden' | 'country' | 'region' | 'city' | 'friends' | 'selected' | 'public';
export type CountBand = '10-24' | '25-49' | '50-99' | '100-249' | '250-499' | '500-999' | '1000+';

/** Version string logged with every consent action. Bump when the
 *  Zodisphere privacy disclosure text materially changes. */
export const ZODISPHERE_CONSENT_VERSION = 'zodisphere-v1-2026-07';

export interface AreaStat {
  area_id: string;
  display_name: string;
  geographic_level: GeographicLevel;
  center_lat: number;
  center_lng: number;
  member_band: CountBand | null;
  active_band: CountBand | null;
  post_band: CountBand | null;
  creator_band: CountBand | null;
  event_band: CountBand | null;
  calculated_at: string;
}

export interface Area {
  id: string;
  geographic_level: GeographicLevel;
  country_code: string;
  region_name: string | null;
  city_name: string | null;
  display_name: string;
  center_lat: number;
  center_lng: number;
}

export interface ZodispherePost {
  id: string;
  user_id: string;
  area_id: string;
  content_type: 'text' | 'photo' | 'video' | 'voice' | 'question' | 'discussion';
  body: string;
  media_url: string | null;
  created_at: string;
}

export interface ZodisphereEvent {
  id: string;
  creator_id: string;
  area_id: string;
  title: string;
  description: string;
  event_type: string;
  online_or_physical: 'online' | 'physical';
  venue_visibility: 'public' | 'after_register' | 'after_purchase';
  has_venue: boolean;
  start_time: string | null;
  end_time: string | null;
}

export interface ZodispherePrefs {
  area_id: string | null;
  discoverable_on_map: boolean;
  visibility_mode: VisibilityMode;
  consent_version: string | null;
  consent_given_at: string | null;
}

// ===================================================================
// Aggregated map data (banded, k>=10 — the only public counts path)
// ===================================================================

export async function getPublicAreaStats(): Promise<AreaStat[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('zodisphere_public_area_stats');
  if (error) {
    console.error('[zodisphere] area stats failed:', error.message);
    return [];
  }
  return (data as AreaStat[]) ?? [];
}

// ===================================================================
// Discoverable members in an area (opt-in, block/mute-aware server-side)
// ===================================================================

export interface AreaMember {
  user_id: string;
  visibility_mode: VisibilityMode;
  display_name: string | null;
  avatar_url: string | null;
}

/** People who opted in to be discoverable in this area. The RPC excludes
 *  the caller, blocked, and muted users; this only appears when someone
 *  chose city/region/country/public visibility. */
export async function getAreaMembers(areaId: string): Promise<AreaMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('zodisphere_area_members', { p_area_id: areaId, p_limit: 50 });
  if (error) {
    console.error('[zodisphere] area members failed:', error.message);
    return [];
  }
  const rows = (data as { user_id: string; visibility_mode: VisibilityMode }[]) ?? [];
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.user_id);
  const { data: profs } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', ids);
  const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
  return rows.map((r) => ({
    user_id: r.user_id,
    visibility_mode: r.visibility_mode,
    display_name: byId.get(r.user_id)?.display_name ?? null,
    avatar_url: byId.get(r.user_id)?.avatar_url ?? null,
  }));
}

// ===================================================================
// Areas (public reference — place centroids, not people)
// ===================================================================

export async function searchAreas(query: string, level?: GeographicLevel): Promise<Area[]> {
  const supabase = createClient();
  let q = supabase
    .from('zodisphere_areas')
    .select('id, geographic_level, country_code, region_name, city_name, display_name, center_lat, center_lng')
    .ilike('display_name', `%${query}%`)
    .eq('is_active', true)
    .limit(20);
  if (level) q = q.eq('geographic_level', level);
  const { data, error } = await q;
  if (error) {
    console.error('[zodisphere] area search failed:', error.message);
    return [];
  }
  return (data as Area[]) ?? [];
}

export async function getArea(areaId: string): Promise<Area | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('zodisphere_areas')
    .select('id, geographic_level, country_code, region_name, city_name, display_name, center_lat, center_lng')
    .eq('id', areaId)
    .maybeSingle();
  if (error) {
    console.error('[zodisphere] getArea failed:', error.message);
    return null;
  }
  return data as Area | null;
}

// ===================================================================
// Area feed / events (block- & mute-aware via SECURITY DEFINER RPCs)
// ===================================================================

export async function getAreaFeed(areaId: string, limit = 30, offset = 0): Promise<ZodispherePost[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('zodisphere_area_feed', {
    p_area_id: areaId,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) {
    console.error('[zodisphere] area feed failed:', error.message);
    return [];
  }
  return (data as ZodispherePost[]) ?? [];
}

export async function getAreaEvents(areaId: string): Promise<ZodisphereEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('zodisphere_area_events', { p_area_id: areaId });
  if (error) {
    console.error('[zodisphere] area events failed:', error.message);
    return [];
  }
  return (data as ZodisphereEvent[]) ?? [];
}

/** Exact venue — only returns rows when the caller is the creator, the
 *  venue is public, or the caller registered/purchased per the event's
 *  venue_visibility. Enforced server-side; empty result = not authorized. */
export async function getEventVenue(eventId: string): Promise<{ venue_name: string | null; venue_details: string | null } | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('zodisphere_event_venue', { p_event_id: eventId });
  if (error) {
    console.error('[zodisphere] event venue failed:', error.message);
    return null;
  }
  const rows = data as { venue_name: string | null; venue_details: string | null }[];
  return rows?.[0] ?? null;
}

// ===================================================================
// Posting
// ===================================================================

export async function createZodispherePost(input: {
  areaId: string;
  contentType: ZodispherePost['content_type'];
  body: string;
  mediaUrl?: string;
  mediaStripped?: boolean;
  visibility?: 'public' | 'friends';
  expiresAt?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { success: false, error: 'Not signed in' };
  const { error } = await supabase.from('zodisphere_posts').insert({
    user_id: auth.user.id,
    area_id: input.areaId,
    content_type: input.contentType,
    body: input.body,
    media_url: input.mediaUrl ?? null,
    media_stripped: input.mediaStripped ?? false,
    visibility: input.visibility ?? 'public',
    expires_at: input.expiresAt ?? null,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ===================================================================
// My visibility preferences (owner-only rows; consent auto-logged by
// a DB trigger — the client cannot forget to log it)
// ===================================================================

export async function getMyPrefs(): Promise<ZodispherePrefs | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;
  const { data, error } = await supabase
    .from('zodisphere_user_prefs')
    .select('area_id, discoverable_on_map, visibility_mode, consent_version, consent_given_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (error) {
    console.error('[zodisphere] getMyPrefs failed:', error.message);
    return null;
  }
  return data as ZodispherePrefs | null;
}

export async function upsertMyPrefs(input: {
  areaId: string | null;
  discoverable: boolean;
  visibilityMode: VisibilityMode;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { success: false, error: 'Not signed in' };
  const optingIn = input.discoverable && input.visibilityMode !== 'hidden';
  const { error } = await supabase.from('zodisphere_user_prefs').upsert(
    {
      user_id: auth.user.id,
      area_id: input.areaId,
      discoverable_on_map: input.discoverable,
      visibility_mode: input.visibilityMode,
      consent_version: ZODISPHERE_CONSENT_VERSION,
      consent_given_at: optingIn ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id' }
  );
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Full removal of the location association (consent withdrawal). */
export async function removeMyLocationAssociation(): Promise<{ success: boolean; error?: string }> {
  return upsertMyPrefs({ areaId: null, discoverable: false, visibilityMode: 'hidden' });
}

// ===================================================================
// Reporting (UGC safety — flows into the admin moderation queue)
// ===================================================================

export type ZodisphereReportCategory =
  | 'location_doxxing'      // exposing someone's exact location / address
  | 'location_harassment'   // stalking or harassment via geographic features
  | 'inappropriate_content';

/** Report a Zodisphere post. Inserts into the same `reports` table the
 *  admin moderation queue reads (mirrors mobile trustSafety columns). */
export async function reportZodispherePost(
  post: Pick<ZodispherePost, 'id' | 'user_id' | 'area_id'>,
  category: ZodisphereReportCategory
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { success: false, error: 'Not signed in' };
  const { error } = await supabase.from('reports').insert({
    report_id: crypto.randomUUID(),
    reporter_id: auth.user.id,
    reported_user_id: post.user_id,
    category,
    description: `Zodisphere post ${post.id} in area ${post.area_id}`,
    evidence: [],
    status: 'pending',
    created_at: new Date().toISOString(),
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ===================================================================
// Mutes (map-scope soft filter; blocks are handled by friendService)
// ===================================================================

export async function muteUserOnMap(mutedId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { success: false, error: 'Not signed in' };
  const { error } = await supabase
    .from('zodisphere_mutes')
    .upsert({ muter_id: auth.user.id, muted_id: mutedId }, { onConflict: 'muter_id,muted_id' });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function unmuteUserOnMap(mutedId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { success: false, error: 'Not signed in' };
  const { error } = await supabase
    .from('zodisphere_mutes')
    .delete()
    .eq('muter_id', auth.user.id)
    .eq('muted_id', mutedId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ===================================================================
// Band helpers (display)
// ===================================================================

/** Midpoint of a band, used ONLY for visual sizing on the globe —
 *  never displayed as a number. */
export function bandMidpoint(band: CountBand | null): number {
  switch (band) {
    case '10-24': return 17;
    case '25-49': return 37;
    case '50-99': return 75;
    case '100-249': return 175;
    case '250-499': return 375;
    case '500-999': return 750;
    case '1000+': return 1200;
    default: return 0;
  }
}

export function bandLabel(band: CountBand | null): string {
  return band ? `${band} members` : 'Community forming';
}
