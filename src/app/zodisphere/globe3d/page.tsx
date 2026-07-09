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
import { getAstrocartographyLines, type AcgLine3D, type AcgAngle } from '@/components/zodisphere/three-d/AstrocartographyDataAdapter';
import { Plus, Minus, Home, Tag } from 'lucide-react';

const PLANET_ORDER = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const ALL_ANGLES: AcgAngle[] = ['MC', 'IC', 'ASC', 'DSC'];

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
  const [hiddenPlanets, setHiddenPlanets] = useState<Set<string>>(new Set());
  const [hiddenAngles, setHiddenAngles] = useState<Set<AcgAngle>>(new Set());
  const [showLabels, setShowLabels] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [flewToHome, setFlewToHome] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebglOk(hasWebGL());
  }, []);

  const enabled = isZodisphere3dEnabled(profile?.email);
  const retry = useCallback(() => { setError(null); setRetryKey((k) => k + 1); }, []);

  // Phase 4: fetch ALL planet lines (Sun…Pluto × ASC/DSC/MC/IC) via the adapter.
  useEffect(() => {
    if (!enabled || !profile) return;
    let alive = true;
    (async () => {
      if (!profile.birth_date || profile.latitude == null) {
        if (alive) setNote('Add your birth date, time and place in your profile to see your astro lines.');
        return;
      }
      const result = await getAstrocartographyLines(profile); // all planets, all angles
      if (!alive) return;
      setAllLines(result);
      const planets = new Set(result.map((l) => l.planet)).size;
      setNote(result.length
        ? `${result.length} lines · ${planets} planets × ASC/DSC/MC/IC. Tap a planet below to toggle it.`
        : 'No lines available for this chart.');
    })();
    return () => { alive = false; };
  }, [enabled, profile]);

  // Visible subset after the planet/angle filters.
  const visibleLines = useMemo(
    () => allLines.filter((l) => !hiddenPlanets.has(l.planet) && !hiddenAngles.has(l.angle)),
    [allLines, hiddenPlanets, hiddenAngles],
  );

  // Planets present, in canonical order, each with its colour (from the engine).
  const planetLegend = useMemo(() => {
    const byPlanet = new Map<string, string>();
    for (const l of allLines) if (!byPlanet.has(l.planet)) byPlanet.set(l.planet, l.color);
    return PLANET_ORDER.filter((p) => byPlanet.has(p)).map((p) => ({ planet: p, color: byPlanet.get(p)! }));
  }, [allLines]);

  // Once lines + camera are ready, fly to the birthplace so the user sees the
  // lines around home (falls back to a full-globe framing if no birthplace).
  useEffect(() => {
    if (flewToHome || !controller || allLines.length === 0) return;
    if (profile?.latitude != null && profile?.longitude != null) {
      controller.flyTo(profile.latitude, profile.longitude, 9_000_000);
      setFlewToHome(true);
    }
  }, [controller, allLines, profile, flewToHome]);

  const togglePlanet = (p: string) => setHiddenPlanets((s) => {
    const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n;
  });
  const toggleAngle = (a: AcgAngle) => setHiddenAngles((s) => {
    const n = new Set(s); n.has(a) ? n.delete(a) : n.add(a); return n;
  });

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
          className="px-3 py-2 rounded-xl text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          Classic globe
        </Link>
      </header>

      {/* Info readout. */}
      {mounted && enabled && webglOk && !error && note && (
        <div className="absolute top-20 left-5 z-20 max-w-[320px] rounded-lg bg-black/55 backdrop-blur border border-white/10 px-3 py-2 text-[12px] text-white/80">
          {note}
        </div>
      )}

      {/* Layer control: planet + angle filters and labels toggle. */}
      {mounted && enabled && webglOk && !error && planetLegend.length > 0 && (
        <div className="absolute top-36 left-5 z-20 w-[190px] rounded-xl bg-black/55 backdrop-blur border border-white/10 text-white overflow-hidden">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold hover:bg-white/5"
          >
            <span>Layers</span>
            <span className="text-white/50">{panelOpen ? '▾' : '▸'}</span>
          </button>
          {panelOpen && (
            <div className="px-3 pb-3 space-y-2">
              <div className="space-y-1">
                {planetLegend.map(({ planet, color }) => {
                  const on = !hiddenPlanets.has(planet);
                  return (
                    <button
                      key={planet}
                      onClick={() => togglePlanet(planet)}
                      className={`w-full flex items-center gap-2 text-[12px] px-1 py-0.5 rounded ${on ? '' : 'opacity-40'} hover:bg-white/5`}
                    >
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                      <span className="flex-1 text-left">{planet}</span>
                      <span className="text-white/40">{on ? '✓' : ''}</span>
                    </button>
                  );
                })}
              </div>
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
              astroLines={visibleLines}
              astroLabels={showLabels}
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
