'use server';

import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@app/hooks/get-current-user';
import type { ServerActionResponse } from '@app/models/server-action-response.server';

import { ABOUT_MAX_LENGTH } from '../models/profile-field-limits';
import { updateProfile } from '../services/update-profile';

/**
 * Saves the volunteer "about" text of the current user. Only volunteers
 * (users with `hiredOn` set) may change it.
 *
 * @param about - New text; an empty value removes it.
 * @returns `ok` when saved, otherwise errors keyed by `about` or `root`.
 */
export async function updateAbout(about: string): Promise<ServerActionResponse> {
  const t = await getTranslations('profilepage.edit');
  const user = await getCurrentUser();

  if (!user) {
    return { status: 'declined' };
  }

  if (!user.profile.hiredOn) {
    return { status: 'declined' };
  }

  const text = String(about).trim();

  if (text.length > ABOUT_MAX_LENGTH) {
    return {
      status: 'error',
      errors: { about: [t('error.about', { n: ABOUT_MAX_LENGTH })] },
    };
  }

  try {
    if (text === '') {
      await updateProfile(user.id, {}, ['about']);
    } else {
      await updateProfile(user.id, { about: text });
    }
  } catch (error) {
    console.error('Unable to save profile about', error);

    return { status: 'error', errors: { root: [t('error.common')] } };
  }

  revalidatePath('/profile/info');

  return { status: 'ok' };
}
