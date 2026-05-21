import { createClient } from '@/lib/supabase';
import { isGenderCompatible, isStyleCompatible } from '@/lib/relationshipProfileService';
import type { DatingProfile } from '@/lib/datingProfileService';
import type { TierLevel } from '@/stores/subscriptionStore';

// ── Types ──

export interface DatingCandidate {
  id: string;
  display_name: string | null;
  dating_bio: string | null;
  photo_urls: string[];
  voice_prompt_url: string | null;
  video_intro_url: string | null;
  dating_prompts: Array<{ prompt_id: string; question: string; answer: string }>;
  photo_verified: boolean;
  age_visible: boolean;
  birth_date: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  avatar_url: string | null;
  gender_identity: string | null;
  relationship_primary_intent: string | null;
  relationship_style: string | null;
  interested_in_genders: string[] | null;
  compatibility_score: number | null;
  cosmic_insight: string | null;
}

export interface DailyLimits {
  likes_used: number;
  roses_used: number;
  max_likes: number;
  max_roses: number;
}

export interface LikeResult {
  success: boolean;
  mutual: boolean;
  match_id?: string;
  conversation_id?: string;
  cosmic_match_id?: string;
  error?: string;
  limit?: number;
}

export interface DatingMatch {
  id: string;
  user_a_id: string;
  user_b_id: string;
  status: string;
  matched_at: string;
  conversation_id: string | null;
  cosmic_match_id: string | null;
  compatibility_score: number | null;
  icebreakers: Array<{ text: string; category: string }>;
  journey_started_at: string;
  created_at: string;
  updated_at: string;
  partner_profile?: DatingCandidate;
}

export interface ReceivedLike {
  id: string;
  liker_id: string;
  like_type: 'standard' | 'cosmic_rose';
  seen: boolean;
  created_at: string;
  liker_profile?: Partial<DatingCandidate>;
}

// ── Constants ──

const DAILY_PICKS: Record<TierLevel, number> = {
  free: 3,
  light: 5,
  premium: 8,
  pro: 12,
};

const DAILY_LIKES: Record<TierLevel, number> = {
  free: 5,
  light: 10,
  premium: 15,
  pro: 25,
};

const DAILY_ROSES: Record<TierLevel, number> = {
  free: 1,
  light: 2,
  premium: 3,
  pro: 5,
};

const CANDIDATE_FIELDS = [
  'id', 'display_name', 'dating_bio', 'photo_urls',
  'voice_prompt_url', 'video_intro_url', 'dating_prompts',
  'photo_verified', 'age_visible', 'birth_date',
  'sun_sign', 'moon_sign', 'rising_sign', 'avatar_url',
  'gender_identity', 'relationship_primary_intent',
  'relationship_style', 'interested_in_genders',
].join(', ');

function getSupabase() {
  return createClient();
}

// ── Quick sign-based compatibility score ──

const ELEMENT: Record<string, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

function quickCompatibility(sunA: string | null, sunB: string | null): number {
  if (!sunA || !sunB) return 50;
  const elA = ELEMENT[sunA];
  const elB = ELEMENT[sunB];
  if (!elA || !elB) return 50;
  if (elA === elB) return 75;
  const harmony: Record<string, string> = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' };
  if (harmony[elA] === elB) return 70;
  if ((elA === 'fire' && elB === 'water') || (elA === 'water' && elB === 'fire')) return 45;
  if ((elA === 'earth' && elB === 'air') || (elA === 'air' && elB === 'earth')) return 45;
  return 55;
}

// ── Public API ──

