import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requirePermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import { emailService } from '@app/services/email.service';

import { Email2MailboxTabs } from './components/mailbox-tabs';

import type { Metadata } from 'next';

export default async function Email2Page() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return null;
  }

  await requirePermission(SYSTEM_PERMISSIONS.EMAIL_SEND);

  let mailboxGroups;

  try {
    mailboxGroups = await emailService.listMailboxThreadGroups();
  } catch (error) {
    await logDevelopmentError('email2.page.listMailboxThreadGroups', error, {
      route: '/admin/email2',
      userId: currentUser.id.toString(),
    });

    throw error;
  }

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
        <Email2MailboxTabs mailboxGroups={mailboxGroups} />
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSiteTitle();

  return {
    title: composeMetadataTitle('Email2', siteTitle),
  };
}
