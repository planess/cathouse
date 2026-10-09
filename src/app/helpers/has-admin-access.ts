/** Permission actions that grant access to the admin panel. */
const ADMIN_ACTIONS = [':read', ':create', ':assign', ':review'];

/**
 * Checks whether a set of permissions grants access to the admin panel.
 *
 * @param permissions - Permissions in `resource:action` format.
 * @returns `true` when any permission ends with a `read`, `create`, `assign`, or `review` action.
 */
export function hasAdminAccess(permissions: readonly string[]): boolean {
  return permissions.some((permission) =>
    ADMIN_ACTIONS.some((action) => permission.endsWith(action)),
  );
}
