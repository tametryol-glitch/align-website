import { api, buildBirthData } from '@/lib/api';
import type { UserProfile } from '@/stores/authStore';

// ═══════════════════════════════════════════════════════════════════
// AI Chart Context Builder
// Fetches the user's natal chart and formats it into a concise
// context string for the AI astrologer system prompt, plus extracts
// key placements for personalized suggested questions.
// ═══════════════════════════════════════════════════════════════════

export interface ChartPlacement {
  name: string;
  sign: string;
  house: number | null;
  degree: number | null;
  isRetrograde: boolean;
}

export interface ChartContext {
  /** Full formatted context string for the AI system prompt */
  contextText: string;
  /** Key placements extracted for suggested questions */
  sunSign: string | null;
  sunHouse: number | null;
  moonSign: string | null;
  moonHouse: number | null;
  risingSign: string | null;
  venusSign: string | null;
  venusHouse: number | null;
  marsSign: string | null;
  marsHouse: number | null;
  /** All planet placements */
  placements: ChartPlacement[];
  /** Whether chart data was successfully loaded */
  loaded: boolean;
}

const EMPTY_CONTEXT: ChartContext = {
  contextText: '',
  sunSign: null,
  sunHouse: null,
  moonSign: null,
  moonHouse: null,
  risingSign: null,
  venusSign: null,
  venusHouse: null,
  marsSign: null,
  marsHouse: null,
  placements: [],
  loaded: false,
};

/**
 * Extract a specific planet placement from the chart data planets array.
 */
function findPlanet(planets: any[], name: string): ChartPlacement | null {
  const p = planets.find(
    (pl: any) => (pl.name || pl.planet || '').toLowerCase() === name.toLowerCase()
  );
  if (!p) return null;
  return {
    name: p.name || p.planet || name,
    sign: p.sign || '',
    house: p.house ?? null,
    degree: p.sign_degree ?? null,
    isRetrograde: !!p.is_retrograde,
  };
}

/**
 * Build chart context from the user's natal chart data.
 * Uses the same API call pattern as the existing AI page.
 *
 * @param profile - The user's profile from authStore
 * @param chartData - Pre-fetched chart data (optional; will fetch if not provided)
 * @returns ChartContext with formatted text and extracted placements
 */
