'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Hourglass, ArrowLeft, ChevronDown, ChevronUp, Loader2, Copy, Check, CalendarSearch, Info } from 'lucide-react';
import { getPlanetGlyph } from '@/lib/utils';
import { PaywallGate } from '@/components/ui/PaywallGate';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FirdariaSubSubPeriod {
  planet: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}

interface FirdariaSubPeriod {
  planet: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
  sub_sub_periods?: FirdariaSubSubPeriod[];
}

interface FirdariaPeriod {
  planet: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
  sub_periods?: FirdariaSubPeriod[];
}

interface FirdariaResponse {
  current_period?: FirdariaPeriod;
  current_sub_period?: FirdariaSubPeriod;
  periods: FirdariaPeriod[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'This is your time to be seen. Expect doors to open that have been locked for years — career breakthroughs, public recognition, or a sudden platform that puts you center-stage. Someone in a position of authority is likely to notice you and offer something significant. Your confidence will surge, and decisions you make now about your identity and direction will define the next decade. A creative project started during this window has an unusually high chance of succeeding. Do not hide. The spotlight is finding you whether you are ready or not.',
  Moon: 'Your inner world is about to demand attention. Expect emotional revelations — buried feelings, unresolved family dynamics, and memories you thought you had processed will resurface with new intensity. A woman or maternal figure may play a pivotal role in this period. Your home situation is likely to shift: a move, a renovation, a change in who lives with you, or a complete redefinition of what "home" means. Your intuition will be sharper than usual — trust it over logic. Dreams during this period may contain literal previews of coming events. Pay attention.',
  Mars: 'Conflict is coming — and it is not something to fear. A confrontation you have been avoiding will finally arrive, and how you handle it will shape your personal power for years. Expect a surge of physical energy, sexual intensity, or competitive drive. Someone may challenge you directly, or you may find yourself fighting for something you believe in with a ferocity that surprises even you. Injuries, surgeries, or physical breakthroughs are more likely during Mars periods. A bold, risky move — one that requires courage rather than caution — is favored now. Hesitation is your only real enemy.',
  Mercury: 'Your mind is about to become your greatest asset. Expect important contracts, negotiations, or written communications that significantly alter your trajectory. A message, email, or conversation that changes everything is coming. Learning accelerates — you may pick up a new skill, start a course, or have an intellectual breakthrough that reframes how you see the world. Travel for business or learning purposes is likely. Your words carry unusual weight now: what you say, write, or sign during this period will have consequences far beyond the moment.',
  Jupiter: 'This is one of the most fortunate periods in your entire Firdaria cycle. Opportunities will appear that seem almost too good to be true — but many of them are genuine. Expect expansion in wealth, wisdom, travel, or spiritual understanding. A teacher, mentor, or guide may enter your life and change your perspective permanently. Legal matters tend to resolve favorably. Foreign connections or long-distance opportunities are highlighted. The danger is overexpansion — saying yes to everything. Choose the biggest, most meaningful opportunity and pour yourself into it.',
  Venus: 'Love is about to reorganize your life. Whether single or partnered, expect a significant shift in your romantic landscape — a new relationship, a deepening of an existing one, or a beautiful ending that creates space for something better. Your sense of beauty, taste, and personal style will evolve. Financial gain through partnerships, art, or beauty-related ventures is favored. Reconciliations with people you have been distant from become possible. The world will feel softer, more beautiful, and more pleasurable during this time. Enjoy it — but do not mistake comfort for complacency.',
  Saturn: 'This is not a punishment — it is a crucible. Saturn periods strip away everything that is not built on solid ground. Expect tests of discipline, patience, and commitment. Something you have been avoiding — a responsibility, a debt, a difficult conversation, a structural problem in your life — will demand resolution. Career advancement is possible, but only through demonstrated competence and sustained effort. Authority figures will be both your greatest challengers and your greatest teachers. What you build during this period, if you build it properly, will last for decades. Nothing Saturn gives you can be taken away.',
  'North Node': 'Destiny is activating. Expect to be pulled toward situations, people, and opportunities that feel unfamiliar and slightly uncomfortable — this is exactly where you need to go. The North Node period brings encounters that feel fated: meeting someone who changes your life path, discovering a purpose you did not know you had, or being placed in circumstances that force you to grow in ways you would never choose voluntarily. Resistance is futile and counterproductive. The universe is correcting your course. Lean in, even when — especially when — it terrifies you.',
  'South Node': 'Something is ending, and you must let it go. The South Node period brings the completion of karmic cycles — relationships, jobs, living situations, or identities that have served their purpose will begin to dissolve. This is not loss; it is liberation. People from your past may reappear with unfinished business. Old patterns you thought you had outgrown will make one final appearance, giving you the chance to choose differently. What you release during this period makes room for the new life that is trying to reach you. Holding on is the only mistake you can make.',
  Vesta: 'A period of sacred focus descends upon your life. You will feel called to devote yourself completely to one thing — a project, a practice, a person, or a cause — with monk-like intensity. Distractions will fall away naturally. Your capacity for concentrated effort will be extraordinary. Something you have been half-committed to will demand full devotion, and the results of that devotion will exceed your expectations. Sexual and creative energy may be redirected into your work. Sacrifice is required, but what you sacrifice will prove to have been worth far less than what you gain.',
  Juno: 'Partnership dynamics are about to intensify. Expect commitments to be tested, renegotiated, or formalized. If you are in a relationship, the terms of your partnership — spoken and unspoken — will come under scrutiny. Contracts, agreements, and collaborative ventures are highlighted. A new partnership that begins during this period has the potential to become one of the most significant alliances of your life. The key is equality: any relationship that operates on an imbalance of power will be exposed and must be corrected or released.',
  Pluto: 'Prepare for transformation at the deepest level. Something in your life is about to die so that something more powerful can be born. This may manifest as a major ending — a relationship, a career, an identity, a belief system — that strips you down to your core. Power dynamics will intensify: you may gain significant power, lose it, or be forced to confront how you use it. Secrets come to the surface. Obsessions and compulsions reveal themselves. The person you are at the end of this period will be fundamentally different from the person you are now. Do not resist the process.',
  Uranus: 'Expect the unexpected — and expect it to be liberating. Sudden changes, breakdowns that become breakthroughs, and shocking revelations are all on the table. A structure you thought was permanent may collapse overnight, freeing you from something you did not realize was a cage. Technology, innovation, and unconventional approaches are heavily favored. You may make a decision that others see as reckless but that you experience as the most authentic choice you have ever made. Freedom is not just calling — it is arriving, ready or not.',
  Neptune: 'The veil between worlds is thinning. Expect your intuition, dreams, and spiritual sensitivity to intensify dramatically. Creative inspiration will flood in — but so may confusion, deception, or disillusionment. Something you believed to be true may turn out to be an illusion, and the revelation — though painful — will ultimately set you free. Artistic and spiritual pursuits are heavily favored. Be careful with substances, financial schemes, and people who seem too good to be true. The magic is real, but so are the mirages. Discernment is everything.',
};

const PLANET_KEYWORDS: Record<string, string> = {
  Sun: 'public recognition, career breakthroughs, and bold self-expression',
  Moon: 'emotional revelations, family shifts, and deepening intuition',
  Mars: 'decisive confrontation, physical intensity, and courageous action',
  Mercury: 'pivotal communications, intellectual breakthroughs, and important agreements',
  Jupiter: 'fortunate expansion, wealth opportunities, and encounters with mentors',
  Venus: 'romantic transformation, beauty, and partnership evolution',
  Saturn: 'structural testing, karmic discipline, and long-term mastery',
  'North Node': 'fated encounters, uncomfortable growth, and destiny activation',
  'South Node': 'karmic completions, releasing the past, and necessary endings',
  Vesta: 'sacred devotion, monk-like focus, and sacrificial breakthroughs',
  Juno: 'partnership renegotiation, formal commitments, and alliance testing',
  Pluto: 'deep transformation, power shifts, and identity death-rebirth',
  Uranus: 'sudden liberation, shocking revelations, and structural collapse',
  Neptune: 'spiritual intensification, creative flooding, and illusion-dissolution',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#F59E0B',
  Moon: '#C4B5FD',
  Mercury: '#3B82F6',
  Venus: '#EC4899',
  Mars: '#EF4444',
  Jupiter: '#8B5CF6',
  Saturn: '#6B7280',
  'North Node': '#10B981',
  'South Node': '#9CA3AF',
  Vesta: '#F97316',
  Juno: '#EC4899',
  Pluto: '#7C3AED',
  Uranus: '#06B6D4',
  Neptune: '#6366F1',
};

const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

const DAY_CHART_ORDER: { planet: string; years: number }[] = [
  { planet: 'Sun', years: 10 },
  { planet: 'Venus', years: 8 },
  { planet: 'Mercury', years: 13 },
  { planet: 'Moon', years: 9 },
  { planet: 'Saturn', years: 11 },
  { planet: 'Jupiter', years: 12 },
  { planet: 'Mars', years: 7 },
  { planet: 'North Node', years: 3 },
  { planet: 'South Node', years: 2 },
];

const NIGHT_CHART_ORDER: { planet: string; years: number }[] = [
  { planet: 'Moon', years: 9 },
  { planet: 'Saturn', years: 11 },
  { planet: 'Jupiter', years: 12 },
  { planet: 'Mars', years: 7 },
  { planet: 'Sun', years: 10 },
  { planet: 'Venus', years: 8 },
  { planet: 'Mercury', years: 13 },
  { planet: 'North Node', years: 3 },
  { planet: 'South Node', years: 2 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const BLENDED_TEMPLATES = [
  (main: string, sub: string, mk: string, sk: string) =>
    `${sub} now steers the ship within your ${main} era. Where ${main} has been setting the stage through ${mk}, ${sub} sharpens the focus toward ${sk}. Events in the coming months will carry both signatures — watch for moments where ambition meets opportunity in a distinctly ${sub}-flavored way.`,
  (main: string, sub: string, mk: string, sk: string) =>
    `Your ${main} chapter enters a new gear as ${sub} takes the lead. The broad strokes of ${mk} are now expressing themselves through ${sk}. This is the window where ${main}'s long-term story advances through ${sub}'s specific toolkit — expect tangible movement in areas you have been patient about.`,
  (main: string, sub: string, mk: string, sk: string) =>
    `Think of ${main} as the season and ${sub} as the weather. The underlying climate of ${mk} remains, but daily life now tastes like ${sk}. Decisions made during this sub-period tend to have an outsized impact on how the rest of your ${main} era unfolds.`,
  (main: string, sub: string, mk: string, sk: string) =>
    `${sub} arrives as a guest in ${main}'s house, bringing gifts of ${sk}. The ongoing themes of ${mk} do not pause — they accelerate, filtered through ${sub}'s lens. Pay attention to people and opportunities that appear now; they are connected to the bigger ${main} story even when they seem unrelated.`,
  (main: string, sub: string, mk: string, sk: string) =>
    `A pivot point within your ${main} period. ${sub} introduces a current of ${sk} into the larger river of ${mk}. This is less a detour and more a deepening — the same life themes, now experienced through a different instrument. Let ${sub}'s energy show you what ${main} has been building toward.`,
];

function getBlendedInterpretation(mainPlanet: string, subPlanet: string): string {
  const mainKeywords = PLANET_KEYWORDS[mainPlanet] || mainPlanet;
  const subKeywords = PLANET_KEYWORDS[subPlanet] || subPlanet;

  if (mainPlanet === subPlanet) {
    return `The ${mainPlanet} energy is doubled and at maximum intensity. Everything described in the main period is now operating at its peak. Expect the themes of ${mainKeywords} to become impossible to ignore. This is the sub-period where the most defining events of your entire ${mainPlanet} era are most likely to occur. Pay close attention — what happens now sets the tone for everything that follows.`;
  }

  const hash = (mainPlanet.length * 7 + subPlanet.length * 13) % BLENDED_TEMPLATES.length;
  return BLENDED_TEMPLATES[hash](mainPlanet, subPlanet, mainKeywords, subKeywords);
}

function getL3Interpretation(l1Planet: string, l2Planet: string, l3Planet: string): string {
  const l3Keywords = PLANET_KEYWORDS[l3Planet] || l3Planet;
  if (l1Planet === l2Planet && l2Planet === l3Planet) {
    return `Triple ${l3Planet} concentration. This is the single most potent micro-window in your entire ${l3Planet} era. The themes of ${l3Keywords} are at absolute maximum intensity. If there is one moment in this period where a defining event occurs — this is likely it.`;
  }
  if (l1Planet === l3Planet || l2Planet === l3Planet) {
    const matchedPlanet = l1Planet === l3Planet ? l1Planet : l2Planet;
    return `${matchedPlanet} energy resurfaces, reinforcing the dominant theme. Expect a callback to earlier patterns: ${PLANET_KEYWORDS[matchedPlanet] || matchedPlanet}. This micro-window amplifies what is already in motion, potentially accelerating outcomes you have been waiting on.`;
  }
  return `A brief but potent window where ${l3Planet} enters the mix, bringing a micro-burst of ${l3Keywords}. Within your larger ${l1Planet}/${l2Planet} theme, watch for sudden ${l3Planet}-flavored events: a quick conversation, an unexpected encounter, or a flash of insight that subtly redirects the bigger story. These micro-moments often prove more significant than they appear at first.`;
}

function getChaldeanCycleFrom(ruler: string): string[] {
  let startIdx = CHALDEAN_ORDER.indexOf(ruler);
  if (startIdx === -1) startIdx = 0;
  const cycle: string[] = [];
  for (let i = 0; i < 7; i++) {
    cycle.push(CHALDEAN_ORDER[(startIdx + i) % 7]);
  }
  return cycle;
}

function generateLocalFirdaria(birthDate: string, isNightChart: boolean): FirdariaResponse {
  const order = isNightChart ? NIGHT_CHART_ORDER : DAY_CHART_ORDER;
  const birth = new Date(birthDate);
  const now = new Date();

  let cursor = new Date(birth);
  const periods: FirdariaPeriod[] = [];

  for (const { planet, years } of order) {
    const periodStart = new Date(cursor);
    const periodEnd = new Date(cursor);
    periodEnd.setFullYear(periodEnd.getFullYear() + years);

    const subCycle = getChaldeanCycleFrom(planet);
    const subDurationMs = (periodEnd.getTime() - periodStart.getTime()) / 7;
    const subPeriods: FirdariaSubPeriod[] = [];

    let subCursor = new Date(periodStart);
    for (let s = 0; s < 7; s++) {
      const subStart = new Date(subCursor);
      const subEnd = new Date(subCursor.getTime() + subDurationMs);
      const subPlanet = subCycle[s];

      const subSubCycle = getChaldeanCycleFrom(subPlanet);
      const subSubDurationMs = subDurationMs / 7;
      const subSubPeriods: FirdariaSubSubPeriod[] = [];

      let ssCursor = new Date(subStart);
      for (let ss = 0; ss < 7; ss++) {
        const ssStart = new Date(ssCursor);
        const ssEnd = new Date(ssCursor.getTime() + subSubDurationMs);
        subSubPeriods.push({
          planet: subSubCycle[ss],
          start_date: ssStart.toISOString().split('T')[0],
          end_date: ssEnd.toISOString().split('T')[0],
          is_current: now >= ssStart && now < ssEnd,
        });
        ssCursor = ssEnd;
      }

      subPeriods.push({
        planet: subPlanet,
        start_date: subStart.toISOString().split('T')[0],
        end_date: subEnd.toISOString().split('T')[0],
        is_current: now >= subStart && now < subEnd,
        sub_sub_periods: subSubPeriods,
      });
      subCursor = subEnd;
    }

    periods.push({
      planet,
      start_date: periodStart.toISOString().split('T')[0],
      end_date: periodEnd.toISOString().split('T')[0],
      is_current: now >= periodStart && now < periodEnd,
      sub_periods: subPeriods,
    });

    cursor = periodEnd;
  }

  const currentPeriod = periods.find((p) => p.is_current);
  const currentSubPeriod = currentPeriod?.sub_periods?.find((sp) => sp.is_current);

  return { periods, current_period: currentPeriod, current_sub_period: currentSubPeriod };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getYearSpan(start: string, end: string) {
  const s = new Date(start).getFullYear();
  const e = new Date(end).getFullYear();
  return `${s} – ${e}`;
}

function getPlanetColor(planet: string) {
  return PLANET_COLORS[planet] || '#8B5CF6';
}

function getProgressInfo(period: FirdariaPeriod) {
  const start = new Date(period.start_date).getTime();
  const end = new Date(period.end_date).getTime();
  const now = Date.now();
  const totalYears = (end - start) / (365.25 * 24 * 60 * 60 * 1000);
  const elapsedYears = (now - start) / (365.25 * 24 * 60 * 60 * 1000);
  const remainingYears = Math.max(0, (end - now) / (365.25 * 24 * 60 * 60 * 1000));
  const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  return {
    totalYears: Math.round(totalYears * 10) / 10,
    currentYear: Math.min(Math.ceil(elapsedYears), Math.round(totalYears)),
    remainingYears: Math.round(remainingYears * 10) / 10,
    pct,
  };
}

function findPeriodForDate(periods: FirdariaPeriod[], targetDate: Date): { l1?: FirdariaPeriod; l2?: FirdariaSubPeriod; l3?: FirdariaSubSubPeriod } {
  for (const p of periods) {
    const pStart = new Date(p.start_date);
    const pEnd = new Date(p.end_date);
    if (targetDate >= pStart && targetDate < pEnd) {
      const l2 = p.sub_periods?.find(sp => {
        const s = new Date(sp.start_date);
        const e = new Date(sp.end_date);
        return targetDate >= s && targetDate < e;
      });
      const l3 = l2?.sub_sub_periods?.find(ssp => {
        const s = new Date(ssp.start_date);
        const e = new Date(ssp.end_date);
        return targetDate >= s && targetDate < e;
      });
      return { l1: p, l2, l3 };
    }
  }
  return {};
}

// ─── Visual Timeline Bar ───────────────────────────────────────────────────

function TimelineBar({ periods }: { periods: FirdariaPeriod[] }) {
  if (!periods.length) return null;
  const totalStart = new Date(periods[0].start_date).getTime();
  const totalEnd = new Date(periods[periods.length - 1].end_date).getTime();
  const totalSpan = totalEnd - totalStart;
  const now = Date.now();
  const nowPct = Math.min(100, Math.max(0, ((now - totalStart) / totalSpan) * 100));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-[10px] text-text-muted mb-1.5">
        <span>{new Date(periods[0].start_date).getFullYear()}</span>
        <span>{new Date(periods[periods.length - 1].end_date).getFullYear()}</span>
      </div>
      <div className="relative h-8 rounded-full overflow-hidden flex" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
        {periods.map((p, i) => {
          const pStart = new Date(p.start_date).getTime();
          const pEnd = new Date(p.end_date).getTime();
          const widthPct = ((pEnd - pStart) / totalSpan) * 100;
          const isPast = pEnd < now;
          const isCurrent = p.is_current;
          const color = getPlanetColor(p.planet);
          return (
            <div
              key={i}
              className="relative h-full flex items-center justify-center group"
              style={{
                width: `${widthPct}%`,
                backgroundColor: isCurrent ? color + '55' : isPast ? color + '20' : color + '15',
                borderRight: i < periods.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none',
              }}
              title={`${p.planet} (${getYearSpan(p.start_date, p.end_date)})`}
            >
              {widthPct > 6 && (
                <span className="text-[9px] font-bold truncate px-0.5" style={{ color: isCurrent ? '#fff' : isPast ? color + '99' : color + '77' }}>
                  {getPlanetGlyph(p.planet)}
                </span>
              )}
            </div>
          );
        })}
        {/* YOU ARE HERE marker */}
        <div
          className="absolute top-0 h-full flex flex-col items-center z-10"
          style={{ left: `${nowPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-0.5 h-full bg-white" style={{ boxShadow: '0 0 6px rgba(255,255,255,0.6)' }} />
        </div>
      </div>
      <div className="relative mt-1" style={{ height: '14px' }}>
        <div
          className="absolute text-[9px] font-bold text-white bg-accent-primary px-1.5 py-0.5 rounded whitespace-nowrap"
          style={{ left: `${nowPct}%`, transform: 'translateX(-50%)' }}
        >
          YOU ARE HERE
        </div>
      </div>
    </div>
  );
}

// ─── Copy Button ────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
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
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function FirdariaPage() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FirdariaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedL1, setExpandedL1] = useState<number | null>(null);
  const [expandedL2, setExpandedL2] = useState<string | null>(null);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [lookupDate, setLookupDate] = useState('');
  const [lookupResult, setLookupResult] = useState<{ l1?: FirdariaPeriod; l2?: FirdariaSubPeriod; l3?: FirdariaSubSubPeriod } | null>(null);

  const firstName = profile?.display_name?.split(' ')[0] || 'Friend';

  const handleDateLookup = useCallback(() => {
    if (!lookupDate || !data?.periods) return;
    const target = new Date(lookupDate);
    const result = findPeriodForDate(data.periods, target);
    setLookupResult(result.l1 ? result : null);
  }, [lookupDate, data]);

  const progressInfo = useMemo(() => {
    const cp = data?.current_period || data?.periods?.find((p) => p.is_current);
    return cp ? getProgressInfo(cp) : null;
  }, [data]);

  const loadData = useCallback(async () => {
    if (!profile?.birth_date || !profile?.latitude) {
      setError('Birth data is required. Please set up your chart first.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      try {
        const birthData = buildBirthData(profile);
        const res = await api.getFirdaria(birthData);
        setData(res);
      } catch {
        // Fallback: generate locally
        const birthDate = profile.birth_date || '';
        if (!birthDate) {
          setError('Birth date is required to calculate Firdaria.');
          return;
        }
        const birthTime = profile.birth_time || '12:00';
        const hour = parseInt(birthTime.split(':')[0], 10);
        const isNight = hour < 6 || hour >= 18;
        const localData = generateLocalFirdaria(birthDate, isNight);
        setData(localData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load Firdaria data');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Auto-load on mount
  useEffect(() => {
    if (profile?.birth_date && profile?.latitude) {
      loadData();
    }
  }, [loadData, profile?.birth_date, profile?.latitude]);

  // AI Reading
  const loadAIReading = useCallback(async (
    l1: FirdariaPeriod | undefined,
    l2: FirdariaSubPeriod | undefined,
    l3: FirdariaSubSubPeriod | undefined,
  ) => {
    if (!l1 || !profile || aiLoading) return;
    setAiLoading(true);
    setAiText('');

    const l1Range = `${formatDate(l1.start_date)} — ${formatDate(l1.end_date)}`;
    const l2Range = l2 ? `${formatDate(l2.start_date)} — ${formatDate(l2.end_date)}` : '';
    const l3Range = l3 ? `${formatDate(l3.start_date)} — ${formatDate(l3.end_date)}` : '';

    const systemPrompt = `You are a master Persian/Medieval astrologer specializing in Firdaria — the planetary time-lord system inherited from Abu Ma'shar and Al-Biruni. You provide personalized readings about the person's current Firdaria periods.

You understand the three levels:
- L1 (Major Period): The main planetary ruler for several years. Sets the overarching theme of this life chapter.
- L2 (Sub-Period): A Chaldean-cycle sub-ruler lasting months to a couple years. Specifies the active channel inside the major theme.
- L3 (Sub-Sub-Period): A micro-ruler lasting weeks. Gives the immediate day-to-day flavor.

INSTRUCTIONS:
- Use the person's first name throughout.
- Do NOT give generic planet descriptions. Tie every observation to how the combination of L1/L2/L3 is actually playing out in this person's life right now.
- Be specific about timing: reference the date ranges you were given.
- No disclaimers, no "the universe is" mysticism filler, no bullet lists dumped at the end. Write like a wise consultant speaking directly.
- 500-800 words.`;

    const userPrompt = `Please interpret the current Firdaria periods for ${firstName}.

ACTIVE PERIODS:
L1 (Major): ${l1.planet}  [${l1Range}]
${l2 ? `L2 (Sub-Period): ${l2.planet}  [${l2Range}]` : ''}
${l3 ? `L3 (Micro-Period): ${l3.planet}  [${l3Range}]` : ''}

Please cover:
1. A warm greeting to ${firstName}.
2. The L1 theme — what ${l1.planet} is currently demanding of them at the life-chapter level.
3. The L2 channel — how ${l2 ? l2.planet : 'the current sub-ruler'} is reshaping that theme right now.
${l3 ? `4. The L3 flavor — what ${l3.planet} is layering onto the present weeks.` : ''}
${l3 ? '5' : '4'}. Practical guidance for navigating this exact combination — what to lean into, what to release.
${l3 ? '6' : '5'}. A grounded closing note about where this period is taking them.

Make it feel like a private consultation, not a horoscope.`;

    try {
      await api.streamAIInterpretation(
        {
          type: 'firdaria',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 3500,
        },
        (chunk: string) => setAiText((prev) => prev + chunk),
        () => {},
      );
    } catch {
      setAiText('');
    } finally {
      setAiLoading(false);
    }
  }, [profile, firstName, aiLoading]);

  // Fire AI reading once data loads
  useEffect(() => {
    if (!data || !profile) return;
    const l1 = data.current_period || data.periods?.find((p) => p.is_current);
    const l2 = data.current_sub_period || l1?.sub_periods?.find((sp) => sp.is_current);
    const l3 = l2?.sub_sub_periods?.find((ssp) => ssp.is_current);
    if (l1 && aiText.length === 0 && !aiLoading) {
      loadAIReading(l1, l2, l3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, profile]);

  const toggleL1 = (index: number) => {
    setExpandedL1(expandedL1 === index ? null : index);
    setExpandedL2(null);
  };

  const toggleL2 = (l1Index: number, l2Index: number) => {
    const key = `${l1Index}-${l2Index}`;
    setExpandedL2(expandedL2 === key ? null : key);
  };

  // Show initial state if no birth data
  if (!profile?.birth_date || !profile?.latitude) {
    return (
      <PaywallGate feature="firdaria" fallbackTier="pro">
        <div className="max-w-3xl mx-auto">
          <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Readings
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <Hourglass className="w-8 h-8 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-display font-bold text-text-primary">Firdaria</h1>
              <p className="text-text-tertiary text-sm">Time-Lord periods revealing life&apos;s unfolding chapters</p>
            </div>
          </div>
          <div className="card text-center py-12">
            <p className="text-text-tertiary mb-4">
              Birth data is required to calculate Firdaria. Please set up your chart first.
            </p>
            <Link href="/chart" className="btn-primary inline-block">Go to Chart</Link>
          </div>
        </div>
      </PaywallGate>
    );
  }

  if (loading) {
    return (
      <PaywallGate feature="firdaria" fallbackTier="pro">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary mb-4" />
          <p className="text-text-tertiary">Loading Firdaria...</p>
        </div>
      </PaywallGate>
    );
  }

  if (error) {
    return (
      <PaywallGate feature="firdaria" fallbackTier="pro">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button onClick={loadData} className="btn-primary">Retry</button>
        </div>
      </PaywallGate>
    );
  }

  const currentPeriod = data?.current_period || data?.periods?.find((p) => p.is_current);
  const currentSubPeriod = data?.current_sub_period || currentPeriod?.sub_periods?.find((sp) => sp.is_current);
  const currentSubSubPeriod = currentSubPeriod?.sub_sub_periods?.find((ssp) => ssp.is_current);

  return (
    <PaywallGate feature="firdaria" fallbackTier="pro">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Readings
        </Link>

        <h1 className="text-2xl font-display font-bold text-text-primary mt-2">Firdaria</h1>
        <p className="text-sm text-text-tertiary mb-4">Time-Lord periods revealing life&apos;s unfolding chapters</p>

        {/* Onboarding Intro */}
        {showIntro && (
          <div className="rounded-xl p-4 border border-accent-primary/20 bg-accent-primary/5 mb-6 relative">
            <button
              onClick={() => setShowIntro(false)}
              className="absolute top-2 right-3 text-text-muted hover:text-text-primary text-lg leading-none"
              aria-label="Dismiss"
            >&times;</button>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text-primary mb-1">What is Firdaria?</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Firdaria is a Persian time-lord system from medieval astrology. Your life is divided into major planetary periods (7–13 years each), sub-periods (months to years), and micro-periods (weeks). Each planet &quot;rules&quot; its window, shaping the themes you experience. Think of it as your life&apos;s soundtrack — the major period sets the genre, the sub-period picks the song, and the micro-period chooses the verse you&apos;re living right now.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Visual Timeline */}
        {data?.periods && <TimelineBar periods={data.periods} />}

        {/* Date Lookup */}
        <div className="rounded-xl p-4 border border-border-primary bg-bg-tertiary mb-6">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarSearch className="w-3.5 h-3.5" />
            Date Lookup
          </p>
          <p className="text-[11px] text-text-muted mb-3">What Firdaria period were you in on any date?</p>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={lookupDate}
              onChange={(e) => { setLookupDate(e.target.value); setLookupResult(null); }}
              className="flex-1 text-sm bg-bg-secondary border border-border-primary rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
            <button
              onClick={handleDateLookup}
              disabled={!lookupDate}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Look Up
            </button>
          </div>
          {lookupResult && lookupResult.l1 && (
            <div className="mt-3 p-3 rounded-lg border border-border-primary bg-bg-secondary">
              <p className="text-xs text-text-muted mb-1">On {formatDate(lookupDate)}:</p>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: getPlanetColor(lookupResult.l1.planet) }}>{getPlanetGlyph(lookupResult.l1.planet)}</span>
                <span className="text-sm font-semibold text-text-primary">L1: {lookupResult.l1.planet}</span>
                <span className="text-[11px] text-text-muted">{getYearSpan(lookupResult.l1.start_date, lookupResult.l1.end_date)}</span>
              </div>
              {lookupResult.l2 && (
                <div className="flex items-center gap-2 mb-1 ml-3">
                  <span style={{ color: getPlanetColor(lookupResult.l2.planet) }}>{getPlanetGlyph(lookupResult.l2.planet)}</span>
                  <span className="text-xs font-medium text-text-secondary">L2: {lookupResult.l2.planet}</span>
                  <span className="text-[10px] text-text-muted">{formatDate(lookupResult.l2.start_date)} — {formatDate(lookupResult.l2.end_date)}</span>
                </div>
              )}
              {lookupResult.l3 && (
                <div className="flex items-center gap-2 ml-6">
                  <span style={{ color: getPlanetColor(lookupResult.l3.planet) }}>{getPlanetGlyph(lookupResult.l3.planet)}</span>
                  <span className="text-[11px] font-medium text-text-secondary">L3: {lookupResult.l3.planet}</span>
                  <span className="text-[10px] text-text-muted">{formatDate(lookupResult.l3.start_date)} — {formatDate(lookupResult.l3.end_date)}</span>
                </div>
              )}
            </div>
          )}
          {lookupResult === null && lookupDate && (
            <p className="text-[11px] text-text-muted mt-2">Enter a date and click Look Up to see which period it falls in.</p>
          )}
        </div>

        {/* Current Period Highlight */}
        {currentPeriod && (
          <div
            className="rounded-xl p-6 border mb-6"
            style={{
              background: `linear-gradient(135deg, ${getPlanetColor(currentPeriod.planet)}22, rgba(139,92,246,0.03))`,
              borderColor: 'rgba(139,92,246,0.3)',
            }}
          >
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-accent-secondary bg-accent-muted px-2 py-0.5 rounded mb-4">
              CURRENT PERIOD
            </span>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl" style={{ color: getPlanetColor(currentPeriod.planet) }}>
                {getPlanetGlyph(currentPeriod.planet) || currentPeriod.planet}
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-text-primary">{currentPeriod.planet}</h2>
                <p className="text-sm text-text-tertiary">
                  {formatDate(currentPeriod.start_date)} &mdash; {formatDate(currentPeriod.end_date)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {progressInfo && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                  <span>Year {progressInfo.currentYear} of {progressInfo.totalYears}</span>
                  <span>{progressInfo.remainingYears} years remaining</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressInfo.pct}%`,
                      backgroundColor: getPlanetColor(currentPeriod.planet),
                    }}
                  />
                </div>
              </div>
            )}

            <p className="text-sm text-text-secondary leading-relaxed mb-1">
              {PLANET_MEANINGS[currentPeriod.planet] || ''}
            </p>
            <CopyBtn text={PLANET_MEANINGS[currentPeriod.planet] || ''} />

            {/* AI Reading */}
            {(aiLoading || aiText.length > 0) && (
              <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.25)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-primary">
                    {aiLoading && aiText.length === 0 ? 'Channeling your personal reading…' : 'Your Personal Reading'}
                  </span>
                  {aiLoading && aiText.length > 0 && <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />}
                </div>
                {aiText.length > 0 && (
                  <>
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">{aiText}</p>
                    <CopyBtn text={aiText} />
                  </>
                )}
              </div>
            )}

            {/* Current Sub-Period (L2) */}
            {currentSubPeriod && (
              <div className="mt-4 pt-4 border-t border-border-primary">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Sub-Period (L2)</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl" style={{ color: getPlanetColor(currentSubPeriod.planet) }}>
                    {getPlanetGlyph(currentSubPeriod.planet) || currentSubPeriod.planet}
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary">{currentSubPeriod.planet}</p>
                    <p className="text-xs text-text-tertiary">
                      {formatDate(currentSubPeriod.start_date)} &mdash; {formatDate(currentSubPeriod.end_date)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic">
                  {getBlendedInterpretation(currentPeriod.planet, currentSubPeriod.planet)}
                </p>
                <CopyBtn text={getBlendedInterpretation(currentPeriod.planet, currentSubPeriod.planet)} />
              </div>
            )}

            {/* Current Sub-Sub-Period (L3) */}
            {currentSubSubPeriod && currentSubPeriod && (
              <div className="mt-4 pt-4 border-t border-border-primary">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Sub-Sub-Period (L3)</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl" style={{ color: getPlanetColor(currentSubSubPeriod.planet) }}>
                    {getPlanetGlyph(currentSubSubPeriod.planet) || currentSubSubPeriod.planet}
                  </span>
                  <div>
                    <p className="font-medium text-text-primary">{currentSubSubPeriod.planet}</p>
                    <p className="text-xs text-text-tertiary">
                      {formatDate(currentSubSubPeriod.start_date)} &mdash; {formatDate(currentSubSubPeriod.end_date)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed italic">
                  {getL3Interpretation(currentPeriod.planet, currentSubPeriod.planet, currentSubSubPeriod.planet)}
                </p>
                <CopyBtn text={getL3Interpretation(currentPeriod.planet, currentSubPeriod.planet, currentSubSubPeriod.planet)} />
              </div>
            )}
          </div>
        )}

        {/* Full Timeline */}
        <h3 className="text-lg font-bold text-text-primary mt-8 mb-1">Full Timeline</h3>
        <p className="text-xs text-text-muted mb-4">Tap a period to expand sub-periods</p>

        <div className="space-y-3">
          {(data?.periods || []).map((period, index) => {
            const isCurrent = period.is_current || period === currentPeriod;
            const isPast = new Date(period.end_date) < new Date();
            const planetColor = getPlanetColor(period.planet);
            const isExpanded = expandedL1 === index;

            const isFuture = !isCurrent && !isPast;

            return (
              <div key={`period-${index}`}>
                {/* L1 Period Row */}
                <button
                  onClick={() => toggleL1(index)}
                  className="w-full text-left"
                >
                  <div
                    className="rounded-lg px-4 py-3 border transition-colors"
                    style={{
                      background: isCurrent
                        ? `linear-gradient(90deg, ${planetColor}44, ${planetColor}22)`
                        : isPast
                        ? 'rgba(255,255,255,0.015)'
                        : `linear-gradient(90deg, ${planetColor}12, ${planetColor}06)`,
                      borderColor: isCurrent ? planetColor : isPast ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
                      borderWidth: isCurrent ? 1.5 : 1,
                      borderLeftWidth: isCurrent ? 3 : isPast ? 1 : 2,
                      borderLeftColor: isCurrent ? planetColor : isPast ? 'rgba(255,255,255,0.04)' : planetColor + '55',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-2xl w-8 text-center"
                        style={{ color: isCurrent ? planetColor : isPast ? 'rgba(255,255,255,0.3)' : planetColor + 'AA' }}
                      >
                        {getPlanetGlyph(period.planet) || period.planet}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isCurrent ? 'text-text-primary font-bold' : isPast ? 'text-text-muted line-through decoration-1' : 'text-text-primary'}`}>
                          {period.planet}
                          {isPast && <span className="text-[10px] font-normal no-underline ml-2 text-text-muted">(past)</span>}
                          {isFuture && <span className="text-[10px] font-normal ml-2 text-text-muted">(upcoming)</span>}
                        </p>
                        <p className={`text-xs ${isPast ? 'text-text-muted' : 'text-text-tertiary'}`}>
                          {getYearSpan(period.start_date, period.end_date)}
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: planetColor }} />
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Theme description */}
                  <p className={`text-xs mt-1 ml-11 ${isPast ? 'text-text-muted/60' : 'text-text-muted'} ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {PLANET_MEANINGS[period.planet] || ''}
                  </p>
                  <div className="ml-11">
                    <CopyBtn text={PLANET_MEANINGS[period.planet] || ''} />
                  </div>
                </button>

                {/* L2 Sub-Periods (expanded) */}
                {isExpanded && period.sub_periods && period.sub_periods.length > 0 && (
                  <div className="ml-6 mt-2 space-y-2">
                    {period.sub_periods.map((sub, subIdx) => {
                      const isSubCurrent = sub.is_current;
                      const isSubPast = new Date(sub.end_date) < new Date();
                      const subColor = getPlanetColor(sub.planet);
                      const l2Key = `${index}-${subIdx}`;
                      const isL2Expanded = expandedL2 === l2Key;

                      return (
                        <div key={`sub-${index}-${subIdx}`} className={isSubPast && !isSubCurrent ? 'opacity-50' : ''}>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleL2(index, subIdx); }}
                            className="w-full text-left"
                          >
                            <div
                              className="rounded-lg p-3 border"
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                borderColor: isSubCurrent ? subColor : 'rgba(255,255,255,0.06)',
                                borderWidth: isSubCurrent ? 1 : 1,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-0.5 h-6 rounded" style={{ backgroundColor: planetColor + '44' }} />
                                <span className="text-lg w-7 text-center" style={{ color: subColor }}>
                                  {getPlanetGlyph(sub.planet) || sub.planet}
                                </span>
                                <div className="flex-1">
                                  <p className={`text-xs font-medium ${isSubCurrent ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>
                                    {sub.planet}
                                  </p>
                                  <p className="text-[11px] text-text-muted">
                                    {formatDate(sub.start_date)} &mdash; {formatDate(sub.end_date)}
                                  </p>
                                </div>
                                {isSubCurrent && (
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subColor }} />
                                )}
                                {isL2Expanded ? (
                                  <ChevronUp className="w-3 h-3 text-text-muted" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 text-text-muted" />
                                )}
                              </div>
                              <p className={`text-[11px] text-text-muted leading-relaxed mt-1 ml-9 ${isL2Expanded ? '' : 'line-clamp-2'}`}>
                                {getBlendedInterpretation(period.planet, sub.planet)}
                              </p>
                              <div className="ml-9">
                                <CopyBtn text={getBlendedInterpretation(period.planet, sub.planet)} />
                              </div>
                            </div>
                          </button>

                          {/* L3 Sub-Sub-Periods */}
                          {isL2Expanded && sub.sub_sub_periods && sub.sub_sub_periods.length > 0 && (
                            <div className="ml-3 mt-1 space-y-1">
                              {sub.sub_sub_periods.map((subsub, ssubIdx) => {
                                const isSSubCurrent = subsub.is_current;
                                const isSSubPast = new Date(subsub.end_date) < new Date();
                                const ssubColor = getPlanetColor(subsub.planet);

                                return (
                                  <div
                                    key={`subsub-${index}-${subIdx}-${ssubIdx}`}
                                    className={`rounded-lg p-2 border ${isSSubPast && !isSSubCurrent ? 'opacity-45' : ''}`}
                                    style={{
                                      backgroundColor: 'rgba(255,255,255,0.01)',
                                      borderColor: isSSubCurrent ? ssubColor : 'rgba(255,255,255,0.04)',
                                    }}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-0.5 h-5 rounded" style={{ backgroundColor: subColor + '33' }} />
                                      <span className="text-base w-6 text-center" style={{ color: ssubColor }}>
                                        {getPlanetGlyph(subsub.planet) || subsub.planet}
                                      </span>
                                      <div className="flex-1">
                                        <p className={`text-[11px] font-medium ${isSSubCurrent ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>
                                          {subsub.planet}
                                        </p>
                                        <p className="text-[10px] text-text-muted">
                                          {formatDate(subsub.start_date)} &mdash; {formatDate(subsub.end_date)}
                                        </p>
                                      </div>
                                      {isSSubCurrent && (
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ssubColor }} />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-text-muted leading-relaxed mt-1 ml-7 line-clamp-3">
                                      {getL3Interpretation(period.planet, sub.planet, subsub.planet)}
                                    </p>
                                    <div className="ml-7">
                                      <CopyBtn text={getL3Interpretation(period.planet, sub.planet, subsub.planet)} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PaywallGate>
  );
}
