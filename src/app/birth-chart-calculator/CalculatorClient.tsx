'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import { CitySearch } from '@/components/ui/CitySearch';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { NatalWheel } from '@/components/charts/NatalWheel';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { getPlacementInterpretation } from '@/lib/interpretations';
import { getZodiacGlyph } from '@/lib/utils';
import { shareCard, generateShareUrl } from '@/lib/shareCardUtils';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export function CalculatorClient() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [unknownTime, setUnknownTime] = useState(false);
  const [birthLocation, setBirthLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timezone, setTimezone] = useState('UTC');

  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [shareStatus, setShareStatus] = useState('');

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
      const time = unknownTime ? '12:00' : birthTime;
      const { offset, label } = resolveTimezoneOffset(timezone, longitude, birthDate, time, latitude);
      const data = await api.getNatalChart({
        name: '',
        date: birthDate,
        time,
        latitude,
        longitude,
        timezone: label,
        tz_offset: offset,
        location: birthLocation,
        house_system: 'Whole Sign',
      });
      setChart(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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

  const bigThree = useMemo(() => {
    if (!chart) return null;
    const positions = chart.positions || [];
    const sun = positions.find((p: any) => p.name === 'Sun');
    const moon = positions.find((p: any) => p.name === 'Moon');
    const rising = positions.find((p: any) => p.name === 'Ascendant');
    const risingSign = rising?.sign || (chart.house_cusps?.[0] != null ? SIGNS[Math.floor(chart.house_cusps[0] / 30)] : '');
    return { sun: sun?.sign || '', moon: moon?.sign || '', rising: risingSign };
  }, [chart]);

  function toggleExpanded(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function handleShare() {
    if (!bigThree) return;
    const url = generateShareUrl('big-three', {
      sun: bigThree.sun,
      moon: bigThree.moon,
      rising: bigThree.rising,
    });
    const text = `I'm a ${bigThree.sun} Sun, ${bigThree.moon} Moon, ${bigThree.rising} Rising ✨ Calculate yours free:`;
    const result = await shareCard('My Big Three — Align', text, url);
    if (result.copied) {
      setShareStatus('Link copied to clipboard!');
      setTimeout(() => setShareStatus(''), 3000);
    }
  }

  const planetPositions = useMemo(() => {
    if (!chart) return [];
    return (chart.positions || []).filter((p: any) => p.name !== 'Ascendant' && p.name !== 'MC');
  }, [chart]);

  return (
    <div>
      {!chart && !loading && (
        <form onSubmit={calculateChart} className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bcc-date" className="block text-sm font-medium text-text-secondary mb-1.5">Birth Date</label>
              <input
                id="bcc-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="bcc-time" className="block text-sm font-medium text-text-secondary mb-1.5">Birth Time</label>
              <input
                id="bcc-time"
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="input"
                disabled={unknownTime}
              />
              <label className="flex items-center gap-2 mt-2 text-xs text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={unknownTime}
                  onChange={(e) => setUnknownTime(e.target.checked)}
                  className="rounded border-border-primary"
                />
                I don&apos;t know my birth time
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Birth Place</label>
            <CitySearch
              value={birthLocation}
              onChange={handleCitySelect}
              placeholder="Search city, state, or country..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
            Calculate My Birth Chart — Free
          </button>
          <p className="text-xs text-text-muted text-center">No signup required. Your data is not stored.</p>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      )}

      {loading && <LoadingCosmic label="Calculating your natal chart..." />}

      {chart && wheelProps && bigThree && (
        <div className="space-y-6">
          {/* Big Three summary */}
          <div className="bg-gradient-cosmic border border-accent-muted rounded-2xl p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Sun', sign: bigThree.sun, desc: 'Your core self' },
                { label: 'Moon', sign: bigThree.moon, desc: 'Your inner world' },
                { label: 'Rising', sign: bigThree.rising, desc: 'How others see you' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-text-muted mb-1">{item.label}</p>
                  <span className="text-3xl block mb-1">{getZodiacGlyph(item.sign)}</span>
                  <p className="text-sm font-semibold text-text-primary">{item.sign}</p>
                  <p className="text-[10px] text-text-muted mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            {unknownTime && (
              <p className="text-[11px] text-text-muted text-center mt-4">
                Birth time unknown — your Rising sign and houses are approximate (calculated for 12:00 noon).
              </p>
            )}
            <div className="flex items-center justify-center gap-3 mt-5">
              <button onClick={handleShare} className="btn-primary text-sm px-6 py-2.5">
                Share My Big Three
              </button>
              <button
                onClick={() => { setChart(null); setExpanded(new Set()); }}
                className="text-sm text-text-secondary hover:text-text-primary px-4 py-2.5 transition-colors"
              >
                New Chart
              </button>
            </div>
            {shareStatus && <p className="text-xs text-accent-primary text-center mt-2">{shareStatus}</p>}
          </div>

          {/* Chart wheel */}
          <div className="bg-bg-card border border-border-primary rounded-2xl flex items-center justify-center p-4 overflow-x-auto">
            <NatalWheel
              planets={wheelProps.planets}
              aspects={wheelProps.aspects}
              houseCusps={wheelProps.houseCusps}
              ascendantDegree={wheelProps.ascendantDegree}
              midheavenDegree={wheelProps.midheavenDegree}
              size={420}
            />
          </div>

          {/* Planet positions with interpretations */}
          <div className="bg-bg-card border border-border-primary rounded-2xl p-6">
            <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Planetary Positions</h3>
            <div className="divide-y divide-border-primary">
              {planetPositions.map((p: any) => {
                const interp = getPlacementInterpretation(p.name, p.sign, p.house, p.sign_degree ?? (p.longitude % 30));
                const isOpen = expanded.has(p.name);
                return (
                  <div key={p.name} className="py-3">
                    <button
                      onClick={() => interp && toggleExpanded(p.name)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl w-7 text-center">{getZodiacGlyph(p.sign)}</span>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {p.name} in {p.sign}
                            {p.is_retrograde && <span className="text-text-muted text-xs ml-1.5">℞</span>}
                          </p>
                          <p className="text-xs text-text-muted">
                            {Math.floor(p.sign_degree ?? (p.longitude % 30))}°{p.house ? ` · House ${p.house}` : ''}
                          </p>
                        </div>
                      </div>
                      {interp && (
                        <span className="text-text-muted text-xs">{isOpen ? '▲' : '▼'}</span>
                      )}
                    </button>
                    {isOpen && interp && (
                      <div className="mt-3 pl-10 text-sm text-text-secondary leading-relaxed">
                        <MarkdownText text={interp} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversion CTA */}
          <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted text-center">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-text-primary mb-3">
              This is just the surface
            </h3>
            <p className="text-text-tertiary max-w-md mx-auto mb-6 text-sm">
              Create a free account to save your chart, get AI-powered interpretations, daily transits,
              compatibility readings, and more — in 20 languages.
            </p>
            <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
              Save My Chart — Free
            </Link>
            <p className="text-text-muted text-xs mt-3">No credit card required.</p>
          </div>
        </div>
      )}
    </div>
  );
}
