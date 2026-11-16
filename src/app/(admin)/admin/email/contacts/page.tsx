import { Suspense } from 'react';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requireAnyPermission } from '@app/services/access-verification.service';

import { EmailContactsHeader } from './components/email-contacts-header';
import { EmailContactsLoading } from './components/email-contacts-loading';
import { EmailContactsSection } from './components/email-contacts-section';

import type { Metadata } from 'next';

/** Displays and manages saved external email contacts. */
export default async function EmailContactsPage() {
  await requireAnyPermission([
    SYSTEM_PERMISSIONS.EMAIL_READ,
    SYSTEM_PERMISSIONS.EMAIL_SEND,
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <EmailContactsHeader />

      <Suspense fallback={<EmailContactsLoading />}>
        <EmailContactsSection />
      </Suspense>
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
