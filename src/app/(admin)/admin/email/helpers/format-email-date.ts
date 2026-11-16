/**
 * Formats an email date as a short date and time in the given locale.
 *
 * @param value - ISO date string; empty or invalid values return an empty string.
 * @param locale - BCP 47 locale used for formatting (the current UI language).
 */
export function formatEmailDate(value: string, locale: string): string {
  if (value.length === 0) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
