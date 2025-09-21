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
  // User management
  /** Allows creating new user accounts in the system */
  USER_CREATE: 'user:create',
  /** Allows viewing user information and profiles */
  USER_READ: 'user:read',
  /** Allows modifying existing user information */
  USER_UPDATE: 'user:update',
  /** Allows permanently removing user accounts from the system */
  USER_DELETE: 'user:delete',

  // Role management
  /** Allows creating new roles and permission sets */
  ROLE_CREATE: 'role:create',
  /** Allows viewing role definitions and their permissions */
  ROLE_READ: 'role:read',
  /** Allows modifying existing role definitions and permissions */
  ROLE_UPDATE: 'role:update',
  /** Allows permanently removing roles from the system */
  ROLE_DELETE: 'role:delete',
  /** Allows assigning roles to users or removing roles from users */
  ROLE_ASSIGN: 'role:assign',

  // Content management
  /** Allows creating new content items (posts, articles, etc.) */
  CONTENT_CREATE: 'content:create',
  /** Allows viewing content items */
  CONTENT_READ: 'content:read',
  /** Allows modifying existing content items */
  CONTENT_UPDATE: 'content:update',
  /** Allows permanently removing content items */
  CONTENT_DELETE: 'content:delete',

  // Help/Support management
  /** Allows creating new help requests or support tickets */
  HELP_REQUEST_CREATE: 'help:request:create',
  /** Allows viewing help requests and their details */
  HELP_REQUEST_READ: 'help:request:read',
  /** Allows modifying help request information */
  HELP_REQUEST_UPDATE: 'help:request:update',
  /** Allows permanently removing help requests */
  HELP_REQUEST_DELETE: 'help:request:delete',
  /** Allows approving or rejecting help requests (moderation action) */
  HELP_REQUEST_APPROVE: 'help:request:approve',

  // History/Logs
  /** Allows viewing system history, audit logs, and activity records */
  HISTORY_READ: 'history:read',
  /** Allows exporting system history and logs to external formats */
  HISTORY_EXPORT: 'history:export',

  // System administration
  /** Allows changing system configuration settings */
  SYSTEM_CONFIG: 'system:config',
  /** Allows creating system backups and snapshots */
  SYSTEM_BACKUP: 'system:backup',
  /** Allows restoring system from backups */
  SYSTEM_RESTORE: 'system:restore',
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
