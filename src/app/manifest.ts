import type { MetadataRoute } from 'next';

// =============================================================================
// Web App Manifest — served at /manifest.webmanifest
// =============================================================================
// Without this, iOS "Add to Home Screen" produces a plain Safari BOOKMARK
// rather than a Home Screen web app: tapping the icon reopens a normal Safari
// tab, navigator.standalone stays false, and window.PushManager never exists.
// Which means web push on iPhone was impossible no matter how exactly someone
// followed the instructions — the missing piece was here, not with them.
//
// display: 'standalone' is the load-bearing field. Apple gates Web Push
// (iOS 16.4+) on the site being a Home Screen web app, and that is what makes
// it one. It also gets Android an installable PWA instead of a shortcut.
// =============================================================================

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Align — AI Astrology & Cosmic Compatibility',
    short_name: 'Align',
    description:
      'Natal charts, compatibility, 26+ AI readings, tarot, numerology, and a cosmic community.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#141826',
    theme_color: '#141826',
    categories: ['lifestyle', 'social', 'entertainment'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
