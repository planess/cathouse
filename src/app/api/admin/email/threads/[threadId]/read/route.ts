import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasAnyPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

export const runtime = 'nodejs';

type MarkReadResponse = {
  success: boolean;
  message: string;
};

function json(body: MarkReadResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return json({ success: false, message: 'User not authenticated.' }, 401);
  }

  const canReadEmail = await hasAnyPermission(
    [SYSTEM_PERMISSIONS.EMAIL_READ, SYSTEM_PERMISSIONS.EMAIL_SEND],
    undefined,
    currentUser.id,
  );

  if (!canReadEmail) {
    return json({ success: false, message: 'Insufficient permissions.' }, 403);
  }

  try {
    const { threadId } = await params;

    await emailService.markThreadMessagesAsRead(
      threadId,
      currentUser.id.toString(),
    );

    return json({ success: true, message: 'Messages marked as read.' });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to mark messages as read.';
    const status = ['Invalid thread id.', 'Invalid user id.'].includes(message)
      ? 400
      : 500;

    await logDevelopmentError('email.api.threadMessages.markRead', error, {
      route: '/api/admin/email/threads/[threadId]/read',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message }, status);
  }
}
