/* ──────────────────────────────────────────────────────────────
   Athletic asteroids — the one list every personal engine uses.

   These nine are NOT on a default natal chart. An engine that wants
   them passes ATHLETIC_ASTEROID_NAMES as `extra_asteroids` to
   /charts/natal; the backend returns them in `positions` under these
   exact names (verified against Swiss Ephemeris catalogue names).

   Every chart contains every asteroid, so "has Heracles" means
   nothing. What separates an athletic chart is PROMINENCE: the body
   is fused (within 3°) with the Sun, Mars, Ascendant or Midheaven.
   getAthleticProfile() scores exactly that and nothing else.

   House placement is deliberately NOT scored. Calibrated 18-09-2026
   against 300 random charts: with 1st/5th/6th/10th house points the
   average chart scored 10 and only 1% scored zero, i.e. everyone looked
   athletic. Contacts-only: 48% of random charts score zero, while 4 of
   6 famous athletes tested (James, Williams, Ali, Bryant) score.

   Mirrored in align-app/src/services/athleticAsteroids.ts.
   ────────────────────────────────────────────────────────────── */

export const ATHLETIC_ASTEROID_NAMES = [
  'Heracles', 'Atalante', 'Olympia', 'Marathon', 'Spartacus',
  'Victoria', 'Hidalgo', 'Panacea', 'Fama',
] as const;

export type AthleticAsteroid = (typeof ATHLETIC_ASTEROID_NAMES)[number];

/** What each body adds to an athletic profile — short noun phrases. */
export const ATHLETIC_THEME: Record<AthleticAsteroid, string> = {
  Heracles: 'raw strength and stamina',
  Atalante: 'speed and agility',
  Olympia: 'elite competition',
  Marathon: 'endurance',
  Spartacus: 'fighting spirit',
  Victoria: 'winning and titles',
  Hidalgo: 'competitive nerve',
  Panacea: 'recovery and comebacks',
  Fama: 'athletic fame',
};

/** Bodies an athletic asteroid must touch to count as fused into the chart's engine. */
const ATHLETIC_ANCHORS = ['Sun', 'Mars', 'Ascendant', 'MC'] as const;
const ANCHOR_LABEL: Record<string, string> = {
  Sun: 'Sun', Mars: 'Mars', Ascendant: 'Ascendant', MC: 'Midheaven',
};
const CONJUNCTION_ORB = 3;
/** Prominence points per contact. */
const CONTACT_WEIGHT = 4;

export interface AthleticHit {
  asteroid: AthleticAsteroid;
  sign: string;
  house: number;
  /** Anchors it is conjunct, with orb in degrees. */
  contacts: { anchor: string; orb: number }[];
  /** Prominence points for this body alone. */
  weight: number;
  /** One second-person sentence, ready to show. */
  reason: string;
}

export interface AthleticProfile {
  /** Sum of every prominent body's weight. 0 = no athletic emphasis. */
  score: number;
  /** Only prominent bodies, strongest first. */
  hits: AthleticHit[];
  /** How many of the nine the chart actually returned (0 = not requested). */
  computed: number;
}

interface PositionLike {
  name?: string;
  longitude?: number;
  sign?: string;
  house?: number;
}

function arc(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return d > 180 ? 360 - d : d;
}

export function isAthleticAsteroid(name: string | undefined | null): name is AthleticAsteroid {
  return !!name && (ATHLETIC_ASTEROID_NAMES as readonly string[]).includes(name);
}

