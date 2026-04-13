export function resolveHistoryBackHref(referer: string | null) {
  if (!referer) {
    return '/registry';
  }

  try {
    const url = new URL(referer, 'http://localhost');

    if (url.pathname === '/registry') {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch (error) {
    console.warn('Failed to parse referer for registry back link', error);
  }

  return '/registry';
}
