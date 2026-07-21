import { api, buildBirthData } from '@/lib/api';
import { getFullDuadCompendium } from '@/lib/engines/duadCompendium';
import { calculateNumerology } from '@/lib/numerologyCalc';

// ═══════════════════════════════════════════════════════════════════
// AI Astrologer — Live Engine Router
//
// The web AI chat used to receive ONLY the natal chart, so any question
// about progressions, returns, time lords, etc. made the model answer
// "I don't have that data" (and, worse, send the user to an outside
// calculator). This module wires the chat to every calculation engine
// the app already ships, on demand:
//
//   Question ─▶ routeEngines() ─▶ parallel engine calls ─▶ context text
//
// Mirrors align-app/src/services/astrologyIntelligence.ts so web and
// mobile answer with the same depth.
// ═══════════════════════════════════════════════════════════════════

export type EngineKey =
  | 'progressed'
  | 'solar_arc'
  | 'transits'
  | 'solar_return'
  | 'lunar_return'
  | 'midpoints'
  | 'duad'
  | 'firdaria'
  | 'zodiacal_releasing'
  | 'numerology'
  | 'human_design'
  | 'starseed'
  | 'planetary_hours';

interface LoadCtx {
  /** Payload accepted by every /charts, /returns, /timelords endpoint */
  birthData: any;
  profile: any;
  /** Already-fetched natal chart (planets/positions), may be null */
  natal: any;
  /** YYYY-MM-DD for "today" */
  today: string;
  name: string;
}

interface EngineDef {
  key: EngineKey;
  /** Human label shown in the UI + the prompt's data inventory */
  label: string;
  keywords: string[];
  load: (ctx: LoadCtx) => Promise<string>;
}

// ─── Formatting helpers ────────────────────────────────────────────

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** One planet line: "Sun: 13.2° Capricorn House 4 Rx" */
function fmtPos(p: any): string {
  const name = p?.name || p?.planet || '?';
  const sign = p?.sign || '';
  const deg = p?.sign_degree ?? p?.degree;
  const degStr = typeof deg === 'number' ? `${deg.toFixed(1)}°` : '';
  const house = p?.house ? ` House ${p.house}` : '';
  const rx = p?.is_retrograde || p?.retrograde ? ' Rx' : '';
  return `${name}: ${degStr} ${sign}${house}${rx}`.replace(/\s+/g, ' ').trim();
}

function positionsOf(data: any): any[] {
  return data?.positions || data?.planets || [];
}

function findPos(list: any[], name: string): any | null {
  return list.find((p) => (p?.name || p?.planet || '').toLowerCase() === name.toLowerCase()) || null;
}

/** Signs travelled from natal → derived position (progressions, solar arc). */
function signsMoved(fromLon?: number, toLon?: number): string {
  if (typeof fromLon !== 'number' || typeof toLon !== 'number') return '';
  const arc = ((toLon - fromLon) % 360 + 360) % 360;
  return ` (advanced ${arc.toFixed(1)}° from natal)`;
}

/**
 * Compact JSON for engines whose payloads are nested/irregular
 * (time lords, human design, numerology). The model reads JSON fine and
 * this can't silently mangle a field the way hand-rolled formatting can.
 */
