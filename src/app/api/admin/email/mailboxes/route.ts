import { createJsonResponse as json } from '@app/helpers/create-json-response';
import { getCurrentUser } from '@app/hooks/get-current-user';
import { getUserFromRequest } from '@app/hooks/get-user-from-request';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import {
  hasAnyPermission,
  hasPermission,
} from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

export const runtime = 'nodejs';

/** Lists mailboxes with their threads and whether the caller may send email. */
export async function GET(request: Request) {
  const currentUser = await getUserFromRequest(request);

  if (!currentUser?.id) {
    return json({ success: false, message: 'User not authenticated.' }, 401);
  }

  const [canReadEmail, canSend] = await Promise.all([
    hasAnyPermission(
      [SYSTEM_PERMISSIONS.EMAIL_READ, SYSTEM_PERMISSIONS.EMAIL_SEND],
      undefined,
      currentUser.id,
    ),
    hasPermission(SYSTEM_PERMISSIONS.EMAIL_SEND, undefined, currentUser.id),
  ]);

  if (!canReadEmail) {
    return json({ success: false, message: 'Insufficient permissions.' }, 403);
  }

  try {
    const groups = await emailService.listMailboxThreadGroups();

    return json({ success: true, message: 'Mailboxes loaded.', groups, canSend });
  } catch (error) {
    await logDevelopmentError('email.api.mailboxes.list', error, {
      route: '/api/admin/email/mailboxes',
      status: 500,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message: 'Failed to load mailboxes.' }, 500);
  }
}

export async function PATCH(request: Request) {
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
    const payload = (await request.json()) as { mailboxIds?: unknown };

    if (
      !Array.isArray(payload.mailboxIds) ||
      !payload.mailboxIds.every((mailboxId) => typeof mailboxId === 'string')
    ) {
      return json({ success: false, message: 'Invalid mailbox order.' }, 400);
    }

    await emailService.updateMailboxOrder(payload.mailboxIds);

    return json({ success: true, message: 'Mailbox order updated.' });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update mailbox order.';
    const status =
      message === 'Invalid mailbox order.'
        ? 400
        : message === 'Mailbox list changed. Refresh and try again.'
          ? 409
          : 500;

    await logDevelopmentError('email.api.mailboxes.order', error, {
      route: '/api/admin/email/mailboxes',
      status,
      userId: currentUser.id.toString(),
    });

    return json({ success: false, message }, status);
  }
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
