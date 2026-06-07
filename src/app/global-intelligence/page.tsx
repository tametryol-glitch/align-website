'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Globe, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { listCountries, getAllDailyScores, type GICountry, type GIScores } from '@/lib/globalIntelligence';

const REGION_COLORS: Record<string, string> = {
  Americas: 'bg-blue-500/20 text-blue-400',
  Europe: 'bg-purple-500/20 text-purple-400',
  Asia: 'bg-red-500/20 text-red-400',
  Africa: 'bg-green-500/20 text-green-400',
  Oceania: 'bg-cyan-500/20 text-cyan-400',
};

function getRegionClass(region: string | null): string {
  if (!region) return 'bg-gray-500/20 text-gray-400';
  for (const [key, cls] of Object.entries(REGION_COLORS)) {
    if (region.includes(key)) return cls;
  }
  return 'bg-gray-500/20 text-gray-400';
}

function energyIcon(val: number) {
  if (val > 20) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (val < -20) return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-yellow-400" />;
}

function scoreColor(val: number): string {
  if (val >= 30) return 'text-emerald-400';
  if (val >= 0) return 'text-blue-400';
  if (val >= -30) return 'text-yellow-400';
  return 'text-red-400';
}

function conflictBadge(val: number): { text: string; cls: string } {
  if (val < 25) return { text: 'Low', cls: 'bg-emerald-500/20 text-emerald-400' };
  if (val < 50) return { text: 'Moderate', cls: 'bg-yellow-500/20 text-yellow-400' };
  if (val < 75) return { text: 'High', cls: 'bg-orange-500/20 text-orange-400' };
  return { text: 'Critical', cls: 'bg-red-500/20 text-red-400' };
}

interface CountryWithIntel extends GICountry {
  scores?: GIScores | null;
}

export default function GlobalIntelligencePage() {
  const [countries, setCountries] = useState<CountryWithIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [list, scoresMap] = await Promise.all([
          listCountries(),
          getAllDailyScores(),
        ]);

        const withIntel: CountryWithIntel[] = list.map((c) => ({
          ...c,
          scores: scoresMap[c.id] || null,
        }));
        setCountries(withIntel);
      } catch (err) {
        console.error('[GI] Failed to load countries:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const regions = useMemo(() => {
    const set = new Set<string>();
    countries.forEach((c) => c.region && set.add(c.region));
    return Array.from(set).sort();
  }, [countries]);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.iso_alpha2?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (regionFilter && c.region !== regionFilter) return false;
      return true;
    });
  }, [countries, search, regionFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm">Loading Global Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Global Intelligence</h1>
            <p className="text-text-muted text-sm">Mundane astrology for 196 nations — daily scores, transits & events</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-card border border-border-primary text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-primary transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setRegionFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              !regionFilter ? 'bg-accent-primary text-white' : 'bg-bg-card text-text-muted hover:text-text-primary border border-border-primary'
            }`}
          >
            All
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(regionFilter === r ? null : r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                regionFilter === r ? 'bg-accent-primary text-white' : 'bg-bg-card text-text-muted hover:text-text-primary border border-border-primary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((country) => {
          const conflict = country.scores ? conflictBadge(country.scores.conflict_pressure) : null;
          return (
            <Link
              key={country.id}
              href={`/global-intelligence/${country.iso_alpha2}`}
              className="group card hover:border-accent-primary/40 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{country.flag_emoji || '🏳️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-primary group-hover:text-accent-primary transition truncate">
                      {country.name}
                    </h3>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getRegionClass(country.region)}`}>
                      {country.region}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">
                    {country.capital}{country.iso_alpha2 ? ` · ${country.iso_alpha2}` : ''}
                  </p>

                  {/* Scores row */}
                  {country.scores && (
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        {energyIcon(country.scores.overall_energy)}
                        <span className={`text-xs font-medium ${scoreColor(country.scores.overall_energy)}`}>
                          {country.scores.overall_energy > 0 ? '+' : ''}{country.scores.overall_energy}
                        </span>
                      </div>
                      {conflict && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${conflict.cls}`}>
                          {conflict.text}
                        </span>
                      )}
                      <span className={`text-[10px] ${scoreColor(country.scores.economic_momentum)}`}>
                        Econ {country.scores.economic_momentum > 0 ? '+' : ''}{country.scores.economic_momentum}
                      </span>
                      <span className={`text-[10px] ${scoreColor(country.scores.political_stability)}`}>
                        Pol {country.scores.political_stability > 0 ? '+' : ''}{country.scores.political_stability}
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition mt-1 flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No countries match your search.</p>
        </div>
      )}
    </div>
  );
}
