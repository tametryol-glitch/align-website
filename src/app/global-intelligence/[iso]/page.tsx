'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, MapPin, Shield, AlertTriangle, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Search } from 'lucide-react';
import {
  getCountry, getPrimaryChart, getDailyIntel, getCountryEvents, listCountries,
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

  // Synastry state
  const [allCountries, setAllCountries] = useState<GICountry[]>([]);
  const [partnerCountry, setPartnerCountry] = useState<GICountry | null>(null);
  const [partnerChart, setPartnerChart] = useState<GICountryChart | null>(null);
  const [synastrySearch, setSynastrySearch] = useState('');
  const [showSynastryPicker, setShowSynastryPicker] = useState(false);
  const [loadingPartner, setLoadingPartner] = useState(false);

  const loadData = useCallback(async () => {
    if (!iso) return;
    try {
      const c = await getCountry(iso);
      if (!c) { setLoading(false); return; }
      setCountry(c);

      const [chartData, intelData, eventsData, countries] = await Promise.all([
        getPrimaryChart(c.id),
        getDailyIntel(c.id),
        getCountryEvents(c.id, 10),
        listCountries(),
      ]);

      setChart(chartData);
      setIntel(intelData);
      setAllCountries(countries);
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

  // ─── Convergence computation ────────────────────────────────

  const convergenceData = useMemo(() => {
    if (!intel) return [];
    const transitHits: Array<{ natal_house: number }> = intel.transits_json?.hits || [];
    const midpointTop: Array<{ house: number }> = intel.midpoints_json?.top || [];
    const rawProg = intel.progressions_json;
    const progPlanets: Array<{ house: number }> = Array.isArray(rawProg?.planets) ? rawProg.planets : [];

    const houses: Array<{
      house: number;
      transitCount: number;
      midpointCount: number;
      progressionCount: number;
      sourceCount: number;
      total: number;
    }> = [];

    for (let h = 1; h <= 12; h++) {
      const transitCount = transitHits.filter(a => a.natal_house === h).length;
      const midpointCount = midpointTop.filter(m => m.house === h).length;
      const progressionCount = progPlanets.filter(p => p.house === h).length;
      const sourceCount = (transitCount > 0 ? 1 : 0) + (midpointCount > 0 ? 1 : 0) + (progressionCount > 0 ? 1 : 0);
      houses.push({ house: h, transitCount, midpointCount, progressionCount, sourceCount, total: transitCount + midpointCount + progressionCount });
    }
    return houses.sort((a, b) => b.total - a.total);
  }, [intel]);

  const hotspots = convergenceData.filter(h => h.sourceCount >= 2);

  // ─── Synastry computation ───────────────────────────────────

  const selectPartner = async (c: GICountry) => {
    setPartnerCountry(c);
    setShowSynastryPicker(false);
    setLoadingPartner(true);
    try {
      const pChart = await getPrimaryChart(c.id);
      setPartnerChart(pChart);
    } catch {
      setPartnerChart(null);
    } finally {
      setLoadingPartner(false);
    }
  };

  const planetsA = useMemo(() => chart?.chart_data_json ? extractPlanets(chart.chart_data_json) : [], [chart]);
  const planetsB = useMemo(() => partnerChart?.chart_data_json ? extractPlanets(partnerChart.chart_data_json) : [], [partnerChart]);
  const synastryAspects = useMemo(() => computeSynastry(planetsA, planetsB), [planetsA, planetsB]);
  const synastryScore = useMemo(() => computeSynastryScore(synastryAspects), [synastryAspects]);

  const filteredSynastryCountries = useMemo(() => {
    const filtered = allCountries.filter(c => c.id !== country?.id);
    if (!synastrySearch.trim()) return filtered;
    const q = synastrySearch.toLowerCase();
    return filtered.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.iso_alpha2 || '').toLowerCase().includes(q) ||
      (c.region || '').toLowerCase().includes(q)
    );
  }, [allCountries, country, synastrySearch]);

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
        const isStructured = sections.length > 1;

        return (
          <div className="card bg-gradient-to-br from-blue-500/5 to-transparent space-y-4">
            <h2 className="font-semibold text-text-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Intelligence Briefing
            </h2>

            <p className="text-text-primary text-sm leading-relaxed font-medium">
              {headline}
            </p>

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

            {isStructured && outlook && (
              <div className="bg-surface-secondary/50 rounded-lg p-3 border border-white/5">
                <p className="text-text-secondary text-sm leading-relaxed italic">
                  {outlook}
                </p>
              </div>
            )}

            {!isStructured && (
              <p className="text-text-secondary text-sm leading-relaxed">{intel.summary}</p>
            )}
          </div>
        );
      })()}

      {/* ── Convergence Summary (the "so what") ──────────── */}
      {hotspots.length > 0 && (
        <ConvergencePanel hotspots={hotspots} allHouses={convergenceData} />
      )}

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

          {expandedPanel === 'transits' && intel.transits_json?.hits && (
            <TransitPanel hits={intel.transits_json.hits} />
          )}

          {expandedPanel === 'midpoints' && intel.midpoints_json?.top && (
            <MidpointPanel midpoints={intel.midpoints_json.top} />
          )}

          {expandedPanel === 'progressions' && intel.progressions_json?.planets && (
            <ProgressionPanel planets={intel.progressions_json.planets} aspects={intel.progressions_json?.aspects} />
          )}

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

      {/* ── Synastry — Country Comparison ────────────────── */}
      <div className="card bg-gradient-to-br from-pink-500/5 to-transparent space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text-primary flex items-center gap-2">
            🔗 Country Synastry
          </h2>
          {partnerCountry && (
            <button
              onClick={() => { setPartnerCountry(null); setPartnerChart(null); setShowSynastryPicker(true); }}
              className="text-accent-primary text-xs hover:underline"
            >
              Change partner
            </button>
          )}
        </div>

        {!partnerCountry && !showSynastryPicker && (
          <div className="text-center py-4">
            <p className="text-text-muted text-sm mb-3">Compare {country.name}&apos;s chart against another nation</p>
            <button
              onClick={() => setShowSynastryPicker(true)}
              className="px-4 py-2 rounded-lg bg-accent-primary/10 text-accent-primary text-sm font-medium hover:bg-accent-primary/20 transition"
            >
              Select a country to compare
            </button>
          </div>
        )}

        {showSynastryPicker && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search countries..."
                value={synastrySearch}
                onChange={(e) => setSynastrySearch(e.target.value)}
                className="bg-transparent text-text-primary text-sm flex-1 outline-none placeholder:text-text-muted"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {filteredSynastryCountries.slice(0, 30).map(c => (
                <button
                  key={c.id}
                  onClick={() => { selectPartner(c); setSynastrySearch(''); }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition text-left"
                >
                  <span>{c.flag_emoji || '🏳️'}</span>
                  <span className="text-text-primary text-sm flex-1">{c.name}</span>
                  <span className="text-text-muted text-[10px]">{c.region}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowSynastryPicker(false); setSynastrySearch(''); }}
              className="text-text-muted text-xs hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        {loadingPartner && (
          <div className="flex items-center justify-center py-6 gap-3">
            <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted text-sm">Loading partner chart...</p>
          </div>
        )}

        {partnerCountry && partnerChart?.chart_data_json && chart?.chart_data_json && !loadingPartner && (
          <SynastryResults
            countryA={country}
            countryB={partnerCountry}
            aspects={synastryAspects}
            score={synastryScore}
          />
        )}

        {partnerCountry && !loadingPartner && (!partnerChart?.chart_data_json || !chart?.chart_data_json) && (
          <p className="text-text-muted text-sm text-center py-4">
            Chart data unavailable for comparison. Both countries need computed charts.
          </p>
        )}
      </div>

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

// ─── Planet & Aspect Meanings ───────────────────────────────

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

// ─── Rich Transit Narratives (ported from mundane_calc.py) ──

const TRANSIT_NARRATIVES: Record<string, string> = {
  'Pluto|Sun|Conjunction': 'Pluto conjunct the national Sun signals a profound transformation of identity and governance — a once-in-a-generation shift in how the nation projects itself.',
  'Pluto|Sun|Opposition': 'Pluto opposing the national Sun brings power struggles to the forefront. Deep-seated tensions between government authority and opposing forces reach a critical point.',
  'Pluto|Sun|Square': 'Pluto squaring the national Sun creates intense pressure for structural change. Expect power struggles and forced transformation in leadership dynamics.',
  'Pluto|Moon|Conjunction': 'Pluto conjunct the national Moon signals a deep emotional shift in the collective psyche — public sentiment undergoes radical transformation.',
  'Pluto|Moon|Opposition': 'Pluto opposing the national Moon creates deep undercurrents of public unrest — collective grievances surface with transformative force.',
  'Pluto|Moon|Square': 'Pluto squaring the national Moon forces a confrontation between government power and popular will. Emotional volatility runs high across the populace.',
  'Pluto|Mars|Conjunction': 'Pluto conjunct natal Mars generates intense, potentially volatile energy. Military posture sharpens and coercive state power may be deployed.',
  'Pluto|Mars|Opposition': 'Pluto opposing natal Mars heightens the risk of confrontation — foreign military tensions or domestic power struggles reach a pressure point.',
  'Pluto|Mars|Square': 'Pluto squaring natal Mars creates a volatile combustion of ambition and resistance. Power grabs and forced change are in the air.',
  'Pluto|Saturn|Conjunction': 'Pluto conjunct natal Saturn dismantles old structures of authority. Institutional reform — whether voluntary or forced — defines this period.',
  'Pluto|Saturn|Opposition': 'Pluto opposing natal Saturn tests the durability of the nation\'s legal and bureaucratic framework under extreme pressure.',
  'Pluto|Saturn|Square': 'Pluto squaring natal Saturn puts crushing pressure on government institutions. Corruption scandals or systemic failures may surface.',
  'Pluto|Jupiter|Conjunction': 'Pluto conjunct natal Jupiter amplifies the nation\'s ambitions to transformative scale — expect sweeping policy changes or ideological shifts.',
  'Pluto|Venus|Conjunction': 'Pluto conjunct natal Venus transforms the nation\'s financial landscape and diplomatic relationships. Alliances are tested to their core.',
  'Pluto|Mercury|Conjunction': 'Pluto conjunct natal Mercury brings intelligence, surveillance, and information warfare to the forefront. Critical communications shape national destiny.',
  'Neptune|Sun|Conjunction': 'Neptune conjunct the national Sun dissolves old certainties. National identity enters a period of redefinition, with idealism and confusion competing for attention.',
  'Neptune|Sun|Square': 'Neptune squaring the national Sun creates a fog around leadership direction. Misinformation and unclear policy signals may unsettle public confidence.',
  'Neptune|Moon|Conjunction': 'Neptune conjunct the national Moon dissolves emotional certainties in the populace. Mass idealism — or mass confusion — colours the public mood.',
  'Neptune|Moon|Square': 'Neptune squaring the national Moon unsettles public sentiment. Collective anxiety and ideological confusion may fuel populist movements.',
  'Neptune|Moon|Opposition': 'Neptune opposing the national Moon creates a gap between public perception and reality. Leaders may struggle to communicate clearly.',
  'Neptune|Mars|Conjunction': 'Neptune conjunct natal Mars diffuses military and executive energy. Hidden agendas, covert operations, or unclear strategic direction define the moment.',
  'Neptune|Mars|Square': 'Neptune squaring natal Mars creates confusion around the nation\'s use of force. Military decisions may be plagued by misinformation.',
  'Neptune|Venus|Conjunction': 'Neptune conjunct natal Venus idealizes (and potentially distorts) economic partnerships and trade deals. Financial agreements require extra scrutiny.',
  'Neptune|Saturn|Conjunction': 'Neptune conjunct natal Saturn erodes the foundations of institutional authority. Trust in government structures quietly weakens.',
  'Neptune|Saturn|Square': 'Neptune squaring natal Saturn destabilizes the boundary between fact and fiction in governance. Policy may drift without clear direction.',
  'Uranus|Sun|Conjunction': 'Uranus conjunct the national Sun brings sudden, electrifying change to governance. Expect unexpected leadership moves and rapid policy shifts.',
  'Uranus|Sun|Opposition': 'Uranus opposing the national Sun creates volatile conditions — sudden reversals in foreign relations or domestic policy are possible.',
  'Uranus|Sun|Square': 'Uranus squaring the national Sun generates disruptive energy. Established institutions face unexpected challenges to their authority.',
  'Uranus|Moon|Conjunction': 'Uranus conjunct the national Moon signals sudden shifts in public mood — mass movements, protests, or breakthrough moments of collective awakening.',
  'Uranus|Moon|Opposition': 'Uranus opposing the national Moon triggers sudden shifts in public sentiment. Mass protests, viral movements, or snap elections become more likely.',
  'Uranus|Moon|Square': 'Uranus squaring the national Moon generates restless energy among the populace. Public patience runs thin with the status quo.',
  'Uranus|Mars|Conjunction': 'Uranus conjunct natal Mars creates explosive, unpredictable energy — sudden military actions, technological breakthroughs, or revolutionary sparks.',
  'Uranus|Mars|Opposition': 'Uranus opposing natal Mars heightens the risk of sudden confrontations. Unexpected military or security incidents are possible.',
  'Uranus|Mars|Square': 'Uranus squaring natal Mars generates disruptive, accident-prone energy. Hasty decisions in defense or foreign policy carry elevated risk.',
  'Uranus|Saturn|Conjunction': 'Uranus conjunct natal Saturn creates a tug-of-war between innovation and tradition. Old systems are disrupted but not yet replaced.',
  'Uranus|Saturn|Opposition': 'Uranus opposing natal Saturn pits progressive forces against conservative institutions. The tension may catalyse dramatic reform — or breakdown.',
  'Uranus|Venus|Conjunction': 'Uranus conjunct natal Venus shakes up financial markets and diplomatic alignments. Expect unexpected shifts in trade partnerships or currency valuation.',
  'Uranus|Mercury|Conjunction': 'Uranus conjunct natal Mercury electrifies the information landscape. Breaking news, leaks, and rapidly shifting narratives dominate the media cycle.',
  'Uranus|Jupiter|Conjunction': 'Uranus conjunct natal Jupiter brings sudden expansion — breakthrough trade deals, technological leaps, or dramatic shifts in foreign policy scope.',
  'Saturn|Sun|Conjunction': 'Saturn conjunct the national Sun imposes a period of accountability. Government faces the consequences of past decisions — a time of austerity and restructuring.',
  'Saturn|Sun|Opposition': 'Saturn opposing the national Sun tests institutional resilience. Foreign pressure or economic constraints force difficult trade-offs.',
  'Saturn|Sun|Square': 'Saturn squaring the national Sun creates friction between ambition and reality. Policy goals hit structural obstacles.',
  'Saturn|Moon|Conjunction': 'Saturn conjunct the national Moon weighs heavily on the public mood. A period of collective sobering, belt-tightening, and diminished expectations.',
  'Saturn|Moon|Opposition': 'Saturn opposing the national Moon creates a sense of public fatigue and disillusionment. Trust in leadership reaches a low point.',
  'Saturn|Moon|Square': 'Saturn squaring the national Moon pressures domestic conditions — housing, food security, or public services face strain.',
  'Saturn|Mars|Conjunction': 'Saturn conjunct natal Mars constrains the nation\'s ability to act decisively. Military and executive initiatives meet bureaucratic resistance.',
  'Saturn|Mars|Opposition': 'Saturn opposing natal Mars creates frustration between the desire for action and structural obstacles. Delays in defense and security policy are likely.',
  'Saturn|Mars|Square': 'Saturn squaring natal Mars generates grinding friction in government operations. Policy execution stumbles against institutional inertia.',
  'Saturn|Jupiter|Conjunction': 'Saturn conjunct natal Jupiter balances expansion with restraint. Growth is possible but demands disciplined, realistic planning.',
  'Saturn|Jupiter|Opposition': 'Saturn opposing natal Jupiter tests whether growth initiatives are built on solid foundations. Overextension faces correction.',
  'Saturn|Venus|Conjunction': 'Saturn conjunct natal Venus constrains diplomatic relations and financial markets. Trade agreements face renegotiation under tighter terms.',
  'Saturn|Mercury|Conjunction': 'Saturn conjunct natal Mercury slows communication channels and media narratives. Official messaging becomes more guarded and deliberate.',
  'Saturn|Mercury|Opposition': 'Saturn opposing natal Mercury creates tension around debt and taxes — expect push-pull dynamics in fiscal policy debates.',
  'Jupiter|Sun|Conjunction': 'Jupiter conjunct the national Sun brings expansion and opportunity. A window opens for diplomatic gains, economic growth, or territorial influence.',
  'Jupiter|Sun|Trine': 'Jupiter trining the national Sun supports broad-based growth. International standing improves and economic confidence rises.',
  'Jupiter|Moon|Conjunction': 'Jupiter conjunct the national Moon lifts public optimism. Cultural vitality and consumer confidence trend upward.',
  'Jupiter|Moon|Opposition': 'Jupiter opposing the national Moon creates tension between public optimism and the reality of governance. Promises may exceed delivery capacity.',
  'Jupiter|Moon|Square': 'Jupiter squaring the national Moon generates restless public expectation. Popular demand outpaces what leadership can realistically provide.',
  'Jupiter|Mars|Conjunction': 'Jupiter conjunct natal Mars energizes military ambitions and executive action. Bold moves are favored, but overconfidence carries risk.',
  'Jupiter|Saturn|Conjunction': 'Jupiter conjunct natal Saturn marks a pivot point — old structures begin accommodating new growth. A cautiously expansive chapter opens.',
  'Jupiter|Venus|Conjunction': 'Jupiter conjunct natal Venus enhances diplomatic warmth, trade prosperity, and cultural soft power. International reputation strengthens.',
  'Jupiter|Mercury|Conjunction': 'Jupiter conjunct natal Mercury expands communication, media reach, and intellectual output. Trade agreements and educational initiatives flourish.',
  'Mars|Sun|Conjunction': 'Mars conjunct the national Sun energizes government action — expect decisive moves, military posturing, or aggressive policy rollouts.',
  'Mars|Sun|Opposition': 'Mars opposing the national Sun heightens confrontation with foreign powers or domestic opposition. Diplomatic tensions may escalate.',
  'Mars|Sun|Square': 'Mars squaring the national Sun generates friction and impatience in government circles. Hasty decisions carry risk.',
  'Mars|Moon|Square': 'Mars squaring the national Moon inflames public tempers. Street-level unrest or sharp partisan divisions become more likely.',
  'Pluto|North Node|Conjunction': 'Pluto conjunct the national North Node signals a pivotal evolutionary moment — the nation confronts its destiny through crisis and transformation.',
  'Saturn|North Node|Conjunction': 'Saturn conjunct the national North Node brings karmic accountability. The nation must deal honestly with its path forward — shortcuts are not available.',
  'Uranus|North Node|Conjunction': 'Uranus conjunct the national North Node accelerates the nation\'s evolutionary trajectory. A sudden breakthrough redefines the national direction.',
  'Neptune|North Node|Conjunction': 'Neptune conjunct the national North Node brings spiritual or ideological shifts to the national purpose. Vision competes with delusion.',
  'Jupiter|North Node|Conjunction': 'Jupiter conjunct the national North Node opens doors of opportunity. The nation\'s path forward is blessed with expansion and goodwill.',
  'Pluto|South Node|Conjunction': 'Pluto conjunct the national South Node forces a reckoning with the past. Old power structures, debts, and unresolved national traumas resurface for final resolution.',
  'Saturn|South Node|Conjunction': 'Saturn conjunct the national South Node demands the release of outdated institutions and habits. The weight of tradition becomes a burden rather than a foundation.',
  'Uranus|South Node|Conjunction': 'Uranus conjunct the national South Node disrupts inherited patterns — sudden breaks from historical precedent reshape the national trajectory.',
  'Neptune|South Node|Conjunction': 'Neptune conjunct the national South Node dissolves old illusions and attachments. Past glories lose their hold as the nation confronts what must be released.',
  'Jupiter|South Node|Conjunction': 'Jupiter conjunct the national South Node amplifies the pull of familiar territory. Growth comes not from expansion, but from wisely releasing what no longer serves.',
  'Pluto|Chiron|Conjunction': 'Pluto conjunct natal Chiron opens deep national wounds for transformative healing. Historical traumas surface in public discourse with powerful intensity.',
  'Neptune|Chiron|Conjunction': 'Neptune conjunct natal Chiron brings a wave of collective compassion — or collective delusion — around the nation\'s deepest vulnerabilities.',
  'Uranus|Chiron|Conjunction': 'Uranus conjunct natal Chiron triggers sudden breakthroughs in how the nation addresses its foundational wounds. Crisis becomes catalyst for healing.',
  'Saturn|Chiron|Conjunction': 'Saturn conjunct natal Chiron forces the nation to confront its vulnerabilities with sober realism. Institutional responses to national pain come under scrutiny.',
  'Jupiter|Chiron|Conjunction': 'Jupiter conjunct natal Chiron expands awareness of the nation\'s healing journey. Public discourse around historical grievances gains prominence and breadth.',
};

const ASPECT_TEMPLATES: Record<string, string[]> = {
  Conjunction: [
    '{t} merging with natal {n} concentrates energy in {sector} — a focal point demanding leadership attention.',
    'The {t}-{n} conjunction channels powerful focus into {sector}, signaling intensified activity and potential breakthroughs.',
    'As {t} aligns with the national {n}, the spotlight falls squarely on {sector} — decisive moments are ahead.',
  ],
  Opposition: [
    '{t} opposing natal {n} exposes fault lines around {sector}. Competing interests clash and compromise is difficult.',
    'Tension builds as {t} faces off against natal {n} across {sector}. Push-pull dynamics test institutional resilience.',
    'The {t}-{n} opposition polarizes {sector} — external pressures collide with internal priorities.',
  ],
  Square: [
    '{t} squaring natal {n} generates mounting pressure on {sector} — unresolved tensions force difficult decisions.',
    'Friction between {t} and natal {n} creates stress points around {sector}. Delays and confrontations are likely.',
    'The {t}-{n} square pressures {sector} from an awkward angle — adaptation, not force, is the path forward.',
  ],
  Trine: [
    '{t} in harmony with natal {n} eases conditions around {sector}, offering stability and productive momentum.',
    'A supportive flow between {t} and natal {n} benefits {sector} — progress comes naturally.',
  ],
  Sextile: [
    'A constructive alignment between {t} and natal {n} creates practical opportunities in {sector}.',
    '{t} sextile natal {n} opens a window for measured progress around {sector}.',
  ],
  Quincunx: [
    'An uneasy adjustment between {t} and natal {n} creates blind spots around {sector} that policymakers may underestimate.',
    '{t} in awkward aspect to natal {n} signals misalignment in {sector} — recalibration is needed.',
  ],
};

let _transitTemplateCounter = 0;

function transitInterpretation(h: TransitHit): string {
  const key = `${h.transit_planet}|${h.natal_planet}|${h.aspect}`;
  if (TRANSIT_NARRATIVES[key]) return TRANSIT_NARRATIVES[key];

  const templates = ASPECT_TEMPLATES[h.aspect];
  if (templates) {
    const idx = _transitTemplateCounter++ % templates.length;
    const sector = HOUSE_KEYWORDS[h.natal_house] || 'national affairs';
    return templates[idx]
      .replace(/\{t\}/g, h.transit_planet)
      .replace(/\{n\}/g, h.natal_planet)
      .replace(/\{sector\}/g, sector);
  }

  const sector = HOUSE_KEYWORDS[h.natal_house] || 'national affairs';
  return `${h.transit_planet} aspects the national ${h.natal_planet} in the ${sector} sector.`;
}

function severityLabel(severity: string): { text: string; color: string; bg: string } {
  switch (severity) {
    case 'major': return { text: 'High Impact', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    case 'moderate': return { text: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    default: return { text: 'Minor', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
  }
}

function TransitPanel({ hits }: { hits: TransitHit[] }) {
  const [showAll, setShowAll] = useState(false);
  const DEFAULT_SHOW = 5;

  const sorted = [...hits].sort((a, b) => {
    const sevOrder: Record<string, number> = { major: 0, moderate: 1, minor: 2 };
    const sa = sevOrder[a.severity] ?? 3;
    const sb = sevOrder[b.severity] ?? 3;
    if (sa !== sb) return sa - sb;
    return Math.abs(a.orb) - Math.abs(b.orb);
  });

  const visible = showAll ? sorted : sorted.slice(0, DEFAULT_SHOW);
  const hiddenCount = sorted.length - DEFAULT_SHOW;

  const groups: Record<string, TransitHit[]> = {};
  for (const h of visible) {
    const key = h.severity || 'minor';
    if (!groups[key]) groups[key] = [];
    groups[key].push(h);
  }

  const orderedGroups = ['major', 'moderate', 'minor'].filter(k => groups[k]);

  _transitTemplateCounter = 0;

  return (
    <div className="card bg-gradient-to-br from-purple-500/5 to-transparent space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Active Transits</h3>
        <p className="text-text-muted text-[10px] mt-0.5">
          Planetary transits show how current sky positions interact with the national chart
        </p>
      </div>

      <div className="space-y-4">
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

      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center text-accent-primary text-xs py-2 hover:underline"
        >
          Show all {sorted.length} transits ({hiddenCount} more)
        </button>
      )}
      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full text-center text-text-muted text-xs py-2 hover:underline"
        >
          Show fewer
        </button>
      )}
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
    return `${pairTheme.charAt(0).toUpperCase() + pairTheme.slice(1)} — focused on ${sector.toLowerCase()}.`;
  }
  const a = PLANET_THEMES[m.pair[0]] || 'planetary energy';
  const b = PLANET_THEMES[m.pair[1]] || 'planetary energy';
  return `${a.charAt(0).toUpperCase() + a.slice(1)} meets ${b} — activating ${sector.toLowerCase()}.`;
}

