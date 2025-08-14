import { cookies, headers } from 'next/headers';

import type { User } from './use-user';

export interface ServerAuthState {
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * Server-side function to get user authentication information
 * Use this in server components and server actions
 */
export async function getUser(): Promise<ServerAuthState> {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();

    // Get authentication token from cookies or headers
    const token =
      cookieStore.get('authToken')?.value ??
      headersList.get('authorization')?.replace('Bearer ', '') ??
      null;

    if (token === null || token === '') {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    // TODO: Implement token validation with your backend
    // const user = await validateToken(token);

    // For now, return not authenticated
    // Replace this with your actual authentication logic
    return {
      user: null,
      isAuthenticated: false,
    };
  } catch {
    // Log error for debugging (remove in production or use proper logging)
    // console.error('Server authentication check failed:', error);
    return {
      user: null,
      isAuthenticated: false,
    };
  }
}

/**
 * Convenience function to check if user is authenticated on the server
 */
export async function isAuthenticated(): Promise<boolean> {
  const { isAuthenticated } = await getUser();

  return isAuthenticated;
}

/**
 * Convenience function to get current user on the server
 */
export async function getCurrentUser(): Promise<User | null> {
  const { user } = await getUser();

  return user;
}
