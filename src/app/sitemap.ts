import { isSearchIndexingAllowed } from './services/search-indexing.service';
import { getSiteUrl } from './services/site-url.service';

import type { MetadataRoute } from 'next';

const PUBLIC_PATHS = [
  '',
  '/acts',
  '/adoption',
  '/contacts',
  '/help',
  '/legal-info',
  '/location',
  '/offer',
  '/payments',
  '/privacy-policy',
  '/registry',
  '/reports',
  '/volunteers',
  '/work',
];

export const dynamic = 'force-dynamic';

/**
 * Builds `sitemap.xml` listing the public, indexable pages of the site.
 *
 * @returns Sitemap entries with absolute URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexingAllowed()) {
    return [];
  }

  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
