import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

import { createJsonResponse } from '@app/helpers/create-json-response';
import { getCurrentUser } from '@app/hooks/get-current-user';
import type { ProfilePhotoAttachRequest } from '@app/models/profile-photo-attach-request';
import type { ProfilePhotoUploadResponse } from '@app/models/profile-photo-upload-response';
import { attachProfilePhoto } from '@app/services/attach-profile-photo';

export const runtime = 'nodejs';

/**
 * Replaces the profile photo of the current user with a photo already
 * uploaded to R2 through `POST /api/profile/photo/upload-url`. Only volunteers
 * (users with `hiredOn` set) may change it.
 *
 * @param request - JSON request with the uploaded photo's `key`.
 */
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user || !user.profile.hiredOn) {
    return createJsonResponse<ProfilePhotoUploadResponse>(
      { success: false, error: 'common' },
      403,
    );
  }

  try {
    const { key } = (await request.json()) as ProfilePhotoAttachRequest;
    const error = await attachProfilePhoto(user.id, key);

    if (error) {
      return createJsonResponse<ProfilePhotoUploadResponse>(
        { success: false, error },
        400,
      );
    }
  } catch (error) {
    console.error('Unable to replace profile photo', error);

    return createJsonResponse<ProfilePhotoUploadResponse>(
      { success: false, error: 'common' },
      500,
    );
  }

  revalidatePath('/profile/info');
  revalidatePath(`/volunteers/${user.id.toString()}`);

  return createJsonResponse<ProfilePhotoUploadResponse>({ success: true });
}
