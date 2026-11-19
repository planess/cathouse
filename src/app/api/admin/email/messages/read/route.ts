import { createJsonResponse as json } from '@app/helpers/create-json-response';
import { getUserFromRequest } from '@app/hooks/get-user-from-request';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasAnyPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

export const runtime = 'nodejs';

/** Maximum number of message ids accepted in one request. */
const MAX_MESSAGE_IDS = 500;

/**
 * Marks a batch of messages as read by the current user.
 *
 * Body: `{ "messageIds": string[] }`. Responds with the ids whose read state
 * was saved in `markedMessageIds`; ids of outgoing or missing messages are
 * skipped.
 */
export async function POST(request: Request) {
  const currentUser = await getUserFromRequest(request);

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

  let messageIds: string[];

  try {
    const payload = (await request.json()) as { messageIds?: unknown };

    if (
      !Array.isArray(payload.messageIds) ||
      !payload.messageIds.every((messageId) => typeof messageId === 'string')
    ) {
      return json({ success: false, message: 'Invalid message ids.' }, 400);
    }

    messageIds = payload.messageIds;
  } catch {
    return json({ success: false, message: 'Invalid request body.' }, 400);
  }

  if (messageIds.length > MAX_MESSAGE_IDS) {
    return json(
      {
        success: false,
        message: `At most ${MAX_MESSAGE_IDS} message ids are allowed.`,
      },
      400,
    );
  }

  try {
    const markedMessageIds = await emailService.markMessagesAsRead(
      messageIds,
      currentUser.id.toString(),
    );

    return json({
      success: true,
      message: 'Messages marked as read.',
      markedMessageIds,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to mark messages as read.';
    const status = ['Invalid message id.', 'Invalid user id.'].includes(
      message,
    )
      ? 400
      : 500;

    await logDevelopmentError('email.api.messages.markRead', error, {
      route: '/api/admin/email/messages/read',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message }, status);
  }
}
