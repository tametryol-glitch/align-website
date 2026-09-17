/**
 * Relationship Share — the one format synastry and composite results travel
 * in, whether they go to a friend's DMs, the Cosmic Feed, or a public link
 * (aligncosmic.com/share?type=synastry|composite&…).
 *
 * DUPLICATED verbatim in align-web/src/lib/relationshipShare.ts and
 * align-app/src/services/relationshipShare.ts — keep both in sync. No imports,
 * so it runs on the web edge (OG images), the browser, and React Native.
 *
 * Synastry uses the SAME numbers as Cosmic Match: the canonical 9-category
 * overall (computeCanonicalOverall in cosmicMatchService). SYNASTRY_CATEGORIES
 * carries those weights so every surface can show how the score adds up.
 *
 * Privacy: carries first names, scores, labels, signs and aspect names only.
 * NEVER birth dates, times, places or coordinates, and never the violence /
 * toxicity scores — the partner often isn't an Align user and never agreed
 * to any of that being passed around.
 */

export const RELATIONSHIP_SHARE_BASE = 'https://aligncosmic.com/share';

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export const ASPECT_GLYPHS: Record<string, string> = {
  Conjunction: '☌', Sextile: '⚹', Square: '□', Trine: '△', Opposition: '☍', Quincunx: '⚻',
};

/**
 * Cosmic Match's 9 categories, in its display order, with the weight each
 * carries in the overall. Weights MUST match computeCanonicalOverall().
 */
export const SYNASTRY_CATEGORIES = [
  { key: 'emotional', label: 'Emotional', emoji: '💜', weight: 15 },
  { key: 'attraction', label: 'Attraction', emoji: '🤲', weight: 12 },
  { key: 'passion', label: 'Passion', emoji: '🔥', weight: 12 },
  { key: 'marriage', label: 'Marriage', emoji: '💍', weight: 8 },
  { key: 'stability', label: 'Stability', emoji: '🏠', weight: 14 },
  { key: 'karmic', label: 'Karmic', emoji: '✨', weight: 9 },
  { key: 'mental', label: 'Mental', emoji: '🧠', weight: 10 },
  { key: 'spiritual', label: 'Spiritual', emoji: '🔮', weight: 8 },
  { key: 'physical', label: 'Physical', emoji: '💪', weight: 12 },
] as const;

/** Composite placements carried beyond the Big Three, in URL order. */
export const COMPOSITE_PLACEMENT_KEYS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;

const ASPECT_NAMES = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition', 'Quincunx'];
const SUPPORTIVE_ASPECTS = new Set(['Conjunction', 'Sextile', 'Trine']);
const PASSION_INTENSITIES = ['Low', 'Moderate', 'High', 'Volcanic'];
const MARRIAGE_LEVELS = ['Unlikely', 'Possible', 'Promising', 'Strong', 'Exceptional'];
const COMPOSITE_ASPECT_BODIES = new Set([
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'MC',
]);
const MAX_KEY_ASPECTS = 8;
const MAX_HIGHLIGHTS = 3;
const MAX_COMPOSITE_ASPECTS = 5;
const MAX_NAME = 24;

export interface ShareAspect {
  p1: string;
  aspect: string;
  p2: string;
  supportive: boolean;
}

export interface SynastrySnapshot {
  kind: 'synastry';
  person1: string;
  person2: string;
  /** Canonical Cosmic Match overall. */
  score: number;
  /** SYNASTRY_CATEGORIES key → 0–100. */
  categories: Record<string, number>;
  styleLabel: string | null;
  passionIntensity: string | null;
  marriageLevel: string | null;
  marriageSub: { domestic: number; loyalty: number; growth: number };
  /** Strongest supportive aspects (Top Strengths). */
  strengths: ShareAspect[];
  /** Strongest challenging aspects (Growth Areas). */
  challenges: ShareAspect[];
  /** Strongest aspects overall (Key Aspects list). */
  aspects: ShareAspect[];
}

export interface CompositeSnapshot {
  kind: 'composite';
  person1: string;
  person2: string;
  sun: string | null;
  moon: string | null;
  rising: string | null;
  /** COMPOSITE_PLACEMENT_KEYS body → sign. */
  placements: Record<string, string>;
  /** Tightest aspects, tightest first. */
  aspects: ShareAspect[];
}

export type RelationshipSnapshot = SynastrySnapshot | CompositeSnapshot;

// ── Helpers ──────────────────────────────────────────────────────────

function cleanName(name: string | null | undefined, fallback: string): string {
  const first = String(name || '').trim().split(/\s+/)[0] || '';
  const safe = first
    .split('')
    .filter((ch) => ch.charCodeAt(0) >= 32 && ch !== '<' && ch !== '>')
    .join('')
    .slice(0, MAX_NAME);
  return safe || fallback;
}

