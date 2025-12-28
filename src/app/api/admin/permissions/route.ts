import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '@app/ins/mongo-client';

// GET /api/admin/permissions - Get all permissions
export async function GET(request: NextRequest) {
  // TODO: Add authentication and permission check
  // const hasPermission = await rbacService.hasPermission({
  //   userId: getCurrentUserId(),
  //   resource: 'permission',
  //   action: 'read'
  // });

  // if (!hasPermission) {
  //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  // }

  try {
    const dbClient = await clientPromise;
    const db = dbClient.db();

    const permissions = await db
      .collection('permissions')
      .find({})
      .toArray();

    return NextResponse.json({ permissions });
  } catch {
    // console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 },
    );
  }
}
