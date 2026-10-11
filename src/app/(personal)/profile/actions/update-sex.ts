'use server';

import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@app/hooks/get-current-user';
import type { ServerActionResponse } from '@app/models/server-action-response.server';
import { Sex } from '@app/models/sex';

import { updateProfile } from '../services/update-profile';

/**
 * Saves the current user's sex to the `profiles` collection.
 *
 * @param sex - One of the `Sex` values; it cannot be cleared.
 * @returns `ok` when saved, otherwise errors keyed by `sex` or `root`.
 */
export async function updateSex(sex: Sex): Promise<ServerActionResponse> {
  const t = await getTranslations('profilepage.edit');
  const user = await getCurrentUser();

  if (!user) {
    return { status: 'declined' };
  }

  if (!Object.values(Sex).includes(sex)) {
    return { status: 'error', errors: { sex: [t('error.sex')] } };
  }

  try {
    await updateProfile(user.id, { sex });
  } catch (error) {
    console.error('Unable to save profile sex', error);

    return { status: 'error', errors: { root: [t('error.common')] } };
  }

  revalidatePath('/profile/info');

  return { status: 'ok' };
}
