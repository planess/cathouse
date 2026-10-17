import { NextRequest } from 'next/server';

import { createJsonResponse } from '@app/helpers/create-json-response';
import type { ProfilePhotoUploadRequest } from '@app/models/profile-photo-upload-request';
import type { ProfilePhotoUploadTarget } from '@app/models/profile-photo-upload-target';
import { createProfilePhotoUpload } from '@app/services/create-profile-photo-upload';
import { findAdminPhotoTarget } from '@app/services/find-admin-photo-target';

export const runtime = 'nodejs';

/**
 * Issues a presigned URL for uploading a user's profile photo straight to R2.
 *
 * @param request - JSON request with the photo's `type` and `size`.
 * @param context - Route context.
 * @param context.params - Route params with the user `id`.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await findAdminPhotoTarget((await params).id);

    if (userId === 'forbidden' || userId === null) {
      return createJsonResponse<ProfilePhotoUploadTarget>(
        { success: false, error: 'common' },
        userId === null ? 404 : 403,
      );
    }

    const { type, size } = (await request.json()) as ProfilePhotoUploadRequest;
    const target = await createProfilePhotoUpload(userId, type, size);

    return createJsonResponse(target, target.success ? 200 : 400);
  } catch (error) {
    console.error('Unable to sign profile photo upload', error);

    return createJsonResponse<ProfilePhotoUploadTarget>(
      { success: false, error: 'common' },
      500,
    );
  }
}
