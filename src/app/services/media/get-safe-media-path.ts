export function getSafeMediaPath(value: string | null): string | null {
  if (value === null || value === '') {
    return '';
  }

  const segments = value.split('/');

  if (
    segments.some(
      (segment) =>
        segment === '' ||
        segment === '.' ||
        segment === '..' ||
        segment.includes('\\\\'),
    )
  ) {
    return null;
  }

  return segments.map(encodeURIComponent).join('/');
}
