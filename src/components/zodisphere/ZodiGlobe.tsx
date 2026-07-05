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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { type AreaStat, bandMidpoint } from '@/lib/zodisphereService';
import { AMBIENT_CITIES } from './ambientCities';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

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

interface ZodiGlobeProps {
  areas: AreaStat[];
  onAreaClick?: (area: AreaStat) => void;
  autoRotate?: boolean;
  focus?: { lat: number; lng: number } | null;
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

export function ZodiGlobe({ areas, onAreaClick, autoRotate = true, focus }: ZodiGlobeProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState<any[]>([]);
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
    const ambient = AMBIENT_CITIES.map((c) => ({
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
    return [sun, ...ambient, ...community];
  }, [areas, subsolar]);

  const rings = useMemo(
    () => points.filter((p: any) => p.member_band === '500-999' || p.member_band === '1000+')
      .map((p: any) => ({ lat: p.lat, lng: p.lng })),
    [points]
  );

  // Live day/night terminator line
  const terminator = useMemo(() => [{ coords: terminatorCoords(subsolar) }], [subsolar]);

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
          // points: sun + cities + community
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude="_alt"
          pointRadius="_radius"
          pointColor="_color"
          pointResolution={12}
          onPointClick={handleClick}
          pointLabel={(d: any) =>
            d.kind === 'community'
              ? `<div style="font-family:inherit;background:rgba(10,14,26,.94);border:1px solid rgba(139,123,255,.4);border-radius:8px;padding:6px 10px;color:#f4f1ff;font-size:12px;">
                   <div style="font-weight:600;">${d.display_name}</div>
                   <div style="color:#ffd97a;">${d.member_band ?? '<10'} members</div>
                 </div>`
              : d.kind === 'sun'
                ? `<div style="font-family:inherit;color:#ffe9a8;font-size:12px;">☉ ${d.name}</div>`
                : `<div style="font-family:inherit;color:#cfc8ff;font-size:11px;">${d.name}</div>`
          }
          // live day/night terminator
          pathsData={terminator}
          pathPoints={(d: any) => d.coords}
          pathPointLat={(p: any) => p[0]}
          pathPointLng={(p: any) => p[1]}
          pathColor={() => ['rgba(255,180,90,0.0)', 'rgba(255,190,110,0.55)', 'rgba(255,180,90,0.0)']}
          pathStroke={1.4}
          pathTransitionDuration={0}
          // cosmic pulses on the busiest places
          ringsData={rings}
          ringColor={() => (t: number) => `rgba(255,217,122,${Math.max(0, 0.5 * (1 - t))})`}
          ringMaxRadius={4}
          ringPropagationSpeed={1.3}
          ringRepeatPeriod={2000}
        />
      )}
    </div>
  );
}

export default ZodiGlobe;
