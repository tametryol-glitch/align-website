/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // CesiumJS's KmlDataSource/exportKml import a @zip.js/zip.js subpath
    // ("./lib/zip-no-worker.js") that the installed zip.js version neither
    // ships nor exports. Zodisphere never loads KML, so stub that single import
    // to an empty module. Scoped to this exact path — no other package's
    // resolution is affected. Lets the Cesium chunk build cleanly.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@zip.js/zip.js/lib/zip-no-worker.js': false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'wxzwdvlbcsmnkhjmkgkx.supabase.co' },
      { protocol: 'https', hostname: 'media*.giphy.com' },
      { protocol: 'https', hostname: 'i.giphy.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      // COOP/COEP for the video editor route (enables SharedArrayBuffer for FFmpeg-wasm)
      {
        source: '/cosmic-video/edit',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Delegate the media features the embedded YouTube player needs to the
          // youtube.com origin. Without this, a present Permissions-Policy makes
          // these default to "self only", so the cross-origin YouTube iframe is
          // denied encrypted-media/autoplay/etc. and fails with "Video player
          // configuration error (153)".
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(self), camera=(self), autoplay=(self "https://www.youtube.com"), encrypted-media=(self "https://www.youtube.com"), fullscreen=(self "https://www.youtube.com"), picture-in-picture=(self "https://www.youtube.com")' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.youtube.com https://s.ytimg.com https://www.googletagmanager.com https://js.stripe.com https://unpkg.com https://dev.virtualearth.net https://*.virtualearth.net",
              "style-src 'self' 'unsafe-inline' https://unpkg.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: https://wxzwdvlbcsmnkhjmkgkx.supabase.co",
              "font-src 'self' data:",
              // Agora voice/video SDK reaches its gateway + SD-RTN edge over
              // HTTPS and WebSocket. Without these the browser's CSP silently
              // blocks every Agora connection, so the web client can never join
              // the channel — voice/video calls to/from the app never connect.
              "connect-src 'self' data: blob: https://wxzwdvlbcsmnkhjmkgkx.supabase.co wss://wxzwdvlbcsmnkhjmkgkx.supabase.co https://align-api-v2-production.up.railway.app https://api.giphy.com https://api.revenuecat.com https://api.stripe.com https://www.google-analytics.com https://www.googletagmanager.com https://api.cesium.com https://assets.ion.cesium.com https://*.cesium.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://tiles.stadiamaps.com https://tiles.arcgisonline.com https://*.arcgisonline.com https://dev.virtualearth.net https://*.virtualearth.net https://basemaps.cartocdn.com https://*.cartocdn.com https://*.agora.io wss://*.agora.io https://*.sd-rtn.com wss://*.sd-rtn.com https://*.agoraio.cn wss://*.agoraio.cn",
              "frame-src 'self' blob: https://www.youtube.com https://js.stripe.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
