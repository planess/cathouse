import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import { createUnreadIncomingMessageStages } from './create-unread-incoming-message-stages';

import type { EmailMessageDocument } from './document-types';

/**
 * Finds which of the given threads contain at least one incoming message the
 * user has not read yet.
 *
 * @param threadIds - Threads to check.
 * @param userId - Id of the user whose read states are checked.
 * @returns Ids of threads with unread messages.
 */
export async function getUnreadThreadIds(
  threadIds: ObjectId[],
  userId: string,
): Promise<Set<string>> {
  if (!ObjectId.isValid(userId)) {
    throw new Error('Invalid user id.');
  }

  if (threadIds.length === 0) {
    return new Set();
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const rows = await db
    .collection<EmailMessageDocument>(DbTables.emailMessages)
    .aggregate<{ _id: ObjectId }>([
      { $match: { threadId: { $in: threadIds } } },
      ...createUnreadIncomingMessageStages(new ObjectId(userId)),
      { $group: { _id: '$threadId' } },
    ])
    .toArray();

  return new Set(rows.map(({ _id }) => _id.toString()));
}
