import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

import { updateProfile } from '@app/(personal)/profile/services/update-profile';
import { createJsonResponse } from '@app/helpers/create-json-response';
import { getCurrentUser } from '@app/hooks/get-current-user';
import {
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_TYPES,
} from '@app/models/profile-photo-limits';
import type { ProfilePhotoUploadResponse } from '@app/models/profile-photo-upload-response';
import { uploadProfilePhoto } from '@app/services/upload-profile-photo';

export const runtime = 'nodejs';

/**
 * Replaces the profile photo of the current user. Only volunteers (users with
 * `hiredOn` set) may change it. Expects a `photo` field with a .png or .jpg file.
 *
 * @param request - Multipart form request.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user || !user.profile.hiredOn) {
    return createJsonResponse<ProfilePhotoUploadResponse>(
      { success: false, error: 'common' },
      403,
    );
  }

  try {
    const photo = (await request.formData()).get('photo');

    if (!(photo instanceof File) || !PROFILE_PHOTO_TYPES.includes(photo.type)) {
      return createJsonResponse<ProfilePhotoUploadResponse>(
        { success: false, error: 'type' },
        400,
      );
    }

    if (photo.size > PROFILE_PHOTO_MAX_BYTES) {
      return createJsonResponse<ProfilePhotoUploadResponse>(
        { success: false, error: 'size' },
        400,
      );
    }

    const profilePhoto = await uploadProfilePhoto(user.id, photo);

    if (!profilePhoto) {
      return createJsonResponse<ProfilePhotoUploadResponse>(
        { success: false, error: 'type' },
        400,
      );
    }

    await updateProfile(user.id, { profilePhoto });
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
