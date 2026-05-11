'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useAstrologySettings } from '@/stores/astrologySettingsStore';
import { cn } from '@/lib/utils';
import { getPlanetGlyph, getZodiacGlyph } from '@/lib/utils';
import { CitySearch } from '@/components/ui/CitySearch';
import Link from 'next/link';
import { TrendingUp, Sun, Moon, Heart, Save } from 'lucide-react';

const CHART_TYPES = [
  { key: 'natal', label: 'Natal' },
  { key: 'progressed', label: 'Progressed' },
  { key: 'solar-return', label: 'Solar Return' },
  { key: 'synastry', label: 'Synastry' },
];

const CHART_LINKS = [
  { href: '/chart/progressed', label: 'Progressed Chart', icon: TrendingUp, desc: 'Inner evolution over time' },
  { href: '/chart/solar-return', label: 'Solar Return', icon: Sun, desc: 'Birthday year themes' },
  { href: '/chart/lunar-return', label: 'Lunar Return', icon: Moon, desc: 'Monthly emotional forecast' },
  { href: '/chart/synastry', label: 'Synastry', icon: Heart, desc: 'Relationship compatibility' },
  { href: '/chart/composite', label: 'Composite', icon: Heart, desc: 'Relationship midpoint chart' },
  { href: '/chart/saved', label: 'Saved Charts', icon: Save, desc: 'Friends & family charts' },
];

const TABS = ['Positions', 'Aspects', 'Houses', 'Patterns'];

export default function ChartPage() {
  const { profile } = useAuthStore();
  const { houseSystem } = useAstrologySettings();
  const [chartType, setChartType] = useState('natal');
  const [activeTab, setActiveTab] = useState('Positions');
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Birth data form
  const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
  const [birthTime, setBirthTime] = useState(profile?.birth_time || '12:00');
  const [birthLocation, setBirthLocation] = useState(profile?.birth_location || '');
  const [latitude, setLatitude] = useState<number | null>(profile?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(profile?.longitude || null);
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');

  // Sync form fields when profile loads asynchronously
  useEffect(() => {
    if (profile) {
      setBirthDate(profile.birth_date || '');
      setBirthTime(profile.birth_time || '12:00');
      setBirthLocation(profile.birth_location || '');
      setLatitude(profile.latitude || null);
      setLongitude(profile.longitude || null);
      setTimezone(profile.timezone || 'UTC');
    }
  }, [profile]);

  function handleCitySelect(location: string, lat: number, lon: number, tz: string) {
    setBirthLocation(location);
    setLatitude(lat);
    setLongitude(lon);
    setTimezone(tz);
  }

  async function calculateChart(e: React.FormEvent) {
    e.preventDefault();
    if (!latitude || !longitude) {
      setError('Please select a birth location from the suggestions.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const hsMap: Record<string, string> = {
        'placidus': 'Placidus', 'whole_sign': 'Whole Sign', 'koch': 'Koch',
        'campanus': 'Campanus', 'regiomontanus': 'Regiomontanus',
        'equal': 'Equal', 'porphyry': 'Porphyry', 'alcabitius': 'Alcabitius',
      };
      const data = await api.getNatalChart({
        name: profile?.display_name || '',
        date: birthDate,
        time: birthTime,
        latitude,
        longitude,
        timezone,
        location: birthLocation,
        house_system: hsMap[houseSystem] || 'Whole Sign',
      });
      setChart(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-6">My Chart</h1>

      {/* Chart type selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CHART_TYPES.map((type) => (
          <button
            key={type.key}
            onClick={() => setChartType(type.key)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all',
              chartType === type.key
                ? 'bg-accent-primary border-accent-primary text-white'
                : 'border-border-primary text-text-muted hover:text-text-primary hover:border-border-secondary'
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Chart sub-pages links */}
      {!chart && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {CHART_LINKS.map(({ href, label, icon: Icon, desc }) => (
            <Link key={href} href={href} className="card hover:border-accent-primary/30 transition-colors flex items-center gap-3">
              <Icon className="w-5 h-5 text-accent-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-[10px] text-text-muted">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!chart && (
        <form onSubmit={calculateChart} className="card space-y-4 max-w-lg">
          <p className="text-sm text-text-tertiary mb-2">Enter your birth details to calculate your {chartType} chart</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Birth Date</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Birth Time</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Birth Location</label>
            <CitySearch
              value={birthLocation}
              onChange={handleCitySelect}
              placeholder="Search city, state, or country..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Calculating...' : 'Calculate Chart'}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      )}

      {chart && (
        <div className="space-y-6">
          {/* Tab navigation */}
          <div className="flex border-b border-border-primary">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-5 py-3 text-sm font-medium transition-colors relative',
                  activeTab === tab
                    ? 'text-accent-primary'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Positions tab */}
          {activeTab === 'Positions' && (
            <div className="card">
              <div className="divide-y divide-border-primary">
                {chart.planets?.map((planet: any) => (
                  <div key={planet.name} className="flex items-center gap-3 py-3 px-1">
                    <span className="text-xl w-8 text-center">{getPlanetGlyph(planet.name)}</span>
                    <span className="text-text-primary font-medium flex-1">{planet.name}</span>
                    <span className="text-text-secondary flex items-center gap-1">
                      {getZodiacGlyph(planet.sign)} {planet.sign}
                    </span>
                    <span className="text-text-tertiary text-sm w-16 text-right">
                      {planet.degree?.toFixed(2)}°
                    </span>
                    <span className="text-text-muted text-sm w-12 text-right">
                      H{planet.house}
                    </span>
                    {planet.retrograde && (
                      <span className="text-xs text-gold-primary font-semibold">℞</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aspects tab */}
          {activeTab === 'Aspects' && chart.aspects && (
            <div className="card">
              <div className="divide-y divide-border-primary">
                {chart.aspects.map((aspect: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-3 px-1">
                    <span className="text-text-secondary text-sm font-medium flex-1">{aspect.planet1}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent-muted text-accent-secondary font-medium">
                      {aspect.aspect}
                    </span>
                    <span className="text-text-secondary text-sm font-medium flex-1 text-right">{aspect.planet2}</span>
                    <span className="text-text-muted text-xs w-12 text-right">{aspect.orb?.toFixed(1)}°</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Houses tab */}
          {activeTab === 'Houses' && chart.houses && (
            <div className="card">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border-primary/50 rounded-xl overflow-hidden">
                {chart.houses.map((house: any, i: number) => (
                  <div key={i} className="bg-bg-card p-4">
                    <p className="text-xs text-text-muted mb-1">House {house.number || i + 1}</p>
                    <p className="text-sm text-text-primary font-medium">
                      {getZodiacGlyph(house.sign)} {house.sign}
                    </p>
                    <p className="text-xs text-text-tertiary">{house.degree?.toFixed(2)}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns tab */}
          {activeTab === 'Patterns' && (
            <div className="card">
              {chart.patterns && chart.patterns.length > 0 ? (
                <div className="space-y-4">
                  {chart.patterns.map((pattern: any, i: number) => (
                    <div key={i} className="p-4 bg-bg-tertiary/50 rounded-xl border border-accent-muted">
                      <h4 className="text-text-primary font-semibold mb-1">{pattern.name}</h4>
                      <p className="text-sm text-text-tertiary">{pattern.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm text-center py-8">
                  Chart patterns will appear here after calculation
                </p>
              )}
            </div>
          )}

          <button onClick={() => setChart(null)} className="btn-secondary">
            New Chart
          </button>
        </div>
      )}
    </div>
  );
}
