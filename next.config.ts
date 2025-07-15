import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  // devIndicators: false,
};

const intlPlugin = createNextIntlPlugin();

export default intlPlugin(nextConfig);
