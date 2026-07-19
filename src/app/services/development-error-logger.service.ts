import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';

type DevelopmentErrorMetadata = Record<
  string,
  boolean | number | string | null | undefined
>;

function formatError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
    stack: undefined,
  };
}

export async function logDevelopmentError(
  scope: string,
  error: unknown,
  metadata: DevelopmentErrorMetadata = {},
) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const formattedError = formatError(error);
  const entry = [
    `time=${new Date().toISOString()}`,
    `scope=${scope}`,
    `name=${formattedError.name}`,
    `message=${formattedError.message}`,
    `metadata=${JSON.stringify(metadata)}`,
    formattedError.stack ?? '',
    '',
  ].join('\n');

  try {
    await appendFile(join(process.cwd(), 'error.txt'), `${entry}\n`, 'utf8');
  } catch {
    // Logging should never become the reason a request fails.
  }
}
