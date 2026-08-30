export function parseMailgunHeaders(value: string | undefined) {
  const headers: Record<string, string | string[]> = {};

  if (value === undefined || value.trim().length === 0) {
    return headers;
  }

  try {
    const parsedHeaders = JSON.parse(value) as unknown;

    if (Array.isArray(parsedHeaders)) {
      for (const entry of parsedHeaders) {
        if (
          Array.isArray(entry) &&
          typeof entry[0] === 'string' &&
          typeof entry[1] === 'string'
        ) {
          const existingHeader = headers[entry[0]];

          if (existingHeader === undefined) {
            headers[entry[0]] = entry[1];
          } else if (Array.isArray(existingHeader)) {
            existingHeader.push(entry[1]);
          } else {
            headers[entry[0]] = [existingHeader, entry[1]];
          }
        }
      }
    }
  } catch {
    headers['message-headers'] = value;
  }

  return headers;
}
