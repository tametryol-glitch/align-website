import { describe, it, expect } from 'vitest';
import {
  compositeLongitudes, segmentIntersection, findLineCrossings, rankCrossings, projectTagged, rankBirthdayPlaces, nearestCity,
} from './relationshipModes';
import { ascMcAt, relocateChart, wholeSignHouse } from '@/components/zodisphere/three-d/relocated';
import { solveSolarReturnMoment } from '@/lib/zodisphereMidpoints';
import {
  composeSynastryCrossing, composeCompositePlace, composeYearPlace, composeRelocation,
} from '@/components/zodisphere/three-d/zodisphereInterpretation';
import type { AcgLine3D } from '@/components/zodisphere/three-d/AstrocartographyDataAdapter';

const meridian = (lon: number, body: string, owner: 'A' | 'B', angle: 'MC' | 'IC' = 'MC'): AcgLine3D => ({
  id: `${owner}-${body}-${angle}`, planet: `${owner} ${body}`, body, owner, angle, color: '#fff',
  points: Array.from({ length: 91 }, (_, i) => ({ lat: -90 + i * 2, lon })),
});
const diagonal = (body: string, owner: 'A' | 'B'): AcgLine3D => ({
  id: `${owner}-${body}-ASC`, planet: `${owner} ${body}`, body, owner, angle: 'ASC', color: '#fff',
  // runs from (-60 lon, -60 lat) to (60 lon, 60 lat)
  points: Array.from({ length: 121 }, (_, i) => ({ lat: -60 + i, lon: -60 + i })),
});

describe('composite longitudes', () => {
  it('takes the short-arc midpoint of each body', () => {
    const a = new Map([['Sun', 10], ['Moon', 350]]);
    const b = new Map([['Sun', 50], ['Moon', 10]]);
    const { compositeLon } = compositeLongitudes(a, b, ['Sun', 'Moon']);
    expect(compositeLon.Sun).toBeCloseTo(30, 6);
    expect(compositeLon.Moon).toBeCloseTo(0, 6); // across 0° Aries, not 180°
  });
  it('reports bodies missing from either chart', () => {
    const { unavailable } = compositeLongitudes(new Map([['Sun', 1]]), new Map(), ['Sun']);
    expect(unavailable).toEqual(['Sun']);
  });
});

describe('line crossings', () => {
  it('finds a basic segment intersection', () => {
    expect(segmentIntersection(0, 0, 2, 2, 0, 2, 2, 0)).toEqual({ x: 1, y: 1 });
    expect(segmentIntersection(0, 0, 1, 0, 0, 1, 1, 1)).toBeNull(); // parallel
  });
  it('crosses a meridian with a rising line at the right spot', () => {
    const hits = findLineCrossings([meridian(10, 'Venus', 'A')], [diagonal('Sun', 'B')]);
    expect(hits).toHaveLength(1);
    expect(hits[0].lon).toBeCloseTo(10, 3);
    expect(hits[0].lat).toBeCloseTo(10, 3);
  });
  it('two parallel meridians never cross', () => {
    expect(findLineCrossings([meridian(10, 'Venus', 'A')], [meridian(10.5, 'Sun', 'B')])).toHaveLength(0);
  });
  it('ranks a Venus x Jupiter crossing as thrive and Mars x Saturn as clash', () => {
    const good = { lat: 10, lon: 10, a: meridian(10, 'Venus', 'A'), b: diagonal('Jupiter', 'B') };
    const bad = { lat: 40, lon: 40, a: meridian(40, 'Mars', 'A'), b: diagonal('Saturn', 'B') };
    const ranked = rankCrossings([good, bad], 'Maya', [['Lisbon', 10.2, 10.1]]);
    expect(ranked.find((r) => r.reading.kind === 'thrive')?.city?.name).toBe('Lisbon');
    expect(ranked.find((r) => r.reading.kind === 'clash')).toBeTruthy();
  });
  it('nearestCity respects the radius', () => {
    expect(nearestCity(0, 0, [['Far', 30, 30]])).toBeNull();
    expect(nearestCity(0, 0, [['Near', 0.5, 0.5]])?.name).toBe('Near');
  });
});

describe('real projection sanity', () => {
  it('projects a composite longitude to four lines tagged with the body', () => {
    const lines = projectTagged({ Venus: 45 }, 100, { prefix: 'comp', color: '#f0f', tag: 'Us' });
    expect(lines.map((l) => l.angle).sort()).toEqual(['ASC', 'DSC', 'IC', 'MC']);
    expect(lines.every((l) => l.body === 'Venus' && l.planet === 'Us Venus')).toBe(true);
  });
});

