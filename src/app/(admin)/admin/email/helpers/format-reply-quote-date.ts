export function formatReplyQuoteDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const formatted = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(date);

  return formatted.charAt(0).toLocaleUpperCase('uk-UA') + formatted.slice(1);
}