function MidpointPanel({ midpoints }: { midpoints: MidpointEntry[] }) {
  const [showAll, setShowAll] = useState(false);
  const DEFAULT_SHOW = 5;

  const visible = showAll ? midpoints : midpoints.slice(0, DEFAULT_SHOW);
  const hiddenCount = midpoints.length - DEFAULT_SHOW;

  return (
    <div className="card bg-gradient-to-br from-cyan-500/5 to-transparent space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Active Midpoints</h3>
        <p className="text-text-muted text-[10px] mt-0.5">
          Midpoints are sensitive degrees where two planetary energies blend — when transits hit these points, both themes activate simultaneously
        </p>
      </div>

      <div className="space-y-2">
        {visible.map((m, i) => (
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

      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center text-accent-primary text-xs py-2 hover:underline"
        >
          Show all {midpoints.length} midpoints ({hiddenCount} more)
        </button>
      )}
      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full text-center text-text-muted text-xs py-2 hover:underline"
        >
          Show fewer
        </button>
      )}
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

const PROGRESSION_TEMPLATES: Record<string, (sign: string, sector: string) => string> = {
  Sun: (sign, sector) => `The nation's core identity is evolving through ${SIGN_EVOLUTION[sign] || sign + ' energy'} — reshaping ${sector.toLowerCase()} priorities over decades.`,
  Moon: (sign, sector) => `Public mood and collective instincts shift toward ${SIGN_EVOLUTION[sign] || sign + ' energy'}, coloring the ${sector.toLowerCase()} landscape.`,
  Mercury: (sign, sector) => `National discourse and trade strategy mature through ${SIGN_EVOLUTION[sign] || sign + ' themes'}, influencing ${sector.toLowerCase()}.`,
  Venus: (sign, sector) => `Diplomatic style and economic values gradually adopt ${SIGN_EVOLUTION[sign] || sign + ' qualities'} — ${sector.toLowerCase()} reflects this shift.`,
  Mars: (sign, sector) => `The nation's assertiveness and military posture evolve toward ${SIGN_EVOLUTION[sign] || sign + ' energy'}, expressed through ${sector.toLowerCase()}.`,
  Jupiter: (sign, sector) => `Growth ambitions and ideological direction channel through ${SIGN_EVOLUTION[sign] || sign + ' themes'}, expanding ${sector.toLowerCase()}.`,
  Saturn: (sign, sector) => `Institutional structures and governance discipline deepen through ${SIGN_EVOLUTION[sign] || sign + ' maturity'}, anchoring ${sector.toLowerCase()}.`,
  Uranus: (sign, sector) => `Reform impulses and innovation drives express through ${SIGN_EVOLUTION[sign] || sign + ' energy'} in the ${sector.toLowerCase()} domain.`,
  Neptune: (sign, sector) => `National ideals and collective vision dissolve and reform through ${SIGN_EVOLUTION[sign] || sign + ' themes'}, shaping ${sector.toLowerCase()}.`,
  Pluto: (sign, sector) => `Deep transformative currents run through ${SIGN_EVOLUTION[sign] || sign + ' energy'}, fundamentally reshaping ${sector.toLowerCase()} over generations.`,
};

function progressionInterpretation(p: ProgPlanet): string {
  const sector = HOUSE_KEYWORDS[p.house] || `House ${p.house}`;
  const template = PROGRESSION_TEMPLATES[p.planet];
  if (template) return template(p.sign, sector);
  const theme = PLANET_THEMES[p.planet] || 'planetary influence';
  return `The nation's evolved ${theme} expresses through ${SIGN_EVOLUTION[p.sign] || p.sign + ' energy'} in the ${sector.toLowerCase()} sector.`;
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
                    {p.degree.toFixed(1)}° · {HOUSE_KEYWORDS[p.house] || `House ${p.house}`}
                  </p>
                </div>
              </div>
              <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
                {progressionInterpretation(p)}
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

// ─── Convergence Panel ──────────────────────────────────────

interface HouseEvidence {
  house: number;
  transitCount: number;
  midpointCount: number;
  progressionCount: number;
  sourceCount: number;
  total: number;
}

function convergenceLevel(sourceCount: number): { label: string; color: string; bg: string } {
  if (sourceCount >= 3) return { label: 'MAJOR', color: 'text-red-400', bg: 'bg-red-500/10' };
  if (sourceCount >= 2) return { label: 'SIGNIFICANT', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
  return { label: 'DEVELOPING', color: 'text-blue-400', bg: 'bg-blue-500/10' };
}

function ConvergencePanel({ hotspots, allHouses }: { hotspots: HouseEvidence[]; allHouses: HouseEvidence[] }) {
  return (
    <div className="card bg-gradient-to-br from-red-500/5 to-transparent space-y-4">
      <div>
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-400" />
          Where Pressure Is Building
        </h2>
        <p className="text-text-muted text-[10px] mt-0.5">
          Sectors where transits, midpoints, and progressions converge — multiple independent indicators pointing to the same area
        </p>
      </div>

      <div className="space-y-2">
        {hotspots.map(h => {
          const level = convergenceLevel(h.sourceCount);
          const sector = HOUSE_KEYWORDS[h.house] || `House ${h.house}`;
          return (
            <div key={h.house} className={`rounded-lg border border-white/10 p-3 ${level.bg}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary text-sm font-semibold">{sector}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${level.color}`}>{level.label}</span>
                </div>
                <span className="text-text-muted text-[10px]">{h.total} indicators</span>
              </div>
              <div className="flex gap-3 mt-2">
                {h.transitCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span className="text-text-muted text-[10px]">{h.transitCount} transit{h.transitCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {h.midpointCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-text-muted text-[10px]">{h.midpointCount} midpoint{h.midpointCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {h.progressionCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-text-muted text-[10px]">{h.progressionCount} progression{h.progressionCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini 12-house overview */}
      <div className="grid grid-cols-6 gap-1.5 pt-2 border-t border-white/5">
        {allHouses.sort((a, b) => a.house - b.house).map(h => {
          const active = h.total > 0;
          return (
            <div key={h.house} className={`text-center rounded p-1.5 ${active ? 'bg-white/5' : 'opacity-30'}`}>
              <p className={`text-[10px] font-bold ${h.sourceCount >= 2 ? 'text-red-400' : h.total > 0 ? 'text-text-secondary' : 'text-text-muted'}`}>
                H{h.house}
              </p>
              <div className="flex justify-center gap-0.5 mt-0.5">
                {h.transitCount > 0 && <div className="w-1 h-1 rounded-full bg-purple-400" />}
                {h.midpointCount > 0 && <div className="w-1 h-1 rounded-full bg-cyan-400" />}
                {h.progressionCount > 0 && <div className="w-1 h-1 rounded-full bg-amber-400" />}
                {h.total === 0 && <span className="text-[8px] text-text-muted">—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Synastry computation ───────────────────────────────────

interface PlanetPos { name: string; longitude: number; sign: string; house: number; }
interface SynastryAspect { planetA: string; planetB: string; aspect: string; orb: number; nature: 'harmonious' | 'challenging' | 'neutral'; }

const SYNASTRY_ASPECT_DEFS = [
  { name: 'conjunction', angle: 0, orb: 8 },
  { name: 'opposition', angle: 180, orb: 8 },
  { name: 'trine', angle: 120, orb: 7 },
  { name: 'square', angle: 90, orb: 7 },
  { name: 'sextile', angle: 60, orb: 5 },
  { name: 'quincunx', angle: 150, orb: 3 },
] as const;

const ASPECT_GLYPHS: Record<string, string> = {
  conjunction: '☌', opposition: '☍', trine: '△',
  square: '□', sextile: '⚹', quincunx: '⚻',
};

const BENEFICS = new Set(['Venus', 'Jupiter']);
const MALEFICS = new Set(['Mars', 'Saturn', 'Pluto']);

function extractPlanets(chartJson: any): PlanetPos[] {
  if (!chartJson?.planets) return [];
  return Object.entries(chartJson.planets).map(([name, data]: [string, any]) => ({
    name,
    longitude: data.longitude ?? 0,
    sign: data.sign ?? '',
    house: data.house ?? 0,
  }));
}

function classifySynastryAspect(aspectName: string, pA: string, pB: string): 'harmonious' | 'challenging' | 'neutral' {
  if (aspectName === 'trine' || aspectName === 'sextile') return 'harmonious';
  if (aspectName === 'square' || aspectName === 'opposition' || aspectName === 'quincunx') return 'challenging';
  if (aspectName === 'conjunction') {
    if ((BENEFICS.has(pA) || BENEFICS.has(pB)) && !MALEFICS.has(pA) && !MALEFICS.has(pB)) return 'harmonious';
    if (MALEFICS.has(pA) && MALEFICS.has(pB)) return 'challenging';
  }
  return 'neutral';
}

function computeSynastry(planetsA: PlanetPos[], planetsB: PlanetPos[]): SynastryAspect[] {
  const aspects: SynastryAspect[] = [];
  for (const pA of planetsA) {
    for (const pB of planetsB) {
      const diff = Math.abs(((pA.longitude - pB.longitude) % 360 + 360) % 360);
      const angle = diff > 180 ? 360 - diff : diff;
      for (const def of SYNASTRY_ASPECT_DEFS) {
        const orb = Math.abs(angle - def.angle);
        if (orb <= def.orb) {
          aspects.push({
            planetA: pA.name,
            planetB: pB.name,
            aspect: def.name,
            orb: Math.round(orb * 100) / 100,
            nature: classifySynastryAspect(def.name, pA.name, pB.name),
          });
          break;
        }
      }
    }
  }
  return aspects.sort((a, b) => a.orb - b.orb);
}

function computeSynastryScore(aspects: SynastryAspect[]): { total: number; harmonious: number; challenging: number; label: string } {
  let harmonious = 0;
  let challenging = 0;
  for (const a of aspects) {
    const weight = 1 - (a.orb / 10);
    if (a.nature === 'harmonious') harmonious += weight;
    else if (a.nature === 'challenging') challenging += weight;
    else harmonious += weight * 0.3;
  }
  harmonious = Math.round(harmonious * 10) / 10;
  challenging = Math.round(challenging * 10) / 10;
  const total = Math.round((harmonious - challenging) * 10) / 10;
  let label = 'Balanced';
  if (total >= 5) label = 'Strong Harmony';
  else if (total >= 2) label = 'Mostly Harmonious';
  else if (total >= 0) label = 'Balanced';
  else if (total >= -3) label = 'Some Tension';
  else label = 'Significant Tension';
  return { total, harmonious, challenging, label };
}

function natureColor(n: 'harmonious' | 'challenging' | 'neutral'): string {
  if (n === 'harmonious') return 'text-emerald-400';
  if (n === 'challenging') return 'text-red-400';
  return 'text-purple-400';
}

function SynastryResults({ countryA, countryB, aspects, score }: {
  countryA: GICountry;
  countryB: GICountry;
  aspects: SynastryAspect[];
  score: { total: number; harmonious: number; challenging: number; label: string };
}) {
  const [showAllAspects, setShowAllAspects] = useState(false);
  const DEFAULT_SHOW = 8;
  const visible = showAllAspects ? aspects : aspects.slice(0, DEFAULT_SHOW);

  return (
    <div className="space-y-4">
      {/* Country pair header */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="text-center">
          <span className="text-2xl">{countryA.flag_emoji || '🏳️'}</span>
          <p className="text-text-primary text-xs font-medium mt-1">{countryA.name}</p>
        </div>
        <span className="text-text-muted text-lg">↔</span>
        <div className="text-center">
          <span className="text-2xl">{countryB.flag_emoji || '🏳️'}</span>
          <p className="text-text-primary text-xs font-medium mt-1">{countryB.name}</p>
        </div>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-3 gap-3 bg-white/5 rounded-lg p-3">
        <div className="text-center">
          <p className="text-emerald-400 text-lg font-bold">{score.harmonious}</p>
          <p className="text-text-muted text-[10px]">Harmonious</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${score.total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {score.total > 0 ? '+' : ''}{score.total}
          </p>
          <p className="text-text-muted text-[10px]">Net Score</p>
        </div>
        <div className="text-center">
          <p className="text-red-400 text-lg font-bold">{score.challenging}</p>
          <p className="text-text-muted text-[10px]">Challenging</p>
        </div>
      </div>
      <p className={`text-center text-sm font-medium ${score.total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {score.label}
      </p>
      <p className="text-text-muted text-[10px] text-center">
        Based on {aspects.length} inter-chart aspects. Tighter orbs carry more weight.
      </p>

      {/* Aspect list */}
      {aspects.length > 0 && (
        <div className="space-y-1">
          <p className="text-text-secondary text-xs font-semibold">Inter-Chart Aspects</p>
          {visible.map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded bg-white/5 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.nature === 'harmonious' ? 'bg-emerald-400' : a.nature === 'challenging' ? 'bg-red-400' : 'bg-purple-400'}`} />
              <span className="text-text-primary font-medium">{a.planetA}</span>
              <span className={natureColor(a.nature)}>{ASPECT_GLYPHS[a.aspect] || ''}</span>
              <span className="text-text-primary font-medium">{a.planetB}</span>
              <span className="text-text-muted ml-auto">{a.orb}°</span>
              <span className={`${natureColor(a.nature)} capitalize`}>{a.aspect}</span>
            </div>
          ))}
          {!showAllAspects && aspects.length > DEFAULT_SHOW && (
            <button
              onClick={() => setShowAllAspects(true)}
              className="w-full text-center text-accent-primary text-xs py-1.5 hover:underline"
            >
              Show all {aspects.length} aspects ({aspects.length - DEFAULT_SHOW} more)
            </button>
          )}
          {showAllAspects && aspects.length > DEFAULT_SHOW && (
            <button
              onClick={() => setShowAllAspects(false)}
              className="w-full text-center text-text-muted text-xs py-1.5 hover:underline"
            >
              Show fewer
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-text-muted text-[10px]">Harmonious</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-text-muted text-[10px]">Challenging</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-text-muted text-[10px]">Neutral</span>
        </div>
      </div>
    </div>
  );
}
