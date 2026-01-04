export function formatInputDate(value?: Date | null) {
  if (!value || Number.isNaN(value.getTime())) {
    return undefined;
  }

  return value.toISOString().slice(0, 10);
}
