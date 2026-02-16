import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { array, object, string, ZodError } from 'zod';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import { RBACService } from '@app/services/rbac.service';

const rbacService = RBACService.getInstance<RBACService>();

const RoleValidator = object({
  name: string().min(3),
  description: string(),
  permissions: array(string()).min(1),
  inheritsFrom: array(string()),
});

type RawRoleDocument = {
  _id: ObjectId;
  name: string;
  description?: string;
  permissions?: ObjectId[];
  inherits?: ObjectId[];
  isActive?: boolean;
  createdAt?: Date | string;
  createdBy?: ObjectId | string;
};

type NormalizedRole = {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  inheritsFrom: string[];
  resolvedPermissions?: string[];
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
};

const normalizeRoleDocument = (role: RawRoleDocument): NormalizedRole => {
  const permissions = (role.permissions ?? []).map((id) => id.toString());
  const inheritsFrom = (role.inherits ?? []).map((id) => id.toString());
  const createdAt =
    typeof role.createdAt === 'string'
      ? role.createdAt
      : role.createdAt?.toISOString();

  return {
    _id: role._id.toString(),
    name: role.name,
    description: role.description ?? '',
    permissions,
    inheritsFrom,
    isActive: role.isActive ?? false,
    createdAt,
    createdBy:
      typeof role.createdBy === 'string'
        ? role.createdBy
        : role.createdBy?.toString(),
  };
};

const resolvePermissionsWithInheritance = (
  roles: NormalizedRole[],
): NormalizedRole[] => {
  const roleMap = new Map<string, NormalizedRole>();
  const resolvedCache = new Map<string, Set<string>>();

  for (const role of roles) {
    roleMap.set(role._id, role);
  }

  const resolvePermissions = (
    roleId: string,
    visiting: Set<string> = new Set(),
  ): Set<string> => {
    if (resolvedCache.has(roleId)) {
      return resolvedCache.get(roleId)!;
    }

    if (visiting.has(roleId)) {
      return new Set();
    }

    const role = roleMap.get(roleId);

    if (!role) {
      return new Set();
    }

    const aggregate = new Set(role.permissions);
    const nextVisiting = new Set(visiting);

    nextVisiting.add(roleId);

    for (const parentId of role.inheritsFrom) {
      const inheritedPermissions = resolvePermissions(parentId, nextVisiting);

      for (const permission of inheritedPermissions) {
        aggregate.add(permission);
      }
    }

    resolvedCache.set(roleId, aggregate);

    return aggregate;
  };

  return roles.map((role) => ({
    ...role,
    resolvedPermissions: [...resolvePermissions(role._id)],
  }));
};

// GET /api/admin/roles - Get all roles
export async function GET(_request: NextRequest) {
  // TODO: Add authentication and permission check
  // const hasPermission = await rbacService.hasPermission({
  //   userId: getCurrentUserId(),
  //   resource: 'role',
  //   action: 'read'
  // });

  // if (!hasPermission) {
  //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  // }

  try {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    const roles = await db
      .collection<RawRoleDocument>(DbTables.roles)
      .find({})
      .toArray();

    const normalizedRoles = roles.map(normalizeRoleDocument);
    const resolvedRoles = resolvePermissionsWithInheritance(normalizedRoles);

    return NextResponse.json({ roles: resolvedRoles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 },
    );
  }
}

// POST /api/admin/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const token = cookies.get('token')?.value;

    if (
      token === null ||
      token === undefined ||
      typeof token !== 'string' ||
      token.length <= 0
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();

    const activeSession = await db
      .collection(DbTables.sessions)
      .findOne({ token });

    if (!activeSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db
      .collection(DbTables.users)
      .findOne({ _id: activeSession.userID });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // todo: check permissions or 403 error

    const body = await request.json();

    let name: string;
    let description: string;
    let permissions: string[];
    let inheritsFrom: string[];

    try {
      ({ name, description, permissions, inheritsFrom } =
        RoleValidator.parse(body));
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.issues },
          { status: 400 },
        );
      }

      throw error;
    }

    const roleId = await rbacService.createRole(
      {
        name,
        description,
        permissions,
        inheritsFrom,
      },
      user._id,
    );

    if (roleId === null) {
      return NextResponse.json(
        { error: 'Failed to create role' },
        { status: 500 },
      );
    }

    return NextResponse.json({ roleId }, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 },
    );
  }
}
