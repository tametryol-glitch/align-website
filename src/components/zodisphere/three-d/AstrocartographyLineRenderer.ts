/**
 * AstrocartographyLineRenderer — draws AcgLine3D polylines onto a Cesium globe.
 *
 * Responsibilities (rendering only — no astronomy):
 *  - Convert engine WGS84 points to Cesium positions, preserving them exactly.
 *  - Split lines at the ±180° antimeridian so none streaks across the globe.
 *  - Clamp lines to the terrain so they hug the surface at every zoom level.
 *  - Own the Cesium entities it creates and remove them cleanly on clear().
 *
 * The exact mathematical line is what gets drawn; a separate (future) pickable
 * corridor will provide a fat touch target WITHOUT moving the real geometry.
 */

import type * as CesiumNS from 'cesium';
import type { AcgLine3D, GeoPoint } from './AstrocartographyDataAdapter';

/** Split a point list wherever consecutive longitudes jump >180° (seam cross). */
function splitAtSeam(points: GeoPoint[]): GeoPoint[][] {
  const segments: GeoPoint[][] = [];
  let current: GeoPoint[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i > 0 && Math.abs(points[i].lon - points[i - 1].lon) > 180) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
    current.push(points[i]);
  }
  if (current.length > 1) segments.push(current);
  return segments;
}

export class AstrocartographyLineRenderer {
  private entities: CesiumNS.Entity[] = [];

  constructor(
    private readonly Cesium: typeof CesiumNS,
    private readonly viewer: CesiumNS.Viewer,
  ) {}

  /** Replace all drawn lines with the given set. */
  render(lines: AcgLine3D[]): void {
    this.clear();
    const { Cesium } = this;
    for (const line of lines) {
      const color = Cesium.Color.fromCssColorString(line.color || '#FFFFFF');
      for (const seg of splitAtSeam(line.points)) {
        if (seg.length < 2) continue;
        const positions = Cesium.Cartesian3.fromDegreesArray(
          seg.flatMap((p) => [p.lon, p.lat]),
        );
        const entity = this.viewer.entities.add({
          id: `acg-${line.id}-${this.entities.length}`,
          polyline: {
            positions,
            width: 4,
            clampToGround: true,
            arcType: Cesium.ArcType.GEODESIC,
            // Glow is one of the few materials Cesium supports on GROUND
            // polylines (PolylineOutline is not) — it also keeps the line
            // legible over both bright and dark terrain.
            material: new Cesium.PolylineGlowMaterialProperty({
              color,
              glowPower: 0.25,
              taperPower: 1.0,
            }),
          },
        });
        this.entities.push(entity);
      }
    }
    this.viewer.scene.requestRender();
  }

  /** Remove every entity this renderer created. */
  clear(): void {
    for (const e of this.entities) this.viewer.entities.remove(e);
    this.entities = [];
  }

  /** Whether any lines are currently drawn. */
  get count(): number {
    return this.entities.length;
  }
}
