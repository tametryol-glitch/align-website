'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { NatalWheel } from '@/components/charts/NatalWheel';
import Link from 'next/link';
import { ArrowLeft, Heart, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { CitySearch } from '@/components/ui/CitySearch';
import { getCompositePlacementInterpretation } from '@/lib/compositePlacementInterp';
import { PaywallGate } from '@/components/ui/PaywallGate';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

/** Aspect definitions for client-side composite aspect calculation (same as mobile app). */
const COMPOSITE_ASPECT_ANGLES = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Sextile', angle: 60, orb: 5 },
  { name: 'Square', angle: 90, orb: 7 },
  { name: 'Trine', angle: 120, orb: 7 },
  { name: 'Opposition', angle: 180, orb: 8 },
];

/** Planets to include in aspect calculations. */
const ASPECT_PLANETS = [
  'Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn',
  'Uranus','Neptune','Pluto','Ascendant','MC','Vesta','Juno',
  'North Node','Chiron',
];

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

interface NormalizedCompositeData {
  positions: CompositePosition[];
  aspects: CompositeAspect[];
  house_cusps: number[];
  sun_sign: string | null;
  moon_sign: string | null;
  ascendant_sign: string | null;
  ascendant_degree: number | null;
}

/** Compute aspects client-side from composite positions (backend returns none). */
function computeCompositeAspects(positions: CompositePosition[]): CompositeAspect[] {
  const aspPositions = positions.filter(p => ASPECT_PLANETS.includes(p.name));
  const aspects: CompositeAspect[] = [];
  for (let i = 0; i < aspPositions.length; i++) {
    for (let j = i + 1; j < aspPositions.length; j++) {
      const diff = Math.abs(aspPositions[i].longitude - aspPositions[j].longitude);
      const d = Math.min(diff, 360 - diff);
      for (const asp of COMPOSITE_ASPECT_ANGLES) {
        const orb = Math.abs(d - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            planet1: aspPositions[i].name,
            planet2: aspPositions[j].name,
            type: asp.name.toLowerCase(),
            orb: Math.round(orb * 100) / 100,
          });
        }
      }
    }
  }
  return aspects;
}

/** Normalize backend response into the shape the UI expects. */
function normalizeCompositeResponse(raw: any): NormalizedCompositeData {
  const rawPositions = raw.positions || raw.planets || [];
  const positions: CompositePosition[] = rawPositions.map((p: any) => ({
    name: p.name,
    sign: p.sign || SIGNS[Math.floor((p.longitude ?? 0) / 30) % 12],
    degree: p.sign_degree ?? p.degree ?? ((p.longitude ?? 0) % 30),
    longitude: p.longitude ?? 0,
    house: p.house,
  }));

  const findPlanet = (name: string) => positions.find(p => p.name === name);
  const asc = findPlanet('Ascendant');

  // Backend composite endpoint returns no aspects; calculate client-side
  // (fall back to raw.aspects if the backend ever starts returning them)
  const rawAspects = raw.aspects && raw.aspects.length > 0
    ? (raw.aspects as any[]).map((a: any) => ({
        planet1: a.body1 || a.planet1,
        planet2: a.body2 || a.planet2,
        type: a.aspect_name || a.type || a.aspect,
        orb: a.orb ?? 0,
      }))
    : computeCompositeAspects(positions);

  return {
    positions,
    aspects: rawAspects,
    house_cusps: raw.house_cusps || [],
    sun_sign: findPlanet('Sun')?.sign || null,
    moon_sign: findPlanet('Moon')?.sign || null,
    ascendant_sign: asc?.sign || null,
    ascendant_degree: asc?.longitude ?? null,
  };
}

