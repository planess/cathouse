import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { parseEmailRecipientInputJson } from '@app/services/email/parse-email-recipient-input-json';
import {
  EmailThreadSummary,
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
    const formData = await request.formData();
    const attachments = formData
      .getAll('attachments')
      .filter((entry): entry is File => entry instanceof File);
    const result = await emailService.sendMailboxEmail({
      mailboxId: (formData.get('mailboxId') as string | null) ?? '',
      attachments,
      to: parseEmailRecipientInputJson(formData.get('to')),
      cc: parseEmailRecipientInputJson(formData.get('cc')),
      bcc: parseEmailRecipientInputJson(formData.get('bcc')),
      subject: (formData.get('subject') as string | null) ?? '',
      bodyHtml: (formData.get('bodyHtml') as string | null) ?? '',
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
    ].includes(message) || message.includes('is too large.')
      ? 400
      : 500;

    await logDevelopmentError('email.api.threads.create', error, {
      route: '/api/admin/email/threads',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message }, status);
  }
}
