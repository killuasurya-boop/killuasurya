import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  // Client material uploads (max 20 MB per file, checked again in the action and by the storage bucket).
  experimental: { serverActions: { bodySizeLimit: '21mb' } },
  // V5: `/workspace` is the staff entry URL. Until auth exists it forwards to the demo workspace (`/os`).
  async redirects() {
    return [{ source: '/workspace', destination: '/os', permanent: false }];
  },
};

export default nextConfig;
