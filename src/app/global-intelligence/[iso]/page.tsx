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

const SIGN_NATIONAL_THEMES: Record<string, { identity: string; mood: string; projection: string; governance: string }> = {
  Aries: {
    identity: 'pioneering independence, military strength, and assertive self-determination',
    mood: 'restless energy, impatience with stagnation, and fierce patriotic pride',
    projection: 'bold confidence and competitive ambition',
    governance: 'decisive executive action and strong centralized leadership',
  },
  Taurus: {
    identity: 'economic stability, resource wealth, and enduring traditions',
    mood: 'steady resilience, attachment to the land, and resistance to sudden change',
    projection: 'material prosperity and cultural richness',
    governance: 'conservative fiscal policy and long-term economic planning',
  },
  Gemini: {
    identity: 'communication, intellectual diversity, and adaptive diplomacy',
    mood: 'curiosity, media engagement, and a hunger for information and debate',
    projection: 'intellectual vitality and diplomatic versatility',
    governance: 'policy flexibility, coalition-building, and media-driven politics',
  },
  Cancer: {
    identity: 'homeland security, family values, and protective national sentiment',
    mood: 'deep emotional attachment to heritage, nostalgia, and collective memory',
    projection: 'nurturing strength and defensive protectiveness',
    governance: 'domestic-focused policy, social welfare, and homeland protection',
  },
  Leo: {
    identity: 'national pride, cultural greatness, and a desire for global recognition',
    mood: 'generous optimism, creative expression, and loyalty to leadership',
    projection: 'grandeur, confidence, and cultural soft power',
    governance: 'strong executive authority and charismatic leadership',
  },
  Virgo: {
    identity: 'dedicated service, meticulous organization, and resource stewardship',
    mood: 'practical concern for public health, efficiency, and pragmatic problem-solving',
    projection: 'competence, reliability, and attention to detail',
    governance: 'technocratic precision, regulatory frameworks, and data-driven policy',
  },
  Libra: {
    identity: 'diplomatic balance, partnership-building, and commitment to justice',
    mood: 'desire for fairness, aesthetic refinement, and social harmony',
    projection: 'elegance, diplomacy, and a reputation for mediation',
    governance: 'coalition governance, treaty-making, and balanced foreign policy',
  },
  Scorpio: {
    identity: 'transformative power, strategic depth, and an affinity for intelligence operations',
    mood: 'intense collective passion, suspicion of authority, and cycles of crisis and renewal',
    projection: 'formidable intensity and strategic unpredictability',
    governance: 'concentrated executive power, intelligence agencies, and resource control',
  },
  Sagittarius: {
    identity: 'expansive ambition, cultural diversity, and ideological leadership',
    mood: 'optimistic wanderlust, philosophical debate, and faith in progress',
    projection: 'adventurous internationalism and moral authority',
    governance: 'visionary policy, international engagement, and ideological governance',
  },
  Capricorn: {
    identity: 'institutional strength, hierarchical order, and long-term strategic planning',
    mood: 'disciplined endurance, respect for tradition, and cautious pragmatism',
    projection: 'authority, credibility, and institutional gravitas',
    governance: 'structured bureaucracy, austerity measures, and constitutional discipline',
  },
  Aquarius: {
    identity: 'technological innovation, collective purpose, and systematic reform',
    mood: 'progressive idealism, communal identity, and resistance to conformity',
    projection: 'forward-thinking originality and humanitarian vision',
    governance: 'democratic reform, technological governance, and progressive legislation',
  },
  Pisces: {
    identity: 'spiritual depth, artistic heritage, and compassionate idealism',
    mood: 'collective empathy, spiritual seeking, and susceptibility to both inspiration and confusion',
    projection: 'mystical allure, artistic influence, and soft-power diplomacy',
    governance: 'idealistic policy, welfare state ambitions, and sometimes unclear leadership direction',
  },
};

