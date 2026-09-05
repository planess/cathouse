import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ mailboxId: string }> },
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { success: false, message: 'User not authenticated.' },
      { status: 401 },
    );
  }

  if (
    !(await hasPermission(SYSTEM_PERMISSIONS.EMAIL_SEND, undefined, user.id))
  ) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions.' },
      { status: 403 },
    );
  }

  const { mailboxId } = await params;

  try {
    const payload = (await request.json()) as {
      sourceThreadId?: unknown;
      targetThreadId?: unknown;
    };

    if (
      typeof payload.sourceThreadId !== 'string' ||
      typeof payload.targetThreadId !== 'string'
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid thread merge.' },
        { status: 400 },
      );
    }

    await emailService.mergeMailboxThreads(
      mailboxId,
      payload.sourceThreadId,
      payload.targetThreadId,
    );

    return NextResponse.json({
      success: true,
      message: 'Threads merged.',
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to merge threads.';
    const status =
      message === 'Invalid thread merge.'
        ? 400
        : message === 'Thread not found.'
          ? 404
          : 500;

    await logDevelopmentError('email.api.mailbox-threads.merge', error, {
      mailboxId,
      route: '/api/admin/email/mailboxes/[mailboxId]/threads/merge',
      status,
      userId: user.id.toString(),
    });

    return NextResponse.json({ success: false, message }, { status });
  }
}
