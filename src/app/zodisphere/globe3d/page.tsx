'use client';

/**
 * /zodisphere/globe3d — ISOLATED Phase-2 prototype route for the Cesium 3D
 * Earth. This does NOT replace the live /zodisphere globe. It is gated by the
 * zodisphere_3d feature flag (default off, dev-allowlisted) so it is invisible
 * in production until the 3D experience passes its tests.
 *
 * Guarantees: no white screen. If the flag is off, WebGL is unavailable, or the
 * globe errors, the user sees a calm message with a route back to the classic
 * globe — never a blank canvas or an endless spinner.
 */

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { isZodisphere3dEnabled } from '@/config/featureFlags';
import ZodisphereErrorBoundary from '@/components/zodisphere/three-d/ZodisphereErrorBoundary';
import ZodisphereFallbackView from '@/components/zodisphere/three-d/ZodisphereFallbackView';
import type { ZodisphereGlobeController } from '@/components/zodisphere/three-d/ZodisphereGlobeCesium';
import {
  getBodyAcgLines, getDuadGrid, bandAtLatitude, getMidpointLines3D, probeMidpoints, probeAcgLines, angularDistanceDeg, getParans3D,
  getNatalContext, interpretLocation,
  ACG_PLANETS, ACG_POINTS, ACG_ASTEROIDS,
  type AcgLine3D, type AcgAngle, type MidpointPair, type MidpointLine, type ProbeHit, type AcgProbeHit, type ParanLine, type DuadGrid, type NatalContext,
} from '@/components/zodisphere/three-d/AstrocartographyDataAdapter';
import { paransNearLatitude } from '@/components/zodisphere/three-d/parans';
import { natalLineMeaning } from '@/components/zodisphere/three-d/natalLineMeaning';
import { computeLocationReport, countryAt, type LocationReport } from '@/components/zodisphere/three-d/locationInspector';
import { Plus, Minus, Home, Tag, X, Search, GitMerge, Orbit, Type, Frame, Bookmark, Waves } from 'lucide-react';

type ChartMode = 'natal' | 'grid' | 'draconic';
const PLANET_ORDER = ACG_PLANETS;
const ALL_ANGLES: AcgAngle[] = ['MC', 'IC', 'ASC', 'DSC'];
const ALL_BODIES = [...ACG_PLANETS, ...ACG_POINTS, ...ACG_ASTEROIDS];
const MAX_PAIRS = 8;

// Code-split Cesium into its own client chunk — the rest of Align never pays
// its bundle cost, and it can only load in the browser.
const ZodisphereGlobeCesium = dynamic(
  () => import('@/components/zodisphere/three-d/ZodisphereGlobeCesium'),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/60 text-sm animate-pulse">Loading the 3D Earth…</div>
      </div>
    ),
  },
);

