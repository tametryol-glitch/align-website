// ═══════════════════════════════════════════════════════════════════
// Midpoint Calculation Engine
// Computes midpoints between two charts and detects activations
// ═══════════════════════════════════════════════════════════════════

export interface Midpoint {
  planet1: string;
  planet2: string;
  longitude: number;
  label: string;
}

export interface MidpointActivation {
  midpoint: Midpoint;
  activatingPlanet: string;
  activatingLongitude: number;
  aspect: string;
  orb: number;
  strength: number; // 0-1
}

// Compute direct midpoint (shorter arc)
export function computeMidpoint(lon1: number, lon2: number): number {
  const a = ((lon1 % 360) + 360) % 360;
  const b = ((lon2 % 360) + 360) % 360;
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return ((a + diff / 2) + 360) % 360;
}

// Key midpoint pairs for synastry
const KEY_MIDPOINT_PAIRS = [
  ['Sun', 'Moon'],
  ['Venus', 'Mars'],
  ['Sun', 'Venus'],
  ['Moon', 'Venus'],
  ['Sun', 'Mars'],
  ['Moon', 'Mars'],
  ['Venus', 'Saturn'],
  ['Mars', 'Saturn'],
  ['Sun', 'Pluto'],
  ['Moon', 'Pluto'],
  ['Venus', 'Pluto'],
  ['Mars', 'Pluto'],
  ['Sun', 'Neptune'],
  ['Moon', 'Neptune'],
  ['Venus', 'Neptune'],
  ['Sun', 'Jupiter'],
  ['Moon', 'Jupiter'],
  ['Venus', 'Jupiter'],
  ['Sun', 'Saturn'],
  ['Moon', 'Saturn'],
  ['Venus', 'Uranus'],
  ['Mars', 'Uranus'],
  ['Sun', 'Ascendant'],
  ['Moon', 'Ascendant'],
  ['Venus', 'Ascendant'],
  ['Mars', 'Ascendant'],
  ['Sun', 'MC'],
  ['Moon', 'MC'],
  ['North Node', 'Sun'],
  ['North Node', 'Moon'],
  ['North Node', 'Venus'],
  ['Chiron', 'Venus'],
  ['Chiron', 'Moon'],
  ['Juno', 'Venus'],
  ['Juno', 'Sun'],
  ['Juno', 'Moon'],
];

// Aspect types for midpoint activation
const MIDPOINT_ASPECTS: Array<{ name: string; angle: number; orb: number; weight: number }> = [
  { name: 'Conjunction', angle: 0, orb: 2, weight: 1.0 },
  { name: 'Opposition', angle: 180, orb: 2, weight: 0.85 },
  { name: 'Square', angle: 90, orb: 1.5, weight: 0.7 },
  { name: 'Semi-Square', angle: 45, orb: 1, weight: 0.4 },
  { name: 'Sesquiquadrate', angle: 135, orb: 1, weight: 0.4 },
];

function findMidpointAspect(midLon: number, planetLon: number): { name: string; orb: number; weight: number } | null {
  let diff = Math.abs(midLon - planetLon);
  diff = Math.min(diff, 360 - diff);
  for (const asp of MIDPOINT_ASPECTS) {
    const orbDiff = Math.abs(diff - asp.angle);
    if (orbDiff <= asp.orb) {
      return { name: asp.name, orb: orbDiff, weight: asp.weight };
    }
  }
  return null;
}

// Compute all key midpoints from one chart
export function computeChartMidpoints(
  positions: Array<{ name: string; longitude: number }>,
): Midpoint[] {
  const posMap = new Map(positions.map(p => [p.name, p.longitude]));
  const midpoints: Midpoint[] = [];

  for (const [p1, p2] of KEY_MIDPOINT_PAIRS) {
    const lon1 = posMap.get(p1);
    const lon2 = posMap.get(p2);
    if (lon1 === undefined || lon2 === undefined) continue;
    const mp = computeMidpoint(lon1, lon2);
    midpoints.push({
      planet1: p1,
      planet2: p2,
      longitude: mp,
      label: `${p1}/${p2}`,
    });
  }

  return midpoints;
}

// Find activations: partner's planets hitting your midpoints
export function findMidpointActivations(
  midpoints: Midpoint[],
  activatingPositions: Array<{ name: string; longitude: number }>,
): MidpointActivation[] {
  const activations: MidpointActivation[] = [];

  for (const mp of midpoints) {
    for (const planet of activatingPositions) {
      const result = findMidpointAspect(mp.longitude, planet.longitude);
      if (!result) continue;

      const orbWeight = Math.max(0, 1 - (result.orb / 2));
      activations.push({
        midpoint: mp,
        activatingPlanet: planet.name,
        activatingLongitude: planet.longitude,
        aspect: result.name,
        orb: Math.round(result.orb * 100) / 100,
        strength: Math.round(result.weight * orbWeight * 1000) / 1000,
      });
    }
  }

  return activations.sort((a, b) => b.strength - a.strength);
}

// Shadow midpoints — midpoints involving Pluto, Saturn, Mars, Neptune that indicate toxicity potential
export const SHADOW_MIDPOINT_PAIRS = [
  ['Mars', 'Pluto'],
  ['Mars', 'Saturn'],
  ['Saturn', 'Pluto'],
  ['Moon', 'Pluto'],
  ['Venus', 'Pluto'],
  ['Sun', 'Pluto'],
  ['Moon', 'Saturn'],
  ['Venus', 'Saturn'],
  ['Neptune', 'Mars'],
  ['Neptune', 'Venus'],
  ['Neptune', 'Moon'],
  ['Mars', 'Uranus'],
  ['Pluto', 'Uranus'],
];

export function computeShadowMidpoints(
  positions: Array<{ name: string; longitude: number }>,
): Midpoint[] {
  const posMap = new Map(positions.map(p => [p.name, p.longitude]));
  const midpoints: Midpoint[] = [];

  for (const [p1, p2] of SHADOW_MIDPOINT_PAIRS) {
    const lon1 = posMap.get(p1);
    const lon2 = posMap.get(p2);
    if (lon1 === undefined || lon2 === undefined) continue;
    const mp = computeMidpoint(lon1, lon2);
    midpoints.push({
      planet1: p1,
      planet2: p2,
      longitude: mp,
      label: `${p1}/${p2}`,
    });
  }

  return midpoints;
}
