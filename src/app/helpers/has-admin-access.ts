import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';

/** Permissions that grant access to the admin panel. */
const ADMIN_PERMISSIONS: ReadonlySet<string> = new Set([
  SYSTEM_PERMISSIONS.ACT_REGULATE,
  SYSTEM_PERMISSIONS.EMAIL_READ,
  SYSTEM_PERMISSIONS.ROLE_CREATE,
  SYSTEM_PERMISSIONS.MEDIA_REVIEW,
  SYSTEM_PERMISSIONS.MEDIA_UPLOAD,
]);

/**
 * Checks whether a set of permissions grants access to the admin panel.
 *
 * @param permissions - Permissions in `resource:action` format.
 * @returns `true` when any permission is `act:regulate`, `email:read`, `role:create`, `media:review`, or `media:upload`.
 */
export function hasAdminAccess(permissions: readonly string[]): boolean {
  return permissions.some((permission) => ADMIN_PERMISSIONS.has(permission));
}
