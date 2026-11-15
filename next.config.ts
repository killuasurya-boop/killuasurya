import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  // Client material uploads (max 20 MB per file, checked again in the action and by the storage bucket).
  experimental: { serverActions: { bodySizeLimit: '21mb' } },
  async headers() {
    return [
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ] },
      ...['/api/:path*', '/auth/:path*'].map((source) => ({ source, headers: [
        { key: 'Cache-Control', value: 'private, no-store' },
        { key: 'X-Robots-Tag', value: 'noindex' },
      ] })),
    ];
  },
  // V5: `/workspace` is the staff entry URL. Until auth exists it forwards to the demo workspace (`/os`).
  async redirects() {
    return [{ source: '/workspace', destination: '/os', permanent: false }];
  },
};

export default nextConfig;