const SIGN_EVOLUTION: Record<string, string> = {
  Aries: 'assertive independence and pioneering initiative',
  Taurus: 'steady consolidation and material security',
  Gemini: 'intellectual agility and adaptive communication',
  Cancer: 'protective domesticity and emotional deepening',
  Leo: 'confident self-expression and creative authority',
  Virgo: 'meticulous refinement and service-oriented reform',
  Libra: 'diplomatic partnership-seeking and balanced judgment',
  Scorpio: 'intense transformation and strategic depth',
  Sagittarius: 'expansive exploration and philosophical growth',
  Capricorn: 'disciplined ambition and institutional maturity',
  Aquarius: 'progressive innovation and collective vision',
  Pisces: 'spiritual deepening and compassionate dissolution of old forms',
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
  const mcSign = chartJson?.mc?.sign;
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border-primary">
                  {[
                    { label: 'Sun', sign: sunSign },
                    { label: 'Moon', sign: moonSign },
                    { label: 'Ascendant', sign: ascSign },
                    { label: 'Midheaven', sign: mcSign },
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
              <h2 className="font-semibold text-text-primary mb-1 text-sm">Latest Intelligence</h2>
              <p className="text-text-muted text-[10px] mb-3">as of {intel?.scan_date}</p>

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
              <p className="text-text-muted text-xs">No intelligence data available yet. Check back after the daily compute runs.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── National Character Profile ────────────────────── */}
      {(sunSign || moonSign || ascSign) && (
        <div className="card bg-gradient-to-br from-violet-500/5 to-transparent space-y-4">
          <h2 className="font-semibold text-text-primary flex items-center gap-2">
            <Star className="w-4 h-4 text-violet-400" />
            National Character
          </h2>
          <div className="space-y-3">
            {sunSign && (
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-text-primary text-sm font-medium">{SIGN_GLYPHS[sunSign]} Sun in {sunSign}</p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                  As a {sunSign} Sun nation, {country.name}&apos;s identity is built around {SIGN_NATIONAL_THEMES[sunSign]?.identity || 'its core national values'}.
                </p>
              </div>
            )}
            {moonSign && (
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-text-primary text-sm font-medium">{SIGN_GLYPHS[moonSign]} Moon in {moonSign}</p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                  The {moonSign} Moon gives the people of {country.name} an emotional character rooted in {SIGN_NATIONAL_THEMES[moonSign]?.mood || 'collective sentiment'}.
                </p>
              </div>
            )}
            {ascSign && (
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-text-primary text-sm font-medium">{SIGN_GLYPHS[ascSign]} {ascSign} Rising</p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                  With {ascSign} Rising, {country.name} projects {SIGN_NATIONAL_THEMES[ascSign]?.projection || 'its national image'} to the world.
                </p>
              </div>
            )}
            {mcSign && (
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-text-primary text-sm font-medium">{SIGN_GLYPHS[mcSign]} Midheaven in {mcSign}</p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                  A {mcSign} Midheaven means {country.name}&apos;s government and leadership style gravitates toward {SIGN_NATIONAL_THEMES[mcSign]?.governance || 'its governing principles'}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
          {expandedPanel === 'events' && events.length > 0 && (
            <div className="card bg-gradient-to-br from-yellow-500/5 to-transparent space-y-2">
              <h3 className="text-sm font-semibold text-text-primary">Recent Events Preview</h3>
              {events.slice(0, 3).map((evt) => (
                <div key={evt.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDot(evt.severity)}`} />
                  <span className="text-text-primary">{evt.title}</span>
                  <span className="text-text-muted ml-auto">{evt.event_date}</span>
                </div>
              ))}
              <p className="text-text-muted text-[10px] text-center">↓ Full details in Recent Events below</p>
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
                        {evt.event_date} · {evt.category === 'political' ? '🏛' : evt.category === 'economic' ? '💰' : evt.category === 'military' ? '⚔️' : evt.category === 'diplomatic' ? '🌍' : evt.category === 'social' ? '👥' : '📋'} {evt.category}
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

// ─── Planet & Aspect Meanings (for transit interpretations) ──

const PLANET_THEMES: Record<string, string> = {
  Sun: 'leadership and national identity',
  Moon: 'public mood and domestic conditions',
  Mercury: 'media, trade, and communications',
  Venus: 'diplomacy, finance, and cultural affairs',
  Mars: 'military action, conflict, and executive force',
  Jupiter: 'expansion, growth, and opportunity',
  Saturn: 'structure, restriction, and accountability',
  Uranus: 'disruption, innovation, and sudden change',
  Neptune: 'idealism, confusion, and hidden forces',
  Pluto: 'transformation, power, and deep crisis',
  'North Node': 'national destiny and future direction',
  'South Node': 'past patterns and karmic release',
  Chiron: 'national wounds and healing',
  Vesta: 'dedication, service, and sacred focus',
  Juno: 'partnerships, treaties, and commitments',
  Ceres: 'nurturing, resources, and sustenance',
  Pallas: 'strategy, wisdom, and pattern recognition',
};

const ASPECT_LABELS: Record<string, { name: string; verb: string; tone: string }> = {
  Conjunction: { name: 'Conjunction', verb: 'aligns with', tone: 'Fusion of energies — intensified focus' },
  Opposition: { name: 'Opposition', verb: 'opposes', tone: 'Tension and polarization — competing forces' },
  Square: { name: 'Square', verb: 'clashes with', tone: 'Friction and pressure — forced decisions' },
  Trine: { name: 'Trine', verb: 'harmonizes with', tone: 'Flow and support — natural progress' },
  Sextile: { name: 'Sextile', verb: 'cooperates with', tone: 'Opportunity — constructive openings' },
  Quincunx: { name: 'Quincunx', verb: 'adjusts to', tone: 'Misalignment — awkward recalibration' },
};

function transitInterpretation(h: TransitHit): string {
  const tTheme = PLANET_THEMES[h.transit_planet] || 'planetary influence';
  const nTheme = PLANET_THEMES[h.natal_planet] || 'national affairs';
  const aspect = ASPECT_LABELS[h.aspect];
  const sector = HOUSE_KEYWORDS[h.natal_house] || 'national affairs';

  if (!aspect) return `${h.transit_planet} aspects the national ${h.natal_planet} in the ${sector} sector.`;

  if (h.aspect === 'Conjunction') {
    return `The energy of ${tTheme} merges with ${nTheme}, creating a concentrated focal point in the ${sector} sector.`;
  } else if (h.aspect === 'Opposition') {
    return `${h.transit_planet} pulls against the national ${h.natal_planet} — tension between ${tTheme} and ${nTheme} plays out through ${sector.toLowerCase()}.`;
  } else if (h.aspect === 'Square') {
    return `Friction between ${tTheme} and ${nTheme} creates pressure in the ${sector} sector. Difficult decisions are likely.`;
  } else if (h.aspect === 'Trine') {
    return `A supportive flow between ${tTheme} and ${nTheme} eases conditions around ${sector.toLowerCase()}.`;
  } else if (h.aspect === 'Sextile') {
    return `A window of opportunity opens where ${tTheme} cooperates with ${nTheme} in the ${sector} sector.`;
  }
  return `An adjustment between ${tTheme} and ${nTheme} creates uncertainty around ${sector.toLowerCase()}.`;
}

function severityLabel(severity: string): { text: string; color: string; bg: string } {
  switch (severity) {
    case 'major': return { text: 'High Impact', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    case 'moderate': return { text: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    default: return { text: 'Minor', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
  }
}

function TransitPanel({ hits }: { hits: TransitHit[] }) {
  const sorted = [...hits].sort((a, b) => {
    const sevOrder: Record<string, number> = { major: 0, moderate: 1, minor: 2 };
    const sa = sevOrder[a.severity] ?? 3;
    const sb = sevOrder[b.severity] ?? 3;
    if (sa !== sb) return sa - sb;
    return Math.abs(a.orb) - Math.abs(b.orb);
  });

  // Group by severity
  const groups: Record<string, TransitHit[]> = {};
  for (const h of sorted) {
    const key = h.severity || 'minor';
    if (!groups[key]) groups[key] = [];
    groups[key].push(h);
  }

  const orderedGroups = ['major', 'moderate', 'minor'].filter(k => groups[k]);

  return (
    <div className="card bg-gradient-to-br from-purple-500/5 to-transparent space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Active Transits</h3>
        <p className="text-text-muted text-[10px] mt-0.5">
          Planetary transits show how current sky positions interact with the national chart
        </p>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {orderedGroups.map(sevKey => {
          const sev = severityLabel(sevKey);
          const items = groups[sevKey];
          return (
            <div key={sevKey}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${sev.color}`}>
                  {sev.text}
                </span>
                <span className="text-text-muted text-[10px]">({items.length})</span>
                <div className="flex-1 h-px bg-border-primary/30" />
              </div>
              <div className="space-y-2">
                {items.map((h, i) => {
                  const aspect = ASPECT_LABELS[h.aspect] || { name: h.aspect, verb: 'aspects', tone: '' };
                  return (
                    <div key={i} className={`rounded-lg border p-3 ${sev.bg}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-text-primary text-sm font-medium">
                            {h.transit_planet} {aspect.verb} {h.natal_planet}
                          </p>
                          <p className="text-text-muted text-[10px] mt-0.5">
                            {aspect.name} · {Math.abs(h.orb) < 1 ? 'Near-exact' : Math.abs(h.orb) < 3 ? 'Close' : 'Wide'} ({Math.abs(h.orb).toFixed(1)}°) · {h.is_applying ? '⚡ Building' : 'Fading'}
                          </p>
                        </div>
                        <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded flex-shrink-0">
                          {HOUSE_KEYWORDS[h.natal_house] || `House ${h.natal_house}`}
                        </span>
                      </div>
                      <p className="text-text-secondary text-xs mt-2 leading-relaxed">
                        {transitInterpretation(h)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Midpoint Panel ─────────────────────────────────────────

interface MidpointEntry {
  pair: [string, string];
  sign: string;
  house: number;
  degree: number;
  midpoint_longitude: number;
}

const MIDPOINT_PAIR_THEMES: Record<string, string> = {
  'Sun+Moon': 'national will and public sentiment',
  'Sun+Mercury': 'government communications and official messaging',
  'Sun+Venus': 'national diplomacy and cultural identity',
  'Sun+Mars': 'executive action and military posture',
  'Sun+Jupiter': 'national ambition and growth vision',
  'Sun+Saturn': 'governmental authority and institutional discipline',
  'Sun+Uranus': 'leadership innovation and reform impulse',
  'Sun+Neptune': 'national ideals and collective vision',
  'Sun+Pluto': 'state power and transformative authority',
  'Moon+Mercury': 'public opinion and media narrative',
  'Moon+Venus': 'cultural sentiment and social values',
  'Moon+Mars': 'popular activism and public unrest',
  'Moon+Jupiter': 'collective optimism and consumer confidence',
  'Moon+Saturn': 'public austerity and collective hardship',
  'Moon+Uranus': 'sudden shifts in public mood',
  'Moon+Neptune': 'mass psychology and collective dreams',
  'Moon+Pluto': 'deep undercurrents in the national psyche',
  'Mercury+Venus': 'trade negotiations and cultural exchange',
  'Mercury+Mars': 'media conflict and information warfare',
  'Mercury+Jupiter': 'educational expansion and trade growth',
  'Mercury+Saturn': 'regulatory communication and policy announcements',
  'Mercury+Uranus': 'technological breakthroughs and breaking news',
  'Mercury+Neptune': 'misinformation risk and unclear messaging',
  'Mercury+Pluto': 'intelligence operations and strategic communications',
  'Venus+Mars': 'economic competition and diplomatic tension',
  'Venus+Jupiter': 'financial prosperity and diplomatic goodwill',
  'Venus+Saturn': 'fiscal austerity and trade restrictions',
  'Venus+Uranus': 'market volatility and diplomatic surprises',
  'Venus+Neptune': 'economic illusions and idealized partnerships',
  'Venus+Pluto': 'financial power shifts and deep economic reform',
  'Mars+Jupiter': 'military expansion and aggressive growth',
  'Mars+Saturn': 'military restraint and institutional friction',
  'Mars+Uranus': 'sudden conflict and technological disruption',
  'Mars+Neptune': 'covert operations and unclear military objectives',
  'Mars+Pluto': 'power struggles and existential confrontation',
  'Jupiter+Saturn': 'structural growth and cautious expansion',
  'Jupiter+Uranus': 'breakthrough opportunities and radical reform',
  'Jupiter+Neptune': 'ideological vision and speculative excess',
  'Jupiter+Pluto': 'transformative ambition and power consolidation',
  'Saturn+Uranus': 'tradition vs innovation and systemic tension',
  'Saturn+Neptune': 'institutional erosion and ideological drift',
  'Saturn+Pluto': 'structural crisis and forced transformation',
  'Uranus+Neptune': 'generational upheaval and cultural revolution',
  'Uranus+Pluto': 'revolutionary transformation and systemic overthrow',
  'Neptune+Pluto': 'civilizational shifts and deep collective evolution',
};

function midpointInterpretation(m: MidpointEntry): string {
  const pairKey = `${m.pair[0]}+${m.pair[1]}`;
  const reversePairKey = `${m.pair[1]}+${m.pair[0]}`;
  const pairTheme = MIDPOINT_PAIR_THEMES[pairKey] || MIDPOINT_PAIR_THEMES[reversePairKey];
  const sector = HOUSE_KEYWORDS[m.house] || 'national affairs';

  if (pairTheme) {
    return `The intersection of ${pairTheme} activates the ${sector} sector — a sensitive point where both themes converge and amplify.`;
  }
  const a = PLANET_THEMES[m.pair[0]] || 'planetary energy';
  const b = PLANET_THEMES[m.pair[1]] || 'planetary energy';
  return `The combined energy of ${a} and ${b} converges in the ${sector} sector, creating a sensitive activation point.`;
}

function MidpointPanel({ midpoints }: { midpoints: MidpointEntry[] }) {
  return (
    <div className="card bg-gradient-to-br from-cyan-500/5 to-transparent space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Active Midpoints</h3>
        <p className="text-text-muted text-[10px] mt-0.5">
          Midpoints are sensitive degrees where two planetary energies blend — when transits hit these points, both themes activate simultaneously
        </p>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {midpoints.map((m, i) => (
          <div key={i} className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-text-primary text-sm font-medium">
                {m.pair[0]} + {m.pair[1]}
              </p>
              <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded flex-shrink-0">
                {HOUSE_KEYWORDS[m.house] || `House ${m.house}`}
              </span>
            </div>
            <p className="text-text-muted text-[10px] mt-0.5">
              {SIGN_GLYPHS[m.sign] || ''} {m.sign} {m.degree.toFixed(1)}°
            </p>
            <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
              {midpointInterpretation(m)}
            </p>
          </div>
        ))}
      </div>
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
    <div className="card bg-gradient-to-br from-amber-500/5 to-transparent space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Secondary Progressions</h3>
        <p className="text-text-muted text-[10px] mt-0.5">
          Progressions track the nation&apos;s slow evolution — each progressed day represents one year of development
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {planets.map((p, i) => {
          const sector = HOUSE_KEYWORDS[p.house] || `House ${p.house}`;
          const theme = PLANET_THEMES[p.planet] || 'planetary influence';
          return (
            <div key={i} className={`rounded-lg border p-3 ${
              p.planet === 'Sun' || p.planet === 'Moon'
                ? 'border-amber-400/30 bg-amber-500/10'
                : 'border-amber-500/10 bg-amber-500/5'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-accent-primary text-xl">{SIGN_GLYPHS[p.sign] || '?'}</span>
                <div className="flex-1">
                  <p className="text-text-primary text-sm font-medium">{p.planet} in {p.sign}</p>
                  <p className="text-text-muted text-[10px]">
                    {p.degree.toFixed(1)}° · {sector}
                  </p>
                </div>
              </div>
              <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
                The nation&apos;s evolved sense of {theme} now channels through {SIGN_EVOLUTION[p.sign] || p.sign + ' energy'}, reshaping the {sector.toLowerCase()} sector over years.
              </p>
            </div>
          );
        })}
      </div>

      {aspects && aspects.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-secondary mb-2">Progressed Aspects</h4>
          <div className="space-y-2">
            {aspects.map((a, i) => {
              const aspect = ASPECT_LABELS[a.aspect] || { name: a.aspect, verb: 'aspects', tone: '' };
              return (
                <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/5 text-xs">
                  <span className="text-text-primary font-medium">{a.prog_planet} {aspect.verb} {a.natal_planet}</span>
                  <span className="text-text-muted ml-auto">{Math.abs(a.orb).toFixed(1)}° · {aspect.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
