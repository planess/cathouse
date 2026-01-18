import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'pub-b01557542cb14ab3a2c20e32a7373072.r2.dev',
        protocol: 'https',
        pathname: '/**',
        search: '',
      },
    ],
  },
  outputFileTracingIncludes: {
    '/**': ['./email-templates/**'],
  },
};

const intlPlugin = createNextIntlPlugin();

export default intlPlugin(nextConfig);
