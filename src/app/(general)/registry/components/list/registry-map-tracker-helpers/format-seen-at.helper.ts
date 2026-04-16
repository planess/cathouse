export function formatSeenAt(
  observedAt: string | null,
  locale: string,
  fallback: string,
) {
  if (observedAt === null || observedAt.trim() === '') {
    return fallback;
  }

  const parsed = new Date(observedAt);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}
