import { createSign } from 'node:crypto';

import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';
import { email, object, string, ZodError } from 'zod';

import { DbTables } from '@app/enum/db-tables';
import { decrypt } from '@app/helpers/decrypt';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import clientPromise from '@app/ins/mongo-client';
import type { ResponseErrors } from '@app/models/response-errors.server';
import type { ServerActionResponse } from '@app/models/server-action-response.server';

/** Authenticates a user and creates an HTTP-only session cookie. */
export async function POST(
  request: Request,
): Promise<NextResponse<ServerActionResponse>> {
  const t = await getTranslations('authorization');
  const isWebApplicationRequest = request.headers.get('x-client-type') !== 'app';
  const authRules = object({
    identifier: email(t('form.validation.email')),
    passHash: string(),
  }).required();

  let identifier: string;
  let passHash: string;

  try {
    ({ identifier, passHash } = authRules.parse(await request.json()));
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = {} as ResponseErrors;

      for (const { path, message } of error.issues) {
        const key = path.join('.');

        errors[key] ??= [];
        errors[key].push(message);
      }

      return NextResponse.json({ status: 'error', errors }, { status: 400 });
    }

    return NextResponse.json(
      {
        status: 'error',
        errors: { root: [t('form.validation.unknown')] },
      },
      { status: 400 },
    );
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const securityRecord = await db
    .collection(DbTables.encryption)
    .findOne({}, { sort: { createdAt: -1 } });
  const privateKey = securityRecord?.privateKey as string | undefined;

  if (!privateKey) {
    return NextResponse.json(
      {
        status: 'error',
        errors: { root: ['No private key found for decryption'] },
      },
      { status: 500 },
    );
  }

  let password: string;

  try {
    password = decrypt(privateKey, passHash);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        errors: {
          root: [
            error instanceof Error
              ? error.message
              : t('form.validation.unknown'),
          ],
        },
      },
      { status: 400 },
    );
  }

  const passwordHash = await hashBlake2(password, `!!${identifier}`);
  let user;

  try {
    user = await db
      .collection(DbTables.users)
      .findOne({ email: identifier, password: passwordHash });
  } catch (error) {
    console.error('Error finding user:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json(
      {
        status: 'error',
        errors: { root: [t('wrongCredentials')] },
      },
      { status: 401 },
    );
  }

  const randomString =
    Math.random().toString(36).slice(2) + Date.now().toString(36);
  const sessionToken = createSign('RSA-SHA256')
    .update(randomString)
    .sign(privateKey, 'base64');

  try {
    await db.collection(DbTables.sessions).insertOne({
      userID: user._id,
      token: sessionToken,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }

  if (!isWebApplicationRequest) {
    return NextResponse.json({
      status: 'ok',
      token: sessionToken,
    });
  }

  const response = NextResponse.json({ status: 'ok' as const });

  response.cookies.set('token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    priority: 'high',
  });

  return response;
}
