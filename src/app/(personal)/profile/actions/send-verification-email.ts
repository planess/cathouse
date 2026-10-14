'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@app/hooks/get-current-user';
import type { ServerActionResponse } from '@app/models/server-action-response.server';
import { sendVerificationLetter } from '@app/services/send-verification-letter';

/**
 * Sends the email verification letter to the current user. See
 * `sendVerificationLetter` for the code generation and the cooldown.
 *
 * @returns `ok` when the letter was sent, `declined` for anonymous or already verified users or during the cooldown, otherwise an error with a `root` message.
 */
export async function sendVerificationEmail(): Promise<ServerActionResponse> {
  const t = await getTranslations('profilepage.personal');
  const user = await getCurrentUser();

  if (!user || user.emailVerified) {
    return { status: 'declined' };
  }

  const result = await sendVerificationLetter(user.id, user.email);

  if (result === 'failed') {
    return { status: 'error', errors: { root: [t('verifyError')] } };
  }

  // Refresh the page so the button shows the actual remaining time
  revalidatePath('/profile/info');

  return result === 'sent' ? { status: 'ok' } : { status: 'declined' };
}
