export function toIsoString(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}
