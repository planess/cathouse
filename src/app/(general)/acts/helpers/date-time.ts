export function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

const pad = (num: number) => num.toString().padStart(2, '0');

export function toDateTimeLocalValue(value: Date): string {
  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  const hours = pad(value.getHours());
  const minutes = pad(value.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
