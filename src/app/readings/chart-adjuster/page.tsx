'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useChartStore } from '@/stores/chartStore';
import { useAstrologySettings, type HouseSystem } from '@/stores/astrologySettingsStore';
import { api } from '@/lib/api';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import { PLANET_GLYPHS } from '@/lib/transitData';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, X, Settings2, Save, ArrowLeftRight, Clock, RotateCcw } from 'lucide-react';

const AVAILABLE_ASTEROIDS = [
  'Ceres', 'Pallas', 'Juno', 'Vesta', 'Chiron', 'Eros', 'Psyche', 'Lilith',
  'Amor', 'Valentine', 'Union', 'Karma', 'Pholus', 'Nessus', 'Chariklo',
  'Urania', 'DNA', 'Child', 'Fortuna', 'Hygiea', 'Astraea', 'Hecate',
  'Nemesis', 'Nike', 'Isis', 'Osiris', 'Horus', 'Apollo', 'Sappho',
  'Eris', 'Sedna', 'Haumea', 'Makemake', 'Narcissus', 'Echo', 'Pandora',
  'Icarus', 'Daedalus', 'Orpheus', 'Eurydike', 'Persephone', 'Proserpina',
  'Diana', 'Minerva', 'Bacchus', 'Circe', 'Medea', 'Kassandra', 'Achilles',
  'Sphinx', 'Atlantis', 'Tantalus', 'Sisyphus', 'Damocles', 'Lucifer',
  'Magdalena', 'Cupido', 'Destinn', 'Abundantia', 'Industria',
];

const HOUSE_SYSTEMS: { label: string; value: HouseSystem; apiName: string }[] = [
  { label: 'Whole Sign', value: 'whole_sign', apiName: 'Whole Sign' },
  { label: 'Placidus', value: 'placidus', apiName: 'Placidus' },
  { label: 'Koch', value: 'koch', apiName: 'Koch' },
  { label: 'Equal', value: 'equal', apiName: 'Equal' },
  { label: 'Campanus', value: 'campanus', apiName: 'Campanus' },
  { label: 'Regiomontanus', value: 'regiomontanus', apiName: 'Regiomontanus' },
  { label: 'Porphyry', value: 'porphyry', apiName: 'Porphyry' },
  { label: 'Morinus', value: 'morinus', apiName: 'Morinus' },
  { label: 'Alcabitius', value: 'alcabitius', apiName: 'Alcabitius' },
];

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const SIGN_GLYPHS: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

interface PlanetResult {
  name: string;
  sign: string;
  degree: string;
  house: string;
  retrograde: boolean;
  longitude: number;
}

interface HouseResult {
  house: number;
  sign: string;
  degree: string;
  longitude: number;
}

interface ChartSnapshot {
  planets: PlanetResult[];
  houses: HouseResult[];
  houseSystem: string;
  time: string;
  asteroids: string[];
}

function parsePlanetResults(positions: any[]): PlanetResult[] {
  return positions.map((pl: any) => ({
    name: pl.name,
    sign: SIGNS[Math.floor(pl.longitude / 30)],
    degree: (pl.longitude % 30).toFixed(1),
    house: pl.house || '-',
    retrograde: pl.is_retrograde,
    longitude: pl.longitude,
  }));
}

function parseHouseResults(cusps: number[]): HouseResult[] {
  return cusps.map((lon: number, i: number) => ({
    house: i + 1,
    sign: SIGNS[Math.floor(lon / 30)],
    degree: (lon % 30).toFixed(1),
    longitude: lon,
  }));
}

