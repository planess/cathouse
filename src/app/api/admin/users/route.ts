import { NextRequest, NextResponse } from 'next/server';

import { RBACService } from '@app/services/rbac.service';

const rbacService = RBACService.getInstance();

// GET /api/admin/users - Get all users with their roles
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication and permission check
    // const hasPermission = await rbacService.hasPermission({
    //   userId: getCurrentUserId(),
    //   resource: 'user',
    //   action: 'read'
    // });
    
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const dbClient = await (await import('@app/ins/mongo-client')).default;
    const db = dbClient.db();
    
    const users = await db
      .collection('users')
      .find({ isActive: true })
      .sort({ name: 1 })
      .toArray();

    // Get roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await db
          .collection('user_roles')
          .find({
            userId: user.id,
            isActive: true,
            $or: [
              { expiresAt: { $exists: false } },
              { expiresAt: { $gt: Date.now() } }
            ]
          })
          .toArray();

        const roleIds = userRoles.map(ur => ur.roleId);
        const roles = await db
          .collection('roles')
          .find({ id: { $in: roleIds } })
          .toArray();

        return {
          ...user,
          roles: roles.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description
          }))
        };
      })
    );

    return NextResponse.json({ users: usersWithRoles });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users/:id/roles - Assign a role to a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication and permission check
    // const hasPermission = await rbacService.hasPermission({
    //   userId: getCurrentUserId(),
    //   resource: 'role',
    //   action: 'assign'
    // });
    
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const body = await request.json();
    const { roleId, context, expiresAt } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // TODO: Get current user ID from session
    const grantedBy = 'current-user-id';

    const success = await rbacService.assignRole(
      params.id,
      roleId,
      grantedBy,
      context,
      expiresAt ? new Date(expiresAt).getTime() : undefined
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to assign role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/:id/roles/:roleId - Remove a role from a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  try {
    // TODO: Add authentication and permission check
    // const hasPermission = await rbacService.hasPermission({
    //   userId: getCurrentUserId(),
    //   resource: 'role',
    //   action: 'assign'
    // });
    
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const context = searchParams.get('context') || undefined;

    const success = await rbacService.removeRole(
      params.id,
      params.roleId,
      context
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing role:', error);
    return NextResponse.json(
      { error: 'Failed to remove role' },
      { status: 500 }
    );
  }
}
