import type { ServerAuthState } from '@app/models/server-auth-state';

import { getUser } from './get-user';
import { getUserFromToken } from './get-user-from-token';

/**
 * Resolves a user for an API request using the app Bearer token or browser cookie.
 *
 * @param request - The incoming API request.
 * @returns The authenticated user, or `null` when the request has no valid authentication.
 */
export async function getUserFromRequest(
  request: Request,
): Promise<ServerAuthState> {
  if (request.headers.get('x-client-type') !== 'app') {
    return getUser();
  }

  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  return token ? getUserFromToken(token) : null;
}
