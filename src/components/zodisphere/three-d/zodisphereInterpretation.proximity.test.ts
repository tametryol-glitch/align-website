import { describe, it, expect } from 'vitest';
import { interpretLocation, proximityBandFor, type NatalContext } from './zodisphereInterpretation';

// A minimal but valid natal context (longitudes in ecliptic degrees).
function ctx(): NatalContext {
  return {
    ascSign: 'Leo',
    bodies: new Map<string, number>([
      ['Sun', 100], ['Moon', 200], ['Mercury', 110], ['Venus', 130],
      ['Mars', 250], ['Jupiter', 40], ['Saturn', 300], ['Uranus', 20],
      ['Neptune', 330], ['Pluto', 280], ['North Node', 15], ['Ascendant', 150],
    ]),
  };
}

describe('proximityBandFor', () => {
  it('maps distance to the right band', () => {
    expect(proximityBandFor(0)).toBe('on');
    expect(proximityBandFor(2)).toBe('on');
    expect(proximityBandFor(3)).toBe('near');
    expect(proximityBandFor(5)).toBe('near');
    expect(proximityBandFor(8)).toBe('ambient');
    expect(proximityBandFor(10)).toBe('ambient');
    expect(proximityBandFor(14)).toBe('far');
  });
});

describe('interpretLocation — off-line spots still get a reading', () => {
  it('on-line (no proximity) reads normally, no distance note', () => {
    const r = interpretLocation(ctx(), 'Venus', { angle: 'DSC', mode: 'present' });
    expect(r).not.toBeNull();
    expect(r!.proximity).toBeUndefined();
    expect(r!.narrative.length).toBeGreaterThan(0);
    expect(r!.narrative).not.toMatch(/No line runs right through here|No planetary line crosses|open field/i);
    // Full event range preserved on the line.
    expect(r!.events.length).toBeGreaterThan(0);
  });

  it("'near' spot: produces a softened narrative framed by distance", () => {
    const r = interpretLocation(ctx(), 'Venus', {
      angle: 'DSC', mode: 'present',
      proximity: { distanceDeg: 4.2, distanceKm: 467 },
    });
    expect(r).not.toBeNull();
    expect(r!.proximity?.band).toBe('near');
    expect(r!.proximity?.distanceKm).toBe(467);
    // The narrative names the nearest-line framing and the km distance.
    expect(r!.narrative).toMatch(/No line runs right through here/i);
    expect(r!.narrative).toContain('467 km');
    // Events are trimmed (softer), not empty.
    expect(r!.events.length).toBeGreaterThan(0);
    expect(r!.events.length).toBeLessThanOrEqual(3);
  });

  it("'far' spot: gentlest framing, fewest events, still non-empty prose", () => {
    const r = interpretLocation(ctx(), 'Sun', {
      angle: 'MC', mode: 'present',
      proximity: { distanceDeg: 16, distanceKm: 1780 },
    });
    expect(r).not.toBeNull();
    expect(r!.proximity?.band).toBe('far');
    expect(r!.narrative).toMatch(/open field/i);
    expect(r!.narrative).toContain('1780 km');
    expect(r!.events.length).toBeLessThanOrEqual(2);
  });

  it('draconic off-line spot: past-life echo is framed as distant', () => {
    const r = interpretLocation(ctx(), 'Moon', {
      angle: 'IC', mode: 'draconic',
      proximity: { distanceDeg: 12, distanceKm: 1330 },
    });
    expect(r).not.toBeNull();
    expect(r!.proximity?.band).toBe('far');
    expect(r!.narrative).toMatch(/distant echo|doesn't cross/i);
  });
});
