'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { MarkdownText } from '@/components/ui/MarkdownText';


// ── Month Data ──

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_ICONS = ['❄️', '💜', '🌊', '🌸', '🌿', '☀️', '🔥', '🌻', '🍂', '🎃', '🌙', '✨'];

const TRANSIT_THEMES: Record<string, { area: string; energy: string }> = {
  Jupiter: { area: 'growth & luck', energy: 'expansion, opportunity, and abundance' },
  Saturn: { area: 'discipline & structure', energy: 'responsibility, testing, and long-term commitment' },
  Uranus: { area: 'change & liberation', energy: 'sudden shifts, awakening, and breaking free' },
  Neptune: { area: 'dreams & intuition', energy: 'spiritual deepening, creativity, and dissolving illusions' },
  Pluto: { area: 'transformation & power', energy: 'profound change, death/rebirth cycles, and hidden truth' },
  Mars: { area: 'drive & energy', energy: 'action, conflict, ambition, and physical vitality' },
  Venus: { area: 'love & beauty', energy: 'attraction, relationships, pleasure, and values' },
  Mercury: { area: 'mind & communication', energy: 'thinking, speaking, learning, and connection' },
};

const HOUSE_LIFE_AREA: Record<number, string> = {
  1: 'your identity and how the world sees you',
  2: 'your money, values, and sense of self-worth',
  3: 'your communication, learning, and daily interactions',
  4: 'your home, family, and emotional foundation',
  5: 'your love life, creativity, and joy',
  6: 'your health, work routine, and daily habits',
  7: 'your relationships and partnerships',
  8: 'your intimate bonds, shared resources, and inner transformation',
  9: 'your beliefs, travel, and search for meaning',
  10: 'your career, public reputation, and life direction',
  11: 'your friendships, community, and future vision',
  12: 'your spiritual life, subconscious patterns, and healing',
};

// ── Month Forecast Generator ──

interface MonthForecast {
  month: string;
  icon: string;
  theme: string;
  overview: string;
  keyTransits: string[];
  advice: string;
  intensity: 'calm' | 'active' | 'intense';
}

// Simple pick-fresh implementation for variety across months
function pickFresh(pool: string[], usedRef: React.MutableRefObject<Map<string, number[]>>): string {
  const key = pool.join('|').substring(0, 50);
  if (!usedRef.current.has(key)) usedRef.current.set(key, []);
  const used = usedRef.current.get(key)!;
  const available = pool.map((_, i) => i).filter(i => !used.includes(i));
  const idx = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : Math.floor(Math.random() * pool.length);
  used.push(idx);
  if (used.length > 4) used.shift();
  return pool[idx];
}

const INTENSE_OVERVIEW_LINES = [
  'This is a high-impact month. Multiple outer planets are active in your chart simultaneously. What happens now has lasting significance.',
  'Several outer planets are firing at once. The decisions made here tend to shape years, not weeks.',
  'The month lands heavy. Expect compression — old structures giving way under real pressure.',
  'Outer-planet traffic is dense. The texture of your daily life shifts in ways you will still notice a year from now.',
  'A pivot month. The ground under several parts of your life is moving at the same time.',
  'High-signal weeks. What surfaces now has been building quietly for a long time.',
  'A crucible month. The tests are unfair only if you measure them by how comfortable they are.',
  'One of the heavier months in the year. Treat it accordingly — less scattering, more attention.',
];

const ACTIVE_OVERVIEW_LINES = [
  'The energy this month is active and forward-moving. Use it.',
  'Things pick up speed. Conversations land faster, decisions compound faster.',
  'A momentum month — the kind where a single good choice opens three more.',
  'The pace doubles. Stay with what matters; the rest can wait.',
  'Live traffic in your chart. Opportunities arrive on a schedule, not a vibe.',
  'The month moves. Keep your hands on the wheel.',
];