export async function getDailyCosmicPicks(
  userId: string,
  tier: TierLevel,
  filters?: {
    minAge?: number;
    maxAge?: number;
    minCompatibility?: number;
  },
): Promise<DatingCandidate[]> {
  try {
    if (!userId) return [];
    const supabase = getSupabase();
    const maxPicks = DAILY_PICKS[tier] || 3;

    const { data: candidateIds, error: rpcError } = await supabase.rpc(
      'get_dating_candidates',
      { p_user_id: userId, p_limit: maxPicks * 4 },
    );

    if (rpcError || !candidateIds || candidateIds.length === 0) return [];

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('sun_sign, interested_in_genders, relationship_style, gender_identity')
      .eq('id', userId)
      .single();

    const { data: candidates, error: profileError } = await supabase
      .from('profiles')
      .select(CANDIDATE_FIELDS)
      .in('id', candidateIds);

    if (profileError || !candidates) return [];

    let filtered = candidates.filter((c: any) => {
      if (!isGenderCompatible(myProfile?.interested_in_genders, c.gender_identity)) return false;
      if (!isGenderCompatible(c.interested_in_genders, myProfile?.gender_identity)) return false;
      if (!isStyleCompatible(myProfile?.relationship_style, c.relationship_style)) return false;

      if (filters?.minAge || filters?.maxAge) {
        if (!c.birth_date || !c.age_visible) return true;
        const age = getAge(c.birth_date);
        if (filters.minAge && age < filters.minAge) return false;
        if (filters.maxAge && age > filters.maxAge) return false;
      }

      return true;
    });

    const { data: cosmicMatches } = await supabase
      .from('cosmic_matches')
      .select('user_a_id, user_b_id, overall_score')
      .or(
        filtered
          .map((c: any) => {
            const [a, b] = userId < c.id ? [userId, c.id] : [c.id, userId];
            return `and(user_a_id.eq.${a},user_b_id.eq.${b})`;
          })
          .join(','),
      )
      .eq('status', 'ready');

    const scoreMap = new Map<string, number>();
    if (cosmicMatches) {
      for (const m of cosmicMatches) {
        const otherId = m.user_a_id === userId ? m.user_b_id : m.user_a_id;
        if (m.overall_score != null) scoreMap.set(otherId, m.overall_score);
      }
    }

    let scored: DatingCandidate[] = filtered.map((c: any) => ({
      ...c,
      compatibility_score: scoreMap.get(c.id) ?? quickCompatibility(myProfile?.sun_sign, c.sun_sign),
      cosmic_insight: null,
    }));

    if (filters?.minCompatibility) {
      scored = scored.filter(c => (c.compatibility_score ?? 0) >= filters.minCompatibility!);
    }

    scored.sort((a, b) => (b.compatibility_score ?? 0) - (a.compatibility_score ?? 0));

    return scored.slice(0, maxPicks);
  } catch {
    return [];
  }
}

export async function likeDatingProfile(
  userId: string,
  targetId: string,
  likeType: 'standard' | 'cosmic_rose' = 'standard',
): Promise<LikeResult> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.rpc('send_dating_like', {
      p_liker_id: userId,
      p_liked_id: targetId,
      p_like_type: likeType,
    });

    if (error) return { success: false, mutual: false, error: error.message };
    if (!data) return { success: false, mutual: false, error: 'No response from server' };

    return {
      success: data.success,
      mutual: data.mutual || false,
      match_id: data.match_id || undefined,
      conversation_id: data.conversation_id || undefined,
      cosmic_match_id: data.cosmic_match_id || undefined,
      error: data.error || undefined,
      limit: data.limit || undefined,
    };
  } catch (err: any) {
    return { success: false, mutual: false, error: err?.message || 'Like failed' };
  }
}

export async function passDatingProfile(userId: string, targetId: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('dating_passes')
      .insert({ passer_id: userId, passed_id: targetId });
    return !error;
  } catch {
    return false;
  }
}

export async function getDailyLimits(userId: string, tier: TierLevel): Promise<DailyLimits> {
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('dating_daily_limits')
      .select('likes_used, roses_used')
      .eq('user_id', userId)
      .eq('limit_date', today)
      .single();

    return {
      likes_used: data?.likes_used ?? 0,
      roses_used: data?.roses_used ?? 0,
      max_likes: DAILY_LIKES[tier] || 5,
      max_roses: DAILY_ROSES[tier] || 1,
    };
  } catch {
    return {
      likes_used: 0,
      roses_used: 0,
      max_likes: DAILY_LIKES[tier] || 5,
      max_roses: DAILY_ROSES[tier] || 1,
    };
  }
}

