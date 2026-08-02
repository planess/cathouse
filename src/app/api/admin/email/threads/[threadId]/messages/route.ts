import { NextResponse } from 'next/server';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { parseEmailRecipientInputJson } from '@app/services/email/parse-email-recipient-input-json';
import {
  EmailMessageSummary,
  SendMailboxThreadReplyPayload,
  emailService,
} from '@app/services/email.service';

export const runtime = 'nodejs';

type MessagesResponse = {
  success: boolean;
  message: string;
  messages: EmailMessageSummary[];
  messageItem?: EmailMessageSummary;
};

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;

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
    const messages = await emailService.listMessagesByThread(
      threadId,
      currentUser.id.toString(),
    );

    return json({
      success: true,
      message: 'Messages loaded.',
      messages,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load messages.';
    const status = message === 'Invalid thread id.' ? 400 : 500;

    await logDevelopmentError('email.api.threadMessages.list', error, {
      route: '/api/admin/email/threads/[threadId]/messages',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message, messages: [] }, status);
  }
}

export async function POST(
  request: Request,
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
    const formData = await request.formData();
    const attachmentFiles = formData
      .getAll('attachments')
      .filter((entry): entry is File => entry instanceof File);

    if (attachmentFiles.length > MAX_ATTACHMENTS) {
      return json(
        {
          success: false,
          message: `Maximum ${MAX_ATTACHMENTS} attachments allowed.`,
          messages: [],
        },
        400,
      );
    }

    const attachments = await Promise.all(
      attachmentFiles
        .filter((file) => file.size > 0)
        .map(async (file) => {
          if (file.size > MAX_ATTACHMENT_SIZE) {
            throw new Error(`File ${file.name} exceeds 10MB limit.`);
          }

          return {
            data: Buffer.from(await file.arrayBuffer()),
            filename: file.name,
          };
        }),
    );
    const payload: SendMailboxThreadReplyPayload = {
      mailboxId: (formData.get('mailboxId') as string | null) ?? '',
      threadId,
      to: parseEmailRecipientInputJson(formData.get('to')),
      cc: parseEmailRecipientInputJson(formData.get('cc')),
      bcc: parseEmailRecipientInputJson(formData.get('bcc')),
      bodyHtml: (formData.get('bodyHtml') as string | null) ?? '',
      attachments,
    };
    const result = await emailService.sendMailboxThreadReply(payload);

    return json({
      success: true,
      message: 'Email sent.',
      messages: [],
      messageItem: result.message,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to send email.';
    const status = [
      'Invalid mailbox id.',
      'Invalid thread id.',
      'Mailbox not found.',
      'Thread not found.',
      'Invalid recipient email.',
      'Email body is required.',
      'At least one recipient email is required.',
    ].includes(message)
      ? 400
      : 500;

    await logDevelopmentError('email.api.threadMessages.reply', error, {
      route: '/api/admin/email/threads/[threadId]/messages',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message, messages: [] }, status);
  }
}
