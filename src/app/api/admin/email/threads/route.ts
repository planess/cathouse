import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import {
  EmailThreadSummary,
  SendMailboxEmailPayload,
  emailService,
} from '@app/services/email.service';

export const runtime = 'nodejs';

type SendMailboxEmailResponse = {
  success: boolean;
  message: string;
  thread?: EmailThreadSummary;
};

function json(body: SendMailboxEmailResponse, status = 200) {
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
    const payload = (await request.json()) as Partial<SendMailboxEmailPayload>;
    const result = await emailService.sendMailboxEmail({
      mailboxId: payload.mailboxId ?? '',
      to: payload.to ?? '',
      cc: payload.cc ?? '',
      bcc: payload.bcc ?? '',
      subject: payload.subject ?? '',
      bodyHtml: payload.bodyHtml ?? '',
    });

    return json({
      success: true,
      message: 'Email sent.',
      thread: result.thread,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to send email.';
    const status = [
      'Invalid mailbox id.',
      'Mailbox not found.',
      'Invalid recipient email.',
      'Subject is required.',
      'Email body is required.',
      'At least one recipient email is required.',
    ].includes(message)
      ? 400
      : 500;

    await logDevelopmentError('email2.api.threads.create', error, {
      route: '/api/admin/email/threads',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message }, status);
  }
}
