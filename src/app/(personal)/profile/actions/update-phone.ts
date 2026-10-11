'use server';

import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@app/hooks/get-current-user';
import type { ServerActionResponse } from '@app/models/server-action-response.server';

import { updateProfile } from '../services/update-profile';

/**
 * Saves the current user's phone number to the `profiles` collection as a
 * plain string.
 *
 * @param phone - New phone number; an empty value removes it.
 * @returns `ok` when saved, otherwise errors keyed by `root`.
 */
export async function updatePhone(phone: string): Promise<ServerActionResponse> {
  const t = await getTranslations('profilepage.edit');
  const user = await getCurrentUser();

  if (!user) {
    return { status: 'declined' };
  }

  const value = String(phone).trim();

  try {
    if (value === '') {
      await updateProfile(user.id, {}, ['phone']);
    } else {
      await updateProfile(user.id, { phone: value });
    }
  } catch (error) {
    console.error('Unable to save profile phone', error);

    return { status: 'error', errors: { root: [t('error.common')] } };
  }

  revalidatePath('/profile/info');

  return { status: 'ok' };
}
