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

import { useEffect, useRef, useState } from 'react';
import type * as CesiumNS from 'cesium';
import type { AcgLine3D } from './AstrocartographyDataAdapter';
import { AstrocartographyLineRenderer } from './AstrocartographyLineRenderer';

export interface ZodisphereGlobeCesiumProps {
  /** Called once the globe is interactive. */
  onReady?: (controller: ZodisphereGlobeController) => void;
  /** Called on any fatal init/runtime failure (WebGL loss, bad token, etc.). */
  onError?: (message: string) => void;
  /** Initial camera height in metres above the surface. */
  initialHeightMeters?: number;
  /** Astrocartography lines to draw on the globe (already engine-projected). */
  astroLines?: AcgLine3D[];
  /** Draw a text label (planet + angle) on each line. */
  astroLabels?: boolean;
  /** Draw the lines dashed (used for midpoint lines). */
  astroDashed?: boolean;
  /** Fired when the user taps/clicks a point on the globe (lat/lng in degrees). */
  onTap?: (lat: number, lng: number) => void;
  /** The user's own birthplace, shown as an orientation marker. */
  myPlace?: { lat: number; lng: number; label: string } | null;
  /** Diagnostic status string (prototype only) for an on-screen readout. */
  onStatus?: (status: string) => void;
}

/** Minimal imperative handle other modules use to drive the camera. */
export interface ZodisphereGlobeController {
  flyTo: (lat: number, lng: number, heightMeters?: number) => void;
  home: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  isDestroyed: () => boolean;
}

const DEFAULT_HEIGHT = 20_000_000; // ~full-Earth view, not max-detail city tiles

