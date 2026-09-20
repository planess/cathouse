import { cookies } from 'next/headers';

import type { ServerAuthState } from '@app/models/server-auth-state';

import { getUserFromToken } from './get-user-from-token';

/**
 * Resolves a user from the current request's browser session cookie.
 *
 * @returns The authenticated user, or `null` when no valid cookie session exists.
 */
export async function getUser(): Promise<ServerAuthState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    return token ? getUserFromToken(token) : null;
  } catch {
    return null;
  }
}