function ordinalLabel(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function Zodisphere3dPrototypePage() {
  const profile = useAuthStore((s) => s.profile);
  const authUser = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [mounted, setMounted] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [controller, setController] = useState<ZodisphereGlobeController | null>(null);
  const [allLines, setAllLines] = useState<AcgLine3D[]>([]);
  const [note, setNote] = useState('');
  // Bodies whose lines are fetched + shown (planets by default; add points/asteroids).
  const [bodies, setBodies] = useState<string[]>(ACG_PLANETS);
  const [chartMode, setChartMode] = useState<ChartMode>('natal');
  const [grid, setGrid] = useState<DuadGrid | null>(null);
  const [natalCtx, setNatalCtx] = useState<NatalContext | null>(null);
  const [natalRefLines, setNatalRefLines] = useState<AcgLine3D[]>([]);
  const [modesOpen, setModesOpen] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());       // visual toggle
  const [hiddenAngles, setHiddenAngles] = useState<Set<AcgAngle>>(new Set());
  const [showLabels, setShowLabels] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [flewToHome, setFlewToHome] = useState(false);
  const [search, setSearch] = useState('');
  const [showPlaceNames, setShowPlaceNames] = useState(true);
  const [showBorders, setShowBorders] = useState(true);
  const [showCorridors, setShowCorridors] = useState(false);
  const [quality, setQuality] = useState<'high' | 'balanced' | 'performance'>(
    typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') ? 'performance' : 'high',
  );

  const [authSettled, setAuthSettled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebglOk(hasWebGL());
  }, []);

  // Settle auth as soon as it resolves, OR after a short timeout — AuthProvider
  // can leave isLoading stuck true if getSession() hangs/rejects on mobile, so
  // we never block the globe on it indefinitely.
  useEffect(() => {
    if (!authLoading) { setAuthSettled(true); return; }
    const t = setTimeout(() => setAuthSettled(true), 2500);
    return () => clearTimeout(t);
  }, [authLoading]);

  // Gate on the reliable Supabase auth email (profile.email can be null on
  // mobile even when logged in), and fall back to profile.email as a backup.
  const enabled = isZodisphere3dEnabled(authUser?.email || profile?.email);
  const retry = useCallback(() => { setError(null); setRetryKey((k) => k + 1); }, []);

  // Fetch ACG lines for the active bodies (planets + any added points/asteroids).
  useEffect(() => {
    if (!enabled || !profile) return;
    let alive = true;
    (async () => {
      if (!profile.birth_date || profile.latitude == null) {
        if (alive) setNote('Add your birth date, time and place in your profile to see your astro lines.');
        return;
      }
      // Vertical planet lines are the same in every mode; in Duad Grid mode the
      // horizontal 144-duad / 1,728-compendium ladder is added on top (below).
      const { lines, unavailable } = await getBodyAcgLines(profile, bodies, chartMode === 'draconic' ? 'draconic' : 'natal');
      if (!alive) return;
      setAllLines(lines);
      const shown = new Set(lines.map((l) => l.planet)).size;
      const layerName = chartMode === 'draconic' ? ' · Draconic' : chartMode === 'grid' ? ' · Duad Grid' : '';
      setNote(
        `${lines.length} lines · ${shown} placements × ASC/DSC/MC/IC${layerName}.` +
        (unavailable.length ? ` Unavailable: ${unavailable.join(', ')}.` : ''),
      );
    })();
    return () => { alive = false; };
  }, [enabled, profile, bodies, chartMode]);

  // Duad Grid: the 144-duad / 1,728-compendium even ladder, anchored to the
  // rising point and wrapping the globe pole-to-pole.
  useEffect(() => {
    if (chartMode !== 'grid' || !enabled || !profile?.birth_date || profile?.latitude == null) {
      setGrid(null);
      return;
    }
    let alive = true;
    getDuadGrid(profile).then((g) => { if (alive) setGrid(g); }).catch(() => {});
    return () => { alive = false; };
  }, [chartMode, enabled, profile]);

  // Compute parans once (reuses Align's production paran algorithm).
  useEffect(() => {
    if (!enabled || !profile?.birth_date || profile?.latitude == null) return;
    let alive = true;
    getParans3D(profile).then((p) => { if (alive) setParans(p); }).catch(() => {});
    return () => { alive = false; };
  }, [enabled, profile]);

  // Build the synthesis engine's natal context once (rulers, houses, aspects).
  useEffect(() => {
    if (!enabled || !profile?.birth_date || profile?.latitude == null) { setNatalCtx(null); return; }
    let alive = true;
    getNatalContext(profile).then((c) => { if (alive) setNatalCtx(c); }).catch(() => {});
    return () => { alive = false; };
  }, [enabled, profile]);

  // In Draconic mode, keep the NATAL lines on hand (reference only, not drawn) so
  // we can flag karmic hotspots where a natal line meets its draconic twin.
  useEffect(() => {
    if (chartMode !== 'draconic' || !enabled || !profile?.birth_date || profile?.latitude == null) { setNatalRefLines([]); return; }
    let alive = true;
    getBodyAcgLines(profile, bodies, 'natal').then((r) => { if (alive) setNatalRefLines(r.lines); }).catch(() => {});
    return () => { alive = false; };
  }, [chartMode, enabled, profile, bodies]);

  // Visible subset after the body/angle filters.
  const visibleLines = useMemo(
    () => allLines.filter((l) => !hidden.has(l.planet) && !hiddenAngles.has(l.angle)),
    [allLines, hidden, hiddenAngles],
  );

  // In Duad Grid mode, draw the horizontal ladder (compendiums first, then the
  // duad lines and gold anchor) with the vertical planet lines on top.
  const linesForGlobe = useMemo(() => {
    if (chartMode === 'grid' && grid) {
      return [...grid.matrixLines, ...grid.compendiumLines, ...grid.duadLines, ...visibleLines];
    }
    return visibleLines;
  }, [chartMode, grid, visibleLines]);

  // Active bodies present in the result, each with its engine colour.
  const bodyLegend = useMemo(() => {
    const byBody = new Map<string, string>();
    for (const l of allLines) if (!byBody.has(l.planet)) byBody.set(l.planet, l.color);
    // planets first (canonical order), then anything else (points/asteroids).
    const ordered = [
      ...PLANET_ORDER.filter((p) => byBody.has(p)),
      ...Array.from(byBody.keys()).filter((b) => !PLANET_ORDER.includes(b)).sort(),
    ];
    return ordered.map((b) => ({ body: b, color: byBody.get(b)! }));
  }, [allLines]);

  // Bodies the user can ADD (points + asteroids not already active), filtered by search.
  const addableBodies = useMemo(() => {
    const active = new Set(bodies);
    const pool = [...ACG_POINTS, ...ACG_ASTEROIDS].filter((b) => !active.has(b));
    const q = search.trim().toLowerCase();
    const list = q ? pool.filter((b) => b.toLowerCase().includes(q)) : pool;
    return list.slice(0, 40);
  }, [bodies, search]);

  // Once lines + camera are ready, fly to the birthplace so the user sees the
  // lines around home (falls back to a full-globe framing if no birthplace).
  useEffect(() => {
    if (flewToHome || !controller || allLines.length === 0) return;
    if (profile?.latitude != null && profile?.longitude != null) {
      controller.flyTo(profile.latitude, profile.longitude, 9_000_000);
      setFlewToHome(true);
    }
  }, [controller, allLines, profile, flewToHome]);

  const toggleBody = (b: string) => setHidden((s) => {
    const n = new Set(s); n.has(b) ? n.delete(b) : n.add(b); return n;
  });
  const removeBody = (b: string) => {
    setBodies((prev) => prev.filter((x) => x !== b));
    setHidden((s) => { const n = new Set(s); n.delete(b); return n; });
  };
  const addBody = (b: string) => {
    setBodies((prev) => (prev.includes(b) ? prev : [...prev, b]));
    setSearch('');
  };
  const toggleAngle = (a: AcgAngle) => setHiddenAngles((s) => {
    const n = new Set(s); n.has(a) ? n.delete(a) : n.add(a); return n;
  });

  // ── Midpoints mode ──
  const [mode, setMode] = useState<'lines' | 'midpoints'>('lines');
  const [pairs, setPairs] = useState<MidpointPair[]>([]);
  const [midLines, setMidLines] = useState<AcgLine3D[]>([]);
  const [midRaw, setMidRaw] = useState<MidpointLine[]>([]);
  const [pickA, setPickA] = useState('');
  const [pickB, setPickB] = useState('');
  const [picking, setPicking] = useState<'A' | 'B' | null>(null);
  const [pickSearch, setPickSearch] = useState('');
  const [probeHits, setProbeHits] = useState<ProbeHit[]>([]);
  const [probeOpen, setProbeOpen] = useState(false);
  // Natal line tap-to-read
  const [lineHits, setLineHits] = useState<AcgProbeHit[]>([]);
  const [lineDetailOpen, setLineDetailOpen] = useState(false);
  const [tapPoint, setTapPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [cityData, setCityData] = useState<Array<[string, number, number]>>([]);
  const [countryFeatures, setCountryFeatures] = useState<any[]>([]);
  const [parans, setParans] = useState<ParanLine[]>([]);
  const [locReport, setLocReport] = useState<LocationReport | null>(null);
  const [savedLocations, setSavedLocations] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [savedOpen, setSavedOpen] = useState(false);

  // The tapped planet line (nearest hit that isn't a horizontal grid rung).
  const tappedLine = useMemo(
    () => lineHits.find((h) => {
      const s = h.line.style;
      return s !== 'duad' && s !== 'compendium' && s !== 'gridline' && s !== 'matrix';
    }) || null,
    [lineHits],
  );
  // Grid band (used for the grid-mode band-only fallback readout).
  const gridBand = useMemo(
    () => (chartMode === 'grid' && grid && tapPoint) ? bandAtLatitude(tapPoint.lat, grid) : null,
    [chartMode, grid, tapPoint],
  );
  // Karmic hotspot: in Draconic mode, does the SAME planet's NATAL line also run
  // near this spot? If so, the past-life theme is active in this life.
  const karmicHotspot = useMemo(() => {
    if (chartMode !== 'draconic' || !tappedLine || !tapPoint || !natalRefLines.length) return false;
    const near = probeAcgLines(tapPoint.lat, tapPoint.lng, natalRefLines, 2.5);
    return near.some((h) => h.line.planet === tappedLine.line.planet);
  }, [chartMode, tappedLine, tapPoint, natalRefLines]);
  // The full location reading — Natal & Grid (present) or Draconic (past-life).
  const locInterp = useMemo(() => {
    if (!tappedLine || !natalCtx || !tapPoint) return null;
    return interpretLocation(natalCtx, tappedLine.line.planet, {
      band: (chartMode === 'grid' && gridBand)
        ? { duadSign: gridBand.duadSign, compendiumSign: gridBand.compendiumSign, matrixSign: gridBand.matrixSign }
        : undefined,
      angle: tappedLine.line.angle,
      mode: chartMode === 'draconic' ? 'draconic' : 'present',
      karmicHotspot,
    });
  }, [tappedLine, natalCtx, tapPoint, chartMode, gridBand, karmicHotspot]);

  // Load country polygons (offline reverse-geocode) + saved locations.
  useEffect(() => {
    let alive = true;
    fetch('/geo/world-countries-110m.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((geo) => { if (alive && geo?.features) setCountryFeatures(geo.features); })
      .catch(() => {});
    try {
      const raw = localStorage.getItem('zodi3d_saved_locations');
      if (raw) setSavedLocations(JSON.parse(raw));
    } catch { /* ignore */ }
    return () => { alive = false; };
  }, []);

  const saveLocation = (name: string, lat: number, lng: number) => {
    setSavedLocations((prev) => {
      const next = [{ name, lat, lng }, ...prev.filter((p) => !(p.lat === lat && p.lng === lng))].slice(0, 30);
      try { localStorage.setItem('zodi3d_saved_locations', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  const removeSaved = (i: number) => setSavedLocations((prev) => {
    const next = prev.filter((_, idx) => idx !== i);
    try { localStorage.setItem('zodi3d_saved_locations', JSON.stringify(next)); } catch { /* ignore */ }
    return next;
  });

  // Load the city list once for "nearest cities" in the line detail panel.
  useEffect(() => {
    let alive = true;
    fetch('/geo/cities.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && Array.isArray(d)) setCityData(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const nearestCities = useCallback((lat: number, lng: number, n = 3): string[] => {
    if (!cityData.length) return [];
    return cityData
      .map(([name, clat, clng]) => ({ name, d: angularDistanceDeg(lat, lng, clat, clng) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, n)
      .map((c) => c.name);
  }, [cityData]);

  // Birth-time precision → line-position confidence. GMST shifts lines 15°/hour
  // (0.25°/min), so a minute of birth-time uncertainty moves every line
  // east–west by ~0.25° of longitude. km/min depends on latitude.
  const birthConfidence = useMemo(() => {
    const t = profile?.birth_time ? String(profile.birth_time) : '';
    if (!t) return { level: 'missing' as const, time: '' };
    const mm = Number(t.split(':')[1]);
    // Heuristic: a whole-5-minute value is often an estimate/rounding.
    const level = Number.isFinite(mm) && mm % 5 === 0 ? ('rounded' as const) : ('precise' as const);
    return { level, time: t.slice(0, 5) };
  }, [profile]);

  /** Longitude km shifted per minute of birth-time uncertainty at a latitude. */
  const kmPerMinuteAt = (lat: number) => 0.25 * 111.32 * Math.cos((lat * Math.PI) / 180);

  // Build midpoint lines whenever the active pairs change.
  useEffect(() => {
    if (!enabled || !profile || mode !== 'midpoints') return;
    let alive = true;
    (async () => {
      if (pairs.length === 0) { if (alive) { setMidLines([]); setMidRaw([]); } return; }
      const { render, mid } = await getMidpointLines3D(profile, pairs);
      if (!alive) return;
      setMidLines(render);
      setMidRaw(mid);
    })();
    return () => { alive = false; };
  }, [enabled, profile, mode, pairs]);

  // Open the Location Inspector at a point (used by taps and by search).
  const inspectAt = useCallback((lat: number, lng: number) => {
    setLineHits(probeAcgLines(lat, lng, visibleLines));
    setLocReport(computeLocationReport(lat, lng, visibleLines));
    setTapPoint({ lat, lng });
    setLineDetailOpen(true);
  }, [visibleLines]);

  // Tap-to-read: midpoints mode → nearby midpoint lines; lines mode → inspector.
  const handleTap = useCallback((lat: number, lng: number) => {
    if (mode === 'midpoints') {
      const hits = probeMidpoints(lat, lng, midRaw);
      setProbeHits(hits);
      setProbeOpen(hits.length > 0);
      return;
    }
    inspectAt(lat, lng);
  }, [mode, midRaw, inspectAt]);

  // ── Place search (offline: bundled cities + countries; no geocoding vendor) ──
  const [geoQuery, setGeoQuery] = useState('');
  const [geoResults, setGeoResults] = useState<Array<{ name: string; sub: string; lat: number; lng: number }>>([]);

  useEffect(() => {
    const q = geoQuery.trim().toLowerCase();
    if (q.length < 2) { setGeoResults([]); return; }
    const t = setTimeout(() => {  // debounce — don't recompute on every keystroke
      const cityHits = cityData
        .filter(([n]) => n.toLowerCase().includes(q))
        .sort((a, b) => (a[0].toLowerCase().startsWith(q) ? 0 : 1) - (b[0].toLowerCase().startsWith(q) ? 0 : 1))
        .slice(0, 8)
        .map(([name, lat, lng]) => ({ name, sub: countryAt(lat, lng, countryFeatures) || 'City', lat, lng }));
      // Country matches (rough centroid of the largest ring).
      const countryHits = countryFeatures
        .filter((f) => (f.properties?.NAME || f.properties?.name || '').toLowerCase().includes(q))
        .slice(0, 4)
        .map((f) => {
          const g = f.geometry;
          const polys = g?.type === 'MultiPolygon' ? g.coordinates : g?.type === 'Polygon' ? [g.coordinates] : [];
          const ring = polys.map((p: any) => p[0]).sort((a: any, b: any) => b.length - a.length)[0] || [];
          const c = ring.reduce((acc: number[], [lng, lat]: number[]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
          const n = ring.length || 1;
          return { name: f.properties?.NAME || f.properties?.name, sub: 'Country', lat: c[1] / n, lng: c[0] / n };
        })
        .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
      setGeoResults([...countryHits, ...cityHits].slice(0, 10));
    }, 220);
    return () => clearTimeout(t);
  }, [geoQuery, cityData, countryFeatures]);

  const selectPlace = (r: { name: string; lat: number; lng: number }) => {
    setGeoQuery(''); setGeoResults([]);
    setMode('lines');
    controller?.flyTo(r.lat, r.lng, 1_200_000);
    inspectAt(r.lat, r.lng);
  };

  const pickList = useMemo(() => {
    const q = pickSearch.trim().toLowerCase();
    const pool = q ? ALL_BODIES.filter((b) => b.toLowerCase().includes(q)) : ALL_BODIES;
    return pool.slice(0, 40);
  }, [pickSearch]);

  const addPair = () => {
    if (!pickA || !pickB || pickA === pickB) return;
    setPairs((prev) => {
      if (prev.length >= MAX_PAIRS) return prev;
      if (prev.some((p) => (p.a === pickA && p.b === pickB) || (p.a === pickB && p.b === pickA))) return prev;
      return [...prev, { a: pickA, b: pickB }];
    });
    setPickA(''); setPickB(''); setPicking(null); setPickSearch('');
  };
  const removePair = (i: number) => setPairs((prev) => prev.filter((_, idx) => idx !== i));

  // Apply the place-names + borders toggles whenever they change / globe ready.
  useEffect(() => {
    controller?.setPlaceLabels(showPlaceNames);
  }, [controller, showPlaceNames]);
  useEffect(() => {
    controller?.setBorders(showBorders);
  }, [controller, showBorders]);
  useEffect(() => {
    controller?.setQuality(quality);
  }, [controller, quality]);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, #131a38 0%, #0a0e1a 55%, #06080f 100%)' }}
    >
      {/* Minimal header — the live page's full chrome comes in a later phase. */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold text-white leading-tight">The Zodisphere · 3D</h1>
          <p className="text-[11px] text-white/50">Prototype — Cesium Earth (isolated preview)</p>
        </div>
        <Link
          href="/zodisphere"
          className="px-3 py-2 rounded-xl text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shrink-0"
        >
          Classic
        </Link>
      </header>

      {/* Lines / Midpoints mode toggle — floating + always visible (was cramped
          off-screen in the header on phones). */}
      {mounted && enabled && webglOk && !error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center rounded-full border border-white/15 bg-black/60 backdrop-blur overflow-hidden shadow-lg">
          <button
            onClick={() => setMode('lines')}
            className={`flex items-center gap-1.5 px-4 py-2 text-[13px] ${mode === 'lines' ? 'bg-white/20 text-white' : 'text-white/60'}`}
          >
            <Orbit className="w-4 h-4" /> Lines
          </button>
          <button
            onClick={() => setMode('midpoints')}
            className={`flex items-center gap-1.5 px-4 py-2 text-[13px] ${mode === 'midpoints' ? 'bg-fuchsia-500/30 text-fuchsia-100' : 'text-white/60'}`}
          >
            <GitMerge className="w-4 h-4" /> Midpoints
          </button>
        </div>
      )}

      {/* Place search (offline cities + countries) → fly-to + inspector. */}
      {mounted && enabled && webglOk && !error && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 w-[min(90vw,360px)]">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 backdrop-blur px-3 py-2 shadow-lg">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              value={geoQuery}
              onChange={(e) => setGeoQuery(e.target.value)}
              placeholder="Search a city or country…"
              className="bg-transparent outline-none text-[13px] text-white w-full placeholder:text-white/35"
            />
            {geoQuery && <button onClick={() => { setGeoQuery(''); setGeoResults([]); }} aria-label="Clear"><X className="w-4 h-4 text-white/40 hover:text-white" /></button>}
          </div>
          {geoResults.length > 0 && (
            <div className="mt-1 rounded-xl border border-white/10 bg-black/80 backdrop-blur overflow-hidden max-h-[46vh] overflow-y-auto">
              {geoResults.map((r, i) => (
                <button
                  key={`${r.name}-${i}`}
                  onClick={() => selectPlace(r)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10"
                >
                  <span className="text-[13px] text-white truncate">{r.name}</span>
                  <span className="ml-auto text-[11px] text-white/40 shrink-0">{r.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info readout. */}
      {mounted && enabled && webglOk && !error && note && mode === 'lines' && (
        <div className="absolute top-20 left-5 z-20 max-w-[320px] rounded-lg bg-black/55 backdrop-blur border border-white/10 px-3 py-2 text-[12px] text-white/80">
          {note}
          {birthConfidence.level === 'missing' && (
            <div className="mt-1 text-[11px] text-amber-300">⚠ No birth time on file — add an exact time; astrocartography can’t be accurate without it.</div>
          )}
        </div>
      )}

      {/* Layer control: body list (planets/points/asteroids) + asteroid search
          + angle filters + labels toggle. */}
      {mounted && enabled && webglOk && !error && mode === 'lines' && (
        <div className="absolute top-44 left-5 z-20 w-[220px] rounded-xl bg-black/60 backdrop-blur border border-white/10 text-white overflow-hidden">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold hover:bg-white/5"
          >
            <span>Layers · {bodyLegend.length}</span>
            <span className="text-white/50">{panelOpen ? '▾' : '▸'}</span>
          </button>
          {panelOpen && (
            <div className="px-3 pb-3 space-y-2">
              {/* Chart mode selector — always visible */}
              <div className="pb-2 border-b border-white/10">
                <div className="text-[11px] font-semibold text-white/80 mb-1.5">Chart mode</div>
                <div className="grid grid-cols-3 gap-1">
                  {([['natal', 'Natal'], ['grid', 'Duad Grid'], ['draconic', 'Draconic']] as [ChartMode, string][]).map(([m, label]) => (
                    <button
                      key={m}
                      onClick={() => setChartMode(m)}
                      className={`px-1.5 py-1.5 rounded text-[11px] border ${chartMode === m ? 'bg-accent-primary/25 border-accent-primary text-accent-primary font-medium' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                    >{label}</button>
                  ))}
                </div>
                {chartMode === 'grid' && (
                  <div className="mt-1.5 text-[10px] text-white/45 leading-snug">
                    An even horizontal ladder wrapping the globe: <strong>144 duads</strong> (faint lines),
                    <strong> 1,728 compendiums</strong> (at street-level zoom), and <strong>20,736 matrices</strong> (the finest 4th
                    level, at the deepest building-level zoom — built in a band around your latitude), evenly spaced pole-to-pole.
                    The <span className="text-amber-200">gold rung</span> at your birth latitude is your <strong>Ascendant&apos;s compendium</strong> —
                    the whole grid is anchored there (north → earlier signs, south → later). Your vertical planet lines pass through it;
                    tap anywhere to read the duad / compendium / matrix band + which planet crosses there.
                  </div>
                )}
                <button
                  onClick={() => setModesOpen((v) => !v)}
                  className="mt-1.5 text-[10px] text-white/40 hover:text-white/70"
                >
                  {modesOpen ? '▾ hide' : '▸ more modes'}
                </button>
                {modesOpen && (
                  <p className="text-[10px] text-white/35 leading-snug mt-1">
                    Transits, progressed, solar-arc/return, synastry, composite &amp; relocated — coming soon (need extra chart data).
                  </p>
                )}
              </div>
              {/* Active bodies */}
              <div className="space-y-0.5 max-h-[240px] overflow-y-auto pr-1">
                {bodyLegend.map(({ body, color }) => {
                  const on = !hidden.has(body);
                  const isPlanet = PLANET_ORDER.includes(body);
                  return (
                    <div key={body} className={`group flex items-center gap-2 text-[12px] px-1 py-0.5 rounded hover:bg-white/5 ${on ? '' : 'opacity-40'}`}>
                      <button onClick={() => toggleBody(body)} className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                        <span className="flex-1 text-left truncate">{body}</span>
                        <span className="text-white/40 shrink-0">{on ? '✓' : ''}</span>
                      </button>
                      {!isPlanet && (
                        <button onClick={() => removeBody(body)} aria-label={`Remove ${body}`} className="text-white/30 hover:text-white/80 shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add points / asteroids via search */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2 py-1">
                  <Search className="w-3 h-3 text-white/40 shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Add asteroid / point…"
                    className="bg-transparent outline-none text-[12px] w-full placeholder:text-white/30"
                  />
                </div>
                {search.trim() && (
                  <div className="mt-1 max-h-[160px] overflow-y-auto rounded-lg border border-white/10 bg-black/40">
                    {addableBodies.length === 0 && (
                      <div className="px-2 py-1.5 text-[11px] text-white/40">No matches.</div>
                    )}
                    {addableBodies.map((b) => (
                      <button
                        key={b}
                        onClick={() => addBody(b)}
                        className="w-full flex items-center gap-2 px-2 py-1 text-[12px] text-left hover:bg-white/10"
                      >
                        <Plus className="w-3 h-3 text-white/40" />
                        <span className="truncate">{b}</span>
                        {ACG_ASTEROIDS.includes(b) && <span className="ml-auto text-[10px] text-white/30">asteroid</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Angle filters */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1">
                {ALL_ANGLES.map((a) => {
                  const on = !hiddenAngles.has(a);
                  return (
                    <button
                      key={a}
                      onClick={() => toggleAngle(a)}
                      className={`px-2 py-0.5 rounded text-[11px] border ${on ? 'bg-white/15 border-white/30' : 'bg-transparent border-white/10 text-white/40'}`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowLabels((v) => !v)}
                className={`w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg text-[11px] border ${showLabels ? 'bg-white/15 border-white/30' : 'bg-transparent border-white/10 text-white/50'}`}
              >
                <Tag className="w-3 h-3" /> Labels {showLabels ? 'on' : 'off'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Midpoints panel — pair builder (with asteroid/point search) + active pairs. */}
      {mounted && enabled && webglOk && !error && mode === 'midpoints' && (
        <div className="absolute top-44 left-5 z-20 w-[240px] rounded-xl bg-black/60 backdrop-blur border border-white/10 text-white overflow-hidden">
          <div className="px-3 py-2 text-[12px] font-semibold border-b border-white/10">
            Midpoints · {pairs.length}/{MAX_PAIRS}
          </div>
          <div className="px-3 py-3 space-y-2">
            <p className="text-[11px] text-white/50">Pick two placements — their midpoint&apos;s lines are drawn dashed. Tap a line on the globe to read it.</p>
            {/* Two slots */}
            <div className="flex items-center gap-1.5">
              {(['A', 'B'] as const).map((slot) => {
                const val = slot === 'A' ? pickA : pickB;
                return (
                  <button
                    key={slot}
                    onClick={() => { setPicking(slot); setPickSearch(''); }}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-[12px] border truncate ${picking === slot ? 'border-fuchsia-400 bg-fuchsia-500/15' : 'border-white/15 bg-white/5'}`}
                  >
                    {val || (slot === 'A' ? 'Body A' : 'Body B')}
                  </button>
                );
              })}
              <button
                onClick={addPair}
                disabled={!pickA || !pickB || pickA === pickB || pairs.length >= MAX_PAIRS}
                className="px-2 py-1.5 rounded-lg text-[12px] bg-fuchsia-500/25 border border-fuchsia-400/50 text-fuchsia-100 disabled:opacity-30"
              >
                Add
              </button>
            </div>
            {/* Search list when picking a slot */}
            {picking && (
              <div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2 py-1">
                  <Search className="w-3 h-3 text-white/40 shrink-0" />
                  <input
                    autoFocus
                    value={pickSearch}
                    onChange={(e) => setPickSearch(e.target.value)}
                    placeholder={`Search for body ${picking}…`}
                    className="bg-transparent outline-none text-[12px] w-full placeholder:text-white/30"
                  />
                </div>
                <div className="mt-1 max-h-[180px] overflow-y-auto rounded-lg border border-white/10 bg-black/40">
                  {pickList.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        if (picking === 'A') setPickA(b); else setPickB(b);
                        setPicking(null); setPickSearch('');
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1 text-[12px] text-left hover:bg-white/10"
                    >
                      <span className="truncate">{b}</span>
                      {ACG_ASTEROIDS.includes(b) && <span className="ml-auto text-[10px] text-white/30">asteroid</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Active pairs */}
            {pairs.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-1">
                {pairs.map((p, i) => (
                  <div key={`${p.a}|${p.b}`} className="flex items-center gap-2 text-[12px]">
                    <GitMerge className="w-3 h-3 text-fuchsia-300 shrink-0" />
                    <span className="flex-1 truncate">{p.a} / {p.b}</span>
                    <button onClick={() => removePair(i)} aria-label="Remove pair" className="text-white/30 hover:text-white/80">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tap-to-read card (midpoints). */}
      {mounted && enabled && webglOk && !error && mode === 'midpoints' && probeOpen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,460px)] max-h-[42vh] overflow-y-auto rounded-2xl bg-black/80 backdrop-blur border border-fuchsia-400/30 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-fuchsia-100">Midpoint lines here</h3>
            <button onClick={() => setProbeOpen(false)} aria-label="Close"><X className="w-4 h-4 text-white/50 hover:text-white" /></button>
          </div>
          <div className="space-y-3">
            {probeHits.map((h, i) => (
              <div key={i} className="border-t border-white/10 pt-2 first:border-0 first:pt-0">
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: h.line.color }} />
                  {h.line.bodyA} / {h.line.bodyB} · {h.line.lineType}
                  <span className="ml-auto text-[11px] text-white/40">{h.distanceDeg.toFixed(1)}° away</span>
                </div>
                <p className="text-[12px] text-white/75 mt-1 leading-relaxed"
                   dangerouslySetInnerHTML={{ __html: h.meaning.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved locations panel. */}
      {mounted && enabled && webglOk && !error && savedOpen && (
        <div className="absolute bottom-6 right-16 z-30 w-[220px] max-h-[50vh] overflow-y-auto rounded-xl bg-black/70 backdrop-blur border border-white/15 text-white p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold">Saved places</span>
            <button onClick={() => setSavedOpen(false)} aria-label="Close"><X className="w-3.5 h-3.5 text-white/50 hover:text-white" /></button>
          </div>
          {savedLocations.length === 0 ? (
            <p className="text-[11px] text-white/40">Tap a place, then “Save” to bookmark it.</p>
          ) : (
            <div className="space-y-1">
              {savedLocations.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px]">
                  <button
                    onClick={() => { controller?.flyTo(s.lat, s.lng, 2_500_000); setSavedOpen(false); }}
                    className="flex-1 text-left truncate hover:text-white"
                    title={`${s.lat.toFixed(2)}°, ${s.lng.toFixed(2)}°`}
                  >
                    <Bookmark className="w-3 h-3 inline mr-1 text-fuchsia-300" />{s.name}
                  </button>
                  <button onClick={() => removeSaved(i)} aria-label="Remove" className="text-white/30 hover:text-white/80"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Location Inspector — tap any place in Lines mode. */}
      {mounted && enabled && webglOk && !error && mode === 'lines' && lineDetailOpen && tapPoint && (() => {
        const cities = nearestCities(tapPoint.lat, tapPoint.lng);
        const country = countryAt(tapPoint.lat, tapPoint.lng, countryFeatures);
        const placeName = cities[0] || country || `${tapPoint.lat.toFixed(1)}°, ${tapPoint.lng.toFixed(1)}°`;
        return (
          // Docked to the bottom-RIGHT, but offset in (right-20) so it clears
          // the right-4 button column — keeps the map centre free for double-tap.
          <div className="absolute bottom-4 right-20 z-30 w-[min(88vw,400px)] max-h-[56vh] overflow-y-auto rounded-2xl bg-black/85 backdrop-blur border border-white/15 text-white p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate">
                  {cities[0] ? `${cities[0]}${country ? `, ${country}` : ''}` : country || 'This location'}
                </h3>
                <p className="text-[11px] text-white/40">
                  {tapPoint.lat.toFixed(2)}°, {tapPoint.lng.toFixed(2)}°
                  {cities.length > 1 && <> · near {cities.slice(1).join(', ')}</>}
                </p>
                {/* Position confidence from birth-time precision. */}
                {birthConfidence.level === 'missing' ? (
                  <p className="text-[10px] text-amber-300 mt-0.5">⚠ No birth time on file — line positions can’t be trusted. Add an exact birth time for accuracy.</p>
                ) : (
                  <p className="text-[10px] text-white/40 mt-0.5">
                    Confidence ±{Math.round(kmPerMinuteAt(tapPoint.lat))} km per minute of birth-time error (time {birthConfidence.time}
                    {birthConfidence.level === 'rounded' ? ', may be rounded' : ''}).
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => saveLocation(placeName, tapPoint.lat, tapPoint.lng)}
                  className="text-[11px] px-2 py-1 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20"
                >Save</button>
                <button onClick={() => setLineDetailOpen(false)} aria-label="Close"><X className="w-4 h-4 text-white/50 hover:text-white" /></button>
              </div>
            </div>

            {/* Interpretive life-area scores */}
            {locReport && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                {locReport.scores.map((s) => (
                  <div key={s.domain} title={s.drivers.length ? `From: ${s.drivers.join(', ')}` : 'No strong lines here'}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/70">{s.domain}</span>
                      <span className="text-white/50">{s.score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.score >= 60 ? '#7dd3a8' : s.score >= 45 ? '#c9b6ff' : '#f0a3a3' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {locReport && (
              <p className="text-[10px] text-white/35 mb-2">
                Interpretive astrological scores (not scientific). 50 = neutral; higher = supportive lines, lower = challenging.
                {locReport.dominantPlanets.length > 0 && <> Dominant here: <span className="text-white/55">{locReport.dominantPlanets.join(', ')}</span>.</>}
              </p>
            )}

            {/* Crossing / activation zone: 2+ lines converging tightly here. */}
            {(() => {
              const crossers = lineHits.filter((h) => h.distanceDeg < 1.5);
              if (crossers.length < 2) return null;
              return (
                <div className="mb-2 rounded-lg bg-amber-400/10 border border-amber-400/30 px-2.5 py-1.5 text-[11px] text-amber-100">
                  <span className="font-semibold">⚡ Crossing zone</span> — {crossers.map((h) => `${h.line.planet} ${h.line.angle}`).join(' × ')} activate together here. Where lines cross, both energies fire at once — a high-intensity spot.
                </div>
              );
            })()}

            {/* Parans at this latitude (reuses Align's production paran calc). */}
            {(() => {
              const near = paransNearLatitude(parans, tapPoint.lat);
              if (near.length === 0) return null;
              return (
                <div className="mb-2 rounded-lg bg-fuchsia-400/10 border border-fuchsia-400/25 px-2.5 py-2 text-[11px]">
                  <div className="font-semibold text-fuchsia-100 mb-1">Paran lines at ~{Math.round(tapPoint.lat)}° latitude</div>
                  <div className="space-y-1.5">
                    {near.map((p, i) => (
                      <p key={i} className="text-white/75 leading-relaxed"
                         dangerouslySetInnerHTML={{ __html: p.interpretation.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* The full location reading — Natal & Duad Grid (present-tense
                predictive) or Draconic (past-life). */}
            {locInterp && (
              <div className={`mb-2 rounded-lg border px-2.5 py-2.5 text-[11px] ${locInterp.mode === 'draconic' ? 'bg-violet-500/10 border-violet-400/30' : 'bg-indigo-400/10 border-indigo-400/30'}`}>
                <div className={`font-semibold mb-1.5 ${locInterp.mode === 'draconic' ? 'text-violet-100' : 'text-indigo-100'}`}>
                  {locInterp.mode === 'draconic'
                    ? <>🌙 Past-life echo · {locInterp.planet} {locInterp.angle}{locInterp.karmicHotspot ? ' · active now' : ''}</>
                    : <>🔷 {locInterp.planet} {locInterp.angle} · {locInterp.natalSign} in your {ordinalLabel(locInterp.natalHouse)} house</>}
                </div>
                {locInterp.narrative.split('\n\n').map((para, i) => (
                  <p key={i} className="text-white/85 leading-relaxed mb-2"
                     dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
                ))}
                {locInterp.mode === 'present' && locInterp.events.length > 0 && (
                  <div className="mt-1 mb-2 rounded-lg bg-black/30 border border-white/10 px-2.5 py-2">
                    <div className="text-[11px] font-semibold text-white/85 mb-1.5">What could unfold here — the good and the hard</div>
                    <ul className="space-y-1">
                      {locInterp.events.map((e, i) => (
                        <li key={i} className="flex gap-1.5 text-[11px] text-white/80 leading-snug">
                          <span className="text-indigo-300 shrink-0">•</span><span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mt-1 pt-2 border-t border-white/10 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">Duad {locInterp.duadSign}{locInterp.mode === 'present' ? ` · ${ordinalLabel(locInterp.duadHouse)}h` : ''}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">Comp {locInterp.compSign}{locInterp.mode === 'present' ? ` · ${ordinalLabel(locInterp.compHouse)}h` : ''}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">Matrix {locInterp.matrixSign}{locInterp.mode === 'present' ? ` · ${ordinalLabel(locInterp.matrixHouse)}h` : ''}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-100">{locInterp.elements.dominant}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-100">{locInterp.modalities.dominant}</span>
                  {locInterp.mode === 'present' && locInterp.rulers.dominant?.available && (
                    <span className="px-1.5 py-0.5 rounded bg-fuchsia-400/15 text-fuchsia-100">Ruler {locInterp.rulers.dominant.planet}{locInterp.rulers.dominant.count >= 2 ? ` ×${locInterp.rulers.dominant.count}` : ''}</span>
                  )}
                </div>
              </div>
            )}
            {chartMode === 'grid' && gridBand && !locInterp && (
              <div className="mb-2 rounded-lg bg-indigo-400/10 border border-indigo-400/30 px-2.5 py-2 text-[11px]">
                <div className="font-semibold text-indigo-100 mb-1">🔷 {gridBand.duadSign} duad · {gridBand.compendiumSign} compendium · {gridBand.matrixSign} matrix</div>
                <p className="text-white/75 leading-relaxed">
                  This latitude sits in the <strong>{gridBand.duadSign}</strong> duad — <em>{gridBand.hiddenTheme}</em>.
                  Zoomed to street level the compendium here is <strong>{gridBand.compendiumSign}</strong> — <em>{gridBand.deepestTheme}</em>.
                </p>
                <p className="text-white/60 leading-relaxed mt-1">
                  Deepest zoom — the <strong>{gridBand.matrixSign}</strong> matrix: <em>{gridBand.matrixTheme}</em>.
                </p>
                <p className="text-white/50 leading-relaxed mt-1.5 italic">Tap on or near one of your planet lines for the full location reading.</p>
              </div>
            )}

            {/* Nearby lines with interpretation — suppressed when the full
                synthesis is showing (it already speaks to the active line). */}
            {locInterp ? null : lineHits.length === 0 ? (
              <p className="text-[12px] text-white/50 border-t border-white/10 pt-2">No lines run close to this exact spot — the scores above reflect the wider field.</p>
            ) : (
              <div className="space-y-2.5 border-t border-white/10 pt-2">
                {lineHits.map((h, i) => {
                  // Duad & compendium lines read from their derived sign + theme,
                  // not the natal line meaning (that would mislabel the point).
                  const derived = h.line.style === 'duad' || h.line.style === 'compendium';
                  if (derived) {
                    const isComp = h.line.style === 'compendium';
                    return (
                      <div key={i}>
                        <div className="flex items-center gap-2 text-[13px] font-semibold">
                          <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: h.line.color }} />
                          {h.line.planet} {h.line.angle}
                          <span className="text-[11px] font-normal text-indigo-200/70">· {h.line.derivedSign} {isComp ? 'compendium' : 'duad'}</span>
                          <span className="ml-auto text-[11px] text-white/40 shrink-0">{Math.round(h.distanceKm)} km</span>
                        </div>
                        <p className="text-[12px] text-white/80 mt-1 leading-relaxed">
                          The hidden <strong>{h.line.derivedSign}</strong> {isComp ? 'compendium' : 'duad'} layer of your {h.line.planet} {h.line.angle} line — <em>{h.line.theme}</em>.
                        </p>
                      </div>
                    );
                  }
                  const r = natalLineMeaning(h.line.planet, h.line.angle);
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-2 text-[13px] font-semibold">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: h.line.color }} />
                        {h.line.planet} {h.line.angle}
                        <span className="text-[11px] font-normal text-white/45">· {r.area}</span>
                        <span className="ml-auto text-[11px] text-white/40 shrink-0">{Math.round(h.distanceKm)} km</span>
                      </div>
                      <p className="text-[12px] text-white/80 mt-1 leading-relaxed"
                         dangerouslySetInnerHTML={{ __html: r.meaning.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                      {r.watch && (
                        <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
                          <span className="font-semibold">Watch for:</span> {r.watch}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {!mounted || !authSettled ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 text-sm animate-pulse">Loading…</div>
        </div>
      ) : !enabled ? (
        <ZodisphereFallbackView
          message="The 3D globe preview isn’t enabled for your account yet."
          classicHref="/zodisphere"
        />
      ) : !webglOk ? (
        <ZodisphereFallbackView
          message="Your device or browser doesn’t support the 3D graphics this globe needs."
          classicHref="/zodisphere"
        />
      ) : error ? (
        <ZodisphereFallbackView message={error} onRetry={retry} classicHref="/zodisphere" />
      ) : (
        <>
          <ZodisphereErrorBoundary classicHref="/zodisphere">
            <ZodisphereGlobeCesium
              key={retryKey}
              onError={setError}
              onReady={setController}
              astroLines={mode === 'midpoints' ? midLines : linesForGlobe}
              astroLabels={mode === 'lines' && showLabels}
              astroDashed={mode === 'midpoints'}
              astroCorridors={showCorridors}
              onTap={handleTap}
              myPlace={
                profile?.latitude != null && profile?.longitude != null
                  ? { lat: profile.latitude, lng: profile.longitude, label: profile.birth_location || 'Your birthplace' }
                  : null
              }
            />
          </ZodisphereErrorBoundary>
          {/* Camera controls — always give the user an explicit way to zoom,
              in addition to scroll/pinch. */}
          {controller && (
            <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2">
              <button
                onClick={() => setShowPlaceNames((v) => !v)}
                aria-label="Toggle place names"
                title="Place names (countries → cities → streets as you zoom)"
                className={`w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur border transition-colors ${showPlaceNames ? 'bg-white/20 border-white/40 text-white' : 'bg-black/50 border-white/15 text-white/50 hover:bg-white/10'}`}
              >
                <Type className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowBorders((v) => !v)}
                aria-label="Toggle borders"
                title="Country & state/province borders"
                className={`w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur border transition-colors ${showBorders ? 'bg-white/20 border-white/40 text-white' : 'bg-black/50 border-white/15 text-white/50 hover:bg-white/10'}`}
              >
                <Frame className="w-5 h-5" />
              </button>
              <button
                onClick={() => setQuality((q) => (q === 'high' ? 'balanced' : q === 'balanced' ? 'performance' : 'high'))}
                aria-label="Graphics quality"
                title={`Graphics quality: ${quality} (tap to cycle). Astro accuracy is never affected.`}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur border border-white/15 text-white/80 hover:bg-white/10 transition-colors text-[13px] font-semibold"
              >
                {quality === 'high' ? 'HQ' : quality === 'balanced' ? 'BAL' : 'PERF'}
              </button>
              <button
                onClick={() => setShowCorridors((v) => !v)}
                aria-label="Toggle influence corridors"
                title="Influence corridors (soft band around each line)"
                className={`w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur border transition-colors ${showCorridors ? 'bg-white/20 border-white/40 text-white' : 'bg-black/50 border-white/15 text-white/50 hover:bg-white/10'}`}
              >
                <Waves className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSavedOpen((v) => !v)}
                aria-label="Saved locations"
                title="Saved locations"
                className={`w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur border transition-colors ${savedOpen ? 'bg-white/20 border-white/40 text-white' : 'bg-black/50 border-white/15 text-white/50 hover:bg-white/10'}`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
              <button
                onClick={() => controller.zoomIn()}
                aria-label="Zoom in"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur border border-white/15 text-white hover:bg-white/10 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => controller.zoomOut()}
                aria-label="Zoom out"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur border border-white/15 text-white hover:bg-white/10 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <button
                onClick={() => controller.home()}
                aria-label="Return to full globe"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur border border-white/15 text-white hover:bg-white/10 transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