export default function CompositePage() {
  const { profile } = useAuthStore();
  const [result, setResult] = useState<NormalizedCompositeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAspects, setShowAspects] = useState(false);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

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
      const raw = await api.getComposite({
        person1: buildBirthData(profile!),
        person2: (() => {
          const { offset, label } = resolveTimezoneOffset(partnerTz, partnerLng || 0, partnerDate, partnerTime, partnerLat || undefined);
          return {
            name: partnerName || '',
            date: partnerDate,
            time: partnerTime,
            latitude: partnerLat || 0,
            longitude: partnerLng || 0,
            timezone: label,
            tz_offset: offset,
            location: partnerLocation,
          };
        })(),
      });
      setResult(normalizeCompositeResponse(raw));
    } catch (err: any) {
      setError(err.message || 'Failed to calculate composite chart');
    } finally {
      setLoading(false);
    }
  }

  if (!hasBirthData) {
    return (
      <PaywallGate feature="composite">
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
      </PaywallGate>
    );
  }

  return (
    <PaywallGate feature="composite">
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
              <div className="mt-4 space-y-3 text-left max-w-lg mx-auto">
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-muted text-xs font-medium">Sun:</span>
                    <span className="text-text-secondary">{result.sun_sign}</span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1 leading-relaxed">
                    {getCompositePlacementInterpretation('Sun', result.sun_sign).split('. ').slice(0, 2).join('. ') + '.'}
                  </p>
                </div>
                {result.moon_sign && (
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-muted text-xs font-medium">Moon:</span>
                      <span className="text-text-secondary">{result.moon_sign}</span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1 leading-relaxed">
                      {getCompositePlacementInterpretation('Moon', result.moon_sign).split('. ').slice(0, 2).join('. ') + '.'}
                    </p>
                  </div>
                )}
                {result.ascendant_sign && (
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-muted text-xs font-medium">ASC:</span>
                      <span className="text-text-secondary">{result.ascendant_sign}</span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1 leading-relaxed">
                      {getCompositePlacementInterpretation('Ascendant', result.ascendant_sign).split('. ').slice(0, 2).join('. ') + '.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Composite Wheel (matches mobile app) */}
          <CompositeWheel data={result} />

          {/* Composite Positions */}
          {result.positions.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Composite Placements
              </h3>
              <div className="divide-y divide-border-primary">
                {result.positions.map((pos, i) => {
                  const isExpanded = expandedPlanet === pos.name;
                  const interp = isExpanded
                    ? getCompositePlacementInterpretation(pos.name, pos.sign, pos.house || undefined)
                    : '';
                  return (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedPlanet(isExpanded ? null : pos.name)}
                        className="flex items-center justify-between py-2.5 w-full text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="text-sm text-text-primary font-medium">{pos.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-accent-primary">{pos.degree.toFixed(1)}° {pos.sign}</span>
                          {pos.house && <span className="text-[10px] text-text-muted">H{pos.house}</span>}
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                          )}
                        </div>
                      </button>
                      {isExpanded && interp && (
                        <div className="pb-3 pl-3 border-l-2 border-accent-primary/30 ml-1 animate-in fade-in duration-200">
                          <p className="text-xs text-text-tertiary leading-relaxed">{interp}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Composite Aspects */}
          {result.aspects.length > 0 && (
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
                  {result.aspects.map((asp, i) => (
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

          <button onClick={() => { setResult(null); setShowAspects(false); setExpandedPlanet(null); }} className="btn-secondary w-full">
            New Composite
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

/** Render a NatalWheel for the composite chart (matching mobile app parity). */
function CompositeWheel({ data }: { data: NormalizedCompositeData }) {
  if (data.positions.length === 0) return null;
  const planets = data.positions.map(p => ({
    name: p.name,
    longitude: p.longitude,
    sign: p.sign,
    degree: p.degree,
    retrograde: false,
  }));
  const aspects = data.aspects.map(a => ({
    planet1: a.planet1,
    planet2: a.planet2,
    type: a.type,
    orb: a.orb,
  }));
  const houseCusps = data.house_cusps;
  const ascPos = data.positions.find(p => p.name === 'Ascendant');
  const mcPos = data.positions.find(p => p.name === 'MC');
  return (
    <div className="card flex items-center justify-center p-4">
      <NatalWheel
        planets={planets}
        aspects={aspects}
        houseCusps={houseCusps}
        ascendantDegree={ascPos?.longitude ?? houseCusps[0] ?? 0}
        midheavenDegree={mcPos?.longitude ?? houseCusps[9] ?? 0}
        size={420}
      />
    </div>
  );
}
