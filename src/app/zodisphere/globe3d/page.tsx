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
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { isZodisphere3dEnabled } from '@/config/featureFlags';
import ZodisphereErrorBoundary from '@/components/zodisphere/three-d/ZodisphereErrorBoundary';
import ZodisphereFallbackView from '@/components/zodisphere/three-d/ZodisphereFallbackView';
import type { ZodisphereGlobeController } from '@/components/zodisphere/three-d/ZodisphereGlobeCesium';
import { getAstrocartographyLines, type AcgLine3D } from '@/components/zodisphere/three-d/AstrocartographyDataAdapter';
import { Plus, Minus, Home } from 'lucide-react';

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
  const [lines, setLines] = useState<AcgLine3D[]>([]);
  const [lineNote, setLineNote] = useState('');

  useEffect(() => {
    setMounted(true);
    setWebglOk(hasWebGL());
  }, []);

  const enabled = isZodisphere3dEnabled(profile?.email);
  const retry = useCallback(() => { setError(null); setRetryKey((k) => k + 1); }, []);

  // Phase 3: fetch ONE verified line (Sun · MC) via the adapter and verify it.
  useEffect(() => {
    if (!enabled || !profile) return;
    let alive = true;
    (async () => {
      if (!profile.birth_date || profile.latitude == null) {
        if (alive) setLineNote('Add your birth date, time and place in your profile to see astro lines.');
        return;
      }
      const result = await getAstrocartographyLines(profile, { planets: ['Sun'], angles: ['MC'] });
      if (!alive) return;
      setLines(result);
      // Verification: an MC line must be a constant-longitude meridian.
      const sunMc = result.find((l) => l.id === 'Sun:MC');
      if (sunMc && sunMc.points.length > 1) {
        const lons = sunMc.points.map((p) => p.lon);
        const spread = Math.max(...lons) - Math.min(...lons);
        const meridianLon = lons[Math.floor(lons.length / 2)];
        setLineNote(
          `Sun · MC meridian ${meridianLon.toFixed(2)}° — ${sunMc.points.length} pts, ` +
          `${spread < 0.01 ? 'verified straight meridian ✓' : 'NOT constant ✗'}. ` +
          `This is where the Sun sits on the Midheaven across Earth — not your birthplace (◉ marks that). ` +
          `Phase 4 adds all planet lines.`,
        );
      } else {
        setLineNote('Sun · MC line unavailable for this chart.');
      }
    })();
    return () => { alive = false; };
  }, [enabled, profile]);

  // When the line and camera are both ready, fly to the meridian so it's in view.
  useEffect(() => {
    const sunMc = lines.find((l) => l.id === 'Sun:MC');
    if (controller && sunMc && sunMc.points.length) {
      const mid = sunMc.points[Math.floor(sunMc.points.length / 2)];
      controller.flyTo(0, mid.lon, 14_000_000);
    }
  }, [controller, lines]);

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

      {/* Phase 3 verification readout — confirms the rendered line's geometry. */}
      {mounted && enabled && webglOk && !error && lineNote && (
        <div className="absolute top-20 left-5 z-20 max-w-[340px] rounded-lg bg-black/55 backdrop-blur border border-white/10 px-3 py-2 text-[12px] text-amber-200">
          {lineNote}
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
              astroLines={lines}
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
