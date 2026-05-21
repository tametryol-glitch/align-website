import { createClient } from '@/lib/supabase';

export interface CosmicTimingWindow {
  id: string;
  startDate: string;
  endDate: string;
  planet: string;
  aspect: string;
  quality: 'excellent' | 'good' | 'neutral' | 'challenging';
  description: string;
  advice: string;
}

const LOVE_PLANETS = ['Venus', 'Mars', 'Moon', 'Jupiter'];

const SIGN_LONGITUDES: Record<string, number> = {
  Aries: 15, Taurus: 45, Gemini: 75, Cancer: 105,
  Leo: 135, Virgo: 165, Libra: 195, Scorpio: 225,
  Sagittarius: 255, Capricorn: 285, Aquarius: 315, Pisces: 345,
};

function getAspectQuality(aspectType: string): CosmicTimingWindow['quality'] {
  switch (aspectType) {
    case 'conjunction':
    case 'trine': return 'excellent';
    case 'sextile': return 'good';
    case 'opposition': return 'challenging';
    case 'square': return 'challenging';
    default: return 'neutral';
  }
}

function getAspectDescription(planet: string, aspect: string, quality: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    Venus: {
      excellent: `Venus aligns perfectly — heightened romance and deep emotional connection.`,
      good: `Venus sends gentle signals — a lovely time for shared experiences.`,
      challenging: `Venus tension can spark passionate discussions — channel it wisely.`,
      neutral: `Venus energy is steady — good for building consistency.`,
    },
    Mars: {
      excellent: `Mars brings bold chemistry — act on your desires.`,
      good: `Mars encourages initiative — take the lead on plans.`,
      challenging: `Mars friction may cause intensity — use direct communication.`,
      neutral: `Mars energy flows evenly — maintain your momentum.`,
    },
    Moon: {
      excellent: `The Moon creates emotional resonance — share your feelings.`,
      good: `Lunar energy supports nurturing — cozy together time.`,
      challenging: `Moon sensitivity is heightened — be extra gentle.`,
      neutral: `Emotional currents are calm — a stable period.`,
    },
    Jupiter: {
      excellent: `Jupiter expands love — a window for big relationship steps.`,
      good: `Jupiter brings optimism — adventure and growth together.`,
      challenging: `Jupiter excess can lead to over-promising — stay grounded.`,
      neutral: `Jupiter's influence is subtle — enjoy steady progress.`,
    },
  };

  return descriptions[planet]?.[quality] || `${planet} ${aspect} creates a noteworthy connection moment.`;
}

function getAdvice(planet: string, quality: string): string {
  if (quality === 'excellent') return `This is a prime window to meet up or have a meaningful conversation.`;
  if (quality === 'good') return `Plan something enjoyable together — the cosmos supports it.`;
  if (quality === 'challenging') return `Be patient and communicate clearly — growth can come from tension.`;
  return `Keep things natural and let the connection unfold.`;
}

export function generateTimingWindows(
  userSunSign: string | null,
  partnerSunSign: string | null,
): CosmicTimingWindow[] {
  if (!userSunSign || !partnerSunSign) return [];

  const windows: CosmicTimingWindow[] = [];
  const now = new Date();

  for (let i = 0; i < 4; i++) {
    const planet = LOVE_PLANETS[i % LOVE_PLANETS.length];
    const startOffset = 3 + i * 7 + Math.floor(Math.random() * 3);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + startOffset);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2 + Math.floor(Math.random() * 2));

    const aspects = ['trine', 'sextile', 'conjunction', 'square'];
    const aspect = aspects[i % aspects.length];
    const quality = getAspectQuality(aspect);

    windows.push({
      id: `timing-${i}-${planet}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      planet,
      aspect,
      quality,
      description: getAspectDescription(planet, aspect, quality),
      advice: getAdvice(planet, quality),
    });
  }

  return windows.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

export async function getTimingForMatch(
  userId: string,
  matchId: string,
): Promise<CosmicTimingWindow[]> {
  try {
    const supabase = createClient();

    const { data: match } = await supabase
      .from('dating_matches')
      .select('user_a_id, user_b_id')
      .eq('id', matchId)
      .single();

    if (!match) return [];

    const partnerId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, sun_sign')
      .in('id', [userId, partnerId]);

    if (!profiles || profiles.length < 2) return [];

    const mySign = profiles.find((p: any) => p.id === userId)?.sun_sign;
    const partnerSign = profiles.find((p: any) => p.id === partnerId)?.sun_sign;

    return generateTimingWindows(mySign, partnerSign);
  } catch {
    return [];
  }
}
