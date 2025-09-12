'use server';

import { ObjectId } from 'mongodb';
import { getTranslations } from 'next-intl/server';
import { string, ZodError } from 'zod';

import { DbTables } from '@app/enum/db-tables';
import { decrypt } from '@app/helpers/decrypt';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import clientPromise from '@app/ins/mongo-client';
import { ResponseErrors } from '@app/models/response-errors.server';
import { ServerActionResponse } from '@app/models/server-action-response.server';

const minPasswordLength = 6;

export async function changePassword(
  code: string,
  passHash: string,
): Promise<ServerActionResponse> {
  const t = await getTranslations('authorization');

  // 1. Find user by email
  const dbClient = await clientPromise;
  const db = dbClient.db();

  let urp;

  try {
    urp = await db.collection(DbTables.usersRestorePasswords).findOne({ code });
  } catch (error: unknown) {
    console.error('Database error:', error);
    return {
      status: 'error',
    };
  }

  if (urp === null) {
    return { status: 'error', errors: { root: ['Invalid or expired code'] } };
  }

  // 2. Convert passCode to passHash
  const dbRecord = await db
    .collection(DbTables.encryption)
    .findOne({}, { sort: { createdAt: -1 } });
  const privateKey = dbRecord?.privateKey as string;

  if (!privateKey) {
    return {
      status: 'error',
      errors: { root: ['No private key found for decryption'] },
    };
  }

  let originPassword: string;

  try {
    originPassword = decrypt(privateKey, passHash);
  } catch (error) {
    return {
      status: 'error',
      errors: { root: ['Failed to decrypt password'] },
    };
  }

  // 3. Validate password
  try {
    originPassword = string()
      .min(
        minPasswordLength,
        t('form.validation.minPasswordLength', { n: minPasswordLength }),
      )
      .parse(originPassword);
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = {} as ResponseErrors;

      for (const { path, message } of error.issues) {
        const key = 'passHash';//path.join('.');

        errors[key] ??= [];
        errors[key].push(message);
      }

      return { status: 'error', errors };
    }

    throw error;
  }

  let user;

  try {
    user = await db
      .collection(DbTables.users)
      .findOne({ _id: urp.userID as ObjectId });
  } catch (error) {
    console.error('Error finding user:', error);
    return { status: 'error' };
  }

  if (!user) {
    return { status: 'error', errors: { root: ['User not found'] } };
  }

  const hash = await hashBlake2(originPassword, `!!${user.email}`);

  // 4. Update user's password
  try {
    await db
      .collection(DbTables.users)
      .updateOne(
        { _id: urp.userID as ObjectId },
        { $set: { password: hash } },
        { upsert: false },
      );
  } catch (error) {
    console.error('Error updating password:', error);
    return { status: 'error' };
  }

  // 5. Delete temporary restore record
  try {
    await db.collection(DbTables.usersRestorePasswords).deleteOne({ code });
  } catch (error) {
    console.error('Error deleting restore record:', error);

    return { status: 'ok' };
  }

  return { status: 'ok' };
}
