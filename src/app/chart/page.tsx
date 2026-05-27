'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useGettingStarted } from '@/hooks/useGettingStarted';
import { useAstrologySettings } from '@/stores/astrologySettingsStore';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import { cn } from '@/lib/utils';
import { getPlanetGlyph, getZodiacGlyph } from '@/lib/utils';
import { CitySearch } from '@/components/ui/CitySearch';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { NatalWheel } from '@/components/charts/NatalWheel';
import Link from 'next/link';
import { TrendingUp, Sun, Moon, Heart, Save } from 'lucide-react';
import { getPlacementInterpretation, getAspectInterpretation, getHouseInterpretation } from '@/lib/interpretations';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { detectAspectPatterns, detectChartShape, interpretPatterns } from '@/lib/interpretations';
import type { ChartPlanet, ChartAspect } from '@/lib/interpretations';
import { useTranslation } from 'react-i18next';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const CHART_LINKS = [
  { href: '/chart/progressed', label: 'Progressed Chart', icon: TrendingUp, desc: 'Inner evolution over time' },
  { href: '/chart/solar-return', label: 'Solar Return', icon: Sun, desc: 'Birthday year themes' },
  { href: '/chart/lunar-return', label: 'Lunar Return', icon: Moon, desc: 'Monthly emotional forecast' },
  { href: '/chart/synastry', label: 'Synastry', icon: Heart, desc: 'Relationship compatibility' },
  { href: '/chart/composite', label: 'Composite', icon: Heart, desc: 'Relationship midpoint chart' },
  { href: '/chart/saved', label: 'Saved Charts', icon: Save, desc: 'Friends & family charts' },
];

const TABS = ['Positions', 'Aspects', 'Houses', 'Patterns'] as const;
const TAB_KEYS: Record<string, string> = {
  Positions: 'chart.positions',
  Aspects: 'chart.aspects',
  Houses: 'chart.houses',
  Patterns: 'chart.patterns',
};