function compactJson(value: any, maxChars = 2400): string {
  try {
    const text = JSON.stringify(value);
    if (!text) return '';
    return text.length > maxChars ? `${text.slice(0, maxChars)}… (truncated)` : text;
  } catch {
    return '';
  }
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** The solar-return year currently in force (last birthday, not calendar year). */
function currentReturnYear(birthDate: string, now: Date): number {
  const [, m, d] = birthDate.split('-').map(Number);
  const thisYearBirthday = new Date(now.getFullYear(), (m || 1) - 1, d || 1);
  return now < thisYearBirthday ? now.getFullYear() - 1 : now.getFullYear();
}

// ─── Engine definitions ────────────────────────────────────────────

const ENGINES: EngineDef[] = [
  {
    key: 'progressed',
    label: 'Secondary progressions',
    keywords: [
      'progress', 'progressed', 'progression', 'secondary progression',
      'evolved chart', 'inner growth', 'where am i now in my life',
    ],
    load: async ({ birthData, natal, today }) => {
      const data = await api.getProgressedChart({
        birth_data: birthData,
        target_date: today,
        progression_type: 'secondary',
        house_system: birthData.house_system,
      });
      const prog = positionsOf(data);
      if (prog.length === 0) return '';

      const natalPos = positionsOf(natal);
      const lines = prog.map((p) => {
        const n = findPos(natalPos, p?.name || '');
        return `${fmtPos(p)}${n ? signsMoved(n.longitude, p.longitude) : ''}`;
      });

      const pSun = findPos(prog, 'Sun');
      const pMoon = findPos(prog, 'Moon');
      const headline = [
        pSun ? `Progressed Sun: ${pSun.sign}${pSun.house ? ` House ${pSun.house}` : ''}` : '',
        pMoon ? `Progressed Moon: ${pMoon.sign}${pMoon.house ? ` House ${pMoon.house}` : ''}` : '',
      ].filter(Boolean).join(' | ');

      const aspects = data?.progressed_aspects || data?.aspects || [];
      const aspectLines = aspects.slice(0, 20).map((a: any) =>
        `${a.planet1 || a.body1} ${a.aspect || a.type || a.aspect_name} ${a.planet2 || a.body2}` +
        (typeof a.orb === 'number' ? ` (${Math.abs(a.orb).toFixed(1)}° orb)` : '')
      );

      return [
        `SECONDARY PROGRESSED CHART — calculated for ${today}`,
        headline,
        '',
        ...lines,
        aspectLines.length ? `\nPROGRESSED ASPECTS:\n${aspectLines.join('\n')}` : '',
      ].filter(Boolean).join('\n');
    },
  },

  {
    key: 'solar_arc',
    label: 'Solar arc directions',
    keywords: ['solar arc', 'directed chart', 'directions', 'arc direction'],
    load: async ({ birthData, natal, today }) => {
      const data = await api.getProgressedChart({
        birth_data: birthData,
        target_date: today,
        progression_type: 'solar_arc',
        house_system: birthData.house_system,
      });
      const arc = positionsOf(data);
      if (arc.length === 0) return '';
      const natalPos = positionsOf(natal);
      const lines = arc.map((p) => {
        const n = findPos(natalPos, p?.name || '');
        return `${fmtPos(p)}${n ? signsMoved(n.longitude, p.longitude) : ''}`;
      });
      const arcDeg = typeof data?.solar_arc === 'number' ? `Solar arc: ${data.solar_arc.toFixed(2)}°\n` : '';
      return `SOLAR ARC DIRECTED CHART — calculated for ${today}\n${arcDeg}\n${lines.join('\n')}`;
    },
  },

  {
    key: 'transits',
    label: 'Current transits',
    keywords: [
      'transit', 'right now', 'currently', 'today', 'this week', 'this month',
      'retrograde', 'cosmic weather', 'happening', 'coming up', 'next month',
      'upcoming', 'forecast', 'what should i expect',
    ],
    load: async ({ birthData, today }) => {
      const end = new Date();
      end.setDate(end.getDate() + 120);

      const [current, events] = await Promise.all([
        api.getCurrentTransits(birthData).catch(() => null),
        api.getTransitEvents({
          birth_data: birthData,
          start_date: today,
          end_date: isoDate(end),
        }).catch(() => null),
      ]);

      const parts: string[] = [];

      const tPos = current?.transit_positions || [];
      if (tPos.length > 0) {
        parts.push(`SKY RIGHT NOW (${today}):\n${tPos.map(fmtPos).join('\n')}`);
      }
      const phase = current?.moon_phase;
      if (phase) {
        parts.push(`MOON PHASE: ${phase.phase_name || phase.name || ''} ${
          typeof phase.illumination === 'number' ? `(${Math.round(phase.illumination)}% illuminated)` : ''
        }`.trim());
      }

      const evs: any[] = events?.events || [];
      if (evs.length > 0) {
        const lines = evs.slice(0, 45).map((e) =>
          `${e.date}: transiting ${e.transiting_planet}${e.is_retrograde ? ' Rx' : ''} ` +
          `${e.aspect_name || e.aspect_type} natal ${e.natal_planet} ` +
          `(${e.transit_sign} → ${e.natal_sign})`
        );
        parts.push(`EXACT TRANSIT HITS — next 120 days (${evs.length} total, showing ${lines.length}):\n${lines.join('\n')}`);
      }

      return parts.join('\n\n');
    },
  },

  {
    key: 'solar_return',
    label: 'Solar return',
    keywords: [
      'solar return', 'birthday chart', 'year ahead', 'this year', 'next year',
      'annual chart', 'my birthday',
    ],
    load: async ({ birthData, profile }) => {
      const now = new Date();
      const year = currentReturnYear(profile.birth_date, now);
      const [currentSR, nextSR] = await Promise.all([
        api.getSolarReturn({ birth_data: birthData, year, house_system: birthData.house_system }),
        api.getSolarReturn({ birth_data: birthData, year: year + 1, house_system: birthData.house_system }).catch(() => null),
      ]);
      const parts: string[] = [];
      const cur = positionsOf(currentSR);
      if (cur.length > 0) {
        parts.push(`SOLAR RETURN ${year} (the year currently in force):\n${cur.map(fmtPos).join('\n')}`);
      }
      const next = positionsOf(nextSR);
      if (next.length > 0) {
        parts.push(`SOLAR RETURN ${year + 1} (next birthday year):\n${next.map(fmtPos).join('\n')}`);
      }
      return parts.join('\n\n');
    },
  },

  {
    key: 'lunar_return',
    label: 'Lunar return',
    keywords: ['lunar return', 'monthly forecast', 'emotional month', 'monthly energy'],
    load: async ({ birthData, today }) => {
      const data = await api.getLunarReturn({
        birth_data: birthData,
        target_date: today,
        house_system: birthData.house_system,
      });
      const pos = positionsOf(data);
      if (pos.length === 0) return '';
      return `LUNAR RETURN — current cycle (calculated ${today}):\n${pos.map(fmtPos).join('\n')}`;
    },
  },

  {
    key: 'midpoints',
    label: 'Midpoints',
    keywords: ['midpoint', 'mid-point', 'half sum', 'ebertin'],
    load: async ({ natal }) => {
      const pos = positionsOf(natal);
      if (pos.length === 0) return '';
      const KEY = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant', 'MC'];
      const lines: string[] = [];
      for (let i = 0; i < KEY.length; i++) {
        for (let j = i + 1; j < KEY.length; j++) {
          const a = findPos(pos, KEY[i]);
          const b = findPos(pos, KEY[j]);
          if (typeof a?.longitude !== 'number' || typeof b?.longitude !== 'number') continue;
          // Shorter-arc midpoint (the one astrologers actually use)
          let mid = (a.longitude + b.longitude) / 2;
          if (Math.abs(a.longitude - b.longitude) > 180) mid = (mid + 180) % 360;
          const sign = SIGNS[Math.floor(mid / 30) % 12];
          lines.push(`${KEY[i]}/${KEY[j]}: ${(mid % 30).toFixed(1)}° ${sign}`);
        }
      }
      return lines.length ? `NATAL MIDPOINTS:\n${lines.join('\n')}` : '';
    },
  },

  {
    key: 'duad',
    label: 'Hidden sign layers',
    keywords: [
      'duad', 'compendium', 'hidden layer', 'hidden zodiac', 'deeper layer',
      'sub-sign', 'undertone', 'beneath the surface', 'what am i really',
    ],
    load: async ({ natal }) => {
      const pos = positionsOf(natal);
      if (pos.length === 0) return '';
      const asc = findPos(pos, 'Ascendant');
      const ascSign = asc?.sign;
      const lines = pos
        .filter((p) => typeof p?.longitude === 'number')
        .slice(0, 14)
        .map((p) => {
          const d = getFullDuadCompendium(p.longitude, ascSign);
          return `${p.name}: surface ${d.sign} → inner current ${d.duadSign}` +
            `${d.duadHouse ? ` (house ${d.duadHouse} themes)` : ''}` +
            ` → core thread ${d.compendiumSign}` +
            `${d.compendiumHouse ? ` (house ${d.compendiumHouse} themes)` : ''}` +
            ` → finest layer ${d.matrixSign}`;
        });
      return `DEEPER SIGN LAYERS (never name these systems out loud — describe what you see):\n${lines.join('\n')}`;
    },
  },

  {
    key: 'firdaria',
    label: 'Firdaria time lords',
    keywords: ['firdaria', 'time lord', 'planetary period', 'life chapter', 'life period'],
    load: async ({ birthData }) => {
      const data = await api.getFirdaria(birthData);
      const periods: any[] = data?.periods || [];
      if (periods.length === 0) return '';
      const todayIso = isoDate(new Date());
      const active = periods.find((p) => p.start_date <= todayIso && p.end_date >= todayIso);
      const summary = periods.map((p) =>
        `${p.planet}: ${p.start_date} → ${p.end_date} (ages ${Math.round(p.start_age)}–${Math.round(p.end_age)})`
      );
      const sub = active?.sub_periods
        ? `\nACTIVE SUB-PERIODS:\n${active.sub_periods.map((s: any) =>
            `${active.planet}/${s.planet}: ${s.start_date} → ${s.end_date}`).join('\n')}`
        : '';
      return `FIRDARIA TIME LORDS:\nCURRENT MAJOR PERIOD: ${
        active ? `${active.planet} (${active.start_date} → ${active.end_date})` : 'unknown'
      }\n\nFULL SEQUENCE:\n${summary.join('\n')}${sub}`;
    },
  },

  {
    key: 'zodiacal_releasing',
    label: 'Zodiacal releasing',
    keywords: ['zodiacal releasing', 'releasing', 'peak period', 'loosing of the bond', 'fortune period', 'spirit period'],
    load: async ({ birthData }) => {
      const [fortune, spirit] = await Promise.all([
        api.getZodiacalReleasing({ birth_data: birthData, lot_name: 'Part of Fortune' }),
        api.getZodiacalReleasing({ birth_data: birthData, lot_name: 'Part of Spirit' }).catch(() => null),
      ]);
      const parts: string[] = [];
      if (fortune?.periods) parts.push(`ZODIACAL RELEASING FROM FORTUNE (body/circumstance):\n${compactJson(fortune.periods)}`);
      if (spirit?.periods) parts.push(`ZODIACAL RELEASING FROM SPIRIT (career/action):\n${compactJson(spirit.periods)}`);
      return parts.join('\n\n');
    },
  },

  {
    key: 'numerology',
    label: 'Numerology',
    keywords: [
      'numerology', 'life path', 'personal year', 'destiny number', 'expression number',
      'soul urge', 'master number', 'my numbers',
    ],
    // Calculated locally — the backend's /numerology/reading is still a stub.
    load: async ({ profile, name }) => {
      const fullName = profile?.display_name || name;
      if (!fullName || !profile?.birth_date) return '';
      const n = calculateNumerology(fullName, profile.birth_date);
      return [
        'NUMEROLOGY:',
        `Life Path ${n.life_path.display} — ${n.life_path.interpretation}`,
        `Expression ${n.expression.display} — ${n.expression.interpretation}`,
        `Soul Urge ${n.soul_urge.display} — ${n.soul_urge.interpretation}`,
        `Personality ${n.personality.display} — ${n.personality.interpretation}`,
        `Birthday Number ${n.birthday_number.display}`,
        `Personal Year ${n.personal_year_display} — ${n.personal_year_meaning}`,
      ].join('\n');
    },
  },

  {
    key: 'human_design',
    label: 'Human Design',
    keywords: [
      'human design', 'generator', 'projector', 'manifestor', 'reflector',
      'sacral', 'splenic', 'defined center', 'undefined center', 'gate', 'channel',
    ],
    load: async ({ birthData }) => {
      const data = await api.getHumanDesign(birthData);
      return data ? `HUMAN DESIGN:\n${compactJson(data)}` : '';
    },
  },

  {
    key: 'starseed',
    label: 'Starseed origin',
    keywords: [
      'starseed', 'star seed', 'cosmic origin', 'soul origin', 'pleiadian',
      'sirian', 'arcturian', 'lyran', 'fixed star', 'where is my soul from',
    ],
    load: async ({ birthData }) => {
      const data = await api.getStarseedOrigin(birthData).catch(() => api.getStarseedAnalysis(birthData));
      return data ? `STARSEED / FIXED-STAR ORIGIN:\n${compactJson(data)}` : '';
    },
  },

  {
    key: 'planetary_hours',
    label: 'Planetary hours',
    keywords: ['planetary hour', 'best hour', 'what hour', 'hour ruler', 'auspicious hour'],
    load: async ({ birthData, profile, today }) => {
      const data = await api.getPlanetaryHours({
        date: today,
        latitude: profile.latitude,
        longitude: profile.longitude,
        timezone: birthData.timezone || 'UTC',
      });
      return data?.hours ? `PLANETARY HOURS FOR ${today}:\n${compactJson(data.hours)}` : '';
    },
  },

];

const ENGINE_BY_KEY = new Map(ENGINES.map((e) => [e.key, e]));

/** Every system the chat can reach — used for the prompt's capability manifest. */
export const ENGINE_CAPABILITIES: string[] = ENGINES.map((e) => e.label);

// ─── Question router ───────────────────────────────────────────────

/** Loaded on every turn so no question ever comes back empty-handed. */
const BASELINE: EngineKey[] = ['transits', 'progressed'];

const MAX_ENGINES_PER_TURN = 6;

/**
 * Decide which engines a question needs. Keyword scoring against the
 * current question (weight 3) and the recent conversation (weight 1),
 * plus intent expansions for timing/predictive/identity questions.
 */
export function routeEngines(question: string, history: string[] = []): EngineKey[] {
  const q = question.toLowerCase();
  const recent = [q, ...history.slice(-4).map((h) => h.toLowerCase())].join(' ');

  const scores = new Map<EngineKey, number>();
  const bump = (key: EngineKey, by: number) => scores.set(key, (scores.get(key) || 0) + by);

  for (const engine of ENGINES) {
    for (const kw of engine.keywords) {
      if (q.includes(kw)) bump(engine.key, 3);
      else if (recent.includes(kw)) bump(engine.key, 1);
    }
  }

  // Intent expansions — a timing question needs more than the keyword it used
  const isTiming = /when (should|will|can|do)|best time|good time|timing|should i wait|window|how long/.test(q);
  const isPredictive = /will i|future|predict|coming up|ahead|next year|what's next|whats next/.test(q);
  const isIdentity = /who am i|my purpose|why am i|what am i here|my gifts|my strengths|my weakness/.test(q);

  if (isTiming || isPredictive) {
    bump('transits', 3);
    bump('progressed', 3);
    bump('solar_return', 2);
    bump('firdaria', 1);
  }
  if (isIdentity) {
    bump('duad', 2);
    bump('numerology', 1);
    bump('human_design', 1);
  }

  BASELINE.forEach((key) => bump(key, 0.5));

  return Array.from(scores.entries())
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_ENGINES_PER_TURN)
    .map(([key]) => key);
}

