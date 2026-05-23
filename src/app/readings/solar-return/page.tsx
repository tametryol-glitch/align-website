'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
  Sun, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Loader2,
  Copy, Check, Zap, Calendar, ArrowRightLeft, Target, AlertTriangle,
  Clock, TrendingUp, Sparkles, Star, Shield, Eye,
} from 'lucide-react';
import { getPlanetGlyph, getZodiacGlyph } from '@/lib/utils';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { NatalWheel } from '@/components/charts/NatalWheel';
import {
  generateSolarReturnPrediction, getPlacementInterpretation,
  YEAR_THEME_HEADLINES, getCriticalAspects, getAngleInterpretation,
  RETROGRADE_SR_MEANINGS, buildNatalComparisons, generateMonthlyTimeline,
  getYearPattern,
} from '@/lib/interpretations';
import type { SRAspectInterp, NatalComparison, SRMonthData, YearPattern } from '@/lib/interpretations';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SolarReturnPosition {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
  house?: number;
  retrograde?: boolean;
}

interface SolarReturnData {
  planets: SolarReturnPosition[];
  aspects: { planet1: string; planet2: string; type: string; orb: number }[];
  ascendant_degree?: number;
  ascendant_sign?: string;
  sun_house?: number;
  moon_sign?: string;
  moon_house?: number;
  planets_on_angles?: { planet: string; angle: string; orb: number }[];
  house_cusps?: number[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
}

function getSolarReturnInterp(name: string, sign: string, house?: number): string {
  const base = getPlacementInterpretation(name, sign, house ?? 0);
  if (!base) return '';
  const srContext: Record<string, string> = {
    'Sun': `This year, your core energy and identity are expressed through ${sign} themes.`,
    'Moon': `Your emotional landscape this year is shaped by ${sign} energy.`,
    'Mercury': `Communication and thinking this year take on a ${sign} quality.`,
    'Venus': `Love, money, and relationships this year are colored by ${sign}.`,
    'Mars': `Your drive and ambition this year are fueled by ${sign} energy.`,
    'Jupiter': `Expansion and opportunity this year come through ${sign} themes.`,
    'Saturn': `This year's lessons and responsibilities involve ${sign} themes.`,
    'Uranus': `Unexpected changes this year relate to ${sign} areas of life.`,
    'Neptune': `Dreams and spiritual growth this year are shaped by ${sign}.`,
    'Pluto': `Deep transformation this year comes through ${sign} energy.`,
  };
  const prefix = srContext[name] || `In this solar return, ${name} in ${sign} highlights a key theme for the year.`;
  return `${prefix} ${base}`;
}

function getBirthMonth(profile: any): number {
  const d = profile?.birth_date;
  if (!d) return 0;
  const m = new Date(d).getMonth();
  return isNaN(m) ? 0 : m;
}

// ─── Copy Button ────────────────────────────────────────────────────────────

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-text-secondary transition-colors mt-1"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? (label || 'Copied') : 'Copy'}
    </button>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { elements.push(<div key={key++} className="h-2" />); continue; }
    if (trimmed === '---') { elements.push(<hr key={key++} className="border-accent-primary/30 my-4" />); continue; }
    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-lg font-bold text-text-primary mt-2 mb-1">{trimmed.replace(/^## /, '').replace(/\*\*/g, '')}</h2>);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-sm font-semibold mt-4 mb-1.5" style={{ color: '#C4B5FD' }}>{trimmed.replace(/^### /, '').replace(/\*\*/g, '')}</h3>);
      continue;
    }
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
    const styledParts = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>;
      return <span key={i}>{part}</span>;
    });
    elements.push(<p key={key++} className="text-sm text-text-secondary leading-relaxed mb-0.5">{styledParts}</p>);
  }
  return <div>{elements}</div>;
}

