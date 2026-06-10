import type { CityData } from './worldCities';

/**
 * Major world cities missing from the legacy lists — discovered while
 * validating the Best-20 destination pool. Without these, users could not
 * even SEARCH for Singapore, Hong Kong, Brussels, Kyoto, or Taipei.
 * Merged into WORLD_CITIES_ALL after the primary sources (dedup-safe).
 */
export const WORLD_CITIES_SUPPLEMENT: CityData[] = [
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517 },
  { name: 'Kyoto', country: 'Japan', lat: 35.0116, lon: 135.7681 },
  { name: 'Taipei', country: 'Taiwan', lat: 25.033, lon: 121.5654 },
  { name: 'Sedona', country: 'United States', region: 'Arizona', lat: 34.8697, lon: -111.761 },
];
