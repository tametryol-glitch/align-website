'use client';

/**
 * ZodiGlobe -- Align's living astrological Earth.
 *
 * Layers (bottom to top):
 *   1. Real country/continent polygons (bundled GeoJSON, no vendor tiles)
 *   2. Live day/night — the globe's light tracks the real subsolar point
 *   3. Ambient major cities (always lit, so Earth never looks empty)
 *   4. Community activity — banded, k>=10 aggregates, brighter on top
 *   5. Cosmic pulse rings on the liveliest places + violet atmosphere
 *
 * PRIVACY: every point is a place, never a person. No map-vendor SDK, no
 * external tiles, no telemetry — the only network call is same-origin
 * GeoJSON. Community counts arrive already banded from the server.
 */

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { type AreaStat, bandMidpoint } from '@/lib/zodisphereService';
import { AMBIENT_CITIES } from './ambientCities';

// Lazy-load react-globe.gl client-side while ACTUALLY forwarding the ref to
// it. next/dynamic() does not forward refs, which silently breaks every
// imperative call (pointOfView, controls/autoRotate, scene lighting) — the
// globe still renders from props but never flies, rotates, or lights. This
// wrapper imports the module in state and passes the ref straight through.
const Globe = forwardRef<any, any>(function GlobeLazy(props, ref) {
  const [Comp, setComp] = useState<any>(null);
  useEffect(() => {
    let alive = true;
    import('react-globe.gl').then((m) => { if (alive) setComp(() => m.default); });
    return () => { alive = false; };
  }, []);
  if (!Comp) return null;
  return <Comp ref={ref} {...props} />;
});

// ── Align cosmic palette ────────────────────────────────────────────
const SPHERE_COLOR = '#0b1030';
const SPHERE_EMISSIVE = '#10163a';   // night side keeps a faint glow
const ATMOSPHERE = '#8b7bff';
const LAND_FILL = 'rgba(120,110,220,0.14)';
const LAND_EDGE = 'rgba(160,150,255,0.55)';
const GOLD_BRIGHT = '#ffd97a';
const GOLD_DIM = '#c4b6ff';
const AMBIENT_CITY = 'rgba(205,215,255,0.9)';
const SUN = '#ffe9a8';
const YOU = '#5eead4'; // bright teal — the signed-in user's own place

const ACG_ORDER = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

// Some planet colors (notably Pluto #991B1B) are too dark to read as label
// text on the dark globe. Lighten only the dark ones toward white; bright
// colors pass through unchanged so lines and labels still match.
function readableLabelColor(hex: string): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return hex;
  let r = parseInt(m[1].slice(0, 2), 16);
  let g = parseInt(m[1].slice(2, 4), 16);
  let b = parseInt(m[1].slice(4, 6), 16);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum < 90) {
    const t = 0.55;
    r = Math.round(r + (255 - r) * t);
    g = Math.round(g + (255 - g) * t);
    b = Math.round(b + (255 - b) * t);
  }
  return `rgb(${r},${g},${b})`;
}

interface ZodiGlobeProps {
  areas: AreaStat[];
  onAreaClick?: (area: AreaStat) => void;
  autoRotate?: boolean;
  focus?: { lat: number; lng: number } | null;
  /** The signed-in user's OWN chosen place — shown back to them as a
   *  personal "you are here" marker regardless of the k-anonymity floor. */
  myPlace?: { lat: number; lng: number; name: string } | null;
  /** The user's natal astrocartography lines (premium). Each line is a
   *  planet × angle (ASC/DSC/MC/IC) drawn across the Earth. */
  acgLines?: { planet: string; lineType: string; color: string; points: { lat: number; lon: number }[] }[];
  /** Midpoint astrocartography lines (dashed, blended color, unlabeled;
   *  identity comes from tapping). */
  midpointLines?: { key: string; color: string; points: { lat: number; lon: number }[] }[];
  /** Fired when the user taps/clicks the globe surface — the midpoint probe. */
  onProbe?: (lat: number, lng: number) => void;
  /** A transient marker at the last probed point. */
  probePoint?: { lat: number; lng: number } | null;
}

// Approximate subsolar point (ignores equation of time — fine for a glow).
function subsolarPoint(d: Date): { lat: number; lng: number } {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const dayOfYear = (d.getTime() - start) / 86_400_000;
  const decl = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
  const utcHours = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
  let lng = -15 * (utcHours - 12);
  lng = ((lng + 540) % 360) - 180;
  return { lat: decl, lng };
}

