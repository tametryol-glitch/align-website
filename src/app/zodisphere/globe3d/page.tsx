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
        <ZodisphereErrorBoundary classicHref="/zodisphere">
          <ZodisphereGlobeCesium key={retryKey} onError={setError} />
        </ZodisphereErrorBoundary>
      )}
    </div>
  );
}
