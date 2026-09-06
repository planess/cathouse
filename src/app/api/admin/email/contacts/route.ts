import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import {
  hasAnyPermission,
  hasPermission,
} from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

/** Returns contact suggestions matching a name or email fragment. */
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

/** Creates an external email contact. */
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { success: false, message: 'User not authenticated.' },
      { status: 401 },
    );
  }

  if (
    !(await hasPermission(
      SYSTEM_PERMISSIONS.EMAIL_SEND,
      undefined,
      user.id,
    ))
  ) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions.' },
      { status: 403 },
    );
  }

  try {
    const payload = (await request.json()) as {
      address?: unknown;
      name?: unknown;
    };

    if (
      typeof payload.address !== 'string' ||
      typeof payload.name !== 'string'
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid contact.' },
        { status: 400 },
      );
    }

    const contact = await emailService.createEmailContact(
      payload.name,
      payload.address,
    );

    return NextResponse.json({
      success: true,
      message: 'Contact created.',
      contact,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create contact.';
    const status = [
      'Invalid recipient email.',
      'Organization mailbox cannot be added as a contact.',
    ].includes(message)
      ? 400
      : message === 'Contact already exists.'
        ? 409
        : 500;

    await logDevelopmentError('email.api.contacts.create', error, {
      route: '/api/admin/email/contacts',
      status,
      userId: user.id.toString(),
    });

    return NextResponse.json({ success: false, message }, { status });
  }
}