// ─── Tab Button ──────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-accent-primary/20 text-accent-secondary border border-accent-primary/40' : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SolarReturnPage() {
  const { profile } = useAuthStore();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SolarReturnData | null>(null);
  const [aiReading, setAiReading] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'aspects' | 'chart'>('overview');
  const [expandedAspect, setExpandedAspect] = useState<number | null>(null);
  const [expandedAngle, setExpandedAngle] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [natalPlanets, setNatalPlanets] = useState<Array<{ name: string; sign: string; house?: number }> | null>(null);
  const [lastYearData, setLastYearData] = useState<SolarReturnData | null>(null);
  const [nextYearData, setNextYearData] = useState<SolarReturnData | null>(null);

  const hasBirthData = profile?.birth_date && profile?.latitude;
  const firstName = profile?.display_name?.split(' ')[0] || 'you';
  const birthMonth = getBirthMonth(profile);

  // Load natal chart for comparison
  const loadNatalChart = useCallback(async () => {
    if (!hasBirthData) return;
    try {
      const bd = buildBirthData(profile!);
      const natal = await api.getNatalChart(bd);
      if (natal?.positions) {
        setNatalPlanets(natal.positions.map((p: any) => ({
          name: p.name,
          sign: p.sign || SIGNS[Math.floor(p.longitude / 30)],
          house: p.house,
        })));
      }
    } catch {}
  }, [profile, hasBirthData]);

  useEffect(() => { loadNatalChart(); }, [loadNatalChart]);

  const loadData = useCallback(async () => {
    if (!hasBirthData) {
      setError('Birth data is required. Please set up your chart first.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const birthData = buildBirthData(profile!);

      const [result, prevResult, nextResult] = await Promise.all([
        api.getSolarReturn({ birth_data: birthData, year, house_system: birthData.house_system }),
        api.getSolarReturn({ birth_data: birthData, year: year - 1, house_system: birthData.house_system }).catch(() => null),
        api.getSolarReturn({ birth_data: birthData, year: year + 1, house_system: birthData.house_system }).catch(() => null),
      ]);

      const parseResult = (r: any): SolarReturnData | null => {
        if (!r) return null;
        if (r.positions) {
          const planets = r.positions.map((p: any) => ({
            name: p.name,
            sign: p.sign || SIGNS[Math.floor(p.longitude / 30)],
            degree: p.sign_degree || (p.longitude % 30),
            longitude: p.longitude,
            house: p.house,
            retrograde: p.retrograde || false,
          }));
          return {
            planets,
            aspects: (r.aspects || []).map((a: any) => ({
              planet1: a.body1 || a.planet1, planet2: a.body2 || a.planet2,
              type: a.aspect_name || a.type || a.aspect, orb: a.orb,
            })),
            ascendant_degree: r.house_cusps?.[0],
            ascendant_sign: planets.find((p: any) => p.name === 'Ascendant')?.sign,
            sun_house: planets.find((p: any) => p.name === 'Sun')?.house,
            moon_sign: planets.find((p: any) => p.name === 'Moon')?.sign,
            moon_house: planets.find((p: any) => p.name === 'Moon')?.house,
            planets_on_angles: r.planets_on_angles,
            house_cusps: r.house_cusps,
          };
        }
        return r;
      };

      const parsed = parseResult(result);
      if (parsed) setData(parsed);
      setLastYearData(parseResult(prevResult));
      setNextYearData(parseResult(nextResult));
      setHasLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load solar return chart.');
    } finally {
      setLoading(false);
    }
  }, [profile, year, hasBirthData]);

  // Derived data
  const yearTheme = useMemo(() => data?.sun_house ? YEAR_THEME_HEADLINES[data.sun_house] : null, [data]);

  const criticalAspects = useMemo(() => data?.aspects ? getCriticalAspects(data.aspects) : [], [data]);

  const natalComparisons = useMemo(() => {
    if (!natalPlanets || !data?.planets) return [];
    return buildNatalComparisons(natalPlanets, data.planets);
  }, [natalPlanets, data]);

  const monthlyTimeline = useMemo(() => {
    if (!data?.planets) return [];
    return generateMonthlyTimeline(data.planets, data.aspects || [], year, birthMonth);
  }, [data, year, birthMonth]);

  const yearPattern = useMemo((): YearPattern | null => {
    if (!data?.sun_house || !lastYearData?.sun_house) return null;
    return getYearPattern(lastYearData.sun_house, data.sun_house, nextYearData?.sun_house);
  }, [data, lastYearData, nextYearData]);

  const retrogradePlanets = useMemo(() => {
    if (!data?.planets) return [];
    return data.planets.filter(p => p.retrograde && RETROGRADE_SR_MEANINGS[p.name]);
  }, [data]);

  // SR year progress
  const srProgress = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const monthsSinceStart = ((currentMonth - birthMonth) + 12) % 12;
    return year === currentYear ? Math.round((monthsSinceStart / 12) * 100) : null;
  }, [year, currentYear, birthMonth]);

  const handlePrediction = async () => {
    if (!data || !data.planets || data.planets.length === 0) {
      setError('Calculate your Solar Return chart first.');
      return;
    }
    setAiLoading(true);
    setAiReading('');

    const planetSummary = data.planets
      .map(p => `${p.name}: ${p.sign} ${p.degree.toFixed(1)}°${p.house ? ` (House ${p.house})` : ''}${p.retrograde ? ' (R)' : ''}`)
      .join('\n');

    const aspectSummary = (data.aspects || []).slice(0, 20)
      .map(a => `${a.planet1} ${a.type} ${a.planet2} (orb ${a.orb.toFixed(1)}°)`)
      .join('\n');

    const natalContext = natalComparisons.filter(c => c.shifted).length > 0
      ? `\n\nNATAL vs SOLAR RETURN SHIFTS:\n${natalComparisons.filter(c => c.shifted).map(c => `${c.planet}: natal ${c.natalSign} → SR ${c.srSign}`).join('\n')}`
      : '';

    const retroContext = retrogradePlanets.length > 0
      ? `\n\nRETROGRADE PLANETS: ${retrogradePlanets.map(p => p.name).join(', ')}`
      : '';

    const chartText = `SOLAR RETURN CHART FOR ${firstName.toUpperCase()} — YEAR ${year}

Planetary Positions:
${planetSummary}
${data.ascendant_sign ? `\nSolar Return Ascendant: ${data.ascendant_sign}` : ''}
${data.sun_house ? `Sun House: ${data.sun_house}` : ''}
${data.moon_sign ? `Moon Sign: ${data.moon_sign}` : ''}${data.moon_house ? ` in House ${data.moon_house}` : ''}
${natalContext}${retroContext}

Key Aspects:
${aspectSummary || 'No major aspects calculated'}

INSTRUCTIONS — READ CAREFULLY:

You are an expert astrologer with 30 years of experience giving private consultations. You are writing a solar return reading for ${firstName} for the year ${year}. This is a deeply personal yearly forecast based on their exact solar return chart.

YOUR VOICE AND TONE:
- Write as if you are sitting across from ${firstName} in a private consultation
- Be warm but bold. Say things that matter. Do not hedge
- Be specific and predictive. Name events, timing, and outcomes
- Use "you" and "${firstName}" naturally
- Never sound robotic, templated, or generic

STRUCTURE YOUR READING AS:
1. **Opening** — A powerful hook about what ${year} means for ${firstName}
2. **The Year's Identity** (SR Ascendant)
3. **Core Focus** (Sun placement) — bold prediction
4. **Emotional Landscape** (Moon placement)
5. **Love & Money** (Venus)
6. **Drive & Conflict** (Mars)
7. **Luck & Expansion** (Jupiter)
8. **Challenges & Growth** (Saturn)
9. **Surprises** (Uranus)
10. **Dreams & Illusions** (Neptune)
11. **Transformation** (Pluto)
12. **Monthly Timing Guidance** — when key themes activate
13. **The Bottom Line** — a closing that stays with them

IMPORTANT RULES:
- Make bold predictions — tell ${firstName} what WILL happen
- Include timing guidance (first half vs second half, seasonal shifts)
- Reference natal chart shifts where provided
- Note retrograde planets and their meaning
- End with something they would screenshot and save
- Use markdown: ## for sections, ### for subsections, **bold** for emphasis
- Write at least 1500 words`;

    try {
      await api.streamAIInterpretation(
        { type: 'solar_return', birth_data: buildBirthData(profile!), chart_data_text: chartText },
        (chunk) => setAiReading((prev) => prev + chunk),
        () => setAiLoading(false),
      );
    } catch {
      try {
        const prediction = generateSolarReturnPrediction(
          data.planets.map(p => ({ name: p.name, sign: p.sign, degree: p.degree, longitude: p.longitude, house: p.house })),
          year, firstName, data.house_cusps,
        );
        if (prediction && prediction.trim().length > 0) setAiReading(prediction);
        else setAiReading('Unable to generate your reading right now. Please check your connection and try again.');
      } catch { setAiReading('Unable to generate your reading right now. Please check your connection and try again.'); }
      setAiLoading(false);
    }
  };

  if (!hasBirthData) {
    return (
      <PaywallGate feature="solar_return">
        <div className="max-w-3xl mx-auto">
          <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Readings
          </Link>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
            <Sun className="w-7 h-7 text-gold-primary" /> Solar Return
          </h1>
          <BirthDataPrompt message="Birth data required to calculate your Solar Return chart." />
        </div>
      </PaywallGate>
    );
  }

  return (
    <PaywallGate feature="solar_return">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Readings
        </Link>

        <h1 className="text-2xl font-display font-bold text-text-primary mb-1 flex items-center gap-3">
          <Sun className="w-7 h-7 text-gold-primary" /> Solar Return
        </h1>
        <p className="text-sm text-text-tertiary mb-6">Your birthday chart — themes for the year ahead</p>

        {/* Year Selector */}
        <div className="card mb-4">
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider text-center mb-3">Solar Return Year</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setYear(year - 1)} className="w-11 h-11 rounded-lg bg-bg-tertiary flex items-center justify-center hover:bg-bg-tertiary/80 transition-colors">
              <ChevronLeft className="w-5 h-5 text-accent-secondary" />
            </button>
            <div className="px-8 py-2 bg-bg-tertiary rounded-lg border border-accent-muted min-w-[120px] text-center">
              <span className="text-xl font-bold text-text-primary">{year}</span>
            </div>
            <button onClick={() => setYear(year + 1)} className="w-11 h-11 rounded-lg bg-bg-tertiary flex items-center justify-center hover:bg-bg-tertiary/80 transition-colors">
              <ChevronRight className="w-5 h-5 text-accent-secondary" />
            </button>
          </div>
          <button onClick={() => setYear(currentYear)} className="block mx-auto mt-2 text-xs text-accent-secondary underline hover:text-accent-primary transition-colors">
            Current Year
          </button>
        </div>

        {/* Calculate Button */}
        <button onClick={loadData} disabled={loading}
          className="w-full btn-primary py-3 mb-2 bg-gradient-to-r from-accent-primary to-purple-600 text-white font-semibold rounded-lg">
          {loading ? 'Calculating...' : hasLoaded ? 'Recalculate' : 'Calculate Solar Return'}
        </button>

        {/* Loading */}
        {loading && <LoadingCosmic label={`Calculating ${year} solar return...`} />}

        {/* Error */}
        {error && (
          <div className="card text-center py-4 mb-4 border-red-400/30">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={loadData} className="btn-primary mt-2 text-sm px-4 py-1.5">Retry</button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* RESULTS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {data && data.planets && !loading && (
          <div className="space-y-4 mt-4">

            {/* ── YEAR THEME HERO ──────────────────────────────────────── */}
            {yearTheme && (
              <div className="rounded-xl p-5 border" style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(139,92,246,0.1), rgba(245,158,11,0.05))',
                borderColor: 'rgba(245,158,11,0.3)',
              }}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{yearTheme.emoji}</span>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-gold-primary font-bold mb-1">
                      {year} Year Theme • {yearTheme.keyword}
                    </p>
                    <h2 className="text-lg font-bold text-text-primary mb-2">{yearTheme.headline}</h2>
                    <p className="text-sm text-text-secondary leading-relaxed">{yearTheme.description}</p>
                  </div>
                </div>

                {/* Where Am I Now? Progress */}
                {srProgress !== null && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Where You Are Now
                      </span>
                      <span className="text-xs font-bold text-accent-secondary">{srProgress}% through your solar year</span>
                    </div>
                    <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${srProgress}%`, background: 'linear-gradient(90deg, #F59E0B, #8B5CF6)' }} />
                    </div>
                    <p className="text-[11px] text-text-tertiary mt-1.5">
                      {srProgress < 25 ? 'Early phase — themes are just beginning to announce themselves.'
                       : srProgress < 50 ? 'Building phase — patterns are establishing and momentum is growing.'
                       : srProgress < 75 ? 'Peak activation — the year\'s central themes are fully engaged.'
                       : 'Integration phase — themes are reaching resolution before your next solar return.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── MULTI-YEAR PATTERN ──────────────────────────────────── */}
            {yearPattern && (
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-secondary" /> Year-Over-Year Pattern
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.03]">
                    <p className="text-[10px] text-text-muted uppercase">{year - 1}</p>
                    <p className="text-xs font-semibold text-text-tertiary">
                      {yearPattern.lastYear.house ? `${yearPattern.lastYear.house}th House` : '—'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-accent-primary shrink-0" />
                  <div className="flex-1 text-center p-2 rounded-lg border border-accent-primary/30" style={{ background: 'rgba(139,92,246,0.1)' }}>
                    <p className="text-[10px] text-accent-secondary uppercase font-bold">{year}</p>
                    <p className="text-xs font-semibold text-text-primary">
                      {yearPattern.thisYear.house ? `${yearPattern.thisYear.house}th House` : '—'}
                    </p>
                  </div>
                  {yearPattern.nextYear && (
                    <>
                      <ChevronRight className="w-4 h-4 text-accent-primary/50 shrink-0" />
                      <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.03]">
                        <p className="text-[10px] text-text-muted uppercase">{year + 1}</p>
                        <p className="text-xs font-semibold text-text-tertiary">
                          {yearPattern.nextYear.house}th House
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{yearPattern.narrative}</p>
              </div>
            )}

            {/* ── RETROGRADE ALERTS ───────────────────────────────────── */}
            {retrogradePlanets.length > 0 && (
              <div className="card border-amber-500/20">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Retrograde Alerts
                </h3>
                <div className="space-y-3">
                  {retrogradePlanets.map(p => (
                    <div key={p.name} className="rounded-lg p-3 border border-amber-500/10" style={{ background: 'rgba(245,158,11,0.06)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base text-amber-400">{getPlanetGlyph(p.name)}</span>
                        <span className="text-xs font-bold text-amber-300">{p.name} Retrograde</span>
                        <span className="text-[10px] text-amber-400/60 ml-auto">℞</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{RETROGRADE_SR_MEANINGS[p.name]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB NAVIGATION ──────────────────────────────────────── */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <TabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Eye className="w-3.5 h-3.5" />} label="Overview" />
              <TabBtn active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Calendar className="w-3.5 h-3.5" />} label="Timeline" />
              <TabBtn active={activeTab === 'aspects'} onClick={() => setActiveTab('aspects')} icon={<Zap className="w-3.5 h-3.5" />} label="Aspects" />
              <TabBtn active={activeTab === 'chart'} onClick={() => setActiveTab('chart')} icon={<Target className="w-3.5 h-3.5" />} label="Chart" />
            </div>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB: OVERVIEW */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-4">

                {/* AI Prediction Button */}
                <button onClick={handlePrediction} disabled={aiLoading}
                  className="w-full py-3 font-semibold rounded-lg text-white"
                  style={{ background: 'linear-gradient(90deg, #F59E0B, #D97706)' }}>
                  {aiLoading ? 'Crafting Your Predictions...' : '✨ Generate Full Year Reading'}
                </button>

                {/* AI Prediction Result */}
                {aiReading.length > 0 && (
                  <div className="rounded-xl p-6 border" style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.03))',
                    borderColor: 'rgba(139,92,246,0.3)',
                  }}>
                    <RenderMarkdown text={aiReading} />
                    <CopyBtn text={aiReading} label="Reading copied!" />
                  </div>
                )}

                {/* Key Highlights */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                    Key Highlights for {year}
                  </h3>

                  {/* SR Ascendant */}
                  {data.ascendant_sign && (
                    <div className="rounded-lg p-4 mb-2 border" style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))',
                      borderColor: 'rgba(255,255,255,0.06)',
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-bg-tertiary flex items-center justify-center">
                          <span className="text-lg font-bold text-accent-secondary">AC</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Solar Return Ascendant</p>
                          <p className="text-sm font-semibold text-text-primary">
                            {getZodiacGlyph(data.ascendant_sign)} {data.ascendant_sign}
                          </p>
                          <p className="text-[11px] text-text-tertiary italic">How the world perceives you this year</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sun House */}
                  {data.planets.find(p => p.name === 'Sun') && (
                    <div className="rounded-lg p-4 mb-2 border" style={{
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
                      borderColor: 'rgba(255,255,255,0.06)',
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-bg-tertiary flex items-center justify-center">
                          <span className="text-lg text-accent-secondary">{getPlanetGlyph('Sun')}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Sun Placement</p>
                          <p className="text-sm font-semibold text-text-primary">
                            {getZodiacGlyph(data.planets.find(p => p.name === 'Sun')!.sign)} {data.planets.find(p => p.name === 'Sun')!.sign}
                            {data.sun_house ? ` • House ${data.sun_house}` : ''}
                          </p>
                          <p className="text-[11px] text-text-tertiary italic">Where life demands your attention</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Moon */}
                  {data.planets.find(p => p.name === 'Moon') && (
                    <div className="rounded-lg p-4 mb-2 border" style={{
                      background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(6,182,212,0.04))',
                      borderColor: 'rgba(255,255,255,0.06)',
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-bg-tertiary flex items-center justify-center">
                          <span className="text-lg text-accent-secondary">{getPlanetGlyph('Moon')}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">Moon Placement</p>
                          <p className="text-sm font-semibold text-text-primary">
                            {getZodiacGlyph(data.planets.find(p => p.name === 'Moon')!.sign)} {data.moon_sign || data.planets.find(p => p.name === 'Moon')!.sign}
                            {data.moon_house ? ` • House ${data.moon_house}` : ''}
                          </p>
                          <p className="text-[11px] text-text-tertiary italic">Your emotional reality this year</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Planets on Angles — Deep Dive */}
                  {data.planets_on_angles && data.planets_on_angles.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gold-primary mb-2 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" /> Planets Conjunct Angles — Power Positions
                      </p>
                      {data.planets_on_angles.map((pa, idx) => {
                        const isExp = expandedAngle === `${pa.planet}-${pa.angle}`;
                        const interp = getAngleInterpretation(pa.planet, pa.angle);
                        return (
                          <div key={idx} className="mb-1.5">
                            <button
                              onClick={() => setExpandedAngle(isExp ? null : `${pa.planet}-${pa.angle}`)}
                              className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg transition-colors ${isExp ? 'bg-gold-primary/10' : 'hover:bg-white/[0.04]'}`}
                            >
                              <span className="text-lg text-accent-secondary w-7">{getPlanetGlyph(pa.planet) || pa.planet}</span>
                              <span className="text-xs text-text-secondary flex-1 text-left">{pa.planet} conjunct {pa.angle}</span>
                              <span className="text-[11px] text-text-muted">({formatDegree(pa.orb)} orb)</span>
                              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${isExp ? 'rotate-180' : ''}`} />
                            </button>
                            {isExp && (
                              <div className="px-3 pb-3 rounded-b-lg" style={{ backgroundColor: 'rgba(245,158,11,0.05)' }}>
                                <p className="text-xs text-text-secondary leading-relaxed">{interp}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── NATAL vs SOLAR RETURN ──────────────────────────── */}
                {natalComparisons.length > 0 && natalComparisons.some(c => c.shifted) && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-accent-secondary" /> Natal vs Solar Return Shifts
                    </h3>
                    <p className="text-xs text-text-tertiary mb-4">
                      How your solar return energy differs from your natal blueprint
                    </p>
                    <div className="space-y-2">
                      {natalComparisons.map(c => (
                        <div key={c.planet}>
                          <button
                            onClick={() => setExpandedPlanet(expandedPlanet === `cmp-${c.planet}` ? null : `cmp-${c.planet}`)}
                            className={`w-full rounded-lg p-3 border transition-colors ${
                              c.shifted ? 'border-accent-primary/20 bg-accent-primary/5' : 'border-white/5 bg-white/[0.02]'
                            } ${expandedPlanet === `cmp-${c.planet}` ? 'bg-accent-primary/10' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base text-accent-secondary w-6">{getPlanetGlyph(c.planet)}</span>
                              <span className="text-xs font-semibold text-text-primary flex-1 text-left">{c.planet}</span>
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-text-muted">{getZodiacGlyph(c.natalSign)} {c.natalSign}</span>
                                {c.shifted && (
                                  <>
                                    <ArrowRightLeft className="w-3 h-3 text-accent-primary" />
                                    <span className="text-accent-secondary font-semibold">{getZodiacGlyph(c.srSign)} {c.srSign}</span>
                                  </>
                                )}
                                {!c.shifted && <span className="text-green-400 text-[10px]">same</span>}
                              </div>
                              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${expandedPlanet === `cmp-${c.planet}` ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          {expandedPlanet === `cmp-${c.planet}` && (
                            <div className="px-4 pb-3 rounded-b-lg" style={{ backgroundColor: 'rgba(139,92,246,0.05)' }}>
                              <p className="text-xs text-text-secondary leading-relaxed mt-2">{c.interpretation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB: TIMELINE */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="card">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent-secondary" /> Monthly Timeline
                  </h3>
                  <p className="text-xs text-text-tertiary mb-4">
                    How your solar return themes unfold month by month
                  </p>

                  <div className="space-y-1.5">
                    {monthlyTimeline.map((m, idx) => {
                      const isExp = expandedMonth === idx;
                      const isCurrentMonth = srProgress !== null && idx === Math.floor((srProgress / 100) * 12);
                      return (
                        <div key={idx}>
                          <button
                            onClick={() => setExpandedMonth(isExp ? null : idx)}
                            className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                              isCurrentMonth ? 'bg-accent-primary/15 border border-accent-primary/30' : isExp ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="w-10 text-center">
                              <p className="text-xs font-bold text-text-primary">{m.monthName.slice(0, 3)}</p>
                            </div>
                            {/* Intensity dots */}
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < m.intensity ? 'bg-accent-secondary' : 'bg-white/10'}`} />
                              ))}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-xs text-text-secondary truncate">{m.themes[0]}</p>
                            </div>
                            <span className="text-base text-accent-secondary">{getPlanetGlyph(m.keyPlanet)}</span>
                            {isCurrentMonth && <span className="text-[9px] text-accent-primary font-bold uppercase">Now</span>}
                            <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${isExp ? 'rotate-180' : ''}`} />
                          </button>
                          {isExp && (
                            <div className="px-4 pb-3 rounded-b-lg" style={{ backgroundColor: 'rgba(139,92,246,0.04)' }}>
                              <div className="flex flex-wrap gap-1 mb-2 mt-1">
                                {m.themes.map((t, ti) => (
                                  <span key={ti} className="text-[10px] px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-secondary">{t}</span>
                                ))}
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed">{m.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB: ASPECTS */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === 'aspects' && (
              <div className="space-y-4">
                {/* Critical Aspects */}
                {criticalAspects.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent-secondary" /> Critical Aspects
                    </h3>
                    <p className="text-xs text-text-tertiary mb-4">
                      The defining planetary dynamics of your year
                    </p>
                    <div className="space-y-2">
                      {criticalAspects.map((a, idx) => {
                        const isExp = expandedAspect === idx;
                        return (
                          <div key={idx}>
                            <button
                              onClick={() => setExpandedAspect(isExp ? null : idx)}
                              className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg border transition-colors ${
                                a.interp.intensity === 'high'
                                  ? 'border-red-400/20 bg-red-400/5'
                                  : 'border-white/5 bg-white/[0.02]'
                              } ${isExp ? 'bg-accent-primary/10' : 'hover:bg-white/[0.04]'}`}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-base text-accent-secondary">{getPlanetGlyph(a.planet1)}</span>
                                <span className="text-[10px] text-text-muted">{a.type}</span>
                                <span className="text-base text-accent-secondary">{getPlanetGlyph(a.planet2)}</span>
                              </div>
                              <span className="text-xs font-semibold text-text-primary flex-1 text-left">{a.interp.title}</span>
                              {a.interp.intensity === 'high' && <Zap className="w-3.5 h-3.5 text-red-400" />}
                              <span className="text-[10px] text-text-muted">{a.orb.toFixed(1)}° orb</span>
                              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${isExp ? 'rotate-180' : ''}`} />
                            </button>
                            {isExp && (
                              <div className="px-4 pb-3 rounded-b-lg" style={{ backgroundColor: 'rgba(139,92,246,0.05)' }}>
                                <p className="text-xs text-text-secondary leading-relaxed mt-2">{a.interp.interpretation}</p>
                                <CopyBtn text={a.interp.interpretation} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Aspects List */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
                    All Aspects
                  </h3>
                  <div className="space-y-0.5">
                    {(data.aspects || []).map((a, idx) => (
                      <div key={idx} className="flex items-center gap-2 py-1.5 text-xs">
                        <span className="text-accent-secondary w-5 text-center">{getPlanetGlyph(a.planet1)}</span>
                        <span className="text-text-secondary flex-1">{a.planet1} {a.type} {a.planet2}</span>
                        <span className="text-text-muted">{a.orb.toFixed(1)}°</span>
                      </div>
                    ))}
                    {(!data.aspects || data.aspects.length === 0) && (
                      <p className="text-xs text-text-tertiary text-center py-4">No aspects calculated</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB: CHART */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === 'chart' && (
              <div className="space-y-4">
                {/* Natal Wheel */}
                <div className="card flex items-center justify-center p-4">
                  <NatalWheel
                    planets={data.planets.map((p) => ({ name: p.name, longitude: p.longitude, sign: p.sign, degree: p.degree }))}
                    aspects={data.aspects || []}
                    houseCusps={data.house_cusps || []}
                    ascendantDegree={data.ascendant_degree ?? data.house_cusps?.[0] ?? 0}
                    size={380}
                  />
                </div>

                {/* Full Positions Table */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Full Positions</h3>

                  <div className="flex py-2 border-b border-border-secondary">
                    <span className="text-[10px] text-text-muted font-bold uppercase flex-[1.2]">Planet</span>
                    <span className="text-[10px] text-text-muted font-bold uppercase flex-[1.5]">Sign / Degree</span>
                    <span className="text-[10px] text-text-muted font-bold uppercase flex-[0.8]">House</span>
                  </div>

                  {data.planets.map((planet, index) => {
                    const isExpanded = expandedPlanet === planet.name;
                    const srInterp = isExpanded ? getSolarReturnInterp(planet.name, planet.sign, planet.house) : '';
                    return (
                      <div key={planet.name}>
                        <button
                          onClick={() => setExpandedPlanet(isExpanded ? null : planet.name)}
                          className={`flex items-center w-full py-2 text-left transition-colors ${index % 2 === 0 ? 'bg-white/[0.02]' : ''} ${isExpanded ? 'bg-accent-primary/10 rounded-t-lg' : ''} hover:bg-white/[0.04]`}
                        >
                          <div className="flex items-center gap-1 flex-[1.2]">
                            <span className="text-base text-accent-secondary w-5">{getPlanetGlyph(planet.name)}</span>
                            <span className="text-xs text-text-secondary">{planet.name}</span>
                            {planet.retrograde && <span className="text-[9px] text-amber-400">℞</span>}
                          </div>
                          <span className="text-xs text-text-secondary flex-[1.5]">
                            {getZodiacGlyph(planet.sign)} {planet.sign} {formatDegree(planet.degree)}
                          </span>
                          <span className="text-xs text-text-tertiary text-center flex-[0.8]">
                            {planet.house != null ? planet.house : '--'}
                          </span>
                        </button>
                        {isExpanded && srInterp && (
                          <div className="px-3 pb-3 rounded-b-lg" style={{ backgroundColor: 'rgba(139,92,246,0.05)' }}>
                            <p className="text-[11px] font-semibold mb-1" style={{ color: '#C4B5FD' }}>
                              Solar Return {year} — {planet.name} in {planet.sign}
                            </p>
                            <p className="text-xs text-text-secondary leading-relaxed">{srInterp}</p>
                            <CopyBtn text={srInterp} label="Interpretation copied!" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </PaywallGate>
  );
}
