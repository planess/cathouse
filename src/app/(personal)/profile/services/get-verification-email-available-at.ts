import type { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { User } from '@app/models/db/user';

import { VERIFICATION_EMAIL_COOLDOWN_MS } from '../models/verification-email-cooldown';

/**
 * Finds when the user may request the next email verification letter.
 *
 * @param userID - User who requests the letter.
 * @returns ISO time when sending is allowed again, or `null` when it is allowed now.
 */
export async function getVerificationEmailAvailableAt(
  userID: ObjectId,
): Promise<string | null> {
  const dbClient = await clientPromise;
  const user = await dbClient
    .db()
    .collection<User>(DbTables.users)
    .findOne({ _id: userID }, { projection: { emailVerificationSentAt: 1 } });
  const sentAt = user?.emailVerificationSentAt;

  if (!sentAt) {
    return null;
  }

  const availableAt = sentAt.getTime() + VERIFICATION_EMAIL_COOLDOWN_MS;

  return availableAt > Date.now() ? new Date(availableAt).toISOString() : null;
}
