'use server';

import { DbTables } from '@app/enum/db-tables';
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

  // 2. Create a password reset token and store it
  // todo: generate a secure random token under crypto hash
  const code = await hashBlake2(
    `${user._id.toString()}-${Date.now()}-${Math.random()}`, email);

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
    return { status: 'error' };
  }

  // 3. Generate email content and send email
  const subject = 'Reset your password';
  const body = 'Click the link to reset your password: [link]';

  let emailResponse;

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - skipping email send');
      emailResponse = { status: 200 };
    } else {
      emailResponse = await emailService.sendEmail(
        email,
        subject,
        body,
        'support',
      );
    }
  } catch (error: unknown) {
    // console.error('Error sending email:', error);
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
    return {
      status: 'error',
      errors: { identifier: ['Failed to send email'] },
    };
  }

  return { status: 'ok' };
}
