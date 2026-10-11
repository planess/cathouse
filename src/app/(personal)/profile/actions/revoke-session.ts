'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-current-user';
import clientPromise from '@app/ins/mongo-client';
import type { Session } from '@app/models/db/session';
import type { ServerActionResponse } from '@app/models/server-action-response.server';

/**
 * Deletes one of the current user's sessions other than the session of the
 * current request, which cannot be revoked.
 *
 * @param sessionId - Identifier of the session to revoke.
 * @returns `ok` when the session was removed, otherwise an error status.
 */
export async function revokeSession(
  sessionId: string,
): Promise<ServerActionResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return { status: 'declined' };
  }

  if (!ObjectId.isValid(sessionId)) {
    return { status: 'error' };
  }

  const cookieStore = await cookies();
  const dbClient = await clientPromise;
  const { deletedCount } = await dbClient
    .db()
    .collection<Session>(DbTables.sessions)
    .deleteOne({
      _id: new ObjectId(sessionId),
      userID: user.id,
      // The current session cannot be revoked from the profile
      token: { $ne: cookieStore.get('token')?.value ?? '' },
    });

  if (deletedCount === 0) {
    return { status: 'error' };
  }

  revalidatePath('/profile/sessions');

  return { status: 'ok' };
}
