/**
 * Represents a role in the RBAC system.
 *
 * Roles are collections of permissions that define what users can do.
 * They can inherit permissions from other roles, creating a hierarchy.
 *
 * Examples:
 * - "Admin" role might have permissions: ["objectId1", "objectId2", "objectId3"]
 * - "Moderator" role might inherit from "User" and add: ["objectId4"]
 *
 * Users are assigned roles, and the system checks if their roles have the required permissions.
 */
export interface Role {
  /** Unique identifier for the role - used in database queries and user assignments */
  _id: string; // MongoDB ObjectId as string
  /** Human-readable name for the role (e.g., "Super Admin", "Moderator", "User") */
  name: string;
  /** Detailed description explaining what this role represents and its purpose */
  description: string;
  /** Array of permission IDs that this role grants to users - defines what actions users with this role can perform */
  permissions: string[]; // Permission IDs
  /** Array of role IDs that this role inherits from - allows roles to automatically get permissions from other roles */
  inheritsFrom: string[]; // Role IDs to inherit from
  /** Whether this role is currently active and can be assigned to users - inactive roles are ignored in permission checks */
  isActive: boolean;
  /** Timestamp when the role was first created in the system */
  createdAt: string; // ISO date string;
  /** User ID of the creator */
  createdBy: string; // User ID of the creator
}
