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

  /** Replace all drawn lines with the given set. `dashed` distinguishes
   *  midpoint lines from solid natal ACG lines; `corridor` draws a soft
   *  translucent influence band under each line (centre line stays on top). */
  render(lines: AcgLine3D[], showLabels = false, dashed = false, corridor = false): void {
    this.clear();
    const { Cesium } = this;
    for (const line of lines) {
      const color = Cesium.Color.fromCssColorString(line.color || '#FFFFFF');
      const isDuad = line.style === 'duad';
      const isComp = line.style === 'compendium';
      const isGrid = line.style === 'gridline';
      const segments = splitAtSeam(line.points);
      segments.forEach((seg, si) => {
        if (seg.length < 2) return;
        const positions = Cesium.Cartesian3.fromDegreesArray(
          seg.flatMap((p) => [p.lon, p.lat]),
        );
        // Influence corridor: a wide, faint band beneath the exact line so the
        // line's zone of influence reads visually without hiding the centre.
        if (corridor) {
          this.entities.push(this.viewer.entities.add({
            id: `acg-corr-${line.id}-${si}`,
            polyline: {
              positions,
              width: 16,
              arcType: Cesium.ArcType.GEODESIC,
              material: color.withAlpha(0.12),
            },
          }));
        }
        // Duad + compendium are horizontal parallels at the derived point's true
        // DECLINATION (a real latitude), so they follow a constant latitude →
        // RHUMB; the vertical natal ACG lines follow great circles → GEODESIC.
        const horizontal = isDuad || isComp || isGrid;
        const polyline: any = {
          positions,
          // Horizontal grid lines follow a constant latitude → RHUMB; ACG lines
          // follow great circles → GEODESIC.
          arcType: horizontal ? Cesium.ArcType.RHUMB : Cesium.ArcType.GEODESIC,
          // NOT clampToGround: ground-clamped polylines only support a narrow
          // material set and rendered invisibly. Regular geodesic polylines draw
          // on top of the globe at every zoom.
          width: isGrid ? 1 : isComp ? 2 : isDuad ? 4 : dashed ? 3 : 4,
          material: isGrid
            ? color.withAlpha(0.28) // faint even ladder rung (solid, thin)
            : (isDuad || isComp)
              ? new Cesium.PolylineDashMaterialProperty({ color: color.withAlpha(isComp ? 0.9 : 1.0), dashLength: isComp ? 10 : 22 })
              : dashed
                ? new Cesium.PolylineDashMaterialProperty({ color, dashLength: 16 })
                : new Cesium.PolylineGlowMaterialProperty({ color, glowPower: 0.2, taperPower: 1.0 }),
        };
        // The 1,728 compendium rungs only draw at street-level zoom (there are
        // far too many to show at world view); the 144 duad lines stay visible
        // around the whole globe as the always-on grid.
        if (isComp) polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0.0, 700_000);
        const entity = this.viewer.entities.add({ id: `acg-${line.id}-${si}`, polyline });
        this.entities.push(entity);
      });

      // A single text label per line (planet + angle) — NOT colour-only, so it
      // stays identifiable for colour-vision-limited users. Placed near a
      // readable mid-northern latitude on the line.
      if (showLabels && line.points.length && !isDuad && !isComp && !isGrid) {
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

      // Duad-Grid labels: a text tag near the birth longitude so the rungs read
      // like a ruler. Planet rungs are bold/coloured; faint ladder rungs are
      // small/dim. They share the line's zoom visibility.
      if ((isDuad || isGrid) && line.label && line.labelLon != null && line.points.length) {
        // 144 duad labels would swamp the world view — only show them once the
        // camera is zoomed to a region. The gold Ascendant rung (isDuad) is always labelled.
        const ddc = isGrid ? new Cesium.DistanceDisplayCondition(0.0, 3_000_000) : undefined;
        this.entities.push(this.viewer.entities.add({
          id: `acg-glabel-${line.id}`,
          position: Cesium.Cartesian3.fromDegrees(line.labelLon, line.points[0].lat),
          label: {
            text: line.label,
            font: isGrid ? '500 10px sans-serif' : '600 12px sans-serif',
            fillColor: isGrid ? color.withAlpha(0.7) : color,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 3.0e7, 0.4),
            ...(ddc ? { distanceDisplayCondition: ddc } : {}),
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
