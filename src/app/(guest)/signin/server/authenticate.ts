'use server';

import { createSign } from 'node:crypto';

import { cookies as nextCookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { email, object, string, ZodError } from 'zod';

import { DbTables } from '@app/enum/db-tables';
import { decrypt } from '@app/helpers/decrypt';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import clientPromise from '@app/ins/mongo-client';
import { ResponseErrors } from '@app/models/response-errors.server';
import { ServerActionResponse } from '@app/models/server-action-response.server';

import { ServerFormData } from '../../models/server-form-data';

export async function authenticate(
  rawData: ServerFormData,
): Promise<ServerActionResponse> {
  let identifier: string;
  let passHash: string;

  const t = await getTranslations('authorization');

  const AuthRules = object({
    identifier: email(t('form.validation.email')),
    passHash: string(),
  }).required();

  try {
    ({ identifier, passHash } = AuthRules.parse(rawData));
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = {} as ResponseErrors;

      for (const { path, message } of error.issues) {
        const key = path.join('.');

        errors[key] ??= [];
        errors[key].push(message);
      }

      return { status: 'error', errors };
    }

    throw error;
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const securityRecords = await db
    .collection(DbTables.encryption)
    .findOne({}, { sort: { createdAt: -1 } });

  const privateKey = securityRecords?.privateKey as string;

  if (!privateKey) {
    return {
      status: 'error',
      errors: { root: ['No private key found for decryption'] },
    };
  }

  let originPassword: string;

  try {
    // Decrypt the password hash
    originPassword = decrypt(privateKey, passHash);

    // Now you have the plain text password
    // console.log('Decrypted password:', originPassword);
  } catch (error) {
    // console.error('Password decryption failed:', error);
    return {
      status: 'error',
      errors: {
        root: [
          error instanceof Error ? error.message : t('form.validation.unknown'),
        ],
      },
    };
  }

  const hash = await hashBlake2(originPassword, `!!${identifier}`);

  let record;

  try {
    // search user with credential combination
    record = await db
      .collection(DbTables.users)
      .findOne({ email: identifier, password: hash });
    console.log('--credentials', identifier, originPassword, hash);
    if (!record) {
      return { status: 'error', errors: { root: [t('wrongCredentials')] } };
    }
  } catch (error) {
    console.error('Error finding user:', error);
    return { status: 'error' };
  }

  // user was found, save new session
  // Generate a random string
  const randomString =
    Math.random().toString(36).slice(2) + Date.now().toString(36);

  // Create RSA-SHA256 hash of the random string
  const sessionToken = createSign('RSA-SHA256')
    .update(randomString)
    .sign(privateKey, 'base64');

  try {
    // save into DB
    await db.collection(DbTables.sessions).insertOne({
      userID: record._id,
      token: sessionToken,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving session', error, record._id, sessionToken);
    return { status: 'error' };
  }

  const cookies = await nextCookies();

  cookies.set('token', sessionToken, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    priority: 'high',
  });

  return { status: 'ok' };
}
