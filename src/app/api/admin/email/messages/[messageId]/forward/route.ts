import { createJsonResponse as json } from '@app/helpers/create-json-response';
import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> },
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

  try {
    const { messageId } = await params;
    const payload = (await request.json()) as {
      mailboxId?: string;
      recipient?: string;
    };
    const result = await emailService.forwardMailboxMessage({
      mailboxId: payload.mailboxId ?? '',
      messageId,
      recipient: payload.recipient ?? '',
    });

    return json({
      success: true,
      message: 'Email forwarded.',
      messageItem: result.message,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to forward email.';
    const status = [
      'Invalid mailbox id.',
      'Invalid message id.',
      'Invalid recipient email.',
      'Mailbox not found.',
      'Message not found.',
      'Thread not found.',
    ].includes(message)
      ? 400
      : 500;

    await logDevelopmentError('email.api.messages.forward', error, {
      route: '/api/admin/email/messages/[messageId]/forward',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message }, status);
  }
}
