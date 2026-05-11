import { WORLD_CITIES, type CityData } from './worldCities';
import { WORLD_CITIES_EXTENDED } from './worldCitiesExtended';
import { US_CITIES } from './usCities';

// US entries in the legacy `worldCities.ts` (label "United States") and
// `worldCitiesExtended.ts` (label "USA") were inconsistent and partially
// overlapping. The dedicated `usCities.ts` (3,996 entries from GeoNames)
// is the single source of truth for US locations now — strip everything
// US-flagged from the legacy lists before merging.
const US_LABELS = new Set(['United States', 'USA', 'United States of America']);
const NON_US_BASE = WORLD_CITIES.filter((c) => !US_LABELS.has(c.country));
const NON_US_EXT = WORLD_CITIES_EXTENDED.filter((c) => !US_LABELS.has(c.country));

// Dedup key is name+country+region (first occurrence wins). Adding region
// disambiguates same-name cities in different states/provinces — e.g.
// "Athens, Alabama" vs "Athens, Georgia" both stay in the list.
const _seen = new Set<string>();
const _merged: CityData[] = [];
for (const c of [...US_CITIES, ...NON_US_BASE, ...NON_US_EXT]) {
  const key = `${c.name}|${c.country}|${c.region ?? ''}`;
  if (!_seen.has(key)) {
    _seen.add(key);
    _merged.push(c);
  }
}

export const WORLD_CITIES_ALL: CityData[] = _merged;
export type { CityData };
