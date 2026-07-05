'use client';

/**
 * Zodisphere embed -- chromeless globe renderer for the mobile WebView.
 *
 * PRIVACY-BY-ARCHITECTURE: this page performs NO network requests and
 * holds NO auth tokens. The React Native app fetches the banded, k>=10
 * aggregates itself (with the user's session) and injects them here via
 * postMessage. The WebView is a pure renderer — even a compromised page
 * could not read anything the app didn't explicitly hand it.
 *
 * Protocol:
 *   RN -> page : { type: 'zodisphere:data', areas: AreaStat[] }
 *   page -> RN : { type: 'zodisphere:ready' }
 *   page -> RN : { type: 'zodisphere:areaClick', area: AreaStat }
 */

import { useCallback, useEffect, useState } from 'react';
import ZodiGlobe from '@/components/zodisphere/ZodiGlobe';
import type { AreaStat } from '@/lib/zodisphereService';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

function isAreaStatArray(v: unknown): v is AreaStat[] {
  return (
    Array.isArray(v) &&
    v.every(
      (a) =>
        a &&
        typeof a === 'object' &&
        typeof (a as AreaStat).area_id === 'string' &&
        typeof (a as AreaStat).display_name === 'string' &&
        Number.isFinite((a as AreaStat).center_lat) &&
        Number.isFinite((a as AreaStat).center_lng)
    )
  );
}

export default function ZodisphereEmbedPage() {
  const [areas, setAreas] = useState<AreaStat[]>([]);

  useEffect(() => {
    const handle = (event: MessageEvent | Event) => {
      const raw = (event as MessageEvent).data;
      if (typeof raw !== 'string') return;
      try {
        const msg = JSON.parse(raw);
        if (msg?.type === 'zodisphere:data' && isAreaStatArray(msg.areas)) {
          setAreas(msg.areas);
        }
      } catch {
        // ignore non-JSON messages (e.g. devtools chatter)
      }
    };
    // iOS RN WebView delivers on window, Android on document.
    window.addEventListener('message', handle);
    document.addEventListener('message', handle as EventListener);
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'zodisphere:ready' }));
    return () => {
      window.removeEventListener('message', handle);
      document.removeEventListener('message', handle as EventListener);
    };
  }, []);

  const handleAreaClick = useCallback((area: AreaStat) => {
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'zodisphere:areaClick', area }));
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, #131a38 0%, #0a0e1a 55%, #06080f 100%)',
      }}
    >
      <ZodiGlobe areas={areas} onAreaClick={handleAreaClick} />
    </div>
  );
}
