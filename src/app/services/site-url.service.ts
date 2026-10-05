const DEFAULT_SITE_URL = 'http://localhost:3000';

/**
 * Resolves the canonical public origin of the site, without a trailing slash.
 * Reads `NEXT_PUBLIC_SITE_URL` and falls back to the local development origin.
 *
 * @returns The absolute site origin, e.g. `https://example.org`.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  return (configured || DEFAULT_SITE_URL).replace(/\/+$/, '');
}
