/**
 * Predefined system permissions that cover common application operations.
 *
 * These permissions are automatically created when the RBAC system is initialized.
 * They provide a foundation for role-based access control across the application.
 *
 * Permission Format: "resource:action"
 * - resource: The entity or feature being accessed
 * - action: The operation being performed
 *
 * Usage Examples:
 * - SYSTEM_PERMISSIONS.USER_CREATE = "user:create"
 * - SYSTEM_PERMISSIONS.HELP_REQUEST_APPROVE = "help:request:approve"
 */
export const SYSTEM_PERMISSIONS = {
  // content maker
  HISTORY_CREATE: 'history:create',

  // admin management
  ROLE_ASSIGN: 'role:assign',
  ROLE_CREATE: 'role:create',
  ROLE_DELETE: 'role:delete',
} as const;

/**
 * TypeScript type representing all available system permission strings.
 *
 * This type provides compile-time safety when working with permission constants.
 * It automatically includes all permissions defined in SYSTEM_PERMISSIONS.
 *
 * Usage Examples:
 * - function checkPermission(permission: SystemPermission) { ... }
 * - const userPerms: SystemPermission[] = ['user:read', 'help:request:create']
 */
export type SystemPermission =
  (typeof SYSTEM_PERMISSIONS)[keyof typeof SYSTEM_PERMISSIONS];
