/**
 * Represents a single permission in the RBAC system.
 *
 * Permissions define what actions users can perform on specific resources.
 *
 * Examples:
 * - A permission with resource="user" and action="create" allows creating new users
 * - A permission with resource="help:request" and action="approve" allows approving help requests
 *
 * Permissions are grouped into roles, and users are assigned roles to gain access.
 */
export interface Permission {
  /** Unique identifier for the permission - used in database queries and role assignments */
  _id: string; // MongoDB ObjectId as string
  /** Human-readable name for the permission (e.g., "Create User", "Approve Help Request") */
  name: string;
  /** Detailed description explaining what this permission allows the user to do */
  description: string;
  /** The resource/entity this permission applies to (e.g., "user", "help:request", "history") */
  resource: string;
  /** The specific action allowed on the resource (e.g., "create", "read", "update", "delete", "approve") */
  action: string;
  /** Whether this permission is currently active and can be assigned to users - inactive permissions are ignored */
  isActive: boolean;
  /** Timestamp when the permission was first created in the system */
  createdAt: string; // ISO date string
  /** User ID of the creator */
  createdBy: string; // User ID of the creator
}
