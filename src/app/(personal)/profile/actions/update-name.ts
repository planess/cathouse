'use server';

import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@app/hooks/get-current-user';
import type { ServerActionResponse } from '@app/models/server-action-response.server';

import { FIRST_NAME_MIN_LENGTH } from '../models/profile-field-limits';
import { updateProfile } from '../services/update-profile';

/**
 * Saves the current user's name to the `profiles` collection.
 *
 * @param firstName - Required first name, at least two characters.
 * @param lastName - Optional last name; an empty value removes it.
 * @returns `ok` when saved, otherwise errors keyed by `firstName` or `root`.
 */
export async function updateName(
  firstName: string,
  lastName: string,
): Promise<ServerActionResponse> {
  const t = await getTranslations('profilepage.edit');
  const user = await getCurrentUser();

  if (!user) {
    return { status: 'declined' };
  }

  const first = String(firstName).trim();
  const last = String(lastName).trim();

  if (first.length < FIRST_NAME_MIN_LENGTH) {
    return {
      status: 'error',
      errors: {
        firstName: [t('error.firstName', { n: FIRST_NAME_MIN_LENGTH })],
      },
    };
  }

  try {
    if (last === '') {
      await updateProfile(user.id, { firstName: first }, ['lastName']);
    } else {
      await updateProfile(user.id, { firstName: first, lastName: last });
    }
  } catch (error) {
    console.error('Unable to save profile name', error);

    return { status: 'error', errors: { root: [t('error.common')] } };
  }

  revalidatePath('/profile/info');

  return { status: 'ok' };
}
