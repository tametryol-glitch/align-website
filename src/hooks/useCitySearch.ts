import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';
import { api } from '../lib/api';
import { searchCities as searchLocal, type CityData } from '../data/worldCitiesAll';

/**
 * Full-world birth-city search: instant local results from a small bundled
 * fallback dataset (works offline, zero latency), upgraded to the full
 * GeoNames-backed remote search once the network call resolves.
 */
export function useCitySearch(rawQuery: string, limit = 10) {
  const query = useDebounce(rawQuery, 400);
  const [results, setResults] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    // Instant local results first — bundled fallback dataset, works offline.
    setResults(searchLocal(query, limit));

    const isOnline = typeof navigator === 'undefined' || navigator.onLine;
    if (!isOnline) return; // offline: local results are final.

    let cancelled = false;
    setLoading(true);
    api
      .searchCitiesRemote(query, limit)
      .then((remote) => {
        if (!cancelled && remote.length) setResults(remote);
      })
      .catch(() => {
        // Remote failed — keep showing local results, no error surfaced.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, limit]);

  return { results, loading };
}
