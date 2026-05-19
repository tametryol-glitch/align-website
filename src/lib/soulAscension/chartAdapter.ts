import { NODE_AXIS_MEANINGS } from './nodeMeanings';
import { CORE_PLANETS, PLANET_ALIASES } from './planets';
import { DEMO_SOUL_ASCENSION_CHART } from './sampleCharts';
import { normalizeSign, oppositeSign, signFromLongitude, ZODIAC_SIGNS } from './signs';
import type {
  ChartAspect,
  ChartPlacement,
  MajorNodeAspect,
  NormalizedChart,
  NormalizedNodeAspect,
  NormalizedPlacement,
  PlanetKey,
  SoulAscensionChartInput,
  ZodiacSign,
} from './types';

const FALLBACK_HOUSES: Record<PlanetKey, number> = {
  Ascendant: 1,
  Sun: 10,
  Moon: 4,
  Mercury: 3,
  Venus: 7,
  Mars: 1,
  Jupiter: 9,
  Saturn: 10,
  Uranus: 11,
  Neptune: 12,
  Pluto: 8,
  Vesta: 6,
  Juno: 7,
  Chiron: 6,
  Lilith: 8,
  'North Node': 2,
  'South Node': 8,
};

const FALLBACK_SIGNS: Record<PlanetKey, ZodiacSign> = {
  Ascendant: 'Libra',
  Sun: 'Leo',
  Moon: 'Cancer',
  Mercury: 'Gemini',
  Venus: 'Taurus',
  Mars: 'Aries',
  Jupiter: 'Sagittarius',
  Saturn: 'Capricorn',
  Uranus: 'Aquarius',
  Neptune: 'Pisces',
  Pluto: 'Scorpio',
  Vesta: 'Virgo',
  Juno: 'Libra',
  Chiron: 'Virgo',
  Lilith: 'Scorpio',
  'North Node': 'Taurus',
  'South Node': 'Scorpio',
};

const MAJOR_NODE_ASPECTS: MajorNodeAspect[] = ['conjunction', 'square', 'opposition', 'trine'];

function canonicalPlanetName(name: string | undefined): PlanetKey | null {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();
  for (const key of CORE_PLANETS) {
    if (PLANET_ALIASES[key].some((alias) => alias.toLowerCase() === normalized)) return key;
  }
  return null;
}

function collectPlacements(input: SoulAscensionChartInput): ChartPlacement[] {
  const placements = [...(input.placements ?? []), ...(input.planets ?? [])];
  if (typeof input.ascendant === 'object' && input.ascendant) {
    placements.push({ ...input.ascendant, name: input.ascendant.name || 'Ascendant' });
  } else if (typeof input.ascendant === 'string') {
    placements.push({ name: 'Ascendant', sign: input.ascendant, house: 1 });
  } else if (typeof input.ascendant === 'number') {
    placements.push({
      name: 'Ascendant',
      sign: signFromLongitude(input.ascendant, 'Libra'),
      house: 1,
      longitude: input.ascendant,
      degree: input.ascendant % 30,
    });
  }
  if (input.sun) placements.push({ ...input.sun, name: input.sun.name || 'Sun' });
  if (input.moon) placements.push({ ...input.moon, name: input.moon.name || 'Moon' });
  if (input.northNode) placements.push({ ...input.northNode, name: input.northNode.name || 'North Node' });
  if (input.southNode) placements.push({ ...input.southNode, name: input.southNode.name || 'South Node' });
  return placements;
}

function longitudeForSign(sign: ZodiacSign, degree = 0): number {
  const index = ZODIAC_SIGNS.indexOf(sign);
  return index * 30 + Math.max(0, Math.min(29.99, Number.isFinite(degree) ? degree : 0));
}

function normalizePlacement(
  key: PlanetKey,
  raw: ChartPlacement | undefined,
  signFallback: ZodiacSign,
  houseFallback: number,
): NormalizedPlacement {
  const rawLongitude = raw?.longitude;
  const degree = Number.isFinite(raw?.degree) ? Number(raw?.degree) : Number.isFinite(rawLongitude) ? Number(rawLongitude) % 30 : 0;
  const sign = raw?.sign
    ? normalizeSign(raw.sign, signFallback)
    : Number.isFinite(rawLongitude)
      ? signFromLongitude(Number(rawLongitude), signFallback)
      : signFallback;
  return {
    name: key,
    sign,
    house: Number.isFinite(raw?.house) && Number(raw?.house) >= 1 && Number(raw?.house) <= 12
      ? Math.round(Number(raw?.house))
      : houseFallback,
    degree: Math.round((((degree % 30) + 30) % 30) * 100) / 100,
    longitude: Number.isFinite(rawLongitude)
      ? Math.round((((Number(rawLongitude) % 360) + 360) % 360) * 100) / 100
      : longitudeForSign(sign, degree),
    retrograde: !!raw?.retrograde,
  };
}

function normalizeAspectType(type: string | undefined): MajorNodeAspect | null {
  if (!type) return null;
  const lower = type.toLowerCase();
  if (lower === 'conj' || lower === 'conjunction') return 'conjunction';
  if (lower === 'opp' || lower === 'opposition') return 'opposition';
  if (lower === 'sqr' || lower === 'square') return 'square';
  if (lower === 'tri' || lower === 'trine') return 'trine';
  return null;
}

