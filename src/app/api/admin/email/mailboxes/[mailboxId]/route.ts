import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

export const runtime = 'nodejs';

type UpdateMailboxResponse = {
  success: boolean;
  message: string;
  mailbox?: Awaited<ReturnType<typeof emailService.updateMailboxDisplayName>>;
};

function json(body: UpdateMailboxResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ mailboxId: string }> },
) {
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

  const { mailboxId } = await context.params;

  try {
    const payload = (await request.json()) as { displayName?: unknown };

    if (typeof payload.displayName !== 'string') {
      return json(
        { success: false, message: 'Display name is required.' },
        400,
      );
    }

    const mailbox = await emailService.updateMailboxDisplayName(
      mailboxId,
      payload.displayName,
    );

    return json({ success: true, message: 'Sender name updated.', mailbox });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update sender name.';
    const status =
      message === 'Invalid mailbox id.' || message === 'Mailbox not found.'
        ? 404
        : 500;

    await logDevelopmentError('email.api.mailboxes.update', error, {
      mailboxId,
      route: '/api/admin/email/mailboxes/[mailboxId]',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message }, status);
  }
}
