'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, MapPin, Shield, AlertTriangle, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Search } from 'lucide-react';
import {
  getCountry, getPrimaryChart, getDailyIntel, getCountryEvents, listCountries,
  getCategoryMidpoints,
  type GICountry, type GICountryChart, type GIDailyIntel, type GICountryEvent,
  type CategoryMidpointReport, type CategoryMidpointEntry,
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

  // Category midpoints state (lazy-loaded)
  const [catMidpoints, setCatMidpoints] = useState<CategoryMidpointReport | null>(null);
  const [catMidpointsLoading, setCatMidpointsLoading] = useState(false);

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

  // Lazy-load category midpoints when panel is opened
  useEffect(() => {
    if (expandedPanel === 'midpoints' && iso && !catMidpoints && !catMidpointsLoading) {
      setCatMidpointsLoading(true);
      getCategoryMidpoints(iso).then(data => {
        setCatMidpoints(data);
        setCatMidpointsLoading(false);
      }).catch(() => setCatMidpointsLoading(false));
    }
  }, [expandedPanel, iso, catMidpoints, catMidpointsLoading]);

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

            {/* Cultural Synthesis */}
            {sunSign && moonSign && (
              <div className="rounded-lg bg-gradient-to-br from-violet-500/10 to-transparent p-3 border border-violet-500/10">
                <p className="text-violet-400 text-[10px] font-bold uppercase tracking-wider mb-1">Cultural Synthesis</p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {country.name}&apos;s astrological DNA reveals a nation whose core identity ({sunSign} Sun: {SIGN_NATIONAL_THEMES[sunSign]?.identity || 'core values'}) operates through a populace whose emotional character is shaped by {moonSign} energy ({SIGN_NATIONAL_THEMES[moonSign]?.mood || 'collective sentiment'}).
                  {ascSign && ` The world sees ${country.name} through ${ascSign} Rising — projecting ${SIGN_NATIONAL_THEMES[ascSign]?.projection || 'its national image'}.`}
                  {mcSign && ` Its governing philosophy leans toward ${SIGN_NATIONAL_THEMES[mcSign]?.governance || 'established principles'}.`}
                  {' '}This combination shapes how {country.name} navigates crises, forms alliances, and projects influence — every transit and progression activates these foundational patterns.
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
        <ConvergencePanel
          hotspots={hotspots}
          allHouses={convergenceData}
          transitHits={intel?.transits_json?.hits || []}
          midpoints={intel?.midpoints_json?.top || []}
          progressions={intel?.progressions_json?.planets || []}
        />
      )}

      {/* ── Prediction Synthesis ────────────────────────────── */}
      {hotspots.length > 0 && intel && (
        <PredictionPanel
          hotspots={hotspots}
          transitHits={intel.transits_json?.hits || []}
          midpoints={intel.midpoints_json?.top || []}
          progressions={intel.progressions_json?.planets || []}
          progAspects={intel.progressions_json?.aspects || []}
          countryName={country?.name || 'this nation'}
        />
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
              value={intel.midpoints_json?.top?.length || 0}
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

          {expandedPanel === 'midpoints' && (
            <>
              {catMidpointsLoading && (
                <div className="card bg-gradient-to-br from-cyan-500/5 to-transparent p-6 text-center">
                  <div className="animate-pulse text-text-muted text-sm">Loading asteroid midpoint intelligence...</div>
                </div>
              )}
              {catMidpoints && (
                <CategoryMidpointPanel report={catMidpoints} />
              )}
              {intel.midpoints_json?.top && (
                <MidpointPanel midpoints={intel.midpoints_json.top} />
              )}
            </>
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
  // Major planets
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
  // Points
  'North Node': 'national destiny and future direction',
  'South Node': 'past patterns and karmic release',
  Ascendant: 'national self-image and public identity',
  Midheaven: 'governmental authority and international standing',
  MC: 'governmental authority and international standing',
  IC: 'homeland foundations and territorial roots',
  Descendant: 'foreign alliances and open adversaries',
  'Part of Fortune': 'material prosperity and national fortune',
  // Major asteroids
  Chiron: 'national wounds and healing',
  Vesta: 'dedication, service, and sacred focus',
  Juno: 'partnerships, treaties, and commitments',
  Ceres: 'nurturing, resources, and sustenance',
  Pallas: 'strategy, wisdom, and pattern recognition',
  Pholus: 'small catalysts triggering large consequences',
  // Justice & Law
  Astraea: 'celestial justice, legal order, and divine law',
  Themis: 'constitutional authority, sacred oaths, and moral order',
  Dike: 'human justice, courtroom verdicts, and moral accountability',
  Justitia: 'legal fairness, judicial balance, and due process',
  Eunomia: 'civic order, lawful governance, and social regulation',
  // War & Military
  Bellona: 'war fever, military aggression, and armed conflict',
  Achilles: 'heroic vulnerability, fatal weakness in strength',
  Hektor: 'defensive warfare, duty-bound sacrifice, and last stands',
  Cebriones: 'military logistics, troop movements, and tactical coordination',
  // Victory & Success
  Victoria: 'national triumph, competitive victory, and conquest',
  Nike: 'decisive victory, winning momentum, and competitive edge',
  Champion: 'athletic prowess, champions of a cause, and peak performance',
  Gloria: 'public glory, fame, recognition, and national prestige',
  // Economy & Finance
  Fortuna: 'fortune, luck cycles, and unpredictable economic shifts',
  Tyche: 'fate-driven prosperity and chance-based outcomes',
  Abundantia: 'material abundance, surplus, and overflowing resources',
  Midas: 'wealth obsession, golden opportunities, and speculative greed',
  Gold: 'gold reserves, precious metals, and hard-asset value',
  Silver: 'silver markets, secondary commodities, and industrial metals',
  Mony: 'currency flow, monetary policy, and cash liquidity',
  Banks: 'banking institutions, lending, and financial infrastructure',
  Industria: 'industrial output, manufacturing, and productive labor',
  Enterprise: 'entrepreneurship, corporate ventures, and business innovation',
  Bonus: 'economic windfalls, surplus revenue, and unexpected gains',
  // Fate & Karma
  Karma: 'karmic reckoning and consequences of past actions',
  Nemesis: 'retribution, downfall of the powerful, and poetic justice',
  Atropos: 'inevitable endings, finality, and irreversible closure',
  Klotho: 'new beginnings, the thread of fate being spun',
  Lachesis: 'measured duration, the allocation of time and lifespan',
  Destinn: 'destined outcomes and unavoidable turning points',
  // Healing & Health
  Hygiea: 'public health infrastructure, sanitation, and disease prevention',
  Aesculapia: 'medical institutions, physicians, and curative intervention',
  Asclepius: 'miraculous recovery, healing crises, and medical breakthroughs',
  Panacea: 'universal remedies, pharmaceutical solutions, and cure-all ambitions',
  Reiki: 'alternative healing, energy medicine, and holistic health movements',
  // Love & Relationship
  Eros: 'passionate desire, magnetic attraction, and raw intensity',
  Amor: 'unconditional love, compassion-driven bonds, and selfless devotion',
  Valentine: 'romantic idealism, fateful love, and heart-centered connection',
  Cupido: 'infatuation, sudden attraction, and desire-driven impulses',
  Aphrodite: 'beauty, sensuality, aesthetic power, and allure',
  Lust: 'raw desire, physical appetite, and primal drives',
  Casanova: 'seductive charm, romantic conquest, and charismatic influence',
  Union: 'merging of forces, unification, and binding agreements',
  // Psychology & Soul
  Psyche: 'collective psychology, the national soul, and deep identity',
  Lilith: 'suppressed truths, marginalized voices, and shadow power',
  Hypnos: 'mass hypnosis, collective sleep, and unconscious influence',
  // Wisdom & Strategy
  Athene: 'strategic wisdom, calculated warfare, and intellectual defense',
  Heracles: 'heroic effort, laborious triumph, and extraordinary strength',
  Apollo: 'illumination, prophecy, cultural brilliance, and artistic vision',
  Urania: 'scientific discovery, astronomical insight, and technological vision',
  // Communication & Commerce
  Iris: 'divine messaging, rainbow diplomacy, and bridge-building communication',
  Hermes: 'trade routes, swift commerce, cunning negotiation, and information flow',
  Kassandra: 'unheeded warnings, ignored prophecy, and disbelieved intelligence',
  // Mythology & Archetype
  Isis: 'sacred feminine power, resurrection, and institutional restoration',
  Osiris: 'death and rebirth of institutions, cyclical renewal, and legacy',
  Nephthys: 'hidden sanctuaries, grief processing, and shadow governance',
  Hekate: 'crossroads decisions, liminal power, and occult statecraft',
  Pandora: 'unleashed consequences, irreversible actions, and unintended fallout',
  Magdalena: 'sacred witness, redemptive devotion, and spiritual testimony',
  Prometheus: 'revolutionary innovation, forbidden knowledge, and defiant progress',
  Lucifer: 'pride, the light-bringer, illumination through rebellion',
  // Recklessness & Hubris
  Icarus: 'reckless ambition, overreach, and spectacular downfall',
  Phaethon: 'loss of control, catastrophic mismanagement, and environmental disaster',
  Sisyphus: 'futile repetition, endless struggle, and bureaucratic gridlock',
  Tantalus: 'temptation, unattainable goals, and tortured proximity to power',
  'Don Quixote': 'idealistic crusades, tilting at windmills, and noble delusion',
  // Destruction & Threat
  Atlantis: 'civilizational collapse, hubris-driven catastrophe, and lost legacy',
  Apophis: 'existential threat, chaos serpent, and destruction from beyond',
  Dejanira: 'victimization, tragic vulnerability, and collateral suffering',
  // Centaurs & TNOs
  Nessus: 'abuse of power, toxic cycles, and karmic retribution',
  Chariklo: 'graceful boundaries, sacred space, and healing presence',
  Eris: 'discord, provocation, and the exposure of hidden injustice',
  Haumea: 'fertility, rebirth, and rapid creative generation',
  Makemake: 'environmental stewardship, resource cycles, and ecological balance',
  Sedna: 'deep isolation, betrayal, and transformation through extreme conditions',
  Orcus: 'oath-keeping, the underworld, and consequences of broken promises',
  Quaoar: 'creation myths, foundational order, and cosmic law',
  Varuna: 'cosmic order, all-seeing oversight, and celestial governance',
  Ixion: 'ingratitude, repeated offenses, and abuse of second chances',
  Chaos: 'primordial disruption, the void before order, and systemic entropy',
  // Miscellaneous
  Child: 'demographic trends, youth issues, and generational emergence',
  Aura: 'collective atmosphere, energetic climate, and national mood field',
  TARDIS: 'temporal anomalies, time-bending developments, and anachronistic events',
  Orpheus: 'cultural loss, artistic mourning, and the power of music and art',
  Poseidon: 'oceanic power, naval force, maritime events, and flooding',
  Huma: 'blessing, sovereignty bestowed, and divine favor',
  Chernykh: 'observation, surveillance, and the watcher\'s role',
  Excalibur: 'rightful authority, sovereign legitimacy, and the mandate to rule',
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

// ─── Category Midpoint Panel (Asteroid-Enhanced) ───────────

const CATEGORY_ICONS: Record<string, string> = {
  government_leadership: '\u{1F3DB}',
  politics_law: '\u{2696}',
  diplomacy_treaties: '\u{1F91D}',
  war_military: '\u{2694}',
  civil_unrest_revolution: '\u{1F525}',
  economy_banking: '\u{1F4B0}',
  trade_resources: '\u{1F6A2}',
  natural_disasters: '\u{1F30B}',
  climate_environment: '\u{1F30D}',
  health_disease: '\u{1FA7A}',
  technology_cyber: '\u{1F4BB}',
  media_propaganda: '\u{1F4F0}',
  religion_ideology: '\u{1F54C}',
  crime_corruption: '\u{1F575}',
  migration_population: '\u{1F6B6}',
  food_agriculture: '\u{1F33E}',
  infrastructure_transport: '\u{1F3D7}',
  leaders_royalty: '\u{1F451}',
  sports_victory: '\u{1F3C6}',
  cultural_social: '\u{1F3AD}',
};

function CategoryMidpointPanel({ report }: { report: CategoryMidpointReport }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAllCats, setShowAllCats] = useState(false);

  // Sort categories: those with activated midpoints first, then by total count
  const sortedCategories = useMemo(() => {
    return Object.entries(report.categories)
      .map(([key, midpoints]) => ({
        key,
        label: midpoints[0]?.category_label || key,
        midpoints,
        activatedCount: midpoints.filter(m => m.is_activated).length,
        totalCount: midpoints.length,
      }))
      .sort((a, b) => b.activatedCount - a.activatedCount || b.totalCount - a.totalCount);
  }, [report.categories]);

  // Categories with activations = "hot" categories
  const hotCategories = sortedCategories.filter(c => c.activatedCount > 0);
  const coldCategories = sortedCategories.filter(c => c.activatedCount === 0);
  const visibleCold = showAllCats ? coldCategories : coldCategories.slice(0, 4);

  const activeCat = activeCategory
    ? sortedCategories.find(c => c.key === activeCategory)
    : null;

  return (
    <div className="card bg-gradient-to-br from-purple-500/5 to-cyan-500/5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          Midpoint Intelligence
          <span className="text-[10px] font-normal text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
            {report.activated_count} active
          </span>
        </h3>
        <p className="text-text-muted text-[10px] mt-0.5">
          Category-based midpoints using {report.total_count} pairs across {Object.keys(report.categories).length} intelligence domains with asteroid enhancement
        </p>
      </div>

      {/* Hot categories (have transit activations today) */}
      {hotCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Active Intelligence</p>
          <div className="flex flex-wrap gap-1.5">
            {hotCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                  activeCategory === cat.key
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-red-500/10 border-red-500/20 text-text-secondary hover:bg-red-500/15'
                }`}
              >
                <span className="mr-1">{CATEGORY_ICONS[cat.key] || '\u{1F52E}'}</span>
                {cat.label}
                <span className="ml-1 text-red-400 font-bold">{cat.activatedCount}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All other categories */}
      <div className="space-y-2">
        {hotCategories.length > 0 && (
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">All Domains</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {visibleCold.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                activeCategory === cat.key
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10'
              }`}
            >
              <span className="mr-1">{CATEGORY_ICONS[cat.key] || '\u{1F52E}'}</span>
              {cat.label}
              <span className="ml-1 opacity-50">{cat.totalCount}</span>
            </button>
          ))}
          {!showAllCats && coldCategories.length > 4 && (
            <button
              onClick={() => setShowAllCats(true)}
              className="text-[11px] px-2.5 py-1 text-accent-primary hover:underline"
            >
              +{coldCategories.length - 4} more
            </button>
          )}
        </div>
      </div>

      {/* Expanded category detail */}
      {activeCat && (
        <div className="space-y-2 border-t border-white/5 pt-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-primary">
              {CATEGORY_ICONS[activeCat.key] || '\u{1F52E}'} {activeCat.label}
            </h4>
            <span className="text-[10px] text-text-muted">
              {activeCat.activatedCount} activated / {activeCat.totalCount} pairs
            </span>
          </div>
          {activeCat.midpoints[0]?.mundane_significance && (
            <p className="text-text-muted text-[10px] italic">
              Tracks {activeCat.midpoints[0].mundane_significance}
            </p>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {activeCat.midpoints.slice(0, 20).map((mp, i) => (
              <CategoryMidpointCard key={i} mp={mp} />
            ))}
            {activeCat.totalCount > 20 && (
              <p className="text-text-muted text-[10px] text-center py-1">
                Showing 20 of {activeCat.totalCount} midpoints
              </p>
            )}
          </div>
        </div>
      )}

      {/* Skipped asteroid audit */}
      {report.skipped_asteroids.length > 0 && (
        <details className="text-[10px] text-text-muted">
          <summary className="cursor-pointer hover:text-text-secondary">
            {report.skipped_asteroids.length} asteroid{report.skipped_asteroids.length !== 1 ? 's' : ''} unavailable
          </summary>
          <div className="mt-1 space-y-0.5 pl-3">
            {report.skipped_asteroids.map((s, i) => (
              <p key={i}>{s.name} (MPC {s.mpc_number}): {s.reason}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ─── Sign coloring for midpoint context ──────────────────────
const SIGN_MIDPOINT_FLAVOR: Record<string, string> = {
  Aries: 'with urgency and combative directness',
  Taurus: 'through slow consolidation and material stakes',
  Gemini: 'via media channels, dual narratives, and rapid information flow',
  Cancer: 'through domestic undercurrents and protective instincts',
  Leo: 'with dramatic visibility and leadership ego',
  Virgo: 'through meticulous detail, service infrastructure, and systemic efficiency',
  Libra: 'via diplomatic channels, legal proceedings, and balancing acts',
  Scorpio: 'through covert intensity, power plays, and crisis mechanisms',
  Sagittarius: 'via ideological conviction, international reach, and expansive vision',
  Capricorn: 'through institutional channels, hierarchical pressure, and structural authority',
  Aquarius: 'via collective movements, technological disruption, and systemic reform',
  Pisces: 'through hidden currents, compassionate idealism, and spiritual undercurrents',
};

// ─── Aspect activation verbs ─────────────────────────────────
const ASPECT_ACTIVATION: Record<string, string> = {
  Conjunction: 'fuses directly with',
  Opposition: 'pulls into polarized tension against',
  Square: 'forces a crisis point at',
  Trine: 'flows supportive energy into',
  Sextile: 'opens a constructive window at',
  Quincunx: 'creates awkward misalignment with',
};

// Deterministic template selector (hash pair names to pick a variation)
function pairHash(a: string, b: string): number {
  let h = 0;
  const s = a + b;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function CategoryMidpointCard({ mp }: { mp: CategoryMidpointEntry }) {
  const pairKey = `${mp.pair[0]}+${mp.pair[1]}`;
  const reversePairKey = `${mp.pair[1]}+${mp.pair[0]}`;
  const pairTheme = MIDPOINT_PAIR_THEMES[pairKey] || MIDPOINT_PAIR_THEMES[reversePairKey];
  const sector = HOUSE_KEYWORDS[mp.house] || `House ${mp.house}`;
  const themeA = PLANET_THEMES[mp.pair[0]] || mp.pair[0].toLowerCase();
  const themeB = PLANET_THEMES[mp.pair[1]] || mp.pair[1].toLowerCase();
  const signFlavor = SIGN_MIDPOINT_FLAVOR[mp.sign] || `in ${mp.sign}`;
  const sectorImpact = MIDPOINT_SECTOR_IMPACT[mp.house] || `influences the ${sector.toLowerCase()} sector`;
  const variant = pairHash(mp.pair[0], mp.pair[1]) % 5;

  // Build the interpretation body
  let body: string;
  if (pairTheme) {
    // We have a specific pair theme — use it with variety
    switch (variant) {
      case 0:
        body = `This sensitive degree channels ${pairTheme} ${signFlavor}. Positioned at ${mp.degree.toFixed(0)}° ${mp.sign}, it ${sectorImpact}.`;
        break;
      case 1:
        body = `Where ${themeA} intersects ${themeB}, a focal point for ${pairTheme} emerges at ${mp.degree.toFixed(0)}° ${mp.sign}. In the ${sector.toLowerCase()} sector, this ${sectorImpact}.`;
        break;
      case 2:
        body = `At ${mp.degree.toFixed(0)}° ${mp.sign}, the convergence of ${mp.pair[0]} and ${mp.pair[1]} concentrates ${pairTheme} ${signFlavor}. This point ${sectorImpact}.`;
        break;
      case 3:
        body = `The ${mp.pair[0]}/${mp.pair[1]} axis sensitizes ${mp.degree.toFixed(0)}° ${mp.sign} to ${pairTheme}. Operating ${signFlavor}, it ${sectorImpact}.`;
        break;
      default:
        body = `${pairTheme.charAt(0).toUpperCase() + pairTheme.slice(1)} crystallizes at ${mp.degree.toFixed(0)}° ${mp.sign}, where ${themeA} fuses with ${themeB}. This degree ${sectorImpact}.`;
        break;
    }
  } else {
    // No specific pair theme — build from individual body themes
    switch (variant) {
      case 0:
        body = `The intersection of ${themeA} and ${themeB} creates a volatile degree at ${mp.degree.toFixed(0)}° ${mp.sign}. Operating ${signFlavor}, this point ${sectorImpact}.`;
        break;
      case 1:
        body = `At ${mp.degree.toFixed(0)}° ${mp.sign}, ${mp.pair[0]}'s domain of ${themeA} merges with ${mp.pair[1]}'s sphere of ${themeB}. This sensitive axis ${sectorImpact}.`;
        break;
      case 2:
        body = `${themeA.charAt(0).toUpperCase() + themeA.slice(1)} collides with ${themeB} at ${mp.degree.toFixed(0)}° ${mp.sign}, forging a pressure point that ${sectorImpact}.`;
        break;
      case 3:
        body = `Where ${mp.pair[0]} and ${mp.pair[1]} converge — blending ${themeA} with ${themeB} — a sensitive degree forms at ${mp.degree.toFixed(0)}° ${mp.sign} ${signFlavor}. It ${sectorImpact}.`;
        break;
      default:
        body = `This midpoint concentrates ${themeA} alongside ${themeB} at ${mp.degree.toFixed(0)}° ${mp.sign}. Expressing ${signFlavor}, the degree ${sectorImpact}.`;
        break;
    }
  }

  // Build activation sentence
  let activation = '';
  if (mp.is_activated && mp.activating_transit && mp.activation_aspect) {
    const verb = ASPECT_ACTIVATION[mp.activation_aspect] || 'activates';
    const transitTheme = PLANET_THEMES[mp.activating_transit] || mp.activating_transit.toLowerCase();
    switch (pairHash(mp.activating_transit, mp.pair[0]) % 4) {
      case 0:
        activation = ` Transit ${mp.activating_transit} ${verb} this degree today — ${transitTheme} is catalyzing developments here.`;
        break;
      case 1:
        activation = ` Today's ${mp.activating_transit} ${mp.activation_aspect.toLowerCase()} lights up this point, injecting ${transitTheme} into the mix.`;
        break;
      case 2:
        activation = ` With ${mp.activating_transit} ${verb.replace('with', 'at')} ${mp.degree.toFixed(0)}° ${mp.sign}, expect ${transitTheme} to trigger visible events in this area.`;
        break;
      default:
        activation = ` Active now: ${mp.activating_transit}'s ${mp.activation_aspect.toLowerCase()} brings ${transitTheme} to bear on this sensitive degree.`;
        break;
    }
  } else if (!mp.is_activated) {
    switch (variant % 3) {
      case 0:
        activation = ' Dormant until transited — a latent trigger point.';
        break;
      case 1:
        activation = ' Waiting for a transit to ignite its potential.';
        break;
      default:
        activation = '';
        break;
    }
  }

  return (
    <div className={`rounded-lg border p-3 ${
      mp.is_activated
        ? 'bg-gradient-to-r from-red-500/10 to-purple-500/10 border-red-500/20'
        : 'bg-white/5 border-white/5'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {mp.is_activated && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          )}
          <p className="text-text-primary text-sm font-medium">
            {mp.pair[0]} + {mp.pair[1]}
          </p>
        </div>
        <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded flex-shrink-0">
          {sector}
        </span>
      </div>

      <p className="text-text-muted text-[10px] mt-0.5">
        {SIGN_GLYPHS[mp.sign] || ''} {mp.sign} {mp.degree.toFixed(1)}°
      </p>

      {mp.is_activated && mp.activating_transit && (
        <p className="text-red-400 text-[10px] mt-1 font-medium">
          {mp.activation_aspect} from {mp.activating_transit} (orb {mp.activation_orb?.toFixed(1)}°) — ACTIVE TODAY
        </p>
      )}

      <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
        {body}{activation}
      </p>
    </div>
  );
}

// ─── Midpoint Panel (Original — Natal Pairs) ──────────────

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
  // Asteroid & point pairs
  'Sun+Chiron': 'leadership wounds and national healing crises',
  'Sun+North Node': 'national destiny and leadership alignment with evolutionary path',
  'Sun+Vesta': 'sacred national purpose and devoted service to the state',
  'Sun+Juno': 'treaty obligations and leadership commitment to alliances',
  'Sun+Ascendant': 'national self-image and how leadership projects identity',
  'Sun+Midheaven': 'executive authority and the nation\'s public standing in the world',
  'Moon+Chiron': 'collective emotional wounds and public healing processes',
  'Moon+North Node': 'popular alignment with national destiny and future direction',
  'Moon+Vesta': 'public devotion and collective service-mindedness',
  'Moon+Juno': 'popular attitudes toward alliances and partnership commitments',
  'Moon+Ascendant': 'public perception and the emotional face of the nation',
  'Moon+Midheaven': 'public mood\'s influence on government authority and reputation',
  'Mercury+Chiron': 'healing through communication and addressing media wounds',
  'Mercury+North Node': 'information pathways aligned with national evolution',
  'Mercury+Vesta': 'dedicated intellectual pursuit and focused communication strategy',
  'Mercury+Juno': 'trade agreements and communication within alliances',
  'Venus+Chiron': 'economic vulnerabilities and diplomatic wounds requiring healing',
  'Venus+North Node': 'financial and diplomatic alignment with national destiny',
  'Venus+Vesta': 'sacred economic values and devoted cultural stewardship',
  'Venus+Juno': 'alliance economics and partnership-based diplomacy',
  'Mars+Chiron': 'military wounds, veteran affairs, and healing through action',
  'Mars+North Node': 'assertive pursuit of national destiny and strategic direction',
  'Mars+Vesta': 'militant dedication and focused military commitment',
  'Mars+Juno': 'competitive alliances and assertiveness in partnerships',
  'Jupiter+Chiron': 'healing through expansion and philosophical growth past wounds',
  'Jupiter+North Node': 'growth opportunities aligned with national destiny',
  'Jupiter+Vesta': 'expansive devotion and growth through dedicated service',
  'Jupiter+Juno': 'prosperous alliances and expanding treaty networks',
  'Saturn+Chiron': 'structural wounds in institutions and disciplined healing processes',
  'Saturn+North Node': 'karmic accountability and structural alignment with destiny',
  'Saturn+Vesta': 'disciplined service and institutional dedication',
  'Saturn+Juno': 'formal alliance obligations and structured partnership commitments',
  'Uranus+Chiron': 'revolutionary healing and sudden breakthroughs in addressing wounds',
  'Uranus+North Node': 'innovative disruption aligned with evolutionary direction',
  'Neptune+Chiron': 'collective healing through compassion or confusion around wounds',
  'Neptune+North Node': 'spiritual alignment with national destiny or ideological drift',
  'Pluto+Chiron': 'transformative healing of the deepest national wounds',
  'Pluto+North Node': 'powerful evolutionary pressure pushing the nation toward its destiny',
  'Chiron+North Node': 'the nation\'s wounds and healing journey are karmically linked',
  'Chiron+Vesta': 'wounded service traditions and healing through renewed dedication',
  'Chiron+Juno': 'partnership wounds and healing through committed alliances',
  'Vesta+Juno': 'devoted partnership and sacred alliance commitments',
  'Vesta+North Node': 'dedicated service aligned with national evolutionary purpose',
  'Juno+North Node': 'fated alliances and treaty commitments tied to national destiny',
  'Ascendant+Midheaven': 'national self-image and governmental authority in direct interplay',
  'Ascendant+North Node': 'the nation\'s projected identity aligns with its evolutionary path',
  'Midheaven+North Node': 'governmental direction and national destiny converge',
};

const MIDPOINT_SECTOR_IMPACT: Record<number, string> = {
  1: 'directly shapes how the nation defines itself and is perceived by its own people',
  2: 'channels into fiscal policy, revenue generation, and the national treasury',
  3: 'influences media narratives, trade routes, and how information flows domestically',
  4: 'grounds into territorial concerns, housing, agriculture, and homeland foundations',
  5: 'expresses through cultural output, entertainment, national creativity, and demographic trends',
  6: 'manifests in public health, labor conditions, military readiness, and civil service',
  7: 'activates diplomatic relationships, treaty dynamics, and foreign alliance pressures',
  8: 'targets debt structures, foreign investment, shared resources, and crisis mechanisms',
  9: 'shapes judicial philosophy, higher education, immigration stance, and international law',
  10: 'bears directly on executive authority, governmental reputation, and leadership decisions',
  11: 'feeds into parliamentary agendas, legislative reform, and the nation\'s collective aspirations',
  12: 'operates through hidden institutional forces, intelligence networks, and behind-the-scenes power',
};

function midpointInterpretation(m: MidpointEntry): string {
  const pairKey = `${m.pair[0]}+${m.pair[1]}`;
  const reversePairKey = `${m.pair[1]}+${m.pair[0]}`;
  const pairTheme = MIDPOINT_PAIR_THEMES[pairKey] || MIDPOINT_PAIR_THEMES[reversePairKey];
  const sector = HOUSE_KEYWORDS[m.house] || 'national affairs';
  const impact = MIDPOINT_SECTOR_IMPACT[m.house] || `activates the ${sector.toLowerCase()} sector`;
  const themeA = PLANET_THEMES[m.pair[0]] || m.pair[0].toLowerCase();
  const themeB = PLANET_THEMES[m.pair[1]] || m.pair[1].toLowerCase();
  const signFlavor = SIGN_MIDPOINT_FLAVOR[m.sign] || `in ${m.sign}`;
  const variant = pairHash(m.pair[0], m.pair[1]) % 4;

  if (pairTheme) {
    switch (variant) {
      case 0:
        return `The ${m.pair[0]}/${m.pair[1]} midpoint at ${m.degree.toFixed(0)}° ${m.sign} channels ${pairTheme} ${signFlavor}. This degree ${impact}. When transited, both themes ignite simultaneously.`;
      case 1:
        return `At ${m.degree.toFixed(0)}° ${m.sign}, ${themeA} intersects ${themeB}, concentrating ${pairTheme} in the ${sector.toLowerCase()} sector. This point ${impact} — transits here activate both archetypes at once.`;
      case 2:
        return `Where ${m.pair[0]} and ${m.pair[1]} converge, ${pairTheme} crystallizes at ${m.degree.toFixed(0)}° ${m.sign}. Expressing ${signFlavor}, this sensitive axis ${impact}.`;
      default:
        return `${pairTheme.charAt(0).toUpperCase() + pairTheme.slice(1)} — that is the signature of ${m.degree.toFixed(0)}° ${m.sign}, where ${themeA} fuses with ${themeB}. This degree ${impact}, and any transit crossing it triggers both energies.`;
    }
  }
  switch (variant) {
    case 0:
      return `The intersection of ${themeA} and ${themeB} sensitizes ${m.degree.toFixed(0)}° ${m.sign}. Operating ${signFlavor}, this point ${impact}. Transits here activate a potent dual signal.`;
    case 1:
      return `At ${m.degree.toFixed(0)}° ${m.sign}, ${m.pair[0]}'s domain of ${themeA} merges with ${m.pair[1]}'s sphere of ${themeB}. This degree ${impact} and responds sharply when transited.`;
    case 2:
      return `${themeA.charAt(0).toUpperCase() + themeA.slice(1)} collides with ${themeB} at ${m.degree.toFixed(0)}° ${m.sign}, creating a pressure point that ${impact}. Both themes fire when this degree is activated.`;
    default:
      return `This midpoint concentrates ${themeA} alongside ${themeB} at ${m.degree.toFixed(0)}° ${m.sign}, expressing ${signFlavor}. It ${impact} — a latent trigger awaiting transit contact.`;
  }
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

const PROG_RATES: Record<string, number> = {
  Sun: 1.0, Moon: 13.0, Mercury: 1.2, Venus: 1.0, Mars: 0.5,
  Jupiter: 0.08, Saturn: 0.03, Uranus: 0.01, Neptune: 0.005, Pluto: 0.004,
};

function progTimeContext(planet: string, degree: number): string {
  const rate = PROG_RATES[planet];
  if (!rate || rate < 0.01) return '';
  const remaining = 30 - degree;
  const yearsLeft = Math.round(remaining / rate);
  if (planet === 'Moon') {
    const monthsLeft = Math.round((remaining / rate) * 12);
    return monthsLeft > 0 ? ` (~${monthsLeft} months until sign change)` : '';
  }
  if (yearsLeft <= 0) return ' (sign change imminent)';
  if (yearsLeft > 200) return '';
  return ` (~${yearsLeft} year${yearsLeft !== 1 ? 's' : ''} until sign change)`;
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
                    <span className="text-amber-400/70">{progTimeContext(p.planet, p.degree)}</span>
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
              const interp = progAspectInterpretation(a);
              return (
                <div key={i} className="rounded-lg bg-white/5 border border-amber-500/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-text-primary text-xs font-medium">{a.prog_planet} {aspect.verb} {a.natal_planet}</span>
                    <span className="text-text-muted text-[10px]">{Math.abs(a.orb).toFixed(1)}° · {aspect.name}</span>
                  </div>
                  <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">{interp}</p>
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

function ConvergencePanel({ hotspots, allHouses, transitHits, midpoints, progressions }: {
  hotspots: HouseEvidence[];
  allHouses: HouseEvidence[];
  transitHits: TransitHit[];
  midpoints: MidpointEntry[];
  progressions: ProgPlanet[];
}) {
  const [expandedHouse, setExpandedHouse] = useState<number | null>(null);

  return (
    <div className="card bg-gradient-to-br from-red-500/5 to-transparent space-y-4">
      <div>
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-400" />
          Where Pressure Is Building
        </h2>
        <p className="text-text-muted text-[10px] mt-0.5">
          Sectors where transits, midpoints, and progressions converge — tap any sector to see the specific indicators
        </p>
      </div>

      <div className="space-y-2">
        {hotspots.map(h => {
          const level = convergenceLevel(h.sourceCount);
          const sector = HOUSE_KEYWORDS[h.house] || `House ${h.house}`;
          const isExpanded = expandedHouse === h.house;

          const houseTransits = transitHits.filter(t => t.natal_house === h.house);
          const houseMidpoints = midpoints.filter(m => m.house === h.house);
          const houseProgressions = progressions.filter(p => p.house === h.house);

          return (
            <div key={h.house}>
              <button
                onClick={() => setExpandedHouse(isExpanded ? null : h.house)}
                className={`w-full text-left rounded-lg border border-white/10 p-3 transition-colors hover:border-white/20 ${level.bg}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary text-sm font-semibold">{sector}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${level.color}`}>{level.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-[10px]">{h.total} indicators</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
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
              </button>

              {isExpanded && (
                <div className="mt-1 ml-3 border-l-2 border-white/10 pl-3 space-y-3 py-2">
                  {/* Transits in this house */}
                  {houseTransits.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">Transits</p>
                      {houseTransits.map((t, i) => {
                        const aspect = ASPECT_LABELS[t.aspect] || { name: t.aspect, verb: 'aspects', tone: '' };
                        return (
                          <div key={i} className="rounded bg-purple-500/5 border border-purple-500/10 p-2.5">
                            <div className="flex items-center justify-between">
                              <p className="text-text-primary text-xs font-medium">
                                {t.transit_planet} {aspect.verb} {t.natal_planet}
                              </p>
                              <span className="text-text-muted text-[10px]">
                                {Math.abs(t.orb).toFixed(1)}° · {t.is_applying ? '⚡ Building' : 'Fading'}
                              </span>
                            </div>
                            <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                              {transitInterpretation(t)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Midpoints in this house */}
                  {houseMidpoints.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">Midpoints</p>
                      {houseMidpoints.map((m, i) => (
                        <div key={i} className="rounded bg-cyan-500/5 border border-cyan-500/10 p-2.5">
                          <p className="text-text-primary text-xs font-medium">
                            {m.pair[0]} + {m.pair[1]}
                          </p>
                          <p className="text-text-muted text-[10px] mt-0.5">
                            {SIGN_GLYPHS[m.sign] || ''} {m.sign} {m.degree.toFixed(1)}°
                          </p>
                          <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                            {midpointInterpretation(m)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progressions in this house */}
                  {houseProgressions.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">Progressions</p>
                      {houseProgressions.map((p, i) => (
                        <div key={i} className="rounded bg-amber-500/5 border border-amber-500/10 p-2.5">
                          <p className="text-text-primary text-xs font-medium">
                            {p.planet} in {p.sign}
                          </p>
                          <p className="text-text-muted text-[10px] mt-0.5">
                            {SIGN_GLYPHS[p.sign] || ''} {p.degree.toFixed(1)}°
                          </p>
                          <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                            {progressionInterpretation(p)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

// ─── Prediction Synthesis ───────────────────────────────────

function generateHousePrediction(
  house: number,
  houseData: HouseEvidence,
  transitHits: TransitHit[],
  midpoints: MidpointEntry[],
  progressions: ProgPlanet[],
  progAspects: ProgAspect[],
  countryName: string,
): string {
  const sector = HOUSE_KEYWORDS[house] || `House ${house}`;
  const hTransits = transitHits.filter(t => t.natal_house === house);
  const hMidpoints = midpoints.filter(m => m.house === house);
  const hProgs = progressions.filter(p => p.house === house);
  const level = houseData.sourceCount >= 3 ? 'major' : 'significant';

  const parts: string[] = [];

  if (hTransits.length > 0) {
    const applying = hTransits.filter(t => t.is_applying);
    const keyTransit = applying[0] || hTransits[0];
    const aspect = ASPECT_LABELS[keyTransit.aspect] || { verb: 'aspects', tone: '' };
    parts.push(`Transiting ${keyTransit.transit_planet} ${aspect.verb} natal ${keyTransit.natal_planet}${applying.length > 1 ? ` (plus ${applying.length - 1} more building aspects)` : ''} — ${(PLANET_THEMES[keyTransit.transit_planet] || 'planetary energy')} directly activates this sector.`);
  }

  if (hMidpoints.length > 0) {
    const mp = hMidpoints[0];
    const theme = MIDPOINT_PAIR_THEMES[`${mp.pair[0]}+${mp.pair[1]}`] || MIDPOINT_PAIR_THEMES[`${mp.pair[1]}+${mp.pair[0]}`] || 'sensitive planetary energies';
    parts.push(`The ${mp.pair[0]}/${mp.pair[1]} midpoint (${theme}) falls here at ${mp.degree.toFixed(0)}° ${mp.sign}${hMidpoints.length > 1 ? `, alongside ${hMidpoints.length - 1} more active midpoint${hMidpoints.length > 2 ? 's' : ''}` : ''}.`);
  }

  if (hProgs.length > 0) {
    const pp = hProgs[0];
    parts.push(`Progressed ${pp.planet} in ${pp.sign} anchors a long-term evolutionary theme in this domain.`);
  }

  const tightAspects = progAspects.filter(a => Math.abs(a.orb) < 1.0);
  if (tightAspects.length > 0) {
    const ta = tightAspects[0];
    const verb = ASPECT_LABELS[ta.aspect]?.verb || 'aspects';
    parts.push(`Progressed ${ta.prog_planet} ${verb} natal ${ta.natal_planet} (${Math.abs(ta.orb).toFixed(1)}° orb) adds a slow-burn developmental trigger.`);
  }

  const predictions: Record<number, string> = {
    1: `Expect shifts in national identity and how ${countryName} presents itself on the world stage. Public self-image and demographic trends are in flux.`,
    2: `Watch for economic policy changes, currency volatility, or shifts in national revenue priorities for ${countryName}. Treasury and fiscal matters demand attention.`,
    3: `Media narratives, communication infrastructure, and trade routes face disruption or transformation in ${countryName}. Misinformation risk is elevated.`,
    4: `Domestic conditions — housing, land disputes, agricultural policy, or homeland security — intensify in ${countryName}. Deep roots are being tested.`,
    5: `Cultural production, entertainment policy, sports, and national creativity see major shifts. ${countryName}'s cultural exports and birth rate trends are highlighted.`,
    6: `Public health, labor conditions, military readiness, and civil service in ${countryName} face pressure. Workforce dynamics are shifting.`,
    7: `Foreign alliances, treaties, and diplomatic relationships come under pressure for ${countryName}. Expect renegotiations, new partnerships, or diplomatic standoffs.`,
    8: `Debt obligations, foreign investment, shared resources, and crisis management in ${countryName} face a reckoning. Structural financial reform is likely.`,
    9: `Judicial rulings, international law, higher education, and ideological direction shift for ${countryName}. Immigration and religious policy may be affected.`,
    10: `Government leadership, executive authority, and the ruling administration in ${countryName} face defining moments. Power dynamics are being restructured.`,
    11: `Parliamentary dynamics, legislative agendas, and the nation's collective aspirations are activated. Coalition politics and reform movements gain momentum in ${countryName}.`,
    12: `Intelligence agencies, hidden institutional dynamics, and behind-the-scenes power plays intensify in ${countryName}. What is concealed may surface.`,
  };

  const forecast = predictions[house] || `The ${sector.toLowerCase()} sector faces ${level} pressure from multiple astrological techniques converging simultaneously.`;

  return parts.join(' ') + ' ' + forecast;
}

function PredictionPanel({ hotspots, transitHits, midpoints, progressions, progAspects, countryName }: {
  hotspots: HouseEvidence[];
  transitHits: TransitHit[];
  midpoints: MidpointEntry[];
  progressions: ProgPlanet[];
  progAspects: ProgAspect[];
  countryName: string;
}) {
  if (hotspots.length === 0) return null;

  return (
    <div className="card bg-gradient-to-br from-violet-500/10 to-amber-500/5 space-y-4 border-l-4 border-violet-400">
      <div>
        <h2 className="font-semibold text-text-primary flex items-center gap-2 text-base">
          <span className="text-xl">📡</span>
          Astrological Forecast
        </h2>
        <p className="text-text-muted text-[10px] mt-0.5">
          Forward-looking predictions synthesized from transits, midpoints, progressions, and convergence patterns
        </p>
      </div>

      <div className="space-y-3">
        {hotspots.slice(0, 6).map(h => {
          const sector = HOUSE_KEYWORDS[h.house] || `House ${h.house}`;
          const level = convergenceLevel(h.sourceCount);
          const prediction = generateHousePrediction(h.house, h, transitHits, midpoints, progressions, progAspects, countryName);

          return (
            <div key={h.house} className={`rounded-lg border border-white/10 p-4 ${level.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-text-primary text-sm font-bold">{sector}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${level.color}`}>{level.label}</span>
                <span className="text-text-muted text-[10px] ml-auto">{h.total} indicators from {h.sourceCount} techniques</span>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed">
                {prediction}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progressed Aspect Interpretations ─────────────────────

const PROG_ASPECT_THEMES: Record<string, Record<string, string>> = {
  Sun: {
    Moon: 'A shift in the relationship between leadership vision and public sentiment — governmental priorities and popular mood realign.',
    Mercury: 'National communication strategy evolves. Official messaging takes on a new character, reshaping diplomatic discourse.',
    Venus: 'The nation\'s identity and diplomatic posture harmonize or clash — alliances and cultural values undergo recalibration.',
    Mars: 'Executive will meets military or assertive energy. A turning point in how the nation projects force and takes decisive action.',
    Jupiter: 'National ambition expands into a new phase. Growth opportunities in governance, ideology, or international standing emerge.',
    Saturn: 'Leadership meets structural accountability. A period of maturation where governance is tested against institutional reality.',
    Uranus: 'Sudden shifts in national direction. Innovation disrupts established leadership patterns — expect the unexpected in governance.',
    Neptune: 'National identity enters a period of idealism or confusion. Boundaries between vision and delusion blur in leadership.',
    Pluto: 'A profound transformation of national identity and power. Governance structures face existential evolution over years.',
    'North Node': 'The nation\'s leadership aligns with its evolutionary destiny — a defining moment for future direction.',
    Chiron: 'Leadership confronts a deep national wound. Healing is possible but requires acknowledging systemic vulnerabilities.',
  },
  Moon: {
    Mercury: 'Public mood and media narrative shift into a new dynamic. How the populace processes information is changing.',
    Venus: 'Collective emotional values and social harmony evolve. Cultural sentiment and public aesthetics are transforming.',
    Mars: 'Public restlessness meets activist energy. Popular movements and collective assertiveness reach a turning point.',
    Jupiter: 'Optimism swells in the collective psyche. Consumer confidence and public generosity expand — but watch for overreach.',
    Saturn: 'Public mood faces austerity and sobering reality. Collective belt-tightening and diminished expectations set in.',
    Uranus: 'Sudden emotional shifts in the populace — mass awakenings, viral movements, or abrupt changes in public allegiance.',
    Neptune: 'Collective dreams and anxieties intensify. Mass psychology enters a period of heightened sensitivity and idealism.',
    Pluto: 'Deep transformation in the national psyche. Collective trauma processing and fundamental shifts in public power dynamics.',
  },
  Venus: {
    Mars: 'Diplomatic assertiveness and economic competition intensify. Trade negotiations take on a sharper edge.',
    Jupiter: 'Financial prosperity and diplomatic goodwill expand. International trade and cultural exchange flourish.',
    Saturn: 'Fiscal discipline meets diplomatic caution. Austerity measures affect both economics and alliance-building.',
    Neptune: 'Economic illusions or idealized partnerships may mislead. Financial agreements need extra scrutiny.',
    Pluto: 'Deep financial transformation and power shifts in economic relationships. Currency or trade structures face upheaval.',
    'North Node': 'Diplomatic and economic direction aligns with national destiny — new partnerships serve long-term evolution.',
    'South Node': 'Old economic or diplomatic patterns resurface. The nation must decide whether to repeat or release past approaches.',
  },
  Mars: {
    Jupiter: 'Military or executive expansion accelerates. Aggressive growth strategies and bold action define the period.',
    Saturn: 'Military restraint meets institutional friction. Executive force is checked by structural limitations.',
    Uranus: 'Sudden confrontations or technological breakthroughs in defense. Unpredictable disruptions in how the nation acts.',
    Neptune: 'Covert operations and unclear strategic objectives. Military or executive direction is shrouded in confusion.',
    Pluto: 'Power struggles intensify. Existential confrontations in governance or military posture reach critical mass.',
  },
  Jupiter: {
    Saturn: 'The tension between growth and restraint defines national policy. Cautious expansion or constrained ambition marks this era.',
    Uranus: 'Breakthrough opportunities emerge. Radical reform and sudden expansion possibilities challenge the status quo.',
    Neptune: 'Ideological vision meets speculative excess. Grand visions for the nation may be brilliant or dangerously unrealistic.',
    Pluto: 'Transformative ambition reshapes power structures. The nation\'s growth trajectory undergoes fundamental redirection.',
    Sun: 'National ambition aligns with leadership identity — a period of expansive self-confidence in governance.',
  },
  Saturn: {
    Uranus: 'Tradition clashes with innovation. Systemic tension between old institutional frameworks and reform movements.',
    Neptune: 'Institutional foundations face erosion. Governance structures drift as boundaries between reality and ideology blur.',
    Pluto: 'Structural crisis forces transformation. Old power frameworks crumble under pressure from deep evolutionary forces.',
    Venus: 'Fiscal austerity shapes diplomatic relationships. Economic discipline influences the nation\'s cultural and social values.',
  },
  Uranus: {
    Neptune: 'Generational upheaval meets collective idealism. Cultural revolution and societal transformation operate on a civilizational scale.',
    Pluto: 'Revolutionary transformation and systemic overthrow. The deepest structures of power face radical disruption.',
    'North Node': 'The nation\'s reform impulse aligns with its evolutionary path — innovation becomes destiny.',
    'South Node': 'Past revolutionary patterns or reform attempts resurface. The nation revisits unfinished systemic changes.',
  },
};

function progAspectInterpretation(a: ProgAspect): string {
  const pair = PROG_ASPECT_THEMES[a.prog_planet]?.[a.natal_planet]
    || PROG_ASPECT_THEMES[a.natal_planet]?.[a.prog_planet];
  if (pair) return pair;
  const progTheme = PLANET_THEMES[a.prog_planet] || 'evolved planetary energy';
  const natalTheme = PLANET_THEMES[a.natal_planet] || 'foundational planetary energy';
  return `The nation's evolved ${progTheme} engages with its foundational ${natalTheme} — a slow developmental shift with lasting implications.`;
}

// ─── Synastry Aspect Interpretations ───────────────────────

const SYNASTRY_ASPECT_THEMES: Record<string, Record<string, string>> = {
  Sun: {
    Sun: 'Core national identities interact directly — this defines the fundamental power dynamic between both nations.',
    Moon: 'One nation\'s leadership identity resonates with the other\'s public sentiment — emotional bonds or friction in diplomacy.',
    Mercury: 'Leadership-to-communication channel — how well official messaging between the nations is received.',
    Venus: 'Identity meets diplomacy — natural affinity in cultural exchange and values, or clashing national aesthetics.',
    Mars: 'Leadership confronts assertive energy — competition, rivalry, or dynamic partnership in military and executive matters.',
    Jupiter: 'Mutual growth potential — expansive trade, ideological alignment, or competing ambitions on the world stage.',
    Saturn: 'Authority meets restriction — one nation\'s leadership is tested or constrained by the other\'s institutional demands.',
    Uranus: 'Disruption meets identity — one nation brings unexpected change to the other\'s sense of self and governance.',
    Neptune: 'Idealism meets identity — inspiration or deception colors the diplomatic relationship.',
    Pluto: 'Power dynamics define the relationship — transformation, domination, or deep mutual evolution between nations.',
    'North Node': 'Fated connection in leadership — these nations have a karmic trajectory that pushes both toward growth.',
    Chiron: 'One nation\'s identity touches the other\'s deepest vulnerabilities — a relationship that can wound or heal.',
    Juno: 'Treaty and partnership energy — natural alliance-building potential between these nations.',
    Vesta: 'Shared dedication — both nations focus their service and sacred commitments toward similar goals.',
  },
  Moon: {
    Moon: 'Public sentiments resonate — the populations intuitively understand each other, or clash at an emotional level.',
    Venus: 'Cultural affinity — the peoples of both nations share aesthetic values, social customs, and emotional warmth.',
    Mars: 'Popular energy meets assertive force — public opinion in one nation reacts strongly to the other\'s actions.',
    Saturn: 'Emotional caution — the populations approach each other with reserve, duty, or historical grievance.',
    Pluto: 'Deep psychological undercurrents — collective memories, traumas, or transformative experiences bind these nations.',
  },
  Venus: {
    Mars: 'Diplomatic tension with magnetic attraction — trade competition coexists with cultural fascination.',
    Jupiter: 'Economic prosperity through partnership — trade agreements and cultural exchange flourish naturally.',
    Saturn: 'Trade restrictions or cautious economic relations — trust must be earned through institutional channels.',
    Juno: 'Natural treaty partners — diplomatic agreements and formal alliances form with relative ease.',
  },
  Mars: {
    Saturn: 'Military restraint — one nation\'s assertiveness is checked by the other\'s institutional boundaries.',
    Pluto: 'Power confrontation — military and strategic competition at the deepest level.',
    Jupiter: 'Aggressive expansion meets opportunity — trade wars or dynamic economic competition.',
  },
};

function synastryAspectInterpretation(a: SynastryAspect): string {
  const pair = SYNASTRY_ASPECT_THEMES[a.planetA]?.[a.planetB]
    || SYNASTRY_ASPECT_THEMES[a.planetB]?.[a.planetA];
  if (!pair) {
    const ta = PLANET_THEMES[a.planetA] || 'national energy';
    const tb = PLANET_THEMES[a.planetB] || 'national energy';
    return `${ta.charAt(0).toUpperCase() + ta.slice(1)} interacts with ${tb} between these nations.`;
  }
  const tone = a.nature === 'harmonious' ? 'This connection flows constructively.' : a.nature === 'challenging' ? 'This creates friction that demands navigation.' : 'This influence is complex and situational.';
  return `${pair} ${tone}`;
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
            <div key={i} className="rounded bg-white/5 border border-white/5 p-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.nature === 'harmonious' ? 'bg-emerald-400' : a.nature === 'challenging' ? 'bg-red-400' : 'bg-purple-400'}`} />
                <span className="text-text-primary font-medium">{a.planetA}</span>
                <span className={natureColor(a.nature)}>{ASPECT_GLYPHS[a.aspect] || ''}</span>
                <span className="text-text-primary font-medium">{a.planetB}</span>
                <span className="text-text-muted ml-auto">{a.orb}°</span>
                <span className={`${natureColor(a.nature)} capitalize`}>{a.aspect}</span>
              </div>
              <p className="text-text-secondary text-[11px] mt-1.5 leading-relaxed pl-3.5">
                {synastryAspectInterpretation(a)}
              </p>
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
