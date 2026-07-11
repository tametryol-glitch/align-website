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
  getBodyAcgLines, getMidpointLines3D, probeMidpoints,
  ACG_PLANETS, ACG_POINTS, ACG_ASTEROIDS,
  type AcgLine3D, type AcgAngle, type MidpointPair, type MidpointLine, type ProbeHit,
} from '@/components/zodisphere/three-d/AstrocartographyDataAdapter';
import { Plus, Minus, Home, Tag, X, Search, GitMerge, Orbit } from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [controller, setController] = useState<ZodisphereGlobeController | null>(null);
  const [allLines, setAllLines] = useState<AcgLine3D[]>([]);
  const [note, setNote] = useState('');
  // Bodies whose lines are fetched + shown (planets by default; add points/asteroids).
  const [bodies, setBodies] = useState<string[]>(ACG_PLANETS);
  const [hidden, setHidden] = useState<Set<string>>(new Set());       // visual toggle
  const [hiddenAngles, setHiddenAngles] = useState<Set<AcgAngle>>(new Set());
  const [showLabels, setShowLabels] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [flewToHome, setFlewToHome] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMounted(true);
    setWebglOk(hasWebGL());
  }, []);

  const enabled = isZodisphere3dEnabled(profile?.email);
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
      const { lines, unavailable } = await getBodyAcgLines(profile, bodies);
      if (!alive) return;
      setAllLines(lines);
      const shown = new Set(lines.map((l) => l.planet)).size;
      setNote(
        `${lines.length} lines · ${shown} placements × ASC/DSC/MC/IC.` +
        (unavailable.length ? ` Unavailable for this chart: ${unavailable.join(', ')}.` : ''),
      );
    })();
    return () => { alive = false; };
  }, [enabled, profile, bodies]);

  // Visible subset after the body/angle filters.
  const visibleLines = useMemo(
    () => allLines.filter((l) => !hidden.has(l.planet) && !hiddenAngles.has(l.angle)),
    [allLines, hidden, hiddenAngles],
  );

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

  // Tap-to-read: in midpoints mode, a globe tap lists the nearby midpoint lines.
  const handleTap = useCallback((lat: number, lng: number) => {
    if (mode !== 'midpoints') return;
    const hits = probeMidpoints(lat, lng, midRaw);
    setProbeHits(hits);
    setProbeOpen(hits.length > 0);
  }, [mode, midRaw]);

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

      {/* Info readout. */}
      {mounted && enabled && webglOk && !error && note && mode === 'lines' && (
        <div className="absolute top-20 left-5 z-20 max-w-[320px] rounded-lg bg-black/55 backdrop-blur border border-white/10 px-3 py-2 text-[12px] text-white/80">
          {note}
        </div>
      )}

      {/* Layer control: body list (planets/points/asteroids) + asteroid search
          + angle filters + labels toggle. */}
      {mounted && enabled && webglOk && !error && mode === 'lines' && (
        <div className="absolute top-36 left-5 z-20 w-[220px] rounded-xl bg-black/60 backdrop-blur border border-white/10 text-white overflow-hidden">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold hover:bg-white/5"
          >
            <span>Layers · {bodyLegend.length}</span>
            <span className="text-white/50">{panelOpen ? '▾' : '▸'}</span>
          </button>
          {panelOpen && (
            <div className="px-3 pb-3 space-y-2">
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
        <div className="absolute top-36 left-5 z-20 w-[240px] rounded-xl bg-black/60 backdrop-blur border border-white/10 text-white overflow-hidden">
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

      {!mounted ? null : !enabled ? (
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
              astroLines={mode === 'midpoints' ? midLines : visibleLines}
              astroLabels={mode === 'lines' && showLabels}
              astroDashed={mode === 'midpoints'}
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
