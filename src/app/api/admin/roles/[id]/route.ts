import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

// PUT /api/admin/roles/:id - Update a role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  try {
    // TODO: Add authentication and permission check
    // const hasPermission = await rbacService.hasPermission({
    //   userId: getCurrentUserId(),
    //   resource: 'role',
    //   action: 'update'
    // });

    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    const { name, description, permissions, inheritsFrom, isActive } =
      await request.json();
    const { id } = await params;

    const result = await db.collection(DbTables.roles).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...(name && { name }),
          ...(description && { description }),
          ...(permissions && {
            permissions: permissions.map((id: string) => new ObjectId(id)),
          }),
          ...(inheritsFrom && {
            inherits: inheritsFrom.map((id: string) => new ObjectId(id)),
          }),
          ...(typeof isActive === 'boolean' && { isActive }),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/roles/:id - Delete a role (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  try {
    // TODO: Add authentication and permission check
    // const hasPermission = await rbacService.hasPermission({
    //   userId: getCurrentUserId(),
    //   resource: 'role',
    //   action: 'delete'
    // });

    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    // }

    // Soft delete - mark as inactive
    const result = await db.collection(DbTables.roles).updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          isActive: false,
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 },
    );
  }
}
