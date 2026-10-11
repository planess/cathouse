'use server';

import { revalidatePath } from 'next/cache';
import { headers as clientHeaders } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
import { getEmailAssets } from '@app/helpers/get-email-assets';
import { getEmailHtml } from '@app/helpers/get-email-template';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import { getCurrentUser } from '@app/hooks/get-current-user';
import clientPromise from '@app/ins/mongo-client';
import type { User } from '@app/models/db/user';
import type { ServerActionResponse } from '@app/models/server-action-response.server';
import { emailService } from '@app/services/email.service';

import { VERIFICATION_EMAIL_COOLDOWN_MS } from '../models/verification-email-cooldown';

/**
 * Sends the email verification letter to the current user. Every call
 * generates a new code, stores it in `users.emailVerificationCode`, and sends
 * a letter with a link to the `/verify-email` page. A new letter can be sent
 * only after `VERIFICATION_EMAIL_COOLDOWN_MS` since the previous one.
 *
 * @returns `ok` when the letter was sent, `declined` for anonymous or already verified users or during the cooldown, otherwise an error with a `root` message.
 */
export async function sendVerificationEmail(): Promise<ServerActionResponse> {
  const t = await getTranslations('profilepage.personal');
  const user = await getCurrentUser();

  if (!user || user.emailVerified) {
    return { status: 'declined' };
  }

  const sentAt = new Date();
  // Hash of the email with the current timestamp as salt
  const code = await hashBlake2(user.email, String(sentAt.getTime()));
  const dbClient = await clientPromise;
  const users = dbClient.db().collection<User>(DbTables.users);

  try {
    // The filter also enforces the cooldown, so parallel clicks send one letter
    const { matchedCount } = await users.updateOne(
      {
        _id: user.id,
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
      // Refresh the page so the button shows the actual remaining time
      revalidatePath('/profile/info');

      return { status: 'declined' };
    }
  } catch (error) {
    console.error('Unable to store email verification code', error);

    return { status: 'error', errors: { root: [t('verifyError')] } };
  }

  if (!(await deliver(user.email, code))) {
    // The letter was not sent: do not hold the user for the cooldown
    await users
      .updateOne(
        { _id: user.id, emailVerificationSentAt: sentAt },
        { $unset: { emailVerificationSentAt: '' } },
      )
      .catch((error: unknown) =>
        console.error('Unable to reset verification letter time', error),
      );

    return { status: 'error', errors: { root: [t('verifyError')] } };
  }

  revalidatePath('/profile/info');

  return { status: 'ok' };
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

  if (process.env.NODE_ENV === 'development') {
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
