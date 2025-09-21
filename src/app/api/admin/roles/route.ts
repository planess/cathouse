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

// GET /api/admin/roles - Get all roles
export async function GET(request: NextRequest) {
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

    const roles = await db.collection(DbTables.roles).find({}).toArray();

    const transformedRoles = roles.map((role) => {
      const { inherits, ...rest } = role;

      return {
        ...rest,
        inheritsFrom: inherits as string[],
      };
    });

    return NextResponse.json({ roles: transformedRoles });
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
