'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, MapPin, Shield, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
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
      setEvents(eventsData);
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

      {/* ── Transit Stats ────────────────────────────────── */}
      {intel && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Transits"
            value={intel.transits_json?.count || intel.transits_json?.hits?.length || 0}
            sub="active aspects"
            icon="🔭"
          />
          <StatCard
            label="Midpoints"
            value={intel.midpoints_json?.count || intel.midpoints_json?.top?.length || 0}
            sub="active pairs"
            icon="⊕"
          />
          <StatCard
            label="Progressions"
            value={intel.progressions_json?.planets?.length || 0}
            sub="progressed bodies"
            icon="📊"
          />
          <StatCard
            label="Events"
            value={events.length}
            sub="tracked"
            icon="📰"
          />
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
          <div className="space-y-2">
            {events.map((evt) => (
              <div key={evt.id} className="flex items-start gap-2 py-2 border-b border-border-primary/50 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot(evt.severity)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium">{evt.title}</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    {evt.event_date} · {evt.category}
                    {evt.verification_status === 'verified' ? ' ✓' : ''}
                  </p>
                  {evt.summary && (
                    <p className="text-text-secondary text-xs mt-1 line-clamp-2">{evt.summary}</p>
                  )}
                </div>
              </div>
            ))}
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

// ─── Stat Card Component ─────────────────────────────────────

function StatCard({ label, value, sub, icon }: { label: string; value: number; sub: string; icon: string }) {
  return (
    <div className="card text-center">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-text-muted text-[10px] uppercase tracking-wider">{label}</p>
      <p className="text-text-muted text-[10px]">{sub}</p>
    </div>
  );
}
