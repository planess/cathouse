import { getCurrentUser } from '@app/hooks/get-current-user';
import { getUserFromRequest } from '@app/hooks/get-user-from-request';
import type { MediaPermissions } from '@app/models/media-permissions';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

/**
 * Resolves the caller's media permissions using app-token or browser-cookie authentication.
 *
 * @param request - The optional API request containing an app client token.
 * @returns The caller's media permissions.
 */
export async function getMediaPermissions(
  request?: Request,
): Promise<MediaPermissions> {
  const currentUser = request
    ? await getUserFromRequest(request)
    : await getCurrentUser();
  if (currentUser?.id === undefined) {
    return {
      canAccess: false,
      canDelete: false,
      canReview: false,
      canUpload: false,
    };
  }

  const [canReview, canUpload, canDelete] = await Promise.all([
    hasPermission(SYSTEM_PERMISSIONS.MEDIA_REVIEW, undefined, currentUser.id),
    hasPermission(SYSTEM_PERMISSIONS.MEDIA_UPLOAD, undefined, currentUser.id),
    hasPermission(SYSTEM_PERMISSIONS.MEDIA_DELETE, undefined, currentUser.id),
  ]);

  return {
    canAccess: canReview || canUpload || canDelete,
    canDelete,
    canReview,
    canUpload,
  };
}
