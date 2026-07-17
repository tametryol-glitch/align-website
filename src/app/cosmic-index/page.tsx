'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Sparkles, Users, BarChart3, ChevronRight, Loader2, RefreshCw, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';
import {
  SIGNS, INDEXABLE_PLANETS, PLANET_EMOJIS, SIGN_EMOJIS, ELEMENT_FOR_SIGN, BROWSE_PLANETS,
  indexMyPlacements, hasIndexedPlacements, getMyPlacements,
  searchPlacements, getPlacementCount, getPlacementRarity,
  getMyCosmicTribes, getPlacementSuggestions,
  formatDegree, getMatchVibe, getRarityLabel, formatCount,
  type IndexedPlacement, type PlacementSearchResult, type PlacementRarity, type CosmicTribe, type PlacementSuggestion,
} from '@/lib/cosmicIndexService';

type TabMode = 'discover' | 'explore' | 'mychart';

// Element color helpers for Tailwind
function getElementColor(sign: string): string {
  const elem = ELEMENT_FOR_SIGN[sign] || 'Fire';
  if (elem === 'Fire') return '#EF4444';
  if (elem === 'Earth') return '#22C55E';
  if (elem === 'Air') return '#3B82F6';
  return '#06B6D4';
}

function getElementGradient(sign: string): string {
  const elem = ELEMENT_FOR_SIGN[sign] || 'Fire';
  if (elem === 'Fire') return 'from-red-500/12 to-red-500/3';
  if (elem === 'Earth') return 'from-green-500/12 to-green-500/3';
  if (elem === 'Air') return 'from-blue-500/12 to-blue-500/3';
  return 'from-cyan-500/12 to-cyan-500/3';
}

function ordSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

// =====================================================================
// Main Component
// =====================================================================

