'use client';

/**
 * ZodisphereGlobeCesium — the Cesium 3D Earth (Phase 2 prototype).
 *
 * ISOLATION + SAFETY:
 *  - Cesium is imported ONLY at runtime inside an effect (never at module top
 *    level) so it can't touch `window`/WebGL during Next's server prerender.
 *  - Exactly one Viewer is created per mount; a guard prevents duplicates under
 *    React 18 StrictMode double-invoke.
 *  - On unmount the Viewer, its listeners and WebGL resources are destroyed and
 *    the injected stylesheet is removed — no leaked context between visits.
 *  - requestRenderMode: the scene renders only when something changes (camera,
 *    tiles, data) — no permanent high-FPS loop that would drain battery/heat.
 *  - WebGL context loss is caught and surfaced via onError so the parent can
 *    show a calm fallback instead of a frozen/blank canvas.
 *
 * IMAGERY: with a Cesium ion token (NEXT_PUBLIC_CESIUM_ION_TOKEN) it streams
 * world imagery + terrain. With no token it falls back to open imagery
 * (OpenStreetMap) on a smooth ellipsoid — still a real, zoomable 3D globe.
 *
 * This component renders geography only. Astrocartography layers, search and
 * the location inspector are added by separate modules in later phases.
 */

import { useEffect, useRef } from 'react';
import type * as CesiumNS from 'cesium';

export interface ZodisphereGlobeCesiumProps {
  /** Called once the globe is interactive. */
  onReady?: (controller: ZodisphereGlobeController) => void;
  /** Called on any fatal init/runtime failure (WebGL loss, bad token, etc.). */
  onError?: (message: string) => void;
  /** Initial camera height in metres above the surface. */
  initialHeightMeters?: number;
}

/** Minimal imperative handle other modules use to drive the camera. */
export interface ZodisphereGlobeController {
  flyTo: (lat: number, lng: number, heightMeters?: number) => void;
  home: () => void;
  isDestroyed: () => boolean;
}

const DEFAULT_HEIGHT = 20_000_000; // ~full-Earth view, not max-detail city tiles

export default function ZodisphereGlobeCesium({
  onReady,
  onError,
  initialHeightMeters = DEFAULT_HEIGHT,
}: ZodisphereGlobeCesiumProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumNS.Viewer | null>(null);
  const createdRef = useRef(false); // guard against StrictMode double-create

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (createdRef.current) return; // never build a second viewer
    createdRef.current = true;

    let cancelled = false;
    let styleLink: HTMLLinkElement | null = null;
    let contextLostHandler: ((e: Event) => void) | null = null;

    (async () => {
      try {
        // Self-hosted assets (copied to /public/cesium by scripts/copy-cesium.mjs).
        (window as any).CESIUM_BASE_URL = '/cesium';

        // Cesium's widget CSS — inject as a <link> (component-scoped CSS imports
        // are restricted in the Next app router; a link tag sidesteps that).
        if (!document.querySelector('link[data-cesium-widgets]')) {
          styleLink = document.createElement('link');
          styleLink.rel = 'stylesheet';
          styleLink.href = '/cesium/Widgets/widgets.css';
          styleLink.setAttribute('data-cesium-widgets', 'true');
          document.head.appendChild(styleLink);
        }

        const Cesium = await import('cesium');
        if (cancelled || !containerRef.current) return;

        const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
        const hasIon = !!token;
        if (hasIon) Cesium.Ion.defaultAccessToken = token as string;

        // Imagery: ion world imagery when tokened, else open OSM tiles.
        const imageryProvider = hasIon
          ? undefined // let the Viewer use the ion default base layer
          : new Cesium.OpenStreetMapImageryProvider({
              url: 'https://tile.openstreetmap.org/',
            });

        const viewer = new Cesium.Viewer(containerRef.current, {
          // Strip default chrome — Zodisphere provides its own controls.
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          // Perf: render on demand, not a continuous loop.
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
          // Keyless path uses a flat ellipsoid; ion path gets streamed terrain.
          ...(hasIon ? {} : { baseLayer: Cesium.ImageryLayer.fromProviderAsync(Promise.resolve(imageryProvider!), {}) }),
        });

        if (cancelled) { viewer.destroy(); return; }
        viewerRef.current = viewer;

        // Streamed world terrain only when we have an ion token.
        if (hasIon) {
          try {
            viewer.terrainProvider = await Cesium.createWorldTerrainAsync();
          } catch {
            /* fall back silently to the default ellipsoid terrain */
          }
        }

        // Cosmetic + privacy: no default Bing logo watermark abuse; keep the
        // credit container (required attribution) visible but out of the way.
        viewer.scene.globe.enableLighting = true;
        viewer.scene.skyAtmosphere.show = true;

        // Recover-or-report on WebGL context loss instead of freezing.
        const canvas = viewer.scene.canvas as HTMLCanvasElement;
        contextLostHandler = (e: Event) => {
          e.preventDefault();
          onError?.('The 3D graphics context was lost. Tap retry to reload the globe.');
        };
        canvas.addEventListener('webglcontextlost', contextLostHandler, false);

        // Open at a sensible altitude (full globe), not max city detail.
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(0, 20, initialHeightMeters),
        });

        const controller: ZodisphereGlobeController = {
          flyTo: (lat, lng, heightMeters = 1_500_000) => {
            if (viewer.isDestroyed()) return;
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(lng, lat, heightMeters),
              duration: 1.6,
            });
          },
          home: () => {
            if (viewer.isDestroyed()) return;
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(0, 20, DEFAULT_HEIGHT),
              duration: 1.4,
            });
          },
          isDestroyed: () => viewer.isDestroyed(),
        };
        onReady?.(controller);
      } catch (err: any) {
        if (!cancelled) onError?.(err?.message || 'The 3D globe failed to initialize.');
      }
    })();

    return () => {
      cancelled = true;
      const viewer = viewerRef.current;
      if (viewer && !viewer.isDestroyed()) {
        try {
          if (contextLostHandler) {
            (viewer.scene.canvas as HTMLCanvasElement).removeEventListener(
              'webglcontextlost', contextLostHandler, false,
            );
          }
          viewer.destroy();
        } catch {
          /* already torn down */
        }
      }
      viewerRef.current = null;
      if (styleLink && styleLink.parentNode) styleLink.parentNode.removeChild(styleLink);
      // Allow a fresh viewer if this component remounts later.
      createdRef.current = false;
    };
  }, [initialHeightMeters, onReady, onError]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