export async function buildChartContext(
  profile: UserProfile | null,
  chartData?: any
): Promise<ChartContext> {
  if (!profile?.birth_date || !profile?.latitude) {
    return EMPTY_CONTEXT;
  }

  let data = chartData;
  if (!data) {
    try {
      data = await api.getNatalChart(buildBirthData(profile));
    } catch {
      return EMPTY_CONTEXT;
    }
  }

  if (!data) return EMPTY_CONTEXT;

  const planets = data.planets || data.positions || [];
  if (planets.length === 0) {
    // Fall back to profile-level sign data if API returned no planets
    return {
      ...EMPTY_CONTEXT,
      sunSign: profile.sun_sign || null,
      moonSign: profile.moon_sign || null,
      risingSign: profile.rising_sign || null,
      contextText: buildFallbackContextText(profile),
      loaded: !!(profile.sun_sign || profile.moon_sign || profile.rising_sign),
    };
  }

  // Extract key placements
  const sun = findPlanet(planets, 'Sun');
  const moon = findPlanet(planets, 'Moon');
  const mercury = findPlanet(planets, 'Mercury');
  const venus = findPlanet(planets, 'Venus');
  const mars = findPlanet(planets, 'Mars');
  const jupiter = findPlanet(planets, 'Jupiter');
  const saturn = findPlanet(planets, 'Saturn');
  const uranus = findPlanet(planets, 'Uranus');
  const neptune = findPlanet(planets, 'Neptune');
  const pluto = findPlanet(planets, 'Pluto');

  // Determine rising sign from houses or profile
  const houses = data.houses || [];
  const risingSign =
    (houses.length > 0 ? houses[0]?.sign : null) ||
    profile.rising_sign ||
    null;

  // Build all placements
  const allPlacements: ChartPlacement[] = planets.map((p: any) => ({
    name: p.name || p.planet || 'Unknown',
    sign: p.sign || '',
    house: p.house ?? null,
    degree: p.sign_degree ?? null,
    isRetrograde: !!p.is_retrograde,
  }));

  // Build context text
  const lines: string[] = [];
  lines.push("User's Natal Chart:");

  if (sun) lines.push(`- Sun: ${sun.sign} in House ${sun.house || '?'}`);
  if (moon) lines.push(`- Moon: ${moon.sign} in House ${moon.house || '?'}`);
  if (risingSign) lines.push(`- Rising: ${risingSign}`);
  if (mercury) lines.push(`- Mercury: ${mercury.sign} in House ${mercury.house || '?'}${mercury.isRetrograde ? ' (Rx)' : ''}`);
  if (venus) lines.push(`- Venus: ${venus.sign} in House ${venus.house || '?'}`);
  if (mars) lines.push(`- Mars: ${mars.sign} in House ${mars.house || '?'}`);
  if (jupiter) lines.push(`- Jupiter: ${jupiter.sign} in House ${jupiter.house || '?'}`);
  if (saturn) lines.push(`- Saturn: ${saturn.sign} in House ${saturn.house || '?'}${saturn.isRetrograde ? ' (Rx)' : ''}`);
  if (uranus) lines.push(`- Uranus: ${uranus.sign} in House ${uranus.house || '?'}${uranus.isRetrograde ? ' (Rx)' : ''}`);
  if (neptune) lines.push(`- Neptune: ${neptune.sign} in House ${neptune.house || '?'}${neptune.isRetrograde ? ' (Rx)' : ''}`);
  if (pluto) lines.push(`- Pluto: ${pluto.sign} in House ${pluto.house || '?'}${pluto.isRetrograde ? ' (Rx)' : ''}`);

  // Birth info
  const birthParts: string[] = [];
  if (profile.birth_date) birthParts.push(profile.birth_date);
  if (profile.birth_time) birthParts.push(`at ${profile.birth_time}`);
  if (profile.birth_location) birthParts.push(`in ${profile.birth_location}`);
  if (birthParts.length > 0) {
    lines.push(`Born: ${birthParts.join(' ')}`);
  }

  return {
    contextText: lines.join('\n'),
    sunSign: sun?.sign || profile.sun_sign || null,
    sunHouse: sun?.house || null,
    moonSign: moon?.sign || profile.moon_sign || null,
    moonHouse: moon?.house || null,
    risingSign,
    venusSign: venus?.sign || null,
    venusHouse: venus?.house || null,
    marsSign: mars?.sign || null,
    marsHouse: mars?.house || null,
    placements: allPlacements,
    loaded: true,
  };
}

/**
 * Build a minimal context from profile-level sign fields when the full
 * natal chart API call fails or returns no planet positions.
 */
function buildFallbackContextText(profile: UserProfile): string {
  const lines: string[] = ["User's Natal Chart (basic):"];
  if (profile.sun_sign) lines.push(`- Sun: ${profile.sun_sign}`);
  if (profile.moon_sign) lines.push(`- Moon: ${profile.moon_sign}`);
  if (profile.rising_sign) lines.push(`- Rising: ${profile.rising_sign}`);

  const birthParts: string[] = [];
  if (profile.birth_date) birthParts.push(profile.birth_date);
  if (profile.birth_time) birthParts.push(`at ${profile.birth_time}`);
  if (profile.birth_location) birthParts.push(`in ${profile.birth_location}`);
  if (birthParts.length > 0) {
    lines.push(`Born: ${birthParts.join(' ')}`);
  }

  return lines.join('\n');
}

/**
 * Build personalized suggested questions based on chart placements.
 * Returns an array of question strings that reference the user's actual signs/houses.
 */
export function buildSuggestedQuestions(ctx: ChartContext): string[] {
  const questions: string[] = [];

  if (ctx.sunSign && ctx.sunHouse) {
    questions.push(`What does my ${ctx.sunSign} Sun in the ${ordinal(ctx.sunHouse)} house mean?`);
  } else if (ctx.sunSign) {
    questions.push(`What does my ${ctx.sunSign} Sun say about my identity?`);
  }

  if (ctx.moonSign) {
    questions.push(`How does my ${ctx.moonSign} Moon affect my emotions?`);
  }

  questions.push('What career paths suit my chart?');
  questions.push('Tell me about my upcoming transits');

  if (ctx.venusSign) {
    questions.push(`What's my love language based on my ${ctx.venusSign} Venus?`);
  } else {
    questions.push("What's my love language based on my Venus placement?");
  }

  if (ctx.risingSign) {
    questions.push(`How does my ${ctx.risingSign} Rising affect first impressions?`);
  }

  if (ctx.marsSign) {
    questions.push(`What motivates me based on my ${ctx.marsSign} Mars?`);
  }

  return questions;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
