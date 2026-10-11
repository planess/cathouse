import type { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { Session } from '@app/models/db/session';

import type { ActiveSession } from '../models/active-session';

/**
 * Loads all sessions of a user from the `sessions` collection.
 *
 * @param userID - Owner of the sessions.
 * @param currentToken - Token of the current request, used to mark its session.
 * @returns Sessions ordered from newest to oldest.
 */
export async function getUserSessions(
  userID: ObjectId,
  currentToken: string | undefined,
): Promise<ActiveSession[]> {
  const dbClient = await clientPromise;
  const sessions = await dbClient
    .db()
    .collection<Session>(DbTables.sessions)
    .find({ userID })
    .sort({ createdAt: -1 })
    .toArray();

  return sessions.map((session) => ({
    id: session._id.toString(),
    createdAt: session.createdAt.toISOString(),
    isCurrent: session.token === currentToken,
  }));
}
