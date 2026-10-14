import type { ObjectId } from 'mongodb';
import { headers as clientHeaders } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
import { getEmailAssets } from '@app/helpers/get-email-assets';
import { getEmailHtml } from '@app/helpers/get-email-template';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import clientPromise from '@app/ins/mongo-client';
import type { User } from '@app/models/db/user';
import { VERIFICATION_EMAIL_COOLDOWN_MS } from '@app/models/verification-email-cooldown';
import type { VerificationLetterResult } from '@app/models/verification-letter-result';
import { emailService } from '@app/services/email.service';

/**
 * Sends the email verification letter to a user. Every call generates a new
 * code, stores it in `users.emailVerificationCode`, and sends a letter with a
 * link to the `/verify-email` page. A new letter can be sent only after
 * `VERIFICATION_EMAIL_COOLDOWN_MS` since the previous one.
 *
 * @param userId - Identifier of the user in the `users` collection.
 * @param email - Email address of the user to verify.
 * @returns Outcome of sending the letter.
 */
export async function sendVerificationLetter(
  userId: ObjectId,
  email: string,
): Promise<VerificationLetterResult> {
  const sentAt = new Date();
  // Hash of the email with the current timestamp as salt
  const code = await hashBlake2(email, String(sentAt.getTime()));
  const dbClient = await clientPromise;
  const users = dbClient.db().collection<User>(DbTables.users);

  try {
    // The filter also enforces the cooldown, so parallel clicks send one letter
    const { matchedCount } = await users.updateOne(
      {
        _id: userId,
        emailVerified: { $ne: true },
        $or: [
          { emailVerificationSentAt: { $exists: false } },
          {
            emailVerificationSentAt: {
              $lte: new Date(sentAt.getTime() - VERIFICATION_EMAIL_COOLDOWN_MS),
            },
          },
        ],
      },
      { $set: { emailVerificationCode: code, emailVerificationSentAt: sentAt } },
    );

    if (matchedCount === 0) {
      return 'declined';
    }
  } catch (error) {
    console.error('Unable to store email verification code', error);

    return 'failed';
  }

  if (!(await deliver(email, code))) {
    // The letter was not sent: do not hold the user for the cooldown
    await users
      .updateOne(
        { _id: userId, emailVerificationSentAt: sentAt },
        { $unset: { emailVerificationSentAt: '' } },
      )
      .catch((error: unknown) =>
        console.error('Unable to reset verification letter time', error),
      );

    return 'failed';
  }

  return 'sent';
}

/**
 * Sends the verification letter; in development only logs the link.
 *
 * @param to - Recipient email address.
 * @param code - Verification code for the link.
 * @returns `true` when the letter was sent.
 */
async function deliver(to: string, code: string): Promise<boolean> {
  const headers = await clientHeaders();
  const domain = headers.get('host') ?? 'perilines.com.ua';
  const email = encodeURIComponent(to);

  if (process.env.NODE_ENV !== 'development') {
    console.log(
      'Development mode - skipping email send, verification link:',
      `http://${domain}/verify-email?code=${code}&email=${email}`,
    );

    return true;
  }

  try {
    const lang = 'uk-UA'; // todo: get user language preference
    const m = await getTranslations('emails.verify-email');
    const body = await getEmailHtml('verify-email', {
      lang,
      code,
      email,
      domain,
      title: m('title'),
      heading: m('heading'),
      txt1: m('txt1'),
      txt2: m('txt2'),
      buttonLabel: m('buttonLabel'),
      expiration: m('expiration'),
      trouble: m('trouble'),
      ignore: m('ignore'),
      address: m('address'),
      donotReply: m('donotReply'),
    });
    const inlineImages = await getEmailAssets(['logo.png', 'icon-lock.png']);
    const response = await emailService.sendEmail(
      to,
      m('subject'),
      body,
      'support',
      [],
      inlineImages.filter(Boolean) as Exclude<
        (typeof inlineImages)[number],
        null
      >[],
    );

    if (response?.status !== 200) {
      console.error('Email service responded', response);

      return false;
    }
  } catch (error) {
    console.error('Unable to send verification email', error);

    return false;
  }

  return true;
}
