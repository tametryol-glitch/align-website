import { describe, it, expect } from 'vitest';
import { projectWide } from '../../../../lib/zodisphereMidpoints';
import { eclipticToEquatorial, ACG_OBLIQUITY_DEG } from '../../../../lib/engines/derivedAstroMath';

/**
 * Phase-3 coordinate verification for the 3D astrocartography layer. The
 * AstrocartographyDataAdapter draws whatever `projectWide` (the validated
 * engine projection) returns — so we verify that projection produces the
 * geometrically correct lines the globe will render. This is the "confirm the
 * coordinates before adding all lines" gate: it fails loudly if a future change
 * distorts the projection the 3D globe depends on.
 */

const wrap180 = (x: number) => ((x % 360) + 360 + 180) % 360 - 180;

describe('3D astrocartography — line coordinate verification', () => {
  const sunLon = 237.2666; // an example Sun ecliptic longitude (deg)
  const gmst = 100;        // arbitrary but fixed GMST (deg) → deterministic

  it('MC line is a constant-longitude meridian at the closed-form longitude', () => {
    const lines = projectWide(sunLon, gmst);
    const mc = lines.find((l) => l.lineType === 'MC');
    expect(mc).toBeTruthy();
    expect(mc!.points.length).toBeGreaterThan(10);

    const lons = mc!.points.map((p) => p.lon);
    const spread = Math.max(...lons) - Math.min(...lons);
    expect(spread).toBeLessThan(1e-6); // truly constant longitude → a meridian

    // Expected MC longitude = wrap180(rightAscension − GMST).
    const { rightAscension: ra } = eclipticToEquatorial(sunLon, ACG_OBLIQUITY_DEG);
    const expected = wrap180(ra - gmst);
    expect(Math.abs(wrap180(lons[0] - expected))).toBeLessThan(1e-6);
  });

  it('MC spans pole to pole with only finite, in-bounds coordinates', () => {
    const mc = projectWide(sunLon, gmst).find((l) => l.lineType === 'MC')!;
    const lats = mc.points.map((p) => p.lat);
    expect(Math.min(...lats)).toBeLessThanOrEqual(-89);
    expect(Math.max(...lats)).toBeGreaterThanOrEqual(89);
    expect(mc.points.every((p) =>
      Number.isFinite(p.lat) && Number.isFinite(p.lon) &&
      p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180,
    )).toBe(true);
  });

  it('IC line is the opposite meridian (180° from MC)', () => {
    const lines = projectWide(sunLon, gmst);
    const mc = lines.find((l) => l.lineType === 'MC')!;
    const ic = lines.find((l) => l.lineType === 'IC')!;
    const diff = Math.abs(wrap180(mc.points[0].lon - ic.points[0].lon));
    expect(Math.abs(diff - 180)).toBeLessThan(1e-6);
  });

  it('ASC and DSC lines exist and are finite (horizon great circle halves)', () => {
    const lines = projectWide(sunLon, gmst);
    const asc = lines.find((l) => l.lineType === 'ASC');
    const dsc = lines.find((l) => l.lineType === 'DSC');
    expect(asc && asc.points.length > 1).toBe(true);
    expect(dsc && dsc.points.length > 1).toBe(true);
    for (const l of [asc!, dsc!]) {
      expect(l.points.every((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))).toBe(true);
    }
  });
});
