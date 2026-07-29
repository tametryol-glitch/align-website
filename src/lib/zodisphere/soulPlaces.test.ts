import { describe, it, expect } from 'vitest';
import {
  draconicCompositeLongitudes,
  projectDraconicCompositeLines,
  findSoulPlaces,
  MILES_PER_DEG,
  COMPOSITE_BODIES,
  type DraconicCompositeResult,
} from './soulPlaces';
import type { AcgLine3D } from '@/components/zodisphere/three-d/AstrocartographyDataAdapter';

describe('draconicCompositeLongitudes — composite OF draconics', () => {
  it('rotates each person by their OWN node, then midpoints', () => {
    const aBy = new Map<string, number>([['Venus', 100]]);
    const bBy = new Map<string, number>([['Venus', 200]]);
    // dracA = 100 − 10 = 90; dracB = 200 − 20 = 180; midpoint(90,180) = 135
    const { compositeLon } = draconicCompositeLongitudes(aBy, 10, bBy, 20, ['Venus']);
    expect(compositeLon.Venus).toBeCloseTo(135, 6);
  });

  it('handles wrap-around at 0°/360° via shortest-arc midpoint', () => {
    const aBy = new Map<string, number>([['Sun', 5]]);   // drac 5 − 0 = 5
    const bBy = new Map<string, number>([['Sun', 355]]);  // drac 355 − 0 = 355
    // shortest arc between 5 and 355 straddles 0 → midpoint 0, not 180
    const { compositeLon } = draconicCompositeLongitudes(aBy, 0, bBy, 0, ['Sun']);
    expect(compositeLon.Sun).toBeCloseTo(0, 6);
  });

  it('reports bodies missing from either chart as unavailable', () => {
    const aBy = new Map<string, number>([['Venus', 100], ['Mars', 50]]);
    const bBy = new Map<string, number>([['Venus', 200]]); // no Mars
    const { compositeLon, unavailable } = draconicCompositeLongitudes(aBy, 0, bBy, 0, ['Venus', 'Mars']);
    expect(compositeLon.Venus).toBeDefined();
    expect(unavailable).toContain('Mars');
  });

  it('COMPOSITE_BODIES excludes the (degenerate) North Node', () => {
    expect(COMPOSITE_BODIES).not.toContain('North Node');
    expect(COMPOSITE_BODIES.length).toBe(10);
  });
});

describe('projectDraconicCompositeLines', () => {
  it('produces the four ACG lines per body with soul- ids', () => {
    const lines = projectDraconicCompositeLines({ Venus: 135 }, 0);
    const angles = lines.map((l) => l.angle).sort();
    expect(angles).toEqual(['ASC', 'DSC', 'IC', 'MC']);
    expect(lines.every((l) => l.id.startsWith('soul-Venus:'))).toBe(true);
    expect(lines.every((l) => l.points.length > 0)).toBe(true);
  });
});

describe('findSoulPlaces', () => {
  // A synthetic Venus MC meridian at lon −86.802 (Birmingham, AL).
  const meridian: AcgLine3D = {
    id: 'soul-Venus:MC', planet: 'Venus', angle: 'MC', color: '#fff',
    points: Array.from({ length: 181 }, (_, i) => ({ lat: i - 90, lon: -86.802 })),
  };
  const result: DraconicCompositeResult = { lines: [meridian], compositeLon: { Venus: 135 }, unavailable: [] };

  it('returns a soul place for a city on the line, with a two-soul reading', () => {
    const cities: Array<[string, number, number]> = [
      ['Birmingham', 33.521, -86.802], // on the meridian
      ['FarAway', 0, 0],               // nowhere near
    ];
    const places = findSoulPlaces(result, cities, 50, 12);
    expect(places.length).toBe(1);
    expect(places[0].city).toBe('Birmingham');
    // On the meridian, segment distance is ~0 despite 1°-spaced vertices.
    expect(places[0].distanceMiles).toBeLessThan(2);
    expect(places[0].reading.narrative).toMatch(/two of you/i);
    expect(places[0].reading.headline).toContain('Venus');
    expect(places[0].reading.whatCouldHaveBeen.length).toBeGreaterThan(0);
  });

  it('respects the 50-mile orb boundary', () => {
    // 0.72° ≈ 50 mi of longitude at the equator; test at lat 0 for clean cos=1.
    const near: Array<[string, number, number]> = [['Near', 0, -86.802 + 40 / MILES_PER_DEG]];
    const far: Array<[string, number, number]> = [['Far', 0, -86.802 + 60 / MILES_PER_DEG]];
    expect(findSoulPlaces(result, near, 50, 12).length).toBe(1);
    expect(findSoulPlaces(result, far, 50, 12).length).toBe(0);
  });

  it('ranks closest first and caps the list', () => {
    const cities: Array<[string, number, number]> = [
      ['Mid', 0, -86.802 + 30 / MILES_PER_DEG],
      ['Closest', 0, -86.802 + 5 / MILES_PER_DEG],
    ];
    const places = findSoulPlaces(result, cities, 50, 1);
    expect(places.length).toBe(1);         // capped
    expect(places[0].city).toBe('Closest'); // closest wins
  });
});
