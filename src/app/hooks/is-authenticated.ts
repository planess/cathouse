import { getUser } from './get-user';

/**
 * Determines whether the current browser-cookie request is authenticated.
 *
 * @returns Whether the request has an authenticated user.
 */
export async function isAuthenticated(): Promise<boolean> {
  return (await getUser()) !== null;
}
