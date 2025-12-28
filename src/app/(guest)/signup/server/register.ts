'use server';

import { InsertOneResult } from 'mongodb';
import { getTranslations } from 'next-intl/server';
import { string, object, email, ZodError } from 'zod';

import { DbTables } from '@app/enum/db-tables';
import { decrypt } from '@app/helpers/decrypt';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import clientPromise from '@app/ins/mongo-client';
import { ResponseErrors } from '@app/models/response-errors.server';
import { ServerActionResponse } from '@app/models/server-action-response.server';

interface FormData {
  identifier: string;
  passHash: string;
}

const minPasswordLength = 6;

export async function register(
  formData: FormData,
): Promise<ServerActionResponse> {
  let identifier: string;
  let passHash: string;

  const t = await getTranslations('authorization');

  const FormDataSchema = object({
    identifier: email(t('form.validation.email')),
    passHash: string(),
  }).required();

  try {
    ({ identifier, passHash } = FormDataSchema.parse(formData));
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = {} as ResponseErrors;

      for (const { path, message } of error.issues) {
        const key = path.join('.');

        errors[key] ??= [];
        errors[key].push(message);
      }

      return {
        errors,
        status: 'error',
      };
    }

    throw error;
  }

  const dbP = await clientPromise;
  const db = dbP.db();
  const dbRecords = await db
    .collection(DbTables.encryption)
    .findOne({}, { sort: { createdAt: -1 } });

  const privateKey = dbRecords?.privateKey as string;

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

  try {
    // validation before was running upon password hash.
    // now password is in natural form, should be validated again
    originPassword = string()
      .min(
        minPasswordLength,
        t('form.validation.minPasswordLength', { n: minPasswordLength }),
      )
      .parse(originPassword);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        status: 'error',
        errors: { passHash: error.issues.map(({ message }) => message) },
      };
    }

    throw error;
  }

  const hash = await hashBlake2(originPassword, `!!${identifier}`);

  // Save new user into db collection 'users'
  let insertResult: InsertOneResult;
  try {
    insertResult = await db.collection(DbTables.users).insertOne({
      email: identifier, // unique
      emailVerified: false,
      password: hash,
      isActive: true,
      roles: [],
      createdAt: new Date(),
    });
  } catch (error) {
    return {
      status: 'error',
      errors: {
        root: [
          error instanceof Error ? error.message : t('saveUserErrorCommon'),
        ],
      },
    };
  }

  // Save profile
  try {
    await db.collection(DbTables.profiles).insertOne({
      userID: insertResult.insertedId,
    });
  } catch (error) {
    return {
      status: 'error',
      errors: {
        root: [
          error instanceof Error ? error.message : t('saveProfileErrorCommon'),
        ],
      },
    };
  }

  return { status: 'ok' };
}
