export function parseHeaderDate(value: string | undefined): Date {
  if (value === undefined || value.trim().length === 0) {
    return new Date();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}
