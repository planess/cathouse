import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';

import { getMediaPermissions } from './get-media-permissions';

export async function hasMediaPermission(
  permission:
    | typeof SYSTEM_PERMISSIONS.MEDIA_DELETE
    | typeof SYSTEM_PERMISSIONS.MEDIA_UPLOAD,
): Promise<boolean> {
  const permissions = await getMediaPermissions();

  return permission === SYSTEM_PERMISSIONS.MEDIA_DELETE
    ? permissions.canDelete
    : permissions.canUpload;
}
