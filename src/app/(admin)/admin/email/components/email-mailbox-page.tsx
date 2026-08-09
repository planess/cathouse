import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import { loadMailboxThreadGroups } from '../helpers/load-mailbox-thread-groups';

import { EmailMailboxTabs } from './mailbox-tabs';

type EmailMailboxPageProps = {
  route: string;
  selectedMailboxId?: string;
};

export async function EmailMailboxPage({
  route,
  selectedMailboxId,
}: EmailMailboxPageProps) {
  const mailboxGroups = await loadMailboxThreadGroups({
    mailboxId: selectedMailboxId,
    route,
    scope:
      selectedMailboxId === undefined
        ? 'email.page.listMailboxThreadGroups'
        : 'email.mailboxPage.listMailboxThreadGroups',
  });

  if (mailboxGroups === null) {
    return null;
  }
  const canSend = await hasPermission(SYSTEM_PERMISSIONS.EMAIL_SEND);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Mailboxes
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View and reply to organization emails.
          </p>
        </div>
        <input
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 md:max-w-xs"
          placeholder="Search emails..."
          type="search"
        />
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950">
        <EmailMailboxTabs
          mailboxGroups={mailboxGroups}
          canSend={canSend}
          selectedMailboxId={selectedMailboxId}
        />
      </section>
    </div>
  );
}