describe('relocated geometry', () => {
  it('matches textbook angles', () => {
    const eq = ascMcAt(0, 0, 0);
    expect(eq.mc).toBeCloseTo(0, 6);
    expect(eq.asc).toBeCloseTo(90, 6); // 0° Aries culminating at the equator -> Cancer rising
    const a2 = ascMcAt(90, 0, 0);
    expect(a2.mc).toBeCloseTo(90, 6);
    expect(a2.asc).toBeCloseTo(180, 6);
    const lon = ascMcAt(0, 0, 51.5); // London-ish: 0° Aries MC, late Cancer rising
    expect(lon.asc).toBeGreaterThan(114);
    expect(lon.asc).toBeLessThan(119);
  });
  it('keeps every house unchanged when relocated to the birthplace', () => {
    const bodies = [{ name: 'Sun', longitude: 15 }, { name: 'Venus', longitude: 200 }, { name: 'Mars', longitude: 310 }];
    const r = relocateChart(bodies, 123, { lat: 40, lon: -74 }, { lat: 40, lon: -74 });
    expect(r.placements.every((p) => p.house === p.natalHouse)).toBe(true);
    expect(r.ascSign).toBe(r.natalAscSign);
  });
  it('re-houses planets when the place changes', () => {
    const bodies = [{ name: 'Jupiter', longitude: 100 }];
    const home = relocateChart(bodies, 0, { lat: 0, lon: 0 }, { lat: 0, lon: 0 });
    const away = relocateChart(bodies, 0, { lat: 0, lon: 90 }, { lat: 0, lon: 0 });
    expect(home.placements[0].house).not.toBe(away.placements[0].house);
    expect(wholeSignHouse(100, 90)).toBe(1);
  });
  it('flags a planet sitting on the relocated Midheaven as angular', () => {
    const bodies = [{ name: 'Sun', longitude: 3 }];
    const r = relocateChart(bodies, 0, { lat: 0, lon: 0 }, { lat: 0, lon: 0 });
    expect(r.angular.some((a) => a.body === 'Sun' && a.angle === 'MC')).toBe(true);
  });
});

describe('solar return solver', () => {
  it('converges on the Sun returning to its natal degree', async () => {
    const natal = 157.3;
    const t0 = Date.UTC(2027, 2, 14, 6, 0);
    // Synthetic Sun: true crossing at t0 + 0.7 day, with a non-uniform speed.
    const sun = (d: Date) => {
      const days = (d.getTime() - (t0 + 0.7 * 86_400_000)) / 86_400_000;
      return natal + days * 0.9856 + 0.02 * Math.sin(days);
    };
    const guess = new Date(t0 - 1.6 * 86_400_000);
    const moment = await solveSolarReturnMoment(natal, guess, async (d) => sun(d));
    expect(moment).not.toBeNull();
    expect(Math.abs(sun(moment!) - natal)).toBeLessThan(0.003);
  });
  it('returns null when the ephemeris fails', async () => {
    expect(await solveSolarReturnMoment(10, new Date(), async () => null)).toBeNull();
  });
});

describe('birthday ranking', () => {
  it('puts a Venus line ahead of a Saturn line', () => {
    // Solar Return lines carry the plain body name as `planet`.
    const lines = [meridian(10, 'Saturn', 'A'), meridian(20, 'Venus', 'A')].map((l) => ({ ...l, planet: l.body! }));
    const cities: Array<[string, number, number]> = [['Saturnville', 30, 10], ['Venusburg', 30, 20]];
    const { best, avoid } = rankBirthdayPlaces(lines, cities, 2027);
    expect(best[0].city).toBe('Venusburg');
    expect(avoid[0].city).toBe('Saturnville');
  });
});

describe('readings stay honest and pronoun-neutral', () => {
  it('synastry names the hard outcome and avoids gendered pronouns', () => {
    const r = composeSynastryCrossing({ bodyA: 'Mars', angleA: 'DSC', bodyB: 'Pluto', angleB: 'IC', nameB: '' });
    expect(r.kind).toBe('clash');
    expect(r.narrative).toMatch(/hard place/);
    expect(r.narrative).not.toMatch(/\b(he|she|his|her)\b/i);
  });
  it('composite, year and relocation readings produce text', () => {
    expect(composeCompositePlace({ body: 'Saturn', angle: 'IC', compositeDraconicLon: 100, distanceMiles: 10 }).narrative).toMatch(/cost/);
    expect(composeYearPlace({ body: 'Venus', angle: 'MC', distanceMiles: 12, year: 2027 }).headline).toMatch(/Venus/);
    const rel = composeRelocation({
      placeName: 'Tokyo', ascSign: 'Libra', mcSign: 'Aquarius', natalAscSign: 'Gemini',
      placements: [{ body: 'Jupiter', sign: 'Leo', house: 10, natalHouse: 7 }, { body: 'Mars', sign: 'Taurus', house: 4, natalHouse: 2 }],
      angular: [{ body: 'Jupiter', angle: 'MC' }],
    });
    expect(rel.shifts.length).toBeGreaterThan(0);
    expect(['lift', 'mixed', 'strain']).toContain(rel.verdict);
  });
});