const GENERIC_CALM_LINES = [
  'A quieter month — but quiet doesn\'t mean empty. Integration time. Changes you\'ve been processing settle into something real.',
  'The cosmos gives you breathing room. Consolidate gains, rest, prepare for the next wave.',
  'Not every month needs to be dramatic. This one is about steady, unglamorous progress — the kind that actually builds a life.',
  'Low-traffic skies. A month to maintain, not to conquer.',
  'The transits step back. What gets done now is whatever you decide to do — no cosmic nudge either way.',
  'A rest month hiding in plain sight. The work is internal.',
  'Nothing urgent overhead. A rare window to catch up on the parts of your life no planet was asking about.',
  'The pace slackens. Read the book. Finish the thing. Call the person.',
];

const GENERIC_ACTIVE_LINES = [
  'Multiple areas of your life are in motion. Prioritization is the whole game — pick the thing that matters most.',
  'The energy picks up. Conversations, opportunities, and decisions start moving faster. Stay present and act with intention.',
  'A busy sky. The risk is doing three things half-heartedly instead of one thing fully.',
  'Momentum is available. Whether it helps or scatters you depends entirely on where you point it.',
  'The month has traction. Use it on the commitment that scares you a little, not the one that fits neatly on a to-do list.',
  'Fast-moving weeks. Decisions made at speed still count as decisions — choose deliberately anyway.',
  'Several fronts open at once. The temptation is to spread thin; the reward is for going deep on one.',
  'Things want to move. Let them — but steer.',
];

const GENERIC_INTENSE_LINES = [
  'A high-pressure month even without a single dominant transit: several forces compound into real weight.',
  'Without one clear headline, the month still lands heavy. The cumulative pressure is the story.',
  'The sky is busy in a way that adds up. Small signals stack into something loud.',
  'No single transit owns this month, but the combined traffic demands attention.',
  'The weight comes from the chord, not any one note. Read the whole month, not any single week.',
  'A month that asks for stamina. Nothing dramatic in isolation; plenty when you zoom out.',
];

const ADVICE_INTENSE_LINES = [
  'This is not the month to play it safe. The universe is pushing you toward something — lean in.',
  'Big energy demands big honesty. Say what you mean. Decide what you want. Move accordingly.',
  'What you initiate or commit to this month echoes for years. Choose carefully, then commit fully.',
  'Skip the soft version of the conversation. The situation has already outgrown it.',
  'Heavy months reward precision, not courage. Know exactly what you are asking for before you ask.',
  'Do one hard thing on purpose. The month will do the second one for you.',
  'Make the decision before the pressure makes it for you.',
  'Real stakes. Real choices. No dress rehearsal this month.',
];

const ADVICE_ACTIVE_LINES = [
  'Channel the heightened energy into one meaningful project or relationship. Scatter your focus and you\'ll exhaust yourself.',
  'Trust your instincts this month — they\'re sharper than usual. The right decision will feel like relief, not anxiety.',
  'Momentum is your friend. Take action on the things that have been sitting in your "someday" pile.',
  'Pick one door and walk through it fully. Three half-walks through three doors is how active months evaporate.',
  'Start something before you feel ready. The readiness arrives mid-sentence.',
  'Reply to the email. Send the draft. Book the thing. This month rewards motion over polish.',
  'Say yes to the opportunity that scares you a little, no to the one that flatters you.',
  'The calendar is the tool. Put the important thing on it first; fit the rest around it.',
];

const ADVICE_CALM_LINES = [
  'Rest is not laziness. Your body and mind are processing. Give yourself permission to slow down without guilt.',
  'Focus on maintenance: relationships, health, finances. The unsexy work pays off when the big transits arrive.',
  'A beautiful month to enjoy what you\'ve already built. Not every week needs to be transformational.',
  'Put the phone down more. The signal you need will not arrive on a screen.',
  'Clean up the edges of your life. The boring tasks you\'ve been avoiding pay surprisingly well this month.',
  'A good month to be deeply ordinary. Cook. Walk. Read. Repeat.',
  'No cosmic agenda this month. Follow your own — and notice what that is when no one is pushing.',
  'The muscle being built is patience. It doesn\'t look like progress until later.',
];

