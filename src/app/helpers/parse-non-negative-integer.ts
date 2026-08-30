export function parseNonNegativeInteger(
  value: string | null,
  fallback: number,
) {
  if (value === null) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null;
}