// ─── Per-session cache ─────────────────────────────────────────────
// Keyed on engine + birth data + calendar day, so a conversation pays
// each engine's latency once instead of on every message.

const cache = new Map<string, Promise<string>>();

function cacheKey(key: EngineKey, ctx: LoadCtx): string {
  return `${key}|${ctx.profile?.id || ctx.profile?.birth_date}|${ctx.birthData.house_system}|${ctx.today}`;
}

/** Never let one slow engine stall the chat. */
function withTimeout(promise: Promise<string>, ms: number): Promise<string> {
  return Promise.race([
    promise,
    new Promise<string>((resolve) => setTimeout(() => resolve(''), ms)),
  ]);
}

function loadEngine(key: EngineKey, ctx: LoadCtx): Promise<string> {
  const ck = cacheKey(key, ctx);
  const hit = cache.get(ck);
  if (hit) return hit;

  const engine = ENGINE_BY_KEY.get(key);
  if (!engine) return Promise.resolve('');

  const pending = withTimeout(
    engine.load(ctx).catch((err) => {
      console.warn(`[AIEngines] ${key} failed:`, err?.message || err);
      return '';
    }),
    20000,
  ).then((text) => {
    // Don't cache empty results — a transient failure shouldn't poison
    // the rest of the conversation.
    if (!text) cache.delete(ck);
    return text;
  });

  cache.set(ck, pending);
  return pending;
}

