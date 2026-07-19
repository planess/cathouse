import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import {
  EmailMessageSummary,
  emailService,
} from '@app/services/email.service';

export const runtime = 'nodejs';

type MessagesResponse = {
  success: boolean;
  message: string;
  messages: EmailMessageSummary[];
};

function json(body: MessagesResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return json(
      {
        success: false,
        message: 'User not authenticated.',
        messages: [],
      },
      401,
    );
  }

  const canSendEmail = await hasPermission(
    SYSTEM_PERMISSIONS.EMAIL_SEND,
    undefined,
    currentUser.id,
  );

  if (!canSendEmail) {
    return json(
      {
        success: false,
        message: 'Insufficient permissions.',
        messages: [],
      },
      403,
    );
  }

  try {
    const { threadId } = await params;
    const messages = await emailService.listMessagesByThread(threadId);

    return json({
      success: true,
      message: 'Messages loaded.',
      messages,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load messages.';
    const status = message === 'Invalid thread id.' ? 400 : 500;

    await logDevelopmentError('email2.api.threadMessages.list', error, {
      route: '/api/admin/email/threads/[threadId]/messages',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message, messages: [] }, status);
  }
}