export async function getReceivedLikes(
  userId: string,
  tier: TierLevel,
): Promise<ReceivedLike[]> {
  try {
    const supabase = getSupabase();

    const { data: likes, error } = await supabase
      .from('dating_likes')
      .select('id, liker_id, like_type, seen, created_at')
      .eq('liked_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !likes) return [];

    const likerIds = likes.map((l: any) => l.liker_id);
    if (likerIds.length === 0) return [];

    const canSeeWho = tier !== 'free';

    if (canSeeWho) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(CANDIDATE_FIELDS)
        .in('id', likerIds);

      const profileMap = new Map<string, any>();
      if (profiles) {
        for (const p of profiles as any[]) profileMap.set(p.id, p);
      }

      return likes.map((l: any) => ({
        ...l,
        liker_profile: profileMap.get(l.liker_id) || undefined,
      }));
    }

    const { data: blurredProfiles } = await supabase
      .from('profiles')
      .select('id, sun_sign, photo_verified')
      .in('id', likerIds);

    const profileMap = new Map<string, any>();
    if (blurredProfiles) {
      for (const p of blurredProfiles as any[]) profileMap.set(p.id, p);
    }

    return likes.map((l: any) => ({
      ...l,
      liker_profile: profileMap.get(l.liker_id) || undefined,
    }));
  } catch {
    return [];
  }
}

export async function getDatingMatches(userId: string): Promise<DatingMatch[]> {
  try {
    const supabase = getSupabase();

    const { data: matches, error } = await supabase
      .from('dating_matches')
      .select('*')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq('status', 'active')
      .order('matched_at', { ascending: false });

    if (error || !matches) return [];

    const partnerIds = matches.map((m: any) =>
      m.user_a_id === userId ? m.user_b_id : m.user_a_id,
    );

    if (partnerIds.length === 0) return matches;

    const { data: profiles } = await supabase
      .from('profiles')
      .select(CANDIDATE_FIELDS)
      .in('id', partnerIds);

    const profileMap = new Map<string, any>();
    if (profiles) {
      for (const p of profiles as any[]) profileMap.set(p.id, p);
    }

    return matches.map((m: any) => {
      const partnerId = m.user_a_id === userId ? m.user_b_id : m.user_a_id;
      return { ...m, partner_profile: profileMap.get(partnerId) || undefined };
    });
  } catch {
    return [];
  }
}

export async function unmatch(userId: string, matchId: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.rpc('unmatch_dating', {
      p_user_id: userId,
      p_match_id: matchId,
    });
    return !!data;
  } catch {
    return false;
  }
}

export async function markLikesSeen(userId: string): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase
      .from('dating_likes')
      .update({ seen: true })
      .eq('liked_id', userId)
      .eq('seen', false);
  } catch {
    // silent
  }
}

export function subscribeToDatingMatches(
  userId: string,
  onMatch: (match: any) => void,
): { unsubscribe: () => void } {
  if (!userId) return { unsubscribe: () => {} };
  const supabase = getSupabase();

  const channel = supabase
    .channel('dating-matches')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'dating_matches', filter: `user_a_id=eq.${userId}` },
      (payload) => { if (payload.new) onMatch(payload.new); },
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'dating_matches', filter: `user_b_id=eq.${userId}` },
      (payload) => { if (payload.new) onMatch(payload.new); },
    )
    .subscribe();

  return { unsubscribe: () => { supabase.removeChannel(channel); } };
}

export function subscribeToDatingLikes(
  userId: string,
  onLike: (like: any) => void,
): { unsubscribe: () => void } {
  if (!userId) return { unsubscribe: () => {} };
  const supabase = getSupabase();

  const channel = supabase
    .channel('dating-likes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'dating_likes', filter: `liked_id=eq.${userId}` },
      (payload) => { if (payload.new) onLike(payload.new); },
    )
    .subscribe();

  return { unsubscribe: () => { supabase.removeChannel(channel); } };
}

// ── Helpers ──

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export { DAILY_PICKS, DAILY_LIKES, DAILY_ROSES };
