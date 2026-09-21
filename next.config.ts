import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://dunastravel-backend-seven.vercel.app/api').replace(/\/$/, '');
const destinationApiUrl = rawApiUrl.endsWith('/api') ? `${rawApiUrl}/:path*` : `${rawApiUrl}/api/:path*`;

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'date-fns', '@tanstack/react-table', 'sonner'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'dunastravel-backend-seven.vercel.app' }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: destinationApiUrl,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

