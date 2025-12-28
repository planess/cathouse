/**
 * Predefined system roles that provide common access patterns.
 *
 * These roles are automatically created when the RBAC system is initialized.
 * They serve as templates that can be customized or extended for specific needs.
 *
 * Role Hierarchy (from highest to lowest privilege):
 * 1. Super Admin: Full system access
 * 2. Admin: Administrative access (excludes user deletion)
 * 3. Moderator: Content moderation and limited admin
 * 4. User: Standard user access
 * 5. Guest: Read-only access
 *
 * Usage Examples:
 * - SYSTEM_ROLES.SUPER_ADMIN = "super_admin"
 * - SYSTEM_ROLES.MODERATOR = "moderator"
 */
export const SYSTEM_ROLES = {
  /** Highest privilege role with access to all system features and permissions */
  SUPER_ADMIN: 'super_admin',
  /** Administrative role with most system management capabilities (excludes user deletion) */
  ADMIN: 'admin',
  /** Moderation role for managing content and user interactions */
  MODERATOR: 'moderator',
  /** Standard user role with basic system access */
  USER: 'user',
  /** Limited access role for unauthenticated or restricted users */
  GUEST: 'guest',
} as const;

/**
 * TypeScript type representing all available system role strings.
 *
 * This type provides compile-time safety when working with role constants.
 * It automatically includes all roles defined in SYSTEM_ROLES.
 *
 * Usage Examples:
 * - function assignRole(role: SystemRole) { ... }
 * - const adminRoles: SystemRole[] = ['super_admin', 'admin']
 */
export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
