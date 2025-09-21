import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { Permission } from '@app/models/permission';
import type { PermissionCheck } from '@app/models/permission-check';
import type { Role } from '@app/models/role';
import type { SystemPermission } from '@app/models/system-permissions';

import { PermissionResolverService } from './permission-resolver.service';
import { Singleton } from './singleton';

/**
 * Enhanced RBAC Service with optimized permission resolution
 * Uses PermissionResolverService for all permission checks to ensure consistency and caching
 */
export class RBACService extends Singleton {
  /**
   * Assign a role to a user with automatic cache invalidation
   */
  async assignRole(
    userId: ObjectId,
    roleId: ObjectId,
    context?: string,
    expiresAt?: number,
  ): Promise<{ success: boolean; error?: string }> {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    try {
      // Check if role exists and is active
      const role = await db
        .collection(DbTables.roles)
        .findOne({ _id: new ObjectId(roleId), isActive: true });

      if (!role) {
        return { success: false, error: 'Role not found or inactive' };
      }

      const uid = new ObjectId(userId);

      // Create new role assignment
      await db
        .collection(DbTables.users)
        .updateOne(
          { _id: uid },
          { $addToSet: { roles: new ObjectId(roleId) } },
        );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Remove a role from a user with automatic cache invalidation
   */
  async removeRoleForUser(
    userId: ObjectId,
    roleId: ObjectId,
    context?: string,
  ): Promise<{ success: boolean; error?: string }> {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    try {
      const result = await db
        .collection(DbTables.users)
        .updateOne({ _id: userId }, { $pull: { roles: roleId } });

      return {
        success: true,
        error:
          result.modifiedCount === 0
            ? 'No active role assignments found'
            : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new role
   */
  async createRole(
    {
      name,
      description,
      permissions,
      inheritsFrom,
    }: Pick<Role, 'name' | 'description' | 'permissions' | 'inheritsFrom'>,
    userID: ObjectId,
  ): Promise<ObjectId | null> {
    try {
      const dbClient = await clientPromise;
      const db = dbClient.db();

      const record = await db.collection(DbTables.roles).insertOne({
        name,
        description,
        permissions: permissions.map((code) => new ObjectId(code)),
        inherits: inheritsFrom.map((id) => new ObjectId(id)),
        isActive: true,
        createdAt: new Date(),
        createdBy: userID,
      });

      return record.insertedId;
    } catch {
      return null;
    }
  }

  /**
   * Create a new permission
   */
  async createPermission(
    {
      name,
      description,
      resource,
      action,
    }: Omit<Permission, '_id' | 'createdAt' | 'updatedAt'>,
    userID: ObjectId,
  ): Promise<ObjectId | null> {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    try {
      const { insertedId } = await db
        .collection(DbTables.permissions)
        .insertOne({
          name,
          description,
          resource,
          action,
          isActive: true,
          createdBy: userID,
          createdAt: new Date(),
        });

      return insertedId;
    } catch {
      return null;
    }
  }

  // attach permission to role
  async attachPermissionToRole(
    roleId: ObjectId,
    permissionId: ObjectId[],
  ): Promise<{ success: boolean; error?: string }> {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    try {
      await db
        .collection(DbTables.roles)
        .updateOne(
          { _id: roleId },
          { $addToSet: { permissions: { $each: permissionId } } },
        );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // detach permission from role
  async detachPermissionFromRole(
    roleId: ObjectId,
    permissionId: ObjectId[],
  ): Promise<{ success: boolean; error?: string }> {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    try {
      await db
        .collection(DbTables.roles)
        .updateOne(
          { _id: roleId },
          { $pull: { permissions: { $in: permissionId } } },
        );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
