'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import Link from 'next/link';
import { ArrowLeft, Heart, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

interface CompositePosition {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
  house?: number;
}

interface CompositeAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

export default function CompositePage() {
  const { profile } = useAuthStore();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAspects, setShowAspects] = useState(false);

  // Partner data
  const [partnerName, setPartnerName] = useState('');
  const [partnerDate, setPartnerDate] = useState('');
  const [partnerTime, setPartnerTime] = useState('12:00');
  const [partnerLocation, setPartnerLocation] = useState('');
  const [partnerLat, setPartnerLat] = useState<number | null>(null);
  const [partnerLng, setPartnerLng] = useState<number | null>(null);
  const [partnerTz, setPartnerTz] = useState('UTC');

  const hasBirthData = profile?.birth_date && profile?.latitude;

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    if (!hasBirthData) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getComposite({
        person1: buildBirthData(profile!),
        person2: {
          name: partnerName || '',
          date: partnerDate,
          time: partnerTime,
          latitude: partnerLat || 0,
          longitude: partnerLng || 0,
          timezone: partnerTz,
          location: partnerLocation,
        },
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate composite chart');
    } finally {
      setLoading(false);
    }
  }

  if (!hasBirthData) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> My Chart
        </Link>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
          <Heart className="w-7 h-7 text-accent-primary" />
          Composite Chart
        </h1>
        <BirthDataPrompt message="Birth data required to calculate your composite (relationship) chart." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> My Chart
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
        <Heart className="w-7 h-7 text-accent-primary" />
        Composite Chart
      </h1>
      <p className="text-sm text-text-tertiary mb-6">
        The midpoint chart of your relationship — the third entity you create together
      </p>

      {!result && !loading && (
        <form onSubmit={calculate} className="card space-y-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4" /> Partner&apos;s Birth Data
          </h3>
          <input
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="Their name (optional)"
            className="input"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Birth Date *</label>
              <input type="date" value={partnerDate} onChange={(e) => setPartnerDate(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Birth Time</label>
              <input type="time" value={partnerTime} onChange={(e) => setPartnerTime(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Birth Location *</label>
            <CitySearch
              value={partnerLocation}
              onChange={(location, lat, lon, tz) => {
                setPartnerLocation(location);
                setPartnerLat(lat);
                setPartnerLng(lon);
                setPartnerTz(tz);
              }}
              placeholder="Search city, state, or country..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            Calculate Composite Chart
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      )}

      {loading && <LoadingCosmic label="Computing composite midpoints..." />}

      {result && !loading && (
        <div className="space-y-5">
          {/* Composite overview */}
          <div className="card bg-gradient-cosmic border-accent-muted text-center py-6">
            <Heart className="w-8 h-8 text-accent-primary mx-auto mb-2" />
            <h2 className="text-lg font-display font-bold text-text-primary">
              {partnerName ? `You & ${partnerName}` : 'Your Composite'}
            </h2>
            <p className="text-xs text-text-muted mt-1">The relationship entity chart</p>
            {result.sun_sign && (
              <div className="mt-3 flex items-center justify-center gap-4 text-sm">
                <span className="text-text-secondary">
                  <span className="text-text-muted text-xs">Sun:</span> {result.sun_sign}
                </span>
                {result.moon_sign && (
                  <span className="text-text-secondary">
                    <span className="text-text-muted text-xs">Moon:</span> {result.moon_sign}
                  </span>
                )}
                {result.ascendant_sign && (
                  <span className="text-text-secondary">
                    <span className="text-text-muted text-xs">ASC:</span> {result.ascendant_sign}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Composite Positions */}
          {(result.planets || result.positions) && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Composite Placements
              </h3>
              <div className="divide-y divide-border-primary">
                {(result.planets || result.positions || []).map((pos: any, i: number) => {
                  const lon = pos.longitude ?? 0;
                  const signIdx = Math.floor(lon / 30) % 12;
                  const deg = lon % 30;
                  const sign = pos.sign || SIGNS[signIdx];
                  return (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-text-primary font-medium">{pos.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-accent-primary">{deg.toFixed(1)}° {sign}</span>
                        {pos.house && <span className="text-[10px] text-text-muted">H{pos.house}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Composite Aspects */}
          {result.aspects && result.aspects.length > 0 && (
            <div className="card">
              <button
                onClick={() => setShowAspects(!showAspects)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <span className="text-lg">🔗</span> Composite Aspects ({result.aspects.length})
                </h3>
                {showAspects ? (
                  <ChevronUp className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                )}
              </button>

              {showAspects && (
                <div className="mt-4 space-y-1 animate-in fade-in duration-300">
                  {result.aspects.map((asp: CompositeAspect, i: number) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border-primary last:border-0">
                      <span className="text-xs text-text-primary font-medium flex-1">{asp.planet1}</span>
                      <span className="text-[10px] text-accent-secondary px-1.5 py-0.5 bg-accent-muted rounded">
                        {asp.type}
                      </span>
                      <span className="text-xs text-text-primary font-medium flex-1 text-right">{asp.planet2}</span>
                      <span className="text-[10px] text-text-muted w-12 text-right">
                        {typeof asp.orb === 'number' ? `${asp.orb.toFixed(1)}°` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interpretation summary from API */}
          {result.interpretation && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Relationship Dynamics</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{result.interpretation}</p>
            </div>
          )}

          <button onClick={() => { setResult(null); setShowAspects(false); }} className="btn-secondary w-full">
            New Composite
          </button>
        </div>
      )}
    </div>
  );
}
