'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Links to email contacts while preserving the currently selected mailbox. */
export function EmailContactsLink() {
  const pathname = usePathname();
  const returnTo = /^\/admin\/email\/[a-f\d]{24}$/i.test(pathname)
    ? pathname
    : '/admin/email';

  return (
    <Link
      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
      href={{
        pathname: '/admin/email/contacts',
        query: { returnTo },
      }}
    >
      Contacts
    </Link>
  );
}
