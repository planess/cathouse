'use server';

import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
import { decrypt } from '@app/helpers/decrypt';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import { getCurrentUser } from '@app/hooks/get-current-user';
import clientPromise from '@app/ins/mongo-client';
import type { User } from '@app/models/db/user';
import type { ServerActionResponse } from '@app/models/server-action-response.server';

import type { ChangePasswordPayload } from '../models/change-password-payload';
import { PASSWORD_MIN_LENGTH } from '../models/password-min-length';

/**
 * Replaces the current user's password. The new password must be repeated,
 * meet the minimal length, and differ from the current one; it is hashed the
 * same way as on registration.
 *
 * @param payload - Encrypted new password and its confirmation.
 * @returns `ok` when the password was changed, otherwise errors keyed by `password`, `confirmation`, or `root`.
 */
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ServerActionResponse> {
  const t = await getTranslations('profilepage.security.password');
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { status: 'declined' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const securityRecord = await db
    .collection(DbTables.encryption)
    .findOne({}, { sort: { createdAt: -1 } });
  const privateKey = securityRecord?.privateKey as string | undefined;

  if (!privateKey) {
    console.error('Password change failed: no private key found');

    return { status: 'error', errors: { root: [t('error.common')] } };
  }

  let password: string;
  let confirmation: string;

  try {
    password = decrypt(privateKey, payload.passHash);
    confirmation = decrypt(privateKey, payload.confirmationHash);
  } catch (error) {
    console.error('Password change failed: decryption error', error);

    return { status: 'error', errors: { root: [t('error.processing')] } };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      status: 'error',
      errors: { password: [t('error.minLength', { n: PASSWORD_MIN_LENGTH })] },
    };
  }

  if (password !== confirmation) {
    return {
      status: 'error',
      errors: { confirmation: [t('error.mismatch')] },
    };
  }

  const users = db.collection<User>(DbTables.users);
  const user = await users.findOne({ _id: currentUser.id });

  if (!user) {
    return { status: 'declined' };
  }

  const hash = await hashBlake2(password, `!!${user.email}`);

  if (hash === user.password) {
    return {
      status: 'error',
      errors: { password: [t('error.sameAsCurrent')] },
    };
  }

  try {
    await users.updateOne({ _id: user._id }, { $set: { password: hash } });
  } catch (error) {
    console.error('Password change failed: unable to save user', error);

    return { status: 'error', errors: { root: [t('error.common')] } };
  }

  return { status: 'ok' };
}
