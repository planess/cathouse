import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requirePermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';
import type { EmailMailboxThreadGroup } from '@app/services/email.service';

import type { LoadMailboxThreadGroupsOptions } from '../types/load-mailbox-thread-groups-options';

export async function loadMailboxThreadGroups({
  mailboxId,
  route,
  scope,
}: LoadMailboxThreadGroupsOptions): Promise<EmailMailboxThreadGroup[] | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return null;
  }

  await requirePermission(SYSTEM_PERMISSIONS.EMAIL_SEND);

  try {
    return await emailService.listMailboxThreadGroups();
  } catch (error) {
    await logDevelopmentError(scope, error, {
      mailboxId,
      route,
      userId: currentUser.id.toString(),
    });

    throw error;
  }
}
