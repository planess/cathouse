const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatDuration(inputSeconds: number): string {
  const total = Number.isFinite(inputSeconds)
    ? Math.max(0, Math.floor(inputSeconds))
    : 0;

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;

  const parts: string[] = [];

  if (hours) {
    parts.push(pad2(hours));
  }

  parts.push(pad2(minutes), pad2(seconds));

  return parts.join(':');
}
