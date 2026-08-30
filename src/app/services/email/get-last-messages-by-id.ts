import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import type { EmailMessageDocument, EmailThreadDocument } from './document-types';

export async function getLastMessagesById(threads: EmailThreadDocument[]) {
  const messageIds = threads.map((thread) => thread.lastMessageId);

  if (messageIds.length === 0) {
    return new Map<string, EmailMessageDocument>();
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const messages = await db
    .collection<EmailMessageDocument>(DbTables.emailMessages)
    .find({ _id: { $in: messageIds } })
    .toArray();

  return new Map(messages.map((message) => [message._id.toString(), message]));
}
