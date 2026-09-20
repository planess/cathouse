import Link from 'next/link';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import {
  hasPermission,
  requireAnyPermission,
} from '@app/services/access-verification.service';
import { emailService } from '@app/services/email.service';

import { EmailContactsManager } from './components/email-contacts-manager';

import type { Metadata } from 'next';

type EmailContactsPageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

/** Displays and manages saved external email contacts. */
export default async function EmailContactsPage({
  searchParams,
}: EmailContactsPageProps) {
  await requireAnyPermission([
    SYSTEM_PERMISSIONS.EMAIL_READ,
    SYSTEM_PERMISSIONS.EMAIL_SEND,
  ]);

  const { returnTo } = await searchParams;
  const backHref =
    returnTo !== undefined && /^\/admin\/email\/[a-f\d]{24}$/i.test(returnTo)
      ? returnTo
      : '/admin/email';
  const [contacts, canManage] = await Promise.all([
    emailService.listEmailContacts(),
    hasPermission(SYSTEM_PERMISSIONS.EMAIL_SEND),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Contacts
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage saved email recipients.
          </p>
        </div>
        <Link
          className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          href={backHref}
        >
          Back
        </Link>
      </header>

      <EmailContactsManager canManage={canManage} initialContacts={contacts} />
    </div>
  );
}

/** Creates metadata for the email contacts page. */
export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSiteTitle();

  return {
    title: composeMetadataTitle('Email contacts', siteTitle),
  };
}
