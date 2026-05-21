import { createClient } from '@/lib/supabase';

export interface CosmicCertificate {
  matchId: string;
  userA: { name: string; sunSign: string; moonSign: string | null };
  userB: { name: string; sunSign: string; moonSign: string | null };
  matchedAt: string;
  compatibilityScore: number | null;
  highlights: CertificateHighlight[];
  milestoneCount: number;
  daysConnected: number;
}

export interface CertificateHighlight {
  label: string;
  value: string;
  icon: string;
}

export async function generateCertificate(
  userId: string,
  matchId: string,
): Promise<CosmicCertificate | null> {
  try {
    const supabase = createClient();

    const { data: match } = await supabase
      .from('dating_matches')
      .select('user_a_id, user_b_id, matched_at, compatibility_score, cosmic_match_id')
      .eq('id', matchId)
      .single();

    if (!match) return null;
    if (match.user_a_id !== userId && match.user_b_id !== userId) return null;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, sun_sign, moon_sign, rising_sign')
      .in('id', [match.user_a_id, match.user_b_id]);

    if (!profiles || profiles.length < 2) return null;

    const profA = profiles.find((p: any) => p.id === match.user_a_id);
    const profB = profiles.find((p: any) => p.id === match.user_b_id);
    if (!profA || !profB) return null;

    const { data: milestones } = await supabase
      .from('dating_milestones')
      .select('id')
      .eq('match_id', matchId);

    const daysConnected = Math.floor(
      (Date.now() - new Date(match.matched_at).getTime()) / 86400000
    );

    const highlights: CertificateHighlight[] = [];

    if (profA.sun_sign === profB.sun_sign) {
      highlights.push({ label: 'Same Sun Sign', value: profA.sun_sign, icon: '☀️' });
    }
    if (profA.moon_sign && profB.moon_sign && profA.moon_sign === profB.moon_sign) {
      highlights.push({ label: 'Same Moon Sign', value: profA.moon_sign, icon: '🌙' });
    }

    if (match.compatibility_score != null) {
      if (match.compatibility_score >= 90) {
        highlights.push({ label: 'Cosmic Soulmates', value: `${match.compatibility_score}%`, icon: '💫' });
      } else if (match.compatibility_score >= 75) {
        highlights.push({ label: 'Strong Cosmic Bond', value: `${match.compatibility_score}%`, icon: '✨' });
      }
    }

    const elementMap: Record<string, string> = {
      Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
      Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
      Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
      Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
    };

    const elA = elementMap[profA.sun_sign] || '';
    const elB = elementMap[profB.sun_sign] || '';
    if (elA && elB) {
      highlights.push({ label: 'Element Blend', value: `${elA} + ${elB}`, icon: '🔥' });
    }

    return {
      matchId,
      userA: { name: profA.display_name || 'User A', sunSign: profA.sun_sign || '', moonSign: profA.moon_sign },
      userB: { name: profB.display_name || 'User B', sunSign: profB.sun_sign || '', moonSign: profB.moon_sign },
      matchedAt: match.matched_at,
      compatibilityScore: match.compatibility_score,
      highlights,
      milestoneCount: milestones?.length || 0,
      daysConnected,
    };
  } catch {
    return null;
  }
}