// The terminator: the great circle 90° from the subsolar point — i.e. the
// live day/night dividing line sweeping across the Earth.
function terminatorCoords(sub: { lat: number; lng: number }): [number, number][] {
  const R = Math.PI / 180;
  const lat0 = sub.lat * R;
  const lng0 = sub.lng * R;
  const d = Math.PI / 2; // 90° from the sun = the horizon circle
  const pts: [number, number][] = [];
  for (let b = 0; b <= 360; b += 2) {
    const th = b * R;
    const lat = Math.asin(Math.sin(lat0) * Math.cos(d) + Math.cos(lat0) * Math.sin(d) * Math.cos(th));
    const lng = lng0 + Math.atan2(
      Math.sin(th) * Math.sin(d) * Math.cos(lat0),
      Math.cos(d) - Math.sin(lat0) * Math.sin(lat)
    );
    pts.push([lat / R, ((lng / R + 540) % 360) - 180]);
  }
  return pts;
}

export function ZodiGlobe({ areas, onAreaClick, autoRotate = true, focus, myPlace, acgLines = [], midpointLines = [], onProbe, probePoint }: ZodiGlobeProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<Array<[string, number, number]>>([]);
  const [subsolar, setSubsolar] = useState(() => subsolarPoint(new Date()));

  // ── Responsive sizing ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Load bundled country polygons (same-origin, no CDN) ──
  useEffect(() => {
    let alive = true;
    fetch('/geo/world-countries-110m.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((geo) => { if (alive && geo?.features) setCountries(geo.features); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // ── Load bundled cities (9k+ real cities, same-origin) so the globe shows
  //    real places everywhere — US and worldwide — for Google-Earth-style zoom.
  useEffect(() => {
    let alive = true;
    fetch('/geo/cities.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && Array.isArray(data) && data.length) setCities(data);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // ── Advance the Sun every minute ──
  useEffect(() => {
    const id = setInterval(() => setSubsolar(subsolarPoint(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Sphere material: dark cosmic body, faint night glow ──
  const globeMaterial = useMemo(
    () => new THREE.MeshPhongMaterial({
      color: SPHERE_COLOR, emissive: SPHERE_EMISSIVE, emissiveIntensity: 0.5, shininess: 8,
    }),
    []
  );

  // ── Points: Sun + ambient cities + community activity ──
  const points = useMemo(() => {
    const sun = {
      kind: 'sun', lat: subsolar.lat, lng: subsolar.lng, name: 'Sun overhead now',
      _alt: 0.02, _radius: 1.15, _color: SUN,
    };
    // Prefer the bundled 9k-city dataset; fall back to the hand-picked metros
    // until it loads (or if the fetch failed). Many dense dots → keep them
    // small and dim so they read as a "city field" you can zoom into.
    const ambient = cities.length
      ? cities.map(([name, lat, lng]) => ({
          kind: 'ambient', lat, lng, name,
          _alt: 0.004, _radius: 0.13, _color: AMBIENT_CITY,
        }))
      : AMBIENT_CITIES.map((c) => ({
          kind: 'ambient', lat: c.lat, lng: c.lng, name: c.name,
          _alt: 0.01, _radius: 0.32, _color: AMBIENT_CITY,
        }));
    const community = areas.map((a) => {
      const mid = bandMidpoint(a.member_band);
      const t = mid > 0 ? Math.min(1, Math.log10(mid) / 3.1) : 0;
      return {
        kind: 'community', ...a, lat: a.center_lat, lng: a.center_lng,
        _alt: 0.02 + t * 0.12, _radius: 0.4 + t * 0.6,
        _color: t > 0.55 ? GOLD_BRIGHT : GOLD_DIM,
      };
    });
    const you = myPlace
      ? [{
          kind: 'you', lat: myPlace.lat, lng: myPlace.lng, name: `You · ${myPlace.name}`,
          _alt: 0.06, _radius: 1.0, _color: YOU,
        }]
      : [];
    return [sun, ...ambient, ...community, ...you];
  }, [areas, subsolar, myPlace, cities]);

  const rings = useMemo(() => {
    const busy = points
      .filter((p: any) => p.member_band === '500-999' || p.member_band === '1000+')
      .map((p: any) => ({ lat: p.lat, lng: p.lng, _you: false }));
    if (myPlace) busy.push({ lat: myPlace.lat, lng: myPlace.lng, _you: true, _probe: false } as any);
    if (probePoint) busy.push({ lat: probePoint.lat, lng: probePoint.lng, _you: false, _probe: true } as any);
    return busy;
  }, [points, myPlace, probePoint]);

  // Paths layer: the live day/night terminator + ACG + midpoint lines.
  // Each line is split into segments at any ±180° longitude seam so globe.gl
  // never draws a stray connector straight across the globe (the "break").
  const paths = useMemo(() => {
    const splitSeam = (coords: [number, number][]): [number, number][][] => {
      const segs: [number, number][][] = [];
      let cur: [number, number][] = [];
      for (let i = 0; i < coords.length; i++) {
        if (i > 0 && Math.abs(coords[i][1] - coords[i - 1][1]) > 180) {
          if (cur.length > 1) segs.push(cur);
          cur = [];
        }
        cur.push(coords[i]);
      }
      if (cur.length > 1) segs.push(cur);
      return segs;
    };
    const out: Array<{ kind: string; coords: [number, number][]; color: string; label: string }> = [];
    for (const seg of splitSeam(terminatorCoords(subsolar))) {
      out.push({ kind: 'terminator', coords: seg, color: '', label: '' });
    }
    for (const l of acgLines) {
      const label = `${l.planet} ${l.lineType}`;
      for (const seg of splitSeam(l.points.map((p) => [p.lat, p.lon] as [number, number]))) {
        out.push({ kind: 'acg', coords: seg, color: l.color, label });
      }
    }
    for (const l of midpointLines) {
      for (const seg of splitSeam(l.points.map((p) => [p.lat, p.lon] as [number, number]))) {
        out.push({ kind: 'midpoint', coords: seg, color: l.color, label: '' });
      }
    }
    return out;
  }, [subsolar, acgLines, midpointLines]);

  // One glyph label per ACG line (e.g. "☉ MC"), placed at a latitude that
  // varies by planet so labels on nearby lines don't stack on top of each other.
  const acgLabels = useMemo(
    () => acgLines.map((l) => {
      const idx = Math.max(0, ACG_ORDER.indexOf(l.planet));
      const targetLat = 58 - idx * 9;
      let best = l.points[0] ?? { lat: 0, lon: 0 };
      let bestDist = Infinity;
      for (const p of l.points) {
        const d = Math.abs(p.lat - targetLat);
        if (d < bestDist) { bestDist = d; best = p; }
      }
      // Planet NAME + angle (not the Unicode glyph): the globe's 3D text
      // layer's canvas font renders astro glyphs as tofu/"?", and names are
      // clearer to non-astrologers anyway.
      return { lat: best.lat, lng: best.lon, text: `${l.planet} ${l.lineType}`, color: readableLabelColor(l.color) };
    }),
    [acgLines]
  );

  // ── Camera + day/night lighting (reposition the globe's own light to
  //    the Sun so the lit hemisphere tracks real time) ──
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls?.();
    if (controls) {
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.35;
      controls.enableDamping = true;
      // Let the user zoom right down to city level (globe radius = 100).
      // Google-Earth feel: zoom toward the cursor, allow deep zoom near the
      // surface, and slow the rotate/damping as you get close so it settles.
      controls.enableZoom = true;
      controls.zoomToCursor = true;
      controls.minDistance = 101.5;
      controls.maxDistance = 500;
      controls.zoomSpeed = 1.1;
      controls.rotateSpeed = 0.9;
      controls.dampingFactor = 0.12;
    }
    const scene = g.scene?.();
    if (scene && typeof g.getCoords === 'function') {
      const p = g.getCoords(subsolar.lat, subsolar.lng, 3);
      scene.traverse((o: any) => {
        if (o.isDirectionalLight) { o.position.set(p.x, p.y, p.z); o.intensity = 1.5; }
        if (o.isAmbientLight) o.intensity = 0.5;
      });
    }
  }, [autoRotate, size.width, subsolar, countries.length]);

  useEffect(() => {
    if (focus && globeRef.current) {
      globeRef.current.pointOfView({ lat: focus.lat, lng: focus.lng, altitude: 1.6 }, 1200);
    }
  }, [focus]);

  // Fly to the user's own place once, when it first becomes known, so they
  // immediately see themselves on the map after opting in.
  const flewToMe = useRef(false);
  useEffect(() => {
    const g = globeRef.current;
    if (myPlace && g && !flewToMe.current) {
      flewToMe.current = true;
      g.pointOfView({ lat: myPlace.lat, lng: myPlace.lng, altitude: 1.9 }, 1400);
      // Pause the spin so the user clearly sees their own marker, then
      // resume the living rotation after a few seconds.
      const controls = g.controls?.();
      if (controls) {
        controls.autoRotate = false;
        setTimeout(() => {
          const c = globeRef.current?.controls?.();
          if (c) c.autoRotate = autoRotate;
        }, 6000);
      }
    }
  }, [myPlace, size.width, autoRotate]);

  const handleClick = useCallback((obj: any) => {
    if (obj?.kind === 'community') onAreaClick?.(obj as AreaStat);
  }, [onAreaClick]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[320px]">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          showAtmosphere
          atmosphereColor={ATMOSPHERE}
          atmosphereAltitude={0.18}
          showGraticules
          // continents
          polygonsData={countries}
          polygonCapColor={() => LAND_FILL}
          polygonSideColor={() => 'rgba(90,80,180,0.10)'}
          polygonStrokeColor={() => LAND_EDGE}
          polygonAltitude={0.006}
          polygonCapCurvatureResolution={3}
          polygonLabel={(d: any) => `<div style="font-family:inherit;color:#cfc8ff;font-size:11px;">${d?.properties?.NAME ?? ''}</div>`}
          onPolygonClick={(_poly: any, _ev: any, coords: any) => { if (coords) onProbe?.(coords.lat, coords.lng); }}
          // points: sun + cities + community
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude="_alt"
          pointRadius="_radius"
          pointColor="_color"
          pointResolution={6}
          onPointClick={handleClick}
          pointLabel={(d: any) =>
            d.kind === 'community'
              ? `<div style="font-family:inherit;background:rgba(10,14,26,.94);border:1px solid rgba(139,123,255,.4);border-radius:8px;padding:6px 10px;color:#f4f1ff;font-size:12px;">
                   <div style="font-weight:600;">${d.display_name}</div>
                   <div style="color:#ffd97a;">${d.member_band ?? '<10'} members</div>
                 </div>`
              : d.kind === 'you'
                ? `<div style="font-family:inherit;background:rgba(10,14,26,.94);border:1px solid rgba(94,234,212,.6);border-radius:8px;padding:6px 10px;color:#5eead4;font-size:12px;font-weight:600;">📍 ${d.name}</div>`
                : d.kind === 'sun'
                  ? `<div style="font-family:inherit;color:#ffe9a8;font-size:12px;">☉ ${d.name}</div>`
                  : `<div style="font-family:inherit;color:#cfc8ff;font-size:11px;">${d.name}</div>`
          }
          // day/night terminator + astrocartography lines
          pathsData={paths}
          pathPoints={(d: any) => d.coords}
          pathPointLat={(p: any) => p[0]}
          pathPointLng={(p: any) => p[1]}
          pathColor={(d: any) =>
            d.kind === 'acg' || d.kind === 'midpoint'
              ? d.color
              : ['rgba(255,180,90,0.0)', 'rgba(255,190,110,0.55)', 'rgba(255,180,90,0.0)']
          }
          pathResolution={1}
          pathStroke={(d: any) => (d.kind === 'midpoint' ? 1.2 : d.kind === 'acg' ? 1.5 : 1.4)}
          pathDashLength={(d: any) => (d.kind === 'midpoint' ? 0.4 : 0)}
          pathDashGap={(d: any) => (d.kind === 'midpoint' ? 0.25 : 0)}
          pathDashAnimateTime={0}
          pathLabel={(d: any) =>
            d.kind === 'acg'
              ? `<div style="font-family:inherit;background:rgba(10,14,26,.94);border:1px solid ${d.color};border-radius:6px;padding:3px 7px;color:${d.color};font-size:11px;font-weight:600;">${d.label}</div>`
              : ''
          }
          pathTransitionDuration={0}
          onGlobeClick={(coords: any) => { if (coords) onProbe?.(coords.lat, coords.lng); }}
          // astrocartography line glyph labels (☉ MC, ♂ ASC, …)
          labelsData={acgLabels}
          labelLat={(d: any) => d.lat}
          labelLng={(d: any) => d.lng}
          labelText={(d: any) => d.text}
          labelColor={(d: any) => d.color}
          labelSize={1.7}
          labelDotRadius={0.28}
          labelResolution={2}
          labelIncludeDot
          // cosmic pulses on the busiest places
          ringsData={rings}
          ringColor={(d: any) => (t: number) =>
            d?._probe
              ? `rgba(255,255,255,${Math.max(0, 0.7 * (1 - t))})`
              : d?._you
                ? `rgba(94,234,212,${Math.max(0, 0.6 * (1 - t))})`
                : `rgba(255,217,122,${Math.max(0, 0.5 * (1 - t))})`
          }
          ringMaxRadius={(d: any) => (d?._probe ? 3 : d?._you ? 5.5 : 4)}
          ringPropagationSpeed={(d: any) => (d?._probe ? 2 : 1.3)}
          ringRepeatPeriod={(d: any) => (d?._probe ? 900 : 1600)}
        />
      )}
    </div>
  );
}

export default ZodiGlobe;
