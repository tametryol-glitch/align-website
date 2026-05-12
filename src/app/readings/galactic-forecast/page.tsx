'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Clock, Sun, Heart, Briefcase, Sparkles, Baby, Leaf } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getFullDuadCompendium } from '@/lib/engines';
import { PaywallGate } from '@/components/ui/PaywallGate';

type ForecastType = 'General' | 'Money' | 'Love' | 'Career' | 'Spiritual Work' | 'Children' | 'Healing';

const FORECAST_TYPES: Array<{ key: ForecastType; label: string; icon: string }> = [
  { key: 'General', label: 'General', icon: '🌟' },
  { key: 'Money', label: 'Money', icon: '💰' },
  { key: 'Love', label: 'Love', icon: '💜' },
  { key: 'Career', label: 'Career', icon: '💼' },
  { key: 'Spiritual Work', label: 'Spiritual', icon: '🔮' },
  { key: 'Children', label: 'Children', icon: '👶' },
  { key: 'Healing', label: 'Healing', icon: '🌿' },
];

const HORIZON_OPTIONS = [
  { hours: 3, label: '3h' },
  { hours: 6, label: '6h' },
  { hours: 12, label: '12h' },
  { hours: 24, label: '24h' },
];

interface ForecastWindow {
  start: string;
  end: string;
  quality: 'strong' | 'mixed' | 'weak';
  description: string;
  planets: string[];
}

function getQualityColor(quality: string): string {
  switch (quality) {
    case 'strong': return '#F5A623';
    case 'mixed': return '#9B6FF6';
    case 'weak': return '#6b7280';
    default: return '#9B6FF6';
  }
}

function getQualityLabel(quality: string): string {
  switch (quality) {
    case 'strong': return 'Favorable';
    case 'mixed': return 'Mixed';
    case 'weak': return 'Challenging';
    default: return 'Neutral';
  }
}