/** Drop cached engine output (e.g. when the user edits their birth data). */
export function clearEngineCache() {
  cache.clear();
}

// ─── Public entry point ────────────────────────────────────────────

export interface LiveContext {
  /** Formatted blocks to append to the system prompt */
  text: string;
  /** Labels of the engines that actually returned data */
  labels: string[];
}

/**
 * Run every engine the question needs and return their formatted output.
 * Always resolves — a failed engine is simply absent from the result.
 */
export async function buildLiveAstrologyContext(opts: {
  question: string;
  history?: string[];
  profile: any;
  natalChart: any;
}): Promise<LiveContext> {
  const { question, history = [], profile, natalChart } = opts;
  if (!profile?.birth_date || profile?.latitude == null) {
    return { text: '', labels: [] };
  }

  let birthData: any;
  try {
    birthData = buildBirthData(profile);
  } catch {
    return { text: '', labels: [] };
  }

  const ctx: LoadCtx = {
    birthData,
    profile,
    natal: natalChart,
    today: isoDate(new Date()),
    name: profile.display_name || 'the user',
  };

  const keys = routeEngines(question, history);
  const results = await Promise.all(
    keys.map(async (key) => ({
      key,
      label: ENGINE_BY_KEY.get(key)?.label || key,
      text: await loadEngine(key, ctx),
    }))
  );

  const filled = results.filter((r) => r.text.trim().length > 0);
  if (filled.length === 0) return { text: '', labels: [] };

  return {
    text: filled.map((r) => `=== ${r.label.toUpperCase()} ===\n${r.text}`).join('\n\n'),
    labels: filled.map((r) => r.label),
  };
}
