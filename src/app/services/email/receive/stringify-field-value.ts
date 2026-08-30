export function stringifyFieldValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => stringifyFieldValue(entry))
      .filter((entry) => entry.length > 0)
      .join('\n');
  }

  if (value === null || value === undefined) {
    return '';
  }

  return JSON.stringify(value);
}
