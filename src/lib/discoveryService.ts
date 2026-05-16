import { createClient } from '@/lib/supabase';
import { isGenderCompatible, isStyleCompatible } from '@/lib/relationshipProfileService';

export interface SuggestedUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  reason: string;
}

function getSupabase() {
  return createClient();
}

export async function getSuggestedFriends(myId: string, limit: number = 10): Promise<SuggestedUser[]> {
  try {
    if (!myId) return [];

    const { data: myProfile } = await getSupabase()
      .from('profiles')
      .select('sun_sign, moon_sign, interested_in_genders, relationship_style, gender_identity')
      .eq('id', myId)
      .single();

    const { data: candidates, error } = await getSupabase()
      .from('profiles')
      .select('id, display_name, avatar_url, sun_sign, moon_sign, created_at, gender_identity, interested_in_genders, relationship_style')
      .neq('id', myId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !candidates) return [];

    const scored = candidates
      .filter(user => {
        if (!isGenderCompatible(myProfile?.interested_in_genders, user.gender_identity)) return false;
        if (!isGenderCompatible(user.interested_in_genders, myProfile?.gender_identity)) return false;
        if (!isStyleCompatible(myProfile?.relationship_style, user.relationship_style)) return false;
        return true;
      })
      .map(user => {
        let score = 0;
        let reason = 'New on Align';

        if (myProfile?.sun_sign && user.sun_sign) {
          const compatible = getCompatibleSigns(myProfile.sun_sign);
          if (compatible.includes(user.sun_sign)) {
            score += 3;
            reason = `Compatible ${user.sun_sign} sun`;
          }
        }

        if (myProfile?.moon_sign && user.moon_sign && myProfile.moon_sign === user.moon_sign) {
          score += 2;
          reason = `Same moon sign: ${user.moon_sign}`;
        }

        const daysSinceJoin = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceJoin < 7) {
          score += 1;
          if (reason === 'New on Align') reason = 'Just joined Align';
        }

        return { ...user, score, reason };
      });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, created_at, gender_identity, interested_in_genders, relationship_style, ...user }) => user);
  } catch {
    return [];
  }
}

function getCompatibleSigns(sign: string): string[] {
  const elements: Record<string, string[]> = {
    fire: ['Aries', 'Leo', 'Sagittarius'],
    earth: ['Taurus', 'Virgo', 'Capricorn'],
    air: ['Gemini', 'Libra', 'Aquarius'],
    water: ['Cancer', 'Scorpio', 'Pisces'],
  };

  for (const [, signs] of Object.entries(elements)) {
    if (signs.includes(sign)) return signs;
  }
  return [];
}
