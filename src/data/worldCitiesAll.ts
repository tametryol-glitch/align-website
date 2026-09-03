import { type CityData } from './worldCities';
import { CITIES_FALLBACK } from './citiesFallback';

// Full-world city search now lives server-side (align-api-v2's
// /cities/search, see src/hooks/useCitySearch.ts) — the client only
// bundles a small population>=5000 fallback (citiesFallback.ts) for
// instant first-paint and full offline capability, not the entire
// dataset. This used to merge usCities.ts/canadaCities.ts/mexicoCities.ts
// (every place in 3 countries, ~3.4MB) plus several legacy hand-curated
// lists; all of that is superseded by the server-backed search now, and
// citiesFallback.ts already includes every city those files added by
// hand (Singapore, Hong Kong, Brussels, Kyoto, Taipei, Sedona, etc — all
// population >= 5000).
export const WORLD_CITIES_ALL: CityData[] = CITIES_FALLBACK;

/**
 * Relevance-ranked lookup over the bundled fallback list. See
 * useCitySearch.ts for the primary search path (this + the server-backed
 * /cities/search endpoint); this function alone is what powers results
 * before the network call resolves, or when offline.
 */
export function searchCities(query: string, limit = 10): CityData[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
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
 * otherwise. Without the region, same-name places are indistinguishable
 * in a suggestion list.
 */
export function formatCityLabel(c: CityData): string {
  return c.region ? `${c.name}, ${c.region}, ${c.country}` : `${c.name}, ${c.country}`;
}
export type { CityData };
