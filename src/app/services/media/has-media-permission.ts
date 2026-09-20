import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';

import { getMediaPermissions } from './get-media-permissions';

/**
 * Checks whether the authenticated caller has a requested media permission.
 *
 * @param request - The incoming media API request.
 * @param permission - The media permission to verify.
 * @returns Whether the caller has the requested permission.
 */
export async function hasMediaPermission(
  request: Request,
  permission:
    | typeof SYSTEM_PERMISSIONS.MEDIA_DELETE
    | typeof SYSTEM_PERMISSIONS.MEDIA_UPLOAD,
): Promise<boolean> {
  const permissions = await getMediaPermissions(request);

  return permission === SYSTEM_PERMISSIONS.MEDIA_DELETE
    ? permissions.canDelete
    : permissions.canUpload;
}