function generateMonthForecasts(
  sunSign: string,
  transitEvents: any[],
  startMonth: number,
  startYear: number,
  usedRef: React.MutableRefObject<Map<string, number[]>>,
): MonthForecast[] {
  const forecasts: MonthForecast[] = [];

  for (let i = 0; i < 12; i++) {
    const mIdx = (startMonth + i) % 12;
    const year = startYear + Math.floor((startMonth + i) / 12);
    const monthLabel = `${MONTH_NAMES[mIdx]} ${year}`;

    const monthEvents = (transitEvents || []).filter((e: any) => {
      if (!e?.date) return false;
      const d = new Date(e.date);
      return d.getMonth() === mIdx && d.getFullYear() === year;
    });

    const planetOf = (e: any): string =>
      e.transiting_planet || e.transit_planet || e.planet || '';
    const outerPlanetEvents = monthEvents.filter((e: any) =>
      ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(planetOf(e)));
    const innerPlanetEvents = monthEvents.filter((e: any) =>
      ['Mars', 'Venus', 'Mercury'].includes(planetOf(e)));

    let intensity: 'calm' | 'active' | 'intense' = 'calm';
    if (outerPlanetEvents.length >= 3) intensity = 'intense';
    else if (outerPlanetEvents.length >= 1 || innerPlanetEvents.length >= 4) intensity = 'active';

    let theme = 'A month of steady progress';
    let overview = '';
    const keyTransits: string[] = [];

    if (outerPlanetEvents.length > 0) {
      const dominant = outerPlanetEvents[0];
      const planet = planetOf(dominant) || '?';
      const natalPt = dominant.natal_planet || dominant.natal_point || '';
      const aspect = dominant.aspect_type || dominant.aspect || '';
      const pTheme = TRANSIT_THEMES[planet];
      const house = dominant.natal_house || dominant.house;
      const houseArea = house ? HOUSE_LIFE_AREA[house] : '';

      if (pTheme) {
        theme = `A month of ${pTheme.energy.split(',')[0].trim()}`;
      }

      overview = buildMonthOverview(planet, natalPt, aspect, houseArea, intensity, usedRef);

      for (const evt of outerPlanetEvents.slice(0, 3)) {
        const p = planetOf(evt) || '?';
        const np = evt.natal_planet || evt.natal_point || '?';
        const a = evt.aspect_type || evt.aspect || 'activating';
        const h = evt.natal_house || evt.house;
        const ha = h ? HOUSE_LIFE_AREA[h] : '';
        keyTransits.push(
          `${p} ${a} your natal ${np}${ha ? ` — affecting ${ha}` : ''}`
        );
      }
    }

    if (innerPlanetEvents.length > 0 && keyTransits.length < 3) {
      for (const evt of innerPlanetEvents.slice(0, 2)) {
        const p = planetOf(evt) || '?';
        const np = evt.natal_planet || evt.natal_point || '?';
        const a = evt.aspect_type || evt.aspect || 'activating';
        keyTransits.push(`${p} ${a} your natal ${np}`);
      }
    }

    if (!overview) {
      overview = buildGenericMonthOverview(intensity, usedRef);
    }

    const advice = buildMonthAdvice(intensity, usedRef);

    forecasts.push({
      month: monthLabel,
      icon: MONTH_ICONS[mIdx],
      theme,
      overview,
      keyTransits: keyTransits.slice(0, 4),
      advice,
      intensity,
    });
  }

  return forecasts;
}