export default function ZodisphereGlobeCesium({
  onReady,
  onError,
  onStatus,
  astroLines,
  astroLabels,
  astroDashed,
  onTap,
  myPlace,
  initialHeightMeters = DEFAULT_HEIGHT,
}: ZodisphereGlobeCesiumProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumNS.Viewer | null>(null);
  const cesiumRef = useRef<typeof CesiumNS | null>(null);
  const rendererRef = useRef<AstrocartographyLineRenderer | null>(null);
  const myPlaceEntityRef = useRef<CesiumNS.Entity | null>(null);
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap; // always current, without recreating the viewer
  const createdRef = useRef(false); // guard against StrictMode double-create
  const [viewerReady, setViewerReady] = useState(false);

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

        // EXPLICIT base imagery so the globe always has a texture (never relies
        // on the Viewer's implicit default): ion world (satellite) when tokened,
        // else open OSM tiles.
        const baseLayer = hasIon
          ? Cesium.ImageryLayer.fromWorldImagery({})
          : Cesium.ImageryLayer.fromProviderAsync(
              Promise.resolve(new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' })),
              {},
            );

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
          baseLayer,
          // NOTE: requestRenderMode (render-on-demand) is intentionally OFF for
          // the prototype — with it on, the globe can deadlock loading its first
          // tiles (no render → no tile load → no render), showing only the star
          // field. Phase 6 re-enables it properly with explicit requestRender()
          // hooks on camera/data changes.
          requestRenderMode: false,
        });

        if (cancelled) { viewer.destroy(); return; }
        viewerRef.current = viewer;

        // Streamed 3D world terrain (relief/mountains) when we have an ion token.
        if (hasIon) {
          try {
            viewer.terrainProvider = await Cesium.createWorldTerrainAsync();
          } catch {
            /* fall back silently to the smooth ellipsoid terrain */
          }
        }

        // Lighting OFF so the whole globe is evenly lit (no dark night side). A
        // day/night terminator can return in a later phase.
        viewer.scene.globe.enableLighting = false;
        viewer.scene.skyAtmosphere.show = true;
        // The GROUND-atmosphere shader renders the globe BLACK on many mobile
        // GPUs (while vector lines still draw) — the exact "dark Earth on phone,
        // vivid on desktop" symptom. Turn it off; it's just a subtle tint on
        // desktop, so imagery stays vivid everywhere. Fog off for the same
        // reason (it can over-darken at grazing angles on mobile).
        viewer.scene.globe.showGroundAtmosphere = false;
        viewer.scene.fog.enabled = false;
        // Deep-ocean base colour shows through only where imagery is still
        // streaming, so gaps read as sea rather than a jarring flat fill.
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1b2e');

        // Phones: cut GPU/memory pressure so imagery tiles aren't starved
        // (another cause of a dark globe). Coarser tiles + smaller cache + no
        // super-sampling; the astro maths is unaffected.
        const isMobile = typeof navigator !== 'undefined'
          && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
        if (isMobile) {
          viewer.resolutionScale = 1.0;
          viewer.scene.globe.maximumScreenSpaceError = 3;
          viewer.scene.globe.tileCacheSize = 100;
        }

        // Recover-or-report on WebGL context loss instead of freezing.
        const canvas = viewer.scene.canvas as HTMLCanvasElement;
        contextLostHandler = (e: Event) => {
          e.preventDefault();
          onError?.('The 3D graphics context was lost. Tap retry to reload the globe.');
        };
        canvas.addEventListener('webglcontextlost', contextLostHandler, false);

        // Camera controls — explicitly enable rotate/zoom/tilt and set sane
        // zoom limits (down to ~50 m, out to deep space) so pinch/wheel zoom
        // works reliably across devices.
        const cc = viewer.scene.screenSpaceCameraController;
        cc.enableInputs = true;
        cc.enableRotate = true;
        cc.enableZoom = true;
        cc.enableTilt = true;
        cc.enableTranslate = true;
        cc.enableLook = true;
        cc.minimumZoomDistance = 50;
        cc.maximumZoomDistance = 40_000_000;

        // Double-tap / double-click: STEP the zoom in toward the exact tapped
        // point (not a one-shot zoom-all-the-way). Each double-tap roughly
        // halves the altitude and re-centres on where the user tapped. We
        // replace Cesium's default double-click (which tracks entities).
        const sseh = viewer.screenSpaceEventHandler;
        sseh.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        sseh.setInputAction((movement: any) => {
          if (viewer.isDestroyed()) return;
          const ellipsoid = viewer.scene.globe.ellipsoid;
          // Prefer the true terrain/surface point under the cursor; fall back
          // to the ellipsoid intersection.
          let cartesian = viewer.scene.pickPosition(movement.position);
          if (!Cesium.defined(cartesian)) {
            cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid) as any;
          }
          if (!Cesium.defined(cartesian)) return;
          const carto = Cesium.Cartographic.fromCartesian(cartesian);
          const lng = Cesium.Math.toDegrees(carto.longitude);
          const lat = Cesium.Math.toDegrees(carto.latitude);
          const h = viewer.camera.positionCartographic.height;
          const newH = Math.max(h * 0.5, 250); // one stepped level in, floor 250 m
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lng, lat, newH),
            duration: 0.5,
          });
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Single click → report the tapped lat/lng (used for midpoint
        // tap-to-read). Reads onTap from a ref so it's always current.
        sseh.setInputAction((movement: any) => {
          if (viewer.isDestroyed() || !onTapRef.current) return;
          const ellipsoid = viewer.scene.globe.ellipsoid;
          let cartesian = viewer.scene.pickPosition(movement.position);
          if (!Cesium.defined(cartesian)) {
            cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid) as any;
          }
          if (!Cesium.defined(cartesian)) return;
          const carto = Cesium.Cartographic.fromCartesian(cartesian);
          onTapRef.current(
            Cesium.Math.toDegrees(carto.latitude),
            Cesium.Math.toDegrees(carto.longitude),
          );
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Frame the whole Earth reliably (Cesium's default home rectangle).
        viewer.camera.flyHome(0);
        onStatus?.('ready');

        // Zoom by a fraction of the current altitude so it feels consistent at
        // every scale (small steps up close, big steps far out).
        const zoomBy = (factor: number) => {
          if (viewer.isDestroyed()) return;
          const h = viewer.camera.positionCartographic.height;
          viewer.camera.zoomIn(h * factor);
        };

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
          zoomIn: () => zoomBy(0.35),
          zoomOut: () => zoomBy(-0.55),
          isDestroyed: () => viewer.isDestroyed(),
        };

        // Wire the astrocartography line renderer to this viewer.
        cesiumRef.current = Cesium;
        rendererRef.current = new AstrocartographyLineRenderer(Cesium, viewer);
        setViewerReady(true);

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
      rendererRef.current?.clear();
      rendererRef.current = null;
      cesiumRef.current = null;
      viewerRef.current = null;
      setViewerReady(false);
      if (styleLink && styleLink.parentNode) styleLink.parentNode.removeChild(styleLink);
      // Allow a fresh viewer if this component remounts later.
      createdRef.current = false;
    };
  }, [initialHeightMeters, onReady, onError, onStatus]);

  // Draw / update astrocartography lines whenever they change (once the viewer
  // is ready). The renderer diff-replaces entities; unchanged calls are cheap.
  useEffect(() => {
    if (!viewerReady || !rendererRef.current) return;
    rendererRef.current.render(astroLines ?? [], !!astroLabels, !!astroDashed);
  }, [astroLines, astroLabels, astroDashed, viewerReady]);

  // Birthplace orientation marker (a teal pin + label), so the user can see
  // where they are relative to the astro lines.
  useEffect(() => {
    const Cesium = cesiumRef.current;
    const viewer = viewerRef.current;
    if (!viewerReady || !Cesium || !viewer || viewer.isDestroyed()) return;
    if (myPlaceEntityRef.current) {
      viewer.entities.remove(myPlaceEntityRef.current);
      myPlaceEntityRef.current = null;
    }
    if (myPlace) {
      myPlaceEntityRef.current = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(myPlace.lng, myPlace.lat),
        point: {
          pixelSize: 11,
          color: Cesium.Color.fromCssColorString('#5eead4'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: myPlace.label,
          font: '600 13px sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('#0a0e1a').withAlpha(0.75),
          pixelOffset: new Cesium.Cartesian2(0, -20),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
      });
      viewer.scene.requestRender();
    }
  }, [myPlace, viewerReady]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" style={{ touchAction: 'none' }} />;
}
