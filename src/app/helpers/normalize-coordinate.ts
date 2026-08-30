export function normalizeCoordinate(value: number) {
  return Math.round(value * 100000) / 100000;
}
