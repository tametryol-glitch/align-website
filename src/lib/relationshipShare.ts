/**
 * Relationship Share — the one format synastry and composite results travel
 * in, whether they go to a friend's DMs, the Cosmic Feed, or a public link
 * (aligncosmic.com/share?type=synastry|composite&…).
 *
 * DUPLICATED verbatim in align-web/src/lib/relationshipShare.ts and
 * align-app/src/services/relationshipShare.ts — keep both in sync. No imports,
 * so it runs on the web edge (OG images), the browser, and React Native.
 *
 * Privacy: carries first names, scores, signs and aspect names only. NEVER
 * birth dates, times, places or coordinates — the partner is often not an
 * Align user and never agreed to have their birth data passed around.
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

/** Same order and labels as the synastry engine's 7 categories. */
export const SYNASTRY_CATEGORIES = [
  { key: 'Attraction', emoji: '🔥', label: 'Physical Attraction' },
  { key: 'Emotional', emoji: '💙', label: 'Emotional Bond' },
  { key: 'Mental', emoji: '🧠', label: 'Mental Connection' },
  { key: 'Stability', emoji: '🏗️', label: 'Long-Term Stability' },
  { key: 'Karmic', emoji: '🔮', label: 'Karmic Link' },
  { key: 'Harmony', emoji: '☯️', label: 'Harmony' },
  { key: 'Magnetic', emoji: '⚡', label: 'Magnetic Pull' },
] as const;

/** Composite placements carried beyond the Big Three, in URL order. */
export const COMPOSITE_PLACEMENT_KEYS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;

const ASPECT_NAMES = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition', 'Quincunx'];
const SUPPORTIVE_ASPECTS = new Set(['Conjunction', 'Sextile', 'Trine']);
const COMPOSITE_ASPECT_BODIES = new Set([
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'MC',
]);
const MAX_ASPECTS = 5;
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
  score: number;
  /** Category key → 0–100. */
  categories: Record<string, number>;
  /** Strongest aspects, strongest first. */
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
  // eslint-disable-next-line no-control-regex
  const safe = first.replace(/[\u0000-\u001f<>]/g, '').slice(0, MAX_NAME);
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

function clampScore(n: unknown): number {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0;
}

/** Same bands the web synastry page shows under the score. */
export function synastryBand(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Soul-Level Connection', color: '#22c55e' };
  if (score >= 70) return { label: 'Deep Compatibility', color: '#a78bfa' };
  if (score >= 55) return { label: 'Strong Potential', color: '#9B6FF6' };
  if (score >= 40) return { label: 'Moderate Match', color: '#F5A623' };
  if (score >= 25) return { label: 'Growth Required', color: '#f59e0b' };
  return { label: 'Challenging Dynamic', color: '#ef4444' };
}

// ── Builders ─────────────────────────────────────────────────────────

