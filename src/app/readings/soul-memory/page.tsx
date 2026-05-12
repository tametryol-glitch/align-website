'use client';

import { useState } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { computeSoulMemory, confidenceBand } from '@/lib/engines';
import type { NatalChart, SoulMemoryResult, ScoredArchetype } from '@/lib/engines';
import { PaywallGate } from '@/components/ui/PaywallGate';

const SOUL_ASTEROIDS = ['Eros', 'Psyche', 'Urania', 'Pallas', 'Ceres', 'Lilith', 'Chiron', 'Vesta', 'Juno', 'Nike', 'Apollo', 'Hygiea', 'Nemesis', 'Karma', 'Fortuna'];

export default function SoulMemoryPage() {
  const { profile } = useAuthStore();
  const [result, setResult] = useState<SoulMemoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [expandedArch, setExpandedArch] = useState<string | null>(null);

  if (!profile?.birth_date || !profile?.latitude) {
    return <BirthDataPrompt message="Add your birth data to decode your soul's past-life memories." />;
  }

  async function getReading() {
    setLoading(true);
    setError('');
    try {
      const chartData = await api.getNatalChart({
        ...buildBirthData(profile!),
        extra_asteroids: SOUL_ASTEROIDS,
      });

      const chart = mapToNatalChart(chartData);
      const memories = computeSoulMemory(chart);
      setResult(memories);
      setRevealedCards(new Set());
    } catch (err: any) {
      setError(err.message || 'Failed to decode soul memory');
    } finally {
      setLoading(false);
    }
  }

  function revealCard(key: string) {
    setRevealedCards((prev) => new Set(prev).add(key));
  }

  return (
    <PaywallGate feature="soul_memory" fallbackTier="light">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Soul Memory</h1>
          <p className="text-text-tertiary text-sm">Decode your past-life imprints through your natal chart</p>
        </div>
      </div>

      {!result && !loading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🌀</span>
          <p className="text-text-tertiary mb-2">
            Your natal chart holds echoes of past lifetimes. South Node, 12th house, Pluto, and asteroid placements
            reveal who you were before.
          </p>
          <p className="text-text-muted text-xs mb-6">
            16 archetypes scored with midpoint engine, duad layer, and draconic confirmation
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            Unlock My Past Lives
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {loading && <LoadingCosmic label="Scoring 16 archetypes against your chart..." />}

      {result && (
        <div className="space-y-5">
          {/* Primary archetype */}
          <ArchetypeCard
            archetype={result.primary}
            label="Primary Past Life"
            emoji="⚔️"
            desc="Your strongest past-life echo"
            revealed={revealedCards.has('primary')}
            onReveal={() => revealCard('primary')}
            expanded={expandedArch === 'primary'}
            onExpand={() => setExpandedArch(expandedArch === 'primary' ? null : 'primary')}
          />

          {/* Secondary */}
          <ArchetypeCard
            archetype={result.secondary}
            label="Secondary Lifetime"
            emoji="🎭"
            desc="A supporting past-life thread"
            revealed={revealedCards.has('secondary')}
            onReveal={() => revealCard('secondary')}
            expanded={expandedArch === 'secondary'}
            onExpand={() => setExpandedArch(expandedArch === 'secondary' ? null : 'secondary')}
          />

          {/* Shadow */}
          <ArchetypeCard
            archetype={result.shadow}
            label="Shadow Lifetime"
            emoji="🌑"
            desc="The life your soul resists remembering"
            revealed={revealedCards.has('shadow')}
            onReveal={() => revealCard('shadow')}
            expanded={expandedArch === 'shadow'}
            onExpand={() => setExpandedArch(expandedArch === 'shadow' ? null : 'shadow')}
            showShadow
          />

          {/* Eras */}
          {result.eras.length > 0 && (
            <div className="card">
              <button onClick={() => revealCard('eras')} className="w-full text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🗺️</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">Eras & Regions</h3>
                    <p className="text-xs text-text-muted">When and where your soul was most active</p>
                  </div>
                  {!revealedCards.has('eras') && (
                    <span className="text-xs text-accent-primary font-medium">Tap to reveal</span>
                  )}
                </div>
              </button>
              {revealedCards.has('eras') && (
                <div className="mt-3 pt-3 border-t border-border-primary space-y-3 animate-in fade-in duration-500">
                  {result.eras.map((era) => {
                    const band = confidenceBand(era.confidence);
                    return (
                      <div key={era.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-text-primary">{era.name}</span>
                          <span className="text-xs" style={{ color: band.color }}>{era.confidence}%</span>
                        </div>
                        <p className="text-[10px] text-text-muted mb-1">{era.range}</p>
                        <ScoreBar value={era.confidence} size="sm" />
                        <p className="text-xs text-text-tertiary mt-1">{era.description}</p>
                        {era.reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {era.reasons.map((r, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-accent-muted text-accent-primary">
                                {r.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {result.regions.map((region) => {
                    const band = confidenceBand(region.confidence);
                    return (
                      <div key={region.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-text-primary">{region.name}</span>
                          <span className="text-xs" style={{ color: band.color }}>{region.confidence}%</span>
                        </div>
                        <ScoreBar value={region.confidence} size="sm" />
                        <p className="text-xs text-text-tertiary mt-1">{region.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Soul Gifts Carried Forward */}
          {result.soulGiftsReturned.length > 0 && (
            <div className="card">
              <button onClick={() => revealCard('gifts')} className="w-full text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💎</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">Soul Gifts Carried Forward</h3>
                    <p className="text-xs text-text-muted">Talents that survived the crossing</p>
                  </div>
                  {!revealedCards.has('gifts') && (
                    <span className="text-xs text-accent-primary font-medium">Tap to reveal</span>
                  )}
                </div>
              </button>
              {revealedCards.has('gifts') && (
                <div className="mt-3 pt-3 border-t border-border-primary animate-in fade-in duration-500">
                  <div className="flex flex-wrap gap-2">
                    {result.soulGiftsReturned.map((gift, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-accent-muted text-accent-primary font-medium">
                        {gift}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current Life Mission */}
          <div className="card">
            <button onClick={() => revealCard('mission')} className="w-full text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📜</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">Current Life Mission</h3>
                  <p className="text-xs text-text-muted">Your soul's intended path this lifetime</p>
                </div>
                {!revealedCards.has('mission') && (
                  <span className="text-xs text-accent-primary font-medium">Tap to reveal</span>
                )}
              </div>
            </button>
            {revealedCards.has('mission') && (
              <div className="mt-3 pt-3 border-t border-border-primary animate-in fade-in duration-500">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {result.unifiedMission}
                </p>
              </div>
            )}
          </div>

          {/* Star Memory */}
          {result.starMemory && (
            <div className="card">
              <button onClick={() => revealCard('star')} className="w-full text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⭐</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">Star Memory</h3>
                    <p className="text-xs text-text-muted">Off-world signature detected</p>
                  </div>
                  {!revealedCards.has('star') && (
                    <span className="text-xs text-accent-primary font-medium">Tap to reveal</span>
                  )}
                </div>
              </button>
              {revealedCards.has('star') && (
                <div className="mt-3 pt-3 border-t border-border-primary animate-in fade-in duration-500">
                  <h4 className="text-lg font-display font-bold text-text-primary mb-1">
                    {result.starMemory.name}
                  </h4>
                  <ScoreBar value={result.starMemory.confidence} label="Confidence" size="sm" color="accent" className="mb-2" />
                  <p className="text-sm text-text-secondary">{result.starMemory.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {result.starMemory.qualities.map((q, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gold-muted text-gold-primary">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Draconic Blueprint */}
          {result.draconicBlueprint && (
            <div className="card">
              <button onClick={() => revealCard('draconic')} className="w-full text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🐉</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">Soul Blueprint (Draconic)</h3>
                    <p className="text-xs text-text-muted">Your soul&apos;s ancient identity before this lifetime</p>
                  </div>
                  {!revealedCards.has('draconic') && (
                    <span className="text-xs text-accent-primary font-medium">Tap to reveal</span>
                  )}
                </div>
              </button>
              {revealedCards.has('draconic') && (
                <div className="mt-3 pt-3 border-t border-border-primary space-y-3 animate-in fade-in duration-500">
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-semibold">Soul Sun — {result.draconicBlueprint.sun.sign}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{result.draconicBlueprint.sun.narrative}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-semibold">Soul Moon — {result.draconicBlueprint.moon.sign}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{result.draconicBlueprint.moon.narrative}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-semibold">Soul Face — {result.draconicBlueprint.asc.sign}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{result.draconicBlueprint.asc.narrative}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-semibold">Soul Ruler — {result.draconicBlueprint.ruler.name} in {result.draconicBlueprint.ruler.sign}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{result.draconicBlueprint.ruler.narrative}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lifetime Patterns */}
          {result.lifetimePatterns && result.lifetimePatterns.length > 0 && (
            <div className="card">
              <button onClick={() => revealCard('patterns')} className="w-full text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔄</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">What Your Soul Keeps Returning To</h3>
                    <p className="text-xs text-text-muted">Recurring behaviors across many incarnations</p>
                  </div>
                  {!revealedCards.has('patterns') && (
                    <span className="text-xs text-accent-primary font-medium">Tap to reveal</span>
                  )}
                </div>
              </button>
              {revealedCards.has('patterns') && (
                <div className="mt-3 pt-3 border-t border-border-primary space-y-2 animate-in fade-in duration-500">
                  {result.lifetimePatterns.map((pat) => (
                    <p key={pat.id} className="text-sm text-text-secondary leading-relaxed">
                      • {pat.narrative}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={() => { setResult(null); setExpandedArch(null); setRevealedCards(new Set()); }} className="btn-secondary w-full">
            Decode Again
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

function ArchetypeCard({
  archetype, label, emoji, desc, revealed, onReveal, expanded, onExpand, showShadow,
}: {
  archetype: ScoredArchetype;
  label: string;
  emoji: string;
  desc: string;
  revealed: boolean;
  onReveal: () => void;
  expanded: boolean;
  onExpand: () => void;
  showShadow?: boolean;
}) {
  const band = confidenceBand(archetype.confidence);
  const title = showShadow ? archetype.shadowName : archetype.name;
  const description = showShadow ? archetype.shadowDescription : archetype.heroDescription;

  return (
    <div className="card overflow-hidden">
      <button onClick={revealed ? onExpand : onReveal} className="w-full text-left">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{emoji}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">{label}</h3>
            <p className="text-xs text-text-muted">{desc}</p>
          </div>
          {!revealed ? (
            <span className="text-xs text-accent-primary font-medium">Tap to reveal</span>
          ) : (
            expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </button>
      {revealed && (
        <div className="mt-3 pt-3 border-t border-border-primary animate-in fade-in duration-500">
          <h4 className="text-lg font-display font-bold text-text-primary mb-1">{title}</h4>
          <ScoreBar value={archetype.confidence} label="Confidence" size="sm" color="accent" className="mb-1" />
          <p className="text-[10px] mb-2" style={{ color: band.color }}>{band.label}</p>
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>

          {expanded && (
            <div className="mt-3 space-y-3">
              {/* Reasons */}
              {archetype.reasons.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase text-text-muted font-semibold mb-1">Evidence</p>
                  <div className="space-y-1">
                    {archetype.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${r.isAnchor ? 'bg-gold-muted text-gold-primary' : 'bg-accent-muted text-accent-primary'}`}>
                          +{r.weight}
                        </span>
                        <span className="text-xs text-text-secondary">{r.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relationship Karma */}
              {archetype.relationshipKarma.theme && (
                <div className="bg-bg-tertiary rounded-lg p-2.5">
                  <p className="text-[10px] uppercase text-text-muted font-semibold mb-1">Relationship Karma</p>
                  <p className="text-xs text-accent-primary font-medium mb-0.5">{archetype.relationshipKarma.theme}</p>
                  <p className="text-xs text-text-tertiary">{archetype.relationshipKarma.description}</p>
                </div>
              )}

              {/* Soul Gifts */}
              {archetype.soulGifts.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase text-text-muted font-semibold mb-1">Soul Gifts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {archetype.soulGifts.map((g, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-accent-muted text-accent-primary">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mission */}
              <div>
                <p className="text-[10px] uppercase text-text-muted font-semibold mb-1">Current Mission</p>
                <p className="text-xs text-text-secondary">{archetype.currentMission}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Map the API chart response to the NatalChart type the engine expects. */
function mapToNatalChart(data: any): NatalChart {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const positions = data?.planets || data?.positions || [];

  const planets = positions.map((p: any) => {
    const lon: number = p.longitude ?? 0;
    const idx = Math.floor(lon / 30) % 12;
    return {
      name: p.name || p.planet || '',
      longitude: Math.round(lon * 100) / 100,
      sign: p.sign || SIGNS[idx] || 'Aries',
      degree: Math.round((lon % 30) * 100) / 100,
      house: p.house || 1,
      retrograde: p.is_retrograde || p.retrograde || false,
    };
  });

  const houses = (data?.house_cusps || []).map((lon: number, i: number) => {
    const idx = Math.floor(lon / 30) % 12;
    return {
      house: i + 1,
      longitude: Math.round(lon * 100) / 100,
      sign: SIGNS[idx] || 'Aries',
      degree: Math.round((lon % 30) * 100) / 100,
    };
  });

  const ascPlanet = planets.find((p: any) => p.name === 'Ascendant' || p.name === 'ASC');
  const mcPlanet = planets.find((p: any) => p.name === 'MC' || p.name === 'Midheaven');

  return {
    planets,
    aspects: data?.aspects || [],
    houses,
    ascendant: ascPlanet?.longitude ?? 0,
    midheaven: mcPlanet?.longitude ?? 0,
  };
}
