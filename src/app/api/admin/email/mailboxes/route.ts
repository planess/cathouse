import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import {
  EmailMailboxThreadGroup,
  emailService,
} from '@app/services/email.service';

export const runtime = 'nodejs';

type CreateMailboxResponse = {
  success: boolean;
  message: string;
  group?: EmailMailboxThreadGroup;
};

function json(body: CreateMailboxResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return json({ success: false, message: 'User not authenticated.' }, 401);
  }

  const canSendEmail = await hasPermission(
    SYSTEM_PERMISSIONS.EMAIL_SEND,
    undefined,
    currentUser.id,
  );

  if (!canSendEmail) {
    return json({ success: false, message: 'Insufficient permissions.' }, 403);
  }

  try {
    const payload = (await request.json()) as {
      prefix?: unknown;
      displayName?: unknown;
    };
    const prefix = typeof payload.prefix === 'string' ? payload.prefix : '';
    const displayName =
      typeof payload.displayName === 'string' ? payload.displayName : undefined;
    const mailbox = await emailService.createMailbox(prefix, displayName);

    return json({
      success: true,
      message: 'Mailbox created.',
      group: {
        mailbox,
        threads: [],
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create mailbox.';
    const status =
      message === 'Mailbox already exists.'
        ? 409
        : message === 'Invalid mailbox prefix.'
          ? 400
          : 500;

    await logDevelopmentError('email.api.mailboxes.create', error, {
      route: '/api/admin/email/mailboxes',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message }, status);
  }
}
