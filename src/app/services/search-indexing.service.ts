/**
 * Tells whether the current deployment may be crawled and indexed by search engines.
 * Only environments that explicitly set `ALLOW_SEARCH_INDEXING=true` (production) are indexable;
 * every other environment stays hidden by default.
 *
 * @returns `true` when search engines are allowed to index this deployment.
 */
export function isSearchIndexingAllowed(): boolean {
  return process.env.ALLOW_SEARCH_INDEXING === 'true';
}
