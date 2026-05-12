'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { NatalWheel } from '@/components/charts/NatalWheel';
import { getPlanetGlyph, getZodiacGlyph, cn } from '@/lib/utils';
import { generateSolarReturnPrediction } from '@/lib/interpretations';
import Link from 'next/link';
import { ArrowLeft, Sun, ChevronDown } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

export default function SolarReturnPage() {
  const { profile } = useAuthStore();
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [expandedPlanets, setExpandedPlanets] = useState<Set<string>>(new Set());

  const hasBirthData = profile?.birth_date && profile?.birth_time && profile?.latitude;

  async function calculate() {
    if (!hasBirthData) return;
    setLoading(true);
    setError('');
    try {
      const birthData = buildBirthData(profile!);
      const data = await api.getSolarReturn({
        birth_data: birthData,
        year,
        house_system: birthData.house_system,
      });
      setChart(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate solar return');
    } finally {
      setLoading(false);
    }
  }

  if (!hasBirthData) {
    return (
      <PaywallGate feature="solar_return">
        <div className="max-w-3xl mx-auto">
          <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> My Chart
          </Link>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
            <Sun className="w-7 h-7 text-gold-primary" />
            Solar Return
          </h1>
          <BirthDataPrompt message="Birth data required to calculate your Solar Return chart." />
        </div>
      </PaywallGate>
    );
  }

  return (
    <PaywallGate feature="solar_return">
    <div className="max-w-4xl mx-auto">
      <Link href="/chart" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> My Chart
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
        <Sun className="w-7 h-7 text-gold-primary" />
        Solar Return
      </h1>
      <p className="text-sm text-text-tertiary mb-6">
        Your birthday chart for the year — themes and focus areas ahead
      </p>

      {/* Year selector */}
      <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-text-secondary block mb-1">Year</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min={1900}
              max={2100}
              className="input w-32"
            />
            <button
              type="button"
              onClick={() => setYear(new Date().getFullYear())}
              className="btn-ghost text-xs px-2 py-1"
            >
              Current Year
            </button>
          </div>
        </div>
        <button onClick={calculate} disabled={loading} className="btn-primary">
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {loading && <LoadingCosmic label="Computing Solar Return..." />}

      {chart && !loading && (
        <div className="space-y-4">
          {chart.exact_time && (
            <div className="card bg-gradient-cosmic border-accent-muted">
              <p className="text-sm text-text-secondary">Solar Return Exact Moment</p>
              <p className="text-lg font-semibold text-text-primary">
                {new Date(chart.exact_time).toLocaleString()}
              </p>
            </div>
          )}

          {(() => {
            const positions = chart.positions || chart.planets || [];
            const srAsc = positions.find((p: any) => p.name === 'Ascendant');
            const srSun = positions.find((p: any) => p.name === 'Sun');
            const srMoon = positions.find((p: any) => p.name === 'Moon');
            const angularPlanets = positions.filter((p: any) =>
              p.house === 1 || p.house === 4 || p.house === 7 || p.house === 10
            ).filter((p: any) => !['Ascendant', 'MC'].includes(p.name));

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {srAsc && (
                  <div className="card">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">SR Ascendant</p>
                    <p className="text-sm font-semibold text-text-primary">{getZodiacGlyph(srAsc.sign)} {srAsc.sign}</p>
                    <p className="text-xs text-text-secondary mt-1">How the world sees you this year</p>
                  </div>
                )}
                {srSun && (
                  <div className="card">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Sun House</p>
                    <p className="text-sm font-semibold text-text-primary">House {srSun.house}</p>
                    <p className="text-xs text-text-secondary mt-1">Your primary focus area this year</p>
                  </div>
                )}
                {srMoon && (
                  <div className="card">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Moon Sign</p>
                    <p className="text-sm font-semibold text-text-primary">{getZodiacGlyph(srMoon.sign)} {srMoon.sign} (H{srMoon.house})</p>
                    <p className="text-xs text-text-secondary mt-1">Your emotional tone this year</p>
                  </div>
                )}
                {angularPlanets.length > 0 && (
                  <div className="card">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Planets on Angles</p>
                    <p className="text-sm font-semibold text-text-primary">
                      {angularPlanets.map((p: any) => `${getPlanetGlyph(p.name)} ${p.name}`).join(', ')}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Extra prominence this year</p>
                  </div>
                )}
              </div>
            );
          })()}

          <SolarReturnWheel chart={chart} />

          <div className="card">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
              Solar Return Positions
            </h3>
            <div className="divide-y divide-border-primary">
              {(chart.positions || chart.planets || []).map((planet: any) => {
                const isExpanded = expandedPlanets.has(planet.name);
                return (
                  <div key={planet.name}>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedPlanets(prev => {
                          const next = new Set(prev);
                          if (next.has(planet.name)) next.delete(planet.name);
                          else next.add(planet.name);
                          return next;
                        });
                      }}
                      className="flex items-center gap-3 py-3 w-full text-left hover:bg-bg-tertiary/50 transition-colors rounded-lg px-1 -mx-1"
                    >
                      <span className="text-xl w-8 text-center">{getPlanetGlyph(planet.name)}</span>
                      <span className="text-text-primary font-medium flex-1">{planet.name}</span>
                      <span className="text-text-secondary flex items-center gap-1">
                        {getZodiacGlyph(planet.sign)} {planet.sign}
                      </span>
                      <span className="text-text-tertiary text-sm w-16 text-right">
                        {(planet.sign_degree ?? planet.degree)?.toFixed(2)}°
                      </span>
                      <span className="text-text-muted text-sm w-12 text-right">
                        H{planet.house}
                      </span>
                      <ChevronDown className={cn(
                        'w-4 h-4 text-text-muted transition-transform',
                        isExpanded && 'rotate-180'
                      )} />
                    </button>
                    {isExpanded && (
                      <div className="pb-3 pl-11 pr-2 text-xs text-text-secondary leading-relaxed">
                        {planet.name} in {planet.sign} in House {planet.house} suggests that
                        {planet.house === 1 ? ' who you are is undergoing a visible transformation this year — your presence, your appearance, and the way people experience you when you walk into a room are all shifting in ways that reflect a deeper internal reinvention you can no longer contain.' :
                         planet.house === 2 ? ' your relationship with money and self-worth is being rewritten from the inside out. What you earn, what you spend on, and the value you place on your own time and talent are all evolving toward something more honest — and more generous to yourself.' :
                         planet.house === 3 ? ' the words you hear and the words you speak carry unusual weight this year. A conversation, a message, or an idea you encounter will rearrange your thinking in ways that quietly redirect the course of your entire year.' :
                         planet.house === 4 ? ' something is stirring at the root of your life — your home, your family, your sense of belonging. Whether it manifests as a physical move or an emotional reckoning with where you come from, your foundation is being rebuilt from the ground up.' :
                         planet.house === 5 ? ' your heart is opening this year in ways you may not have thought possible. Romance, creativity, and the simple act of allowing yourself to feel joy are not just themes — they are invitations your soul has been waiting to accept.' :
                         planet.house === 6 ? ' your body, your daily rituals, and the work you do with your hands and hours are asking for your conscious attention. The small changes you make to how you live each day will compound into a transformation that reshapes your entire reality.' :
                         planet.house === 7 ? ' a relationship stands at the center of your year like a mirror you cannot avoid. Whether it is a new connection that alters your trajectory or an existing bond that demands a new level of honesty, partnership is where your deepest growth lives this year.' :
                         planet.house === 8 ? ' you are being asked to go deeper than comfortable this year — into intimacy, into shared finances, into the psychological territory most people spend their lives avoiding. Something old must be released so something truer can take its place.' :
                         planet.house === 9 ? ' your hunger for meaning, for expansion, for a life that stretches beyond the familiar is impossible to ignore this year. A journey, a teaching, or a shift in belief is coming that will make your previous worldview feel like a room you have outgrown.' :
                         planet.house === 10 ? ' your career and public life are reaching a turning point that will echo far beyond this year. What you build, earn, or become known for in the coming months carries the weight of legacy — the world is paying attention, even if you do not realize it yet.' :
                         planet.house === 11 ? ' your social world is being reshaped by forces deeper than preference — some friendships deepen into lifelines while others quietly dissolve, and a dream you have been carrying in silence begins to show its first real signs of life.' :
                         planet.house === 12 ? ' something sacred is forming in your silence this year. Old patterns surface not to haunt you but to be healed, dreams deliver messages your waking mind cannot access, and the solitude you seek is not escape — it is the workshop where your next self is being built.' :
                         ' this area of life is activated in your solar return.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {chart.themes && chart.themes.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Year Themes
              </h3>
              <div className="space-y-3">
                {chart.themes.map((theme: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-bg-tertiary">
                    <p className="text-sm font-medium text-text-primary">{theme.title || theme.name}</p>
                    {theme.description && (
                      <p className="text-xs text-text-muted mt-1">{theme.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const positions = chart.positions || chart.planets || [];
            const predictionPlanets = positions.map((p: any) => ({
              name: p.name,
              sign: p.sign,
              degree: p.sign_degree ?? (p.longitude % 30),
              longitude: p.longitude,
              house: p.house,
            }));
            const prediction = generateSolarReturnPrediction(
              predictionPlanets,
              year,
              profile?.display_name?.split(' ')[0] || undefined,
              chart.house_cusps,
            );
            if (!prediction) return null;
            return (
              <div className="card">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                  Year Forecast
                </h3>
                <div className="prose prose-sm prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-line">
                  {prediction}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

function SolarReturnWheel({ chart }: { chart: any }) {
  const positions = chart.positions || chart.planets || [];
  if (positions.length === 0) return null;
  const planets = positions.map((p: any) => ({
    name: p.name,
    longitude: p.longitude,
    sign: p.sign,
    degree: p.sign_degree ?? (p.longitude % 30),
    retrograde: p.is_retrograde || p.retrograde || false,
  }));
  const aspects = (chart.aspects || []).map((a: any) => ({
    planet1: a.body1 || a.planet1,
    planet2: a.body2 || a.planet2,
    type: a.aspect_name || a.type || a.aspect,
    orb: a.orb,
  }));
  const houseCusps: number[] = chart.house_cusps || [];
  const ascPos = positions.find((p: any) => p.name === 'Ascendant');
  const mcPos = positions.find((p: any) => p.name === 'MC');
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