function buildMonthOverview(
  planet: string, natalPt: string, aspect: string,
  houseArea: string, intensity: string,
  usedRef: React.MutableRefObject<Map<string, number[]>>,
): string {
  const pTheme = TRANSIT_THEMES[planet];
  if (!pTheme) return '';

  const aspectMeaning = aspect.toLowerCase().includes('trine') || aspect.toLowerCase().includes('sextile')
    ? 'supportive and flowing'
    : aspect.toLowerCase().includes('square') || aspect.toLowerCase().includes('opposition')
    ? 'challenging but growth-oriented'
    : 'powerful and activating';

  const lines: string[] = [];
  lines.push(`${planet} is making a ${aspectMeaning} connection to your natal ${natalPt} this month.`);

  if (houseArea) {
    lines.push(`This transit is directly affecting ${houseArea}. Expect themes around ${pTheme.area} to become impossible to ignore.`);
  } else {
    lines.push(`The area of ${pTheme.area} is activated — ${pTheme.energy} shapes your month.`);
  }

  if (intensity === 'intense') {
    lines.push(pickFresh(INTENSE_OVERVIEW_LINES, usedRef));
  } else if (intensity === 'active') {
    lines.push(pickFresh(ACTIVE_OVERVIEW_LINES, usedRef));
  }

  return lines.join(' ');
}

function buildGenericMonthOverview(
  intensity: string,
  usedRef: React.MutableRefObject<Map<string, number[]>>,
): string {
  if (intensity === 'intense') return pickFresh(GENERIC_INTENSE_LINES, usedRef);
  if (intensity === 'active') return pickFresh(GENERIC_ACTIVE_LINES, usedRef);
  return pickFresh(GENERIC_CALM_LINES, usedRef);
}

function buildMonthAdvice(
  intensity: string,
  usedRef: React.MutableRefObject<Map<string, number[]>>,
): string {
  if (intensity === 'intense') return pickFresh(ADVICE_INTENSE_LINES, usedRef);
  if (intensity === 'active') return pickFresh(ADVICE_ACTIVE_LINES, usedRef);
  return pickFresh(ADVICE_CALM_LINES, usedRef);
}

// ── Copy Button ──

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
      title={copied ? (label || 'Copied!') : 'Copy'}
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-text-muted" />}
    </button>
  );
}

// ── Intensity Helpers ──

function intensityColor(i: string) {
  return i === 'intense' ? '#EF4444' : i === 'active' ? '#F59E0B' : '#22C55E';
}

function intensityLabel(i: string, t: (key: string) => string) {
  return i === 'intense' ? t('readings.yearAheadPage.intense') : i === 'active' ? t('readings.yearAheadPage.activeIntensity') : t('readings.yearAheadPage.calm');
}

// ── AI Year Ahead Prompt ──

function buildYearAheadPrompt(sunSign: string, userName: string): string {
  return `You are writing ${userName}'s Year Ahead forecast. This should feel like a deeply personal letter from their astrologer — warm, honest, and specific to their chart.

Structure your reading as follows:
1. **The Big Picture** — What is the overarching theme of this year? What is the universe asking ${userName} to do, become, or release?
2. **Love & Relationships** — How does the romantic landscape shift? What months are peak windows for love? What challenges arise?
3. **Career & Money** — Where are the growth opportunities? When should they push hard vs. conserve energy?
4. **Health & Wellbeing** — What does their body and mind need this year? Any months to watch?
5. **The Month to Watch** — Which single month carries the most potential for change, and why?
6. **Your Power Move** — One specific, actionable thing ${userName} should do this year to align with their highest potential.

Use the transit data provided to ground every prediction in real planetary movements and dates. Do NOT be vague. Reference specific planets, aspects, and timing.

Write in 2nd person. Be direct, warm, and honest. If a period looks difficult, say so — then show them the path through it. This should feel like a $200 reading, not a free horoscope.`;
}

// ── Main Component ──

