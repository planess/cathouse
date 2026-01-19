import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ReportDialogTrigger } from '../report-dialog';

import Logo from './components/logo/logo';
import MobileSidebar from './components/sidebar/mobile-sidebar';

export default function Header() {
  const t = useTranslations('header');

  const links = [
    { key: 'home', href: '/' },
    { key: 'contacts', href: '/contacts' },
    { key: 'history', href: '/history' },
    { key: 'help', href: '/help' },
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
        className="inline-block px-2 py-1 text-gray-800 dark:text-gray-50"
      >
        {label}
      </Link>
    </li>
  ));

  return (
    <header className="flex items-center border-b border-solid border-b-gray-200 bg-white dark:bg-zinc-900 dark:border-zinc-700 px-3 py-3 transition-[padding] lg:px-20">
      <div className="flex flex-none items-center gap-6">
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
