'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface CityData {
  name: string;
  country: string;
  region?: string;
  lat: number;
  lon: number;
  population?: number;
}

interface CityResult {
  display: string;
  lat: number;
  lon: number;
}

interface CitySearchProps {
  value: string;
  onChange: (location: string, lat: number, lon: number, timezone: string) => void;
  placeholder?: string;
  className?: string;
}

/** Estimate IANA-style timezone from longitude (fallback when tz-lookup unavailable) */
function estimateTimezone(lat: number, lon: number): string {
  // Try to use Intl to get the user's local timezone as a reasonable default
  // For birth location, longitude-based offset is a decent approximation
  const offsetHours = Math.round(lon / 15);
  const sign = offsetHours >= 0 ? '+' : '-';
  const abs = Math.abs(offsetHours);
  return `UTC${sign}${String(abs).padStart(2, '0')}:00`;
}

// Lazy-load the city database to avoid blocking initial render
let citiesPromise: Promise<CityData[]> | null = null;
let citiesCache: CityData[] | null = null;

function loadCities(): Promise<CityData[]> {
  if (citiesCache) return Promise.resolve(citiesCache);
  if (!citiesPromise) {
    citiesPromise = import('@/data/worldCitiesAll').then((mod) => {
      citiesCache = mod.WORLD_CITIES_ALL;
      return citiesCache;
    });
  }
  return citiesPromise;
}

export function CitySearch({ value, onChange, placeholder = 'Search city...', className = '' }: CitySearchProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmed, setConfirmed] = useState(!!value);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (value && value !== query) {
      setQuery(value);
      setConfirmed(true);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchCities = useCallback(async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const cities = await loadCities();
      const searchText = text.toLowerCase().trim();

      const matches = cities.filter(c =>
        c.name.toLowerCase().includes(searchText) ||
        (c.region && c.region.toLowerCase().includes(searchText)) ||
        c.country.toLowerCase().includes(searchText)
      );

      // Sort: exact name → startsWith → substring, then by population
      matches.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aExact = aName === searchText ? 0 : aName.startsWith(searchText) ? 1 : 2;
        const bExact = bName === searchText ? 0 : bName.startsWith(searchText) ? 1 : 2;
        if (aExact !== bExact) return aExact - bExact;
        return (b.population || 0) - (a.population || 0);
      });

      const localResults = matches.slice(0, 10).map(c => ({
        display: c.region ? `${c.name}, ${c.region}, ${c.country}` : `${c.name}, ${c.country}`,
        lat: c.lat,
        lon: c.lon,
      }));

      if (localResults.length > 0) {
        setSuggestions(localResults);
        setShowDropdown(true);
        setIsSearching(false);
        return;
      }

      // Fallback to Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'AlignAstrologyApp/1.0' } }
      );
      const data = await response.json();
      const apiResults = data.map((item: any) => ({
        display: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
      setSuggestions(apiResults);
      setShowDropdown(apiResults.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInput = (text: string) => {
    setQuery(text);
    setConfirmed(false);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchCities(text), 400);
  };

  const selectCity = (result: CityResult) => {
    setQuery(result.display);
    setSuggestions([]);
    setShowDropdown(false);
    setConfirmed(true);
    const tz = estimateTimezone(result.lat, result.lon);
    onChange(result.display, result.lat, result.lon, tz);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (suggestions.length > 0 && !confirmed) setShowDropdown(true); }}
          placeholder={placeholder}
          className="input pl-9 pr-8"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted animate-spin" />
        )}
        {confirmed && !isSearching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">✓</span>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border-primary rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectCity(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                {s.display}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