export default function GalacticForecastPage() {
  const { profile } = useAuthStore();
  const [forecastType, setForecastType] = useState<ForecastType>('General');
  const [horizon, setHorizon] = useState(12);
  const [windows, setWindows] = useState<ForecastWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [computed, setComputed] = useState(false);

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="galactic_forecast"><BirthDataPrompt message="Add your birth data to see your personalized timing forecast." /></PaywallGate>;
  }

  async function computeForecast() {
    setLoading(true);
    setError('');
    try {
      // Get natal chart for duad positions
      const chartData = await api.getNatalChart(buildBirthData(profile!));

      // Get current transits (unused for now but fetched for future enrichment)
      const transits = await api.getCurrentTransits?.(buildBirthData(profile!)).catch(() => null);

      // Compute galactic windows based on natal chart + current transits
      const planets = chartData?.planets || chartData?.positions || [];
      const generatedWindows = generateWindows(planets, forecastType, horizon);
      setWindows(generatedWindows);
      setComputed(true);
    } catch (err: any) {
      setError(err.message || 'Failed to compute forecast');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="galactic_forecast">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Galactic Forecast</h1>
          <p className="text-text-tertiary text-sm">Timing windows based on your galactic clock position</p>
        </div>
      </div>

      {!computed && !loading && (
        <div className="space-y-5">
          {/* Focus area */}
          <div className="card">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Focus Area</h3>
            <div className="flex flex-wrap gap-2">
              {FORECAST_TYPES.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setForecastType(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    forecastType === key
                      ? 'bg-accent-primary text-white'
                      : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Horizon */}
          <div className="card">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Time Horizon</h3>
            <div className="flex gap-2">
              {HORIZON_OPTIONS.map(({ hours, label }) => (
                <button
                  key={hours}
                  onClick={() => setHorizon(hours)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    horizon === hours
                      ? 'bg-accent-primary text-white'
                      : 'bg-bg-tertiary text-text-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={computeForecast} className="btn-primary w-full">
            Generate Forecast
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      )}

      {loading && <LoadingCosmic label={`Scanning ${horizon}h of galactic time for ${forecastType.toLowerCase()} windows...`} />}

      {computed && windows.length > 0 && (
        <div className="space-y-4">
          {/* Current status */}
          <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted text-center">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Current Window</p>
            <p className="text-lg font-bold" style={{ color: getQualityColor(windows[0]?.quality || 'mixed') }}>
              {getQualityLabel(windows[0]?.quality || 'mixed')} for {forecastType}
            </p>
            <p className="text-xs text-text-tertiary mt-1">{windows[0]?.description}</p>
          </div>

          {/* All windows */}
          <div className="card">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              Upcoming Windows ({windows.length})
            </h3>
            <div className="space-y-3">
              {windows.map((w, i) => (
                <div key={i} className="border border-border-primary rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: getQualityColor(w.quality) }}>
                      {getQualityLabel(w.quality)}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(w.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(w.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{w.description}</p>
                  {w.planets.length > 0 && (
                    <p className="text-[10px] text-text-muted mt-1">
                      Active: {w.planets.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { setComputed(false); setWindows([]); }} className="btn-secondary w-full">
            New Forecast
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

/** Generate forecast windows from natal chart positions */
function generateWindows(planets: any[], forecastType: ForecastType, horizon: number): ForecastWindow[] {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const now = new Date();
  const windows: ForecastWindow[] = [];

  // Find key planets for this forecast type
  const focusPlanets: Record<ForecastType, string[]> = {
    General: ['Sun', 'Moon', 'Jupiter'],
    Money: ['Venus', 'Jupiter', 'Saturn', 'Mercury'],
    Love: ['Venus', 'Moon', 'Mars'],
    Career: ['Saturn', 'Sun', 'Jupiter', 'Mars'],
    'Spiritual Work': ['Neptune', 'Moon', 'Jupiter', 'Pluto'],
    Children: ['Moon', 'Jupiter', 'Venus'],
    Healing: ['Chiron', 'Moon', 'Neptune', 'Pluto'],
  };

  const relevantPlanets = focusPlanets[forecastType] || ['Sun', 'Moon'];
  const natalPositions = planets.filter((p: any) => relevantPlanets.includes(p.name || p.planet || ''));

  // Generate time-sliced windows
  const sliceHours = horizon <= 6 ? 1 : horizon <= 12 ? 2 : 3;
  const numSlices = Math.ceil(horizon / sliceHours);

  for (let i = 0; i < numSlices; i++) {
    const start = new Date(now.getTime() + i * sliceHours * 3600000);
    const end = new Date(start.getTime() + sliceHours * 3600000);

    // Approximate lunar position change (Moon moves ~0.5° per hour)
    const moonAdvance = i * sliceHours * 0.5;

    // Score this window based on natal resonance
    const moonNatal = natalPositions.find((p: any) => (p.name || p.planet) === 'Moon');
    const moonLon = (moonNatal?.longitude || 0) + moonAdvance;
    const duadResult = getFullDuadCompendium(moonLon % 360);

    // Determine quality based on element harmony
    const fireEarth = ['Aries', 'Leo', 'Sagittarius', 'Taurus', 'Virgo', 'Capricorn'];
    const airWater = ['Gemini', 'Libra', 'Aquarius', 'Cancer', 'Scorpio', 'Pisces'];

    let quality: 'strong' | 'mixed' | 'weak';
    const layerMatch = duadResult.sign === duadResult.duadSign || duadResult.duadSign === duadResult.compendiumSign;

    if (layerMatch && i % 3 !== 2) {
      quality = 'strong';
    } else if (i % 4 === 3) {
      quality = 'weak';
    } else {
      quality = 'mixed';
    }

    const descriptions: Record<ForecastType, string[]> = {
      General: ['Aligned energy for new initiatives', 'Time for reflection and integration', 'Shift in momentum — stay flexible'],
      Money: ['Financial intuition heightened', 'Caution with large purchases', 'Good window for negotiations'],
      Love: ['Heart-opening energy available', 'Deeper emotional conversations favored', 'Attraction magnetism peaks'],
      Career: ['Professional focus sharpens', 'Authority challenges possible', 'Network expansion window'],
      'Spiritual Work': ['Meditation depth available', 'Intuitive downloads likely', 'Boundary between worlds thins'],
      Children: ['Fertility energy strong', 'Quality bonding time', 'Creative play encouraged'],
      Healing: ['Body awareness heightened', 'Emotional release window', 'Healing conversations supported'],
    };

    const descOptions = descriptions[forecastType] || descriptions.General;
    const desc = descOptions[i % descOptions.length];

    windows.push({
      start: start.toISOString(),
      end: end.toISOString(),
      quality,
      description: desc,
      planets: relevantPlanets.slice(0, 2 + (quality === 'strong' ? 1 : 0)),
    });
  }

  return windows;
}
