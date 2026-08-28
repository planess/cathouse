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
  REGISTRY_MAP_READ: 'registry:map:read',

  HISTORY_CREATE: 'history:create', // also "UPDATE" included for own records
  HISTORY_PUBLISH: 'history:publish', // only own records
  HISTORY_UPDATE_ANY: 'history:update:any', // update any records
  HISTORY_PUBLISH_ANY: 'history:publish:any', // publish any records
  HISTORY_DELETE: 'history:delete', // for admin

  INFORMATOR_CREATE: 'informator:create',
  INFORMATOR_UPDATE: 'informator:update',
  INFORMATOR_DELETE: 'informator:delete',

  CLINIC_CREATE: 'clinic:create',
  CLINIC_UPDATE: 'clinic:update',
  CLINIC_DELETE: 'clinic:delete',

  // volunteer acts
  ACT_READ: 'act:read',
  ACT_CREATE: 'act:create',
  ACT_UPDATE: 'act:update',
  ACT_DELETE: 'act:delete',
  ACT_REGULATE: 'act:regulate',

  // equipment management
  EQUIPMENT_ACCEPT: 'equipment:accept',
  EQUIPMENT_EDIT: 'equipment:edit',
  EQUIPMENT_EXCLUDE: 'equipment:exclude',
  EQUIPMENT_USE: 'equipment:use',
  EQUIPMENT_TRANSFER: 'equipment:transfer',

  // foundation email
  EMAIL_SEND: 'email:send',

  // admin management
  ROLE_ASSIGN: 'role:assign',
  ROLE_CREATE: 'role:create',
  ROLE_DELETE: 'role:delete',

  // media
  MEDIA_UPLOAD: 'media:upload',
  MEDIA_DELETE: 'media:delete',
  MEDIA_REVIEW: 'media:review',
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
  | (typeof SYSTEM_PERMISSIONS)[keyof typeof SYSTEM_PERMISSIONS]
  | `${string}:${string}`;
