import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { Profile } from '@app/models/db/profile';
import type { Session } from '@app/models/db/session';
import type { User } from '@app/models/db/user';
import type { ServerAuthState } from '@app/models/server-auth-state';

/**
 * Resolves a user from a server-issued session token.
 *
 * @param token - The session token to validate.
 * @returns The authenticated user, or `null` when the token is invalid.
 */
export async function getUserFromToken(
  token: string,
): Promise<ServerAuthState> {
  try {
    const dbClient = await clientPromise;
    const db = dbClient.db();
    const session = (await db
      .collection(DbTables.sessions)
      .findOne({ token })) as Session | null;

    if (!session) {
      return null;
    }

    const user = (await db
      .collection(DbTables.users)
      .findOne({ _id: session.userID })) as User | null;

    if (!user) {
      return null;
    }

    const profile = (await db
      .collection(DbTables.profiles)
      .findOne({ _id: user._id })) as Profile | null;

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
    };
  } catch {
    return null;
  }
}
