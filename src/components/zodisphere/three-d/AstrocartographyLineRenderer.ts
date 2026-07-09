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

/** Choose a readable anchor for a line's label — the point nearest ~40°N, a
 *  generally land-rich, camera-facing latitude, falling back to the midpoint. */
function pickLabelPoint(points: GeoPoint[]): GeoPoint {
  let best = points[Math.floor(points.length / 2)];
  let bestDist = Infinity;
  for (const p of points) {
    const d = Math.abs(p.lat - 40);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}

export class AstrocartographyLineRenderer {
  private entities: CesiumNS.Entity[] = [];

  constructor(
    private readonly Cesium: typeof CesiumNS,
    private readonly viewer: CesiumNS.Viewer,
  ) {}

  /** Replace all drawn lines with the given set. */
  render(lines: AcgLine3D[], showLabels = false): void {
    this.clear();
    const { Cesium } = this;
    for (const line of lines) {
      const color = Cesium.Color.fromCssColorString(line.color || '#FFFFFF');
      const segments = splitAtSeam(line.points);
      segments.forEach((seg, si) => {
        if (seg.length < 2) return;
        const positions = Cesium.Cartesian3.fromDegreesArray(
          seg.flatMap((p) => [p.lon, p.lat]),
        );
        const entity = this.viewer.entities.add({
          id: `acg-${line.id}-${si}`,
          polyline: {
            positions,
            width: 4,
            // NOT clampToGround: ground-clamped polylines only support a narrow
            // material set and were rendering invisibly. A regular geodesic
            // polyline sits on the ellipsoid and, since Cesium doesn't
            // depth-test against terrain by default, draws cleanly on top of
            // the globe at every zoom — with full glow-material support.
            arcType: Cesium.ArcType.GEODESIC,
            material: new Cesium.PolylineGlowMaterialProperty({
              color,
              glowPower: 0.2,
              taperPower: 1.0,
            }),
          },
        });
        this.entities.push(entity);
      });

      // A single text label per line (planet + angle) — NOT colour-only, so it
      // stays identifiable for colour-vision-limited users. Placed near a
      // readable mid-northern latitude on the line.
      if (showLabels && line.points.length) {
        const anchor = pickLabelPoint(line.points);
        this.entities.push(this.viewer.entities.add({
          id: `acg-label-${line.id}`,
          position: Cesium.Cartesian3.fromDegrees(anchor.lon, anchor.lat),
          label: {
            text: `${line.planet} ${line.angle}`,
            font: '600 12px sans-serif',
            fillColor: color,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: 0,
            scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 4.0e7, 0.5),
          },
        }));
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
