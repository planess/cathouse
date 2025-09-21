/**
 * Represents the assignment of a role to a specific user.
 *
 * This is the junction table that connects users to their roles.
 * It supports context-aware assignments and temporary role grants.
 *
 * Examples:
 * - User "john" gets "Moderator" role for "project:123" context
 * - User "jane" gets "Admin" role globally (no context) until "2024-12-31"
 *
 * The system checks these assignments to determine user permissions.
 */
export interface UserRole {
    /** The user ID who is being assigned this role */
    userId: string;
    /** The role ID being assigned to the user */
    roleId: string;
    /** Optional context for the role assignment (e.g., 'project:123', 'organization:456') - allows same role with different scopes */
    context?: string; // Optional context (e.g., 'project:123', 'organization:456')
    /** The user ID who granted this role to the user - for audit trail and accountability */
    grantedBy: string; // User ID who granted this role
    /** Timestamp when the role was assigned to the user */
    grantedAt: number;
    /** Optional timestamp when this role assignment expires - after this time, the role is automatically deactivated */
    expiresAt?: number; // Optional expiration
    /** Whether this role assignment is currently active - inactive assignments are ignored in permission checks */
    isActive: boolean;
}
