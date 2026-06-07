'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, MapPin, Shield, AlertTriangle, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getCountry, getPrimaryChart, getDailyIntel, getCountryEvents,
  type GICountry, type GICountryChart, type GIDailyIntel, type GICountryEvent,
} from '@/lib/globalIntelligence';

// ─── Zodiac glyphs ──────────────────────────────────────────

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

// Astro Einstein rulership — NON-NEGOTIABLE, locked
const RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Vesta', Libra: 'Juno', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

function scoreColor(val: number): string {
  if (val >= 30) return 'text-emerald-400';
  if (val >= 0) return 'text-blue-400';
  if (val >= -30) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBg(val: number): string {
  if (val >= 30) return 'bg-emerald-500';
  if (val >= 0) return 'bg-blue-500';
  if (val >= -30) return 'bg-yellow-500';
  return 'bg-red-500';
}

function conflictColor(val: number): string {
  if (val < 25) return 'text-emerald-400';
  if (val < 50) return 'text-yellow-400';
  if (val < 75) return 'text-orange-400';
  return 'text-red-400';
}

function conflictBg(val: number): string {
  if (val < 25) return 'bg-emerald-500';
  if (val < 50) return 'bg-yellow-500';
  if (val < 75) return 'bg-orange-500';
  return 'bg-red-500';
}

function severityDot(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500';
    case 'major': return 'bg-yellow-500';
    case 'moderate': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
}

export default function CountryDetailPage() {
  const { iso } = useParams<{ iso: string }>();
  const [country, setCountry] = useState<GICountry | null>(null);
  const [chart, setChart] = useState<GICountryChart | null>(null);
  const [intel, setIntel] = useState<GIDailyIntel | null>(null);
  const [events, setEvents] = useState<GICountryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!iso) return;
    try {
      const c = await getCountry(iso);
      if (!c) { setLoading(false); return; }
      setCountry(c);

      const [chartData, intelData, eventsData] = await Promise.all([
        getPrimaryChart(c.id),
        getDailyIntel(c.id),
        getCountryEvents(c.id, 10),
      ]);

      setChart(chartData);
      setIntel(intelData);
      // Deduplicate events by title + date
      const seen = new Set<string>();
      const uniqueEvents = (eventsData || []).filter((e) => {
        const key = `${e.title}::${e.event_date}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setEvents(uniqueEvents);
    } catch (err) {
      console.error('[GI] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [iso]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm">Loading country data...</p>
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-text-muted">Country not found</p>
        <Link href="/global-intelligence" className="text-accent-primary hover:underline text-sm">
          ← Back to countries
        </Link>
      </div>
    );
  }

  const chartJson = chart?.chart_data_json;
  const sunSign = chartJson?.planets?.Sun?.sign;
  const moonSign = chartJson?.planets?.Moon?.sign;
  const ascSign = chartJson?.ascendant?.sign;
  const scores = intel?.scores_json;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/global-intelligence" className="p-2 rounded-lg hover:bg-bg-card transition">
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <span className="text-4xl">{country.flag_emoji || '🏳️'}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-text-primary">{country.name}</h1>
          <p className="text-text-muted text-sm">
            {country.region}{country.capital ? ` · ${country.capital}` : ''}
            {country.iso_alpha2 ? ` · ${country.iso_alpha2}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── National Chart Card ──────────────────────────── */}
        <div className="lg:col-span-2 card bg-gradient-to-br from-accent-primary/5 to-transparent">
          <h2 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-accent-primary" />
            National Chart
          </h2>

          {chart ? (
            <div className="space-y-4">
              <div>
                <p className="text-text-secondary font-medium">{chart.event_title}</p>
                <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {chart.event_date}{chart.event_time ? ` · ${chart.event_time}` : ''}
                </p>
                {chart.location_name && (
                  <p className="text-text-muted text-xs mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {chart.location_name}
                  </p>
                )}
              </div>

              {/* Time confidence & source */}
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-text-secondary">
                  {chart.time_confidence === 'verified_exact' ? '⏱ Exact Time' :
                   chart.time_confidence?.includes('approximate') ? '⏱ ~Approx' :
                   '⏱ Symbolic'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-text-secondary">
                  {chart.source_reliability?.includes('verified') ? '✓ Verified' :
                   chart.source_reliability === 'disputed' ? '⚠ Disputed' : '○ Unrated'}
                </span>
              </div>
              {chart.source_name && (
                <p className="text-text-muted text-[11px] italic">Source: {chart.source_name}</p>
              )}

              {/* Big-3 */}
              {(sunSign || moonSign || ascSign) && (
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border-primary">
                  {[
                    { label: 'Sun', sign: sunSign },
                    { label: 'Moon', sign: moonSign },
                    { label: 'Ascendant', sign: ascSign },
                  ].filter(x => x.sign).map(({ label, sign }) => (
                    <div key={label} className="text-center">
                      <p className="text-2xl">{SIGN_GLYPHS[sign!] || '?'}</p>
                      <p className="text-text-muted text-[10px] mt-1">{label}</p>
                      <p className="text-text-primary text-sm font-medium">{sign}</p>
                      <p className="text-accent-primary text-[10px]">Ruler: {RULERS[sign!] || '?'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-text-muted text-sm">No chart data available yet.</p>
          )}
        </div>

        {/* ── Quick Stats Sidebar ─────────────────────────── */}
        <div className="space-y-4">
          {scores && (
            <div className="card bg-gradient-to-br from-emerald-500/5 to-transparent">
              <h2 className="font-semibold text-text-primary mb-1 text-sm">Today&apos;s Scores</h2>
              <p className="text-text-muted text-[10px] mb-3">{intel?.scan_date}</p>

              <div className="space-y-3">
                <ScoreRow label="Overall Energy" value={scores.overall_energy} tag={scores.labels?.energy} />
                <ScoreRow label="Economic" value={scores.economic_momentum} tag={scores.labels?.economic} />
                <ScoreRow label="Political" value={scores.political_stability} tag={scores.labels?.political} />
                <ScoreRow label="Public Mood" value={scores.public_mood} tag={scores.labels?.mood} />
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-text-secondary text-xs">Conflict Pressure</span>
                    <span className={`text-xs font-bold ${conflictColor(scores.conflict_pressure)}`}>
                      {scores.conflict_pressure}/100 · {scores.labels?.conflict}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${conflictBg(scores.conflict_pressure)}`} style={{ width: `${scores.conflict_pressure}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!scores && (
            <div className="card">
              <h2 className="font-semibold text-text-primary mb-2 text-sm">Daily Intelligence</h2>
              <p className="text-text-muted text-xs">No intelligence data for today. Check back after the daily compute runs.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Intelligence Briefing ───────────────────────── */}
      {intel?.summary && (() => {
        const sections = intel.summary.split(' || ');
        const headline = sections[0] || '';
        const keyEvents = sections.slice(1, -1);
        const outlook = sections.length > 1 ? sections[sections.length - 1] : '';
        // Fallback: if no delimiters, show as single paragraph (legacy format)
        const isStructured = sections.length > 1;

        return (
          <div className="card bg-gradient-to-br from-blue-500/5 to-transparent space-y-4">
            <h2 className="font-semibold text-text-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Intelligence Briefing
            </h2>

            {/* Headline */}
            <p className="text-text-primary text-sm leading-relaxed font-medium">
              {headline}
            </p>

            {/* Key Events */}
            {isStructured && keyEvents.length > 0 && (
              <div className="space-y-2 border-l-2 border-blue-500/30 pl-4">
                <p className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold">Key Planetary Events</p>
                {keyEvents.map((evt, i) => (
                  <p key={i} className="text-text-secondary text-sm leading-relaxed">
                    {evt}
                  </p>
                ))}
              </div>
            )}

            {/* Outlook */}
            {isStructured && outlook && (
              <div className="bg-surface-secondary/50 rounded-lg p-3 border border-white/5">
                <p className="text-text-secondary text-sm leading-relaxed italic">
                  {outlook}
                </p>
              </div>
            )}

            {/* Legacy fallback */}
            {!isStructured && (
              <p className="text-text-secondary text-sm leading-relaxed">{intel.summary}</p>
            )}
          </div>
        );
      })()}

      {/* ── Transit Stats (clickable) ─────────────────────── */}
      {intel && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCardClickable
              label="Transits"
              value={intel.transits_json?.count || intel.transits_json?.hits?.length || 0}
              sub="active aspects"
              icon="🔭"
              panelKey="transits"
              expanded={expandedPanel === 'transits'}
              onClick={() => setExpandedPanel(expandedPanel === 'transits' ? null : 'transits')}
            />
            <StatCardClickable
              label="Midpoints"
              value={intel.midpoints_json?.count || intel.midpoints_json?.top?.length || 0}
              sub="active pairs"
              icon="⊕"
              panelKey="midpoints"
              expanded={expandedPanel === 'midpoints'}
              onClick={() => setExpandedPanel(expandedPanel === 'midpoints' ? null : 'midpoints')}
            />
            <StatCardClickable
              label="Progressions"
              value={intel.progressions_json?.planets?.length || 0}
              sub="progressed bodies"
              icon="📊"
              panelKey="progressions"
              expanded={expandedPanel === 'progressions'}
              onClick={() => setExpandedPanel(expandedPanel === 'progressions' ? null : 'progressions')}
            />
            <StatCardClickable
              label="Events"
              value={events.length}
              sub="tracked"
              icon="📰"
              panelKey="events"
              expanded={expandedPanel === 'events'}
              onClick={() => setExpandedPanel(expandedPanel === 'events' ? null : 'events')}
            />
          </div>

          {/* Expanded transit panel */}
          {expandedPanel === 'transits' && intel.transits_json?.hits && (
            <TransitPanel hits={intel.transits_json.hits} />
          )}

          {/* Expanded midpoints panel */}
          {expandedPanel === 'midpoints' && intel.midpoints_json?.top && (
            <MidpointPanel midpoints={intel.midpoints_json.top} />
          )}

          {/* Expanded progressions panel */}
          {expandedPanel === 'progressions' && intel.progressions_json?.planets && (
            <ProgressionPanel planets={intel.progressions_json.planets} aspects={intel.progressions_json?.aspects} />
          )}

          {/* Expanded events panel (scrolls to events section) */}
          {expandedPanel === 'events' && (
            <div className="card text-center text-text-muted text-sm py-2">
              ↓ See Recent Events section below
            </div>
          )}
        </div>
      )}

      {/* ── Recent Events ────────────────────────────────── */}
      <div className="card bg-gradient-to-br from-blue-500/5 to-transparent">
        <h2 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          Recent Events
        </h2>
        {events.length === 0 ? (
          <p className="text-text-muted text-sm">No events recorded yet.</p>
        ) : (
          <div className="space-y-1">
            {events.map((evt) => {
              const isExpanded = expandedEvent === evt.id;
              return (
                <button
                  key={evt.id}
                  onClick={() => setExpandedEvent(isExpanded ? null : evt.id)}
                  className="w-full text-left rounded-lg hover:bg-white/5 transition-colors p-2"
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot(evt.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-text-primary text-sm font-medium">{evt.title}</p>
                        <ChevronDown className={`w-3.5 h-3.5 text-text-muted flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      <p className="text-text-muted text-xs mt-0.5">
                        {evt.event_date} · {evt.category}
                        {evt.verification_status === 'verified' ? ' ✓' : ''}
                      </p>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 ml-4 space-y-2 border-l-2 border-border-primary/50 pl-3">
                      {evt.summary && (
                        <p className="text-text-secondary text-xs leading-relaxed">{evt.summary}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-text-secondary">
                          Severity: {evt.severity}
                        </span>
                        {evt.subcategory && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-text-secondary">
                            {evt.subcategory}
                          </span>
                        )}
                        {evt.source_name && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-text-secondary">
                            Source: {evt.source_name}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Score Row Component ─────────────────────────────────────

function ScoreRow({ label, value, tag }: { label: string; value: number; tag?: string }) {
  const barPct = Math.min(100, Math.max(0, (value + 100) / 2));
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-text-secondary text-xs">{label}</span>
        <span className={`text-xs font-bold ${scoreColor(value)}`}>
          {value > 0 ? '+' : ''}{value}{tag ? ` · ${tag}` : ''}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${scoreBg(value)}`} style={{ width: `${barPct}%` }} />
      </div>
    </div>
  );
}

// ─── Clickable Stat Card ─────────────────────────────────────

function StatCardClickable({ label, value, sub, icon, panelKey, expanded, onClick }: {
  label: string; value: number; sub: string; icon: string;
  panelKey: string; expanded: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`card text-center cursor-pointer transition-all hover:ring-1 hover:ring-accent-primary/30 ${expanded ? 'ring-1 ring-accent-primary/50 bg-accent-primary/5' : ''}`}
    >
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-text-muted text-[10px] uppercase tracking-wider">{label}</p>
      <p className="text-text-muted text-[10px]">{sub}</p>
      <ChevronDown className={`w-3 h-3 text-text-muted mx-auto mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
  );
}

// ─── Mundane house keywords ─────────────────────────────────

const HOUSE_KEYWORDS: Record<number, string> = {
  1: 'Nation & Population',
  2: 'Treasury & Currency',
  3: 'Media & Communication',
  4: 'Land & Territory',
  5: 'Culture & Entertainment',
  6: 'Health & Workforce',
  7: 'Foreign Relations',
  8: 'Debt & Taxes',
  9: 'Judiciary & International',
  10: 'Government & Leadership',
  11: 'Parliament & Legislature',
  12: 'Espionage & Institutions',
};

// ─── Transit Panel ──────────────────────────────────────────

interface TransitHit {
  transit_planet: string;
  natal_planet: string;
  aspect: string;
  orb: number;
  severity: string;
  natal_house: number;
  is_applying: boolean;
  transit_sign: string;
  transit_degree: number;
}

function aspectGlyph(aspect: string): string {
  const map: Record<string, string> = {
    Conjunction: '☌', Opposition: '☍', Square: '□', Trine: '△',
    Sextile: '⚹', Quincunx: '⚻',
  };
  return map[aspect] || aspect;
}

function TransitPanel({ hits }: { hits: TransitHit[] }) {
  // Sort by severity then orb tightness
  const sorted = [...hits].sort((a, b) => {
    const sevOrder: Record<string, number> = { major: 0, moderate: 1, minor: 2 };
    const sa = sevOrder[a.severity] ?? 3;
    const sb = sevOrder[b.severity] ?? 3;
    if (sa !== sb) return sa - sb;
    return Math.abs(a.orb) - Math.abs(b.orb);
  });

  return (
    <div className="card bg-gradient-to-br from-purple-500/5 to-transparent">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Active Transits</h3>
      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {sorted.map((h, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white/5 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${severityDotColor(h.severity)}`} />
            <span className="text-text-primary font-medium w-16 flex-shrink-0">{h.transit_planet}</span>
            <span className="text-accent-primary text-sm">{aspectGlyph(h.aspect)}</span>
            <span className="text-text-primary font-medium w-16 flex-shrink-0">{h.natal_planet}</span>
            <span className="text-text-muted flex-shrink-0 w-14 text-right">
              {Math.abs(h.orb).toFixed(1)}° {h.is_applying ? '→' : '←'}
            </span>
            <span className="text-text-muted ml-auto text-[10px]">
              H{h.natal_house} {HOUSE_KEYWORDS[h.natal_house] || ''}
            </span>
          </div>
        ))}
      </div>
      <p className="text-text-muted text-[10px] mt-2">
        → = applying (strengthening) · ← = separating · Sorted by significance
      </p>
    </div>
  );
}

function severityDotColor(severity: string): string {
  switch (severity) {
    case 'major': return 'bg-red-500';
    case 'moderate': return 'bg-yellow-500';
    default: return 'bg-blue-500';
  }
}

// ─── Midpoint Panel ─────────────────────────────────────────

interface MidpointEntry {
  pair: [string, string];
  sign: string;
  house: number;
  degree: number;
  midpoint_longitude: number;
}

function MidpointPanel({ midpoints }: { midpoints: MidpointEntry[] }) {
  return (
    <div className="card bg-gradient-to-br from-cyan-500/5 to-transparent">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Active Midpoints</h3>
      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {midpoints.map((m, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white/5 text-xs">
            <span className="text-text-primary font-medium">
              {m.pair[0]}/{m.pair[1]}
            </span>
            <span className="text-accent-primary">
              {SIGN_GLYPHS[m.sign] || '?'} {m.degree.toFixed(1)}°
            </span>
            <span className="text-text-muted ml-auto text-[10px]">
              H{m.house} {HOUSE_KEYWORDS[m.house] || ''}
            </span>
          </div>
        ))}
      </div>
      <p className="text-text-muted text-[10px] mt-2">
        Midpoint = sensitive degree where two planetary energies converge
      </p>
    </div>
  );
}

// ─── Progression Panel ──────────────────────────────────────

interface ProgPlanet {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  longitude: number;
}

interface ProgAspect {
  prog_planet: string;
  natal_planet: string;
  aspect: string;
  orb: number;
}

function ProgressionPanel({ planets, aspects }: { planets: ProgPlanet[]; aspects?: ProgAspect[] }) {
  return (
    <div className="card bg-gradient-to-br from-amber-500/5 to-transparent">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Secondary Progressions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {planets.map((p, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded bg-white/5 text-xs">
            <span className="text-accent-primary text-lg">{SIGN_GLYPHS[p.sign] || '?'}</span>
            <div>
              <p className="text-text-primary font-medium">{p.planet}</p>
              <p className="text-text-muted text-[10px]">
                {p.sign} {p.degree.toFixed(1)}° · H{p.house}
              </p>
            </div>
          </div>
        ))}
      </div>
      {aspects && aspects.length > 0 && (
        <>
          <h4 className="text-xs font-semibold text-text-secondary mb-2">Progressed Aspects</h4>
          <div className="space-y-1">
            {aspects.map((a, i) => (
              <div key={i} className="flex items-center gap-2 py-1 px-2 text-xs">
                <span className="text-text-primary font-medium">{a.prog_planet}</span>
                <span className="text-accent-primary">{aspectGlyph(a.aspect)}</span>
                <span className="text-text-primary font-medium">{a.natal_planet}</span>
                <span className="text-text-muted ml-auto">{Math.abs(a.orb).toFixed(1)}°</span>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="text-text-muted text-[10px] mt-2">
        1 progressed day = 1 year of national evolution
      </p>
    </div>
  );
}
