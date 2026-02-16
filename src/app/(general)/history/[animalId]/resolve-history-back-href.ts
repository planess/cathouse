export function resolveHistoryBackHref(referer: string | null) {
  if (!referer) {
    return '/history';
  }

  try {
    const url = new URL(referer, 'http://localhost');

    if (url.pathname === '/history') {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch (error) {
    console.warn('Failed to parse referer for history back link', error);
  }

  return '/history';
}
