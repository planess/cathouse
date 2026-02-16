export function formatDisplayName(
  value: string | undefined | null,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const firstChar = trimmed.charAt(0).toUpperCase();
  const rest = trimmed.slice(1).toLowerCase();

  return `${firstChar}${rest}`;
}
