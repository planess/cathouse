import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import { ReportDialogTrigger } from '../report-dialog';

import Logo from './components/logo/logo';
import MobileSidebar from './components/sidebar/mobile-sidebar';

export default async function Header() {
  const t = await getTranslations('header');
  const [canReadActs, canReadRegistryMap] = await Promise.all([
    hasPermission(SYSTEM_PERMISSIONS.ACT_READ),
    hasPermission(SYSTEM_PERMISSIONS.REGISTRY_MAP_READ),
  ]);

  const links = [
    { key: 'home', href: '/' },
    { key: 'contacts', href: '/contacts' },
    ...(canReadRegistryMap ? [{ key: 'registry', href: '/registry' }] : []),
    { key: 'help', href: '/help' },
    ...(canReadActs ? [{ key: 'acts', href: '/acts' }] : []),
  ];

  const localizedLinks = links.map(({ key, href }) => ({
    key,
    href,
    label: t(key),
  }));

  const desktopLinks = localizedLinks.map(({ key, href, label }) => (
    <li key={key} className="mx-1 lg:mx-3">
      <Link
        href={href}
        className="inline-block px-2 py-1 text-gray-800 dark:text-gray-50 transition-colors"
      >
        {label}
      </Link>
    </li>
  ));

  return (
    <header className="flex items-center border-b border-solid border-b-gray-200 bg-white dark:bg-zinc-900 dark:border-zinc-700 px-3 py-3 transition-[padding] lg:px-20">
      <div className="flex flex-none items-center gap-2 sm:gap-6 transition-[gap]">
        <div className="md:hidden">
          <MobileSidebar
            links={localizedLinks}
            title={t('menuTitle')}
            openLabel={t('menuOpenLabel')}
            closeLabel={t('menuCloseLabel')}
          />
        </div>

        <Logo />
      </div>

      <div className="hidden flex-1 px-2 md:flex">
        <nav className="flex-auto">
          <ul className="flex justify-center">{desktopLinks}</ul>
        </nav>
      </div>

      <div className="ml-auto flex-none">
        <ReportDialogTrigger text={t('emergencyButton')} />
      </div>
    </header>
  );
}
