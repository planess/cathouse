'use server';

import { DateTime } from 'luxon';
import { headers as clientHeaders } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
import { getEmailAssets } from '@app/helpers/get-email-assets';
import { getEmailHtml } from '@app/helpers/get-email-template';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import clientPromise from '@app/ins/mongo-client';
import { ServerActionResponse } from '@app/models/server-action-response.server';
import { emailService } from '@app/services/email.service';

export async function sendRestoreEmail(
  email: string,
): Promise<ServerActionResponse> {
  // 1. Find user by email
  const dbClient = await clientPromise;
  const db = dbClient.db();

  let user;

  try {
    user = await db.collection(DbTables.users).findOne({ email });
  } catch (error: unknown) {
    console.error('Database error:', error);
    return {
      status: 'error',
    };
  }

  if (!user) {
    // to prevent enumeration attacks, return ok even if user not found
    console.error('User not found for email:', email);
    return { status: 'ok' };
  }

  // 2. Validate the missing of existing reset tokens
  if (
    await db
      .collection(DbTables.usersRestorePasswords)
      .findOne({ _id: user._id })
  ) {
    return {
      status: 'error',
      errors: {
        identifier: [
          'A reset request is already pending. Please check your email.',
        ],
      },
    };
  }

  // 3. Generate a password reset token
  // todo: generate a secure random token under crypto hash
  const code =
    (await hashBlake2(
      `${user._id.toString()}-${Date.now()}-${Math.random()}`,
      email,
    )) + (process.env.NODE_ENV === 'development' ? '-dev' : '');

  // 4. Generate email content and send email
  let emailResponse;
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - skipping email send');
      emailResponse = { status: 200 };
    } else {
      const headers = await clientHeaders();
      let duration = 0; // minutes

      const indexes = await db
        .collection(DbTables.usersRestorePasswords)
        .indexes();
      const indexTemp = indexes.find(
        (idx) =>
          (idx.name?.startsWith('createdAt') ?? false) &&
          Number.isInteger(idx.expireAfterSeconds),
      );

      if (indexTemp?.expireAfterSeconds !== undefined) {
        duration = Math.floor(indexTemp.expireAfterSeconds / 60);
      }

      const lang = 'uk-UA'; // todo: get user language preference
      const [t, m] = await Promise.all([
        getTranslations('emails.restore-password'),
        getTranslations('duration'),
      ]);
      const subject = t('subject');
      const body = await getEmailHtml('restore-password', {
        lang,
        code,
        title: t('title'),
        heading: t('heading'),
        txt1: t('txt1'),
        txt2: t('txt2'),
        domain: headers.get('host') ?? 'perilines.com.ua', // todo: get from user request headers
        buttonLabel: t('buttonLabel'),
        expiration: t('expiration', {
          duration: m('minutes', { count: duration }),
          expiry: DateTime.now() // todo: get current time from user's browser
            .setZone('Europe/Kiev')
            .plus({ minutes: duration })
            .toFormat('dd.MM.yyyy HH:mm'),
        }),
        trouble: t('trouble'),
        ignore: t('ignore'),
        address: t('address'),
        donotReply: t('donotReply'),
      });

      const inlineImages = await getEmailAssets(['logo.png', 'icon-lock.png']);

      emailResponse = await emailService.sendEmail(
        email,
        subject,
        body,
        'support',
        [],
        inlineImages.filter(Boolean) as Exclude<
          (typeof inlineImages)[number],
          null
        >[],
      );
    }
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    return {
      status: 'error',
      errors: {
        identifier:
          error instanceof Error && 'message' in error
            ? [error.message]
            : ['Failed to send email'],
      },
    };
  }

  if (emailResponse?.status !== 200) {
    console.log('Email service responded', emailResponse);
    return {
      status: 'error',
      errors: { identifier: ['Failed to send email'] },
    };
  }

  // 5. Store the reset token in the database
  try {
    await db
      .collection(DbTables.usersRestorePasswords)
      .insertOne({ _id: user._id, code, createdAt: new Date() });
  } catch (error) {
    console.error('Error storing reset token:', error);
    return {
      status: 'error',
      errors: { identifier: ['Failed to store reset token'] },
    };
  }

  return { status: 'ok' };
}
