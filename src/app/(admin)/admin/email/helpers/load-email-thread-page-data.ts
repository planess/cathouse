import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requireAnyPermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

import type { EmailThreadPageData } from '../types/email-thread-page-data';
import type { LoadEmailThreadPageDataOptions } from '../types/load-email-thread-page-data-options';

export async function loadEmailThreadPageData({
  mailboxId,
  threadId,
}: LoadEmailThreadPageDataOptions): Promise<EmailThreadPageData | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return null;
  }

  await requireAnyPermission([
    SYSTEM_PERMISSIONS.EMAIL_READ,
    SYSTEM_PERMISSIONS.EMAIL_SEND,
  ]);

  try {
    const [thread, messages] = await Promise.all([
      emailService.getThread(threadId),
      emailService.listMessagesByThread(threadId, currentUser.id.toString()),
    ]);

    return {
      messages,
      thread,
    };
  } catch (error) {
    await logDevelopmentError('email.threadPage.loadThreadMessages', error, {
      mailboxId,
      route: '/admin/email/[mailboxId]/[threadId]',
      threadId,
      userId: currentUser.id.toString(),
    });

    throw error;
  }
}