export default function ChartPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { houseSystem } = useAstrologySettings();
  const { markComplete } = useGettingStarted();
  useEffect(() => { markComplete('view_natal'); }, [markComplete]);
  const [activeTab, setActiveTab] = useState('Positions');
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
  const [birthTime, setBirthTime] = useState(profile?.birth_time || '12:00');
  const [birthLocation, setBirthLocation] = useState(profile?.birth_location || '');
  const [latitude, setLatitude] = useState<number | null>(profile?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(profile?.longitude || null);
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');

  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
  const [expandedAspects, setExpandedAspects] = useState<Set<string>>(new Set());
  const [expandedHouses, setExpandedHouses] = useState<Set<number>>(new Set());

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

  async function calculateChart(e?: React.FormEvent) {
    if (e) e.preventDefault();
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
      const { offset, label } = resolveTimezoneOffset(timezone, longitude, birthDate, birthTime, latitude);
      const data = await api.getNatalChart({
        name: profile?.display_name || '',
        date: birthDate,
        time: birthTime,
        latitude,
        longitude,
        timezone: label,
        tz_offset: offset,
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

  // Auto-calculate on mount when profile has birth data
  useEffect(() => {
    if (profile?.birth_date && profile?.latitude && !chart && !loading) {
      calculateChart();
    }
  }, [profile]);

  const wheelProps = useMemo(() => {
    if (!chart) return null;
    const positions = chart.positions || [];
    const planets = positions.map((p: any) => ({
      name: p.name,
      longitude: p.longitude,
      sign: p.sign,
      degree: p.sign_degree ?? (p.longitude % 30),
      retrograde: p.is_retrograde || false,
    }));
    const aspects = (chart.aspects || []).map((a: any) => ({
      planet1: a.body1,
      planet2: a.body2,
      type: a.aspect_name,
      orb: a.orb,
    }));
    const houseCusps: number[] = chart.house_cusps || [];
    const ascPos = positions.find((p: any) => p.name === 'Ascendant');
    const mcPos = positions.find((p: any) => p.name === 'MC');
    const ascendantDegree = ascPos ? ascPos.longitude : (houseCusps[0] || 0);
    const midheavenDegree = mcPos ? mcPos.longitude : (houseCusps[9] || 0);
    return { planets, aspects, houseCusps, ascendantDegree, midheavenDegree };
  }, [chart]);

  const houses = useMemo(() => {
    if (!chart?.house_cusps) return [];
    return (chart.house_cusps as number[]).map((lon: number, i: number) => {
      const sign = SIGNS[Math.floor(lon / 30)];
      return { number: i + 1, sign, degree: lon % 30, longitude: lon };
    });
  }, [chart]);

  const interpretedPatterns = useMemo(() => {
    if (!chart) return [];
    const positions = chart.positions || [];
    const chartPlanets: ChartPlanet[] = positions.map((p: any) => ({
      name: p.name, sign: p.sign, house: p.house,
      longitude: p.longitude, is_retrograde: p.is_retrograde,
      sign_degree: p.sign_degree,
    }));
    const chartAspects: ChartAspect[] = (chart.aspects || []).map((a: any) => ({
      body1: a.body1, body2: a.body2, aspect_name: a.aspect_name, orb: a.orb,
    }));
    const patterns = detectAspectPatterns(chartPlanets, chartAspects);
    const shape = detectChartShape(chartPlanets);
    return interpretPatterns(patterns, shape);
  }, [chart]);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-6">{t('chart.natal')}</h1>

      {/* Chart sub-page links — always visible */}
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

      {!chart && (
        <form onSubmit={calculateChart} className="card space-y-4 max-w-lg">
          <p className="text-sm text-text-tertiary mb-2">Enter your birth details to calculate your natal chart</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('onboarding.birthDate')}</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('onboarding.birthTime')}</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('onboarding.birthPlace')}</label>
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

      {loading && <LoadingCosmic label="Calculating your natal chart..." />}

      {chart && wheelProps && (
        <div className="space-y-6">
          <div className="card flex items-center justify-center p-4">
            <NatalWheel
              planets={wheelProps.planets}
              aspects={wheelProps.aspects}
              houseCusps={wheelProps.houseCusps}
              ascendantDegree={wheelProps.ascendantDegree}
              midheavenDegree={wheelProps.midheavenDegree}
              size={460}
            />
          </div>

          {/* Chart summary card — Sun, Moon, Rising */}
          {chart && (
            <div className="card bg-gradient-cosmic border-accent-muted">
              <div className="grid grid-cols-3 gap-4 text-center">
                {(() => {
                  const sun = chart.positions?.find((p: any) => p.name === 'Sun');
                  const moon = chart.positions?.find((p: any) => p.name === 'Moon');
                  const asc = chart.positions?.find((p: any) => p.name === 'Ascendant');
                  return (
                    <>
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider">Sun</p>
                        <p className="text-lg font-semibold text-text-primary">{getZodiacGlyph(sun?.sign)} {sun?.sign}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider">Moon</p>
                        <p className="text-lg font-semibold text-text-primary">{getZodiacGlyph(moon?.sign)} {moon?.sign}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider">Rising</p>
                        <p className="text-lg font-semibold text-text-primary">{getZodiacGlyph(asc?.sign)} {asc?.sign}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="flex border-b border-border-primary overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-5 py-3 text-sm font-medium transition-colors relative whitespace-nowrap',
                  activeTab === tab
                    ? 'text-accent-primary'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                {t(TAB_KEYS[tab])}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'Positions' && (
            <div className="card">
              <div className="divide-y divide-border-primary">
                {chart.positions?.map((planet: any) => (
                  <div key={planet.name}>
                    <div
                      className="flex items-center gap-3 py-3 px-1 cursor-pointer hover:bg-bg-tertiary/50 rounded-lg transition-colors"
                      onClick={() => {
                        const next = new Set(expandedPositions);
                        next.has(planet.name) ? next.delete(planet.name) : next.add(planet.name);
                        setExpandedPositions(next);
                      }}
                    >
                      <span className="text-xl w-8 text-center">{getPlanetGlyph(planet.name)}</span>
                      <span className="text-text-primary font-medium flex-1">{planet.name}</span>
                      <span className="text-text-secondary flex items-center gap-1">
                        {getZodiacGlyph(planet.sign)} {planet.sign}
                      </span>
                      <span className="text-text-tertiary text-sm w-16 text-right">
                        {planet.sign_degree?.toFixed(2)}°
                      </span>
                      <span className="text-text-muted text-sm w-12 text-right">
                        H{planet.house}
                      </span>
                      {planet.is_retrograde && (
                        <span className="text-xs text-gold-primary font-semibold">&#x211E;</span>
                      )}
                      <span className={cn("text-text-muted text-xs transition-transform", expandedPositions.has(planet.name) && "rotate-180")}>&#x25BC;</span>
                    </div>
                    {expandedPositions.has(planet.name) && (
                      <div className="px-4 pb-4 pt-1 text-sm text-text-secondary leading-relaxed whitespace-pre-line border-l-2 border-accent-primary/20 ml-4">
                        <MarkdownText text={getPlacementInterpretation(planet.name, planet.sign, planet.house)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Aspects' && chart.aspects && (
            <div className="card">
              <div className="divide-y divide-border-primary">
                {chart.aspects.map((aspect: any, i: number) => (
                  <div key={i}>
                    <div
                      className="flex items-center gap-3 py-3 px-1 cursor-pointer hover:bg-bg-tertiary/50 rounded-lg transition-colors"
                      onClick={() => {
                        const next = new Set(expandedAspects);
                        const key = `${aspect.body1}-${aspect.body2}`;
                        next.has(key) ? next.delete(key) : next.add(key);
                        setExpandedAspects(next);
                      }}
                    >
                      <span className="text-text-secondary text-sm font-medium flex-1">{aspect.body1}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-accent-muted text-accent-secondary font-medium">
                        {aspect.aspect_name}
                      </span>
                      <span className="text-text-secondary text-sm font-medium flex-1 text-right">{aspect.body2}</span>
                      <span className="text-text-muted text-xs w-12 text-right">{aspect.orb?.toFixed(1)}°</span>
                      <span className={cn("text-text-muted text-xs transition-transform", expandedAspects.has(`${aspect.body1}-${aspect.body2}`) && "rotate-180")}>&#x25BC;</span>
                    </div>
                    {expandedAspects.has(`${aspect.body1}-${aspect.body2}`) && (
                      <div className="px-4 pb-4 pt-1 text-sm text-text-secondary leading-relaxed whitespace-pre-line border-l-2 border-accent-primary/20 ml-4">
                        <MarkdownText text={getAspectInterpretation(aspect.body1, aspect.body2, aspect.aspect_name)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Houses' && houses.length > 0 && (
            <div className="card">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border-primary/50 rounded-xl overflow-hidden">
                {houses.map((house) => (
                  <div key={house.number} className="bg-bg-card p-4">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        const next = new Set(expandedHouses);
                        next.has(house.number) ? next.delete(house.number) : next.add(house.number);
                        setExpandedHouses(next);
                      }}
                    >
                      <p className="text-xs text-text-muted mb-1">House {house.number}</p>
                      <p className="text-sm text-text-primary font-medium">
                        {getZodiacGlyph(house.sign)} {house.sign}
                      </p>
                      <p className="text-xs text-text-tertiary">{house.degree?.toFixed(2)}°</p>
                    </div>
                    {expandedHouses.has(house.number) && (
                      <div className="mt-2 pt-2 border-t border-border-primary text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                        <MarkdownText text={getHouseInterpretation(house.number, house.sign)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Patterns' && (
            <div className="card">
              {interpretedPatterns.length > 0 ? (
                <div className="space-y-4">
                  {interpretedPatterns.map((pattern, i) => (
                    <div key={i} className="p-4 bg-bg-tertiary/50 rounded-xl border border-accent-muted">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          pattern.category === 'chart-shape' ? 'bg-water/20 text-water' :
                          pattern.category === 'major-pattern' ? 'bg-fire/20 text-fire' :
                          'bg-earth/20 text-earth'
                        )}>
                          {pattern.category === 'chart-shape' ? 'Chart Shape' :
                           pattern.category === 'major-pattern' ? 'Major Pattern' : 'Pattern'}
                        </span>
                        {pattern.score > 0 && (
                          <span className="text-[10px] text-text-muted">{pattern.score}% confidence</span>
                        )}
                      </div>
                      <h4 className="text-text-primary font-semibold mb-1">{pattern.title}</h4>
                      <p className="text-xs text-text-muted mb-2">{pattern.geometrySummary}</p>
                      <p className="text-sm text-text-secondary mb-2">{pattern.interpretation}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        <div className="p-2 rounded-lg bg-bg-secondary">
                          <p className="text-[10px] text-text-muted uppercase mb-1">How This Shows Up</p>
                          <p className="text-xs text-text-secondary">{pattern.lifeManifest}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-bg-secondary">
                          <p className="text-[10px] text-text-muted uppercase mb-1">Growth Lesson</p>
                          <p className="text-xs text-text-secondary">{pattern.growthLesson}</p>
                        </div>
                      </div>
                      {pattern.focalLabel && (
                        <p className="text-xs text-accent-secondary mt-2">{pattern.focalLabel}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm text-center py-8">
                  No aspect patterns detected in this chart
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
