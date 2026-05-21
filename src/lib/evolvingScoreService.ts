import { createClient } from '@/lib/supabase';

export interface EvolvingScore {
  matchId: string;
  currentScore: number;
  previousScore: number | null;
  trend: 'rising' | 'stable' | 'declining';
  factors: ScoreFactor[];
  updatedAt: string;
}

export interface ScoreFactor {
  label: string;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
}

const SIGN_ELEMENT: Record<string, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  fire: { fire: 8, air: 9, earth: 4, water: 3 },
  earth: { earth: 8, water: 9, fire: 4, air: 3 },
  air: { air: 8, fire: 9, water: 4, earth: 3 },
  water: { water: 8, earth: 9, air: 4, fire: 3 },
};

export async function getEvolvingScore(
  userId: string,
  matchId: string,
): Promise<EvolvingScore | null> {
  try {
    const supabase = createClient();

    const { data: match } = await supabase
      .from('dating_matches')
      .select('user_a_id, user_b_id, compatibility_score, evolving_score, evolving_score_updated_at, matched_at')
      .eq('id', matchId)
      .single();

    if (!match) return null;

    const partnerId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, sun_sign, moon_sign')
      .in('id', [userId, partnerId]);

    if (!profiles || profiles.length < 2) return null;

    const me = profiles.find((p: any) => p.id === userId);
    const partner = profiles.find((p: any) => p.id === partnerId);
    if (!me || !partner) return null;

    const { data: milestones } = await supabase
      .from('dating_milestones')
      .select('milestone_type')
      .eq('match_id', matchId);

    const baseScore = match.compatibility_score || 50;
    const daysMatched = Math.floor(
      (Date.now() - new Date(match.matched_at).getTime()) / 86400000
    );

    const factors: ScoreFactor[] = [];
    let modifier = 0;

    // Time bonus
    if (daysMatched >= 30) {
      modifier += 3;
      factors.push({ label: 'Time Investment', impact: 'positive', description: 'Over a month of connection builds depth.' });
    } else if (daysMatched >= 7) {
      modifier += 1;
      factors.push({ label: 'Growing Bond', impact: 'positive', description: 'A week of shared energy strengthens your link.' });
    }

    // Milestone bonus
    const milestoneCount = milestones?.length || 0;
    if (milestoneCount >= 5) {
      modifier += 4;
      factors.push({ label: 'Milestone Rich', impact: 'positive', description: 'Many shared milestones deepen your cosmic bond.' });
    } else if (milestoneCount >= 2) {
      modifier += 2;
      factors.push({ label: 'Building Memories', impact: 'positive', description: 'Each milestone adds to your story.' });
    }

    // Element compatibility
    const myEl = SIGN_ELEMENT[me.sun_sign || ''];
    const partnerEl = SIGN_ELEMENT[partner.sun_sign || ''];
    if (myEl && partnerEl) {
      const elScore = ELEMENT_COMPAT[myEl]?.[partnerEl] || 5;
      if (elScore >= 8) {
        modifier += 2;
        factors.push({ label: 'Elemental Harmony', impact: 'positive', description: `${myEl} and ${partnerEl} elements flow naturally together.` });
      } else if (elScore <= 4) {
        modifier -= 1;
        factors.push({ label: 'Elemental Tension', impact: 'negative', description: `${myEl} and ${partnerEl} require conscious effort to harmonize.` });
      }
    }

    // Moon sign harmony
    if (me.moon_sign && partner.moon_sign) {
      const moonMyEl = SIGN_ELEMENT[me.moon_sign];
      const moonPartnerEl = SIGN_ELEMENT[partner.moon_sign];
      if (moonMyEl && moonPartnerEl) {
        const moonCompat = ELEMENT_COMPAT[moonMyEl]?.[moonPartnerEl] || 5;
        if (moonCompat >= 8) {
          modifier += 2;
          factors.push({ label: 'Emotional Sync', impact: 'positive', description: 'Your Moon signs create deep emotional understanding.' });
        }
      }
    }

    const currentScore = Math.min(99, Math.max(1, baseScore + modifier));
    const previousScore = match.evolving_score || null;

    let trend: 'rising' | 'stable' | 'declining' = 'stable';
    if (previousScore != null) {
      if (currentScore > previousScore + 1) trend = 'rising';
      else if (currentScore < previousScore - 1) trend = 'declining';
    }

    // Save updated score
    await supabase
      .from('dating_matches')
      .update({
        evolving_score: currentScore,
        evolving_score_updated_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    return {
      matchId,
      currentScore,
      previousScore,
      trend,
      factors,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
