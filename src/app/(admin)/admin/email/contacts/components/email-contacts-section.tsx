import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';
import { emailService } from '@app/services/email.service';

import { EmailContactsManager } from './email-contacts-manager';

/**
 * Async server component that loads contacts and the manage permission, then
 * renders the contacts manager. Meant to be wrapped in `Suspense` so the page
 * shell renders before the data arrives.
 */
export async function EmailContactsSection() {
  const [contacts, canManage] = await Promise.all([
    emailService.listEmailContacts(),
    hasPermission(SYSTEM_PERMISSIONS.EMAIL_SEND),
  ]);

  return (
    <EmailContactsManager canManage={canManage} initialContacts={contacts} />
  );
}
