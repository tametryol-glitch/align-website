import { createClient } from '@/lib/supabase';

export interface CoachInsight {
  insight: string;
  source: 'ai' | 'template';
  topic: string;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function getCoachInsight(
  userId: string,
  matchId: string,
  topic?: string,
): Promise<CoachInsight | null> {
  try {
    const supabase = createClient();

    const { data: match } = await supabase
      .from('dating_matches')
      .select('user_a_id, user_b_id, compatibility_score, matched_at, coach_insights')
      .eq('id', matchId)
      .single();

    if (!match) return null;

    const partnerId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, sun_sign, moon_sign, rising_sign')
      .in('id', [userId, partnerId]);

    if (!profiles || profiles.length < 2) return null;

    const me = profiles.find((p: any) => p.id === userId);
    const partner = profiles.find((p: any) => p.id === partnerId);
    if (!me || !partner) return null;

    const { data: milestones } = await supabase
      .from('dating_milestones')
      .select('id')
      .eq('match_id', matchId);

    const daysMatched = Math.floor(
      (Date.now() - new Date(match.matched_at).getTime()) / 86400000
    );

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token || '';

    const resp = await fetch(`${API_BASE}/api/v1/dating/relationship-coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-user-tier': 'premium',
      },
      body: JSON.stringify({
        user_sun_sign: me.sun_sign || 'Aries',
        partner_sun_sign: partner.sun_sign || 'Aries',
        user_moon_sign: me.moon_sign,
        partner_moon_sign: partner.moon_sign,
        compatibility_score: match.compatibility_score,
        days_matched: daysMatched,
        milestone_count: milestones?.length || 0,
        topic,
      }),
    });

    if (!resp.ok) return null;

    const result = await resp.json();

    const insight: CoachInsight = {
      insight: result.insight,
      source: result.source,
      topic: result.topic,
      created_at: new Date().toISOString(),
    };

    const existingInsights = Array.isArray(match.coach_insights) ? match.coach_insights : [];
    await supabase
      .from('dating_matches')
      .update({
        coach_insights: [...existingInsights, insight].slice(-10),
      })
      .eq('id', matchId);

    return insight;
  } catch {
    return null;
  }
}

export async function getCoachHistory(matchId: string): Promise<CoachInsight[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('dating_matches')
    .select('coach_insights')
    .eq('id', matchId)
    .single();

  if (!data?.coach_insights) return [];
  return Array.isArray(data.coach_insights) ? data.coach_insights : [];
}
