import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://dunastravel-backend-seven.vercel.app/api' : 'http://localhost:5000/api')).replace(/\/$/, '');
const destinationApiUrl = rawApiUrl.endsWith('/api') ? `${rawApiUrl}/:path*` : `${rawApiUrl}/api/:path*`;

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'date-fns', '@tanstack/react-table', 'sonner'],
  },
  turbopack: {
    root: path.resolve(__dirname),
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
};

export default withNextIntl(nextConfig);