export function getAthleticProfile(positions: PositionLike[] | undefined | null): AthleticProfile {
  const list = Array.isArray(positions) ? positions : [];
  const byName = new Map(list.filter((p) => p?.name).map((p) => [p.name as string, p]));
  const hits: AthleticHit[] = [];
  let computed = 0;

  for (const asteroid of ATHLETIC_ASTEROID_NAMES) {
    const p = byName.get(asteroid);
    if (!p || typeof p.longitude !== 'number') continue;
    computed++;

    const contacts: { anchor: string; orb: number }[] = [];
    for (const anchor of ATHLETIC_ANCHORS) {
      const a = byName.get(anchor);
      if (!a || typeof a.longitude !== 'number') continue;
      const orb = arc(p.longitude, a.longitude);
      if (orb <= CONJUNCTION_ORB) contacts.push({ anchor, orb: Math.round(orb * 10) / 10 });
    }
    if (contacts.length === 0) continue;
    const house = Number(p.house) || 0;
    const weight = contacts.length * CONTACT_WEIGHT;

    const theme = ATHLETIC_THEME[asteroid];
    const onAngle = contacts.some((c) => c.anchor === 'Ascendant' || c.anchor === 'MC');
    const reason = `${asteroid} sits on your ${contacts.map((c) => ANCHOR_LABEL[c.anchor]).join(' and ')}: ${theme} is wired into ${onAngle ? 'how people see you' : 'your core drive'}, not a hobby.`;

    hits.push({ asteroid, sign: p.sign || '', house, contacts, weight, reason });
  }

  hits.sort((a, b) => b.weight - a.weight);
  return { score: hits.reduce((s, h) => s + h.weight, 0), hits, computed };
}

/* ── AI context ──────────────────────────────────────────────────── */

const AI_ASPECTS: { name: string; angle: number }[] = [
  { name: 'conjunct', angle: 0 },
  { name: 'opposite', angle: 180 },
  { name: 'square', angle: 90 },
  { name: 'trine', angle: 120 },
  { name: 'sextile', angle: 60 },
];
const AI_TARGETS = ['Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Ascendant', 'MC'];
const AI_ASPECT_ORB = 2;

/**
 * Text block for the AI Astrologer: every athletic asteroid's placement,
 * the prominent ones (the real athletic signature), and other tight
 * aspects. Returns '' when the chart was fetched without the athletic
 * extras, so the model is never handed an empty section.
 */
export function formatAthleticContext(positions: PositionLike[] | undefined | null): string {
  const profile = getAthleticProfile(positions);
  if (profile.computed === 0) return '';
  const list = Array.isArray(positions) ? positions : [];
  const byName = new Map(list.filter((p) => p?.name).map((p) => [p.name as string, p]));

  const placements: string[] = [];
  const aspects: string[] = [];
  for (const asteroid of ATHLETIC_ASTEROID_NAMES) {
    const p = byName.get(asteroid);
    if (!p || typeof p.longitude !== 'number') continue;
    const deg = (((p.longitude % 30) + 30) % 30).toFixed(1);
    placements.push(`${asteroid} (${ATHLETIC_THEME[asteroid]}): ${deg}° ${p.sign || ''}${p.house ? `, House ${p.house}` : ''}`);
    for (const target of AI_TARGETS) {
      const t = byName.get(target);
      if (!t || typeof t.longitude !== 'number') continue;
      const d = arc(p.longitude, t.longitude);
      for (const a of AI_ASPECTS) {
        const orb = Math.abs(d - a.angle);
        if (orb <= AI_ASPECT_ORB && !(a.angle === 0 && orb <= CONJUNCTION_ORB && ATHLETIC_ANCHORS.includes(target as any))) {
          aspects.push(`${asteroid} ${a.name} ${target === 'MC' ? 'Midheaven' : target} (${orb.toFixed(1)}°)`);
        }
      }
    }
  }

  const prominent = profile.hits.length
    ? profile.hits.map((h) => `- ${h.reason} (${h.contacts.map((c) => `${ANCHOR_LABEL[c.anchor]} ${c.orb}°`).join(', ')})`).join('\n')
    : '- None. No athletic asteroid is within 3° of the Sun, Mars, Ascendant or Midheaven, so do not present these asteroids as a strong athletic signature; read athletic potential from Mars, the Sun, the 1st/5th/6th/10th houses and their aspects instead.';

  return [
    'ATHLETIC ASTEROIDS (strength, speed, competition, endurance, recovery, fame):',
    ...placements,
    '',
    'PROMINENT ATHLETIC SIGNATURES (within 3° of Sun, Mars, Ascendant or Midheaven; lead with these):',
    prominent,
    aspects.length ? `\nOTHER TIGHT ASPECTS (within ${AI_ASPECT_ORB}°):\n${aspects.map((a) => `- ${a}`).join('\n')}` : '',
  ].filter((s) => s !== undefined).join('\n').trim();
}
