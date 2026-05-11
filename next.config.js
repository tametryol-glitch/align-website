/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wxzwdvlbcsmnkhjmkgkx.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
