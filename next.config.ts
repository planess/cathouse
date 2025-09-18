import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // devIndicators: false,
};

const intlPlugin = createNextIntlPlugin();

export default intlPlugin(nextConfig);
