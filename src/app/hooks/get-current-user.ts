import type { ServerAuthState } from '@app/models/server-auth-state';

import { getUser } from './get-user';

/**
 * Resolves the authenticated user for the current browser-cookie request.
 *
 * @returns The authenticated user, or `null` when the request is unauthenticated.
 */
export async function getCurrentUser(): Promise<ServerAuthState> {
  return getUser();
}
