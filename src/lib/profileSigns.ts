import { createClient } from '@/lib/supabase';
import { api, buildBirthData } from '@/lib/api';

/**
 * Sun / Moon / Rising are stored as plain columns on `profiles` and read all
 * over the app (profile header, feed cards, friend lists, share cards). Until
 * now nothing ever WROTE them — onboarding computed the three signs only to
 * animate the reveal screen and then threw them away — so every account has
 * them NULL and renders no zodiac chips at all.
 *
 * These helpers derive the signs from the user's own natal chart and persist
 * them, back-filling existing accounts the first time they load the site.
 */

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function signFromLongitude(lon: unknown): string | null {
  if (typeof lon !== 'number' || !Number.isFinite(lon)) return null;
  return ZODIAC_ORDER[Math.floor((((lon % 360) + 360) % 360) / 30) % 12] || null;
}

/** Pull {sun,moon,rising} out of a natal-chart response in either shape. */
export function signsFromChart(chart: any): {
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
} {
  const bodies: any[] = Array.isArray(chart?.positions)
    ? chart.positions
    : Array.isArray(chart?.planets)
      ? chart.planets
      : [];
  const find = (n: string) => bodies.find((p: any) => p?.name === n);
  const sun = find('Sun');
  const moon = find('Moon');
  const asc = find('Ascendant');
  return {
    sun_sign: sun?.sign || signFromLongitude(sun?.longitude),
    moon_sign: moon?.sign || signFromLongitude(moon?.longitude),
    rising_sign:
      asc?.sign || signFromLongitude(asc?.longitude) || signFromLongitude(chart?.ascendant),
  };
}

/**
 * Write the three signs onto the profile row when they are missing or stale.
 * Returns the fields it actually wrote, so the caller can patch its local
 * profile object without a refetch. Best effort — never throws.
 */
export async function syncProfileSignsFromChart(
  userId: string,
  chart: any,
  current?: { sun_sign?: string | null; moon_sign?: string | null; rising_sign?: string | null },
): Promise<Record<string, string> | null> {
  try {
    if (!userId || !chart) return null;
    const signs = signsFromChart(chart);

    const updates: Record<string, string> = {};
    if (signs.sun_sign && current?.sun_sign !== signs.sun_sign) updates.sun_sign = signs.sun_sign;
    if (signs.moon_sign && current?.moon_sign !== signs.moon_sign) updates.moon_sign = signs.moon_sign;
    if (signs.rising_sign && current?.rising_sign !== signs.rising_sign) {
      updates.rising_sign = signs.rising_sign;
    }
    if (Object.keys(updates).length === 0) return null;

    const { data, error } = await createClient()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('id');
    if (error || !data || data.length === 0) return null;
    return updates;
  } catch {
    return null;
  }
}

/**
 * Back-fill an existing account: if the profile has usable birth data but any
 * of the three sign columns is empty, compute the natal chart once and store
 * them. Returns the written fields, or null when nothing was needed.
 */
// getSession() and onAuthStateChange both load the profile on a cold start,
// so without this the back-fill would fire two identical chart calls.
const inFlight = new Set<string>();

export async function backfillProfileSigns(profile: any): Promise<Record<string, string> | null> {
  if (!profile?.id) return null;
  if (profile.sun_sign && profile.moon_sign && profile.rising_sign) return null;
  if (!profile.birth_date || profile.latitude == null || profile.longitude == null) return null;
  if (inFlight.has(profile.id)) return null;

  inFlight.add(profile.id);
  try {
    const chart = await api.getNatalChart(
      buildBirthData(profile, { house_system: 'Whole Sign' }),
    );
    return await syncProfileSignsFromChart(profile.id, chart, profile);
  } catch {
    return null;
  } finally {
    inFlight.delete(profile.id);
  }
}