/** From the synastry engine result (computeSynastryCompatibility). */
export function buildSynastrySnapshot(
  result: {
    overall_score: number;
    scores: Record<string, number>;
    aspects: Array<{ inner: string; outer: string; aspect: string; strength: number; supportive: boolean }>;
  },
  person1Name: string | null | undefined,
  person2Name: string | null | undefined,
): SynastrySnapshot {
  const categories: Record<string, number> = {};
  for (const c of SYNASTRY_CATEGORIES) categories[c.key] = clampScore(result.scores?.[c.key]);

  const aspects: ShareAspect[] = [];
  for (const a of [...(result.aspects || [])].sort((x, y) => (y.strength || 0) - (x.strength || 0))) {
    const p1 = normalizeBody(a.inner);
    const p2 = normalizeBody(a.outer);
    const aspect = normalizeAspect(a.aspect);
    if (!p1 || !p2 || !aspect) continue;
    aspects.push({ p1, aspect, p2, supportive: !!a.supportive });
    if (aspects.length >= MAX_ASPECTS) break;
  }

  return {
    kind: 'synastry',
    person1: cleanName(person1Name, 'Me'),
    person2: cleanName(person2Name, 'Partner'),
    score: clampScore(result.overall_score),
    categories,
    aspects,
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
): CompositeSnapshot {
  const signOf = (name: string) => normalizeSign(data.positions.find(p => p.name === name)?.sign);

  const placements: Record<string, string> = {};
  for (const key of COMPOSITE_PLACEMENT_KEYS) {
    const s = signOf(key);
    if (s) placements[key] = s;
  }

  const aspects: ShareAspect[] = [];
  const sorted = [...(data.aspects || [])]
    .filter(a => COMPOSITE_ASPECT_BODIES.has(a.planet1) && COMPOSITE_ASPECT_BODIES.has(a.planet2))
    .sort((x, y) => Math.abs(x.orb || 0) - Math.abs(y.orb || 0));
  for (const a of sorted) {
    const aspect = normalizeAspect(a.type);
    if (!aspect) continue;
    aspects.push({ p1: a.planet1, aspect, p2: a.planet2, supportive: SUPPORTIVE_ASPECTS.has(aspect) });
    if (aspects.length >= MAX_ASPECTS) break;
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
  return aspects.map(a => `${a.p1}~${a.aspect}~${a.p2}`).join(',');
}

function decodeAspects(raw: string | null): ShareAspect[] {
  if (!raw) return [];
  const out: ShareAspect[] = [];
  for (const part of raw.split(',')) {
    const [b1, asp, b2] = part.split('~');
    const p1 = normalizeBody(b1);
    const p2 = normalizeBody(b2);
    const aspect = normalizeAspect(asp);
    if (!p1 || !p2 || !aspect) continue;
    out.push({ p1, aspect, p2, supportive: SUPPORTIVE_ASPECTS.has(aspect) });
    if (out.length >= MAX_ASPECTS) break;
  }
  return out;
}

/** Query string (no leading `?`) — shared by /share and /api/og. */
export function relationshipShareQuery(s: RelationshipSnapshot): string {
  const parts: Array<[string, string]> = [['type', s.kind], ['a', s.person1], ['b', s.person2]];
  if (s.kind === 'synastry') {
    parts.push(['s', String(s.score)]);
    parts.push(['c', SYNASTRY_CATEGORIES.map(c => s.categories[c.key] ?? 0).join('.')]);
  } else {
    if (s.sun) parts.push(['sun', s.sun]);
    if (s.moon) parts.push(['moon', s.moon]);
    if (s.rising) parts.push(['rising', s.rising]);
    parts.push(['p', COMPOSITE_PLACEMENT_KEYS.map(k => s.placements[k] || '').join('.')]);
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
  const aspects = decodeAspects(get('x') ?? null);

  if (type === 'synastry') {
    const scores = String(get('c') || '').split('.');
    const categories: Record<string, number> = {};
    SYNASTRY_CATEGORIES.forEach((c, i) => { categories[c.key] = clampScore(scores[i]); });
    return { kind: 'synastry', person1, person2, score: clampScore(get('s')), categories, aspects };
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
      aspects,
    };
  }

  return null;
}

/** Snapshots stored in message metadata / post chart_data came from another client — re-validate before rendering. */
export function readStoredSnapshot(raw: unknown): RelationshipSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, any>;
  if (r.kind !== 'synastry' && r.kind !== 'composite') return null;
  const query = relationshipShareQuery({
    ...r,
    kind: r.kind,
    person1: String(r.person1 || ''),
    person2: String(r.person2 || ''),
    categories: r.categories || {},
    placements: r.placements || {},
    aspects: Array.isArray(r.aspects) ? r.aspects : [],
  } as unknown as RelationshipSnapshot);
  const params = new Map<string, string>();
  for (const pair of query.split('&')) {
    const i = pair.indexOf('=');
    params.set(pair.slice(0, i), decodeURIComponent(pair.slice(i + 1)));
  }
  return parseRelationshipSnapshot(k => params.get(k) ?? null);
}

// ── Copy ─────────────────────────────────────────────────────────────

export function relationshipShareTitle(s: RelationshipSnapshot): string {
  return s.kind === 'synastry'
    ? `${s.person1} & ${s.person2}: ${s.score}% Synastry`
    : `${s.person1} & ${s.person2}: Composite Chart`;
}

export function relationshipShareSubtitle(s: RelationshipSnapshot): string {
  if (s.kind === 'synastry') return `${s.score}% · ${synastryBand(s.score).label}`;
  return [
    s.sun ? `☀️ ${s.sun}` : '',
    s.moon ? `🌙 ${s.moon}` : '',
    s.rising ? `⬆️ ${s.rising}` : '',
  ].filter(Boolean).join('  ');
}

/** Message for share sheets / copied text — ends with the public link. */
export function relationshipShareText(s: RelationshipSnapshot): string {
  const lead = s.kind === 'synastry'
    ? `${s.person1} & ${s.person2} scored ${s.score}% on Align — ${synastryBand(s.score).label}. See where our charts connect:`
    : `The chart of ${s.person1} & ${s.person2}'s relationship${s.sun ? ` — a ${s.sun} Sun` : ''}${s.moon ? `, ${s.moon} Moon` : ''}. See what we create together:`;
  return `${lead}\n${relationshipShareUrl(s)}`;
}
