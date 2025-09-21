import { NextRequest, NextResponse } from 'next/server';

import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { AccessVerificationService } from '@app/services/access-verification.service';
import { requirePermission, requireAnyPermission, hasPermission } from '@app/services/access-verification.service';

/**
 * Example API route demonstrating permission verification
 */
export async function GET(request: NextRequest) {
  // Get user ID from request (from session, JWT, etc.)
  const userId = request.headers.get('x-user-id'); // Example header
  
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Method 1: Using the service directly
    const accessService = AccessVerificationService.getInstance();
    const apiAccessResult = await accessService.verifyApiAccess(userId, {
      requiredPermissions: [SYSTEM_PERMISSIONS.USER_READ],
    });

    if (!apiAccessResult.success) {
      return NextResponse.json(
        { error: apiAccessResult.error },
        { status: apiAccessResult.status },
      );
    }

    // Method 2: Using utility functions
    const canManageUsers = await hasPermission(userId, SYSTEM_PERMISSIONS.USER_UPDATE);
    const canModerate = await hasPermission(userId, SYSTEM_PERMISSIONS.HELP_REQUEST_APPROVE);

    return NextResponse.json({
      message: 'Access granted',
      permissions: {
        canManageUsers,
        canModerate,
      },
    });

  } catch (error) {
    console.error('Permission check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Example API route requiring admin permissions
 */
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Require admin-level permissions
    const accessService = AccessVerificationService.getInstance();
    const accessResult = await accessService.verifyApiAccess(userId, {
      anyOfPermissions: [
        SYSTEM_PERMISSIONS.SYSTEM_CONFIG,
        SYSTEM_PERMISSIONS.ROLE_CREATE,
        SYSTEM_PERMISSIONS.USER_DELETE,
      ],
    });

    if (!accessResult.success) {
      return NextResponse.json(
        { error: accessResult.error },
        { status: accessResult.status },
      );
    }

    // Process admin request
    return NextResponse.json({ message: 'Admin operation completed' });

  } catch (error) {
    console.error('Admin operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}