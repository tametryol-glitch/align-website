import { WORLD_CITIES, type CityData } from './worldCities';
import { WORLD_CITIES_EXTENDED } from './worldCitiesExtended';
import { WORLD_CITIES_EXPANSION } from './worldCitiesExpansion';
import { WORLD_CITIES_EXPANSION_2 } from './worldCitiesExpansion2';
import { US_CITIES } from './usCities';
import { CANADA_CITIES } from './canadaCities';
import { MEXICO_CITIES } from './mexicoCities';
import { WORLD_CITIES_SUPPLEMENT } from './worldCitiesSupplement';

// US/Canada/Mexico entries in the legacy `worldCities.ts` and
// `worldCitiesExtended.ts`/`worldCitiesExpansion.ts` lists were hand-curated
// and only ever covered the well-known cities. The dedicated `usCities.ts`,
// `canadaCities.ts` and `mexicoCities.ts` — every GeoNames populated place
// in the country, filtered to ones with a real population figure — are the
// single source of truth for those three now, so strip everything flagged
// with those countries from the legacy lists before merging. Puerto Rico is
// in the US set too: the handful of legacy entries labelled with it as a
// country are all covered by the full territory list, and keeping both
// would show each of them twice in the picker.
const REPLACED_LABELS = new Set([
  'United States', 'USA', 'United States of America', 'Puerto Rico',
  'Canada', 'Mexico',
]);
const NON_REPLACED_BASE = WORLD_CITIES.filter((c) => !REPLACED_LABELS.has(c.country));
const NON_REPLACED_EXT = WORLD_CITIES_EXTENDED.filter((c) => !REPLACED_LABELS.has(c.country));
const NON_REPLACED_EXP = WORLD_CITIES_EXPANSION.filter((c) => !REPLACED_LABELS.has(c.country));
const NON_REPLACED_EXP2 = WORLD_CITIES_EXPANSION_2.filter((c) => !REPLACED_LABELS.has(c.country));

// Dedup key is name+country+region (first occurrence wins). Adding region
// disambiguates same-name cities in different states/provinces — e.g.
// "Athens, Alabama" vs "Athens, Georgia" both stay in the list.
const _seen = new Set<string>();
const _merged: CityData[] = [];
for (const c of [
  ...US_CITIES, ...CANADA_CITIES, ...MEXICO_CITIES,
  ...NON_REPLACED_BASE, ...NON_REPLACED_EXT, ...NON_REPLACED_EXP, ...NON_REPLACED_EXP2,
  ...WORLD_CITIES_SUPPLEMENT,
]) {
  const key = `${c.name}|${c.country}|${c.region ?? ''}`;
  if (!_seen.has(key)) {
    _seen.add(key);
    _merged.push(c);
  }
}

export const WORLD_CITIES_ALL: CityData[] = _merged;

/**
 * Relevance-ranked lookup over the merged list.
 *
 * The US portion covers every town and census-designated place, so a plain
 * substring filter returns 35 Springfields in database order. Rank exact
 * name matches first, then prefixes, then substrings, and break ties by
 * population so the place a user is most likely to mean comes first.
 */
export function searchCities(query: string, limit = 10): CityData[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  // "Springfield, Illinois" only matches once the parts are joined, and
  // people do type it that way. Building the label for all 45k rows costs
  // ~25ms a keystroke though, so only rows whose name or state already
  // contain the text before the comma are worth joining.
  const comma = q.indexOf(',');
  const head = comma === -1 ? '' : q.slice(0, comma).trim();
  const matches = WORLD_CITIES_ALL.filter((c) => {
    const name = c.name.toLowerCase();
    const region = c.region ? c.region.toLowerCase() : '';
    if (name.includes(q) || region.includes(q) || c.country.toLowerCase().includes(q)) return true;
    if (comma === -1 || (!name.includes(head) && !region.includes(head))) return false;
    return formatCityLabel(c).toLowerCase().includes(q);
  });
  matches.sort((a, b) => {
    const an = a.name.toLowerCase();
    const bn = b.name.toLowerCase();
    const ar = an === q ? 0 : an.startsWith(q) ? 1 : 2;
    const br = bn === q ? 0 : bn.startsWith(q) ? 1 : 2;
    if (ar !== br) return ar - br;
    return (b.population || 0) - (a.population || 0);
  });
  return matches.slice(0, limit);
}

/**
 * "City, State, Country" when a state/region is known, "City, Country"
 * otherwise. Without the region, same-name US places are indistinguishable
 * in a suggestion list.
 */
export function formatCityLabel(c: CityData): string {
  return c.region ? `${c.name}, ${c.region}, ${c.country}` : `${c.name}, ${c.country}`;
}
export type { CityData };
