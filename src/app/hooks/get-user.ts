import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import { Profile } from '@app/models/db/profile';
import type { Session } from '@app/models/db/session';
import type { User } from '@app/models/db/user';

interface AA {
  id: ObjectId;
  email: string;
  emailVerified: boolean;
  scopes: string[];
  isActive: boolean;
  createdAt: Date;
  profile: {
    firstName: string | null;
    lastName: string | null;
  };
}

type ServerAuthState = AA | null;

/**
 * Server-side function to get user authentication information
 * Use this in server components and server actions
 */
export async function getUser(): Promise<ServerAuthState> {
  try {
    const cookieStore = await cookies();
console.log('--cookieStore', cookieStore);
    // Get authentication token from cookies or headers
    const token = cookieStore.get('token')?.value ?? null;
console.log('--token', token);
    if (!token) {
      return null;
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();

    const session = (await db
      .collection(DbTables.sessions)
      .findOne({ token })) as Session | null;

    if (!session) {
      return null;
    }
console.log('--session', session);
    const user = (await db
      .collection(DbTables.users)
      .findOne({ _id: session.userID })) as User | null;

    if (!user) {
      // it is not supposed to exist session but not user
      // console.error('Session exists but user does not:', session);
      return null;
    }

    const profile = (await db
      .collection(DbTables.profiles)
      .findOne({ _id: user._id })) as Profile | null;

    if (!profile) {
      // Handle missing profile case
      console.error('User profile not found for user:', user);
    }

    return {
      id: user._id,
      email: user.email,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      scopes: [],
      createdAt: user.createdAt,
      profile: {
        firstName: profile?.firstName ?? null,
        lastName: profile?.lastName ?? null,
      },
    } as ServerAuthState;
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
export async function getCurrentUser(): Promise<ServerAuthState | null> {
  const user = await getUser();

  return user;
}
