import { describe, it, expect } from 'vitest';
import { computeLocationReport } from './locationInspector';
import type { AcgLine3D } from './AstrocartographyDataAdapter';
import type { NatalContext } from './zodisphereInterpretation';

// A single Venus DSC line running through (0,0), sampled densely so probeAcgLines
// finds it right on the point (distance ~0 → full strength).
function venusDscLineAtOrigin(): AcgLine3D {
  const points = [];
  for (let lat = -20; lat <= 20; lat++) points.push({ lat, lon: 0 });
  return { id: 'venus:DSC', planet: 'Venus', angle: 'DSC', color: '#fff', points } as AcgLine3D;
}

function ctx(): NatalContext {
  return {
    ascSign: 'Aries', // Aries rising → sign-house mapping is the plain 1:1 ladder
    bodies: new Map<string, number>([
      ['Venus', 42], // ~12° Taurus — a concrete longitude to derive its layers from
      ['Ascendant', 5],
    ]),
  };
}

const score = (r: ReturnType<typeof computeLocationReport>, dom: string) =>
  r.scores.find((s) => s.domain === dom)!.score;

describe('computeLocationReport — duad/comp/matrix feed the categories', () => {
  const line = venusDscLineAtOrigin();

  it('without natalCtx: surface-only scoring (unchanged, backward compatible)', () => {
    const r = computeLocationReport(0, 0, [line]);
    // Venus DSC lifts Relationships above the neutral 50 baseline.
    expect(score(r, 'Relationships')).toBeGreaterThan(50);
    // No layer drivers appear when no context is supplied.
    const allDrivers = r.scores.flatMap((s) => s.drivers).join(' ');
    expect(allDrivers).not.toMatch(/Duad|Compendium|Matrix/);
  });

  it('with natalCtx: layers contribute and are attributed in drivers', () => {
    const r = computeLocationReport(0, 0, [line], ctx());
    const allDrivers = r.scores.flatMap((s) => s.drivers).join(' ');
    // At least one deeper-layer driver is surfaced (explainability preserved).
    expect(allDrivers).toMatch(/Duad|Compendium|Matrix/);
    // The layer drivers carry the house they fall in (e.g. "Duad Cancer · 4h").
    expect(allDrivers).toMatch(/·\s*\d+h/);
  });

  it('layers move a category, but stay subordinate to the surface line', () => {
    const surfaceOnly = computeLocationReport(0, 0, [line]);
    const withLayers = computeLocationReport(0, 0, [line], ctx());
    // Venus@42's layers land in Career/Visibility houses, so Career shifts off its
    // neutral baseline once layers are on (they genuinely contribute).
    const careerShift = Math.abs(score(withLayers, 'Career') - score(surfaceOnly, 'Career'));
    expect(careerShift).toBeGreaterThan(0);
    // …but no single layer stack overpowers a surface line. Relationships (the DSC
    // surface domain) stays well above the layer-driven Career score.
    expect(score(withLayers, 'Relationships')).toBeGreaterThan(score(withLayers, 'Career') + 15);
    // The surface domain itself barely moves (no layer lands there here).
    const relShift = Math.abs(score(withLayers, 'Relationships') - score(surfaceOnly, 'Relationships'));
    expect(relShift).toBeLessThanOrEqual(6);
  });

  it('scores stay within the clamped 3–99 range', () => {
    const r = computeLocationReport(0, 0, [line], ctx());
    for (const s of r.scores) {
      expect(s.score).toBeGreaterThanOrEqual(3);
      expect(s.score).toBeLessThanOrEqual(99);
    }
  });
});
