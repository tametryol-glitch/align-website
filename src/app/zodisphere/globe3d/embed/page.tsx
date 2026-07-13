'use client';

/**
 * Zodisphere 3D embed — chromeless bootstrap for the mobile WebView.
 *
 * Same privacy architecture as /zodisphere/embed: this route is public but
 * holds NO auth tokens and receives NO session. The React Native app injects
 * the user's birth details (which the app already holds) via postMessage; the
 * page hydrates the client-side auth store with that profile so the existing
 * globe3d experience renders unchanged. The natal-chart fetch it triggers uses
 * the same public /charts/natal endpoint as the web calculators.
 *
 * Protocol:
 *   page -> RN : { type: 'zodisphere3d:ready' }
 *   RN -> page : { type: 'zodisphere3d:init', profile: { email, birth_date,
 *                  birth_time, birth_location, latitude, longitude, timezone } }
 *
 * Access is still gated by isZodisphere3dEnabled(profile.email) inside the
 * globe3d page — the same flag + allowlist as the web rollout.
 */

import { useEffect, useRef, useState } from 'react';
import { useAuthStore, type UserProfile } from '@/stores/authStore';
import Zodisphere3dPrototypePage from '../page';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

interface InjectedProfile {
  email: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
}

function isInjectedProfile(v: unknown): v is InjectedProfile {
  if (!v || typeof v !== 'object') return false;
  const p = v as InjectedProfile;
  const okStr = (x: unknown) => x === null || x === undefined || typeof x === 'string';
  const okNum = (x: unknown) => x === null || x === undefined || Number.isFinite(x);
  return okStr(p.email) && okStr(p.birth_date) && okStr(p.birth_time) &&
    okStr(p.birth_location) && okNum(p.latitude) && okNum(p.longitude) && okStr(p.timezone);
}

export default function Zodisphere3dEmbedPage() {
  const [injected, setInjected] = useState(false);
  const injectedRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    const apply = (p: InjectedProfile) => {
      // Minimal UserProfile shape — only what the globe3d page reads.
      const profile = {
        id: 'embed',
        display_name: '',
        username: null,
        email: p.email ?? null,
        avatar_url: null,
        bio: '',
        sun_sign: null,
        moon_sign: null,
        rising_sign: null,
        birth_date: p.birth_date ?? null,
        birth_time: p.birth_time ?? null,
        birth_location: p.birth_location ?? null,
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
        timezone: p.timezone ?? null,
      } as UserProfile;
      injectedRef.current = profile;
      useAuthStore.getState().setProfile(profile);
      useAuthStore.getState().setLoading(false);
      setInjected(true);
    };

    const handle = (event: MessageEvent | Event) => {
      const raw = (event as MessageEvent).data;
      if (typeof raw !== 'string') return;
      try {
        const msg = JSON.parse(raw);
        if (msg?.type === 'zodisphere3d:init' && isInjectedProfile(msg.profile)) {
          apply(msg.profile);
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    // iOS RN WebView delivers on window, Android on document.
    window.addEventListener('message', handle);
    document.addEventListener('message', handle as EventListener);
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'zodisphere3d:ready' }));

    // AuthProvider (root layout) wipes the profile when its session check
    // resolves to logged-out — re-apply the injected profile if that happens.
    const unsub = useAuthStore.subscribe((s) => {
      if (!s.profile && injectedRef.current) {
        useAuthStore.getState().setProfile(injectedRef.current);
      }
    });

    return () => {
      window.removeEventListener('message', handle);
      document.removeEventListener('message', handle as EventListener);
      unsub();
    };
  }, []);

  if (!injected) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, #131a38 0%, #0a0e1a 55%, #06080f 100%)' }}
      >
        <div className="text-white/60 text-sm animate-pulse">Preparing your 3D Earth…</div>
      </div>
    );
  }

  return <Zodisphere3dPrototypePage />;
}
