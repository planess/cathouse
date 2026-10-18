import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

import { createJsonResponse } from '@app/helpers/create-json-response';
import type { ProfilePhotoAttachRequest } from '@app/models/profile-photo-attach-request';
import type { ProfilePhotoUploadResponse } from '@app/models/profile-photo-upload-response';
import { attachProfilePhoto } from '@app/services/attach-profile-photo';
import { findAdminPhotoTarget } from '@app/services/find-admin-photo-target';

export const runtime = 'nodejs';

/**
 * Replaces a user's profile photo with a photo already uploaded to R2
 * through `POST /api/admin/users/{id}/photo/upload-url`.
 *
 * @param request - JSON request with the uploaded photo's `key`.
 * @param context - Route context.
 * @param context.params - Route params with the user `id`.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const userId = await findAdminPhotoTarget(id);

    if (userId === 'forbidden' || userId === null) {
      return createJsonResponse<ProfilePhotoUploadResponse>(
        { success: false, error: 'common' },
        userId === null ? 404 : 403,
      );
    }

    const { key } = (await request.json()) as ProfilePhotoAttachRequest;
    const error = await attachProfilePhoto(userId, key);

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

  revalidatePath('/admin/users');
  revalidatePath(`/volunteers/${id}`);

  return createJsonResponse<ProfilePhotoUploadResponse>({ success: true });
}
