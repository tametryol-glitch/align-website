/** @type {import('next').NextConfig} */
const nextConfig = {
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
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(self), camera=(self)' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.youtube.com https://s.ytimg.com https://www.googletagmanager.com https://js.stripe.com https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://unpkg.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: https://wxzwdvlbcsmnkhjmkgkx.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' data: blob: https://wxzwdvlbcsmnkhjmkgkx.supabase.co wss://wxzwdvlbcsmnkhjmkgkx.supabase.co https://align-api-v2-production.up.railway.app https://api.giphy.com https://api.revenuecat.com https://api.stripe.com https://www.google-analytics.com https://www.googletagmanager.com",
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