export default function YearAheadPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { hasAccess } = useSubscriptionStore();
  const usedPoolRef = useRef<Map<string, number[]>>(new Map());

  const [loading, setLoading] = useState(false);
  const [forecasts, setForecasts] = useState<MonthForecast[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [sunSign, setSunSign] = useState('');
  const [error, setError] = useState('');

  // AI reading state
  const [aiReading, setAiReading] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Chart data ref for AI prompt
  const chartRef = useRef<any>(null);

  if (!profile?.birth_date || !profile?.latitude) {
    return (
      <PaywallGate feature="year_ahead">
        <BirthDataPrompt message="Add your birth data to generate your annual forecast." />
      </PaywallGate>
    );
  }

  const loadForecast = async () => {
    setLoading(true);
    setError('');
    usedPoolRef.current.clear();

    try {
      const birthData = buildBirthData(profile!);

      // Fetch natal chart
      const chart = await api.getNatalChart(birthData);
      chartRef.current = chart;

      const planets = chart?.planets || chart?.positions || [];
      const sun = planets.find((p: any) => p.name === 'Sun' || p.planet === 'Sun');
      const sign = sun?.sign || 'Aries';
      setSunSign(sign);

      // Fetch transit events for next 12 months
      let events: any[] = [];
      try {
        const now = new Date();
        const transitData = await api.getTransitEvents({
          ...birthData,
          start_date: now.toISOString().split('T')[0],
          end_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0],
          days: 365,
        });
        events = Array.isArray(transitData) ? transitData : (transitData?.events || transitData?.forecasts || []);
      } catch {
        // Transit events may fail — use generic forecasts
      }

      const now = new Date();
      const months = generateMonthForecasts(sign, events, now.getMonth(), now.getFullYear(), usedPoolRef);
      setForecasts(months);
    } catch (err: any) {
      setError(err?.message || 'Failed to load forecast');
    } finally {
      setLoading(false);
    }
  };

  const requestAIReading = useCallback(async () => {
    if (aiLoading) return;
    if (!hasAccess('ai_readings')) {
      setAiError('Upgrade your plan to access AI-powered readings.');
      return;
    }
    setAiLoading(true);
    setAiReading('');
    setAiError('');
    const userName = profile?.display_name || 'you';

    try {
      const chart = chartRef.current;
      const planets: any[] = Array.isArray(chart?.planets) ? chart.planets : (chart?.positions || []);
      const chartText = planets.length > 0
        ? `Natal chart: ${planets.map((p: any) => `${p.name || p.planet} in ${p.sign} (house ${p.house})`).join(', ')}`
        : '';
      const transitText = forecasts.map(f =>
        `${f.month}: ${f.theme}. ${f.keyTransits.join('; ')}`
      ).join('\n');

      const birthBlock = [
        profile?.display_name ? `Name: ${profile.display_name}` : '',
        `Birth date: ${profile?.birth_date || 'unknown'}`,
        `Birth time: ${profile?.birth_time || 'unknown'}`,
        `Birth place: ${profile?.birth_location || 'unknown'}`,
      ].filter(Boolean).join('\n');

      const prompt = buildYearAheadPrompt(sunSign, userName);
      const fullContext = `${prompt}\n\n=== BIRTH DATA (saved) ===\n${birthBlock}\n\n=== CHART DATA ===\nSun sign: ${sunSign}\n${chartText}\n\n=== 12-MONTH TRANSIT OVERVIEW ===\n${transitText}\n\nThe birth data and chart above are already saved and verified. Do NOT ask for birth information or say it is missing — write the reading directly from the data provided.`;

      await api.streamAIInterpretation(
        {
          chart_data_text: fullContext,
          messages: [
            { role: 'user', content: 'Give me my complete Year Ahead reading. Be specific, personal, and honest. Ground everything in my actual transits and chart data.' },
          ],
          type: 'year_ahead',
          chart_context: true,
        },
        (chunk: string) => setAiReading(prev => prev + chunk),
        () => setAiLoading(false),
      );
    } catch (err: any) {
      setAiError(err?.message || 'Unable to generate your personalized reading right now. Please try again.');
      setAiLoading(false);
    }
  }, [profile, forecasts, sunSign, aiLoading, hasAccess]);

  return (
    <PaywallGate feature="year_ahead">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        {t('readings.backToReadings')}
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">{'🔮'}</span>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">{t('readings.yearAheadPage.title')}</h1>
        <p className="text-text-secondary text-sm leading-relaxed px-4">
          A month-by-month forecast based on your actual transits and natal chart.
          {sunSign ? ` Sun in ${sunSign}.` : ''}
        </p>
      </div>

      {/* Initial State — Generate Button */}
      {forecasts.length === 0 && !loading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">{'📅'}</span>
          <p className="text-text-tertiary mb-6">
            See the major transits and planetary shifts coming your way over the next 12 months.
          </p>
          <button onClick={loadForecast} disabled={loading} className="btn-primary">
            Generate My Year Ahead
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingCosmic label={t('readings.yearAheadPage.generating')} />}

      {/* Forecasts loaded */}
      {forecasts.length > 0 && (
        <>
          {/* AI Full Reading Button */}
          {!aiReading && !aiLoading && (
            <div className="mb-6">
              <button
                onClick={requestAIReading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-primary to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {'✨'} Get Your Full Year Ahead Reading
              </button>
              {aiError && (
                <p className="text-red-400 text-xs text-center mt-2">{aiError}</p>
              )}
            </div>
          )}

          {/* AI Reading Display */}
          {(aiReading || aiLoading) && (
            <div className="rounded-2xl border border-accent-primary/15 bg-accent-primary/5 p-5 md:p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-semibold text-accent-primary flex-1">
                  {'✨'} Your Personalized Year Ahead
                </h3>
                {aiReading && !aiLoading && (
                  <CopyBtn text={aiReading} label="Reading copied!" />
                )}
              </div>
              {aiReading && (
                <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                  <MarkdownText text={aiReading} />
                </div>
              )}
              {aiLoading && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-4 rounded-full border-2 border-t-accent-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  <span className="text-text-muted text-xs">Writing your reading...</span>
                </div>
              )}
            </div>
          )}

          {/* Month-by-Month Forecast */}
          <h2 className="text-lg font-display font-bold text-text-primary mb-4 mt-6">{t('readings.yearAheadPage.monthlyOverview')}</h2>

          <div className="space-y-2">
            {forecasts.map((forecast, idx) => {
              const isExpanded = selectedMonth === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedMonth(isExpanded ? null : idx)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    isExpanded
                      ? 'border-accent-primary/20 bg-white/[0.05]'
                      : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]'
                  }`}
                >
                  {/* Month Header */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-10 text-center">{forecast.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary">{forecast.month}</h3>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{forecast.theme}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ backgroundColor: `${intensityColor(forecast.intensity)}20`, color: intensityColor(forecast.intensity) }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: intensityColor(forecast.intensity) }} />
                      {intensityLabel(forecast.intensity, t)}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <p className="text-text-secondary text-sm leading-relaxed mb-4">{forecast.overview}</p>

                      {forecast.keyTransits.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-[11px] font-bold text-accent-primary uppercase tracking-wider mb-2">{t('readings.yearAheadPage.keyTransits')}</h4>
                          {forecast.keyTransits.map((tr, i) => (
                            <div key={i} className="flex items-start gap-2 mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 flex-shrink-0" />
                              <span className="text-text-secondary text-xs leading-relaxed">{tr}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-amber-500/[0.06] border border-amber-500/[0.12] rounded-xl p-3">
                        <h4 className="text-xs font-bold text-amber-400 mb-1">{'💡'} Your Move</h4>
                        <p className="text-text-secondary text-sm leading-relaxed">{forecast.advice}</p>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Regenerate */}
          <button
            onClick={() => {
              setForecasts([]);
              setSunSign('');
              setAiReading('');
              setAiError('');
              setSelectedMonth(null);
            }}
            className="btn-secondary w-full mt-6"
          >
            Regenerate
          </button>
        </>
      )}
    </div>
    </PaywallGate>
  );
}