function collectAspects(input: SoulAscensionChartInput, placements: ChartPlacement[]): ChartAspect[] {
  const direct = input.aspects ?? [];
  const nested = placements.flatMap((placement) => placement.aspects ?? []);
  return [...direct, ...nested].filter((aspect) => aspect && aspect.planet1 && aspect.planet2);
}

function normalizeNodeAspects(aspects: ChartAspect[]): NormalizedNodeAspect[] {
  const normalized: NormalizedNodeAspect[] = [];
  for (const aspect of aspects) {
    const type = normalizeAspectType(aspect.type);
    if (!type || !MAJOR_NODE_ASPECTS.includes(type)) continue;
    const p1 = canonicalPlanetName(aspect.planet1);
    const p2 = canonicalPlanetName(aspect.planet2);
    if (!p1 || !p2) continue;
    const p1Node = p1 === 'North Node' || p1 === 'South Node';
    const p2Node = p2 === 'North Node' || p2 === 'South Node';
    if (p1Node === p2Node) continue;
    const node = (p1Node ? p1 : p2) as 'North Node' | 'South Node';
    const planet = (p1Node ? p2 : p1) as PlanetKey;
    normalized.push({
      planet,
      node,
      type,
      orb: Number.isFinite(aspect.orb) ? Math.max(0, Number(aspect.orb)) : 5,
    });
  }
  return normalized;
}

function signatureFor(placements: Record<PlanetKey, NormalizedPlacement>, source: 'user' | 'demo'): string {
  const core = ['Ascendant', 'Sun', 'Moon', 'North Node', 'South Node', 'Venus', 'Mars', 'Saturn', 'Juno'] as PlanetKey[];
  return `${source}:` + core
    .map((key) => `${key}:${placements[key].sign}:${placements[key].house}:${Math.round(placements[key].degree)}`)
    .join('|');
}

export function normalizeSoulAscensionChart(input?: SoulAscensionChartInput | null): NormalizedChart {
  const usingDemo = !input || (!input.placements?.length && !input.planets?.length && !input.northNode);
  const sourceInput: SoulAscensionChartInput = usingDemo ? DEMO_SOUL_ASCENSION_CHART : (input as SoulAscensionChartInput);
  const rawPlacements = collectPlacements(sourceInput);
  const byPlanet = new Map<PlanetKey, ChartPlacement>();

  for (const placement of rawPlacements) {
    const key = canonicalPlanetName(placement.name);
    if (key && !byPlanet.has(key)) byPlanet.set(key, placement);
  }

  const northRaw = byPlanet.get('North Node');
  const northSign = northRaw?.sign
    ? normalizeSign(northRaw.sign, 'Taurus')
    : Number.isFinite(northRaw?.longitude)
      ? signFromLongitude(Number(northRaw?.longitude), 'Taurus')
      : 'Taurus';
  const southRaw = byPlanet.get('South Node');
  const southSign = southRaw?.sign
    ? normalizeSign(southRaw.sign, oppositeSign(northSign))
    : Number.isFinite(southRaw?.longitude)
      ? signFromLongitude(Number(southRaw?.longitude), oppositeSign(northSign))
      : oppositeSign(northSign);

  const signFallbacks = { ...FALLBACK_SIGNS, 'North Node': northSign, 'South Node': southSign };
  const houseFallbacks = { ...FALLBACK_HOUSES };
  if (northRaw?.house) houseFallbacks['North Node'] = Math.round(Number(northRaw.house));
  if (southRaw?.house) houseFallbacks['South Node'] = Math.round(Number(southRaw.house));

  const placements = CORE_PLANETS.reduce((acc, key) => {
    acc[key] = normalizePlacement(key, byPlanet.get(key), signFallbacks[key], houseFallbacks[key]);
    return acc;
  }, {} as Record<PlanetKey, NormalizedPlacement>);

  if (!byPlanet.has('South Node') && byPlanet.has('North Node')) {
    placements['South Node'] = {
      ...placements['South Node'],
      sign: oppositeSign(placements['North Node'].sign),
      longitude: (placements['North Node'].longitude + 180) % 360,
      degree: placements['North Node'].degree,
      house: ((placements['North Node'].house + 5) % 12) + 1,
    };
  }

  const aspects = collectAspects(sourceInput, rawPlacements);
  const nodeAspects = normalizeNodeAspects(aspects).sort((a, b) => {
    const aStrong = a.type === 'conjunction' ? 0 : a.type === 'square' || a.type === 'opposition' ? 1 : 2;
    const bStrong = b.type === 'conjunction' ? 0 : b.type === 'square' || b.type === 'opposition' ? 1 : 2;
    return aStrong - bStrong || a.orb - b.orb;
  });

  const southMeaning = NODE_AXIS_MEANINGS[placements['South Node'].sign];
  if (southMeaning && placements['North Node'].sign !== southMeaning.northSign) {
    placements['North Node'] = {
      ...placements['North Node'],
      sign: southMeaning.northSign,
      longitude: longitudeForSign(southMeaning.northSign, placements['North Node'].degree),
    };
  }

  const source = usingDemo ? 'demo' : 'user';
  return {
    placements,
    aspects,
    nodeAspects,
    source,
    signature: signatureFor(placements, source),
  };
}

export const __chartAdapterInternals = {
  canonicalPlanetName,
  normalizeAspectType,
};
