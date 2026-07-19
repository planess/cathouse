import { logDevelopmentError } from '../development-error-logger.service';

export async function logEmailServiceError(
  scope: string,
  error: unknown,
  metadata: Record<string, boolean | number | string | null | undefined> = {},
) {
  await logDevelopmentError(`email.service.${scope}`, error, metadata);
}
