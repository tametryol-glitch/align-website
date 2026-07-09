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

  useEffect(() => {
    setMounted(true);
    setWebglOk(hasWebGL());
  }, []);

  const enabled = isZodisphere3dEnabled(profile?.email);
  const retry = useCallback(() => { setError(null); setRetryKey((k) => k + 1); }, []);

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
            <ZodisphereGlobeCesium key={retryKey} onError={setError} onReady={setController} />
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
