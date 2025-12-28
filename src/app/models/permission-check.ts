/**
 * Represents a permission check request in the RBAC system.
 *
 * This interface is used when the system needs to verify if a user
 * has permission to perform a specific action on a specific resource.
 *
 * Examples:
 * - Check if user "john" can "create" "user" resources
 * - Check if user "jane" can "approve" "help:request" resources in "project:123" context
 *
 * The system uses this to make authorization decisions throughout the application.
 */
export interface PermissionCheck {
    /** The user ID whose permissions are being checked */
    userId: string;
    /** The resource/entity the user is trying to access */
    resource: string;
    /** The specific action the user is trying to perform on the resource */
    action: string;
    /** Optional context for the permission check - must match the context of the user's role assignment */
    context?: string;
}
