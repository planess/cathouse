'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { User } from '@app/models/db/user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasAnyPermission } from '@app/services/access-verification.service';
import { sendVerificationLetter } from '@app/services/send-verification-letter';

export async function softDeleteUser(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return { success: false, message: 'Invalid user id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db
    .collection(DbTables.users)
    .updateOne({ _id: new ObjectId(userId) }, { $set: { isActive: false } });

  revalidatePath('/admin/users');

  return { success: true, message: 'User deactivated.' };
}

/**
 * Sends the email verification letter to a user from the admin panel. The
 * same cooldown as for the "Verify" button on the profile page applies.
 *
 * @param userId - Identifier of the user in the `users` collection.
 * @returns `success` and a message to show to the admin.
 */
export async function sendUserVerificationEmail(userId: string) {
  // Throws for anonymous requests
  const allowed = await hasAnyPermission([
    SYSTEM_PERMISSIONS.ROLE_ASSIGN,
  ]).catch(() => false);

  if (!allowed) {
    return { success: false, message: 'Not allowed.' };
  }

  if (!ObjectId.isValid(userId)) {
    return { success: false, message: 'Invalid user id.' };
  }

  const dbClient = await clientPromise;
  const user = await dbClient
    .db()
    .collection<User>(DbTables.users)
    .findOne(
      { _id: new ObjectId(userId) },
      { projection: { email: 1, emailVerified: 1 } },
    );

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  if (user.emailVerified) {
    return { success: false, message: 'Email is already verified.' };
  }

  const result = await sendVerificationLetter(user._id, user.email);

  if (result === 'declined') {
    return {
      success: false,
      message: 'A letter was sent recently. Try again later.',
    };
  }

  if (result === 'failed') {
    return { success: false, message: 'Unable to send the letter.' };
  }

  return { success: true, message: 'Letter sent.' };
}
