export function getYearRange(year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  return { start, end };
}
