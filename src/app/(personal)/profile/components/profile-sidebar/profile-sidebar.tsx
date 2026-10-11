'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PROFILE_SECTIONS } from '../../models/profile-sections';

/** Left navigation of the profile page that links to its nested section routes. */
export default function ProfileSidebar() {
  const t = useTranslations('profilepage.sidebar');
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')}>
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {PROFILE_SECTIONS.map((section) => {
          const href = `/profile/${section}`;
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={section}>
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'block whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'text-slate-500 hover:bg-white hover:text-emerald-700 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-emerald-200',
                )}
                href={href}
              >
                {t(section)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
