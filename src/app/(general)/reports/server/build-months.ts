export function buildMonths<T extends { month: number }>(
  totals: T[],
  factory: (month: number) => Omit<T, 'month'>,
): T[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const found = totals.find((item) => item.month === month);

    return found ?? ({ month, ...factory(month) } as T);
  });
}
