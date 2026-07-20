import { describe, it, expect } from 'vitest';
import { computeLocationReport } from './locationInspector';
import type { AcgLine3D } from './AstrocartographyDataAdapter';
import type { NatalContext } from './zodisphereInterpretation';

// A vertical line at longitude `lon0`, sampled densely so probeAcgLines measures
// the true distance from a tapped point.
function lineAt(planet: string, angle: string, lon0: number): AcgLine3D {
  const points = [];
  for (let lat = -30; lat <= 30; lat++) points.push({ lat, lon: lon0 });
  return { id: `${planet}:${angle}`, planet, angle, color: '#fff', points } as AcgLine3D;
}

// Three lines near a tap at (10, 5). With Aries rising the sign→house ladder is
// 1:1, so the placements resolve to: Venus 42° = Taurus → 2nd (Financial),
// Jupiter 130° = Leo → 5th (Relationships), Moon 275° = Capricorn → 10th.
const LINES = [lineAt('Venus', 'DSC', 3), lineAt('Jupiter', 'MC', 9), lineAt('Moon', 'IC', 11)];
const CTX: NatalContext = {
  ascSign: 'Aries',
  bodies: new Map<string, number>([
    ['Venus', 42], ['Jupiter', 130], ['Moon', 275], ['Ascendant', 5],
  ]),
};

const score = (r: ReturnType<typeof computeLocationReport>, dom: string) =>
  r.scores.find((s) => s.domain === dom)!.score;
const allDrivers = (r: ReturnType<typeof computeLocationReport>) =>
  r.scores.flatMap((s) => s.drivers).join(' | ');

describe('computeLocationReport — house layers feed the categories', () => {
  it('without natalCtx: surface-only scoring (backward compatible)', () => {
    const r = computeLocationReport(10, 5, LINES);
    expect(score(r, 'Relationships')).toBeGreaterThan(50); // Venus DSC surface
    expect(allDrivers(r)).not.toMatch(/Placement|Duad|Compendium|Matrix/);
  });

  it('with natalCtx: layers visibly move the bars, attributed by house', () => {
    const surface = computeLocationReport(10, 5, LINES);
    const layered = computeLocationReport(10, 5, LINES, CTX);
    // Venus in the 2nd (Taurus placement) clearly lifts Financial — a visible move.
    expect(score(layered, 'Financial') - score(surface, 'Financial')).toBeGreaterThanOrEqual(8);
    // Drivers carry the house each contribution came from (e.g. "Placement Taurus · 2h").
    expect(allDrivers(layered)).toMatch(/·\s*\d+h/);
    expect(allDrivers(layered)).toMatch(/Placement/);
  });

  it('the deeper duad/compendium/matrix layers also surface', () => {
    const layered = computeLocationReport(10, 5, LINES, CTX);
    // Jupiter's Sagittarius duad/compendium fall in the 9th → Spiritual.
    expect(allDrivers(layered)).toMatch(/Duad|Compendium|Matrix/);
  });

  it('effect is targeted by house — a domain no layer touches stays put', () => {
    const surface = computeLocationReport(10, 5, LINES);
    const layered = computeLocationReport(10, 5, LINES, CTX);
    // Nothing near falls in the 4th, so Home & Family barely moves (not global noise).
    expect(Math.abs(score(layered, 'Home & Family') - score(surface, 'Home & Family'))).toBeLessThanOrEqual(3);
  });

  it('scores stay within the clamped 3–99 range', () => {
    const r = computeLocationReport(10, 5, LINES, CTX);
    for (const s of r.scores) {
      expect(s.score).toBeGreaterThanOrEqual(3);
      expect(s.score).toBeLessThanOrEqual(99);
    }
  });
});
