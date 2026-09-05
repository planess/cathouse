import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

let imageHostname = process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL;

if (imageHostname === undefined) {
  throw new Error('CLOUDFLARE_R2_ANIMAL_IMAGE_URL is not defined');
}

imageHostname = imageHostname.replace('https://', '');

const nextConfig: NextConfig = {
  /* config options here */
  // devIndicators: false,
  images: {
    remotePatterns: [
      {
        hostname: imageHostname,
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
