import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { Role } from '@app/models/db/role';
import type { SystemPermission } from '@app/models/system-permissions';

import { Singleton } from './singleton';

export interface ResolvedUserPermissions {
  /** Array of resolved permission strings in format "resource:action" */
  permissions: SystemPermission[];
  /** Array of role names the user has (for display purposes) */
  roles: string[];
  /** Timestamp when permissions were resolved */
  resolvedAt: number;
}

export interface UserAccessContext {
  /** User ID to check permissions for */
  userId: ObjectId;
  /** Optional context (e.g., "shelter", "admin", etc.) */
  context?: string;
  /** Cache permissions for this duration (in milliseconds) */
  cacheDuration?: number;
}

/**
 * Service for resolving user permissions through role hierarchy
 * and providing access verification functions.
 */
export class PermissionResolverService extends Singleton {
  private readonly permissionCache = new Map<
    string,
    { permissions: ResolvedUserPermissions; expiresAt: number }
  >();

  /**
   * Resolve all permissions for a user by flattening role hierarchy
   */
  async resolveUserPermissions(
    context: UserAccessContext,
  ): Promise<ResolvedUserPermissions> {
    const cacheKey = `${context.userId.toString()}:${context.context ?? 'default'}`;
    const cached = this.permissionCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.permissions;
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();

    try {
      // Get user's active roles
      const user = await db.collection(DbTables.users).findOne({
        _id: context.userId,
      });

      if (user === null) {
        const emptyResult = {
          permissions: [] as SystemPermission[],
          roles: [],
          resolvedAt: Date.now(),
        };
        this.cacheResult(cacheKey, emptyResult, context.cacheDuration);

        return emptyResult;
      }

      const roleIds = user.roles;

      // Get all roles and resolve inheritance
      const allRoles = await this.resolveRoleHierarchy(roleIds);
      const allPermissionIds = this.extractAllPermissionIds(allRoles);

      // Get permission details
      const permissions = await db
        .collection(DbTables.permissions)
        .find({
          _id: { $in: [...allPermissionIds] },
          isActive: true,
        })
        .toArray();

      const resolvedPermissions: SystemPermission[] = permissions.map(
        ({ resource, action }) => `${resource}:${action}` as SystemPermission,
      );

      const roles = allRoles.map((role) => role.name);

      const result: ResolvedUserPermissions = {
        permissions: resolvedPermissions,
        roles,
        resolvedAt: Date.now(),
      };

      this.cacheResult(cacheKey, result, context.cacheDuration);

      return result;
    } catch (error) {
      console.error('Error resolving user permissions:', error);
      return {
        permissions: [],
        roles: [],
        resolvedAt: Date.now(),
      };
    }
  }

  /**
   * Recursively resolve role inheritance hierarchy
   */
  private async resolveRoleHierarchy(roleIds: ObjectId[]): Promise<Role[]> {
    const allRoles = new Map<ObjectId, Role>();
    const visited = new Set<ObjectId>();
    const unvisitedRoleIds = roleIds.filter((id) => !visited.has(id));

    if (unvisitedRoleIds.length === 0) {
      return [];
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();

    const roles = await db
      .collection(DbTables.roles)
      .find<Role>({
        _id: { $in: unvisitedRoleIds },
        isActive: true,
      })
      .toArray();

    for (const role of roles) {
      const roleId = role._id;

      visited.add(roleId);

      allRoles.set(roleId, role);

      // Recursively resolve inherited roles
      if (role.inherits?.length > 0) {
        const result = await this.resolveRoleHierarchy(role.inherits);

        for (const inheritedRole of result) {
          allRoles.set(inheritedRole._id, inheritedRole);
        }
      }
    }

    return [...allRoles.values()];
  }

  /**
   * Extract all unique permission IDs from resolved roles
   */
  private extractAllPermissionIds(roles: Role[]): Set<ObjectId> {
    const permissionIds = new Set<ObjectId>();

    for (const role of roles) {
      for (const permissionId of role.permissions) {
        permissionIds.add(permissionId);
      }
    }

    return permissionIds;
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: ObjectId,
    permission: SystemPermission,
    context?: string,
  ): Promise<boolean> {
    const userPermissions = await this.resolveUserPermissions({
      userId,
      context,
      cacheDuration: 5 * 60 * 1000, // 5 minutes cache
    });

    return userPermissions.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: ObjectId,
    permissions: SystemPermission[],
    context?: string,
  ): Promise<boolean> {
    const userPermissions = await this.resolveUserPermissions({
      userId,
      context,
      cacheDuration: 5 * 60 * 1000,
    });

    return permissions.some((permission) =>
      userPermissions.permissions.includes(permission),
    );
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: ObjectId,
    permissions: SystemPermission[],
    context?: string,
  ): Promise<boolean> {
    const userPermissions = await this.resolveUserPermissions({
      userId,
      context,
      cacheDuration: 5 * 60 * 1000,
    });

    return permissions.every((permission) =>
      userPermissions.permissions.includes(permission),
    );
  }

  /**
   * Get user permissions for frontend consumption
   */
  async getUserPermissions(
    userId: ObjectId,
    context?: string,
  ): Promise<SystemPermission[]> {
    const userPermissions = await this.resolveUserPermissions({
      userId,
      context,
      cacheDuration: 10 * 60 * 1000, // 10 minutes cache for frontend
    });

    return userPermissions.permissions;
  }

  /**
   * Clear permission cache for a user
   */
  clearUserCache(userId: ObjectId, context?: string): void {
    const cacheKey = `${userId.toString()}:${context ?? 'default'}`;

    this.permissionCache.delete(cacheKey);
  }

  /**
   * Clear all permission caches
   */
  clearAllCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Cache resolved permissions
   */
  private cacheResult(
    cacheKey: string,
    permissions: ResolvedUserPermissions,
    cacheDuration?: number,
  ): void {
    const duration = cacheDuration ?? 5 * 60 * 1000; // Default 5 minutes

    this.permissionCache.set(cacheKey, {
      permissions,
      expiresAt: Date.now() + duration,
    });
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();

    for (const [key, value] of this.permissionCache.entries()) {
      if (value.expiresAt <= now) {
        this.permissionCache.delete(key);
      }
    }
  }
}
