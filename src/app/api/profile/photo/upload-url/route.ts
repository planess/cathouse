import { NextRequest } from 'next/server';

import { createJsonResponse } from '@app/helpers/create-json-response';
import { getCurrentUser } from '@app/hooks/get-current-user';
import type { ProfilePhotoUploadRequest } from '@app/models/profile-photo-upload-request';
import type { ProfilePhotoUploadTarget } from '@app/models/profile-photo-upload-target';
import { createProfilePhotoUpload } from '@app/services/create-profile-photo-upload';

export const runtime = 'nodejs';

/**
 * Issues a presigned URL for uploading the current user's profile photo
 * straight to R2. Only volunteers (users with `hiredOn` set) may change it.
 *
 * @param request - JSON request with the photo's `type` and `size`.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user || !user.profile.hiredOn) {
    return createJsonResponse<ProfilePhotoUploadTarget>(
      { success: false, error: 'common' },
      403,
    );
  }

  try {
    const { type, size } = (await request.json()) as ProfilePhotoUploadRequest;
    const target = await createProfilePhotoUpload(user.id, type, size);

    return createJsonResponse(target, target.success ? 200 : 400);
  } catch (error) {
    console.error('Unable to sign profile photo upload', error);

    return createJsonResponse<ProfilePhotoUploadTarget>(
      { success: false, error: 'common' },
      500,
    );
  }
}
