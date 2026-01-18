'use server';

import { readFile } from 'node:fs/promises';

import { DateTime } from 'luxon';
import { headers as clientHeaders } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
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

  // 2. Generate a password reset token
  // todo: generate a secure random token under crypto hash
  const code =
    (await hashBlake2(
      `${user._id.toString()}-${Date.now()}-${Math.random()}`,
      email,
    )) + (process.env.NODE_ENV === 'development' ? '-dev' : '');

  // 3. Generate email content and send email
  let emailResponse;
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - skipping email send');
      emailResponse = { status: 200 };
    } else {
      const headers = await clientHeaders();
      const duration = 15; // minutes
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

      const [logo, iconLock] = await Promise.all([
        readFile('email-template/assets/logo.png').then((data) => ({
          data,
          filename: 'logo.png',
        })),
        readFile('email-template/assets/icon-lock.png').then((data) => ({
          data,
          filename: 'icon-lock.png',
        })),
      ]);

      emailResponse = await emailService.sendEmail(
        email,
        subject,
        body,
        'support',
        [],
        [logo, iconLock],
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

  // 4. Store the reset token in the database
  try {
    await db
      .collection(DbTables.usersRestorePasswords)
      .updateOne(
        { userID: user._id },
        { $set: { code, createdAt: new Date() } },
        { upsert: true },
      );
  } catch (error) {
    console.error('Error storing reset token:', error);
    return {
      status: 'error',
      errors: { identifier: ['Failed to store reset token'] },
    };
  }

  return { status: 'ok' };
}
