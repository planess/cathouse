'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PERSONAL_NAV_ITEMS } from '../../models/personal-nav-items';

/** Left navigation of the personal area that links to profile sections and wards. */
export default function PersonalSidebar() {
  const t = useTranslations('personalsidebar');
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')}>
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {PERSONAL_NAV_ITEMS.map(({ href, labelKey }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
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
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
