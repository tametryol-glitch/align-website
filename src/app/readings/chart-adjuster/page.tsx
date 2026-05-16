'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useChartStore } from '@/stores/chartStore';
import { api, buildBirthData } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, X, Settings2 } from 'lucide-react';

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

const HOUSE_SYSTEMS = [
  'Whole Sign', 'Placidus', 'Koch', 'Equal', 'Campanus',
  'Regiomontanus', 'Porphyry', 'Morinus', 'Alcabitius',
];

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const SIGN_GLYPHS: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

export default function ChartAdjusterPage() {
  const { profile } = useAuthStore();
  const { birthData } = useChartStore();

  const [overrideTime, setOverrideTime] = useState('');
  const [useTimeOverride, setUseTimeOverride] = useState(false);
  const [selectedHouseSystem, setSelectedHouseSystem] = useState('Whole Sign');

  const [selectedAsteroids, setSelectedAsteroids] = useState<string[]>([]);
  const [showAsteroidModal, setShowAsteroidModal] = useState(false);
  const [asteroidSearch, setAsteroidSearch] = useState('');

  const [planets, setPlanets] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculated, setCalculated] = useState(false);

  const bd = birthData || profile;
  const bd_date = bd?.birth_date || bd?.date || bd?.birthDate;
  const bd_time = bd?.birth_time || bd?.time || bd?.birthTime || '12:00';
  const bd_lat = bd?.latitude || 0;
  const bd_lon = bd?.longitude || 0;
  const bd_location = bd?.birth_place || bd?.location || bd?.birthPlace || '';

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

  const runCalculation = async () => {
    if (!bd_date) {
      setError('Please set up your birth data first (Profile settings).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const effectiveTime = useTimeOverride && overrideTime ? overrideTime : bd_time;
      const birthDataPayload = buildBirthData({
        ...bd,
        birth_time: effectiveTime,
      });

      const res: any = await api.getNatalChart({
        ...birthDataPayload,
        house_system: selectedHouseSystem,
        extra_asteroids: selectedAsteroids.length > 0 ? selectedAsteroids : undefined,
      });

      if (res.positions && res.house_cusps) {
        const p = res.positions.map((pl: any) => ({
          name: pl.name,
          sign: SIGNS[Math.floor(pl.longitude / 30)],
          degree: (pl.longitude % 30).toFixed(1),
          house: pl.house || '-',
          retrograde: pl.is_retrograde,
        }));
        const h = res.house_cusps.map((lon: number, i: number) => ({
          house: i + 1,
          sign: SIGNS[Math.floor(lon / 30)],
          degree: (lon % 30).toFixed(1),
        }));
        setPlanets(p);
        setHouses(h);
        setCalculated(true);
      } else {
        setError('No chart data returned. Check your connection and try again.');
      }
    } catch (err: any) {
      setError('Could not reach the chart server: ' + (err?.message || 'Please check your internet connection.'));
    } finally {
      setLoading(false);
    }
  };

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
        Experiment with house systems, birth time rectification, and asteroids without changing your saved data.
      </p>

      {bd_date ? (
        <div className="card mb-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Your Birth Data</p>
          <p className="text-sm text-text-secondary">Date: {bd_date}</p>
          <p className="text-sm text-text-secondary">Time: {bd_time}</p>
          <p className="text-sm text-text-secondary">Location: {bd_location || '(none saved)'}</p>
        </div>
      ) : (
        <div className="rounded-xl p-4 mb-4 border border-yellow-500/30 bg-yellow-500/10">
          <p className="text-sm text-yellow-400">No birth data found. Please complete your profile first.</p>
        </div>
      )}

      {/* House System */}
      <div className="card mb-4">
        <p className="text-sm font-semibold text-text-primary mb-2">House System</p>
        <div className="flex flex-wrap gap-2">
          {HOUSE_SYSTEMS.map(hs => (
            <button
              key={hs}
              onClick={() => setSelectedHouseSystem(hs)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedHouseSystem === hs
                  ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                  : 'bg-bg-tertiary border-border-primary text-text-secondary hover:border-text-muted'
              }`}
            >
              {hs}
            </button>
          ))}
        </div>
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
            <p className="text-xs text-text-muted mb-2">
              Enter a different time to see how the chart changes (for birth time rectification)
            </p>
            <input
              type="text"
              value={overrideTime}
              onChange={(e) => setOverrideTime(e.target.value)}
              placeholder="HH:MM (e.g. 14:35)"
              maxLength={5}
              className="w-full bg-bg-tertiary border border-border-primary rounded-lg px-4 py-2 text-center text-lg text-text-primary tracking-widest placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50"
            />
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
            Calculate with {selectedHouseSystem}
            {useTimeOverride && overrideTime ? ` · ${overrideTime}` : ''}
            {selectedAsteroids.length > 0 ? ` + ${selectedAsteroids.length} asteroids` : ''}
          </>
        )}
      </button>

      {error && (
        <div className="rounded-xl p-4 mb-4 bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {calculated && planets.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-text-primary mb-2 mt-4">
            Planet Positions ({selectedHouseSystem})
          </h2>
          <div className="card mb-4">
            {planets.map(p => (
              <div key={p.name} className="flex items-center py-2 border-b border-border-primary last:border-b-0">
                <span className="w-7 text-center text-accent-primary">{SIGN_GLYPHS[p.sign] || '●'}</span>
                <span className="flex-1 text-sm text-text-primary">{p.name}</span>
                <span className="flex-[2] text-sm text-text-secondary">
                  {SIGN_GLYPHS[p.sign] || ''} {p.sign} {p.degree}°{p.retrograde ? ' ℞' : ''}
                </span>
                <span className="w-8 text-right text-xs text-text-muted">H{p.house}</span>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-text-primary mb-2">House Cusps</h2>
          <div className="card mb-4">
            {houses.map(h => (
              <div key={h.house} className="flex items-center py-2 border-b border-border-primary last:border-b-0">
                <span className="w-7 text-center text-accent-primary text-sm font-bold">{h.house}</span>
                <span className="flex-1 text-sm text-text-primary">House {h.house}</span>
                <span className="flex-[2] text-sm text-text-secondary">
                  {SIGN_GLYPHS[h.sign] || ''} {h.sign} {h.degree}°
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Asteroid Modal */}
      {showAsteroidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-primary border border-border-primary rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
              <span className="text-sm font-semibold text-text-primary">Select Asteroids</span>
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
