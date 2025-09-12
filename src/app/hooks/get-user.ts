import { cookies } from 'next/headers';

import clientPromise from '@app/ins/mongo-client';

import type { User } from '../models/user';

export type ServerAuthState = User | null;

/**
 * Server-side function to get user authentication information
 * Use this in server components and server actions
 */
export async function getUser(): Promise<ServerAuthState> {
  try {
    const cookieStore = await cookies();

    // Get authentication token from cookies or headers
    const token = cookieStore.get('token')?.value ?? null;

    if (!token) {
      return null;
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();

    const session = await db.collection('sessions').findOne({ token });

    if (!session) {
      return null;
    }

    const user = await db.collection('users').findOne({ id: session.userId });

    if (!user) {
      // it is not supposed to exist session but not user
      // console.error('Session exists but user does not:', session);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: session.createdAt,
    };
  } catch {
    // Log error for debugging (remove in production or use proper logging)
    // console.error('Server authentication check failed:', error);
    return null;
  }
}

/**
 * Convenience function to check if user is authenticated on the server
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();

  return user !== null;
}

/**
 * Convenience function to get current user on the server
 */
export async function getCurrentUser(): Promise<User | null> {
  const user = await getUser();

  return user;
}
