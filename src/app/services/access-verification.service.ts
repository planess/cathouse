import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';

import type { SystemPermission } from '@app/models/system-permissions';
import { PermissionResolverService } from '@app/services/permission-resolver.service';

import { Singleton } from './singleton';

interface PageAccessConfig {
  /** Required permissions (user must have ALL of these) */
  requiredPermissions?: SystemPermission[];
  /** Alternative permissions (user must have ANY of these) */
  anyOfPermissions?: SystemPermission[];
  /** Context for permission checking */
  context?: string;
  /** Custom redirect path if access denied */
  unauthorizedRedirect?: string;
  /** Allow access in development mode */
  allowInDevelopment?: boolean;
}

interface AccessCheckResult {
  /** Whether user has access */
  hasAccess: boolean;
  /** User's resolved permissions */
  userPermissions: SystemPermission[];
  /** Reason for access denial (if applicable) */
  denialReason?: string;
}

/**
 * Service for verifying user access to pages and components
 */
class AccessVerificationService extends Singleton {
  private readonly permissionResolver =
    PermissionResolverService.getInstance<PermissionResolverService>();

  /**
   * Check if user has access based on configuration
   */
  async checkAccess(
    userId: ObjectId,
    config: PageAccessConfig,
  ): Promise<AccessCheckResult> {
    // Allow access in development if configured
    if (
      config.allowInDevelopment !== false &&
      process.env.NODE_ENV === 'development'
    ) {
      return {
        hasAccess: true,
        userPermissions: [],
        denialReason: undefined,
      };
    }

    const userPermissions =
      await this.permissionResolver.getUserPermissions(
        userId,
        config.context,
      );

    let hasAccess = true;
    let denialReason: string | undefined;

    // Check required permissions (ALL must be present)
    if (config.requiredPermissions && config.requiredPermissions.length > 0) {
      const missingPermissions = config.requiredPermissions.filter(
        (permission) => !userPermissions.includes(permission),
      );

      if (missingPermissions.length > 0) {
        hasAccess = false;
        denialReason = `Missing required permissions: ${missingPermissions.join(', ')}`;
      }
    }

    // Check alternative permissions (ANY must be present)
    if (
      hasAccess &&
      config.anyOfPermissions &&
      config.anyOfPermissions.length > 0
    ) {
      const hasAnyPermission = config.anyOfPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAnyPermission) {
        hasAccess = false;
        denialReason = `Missing any of required permissions: ${config.anyOfPermissions.join(', ')}`;
      }
    }

    return {
      hasAccess,
      userPermissions,
      denialReason,
    };
  }

  /**
   * Verify access and redirect if unauthorized (for Server Components)
   */
  async verifyPageAccess(
    userId: ObjectId,
    config: PageAccessConfig,
  ): Promise<AccessCheckResult> {
    const accessResult = await this.checkAccess(userId, config);

    if (!accessResult.hasAccess) {
      const redirectPath = config.unauthorizedRedirect ?? '/unauthorized';
      
      redirect(redirectPath);
    }

    return accessResult;
  }

  /**
   * Create a higher-order function for protecting pages
   */
  createPageGuard(config: PageAccessConfig) {
    return async (userId: ObjectId) => {
      return this.verifyPageAccess(userId, config);
    };
  }

  /**
   * Verify access for API routes
   */
  async verifyApiAccess(
    userId: ObjectId,
    config: PageAccessConfig,
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    const accessResult = await this.checkAccess(userId, config);

    if (!accessResult.hasAccess) {
      return {
        success: false,
        error: accessResult.denialReason ?? 'Access denied',
        status: 403,
      };
    }

    return { success: true };
  }
}

/**
 * Optimized utility functions for common access patterns
 * Uses cached service instances for better performance
 */

// Cache service instances to avoid repeated instantiation
const accessServiceInstance =
  AccessVerificationService.getInstance<AccessVerificationService>();
const permissionResolverInstance =
  PermissionResolverService.getInstance<PermissionResolverService>();

/**
 * Require user to have specific permission
 */
export async function requirePermission(
  userId: ObjectId,
  permission: SystemPermission,
  context?: string,
): Promise<void> {
  await accessServiceInstance.verifyPageAccess(userId, {
    requiredPermissions: [permission],
    context,
  });
}

/**
 * Require user to have any of the specified permissions
 */
export async function requireAnyPermission(
  userId: ObjectId,
  permissions: SystemPermission[],
  context?: string,
): Promise<void> {
  await accessServiceInstance.verifyPageAccess(userId, {
    anyOfPermissions: permissions,
    context,
  });
}

/**
 * Require user to have all specified permissions
 */
export async function requireAllPermissions(
  userId: ObjectId,
  permissions: SystemPermission[],
  context?: string,
): Promise<void> {
  await accessServiceInstance.verifyPageAccess(userId, {
    requiredPermissions: permissions,
    context,
  });
}

/**
 * Check if user has permission without redirecting
 */
export async function hasPermission(
  userId: ObjectId,
  permission: SystemPermission,
  context?: string,
): Promise<boolean> {
  return permissionResolverInstance.hasPermission(userId, permission, context);
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: ObjectId,
  permissions: SystemPermission[],
  context?: string,
): Promise<boolean> {
  return permissionResolverInstance.hasAnyPermission(
    userId,
    permissions,
    context,
  );
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(
  userId: ObjectId,
  permissions: SystemPermission[],
  context?: string,
): Promise<boolean> {
  return permissionResolverInstance.hasAllPermissions(
    userId,
    permissions,
    context,
  );
}

/**
 * Get all user permissions
 */
export async function getUserPermissions(
  userId: ObjectId,
  context?: string,
): Promise<SystemPermission[]> {
  return permissionResolverInstance.getUserPermissions(
    userId,
    context,
  );
}
