import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

export type MediaPermissions = {
  canAccess: boolean;
  canDelete: boolean;
  canReview: boolean;
  canUpload: boolean;
};

export async function getMediaPermissions(): Promise<MediaPermissions> {
  const currentUser = await getCurrentUser();

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
