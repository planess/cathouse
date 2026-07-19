export function getHeaderValue(
  headers: Record<string, string | string[]>,
  headerName: string,
) {
  const matchingEntry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === headerName.toLowerCase(),
  );
  const value = matchingEntry?.[1];

  return Array.isArray(value) ? value.join(' ') : value;
}
