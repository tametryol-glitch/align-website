'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
  CircleDot, ArrowLeft, ChevronDown, Loader2, Search,
  Copy, Check, Zap, Target, Star, Sparkles, Shield, Heart,
  Flame, Eye, TrendingUp, Filter, X,
} from 'lucide-react';
import { getPlanetGlyph, getZodiacGlyph } from '@/lib/utils';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  calculateAllMidpoints,
  generateMidpointInterpretation,
  buildMidpointAIPrompt,
  findTransitActivations,
  groupByTheme,
  formatDegreeMp,
  MIDPOINT_ESSENCE,
  THEME_CLUSTERS,
  ZODIAC_GLYPHS_MP,
  PLANET_GLYPHS_MP,
  getLon,
} from '@/lib/interpretations';
import type { MidpointResult, TransitActivation } from '@/lib/interpretations';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'all', label: 'All Midpoints', icon: CircleDot },
  { id: 'transits', label: 'Transits', icon: Zap },
  { id: 'themes', label: 'Themes', icon: Heart },
] as const;

type TabId = typeof TABS[number]['id'];

const THEME_ICONS: Record<string, typeof Heart> = {
  love: Heart, career: TrendingUp, healing: Shield, power: Flame, identity: Star, spiritual: Eye,
};

export default function MidpointsPage() {
  const { profile } = useAuthStore();
  const [midpoints, setMidpoints] = useState<MidpointResult[]>([]);
  const [transitActivations, setTransitActivations] = useState<TransitActivation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabId>('overview');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [expandedTransits, setExpandedTransits] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTheme, setFilterTheme] = useState<string | null>(null);
  const [aiReading, setAiReading] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hasBirthData = !!(profile?.birth_date && profile?.latitude);
  const firstName = (profile?.display_name || '').split(' ')[0] || 'you';

  const loadMidpoints = useCallback(async () => {
    if (!hasBirthData) return;
    setLoading(true);
    setError('');
    try {
      const birthData = buildBirthData(profile!);
      const [chart, transits] = await Promise.all([
        api.getNatalChart(birthData),
        api.getCurrentTransits(birthData).catch(() => null),
      ]);

      const positions = chart?.planets || chart?.positions || [];
      const ascP = positions.find((p: any) => ['ASC', 'Ascendant', 'AC'].includes(p.name || p.planet));
      const ascLon = ascP?.longitude ?? 0;

      const allMp = calculateAllMidpoints(positions, ascLon);
      setMidpoints(allMp);

      if (transits) {
        const transitPos = transits?.transit_positions || transits?.planets || transits?.positions || [];
        const activations = findTransitActivations(allMp, transitPos);
        setTransitActivations(activations);
      }

      const top3Keys = allMp.slice(0, 3).map((mp, i) => `${mp.key}-${i}`);
      setExpandedKeys(new Set(top3Keys));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hasBirthData, profile]);

  const [aiFailed, setAiFailed] = useState(false);

  useEffect(() => {
    if (midpoints.length > 0 && !aiReading && !aiLoading && !aiFailed) {
      setAiLoading(true);
      const prompt = buildMidpointAIPrompt(midpoints, firstName);
      let text = '';
      api.streamAIInterpretation(
        {
          chart_data_text: prompt + '\n\nIMPORTANT: All midpoint data above is already calculated. Do NOT ask for birth data — write the reading directly.',
        },
        (chunk: string) => { text += chunk; setAiReading(text); },
        () => setAiLoading(false),
      ).catch((err) => {
        console.error('[Midpoints] AI synthesis error:', err);
        setAiLoading(false);
        setAiFailed(true);
      });
    }
  }, [midpoints.length]);

  const top10 = useMemo(() => midpoints.slice(0, 10), [midpoints]);
  const strengthTop5 = useMemo(
    () => [...midpoints].sort((a, b) => b.strengthScore - a.strengthScore).slice(0, 5),
    [midpoints]
  );
  const themeGroups = useMemo(() => groupByTheme(midpoints), [midpoints]);

  const filteredMidpoints = useMemo(() => {
    let list = midpoints;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(mp =>
        mp.body1.toLowerCase().includes(q) ||
        mp.body2.toLowerCase().includes(q) ||
        mp.key.toLowerCase().includes(q) ||
        mp.sign.toLowerCase().includes(q) ||
        (MIDPOINT_ESSENCE[mp.key]?.title || '').toLowerCase().includes(q)
      );
    }
    if (filterTheme) {
      list = list.filter(mp => mp.themes.includes(filterTheme));
    }
    return list;
  }, [midpoints, searchQuery, filterTheme]);

  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const copyText = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const heroMp = midpoints[0];
  const heroEssence = heroMp ? MIDPOINT_ESSENCE[heroMp.key] : null;

  if (!hasBirthData) {
    return <BirthDataPrompt message="Add your birth data to calculate your midpoint trees." />;
  }

  if (!midpoints.length && !loading) {
    return (
      <PaywallGate feature="midpoints">
        <div className="max-w-3xl mx-auto">
          <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Readings
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <CircleDot className="w-8 h-8 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-display font-bold text-text-primary">Midpoints</h1>
              <p className="text-text-tertiary text-sm">Sensitive points where planetary energies merge</p>
            </div>
          </div>
          <div className="card text-center py-12">
            <span className="text-5xl block mb-4">⊕</span>
            <p className="text-text-tertiary mb-2 max-w-md mx-auto">
              Midpoints are the invisible fusion points between every pair of celestial bodies in your chart. Each creates a new psychological force that neither planet produces alone.
            </p>
            <p className="text-text-muted text-sm mb-6">20 celestial bodies. 190 midpoints. 7-layer interpretation per midpoint.</p>
            <button onClick={loadMidpoints} disabled={loading} className="btn-primary">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Calculating...</> : 'Calculate My Midpoints'}
            </button>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </div>
        </div>
      </PaywallGate>
    );
  }

  if (loading) {
    return <LoadingCosmic label="Calculating 190 midpoints with full interpretation layers..." />;
  }

  return (
    <PaywallGate feature="midpoints">
      <div className="max-w-4xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Readings
        </Link>

        {/* ── Hero Card: Most Powerful Midpoint ── */}
        {heroMp && (
          <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted mb-6">
            <p className="text-accent-tertiary text-xs font-medium uppercase tracking-widest mb-2">Your Most Powerful Midpoint</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{PLANET_GLYPHS_MP[heroMp.body1]}/{PLANET_GLYPHS_MP[heroMp.body2]}</span>
              <div>
                <h2 className="text-xl font-display font-bold text-text-primary">
                  {heroEssence?.title || heroMp.key}
                </h2>
                <p className="text-text-muted text-sm">
                  {ZODIAC_GLYPHS_MP[heroMp.sign]} {heroMp.sign} {formatDegreeMp(heroMp.degreeInSign)} — House {heroMp.house}
                </p>
              </div>
              <div className="ml-auto text-center">
                <div className="text-2xl font-bold text-accent-primary">{heroMp.strengthScore}</div>
                <div className="text-[10px] text-text-muted uppercase">Strength</div>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {firstName}, {heroEssence?.essence || `this is where ${heroMp.body1} and ${heroMp.body2} merge into your most defining psychological force.`}
            </p>
            {heroMp.aspects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {heroMp.aspects.map((asp, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-accent-muted text-accent-secondary">
                    {PLANET_GLYPHS_MP[asp.body] || asp.body} {asp.aspectType.slice(0, 3)} {asp.orb}°
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Strength Top 5 Bar ── */}
        <div className="card mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-text-muted mb-3">Midpoint Strength Score — Top 5</p>
          <div className="space-y-2">
            {strengthTop5.map((mp, i) => {
              const pct = Math.round((mp.strengthScore / 20) * 100);
              const essence = MIDPOINT_ESSENCE[mp.key];
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-accent-secondary w-12 text-center">
                    {PLANET_GLYPHS_MP[mp.body1]}/{PLANET_GLYPHS_MP[mp.body2]}
                  </span>
                  <span className="text-xs text-text-secondary w-32 truncate">{essence?.title || mp.key}</span>
                  <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent-primary to-purple-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-text-muted w-8 text-right">{mp.strengthScore}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 mb-6 bg-bg-secondary rounded-xl p-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* AI Synthesis */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent-primary" />
                <h3 className="font-semibold text-text-primary">Your Midpoint Signature</h3>
                {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-primary ml-auto" />}
              </div>
              {aiReading ? (
                <div className="relative">
                  <button
                    onClick={() => copyText(aiReading, 'ai')}
                    className="absolute top-0 right-0 p-1.5 text-text-muted hover:text-text-primary"
                  >
                    {copiedId === 'ai' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <div className="text-sm text-text-secondary leading-relaxed pr-8 space-y-3
                    [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:mb-2
                    [&_strong]:text-text-primary [&_strong]:font-semibold">
                    {aiReading.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
                      if (line.trim() === '') return null;
                      return <p key={i}><RenderBold text={line} /></p>;
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">
                  {aiLoading ? 'Writing your personalized midpoint synthesis...' : 'AI synthesis will generate when midpoints load.'}
                </p>
              )}
            </div>

            {/* Key Midpoints (top 10) */}
            <div>
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Top 10 Key Midpoints
              </h3>
              <div className="space-y-3">
                {top10.map((mp, idx) => {
                  const uniqueKey = `${mp.key}-${idx}`;
                  return (
                    <MidpointCard
                      key={uniqueKey}
                      mp={mp}
                      rank={idx + 1}
                      expanded={expandedKeys.has(uniqueKey)}
                      onToggle={() => toggleExpand(uniqueKey)}
                      firstName={firstName}
                      copiedId={copiedId}
                      onCopy={copyText}
                    />
                  );
                })}
              </div>
            </div>

            {/* Theme Summary */}
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-3">Theme Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(THEME_CLUSTERS).map(([key, cluster]) => {
                  const count = themeGroups[key]?.length || 0;
                  const Icon = THEME_ICONS[key] || Star;
                  return (
                    <button
                      key={key}
                      onClick={() => { setFilterTheme(key); setTab('all'); }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-bg-tertiary hover:bg-bg-secondary transition-all text-left"
                    >
                      <span className="text-lg">{cluster.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{cluster.label}</div>
                        <div className="text-xs text-text-muted">{count} midpoints</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ALL MIDPOINTS TAB ── */}
        {tab === 'all' && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by planet, sign, or title..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={filterTheme || ''}
                  onChange={e => setFilterTheme(e.target.value || null)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="">All Themes</option>
                  {Object.entries(THEME_CLUSTERS).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>

            <p className="text-xs text-text-muted">
              Showing {filteredMidpoints.length} of {midpoints.length} midpoints
              {filterTheme && <> in <span className="text-accent-secondary">{THEME_CLUSTERS[filterTheme]?.label}</span></>}
            </p>

            <div className="space-y-2">
              {filteredMidpoints.map((mp, idx) => {
                const realIdx = midpoints.indexOf(mp);
                const uniqueKey = `${mp.key}-${realIdx}`;
                return (
                  <MidpointCard
                    key={uniqueKey}
                    mp={mp}
                    rank={realIdx < 10 ? realIdx + 1 : undefined}
                    expanded={expandedKeys.has(uniqueKey)}
                    onToggle={() => toggleExpand(uniqueKey)}
                    firstName={firstName}
                    compact={realIdx >= 10}
                    copiedId={copiedId}
                    onCopy={copyText}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── TRANSITS TAB ── */}
        {tab === 'transits' && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-text-primary">Current Transit Activations</h3>
              </div>
              <p className="text-xs text-text-muted mb-4">
                Planets currently hitting your midpoints — these are the ones activated right now.
              </p>
              {transitActivations.length === 0 ? (
                <p className="text-sm text-text-muted italic py-4 text-center">
                  No current transit data available. Transit activations appear when we can calculate current planetary positions against your midpoints.
                </p>
              ) : (
                <div className="space-y-3">
                  {transitActivations.map((ta, i) => {
                    const isOpen = expandedTransits.has(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setExpandedTransits(prev => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i); else next.add(i);
                          return next;
                        })}
                        className={`w-full text-left rounded-xl p-4 border transition-colors cursor-pointer ${
                          ta.intensity === 'high' ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10' :
                          ta.intensity === 'medium' ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10' :
                          'border-border-primary bg-bg-tertiary hover:bg-bg-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{PLANET_GLYPHS_MP[ta.transitPlanet] || ta.transitPlanet}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary">
                              {ta.transitPlanet} {ta.aspectType} {ta.midpointTitle}
                            </div>
                            <div className="text-xs text-text-muted">
                              {ta.midpointKey} — orb {ta.orb}°
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            ta.intensity === 'high' ? 'bg-red-500/20 text-red-400' :
                            ta.intensity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {ta.intensity}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                        {isOpen && (
                          <p className="text-sm text-text-secondary mt-3 leading-relaxed">{ta.meaning}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Midpoints Summary */}
            {transitActivations.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-text-primary mb-3">Activation Summary</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="text-xl font-bold text-red-400">
                      {transitActivations.filter(t => t.intensity === 'high').length}
                    </div>
                    <div className="text-[10px] text-text-muted uppercase">High Intensity</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="text-xl font-bold text-amber-400">
                      {transitActivations.filter(t => t.intensity === 'medium').length}
                    </div>
                    <div className="text-[10px] text-text-muted uppercase">Medium</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="text-xl font-bold text-blue-400">
                      {transitActivations.filter(t => t.intensity === 'low').length}
                    </div>
                    <div className="text-[10px] text-text-muted uppercase">Low</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── THEMES TAB ── */}
        {tab === 'themes' && (
          <div className="space-y-6">
            {Object.entries(THEME_CLUSTERS).map(([key, cluster]) => {
              const clusterMps = themeGroups[key] || [];
              if (clusterMps.length === 0) return null;
              const topInCluster = clusterMps.slice(0, 5);
              const avgStrength = clusterMps.length > 0
                ? Math.round(clusterMps.reduce((sum, m) => sum + m.strengthScore, 0) / clusterMps.length)
                : 0;
              const activatedCount = clusterMps.filter(m => m.aspects.length > 0).length;

              return (
                <div key={key} className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{cluster.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">{cluster.label}</h3>
                      <p className="text-xs text-text-muted">
                        {clusterMps.length} midpoints — avg strength {avgStrength}/20 — {activatedCount} activated
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {topInCluster.map((mp, idx) => {
                      const realIdx = midpoints.indexOf(mp);
                      const uniqueKey = `theme-${key}-${mp.key}-${realIdx}`;
                      return (
                        <MidpointCard
                          key={uniqueKey}
                          mp={mp}
                          expanded={expandedKeys.has(uniqueKey)}
                          onToggle={() => toggleExpand(uniqueKey)}
                          firstName={firstName}
                          compact
                          copiedId={copiedId}
                          onCopy={copyText}
                        />
                      );
                    })}
                    {clusterMps.length > 5 && (
                      <button
                        onClick={() => { setFilterTheme(key); setTab('all'); }}
                        className="w-full text-center text-xs text-accent-secondary hover:text-accent-primary py-2"
                      >
                        View all {clusterMps.length} {cluster.label} midpoints →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recalculate */}
        <button
          onClick={() => { setMidpoints([]); setAiReading(''); setAiFailed(false); setTransitActivations([]); setTab('overview'); loadMidpoints(); }}
          className="btn-secondary w-full mt-8"
        >
          Recalculate Midpoints
        </button>
      </div>
    </PaywallGate>
  );
}

// ─── Midpoint Card Component ────────────────────────────────────────────────
function MidpointCard({
  mp, rank, expanded, onToggle, firstName, compact, copiedId, onCopy,
}: {
  mp: MidpointResult;
  rank?: number;
  expanded: boolean;
  onToggle: () => void;
  firstName: string;
  compact?: boolean;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const essence = MIDPOINT_ESSENCE[mp.key];
  const interpText = generateMidpointInterpretation(mp, firstName);
  const pct = Math.round((mp.strengthScore / 20) * 100);

  return (
    <div
      className={`rounded-xl border transition-all cursor-pointer ${
        compact
          ? 'border-border-primary bg-bg-card hover:bg-bg-secondary'
          : 'border-accent-muted bg-gradient-cosmic'
      }`}
      onClick={onToggle}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 ${compact ? 'px-4 py-3' : 'p-4'}`}>
        <span className={`${compact ? 'text-base' : 'text-xl'} text-accent-secondary`}>
          {PLANET_GLYPHS_MP[mp.body1] || mp.body1}/{PLANET_GLYPHS_MP[mp.body2] || mp.body2}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-text-primary truncate`}>
              {essence?.title || mp.key}
            </span>
            {rank && (
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded">#{rank}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{ZODIAC_GLYPHS_MP[mp.sign]} {mp.sign} {formatDegreeMp(mp.degreeInSign)}</span>
            <span>H{mp.house}</span>
            {!compact && (
              <>
                <span className="text-text-muted/50">·</span>
                <span>Hidden: {ZODIAC_GLYPHS_MP[mp.duadSign]} {mp.duadSign}</span>
                <span className="text-text-muted/50">·</span>
                <span>Deep: {ZODIAC_GLYPHS_MP[mp.compendiumSign]} {mp.compendiumSign}</span>
              </>
            )}
          </div>
        </div>

        {/* Strength bar */}
        <div className="flex flex-col items-end gap-1">
          <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-accent-primary" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-text-muted">{mp.strengthScore}/20</span>
        </div>

        {/* Aspect count */}
        {mp.aspects.length > 0 && (
          <span className="text-[10px] font-bold bg-accent-muted text-accent-secondary rounded-full w-5 h-5 flex items-center justify-center">
            {mp.aspects.length}
          </span>
        )}

        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border-primary/50 pt-3" onClick={e => e.stopPropagation()}>
          {/* Position chips */}
          {compact && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary">
                Hidden: {ZODIAC_GLYPHS_MP[mp.duadSign]} {mp.duadSign}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary">
                Deep: {ZODIAC_GLYPHS_MP[mp.compendiumSign]} {mp.compendiumSign}
              </span>
            </div>
          )}

          {/* Aspect badges */}
          {mp.aspects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {mp.aspects.map((asp, i) => (
                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  asp.aspectType === 'Conjunction' ? 'border-yellow-500/40 text-yellow-400' :
                  asp.aspectType === 'Square' ? 'border-red-500/40 text-red-400' :
                  asp.aspectType === 'Opposition' ? 'border-orange-500/40 text-orange-400' :
                  'border-purple-500/40 text-purple-400'
                }`}>
                  {PLANET_GLYPHS_MP[asp.body] || asp.body} {asp.aspectType} ({asp.orb}°)
                </span>
              ))}
            </div>
          )}

          {/* Theme tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {mp.themes.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-bg-secondary text-text-muted">
                {THEME_CLUSTERS[t]?.icon} {THEME_CLUSTERS[t]?.label}
              </span>
            ))}
          </div>

          {/* Full interpretation */}
          <div className="relative">
            <button
              onClick={() => onCopy(interpText, mp.key)}
              className="absolute top-0 right-0 p-1 text-text-muted hover:text-text-primary z-10"
            >
              {copiedId === mp.key ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <div className="text-sm text-text-secondary leading-relaxed pr-6 whitespace-pre-wrap prose prose-invert prose-sm max-w-none
              [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:mt-0 [&_h2]:mb-2
              [&_strong]:text-text-primary [&_strong]:font-semibold
              [&_hr]:border-border-primary [&_hr]:my-3
              [&_ul]:list-disc [&_ul]:pl-4 [&_li]:text-text-secondary">
              {interpText.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
                if (line.startsWith('- ')) return <p key={i} className="pl-3 text-xs"><RenderBold text={line} /></p>;
                if (line === '---') return <hr key={i} />;
                if (line.trim() === '') return null;
                return <p key={i} className="mb-1"><RenderBold text={line} /></p>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RenderBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}