export default function ChartAdjusterPage() {
  const { profile } = useAuthStore();
  const { birthData } = useChartStore();
  const { houseSystem: savedHouseSystem, setHouseSystem: saveHouseSystem } = useAstrologySettings();

  const [overrideTime, setOverrideTime] = useState('');
  const [useTimeOverride, setUseTimeOverride] = useState(false);
  const [selectedHouseSystem, setSelectedHouseSystem] = useState<HouseSystem>(savedHouseSystem || 'whole_sign');

  const [selectedAsteroids, setSelectedAsteroids] = useState<string[]>([]);
  const [showAsteroidModal, setShowAsteroidModal] = useState(false);
  const [asteroidSearch, setAsteroidSearch] = useState('');

  const [current, setCurrent] = useState<ChartSnapshot | null>(null);
  const [adjusted, setAdjusted] = useState<ChartSnapshot | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const [loading, setLoading] = useState(false);
  const [baselineLoading, setBaselineLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCalculated = useRef(false);

  const bd = birthData || profile;
  const bd_date = bd?.birth_date || bd?.date || bd?.birthDate;
  const bd_time = bd?.birth_time || bd?.time || bd?.birthTime || '12:00';
  const bd_lat = bd?.latitude || 0;
  const bd_lon = bd?.longitude || 0;
  const bd_tz = bd?.timezone || profile?.timezone;
  const bd_location = bd?.birth_location || bd?.birth_place || bd?.location || bd?.birthPlace || '';

  useEffect(() => {
    if (bd_time) setOverrideTime(bd_time);
  }, [bd_time]);

  const filteredAsteroids = asteroidSearch
    ? AVAILABLE_ASTEROIDS.filter(a => a.toLowerCase().includes(asteroidSearch.toLowerCase()))
    : AVAILABLE_ASTEROIDS;

  const toggleAsteroid = (name: string) => {
    setSelectedAsteroids(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const getHsApiName = (v: HouseSystem) => HOUSE_SYSTEMS.find(h => h.value === v)?.apiName || 'Whole Sign';

  async function fetchChart(time: string, hs: HouseSystem, asteroids: string[]): Promise<ChartSnapshot | null> {
    const { offset: tzOffset, label: tzLabel } = resolveTimezoneOffset(bd_tz, bd_lon, bd_date, time, bd_lat);

    const res: any = await api.getNatalChart({
      name: profile?.display_name || '',
      date: bd_date,
      time,
      latitude: bd_lat,
      longitude: bd_lon,
      timezone: bd_tz || tzLabel,
      tz_offset: tzOffset,
      location: bd_location,
      house_system: getHsApiName(hs),
      extra_asteroids: asteroids.length > 0 ? asteroids : undefined,
    });

    if (res.positions && res.house_cusps) {
      return {
        planets: parsePlanetResults(res.positions),
        houses: parseHouseResults(res.house_cusps),
        houseSystem: getHsApiName(hs),
        time,
        asteroids: [...asteroids],
      };
    }
    return null;
  }

  const runCalculation = async () => {
    if (!bd_date) {
      setError('Please set up your birth data first (Profile settings).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const effectiveTime = useTimeOverride && overrideTime ? overrideTime : bd_time;

      const [baseResult, adjResult] = await Promise.all([
        !current ? fetchChart(bd_time, savedHouseSystem || 'whole_sign', []) : Promise.resolve(current),
        fetchChart(effectiveTime, selectedHouseSystem, selectedAsteroids),
      ]);

      if (!adjResult) {
        setError('No chart data returned. Check your connection and try again.');
        return;
      }

      if (baseResult && !current) setCurrent(baseResult);
      setAdjusted(adjResult);
      hasCalculated.current = true;

      const isDifferent = selectedHouseSystem !== (savedHouseSystem || 'whole_sign')
        || (useTimeOverride && overrideTime !== bd_time)
        || selectedAsteroids.length > 0;
      setShowComparison(isDifferent);
    } catch (err: any) {
      setError('Could not reach the chart server: ' + (err?.message || 'Please check your internet connection.'));
    } finally {
      setLoading(false);
    }
  };

  const loadBaseline = async () => {
    if (!bd_date) return;
    setBaselineLoading(true);
    try {
      const result = await fetchChart(bd_time, savedHouseSystem || 'whole_sign', []);
      if (result) setCurrent(result);
    } catch {}
    setBaselineLoading(false);
  };

  useEffect(() => {
    if (bd_date && !current) loadBaseline();
  }, [bd_date]);

  const handleSaveHouseSystem = () => {
    saveHouseSystem(selectedHouseSystem);
  };

  const adjustTime = (minutes: number) => {
    const base = overrideTime || bd_time;
    const parts = base.split(':');
    if (parts.length !== 2) return;
    const d = new Date(2000, 0, 1, parseInt(parts[0], 10), parseInt(parts[1], 10));
    d.setMinutes(d.getMinutes() + minutes);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setOverrideTime(`${hh}:${mm}`);
    if (!useTimeOverride) setUseTimeOverride(true);
  };

  function hasDifference(planet: PlanetResult): boolean {
    if (!current || !showComparison) return false;
    const baseline = current.planets.find(p => p.name === planet.name);
    if (!baseline) return true;
    return baseline.sign !== planet.sign || baseline.house !== planet.house;
  }

  function getBaselineValue(name: string): PlanetResult | undefined {
    return current?.planets.find(p => p.name === name);
  }

  function houseDiffers(house: HouseResult): boolean {
    if (!current || !showComparison) return false;
    const baseline = current.houses.find(h => h.house === house.house);
    if (!baseline) return false;
    return baseline.sign !== house.sign;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-1 flex items-center gap-2">
        <Settings2 className="w-6 h-6 text-accent-primary" />
        Chart Adjuster
      </h1>
      <p className="text-sm text-text-muted leading-relaxed mb-6">
        Experiment with house systems, birth time rectification, and asteroids — then compare what changed.
      </p>

      {/* Birth Data Summary */}
      {bd_date ? (
        <div className="card mb-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Your Birth Data</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-text-muted">Date</p>
              <p className="text-sm text-text-primary font-medium">{bd_date}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Time</p>
              <p className="text-sm text-text-primary font-medium">{bd_time}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Location</p>
              <p className="text-sm text-text-primary font-medium truncate">{bd_location || '(none saved)'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-4 mb-4 border border-yellow-500/30 bg-yellow-500/10">
          <p className="text-sm text-yellow-400">No birth data found. Please complete your profile first.</p>
        </div>
      )}

      {/* House System */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-text-primary">House System</p>
          <span className="text-xs text-text-muted">Saved: {HOUSE_SYSTEMS.find(h => h.value === savedHouseSystem)?.label || 'Whole Sign'}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {HOUSE_SYSTEMS.map(hs => (
            <button
              key={hs.value}
              onClick={() => setSelectedHouseSystem(hs.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedHouseSystem === hs.value
                  ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                  : 'bg-bg-tertiary border-border-primary text-text-secondary hover:border-text-muted'
              }`}
            >
              {hs.label}
            </button>
          ))}
        </div>
        {selectedHouseSystem !== savedHouseSystem && (
          <button
            onClick={handleSaveHouseSystem}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary text-xs font-semibold hover:bg-accent-primary/20 transition-colors"
          >
            <Save className="w-3 h-3" />
            Save &ldquo;{HOUSE_SYSTEMS.find(h => h.value === selectedHouseSystem)?.label}&rdquo; as default
          </button>
        )}
      </div>

      {/* Birth Time Override */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-text-primary">Override Birth Time</p>
          <button
            onClick={() => setUseTimeOverride(!useTimeOverride)}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              useTimeOverride ? 'bg-accent-primary' : 'bg-bg-tertiary'
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              useTimeOverride ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
        {useTimeOverride && (
          <>
            <p className="text-xs text-text-muted mb-3">
              Adjust the time to see how planet positions and houses shift.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="time"
                value={overrideTime}
                onChange={(e) => setOverrideTime(e.target.value)}
                className="flex-1 bg-bg-tertiary border border-border-primary rounded-lg px-4 py-2.5 text-center text-lg text-text-primary tracking-widest focus:outline-none focus:border-accent-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted mr-1">Quick adjust:</span>
              {[-30, -15, -5, 5, 15, 30].map(min => (
                <button
                  key={min}
                  onClick={() => adjustTime(min)}
                  className="px-2.5 py-1 rounded-md bg-bg-tertiary border border-border-primary text-xs text-text-secondary hover:border-accent-primary/50 hover:text-accent-primary transition-colors"
                >
                  {min > 0 ? '+' : ''}{min}m
                </button>
              ))}
              <button
                onClick={() => { setOverrideTime(bd_time); }}
                className="px-2 py-1 rounded-md bg-bg-tertiary border border-border-primary text-xs text-text-muted hover:text-text-primary transition-colors"
                title="Reset to original time"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Asteroids */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-text-primary">Extra Asteroids</p>
          <button
            onClick={() => setShowAsteroidModal(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent-primary/20 text-accent-primary text-xs font-semibold hover:bg-accent-primary/30 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {selectedAsteroids.length === 0 ? (
          <p className="text-xs text-text-muted">None selected — tap Add to include asteroids in the chart</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedAsteroids.map(a => (
              <button
                key={a}
                onClick={() => toggleAsteroid(a)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-primary/20 border border-accent-primary text-accent-primary text-xs font-medium hover:bg-accent-primary/30"
              >
                {a} <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={runCalculation}
        disabled={!bd_date || loading}
        className="w-full btn-primary py-3 mb-4 flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ArrowLeftRight className="w-4 h-4" />
            Calculate{useTimeOverride && overrideTime !== bd_time ? ` · ${overrideTime}` : ''}
            {selectedHouseSystem !== savedHouseSystem ? ` · ${HOUSE_SYSTEMS.find(h => h.value === selectedHouseSystem)?.label}` : ''}
            {selectedAsteroids.length > 0 ? ` + ${selectedAsteroids.length} asteroids` : ''}
          </>
        )}
      </button>

      {error && (
        <div className="rounded-xl p-4 mb-4 bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Comparison Toggle */}
      {adjusted && current && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowComparison(false)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !showComparison ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Adjusted Only
          </button>
          <button
            onClick={() => setShowComparison(true)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showComparison ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            <ArrowLeftRight className="w-3 h-3" />
            Compare with Original
          </button>
        </div>
      )}

      {/* Results */}
      {adjusted && adjusted.planets.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-text-primary mb-2 mt-2 flex items-center gap-2">
            Planet Positions
            <span className="text-xs font-normal text-text-muted">({adjusted.houseSystem})</span>
          </h2>
          <div className="card mb-4 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center py-2 px-1 border-b border-border-primary text-xs text-text-muted uppercase tracking-wide">
              <span className="w-8" />
              <span className="flex-1">Planet</span>
              <span className="flex-[2]">Position</span>
              <span className="w-10 text-right">House</span>
            </div>
            {adjusted.planets.map(p => {
              const diff = hasDifference(p);
              const baseline = getBaselineValue(p.name);
              const isExtra = !baseline;
              return (
                <div
                  key={p.name}
                  className={`flex items-center py-2.5 px-1 border-b border-border-primary last:border-b-0 transition-colors ${
                    diff ? 'bg-amber-500/5' : ''
                  } ${isExtra ? 'bg-accent-primary/5' : ''}`}
                >
                  <span className="w-8 text-center text-base text-accent-primary">
                    {PLANET_GLYPHS[p.name] || '●'}
                  </span>
                  <span className="flex-1 text-sm text-text-primary font-medium">
                    {p.name}
                    {p.retrograde && <span className="ml-1 text-red-400 text-xs">℞</span>}
                    {isExtra && <span className="ml-1.5 text-[10px] bg-accent-primary/20 text-accent-primary px-1.5 py-0.5 rounded">NEW</span>}
                  </span>
                  <span className="flex-[2] text-sm text-text-secondary">
                    <span className="text-accent-secondary">{SIGN_GLYPHS[p.sign]}</span>{' '}
                    {p.sign} {p.degree}°
                    {showComparison && diff && baseline && (
                      <span className="ml-2 text-xs text-amber-400">
                        ← was {SIGN_GLYPHS[baseline.sign]} {baseline.sign} {baseline.degree}°
                      </span>
                    )}
                  </span>
                  <span className={`w-10 text-right text-xs ${diff ? 'text-amber-400 font-semibold' : 'text-text-muted'}`}>
                    H{p.house}
                    {showComparison && diff && baseline && baseline.house !== p.house && (
                      <span className="block text-[10px] text-text-muted">was H{baseline.house}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <h2 className="text-lg font-semibold text-text-primary mb-2">House Cusps</h2>
          <div className="card mb-4 overflow-hidden">
            <div className="flex items-center py-2 px-1 border-b border-border-primary text-xs text-text-muted uppercase tracking-wide">
              <span className="w-8" />
              <span className="flex-1">House</span>
              <span className="flex-[2]">Cusp</span>
            </div>
            {adjusted.houses.map(h => {
              const diff = houseDiffers(h);
              const baseH = current?.houses.find(bh => bh.house === h.house);
              return (
                <div
                  key={h.house}
                  className={`flex items-center py-2.5 px-1 border-b border-border-primary last:border-b-0 ${
                    diff ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <span className="w-8 text-center text-accent-primary text-sm font-bold">{h.house}</span>
                  <span className="flex-1 text-sm text-text-primary">House {h.house}</span>
                  <span className="flex-[2] text-sm text-text-secondary">
                    <span className="text-accent-secondary">{SIGN_GLYPHS[h.sign]}</span>{' '}
                    {h.sign} {h.degree}°
                    {showComparison && diff && baseH && (
                      <span className="ml-2 text-xs text-amber-400">
                        ← was {SIGN_GLYPHS[baseH.sign]} {baseH.sign} {baseH.degree}°
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Change Summary */}
          {showComparison && current && (
            <ChangeSummary current={current} adjusted={adjusted} />
          )}
        </>
      )}

      {/* Loading baseline indicator */}
      {baselineLoading && !adjusted && (
        <div className="flex items-center justify-center gap-2 py-8 text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading your baseline chart...</span>
        </div>
      )}

      {/* Asteroid Modal */}
      {showAsteroidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-primary border border-border-primary rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
              <span className="text-sm font-semibold text-text-primary">
                Select Asteroids
                {selectedAsteroids.length > 0 && (
                  <span className="ml-2 text-xs text-accent-primary">({selectedAsteroids.length} selected)</span>
                )}
              </span>
              <button
                onClick={() => { setShowAsteroidModal(false); setAsteroidSearch(''); }}
                className="text-sm font-semibold text-accent-primary"
              >
                Done
              </button>
            </div>
            <div className="p-3">
              <input
                type="text"
                value={asteroidSearch}
                onChange={(e) => setAsteroidSearch(e.target.value)}
                placeholder="Search asteroids..."
                className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {filteredAsteroids.map(a => {
                const selected = selectedAsteroids.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleAsteroid(a)}
                    className={`flex items-center justify-between w-full py-2.5 border-b border-border-primary text-left ${
                      selected ? 'bg-accent-primary/10' : ''
                    }`}
                  >
                    <span className={`text-sm ${selected ? 'text-accent-primary font-semibold' : 'text-text-primary'}`}>
                      {a}
                    </span>
                    {selected && <span className="text-accent-primary font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChangeSummary({ current, adjusted }: { current: ChartSnapshot; adjusted: ChartSnapshot }) {
  const signChanges: string[] = [];
  const houseChanges: string[] = [];

  for (const ap of adjusted.planets) {
    const bp = current.planets.find(p => p.name === ap.name);
    if (!bp) continue;
    if (bp.sign !== ap.sign) {
      signChanges.push(`${ap.name}: ${SIGN_GLYPHS[bp.sign]} ${bp.sign} → ${SIGN_GLYPHS[ap.sign]} ${ap.sign}`);
    }
    if (bp.house !== ap.house) {
      houseChanges.push(`${ap.name}: House ${bp.house} → House ${ap.house}`);
    }
  }

  const newBodies = adjusted.planets.filter(ap => !current.planets.find(bp => bp.name === ap.name));

  if (signChanges.length === 0 && houseChanges.length === 0 && newBodies.length === 0) {
    return (
      <div className="card mb-4 border border-green-500/20 bg-green-500/5">
        <p className="text-sm text-green-400 text-center">No differences — the adjusted chart matches your original.</p>
      </div>
    );
  }

  return (
    <div className="card mb-4 border border-amber-500/20 bg-amber-500/5">
      <p className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
        <ArrowLeftRight className="w-4 h-4" />
        What Changed
      </p>
      {signChanges.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Sign Changes</p>
          {signChanges.map(c => (
            <p key={c} className="text-sm text-text-secondary py-0.5">{c}</p>
          ))}
        </div>
      )}
      {houseChanges.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">House Changes</p>
          {houseChanges.map(c => (
            <p key={c} className="text-sm text-text-secondary py-0.5">{c}</p>
          ))}
        </div>
      )}
      {newBodies.length > 0 && (
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">New Bodies Added</p>
          {newBodies.map(p => (
            <p key={p.name} className="text-sm text-text-secondary py-0.5">
              {PLANET_GLYPHS[p.name] || '●'} {p.name}: {SIGN_GLYPHS[p.sign]} {p.sign} {p.degree}° in House {p.house}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
