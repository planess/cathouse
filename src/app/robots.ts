import { isSearchIndexingAllowed } from './services/search-indexing.service';
import { getSiteUrl } from './services/site-url.service';

import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

/**
 * Builds `robots.txt`. Non-production deployments disallow everything; in production public pages are crawlable, while private areas
 * (admin, authentication, API, QR landing) are excluded.
 *
 * @returns The robots rules and sitemap location.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isSearchIndexingAllowed()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api/',
        '/signin',
        '/signup',
        '/reset-password',
        '/gotcha',
        '/unavailable',
        '/registry/create',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
