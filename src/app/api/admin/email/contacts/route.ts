import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasAnyPermission } from '@app/services/access-verification.service';
import { emailService } from '@app/services/email.service';

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { message: 'User not authenticated.' },
      { status: 401 },
    );
  }

  if (
    !(await hasAnyPermission(
      [SYSTEM_PERMISSIONS.EMAIL_READ, SYSTEM_PERMISSIONS.EMAIL_SEND],
      undefined,
      user.id,
    ))
  ) {
    return NextResponse.json(
      { message: 'Insufficient permissions.' },
      { status: 403 },
    );
  }

  const query = new URL(request.url).searchParams.get('query')?.trim() ?? '';

  if (query.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const items = await emailService.searchEmailContacts(query.slice(0, 100));

  return NextResponse.json({ items });
}