function normalizeSign(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return SIGNS.includes(s) ? s : null;
}

function normalizeAspect(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const a = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return ASPECT_NAMES.includes(a) ? a : null;
}

/** Body names are free text in the engines — allow only plain words. */
function normalizeBody(raw: string | null | undefined): string | null {
  const b = String(raw || '').trim();
  return /^[A-Za-z][A-Za-z .'-]{0,19}$/.test(b) ? b : null;
}

/** Engine style labels are short plain phrases ("Powerful but Volatile"). */
function normalizeLabel(raw: string | null | undefined): string | null {
  const l = String(raw || '').trim();
  return /^[A-Za-z][A-Za-z '&-]{0,39}$/.test(l) ? l : null;
}

function pick(raw: string | null | undefined, allowed: string[]): string | null {
  return raw && allowed.includes(raw) ? raw : null;
}

function clampScore(n: unknown): number {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0;
}

/** Same colors Cosmic Match uses for every score. */
export function scoreColor(score: number): string {
  if (score >= 75) return '#4ADE80';
  if (score >= 55) return '#FACC15';
  if (score >= 35) return '#FB923C';
  return '#F87171';
}

/** Same band text as bandTextForOverall() in cosmicMatchService. */
export function synastryBandText(score: number): string {
  if (score >= 90) return 'Rare compatibility — very strong bond, high attraction and support';
  if (score >= 80) return 'Very strong relationship potential';
  if (score >= 70) return 'Good compatibility with some friction';
  if (score >= 60) return 'Mixed but workable if mature';
  if (score >= 50) return 'Strong pull but inconsistent harmony';
  if (score >= 40) return 'Difficult, unstable, karmically heavy';
  return 'More lesson than peace';
}

// ── Builders ─────────────────────────────────────────────────────────

type EngineAspect = { inner: string; outer: string; aspect: string; strength: number; supportive: boolean };

/**
 * With `accept` (reading sections), one entry per body pair — Venus–Mars and
 * Mars–Venus share a reading, so showing both would repeat the same text.
 */
function toShareAspects(list: EngineAspect[], limit: number, accept?: (a: ShareAspect) => boolean): ShareAspect[] {
  const out: ShareAspect[] = [];
  const seenPairs = new Set<string>();
  for (const a of [...list].sort((x, y) => (y.strength || 0) - (x.strength || 0))) {
    const p1 = normalizeBody(a.inner);
    const p2 = normalizeBody(a.outer);
    const aspect = normalizeAspect(a.aspect);
    if (!p1 || !p2 || !aspect) continue;
    const sa = { p1, aspect, p2, supportive: !!a.supportive };
    if (accept) {
      const pair = [p1, p2].sort().join('-');
      if (seenPairs.has(pair) || !accept(sa)) continue;
      seenPairs.add(pair);
    }
    out.push(sa);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * From computeAdvancedCompatibility() + computeCanonicalOverall() — the
 * exact inputs Cosmic Match stores. `hasReading` lets the caller keep
 * Top Strengths / Growth Areas to aspects that have a written reading.
 */
export function buildSynastrySnapshot(
  result: {
    emotional_score: number;
    intellectual_score: number;
    physical_score: number;
    spiritual_score: number;
    scores: Record<string, number>;
    style_label?: string;
    aspects: EngineAspect[];
    passion?: { score: number; intensity: string };
    marriage?: { score: number; level: string; domesticScore: number; loyaltyScore: number; growthTogetherScore: number };
  },
  canonicalOverall: number,
  person1Name: string | null | undefined,
  person2Name: string | null | undefined,
  hasReading?: (a: ShareAspect) => boolean,
): SynastrySnapshot {
  const categories: Record<string, number> = {
    emotional: clampScore(result.emotional_score),
    attraction: clampScore(result.scores?.Attraction),
    passion: clampScore(result.passion?.score),
    marriage: clampScore(result.marriage?.score),
    stability: clampScore(result.scores?.Stability),
    karmic: clampScore(result.scores?.Karmic ?? result.spiritual_score),
    mental: clampScore(result.intellectual_score),
    spiritual: clampScore(result.spiritual_score),
    physical: clampScore(result.physical_score),
  };
  const all = result.aspects || [];

  return {
    kind: 'synastry',
    person1: cleanName(person1Name, 'Me'),
    person2: cleanName(person2Name, 'Partner'),
    score: clampScore(canonicalOverall),
    categories,
    styleLabel: normalizeLabel(result.style_label),
    passionIntensity: pick(result.passion?.intensity, PASSION_INTENSITIES),
    marriageLevel: pick(result.marriage?.level, MARRIAGE_LEVELS),
    marriageSub: {
      domestic: clampScore(result.marriage?.domesticScore),
      loyalty: clampScore(result.marriage?.loyaltyScore),
      growth: clampScore(result.marriage?.growthTogetherScore),
    },
    strengths: toShareAspects(all.filter((a) => a.supportive), MAX_HIGHLIGHTS, hasReading),
    challenges: toShareAspects(all.filter((a) => !a.supportive), MAX_HIGHLIGHTS, hasReading),
    aspects: toShareAspects(all, MAX_KEY_ASPECTS),
  };
}

/** From composite positions + aspects (either platform's composite page). */
export function buildCompositeSnapshot(
  data: {
    positions: Array<{ name: string; sign: string }>;
    aspects: Array<{ planet1: string; planet2: string; type: string; orb: number }>;
  },
  person1Name: string | null | undefined,
  person2Name: string | null | undefined,
  hasReading?: (a: ShareAspect) => boolean,
): CompositeSnapshot {
  const signOf = (name: string) => normalizeSign(data.positions.find((p) => p.name === name)?.sign);

  const placements: Record<string, string> = {};
  for (const key of COMPOSITE_PLACEMENT_KEYS) {
    const s = signOf(key);
    if (s) placements[key] = s;
  }

  const aspects: ShareAspect[] = [];
  const sorted = [...(data.aspects || [])]
    .filter((a) => COMPOSITE_ASPECT_BODIES.has(a.planet1) && COMPOSITE_ASPECT_BODIES.has(a.planet2))
    .sort((x, y) => Math.abs(x.orb || 0) - Math.abs(y.orb || 0));
  for (const a of sorted) {
    const aspect = normalizeAspect(a.type);
    if (!aspect) continue;
    const sa = { p1: a.planet1, aspect, p2: a.planet2, supportive: SUPPORTIVE_ASPECTS.has(aspect) };
    if (hasReading && !hasReading(sa)) continue;
    aspects.push(sa);
    if (aspects.length >= MAX_COMPOSITE_ASPECTS) break;
  }

  return {
    kind: 'composite',
    person1: cleanName(person1Name, 'Me'),
    person2: cleanName(person2Name, 'Partner'),
    sun: signOf('Sun'),
    moon: signOf('Moon'),
    rising: signOf('Ascendant') || signOf('ASC'),
    placements,
    aspects,
  };
}

// ── URL codec ────────────────────────────────────────────────────────

function encodeAspects(aspects: ShareAspect[]): string {
  return aspects.map((a) => `${a.p1}~${a.aspect}~${a.p2}~${a.supportive ? 1 : 0}`).join(',');
}

function decodeAspects(raw: string | null | undefined, limit: number): ShareAspect[] {
  if (!raw) return [];
  const out: ShareAspect[] = [];
  for (const part of raw.split(',')) {
    const [b1, asp, b2, flag] = part.split('~');
    const p1 = normalizeBody(b1);
    const p2 = normalizeBody(b2);
    const aspect = normalizeAspect(asp);
    if (!p1 || !p2 || !aspect) continue;
    const supportive = flag === '1' ? true : flag === '0' ? false : SUPPORTIVE_ASPECTS.has(aspect);
    out.push({ p1, aspect, p2, supportive });
    if (out.length >= limit) break;
  }
  return out;
}

/** Query string (no leading `?`) — shared by /share and /api/og. */
export function relationshipShareQuery(s: RelationshipSnapshot): string {
  const parts: Array<[string, string]> = [['type', s.kind], ['a', s.person1], ['b', s.person2]];
  if (s.kind === 'synastry') {
    parts.push(['s', String(s.score)]);
    parts.push(['c', SYNASTRY_CATEGORIES.map((c) => s.categories[c.key] ?? 0).join('.')]);
    if (s.styleLabel) parts.push(['st', s.styleLabel]);
    if (s.passionIntensity) parts.push(['pi', s.passionIntensity]);
    if (s.marriageLevel) parts.push(['ml', s.marriageLevel]);
    parts.push(['ms', [s.marriageSub.domestic, s.marriageSub.loyalty, s.marriageSub.growth].join('.')]);
    if (s.strengths.length) parts.push(['g', encodeAspects(s.strengths)]);
    if (s.challenges.length) parts.push(['h', encodeAspects(s.challenges)]);
  } else {
    if (s.sun) parts.push(['sun', s.sun]);
    if (s.moon) parts.push(['moon', s.moon]);
    if (s.rising) parts.push(['rising', s.rising]);
    parts.push(['p', COMPOSITE_PLACEMENT_KEYS.map((k) => s.placements[k] || '').join('.')]);
  }
  if (s.aspects.length) parts.push(['x', encodeAspects(s.aspects)]);
  return parts.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}

export function relationshipShareUrl(s: RelationshipSnapshot): string {
  return `${RELATIONSHIP_SHARE_BASE}?${relationshipShareQuery(s)}`;
}

/** Parse from any param getter (URLSearchParams.get, Next searchParams, …). Null when not a relationship share. */
export function parseRelationshipSnapshot(get: (key: string) => string | null | undefined): RelationshipSnapshot | null {
  const type = get('type');
  const person1 = cleanName(get('a'), 'Someone');
  const person2 = cleanName(get('b'), 'Someone');

  // Links made before the 9-category format have no `ms` — don't misread them.
  if (type === 'synastry' && get('ms')) {
    const scores = String(get('c') || '').split('.');
    const categories: Record<string, number> = {};
    SYNASTRY_CATEGORIES.forEach((c, i) => { categories[c.key] = clampScore(scores[i]); });
    const ms = String(get('ms') || '').split('.');
    return {
      kind: 'synastry',
      person1,
      person2,
      score: clampScore(get('s')),
      categories,
      styleLabel: normalizeLabel(get('st')),
      passionIntensity: pick(get('pi'), PASSION_INTENSITIES),
      marriageLevel: pick(get('ml'), MARRIAGE_LEVELS),
      marriageSub: { domestic: clampScore(ms[0]), loyalty: clampScore(ms[1]), growth: clampScore(ms[2]) },
      strengths: decodeAspects(get('g'), MAX_HIGHLIGHTS),
      challenges: decodeAspects(get('h'), MAX_HIGHLIGHTS),
      aspects: decodeAspects(get('x'), MAX_KEY_ASPECTS),
    };
  }

  if (type === 'composite') {
    const signs = String(get('p') || '').split('.');
    const placements: Record<string, string> = {};
    COMPOSITE_PLACEMENT_KEYS.forEach((k, i) => {
      const s = normalizeSign(signs[i]);
      if (s) placements[k] = s;
    });
    return {
      kind: 'composite',
      person1,
      person2,
      sun: normalizeSign(get('sun')),
      moon: normalizeSign(get('moon')),
      rising: normalizeSign(get('rising')),
      placements,
      aspects: decodeAspects(get('x'), MAX_COMPOSITE_ASPECTS),
    };
  }

  return null;
}

/**
 * Snapshots stored in message metadata / post chart_data came from another
 * client — re-validate before rendering. Synastry shares made before the
 * 9-category format (no `marriageSub`) return null so they fall back to the
 * generic chart bubble instead of showing a score that doesn't add up.
 */
export function readStoredSnapshot(raw: unknown): RelationshipSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, any>;
  if (r.kind !== 'synastry' && r.kind !== 'composite') return null;
  if (r.kind === 'synastry' && (!r.marriageSub || !r.categories || !('emotional' in r.categories))) return null;
  const query = relationshipShareQuery({
    ...r,
    person1: String(r.person1 || ''),
    person2: String(r.person2 || ''),
    categories: r.categories || {},
    placements: r.placements || {},
    marriageSub: r.marriageSub || { domestic: 0, loyalty: 0, growth: 0 },
    strengths: Array.isArray(r.strengths) ? r.strengths : [],
    challenges: Array.isArray(r.challenges) ? r.challenges : [],
    aspects: Array.isArray(r.aspects) ? r.aspects : [],
  } as unknown as RelationshipSnapshot);
  const params = new Map<string, string>();
  for (const pair of query.split('&')) {
    const i = pair.indexOf('=');
    params.set(pair.slice(0, i), decodeURIComponent(pair.slice(i + 1)));
  }
  return parseRelationshipSnapshot((k) => params.get(k) ?? null);
}

// ── Copy ─────────────────────────────────────────────────────────────

export function relationshipShareTitle(s: RelationshipSnapshot): string {
  return s.kind === 'synastry'
    ? `${s.person1} & ${s.person2}: ${s.score}% Cosmic Compatibility`
    : `${s.person1} & ${s.person2}: Composite Chart`;
}

export function relationshipShareSubtitle(s: RelationshipSnapshot): string {
  if (s.kind === 'synastry') return `${s.score}% · ${s.styleLabel || synastryBandText(s.score)}`;
  return [
    s.sun ? `☀️ ${s.sun}` : '',
    s.moon ? `🌙 ${s.moon}` : '',
    s.rising ? `⬆️ ${s.rising}` : '',
  ].filter(Boolean).join('  ');
}

/** Message for share sheets / copied text — ends with the public link. */
export function relationshipShareText(s: RelationshipSnapshot): string {
  const lead = s.kind === 'synastry'
    ? `${s.person1} & ${s.person2}: ${s.score}% cosmic compatibility on Align${s.styleLabel ? ` — "${s.styleLabel}"` : ''}. See the full breakdown:`
    : `What ${s.person1} & ${s.person2} create together${s.sun ? ` — a ${s.sun} Sun relationship` : ''}. See our composite chart:`;
  return `${lead}\n${relationshipShareUrl(s)}`;
}