export default function CosmicIndexPage() {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const userId = user?.id;

  // -- Core state --
  const [indexed, setIndexed] = useState<boolean | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [myPlacements, setMyPlacements] = useState<IndexedPlacement[]>([]);
  const [tab, setTab] = useState<TabMode>('discover');

  // -- Discover tab --
  const [tribes, setTribes] = useState<CosmicTribe[]>([]);
  const [suggestions, setSuggestions] = useState<PlacementSuggestion[]>([]);
  const [loadingDiscover, setLoadingDiscover] = useState(false);

  // -- Explore tab --
  const [selectedPlanet, setSelectedPlanet] = useState<string>('Sun');
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [degreeEnabled, setDegreeEnabled] = useState(false);
  const [degreeMin, setDegreeMin] = useState('0');
  const [degreeMax, setDegreeMax] = useState('29');
  const [results, setResults] = useState<PlacementSearchResult[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [rarity, setRarity] = useState<PlacementRarity | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageOffset, setPageOffset] = useState(0);

  // -- Initialize --
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const has = await hasIndexedPlacements();
      if (!has) {
        setIndexing(true);
        const ok = await indexMyPlacements();
        setIndexing(false);
        setIndexed(ok);
        if (ok) setMyPlacements(await getMyPlacements());
      } else {
        const existing = await getMyPlacements();
        // Re-index if asteroids are missing
        const hasAsteroids = existing.some(p =>
          ['Juno', 'Vesta', 'Eros', 'Psyche', 'Lilith', 'Pallas', 'Ceres'].includes(p.planet_name)
        );
        if (!hasAsteroids && existing.length > 0) {
          indexMyPlacements().then(async (ok) => {
            if (ok) setMyPlacements(await getMyPlacements());
          }).catch(() => {});
        }
        setIndexed(true);
        setMyPlacements(existing);
      }
    })();
  }, [userId]);

  // Load discover content once indexed
  useEffect(() => {
    if (!indexed) return;
    setLoadingDiscover(true);
    Promise.all([getMyCosmicTribes(), getPlacementSuggestions()])
      .then(([tribesData, sugData]) => { setTribes(tribesData); setSuggestions(sugData); })
      .finally(() => setLoadingDiscover(false));
  }, [indexed]);

  // -- Search logic (explore tab) --
  const runSearch = useCallback(async (reset = true) => {
    if (!selectedPlanet) return;
    setSearching(true);
    const offset = reset ? 0 : pageOffset;
    if (reset) { setResults([]); setPageOffset(0); setHasMore(true); }

    const params: any = {
      planet: selectedPlanet,
      sign: selectedSign || undefined,
      house: selectedHouse || undefined,
      limit: 30,
      offset,
    };
    if (degreeEnabled) {
      params.degreeMin = parseFloat(degreeMin) || 0;
      params.degreeMax = parseFloat(degreeMax) || 29;
    }

    const [data, count, rarityData] = await Promise.all([
      searchPlacements(params),
      getPlacementCount(params),
      selectedSign ? getPlacementRarity(selectedPlanet, selectedSign, selectedHouse || undefined) : Promise.resolve(null),
    ]);

    setResults(prev => reset ? data : [...prev, ...data]);
    setResultCount(count);
    setRarity(rarityData);
    setHasMore(data.length === 30);
    setSearching(false);
  }, [selectedPlanet, selectedSign, selectedHouse, degreeEnabled, degreeMin, degreeMax, pageOffset]);

  // Auto-search on filter change
  useEffect(() => {
    if (!indexed || tab !== 'explore') return;
    const timer = setTimeout(() => runSearch(true), 350);
    return () => clearTimeout(timer);
  }, [selectedPlanet, selectedSign, selectedHouse, degreeEnabled, degreeMin, degreeMax, indexed, tab]);

  const loadMore = useCallback(() => {
    if (hasMore && !searching) {
      setPageOffset(p => p + 30);
      runSearch(false);
    }
  }, [hasMore, searching, runSearch]);

  // -- Quick-nav helpers --
  const jumpToExplore = useCallback((planet: string, sign?: string, house?: number, dMin?: number, dMax?: number) => {
    setTab('explore');
    setSelectedPlanet(planet);
    setSelectedSign(sign || null);
    setSelectedHouse(house || null);
    if (dMin != null && dMax != null) {
      setDegreeEnabled(true);
      setDegreeMin(String(Math.floor(dMin)));
      setDegreeMax(String(Math.ceil(dMax)));
    } else {
      setDegreeEnabled(false);
    }
  }, []);

  // -- Refresh --
  const handleRefresh = useCallback(async () => {
    setIndexing(true);
    await indexMyPlacements();
    setMyPlacements(await getMyPlacements());
    setIndexed(true);
    const [tribesData, sugData] = await Promise.all([getMyCosmicTribes(), getPlacementSuggestions()]);
    setTribes(tribesData); setSuggestions(sugData);
    if (tab === 'explore') runSearch(true);
    setIndexing(false);
  }, [tab, runSearch]);

  // =====================================================================
  // Loading / Not-indexed states
  // =====================================================================

  if (indexed === null || indexing) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/10 flex items-center justify-center mb-5">
          <span className="text-5xl">🪐</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          {indexing ? 'Mapping your chart...' : 'Loading...'}
        </h2>
        <p className="text-sm text-text-muted text-center">
          Indexing your placements into the cosmic network
        </p>
        <Loader2 className="w-5 h-5 text-accent-primary animate-spin mt-4" />
      </div>
    );
  }

  if (!indexed) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/15 to-blue-500/10 flex items-center justify-center mb-5">
          <span className="text-5xl">✦</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Unlock the Cosmic Index</h2>
        <p className="text-sm text-text-muted text-center max-w-md">
          Add your birth date, time, and location to discover
          people who share your planetary imprint.
        </p>
        <Link
          href="/profile"
          className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Complete Your Profile
        </Link>
      </div>
    );
  }

  // =====================================================================
  // Main Render
  // =====================================================================

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Bar */}
      <div className="flex border-b border-border-primary mb-0 sticky top-0 bg-bg-primary z-10">
        {([
          { key: 'discover' as TabMode, label: 'Discover', icon: <Sparkles className="w-4 h-4" /> },
          { key: 'explore' as TabMode, label: 'Explore', icon: <Search className="w-4 h-4" /> },
          { key: 'mychart' as TabMode, label: 'My Chart', icon: <Star className="w-4 h-4" /> },
        ]).map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === item.key
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* ============================================================= */}
      {/* DISCOVER TAB */}
      {/* ============================================================= */}
      {tab === 'discover' && (
        <div className="pb-12">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E1440] via-[#2A1B5E] to-[#141826] px-6 py-8 text-center mb-6 mt-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(155,111,246,0.15),transparent_50%)]" />
            <div className="relative">
              <span className="text-3xl text-purple-300/70 block mb-2">✦</span>
              <h1 className="text-2xl font-extrabold text-white tracking-wide">{t('cosmicIndex.title')}</h1>
              <p className="text-purple-300 text-sm font-semibold mt-1 tracking-wide">
                {t('cosmicIndex.subtitle')}
              </p>
              <p className="text-gray-400 text-xs mt-3 leading-5 max-w-sm mx-auto">
                Find people who share your planetary signature —
                same planet, same sign, same degree.
              </p>
            </div>
          </div>

          {/* Cosmic Tribes Carousel */}
          {tribes.length > 0 && (
            <section className="mb-8">
              <p className="text-[11px] font-bold tracking-[1.5px] text-accent-primary mb-1 px-1">YOUR COSMIC TRIBES</p>
              <h2 className="text-lg font-bold text-text-primary mb-3 px-1">People shaped by the same stars</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                {tribes.map((tribe) => (
                  <button
                    key={`${tribe.planet}-${tribe.sign}`}
                    onClick={() => jumpToExplore(tribe.planet, tribe.sign)}
                    className={`flex-shrink-0 w-[280px] snap-start rounded-xl border border-border-primary p-4 bg-gradient-to-br ${getElementGradient(tribe.sign)} text-left hover:border-accent-primary/30 transition-all group`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-3xl">{tribe.emoji}</span>
                      <span className="text-xs font-bold text-purple-300 bg-purple-500/12 rounded-full px-3 py-1">
                        {formatCount(tribe.count)}
                      </span>
                    </div>
                    <p className="text-base font-bold text-text-primary mt-2">{tribe.label}</p>
                    <p className="text-xs text-text-muted leading-[17px] mt-1 line-clamp-2">{tribe.description}</p>
                    <p className="text-xs font-semibold text-accent-primary mt-3 group-hover:translate-x-1 transition-transform">
                      Explore tribe →
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Personalized Suggestions */}
          {suggestions.length > 0 && (
            <section className="mb-8">
              <p className="text-[11px] font-bold tracking-[1.5px] text-accent-primary mb-1 px-1">CURATED FOR YOU</p>
              <h2 className="text-lg font-bold text-text-primary mb-3 px-1">People who mirror your cosmic DNA</h2>
              <div className="space-y-2">
                {suggestions.map((sug, i) => (
                  <button
                    key={`${sug.planet}-${sug.sign}-${i}`}
                    onClick={() => jumpToExplore(sug.planet, sug.sign, sug.house, sug.degreeMin, sug.degreeMax)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-primary hover:border-accent-primary/30 transition-all text-left"
                  >
                    <div className="w-11 h-11 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{sug.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary">{sug.label}</p>
                      <p className="text-xs text-text-muted leading-[17px] mt-0.5 line-clamp-2">{sug.description}</p>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <p className="text-lg font-extrabold text-accent-primary">{formatCount(sug.count)}</p>
                      <p className="text-[10px] text-text-muted">people</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Browse by Planet */}
          <section className="mb-8">
            <p className="text-[11px] font-bold tracking-[1.5px] text-accent-primary mb-1 px-1">BROWSE BY PLANET</p>
            <h2 className="text-lg font-bold text-text-primary mb-3 px-1">Tap a planet to explore its placements</h2>
            <div className="grid grid-cols-4 gap-2.5">
              {BROWSE_PLANETS.map(p => (
                <button
                  key={p.name}
                  onClick={() => jumpToExplore(p.name)}
                  className="flex flex-col items-center py-4 rounded-xl bg-bg-card border border-border-primary hover:border-accent-primary/30 transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5"
                    style={{ backgroundColor: p.color + '18' }}
                  >
                    <span className="text-xl font-bold" style={{ color: p.color }}>{p.glyph}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-text-primary">
                    {p.name === 'Ascendant' ? 'Rising' : p.name}
                  </span>
                  <span className="text-[9px] text-text-muted mt-0.5">{p.label}</span>
                </button>
              ))}
            </div>
          </section>

          {loadingDiscover && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* EXPLORE TAB */}
      {/* ============================================================= */}
      {tab === 'explore' && (
        <div className="pb-12">
          {/* Planet Selector */}
          <p className="text-[11px] font-bold tracking-wider text-text-tertiary mt-4 mb-2 px-1">Planet</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {(INDEXABLE_PLANETS as readonly string[]).filter(p => !['South Node', 'MC'].includes(p)).map(planet => {
              const shortName = planet === 'North Node' ? 'N.Node'
                : planet === 'Ascendant' ? 'Rising'
                : planet;
              return (
                <button
                  key={planet}
                  onClick={() => setSelectedPlanet(planet)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
                    selectedPlanet === planet
                      ? 'bg-accent-primary/15 border-accent-primary text-accent-primary font-bold'
                      : 'bg-bg-card border-border-primary text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <span className="text-sm">{PLANET_EMOJIS[planet]}</span>
                  {shortName}
                </button>
              );
            })}
          </div>

          {/* Sign Selector */}
          <p className="text-[11px] font-bold tracking-wider text-text-tertiary mt-3 mb-2 px-1">Sign</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedSign(null)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
                !selectedSign
                  ? 'bg-accent-primary/15 border-accent-primary text-accent-primary font-bold'
                  : 'bg-bg-card border-border-primary text-text-muted hover:text-text-secondary'
              }`}
            >
              Any
            </button>
            {SIGNS.map(sign => {
              const elemColor = getElementColor(sign);
              return (
                <button
                  key={sign}
                  onClick={() => setSelectedSign(selectedSign === sign ? null : sign)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
                    selectedSign === sign
                      ? 'bg-accent-primary/15 border-accent-primary text-accent-primary font-bold'
                      : 'bg-bg-card border-border-primary text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: elemColor }} />
                  <span className="text-sm">{SIGN_EMOJIS[sign]}</span>
                  {sign.slice(0, 3)}
                </button>
              );
            })}
          </div>

          {/* House Selector */}
          <p className="text-[11px] font-bold tracking-wider text-text-tertiary mt-3 mb-2 px-1">House</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedHouse(null)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
                !selectedHouse
                  ? 'bg-accent-primary/15 border-accent-primary text-accent-primary font-bold'
                  : 'bg-bg-card border-border-primary text-text-muted hover:text-text-secondary'
              }`}
            >
              Any
            </button>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
              <button
                key={h}
                onClick={() => setSelectedHouse(selectedHouse === h ? null : h)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
                  selectedHouse === h
                    ? 'bg-accent-primary/15 border-accent-primary text-accent-primary font-bold'
                    : 'bg-bg-card border-border-primary text-text-muted hover:text-text-secondary'
                }`}
              >
                {h}H
              </button>
            ))}
          </div>

          {/* Degree toggle */}
          <button
            onClick={() => setDegreeEnabled(!degreeEnabled)}
            className="text-xs font-semibold text-purple-300 mt-3 mb-2 px-1 hover:text-purple-200 transition-colors"
          >
            {degreeEnabled ? '✕  Hide degree range' : '°  Refine by degree'}
          </button>
          {degreeEnabled && (
            <div className="flex items-center gap-2 px-1 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-text-muted w-8">From</span>
                <input
                  type="number"
                  value={degreeMin}
                  onChange={(e) => setDegreeMin(e.target.value)}
                  min={0}
                  max={29}
                  className="w-12 h-9 text-center rounded-lg bg-bg-card border border-border-primary text-text-primary text-sm font-semibold focus:border-accent-primary outline-none"
                />
                <span className="text-text-muted text-sm">°</span>
              </div>
              <span className="text-text-muted">—</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-text-muted w-5">To</span>
                <input
                  type="number"
                  value={degreeMax}
                  onChange={(e) => setDegreeMax(e.target.value)}
                  min={0}
                  max={29}
                  className="w-12 h-9 text-center rounded-lg bg-bg-card border border-border-primary text-text-primary text-sm font-semibold focus:border-accent-primary outline-none"
                />
                <span className="text-text-muted text-sm">°</span>
              </div>
            </div>
          )}

          {/* Stats Banner */}
          <div className="rounded-xl bg-gradient-to-r from-purple-500/8 to-indigo-500/4 p-4 mb-4 mt-2">
            <div className="flex items-start gap-3">
              <span className="text-3xl font-extrabold text-accent-primary leading-8">
                {formatCount(resultCount)}
              </span>
              <div className="pt-1">
                <p className="text-sm text-text-secondary leading-snug">
                  {resultCount === 1 ? 'person' : 'people'} with {selectedPlanet}
                  {selectedSign ? ` in ${selectedSign}` : ''}
                  {selectedHouse ? ` · ${selectedHouse}${ordSuffix(selectedHouse)} house` : ''}
                </p>
                {rarity && selectedSign && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getRarityLabel(rarity.sign_percent).color }}
                    />
                    <span className="text-[11px] text-text-muted">
                      {getRarityLabel(rarity.sign_percent).label} — {rarity.sign_percent}% of users
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((item, i) => (
                <ResultCard
                  key={`${item.user_id}-${item.planet_name}-${i}`}
                  result={item}
                  planet={selectedPlanet}
                  myPlacements={myPlacements}
                />
              ))}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={searching}
                  className="w-full py-3 text-sm font-medium text-accent-primary hover:text-accent-primary/80 transition-colors disabled:opacity-50"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Load more'
                  )}
                </button>
              )}
            </div>
          )}

          {searching && results.length === 0 && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
            </div>
          )}

          {!searching && results.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl text-purple-300/50 block mb-3">✦</span>
              <h3 className="text-lg font-bold text-text-primary mb-2">This cosmic room is quiet</h3>
              <p className="text-sm text-text-muted max-w-sm mx-auto leading-5">
                No one found with this exact placement yet.
                Try widening the sign, house, or degree range.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* MY CHART TAB */}
      {/* ============================================================= */}
      {tab === 'mychart' && (
        <div className="pb-12">
          {/* Chart header */}
          <div className="bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent px-4 pt-6 pb-5 rounded-b-2xl mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-text-primary">Your Cosmic Blueprint</h2>
                <p className="text-sm text-text-muted mt-1">
                  {myPlacements.length} placements indexed · Tap any row to find others like you
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={indexing}
                className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors disabled:opacity-50"
                title="Re-index placements"
              >
                <RefreshCw className={`w-4 h-4 text-text-muted ${indexing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Placements table */}
          {myPlacements.length > 0 && (
            <div className="rounded-xl bg-bg-card border border-border-primary overflow-hidden mb-6">
              {myPlacements
                .filter(p => p.planet_name !== 'South Node')
                .map((p, i) => {
                  const elemColor = getElementColor(p.sign_name);
                  return (
                    <button
                      key={p.planet_name}
                      onClick={() => jumpToExplore(p.planet_name, p.sign_name)}
                      className={`w-full flex items-center px-4 py-3 hover:bg-bg-tertiary/50 transition-colors text-left ${
                        i > 0 ? 'border-t border-border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 w-[110px]">
                        <span className="text-base w-5 text-center">{PLANET_EMOJIS[p.planet_name] || '✦'}</span>
                        <span className="text-xs font-semibold text-text-secondary">{p.planet_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: elemColor }} />
                        <span className="text-sm font-semibold text-text-primary">{p.sign_name}</span>
                      </div>
                      <span className="text-xs font-semibold text-purple-300 w-14">
                        {formatDegree(p.degree_whole, p.degree_minute)}
                      </span>
                      <span className="text-[11px] text-text-muted w-7 text-center">{p.house_number}H</span>
                      {p.retrograde ? (
                        <span className="text-xs font-extrabold text-amber-400 w-4 text-center">℞</span>
                      ) : (
                        <span className="w-4" />
                      )}
                      <ChevronRight className="w-4 h-4 text-text-muted/50 ml-1" />
                    </button>
                  );
                })}
            </div>
          )}

          {/* Cosmic Tribes (full list) */}
          {tribes.length > 0 && (
            <section>
              <p className="text-[11px] font-bold tracking-[1.5px] text-accent-primary mb-1 px-1">YOUR TRIBES</p>
              <h2 className="text-lg font-bold text-text-primary mb-3 px-1">Dynamic groups sharing your placements</h2>
              <div className="space-y-2">
                {tribes.map((tribe) => (
                  <button
                    key={`${tribe.planet}-${tribe.sign}`}
                    onClick={() => jumpToExplore(tribe.planet, tribe.sign)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border border-border-primary bg-gradient-to-r ${getElementGradient(tribe.sign)} hover:border-accent-primary/30 transition-all text-left`}
                  >
                    <span className="text-2xl">{tribe.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary">{tribe.label}</p>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{tribe.description}</p>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <p className="text-base font-extrabold text-accent-primary">{formatCount(tribe.count)}</p>
                      <p className="text-[9px] text-text-muted mt-0.5">people</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Result Card
// =====================================================================

function ResultCard({ result, planet, myPlacements }: {
  result: PlacementSearchResult;
  planet: string;
  myPlacements: IndexedPlacement[];
}) {
  const vibe = getMatchVibe(planet);
  const elemColor = getElementColor(result.sign_name);

  const myPlacement = myPlacements.find(p => p.planet_name === result.planet_name);
  const isNearDegree = myPlacement && myPlacement.sign_name === result.sign_name
    && Math.abs(myPlacement.exact_degree - result.exact_degree) <= 3;
  const isSameSign = myPlacement?.sign_name === result.sign_name;

  return (
    <div className="rounded-xl bg-bg-card border border-border-primary overflow-hidden hover:border-accent-primary/20 transition-colors">
      {/* Accent stripe */}
      <div className="h-[3px] w-full" style={{ backgroundColor: elemColor }} />

      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <Link href={`/user/${result.user_id}`} className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0 text-text-muted font-bold text-sm cursor-pointer">
          {result.avatar_url ? (
            <img src={result.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            result.display_name?.charAt(0)?.toUpperCase() || '?'
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">{result.display_name}</p>

          {/* Placement badge */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                color: elemColor,
                backgroundColor: elemColor + '15',
                borderColor: elemColor + '30',
              }}
            >
              {PLANET_EMOJIS[result.planet_name]} {result.sign_name} {formatDegree(result.degree_whole, result.degree_minute)}
            </span>
            <span className="text-[10px] font-semibold text-text-muted bg-bg-tertiary rounded-full px-1.5 py-0.5">
              {result.house_number}H
            </span>
            {result.retrograde && <span className="text-sm font-extrabold text-amber-400">℞</span>}
          </div>

          {/* Context badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {isNearDegree && (
              <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/12 rounded-full px-2 py-0.5">
                Near your degree
              </span>
            )}
            {isSameSign && !isNearDegree && (
              <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/12 rounded-full px-2 py-0.5">
                Shared placement
              </span>
            )}
            {result.sun_sign && (
              <span className="text-[11px] text-text-muted">
                {SIGN_EMOJIS[result.sun_sign] || ''} {result.sun_sign}
                {result.moon_sign ? `  ·  ${SIGN_EMOJIS[result.moon_sign] || ''} ${result.moon_sign}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Vibe chip */}
        <div className="flex-shrink-0">
          <span
            className="text-[9px] font-bold tracking-wide px-2 py-1 rounded-full border"
            style={{ color: elemColor, borderColor: elemColor + '40' }}
          >
            {vibe}
          </span>
        </div>
      </div>
    </div>
  );
}
