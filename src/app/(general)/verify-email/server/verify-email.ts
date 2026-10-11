import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { User } from '@app/models/db/user';

import type { VerifyEmailResult } from '../models/verify-email-result';

/**
 * Confirms a user's email from the verification link. The `code` and `email`
 * must match `users.emailVerificationCode` and `users.email`. A signed-in
 * visitor must be the owner of the email; anonymous visitors are allowed, as
 * the link may be opened in another browser. On success `emailVerified` is
 * set and the code is removed; already verified users are not processed.
 *
 * @param code - The `code` search parameter of the link.
 * @param email - The `email` search parameter of the link.
 * @returns Outcome of the verification.
 */
export async function verifyEmail(
  code: string | undefined,
  email: string | undefined,
): Promise<VerifyEmailResult> {
  if (!code || !email) {
    return 'invalid';
  }

  const currentUser = await getUser();

  if (currentUser && currentUser.email !== email) {
    return 'wrong-user';
  }

  const dbClient = await clientPromise;
  const users = dbClient.db().collection<User>(DbTables.users);
  const user = await users.findOne({ email });

  if (!user) {
    return 'invalid';
  }

  if (user.emailVerified) {
    return 'already-verified';
  }

  if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
    return 'invalid';
  }

  // The filter repeats the checks so a concurrent request cannot verify twice
  const { modifiedCount } = await users.updateOne(
    {
      _id: user._id,
      email,
      emailVerificationCode: code,
      emailVerified: { $ne: true },
    },
    {
      $set: { emailVerified: true },
      $unset: { emailVerificationCode: '' },
    },
  );

  return modifiedCount === 1 ? 'verified' : 'already-verified';
}
