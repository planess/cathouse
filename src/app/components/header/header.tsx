import clsx from 'clsx';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Logo from './components/logo/logo';
import LogoSmall from './components/logo/Logo-small';
import styles from './header.module.scss';
import { ReportDialogTrigger } from '../report-dialog';

export default function Header() {
  const t = useTranslations('header');

  const links = [
    { key: 'home', href: '/' },
    { key: 'contacts', href: '/contacts' },
    { key: 'history', href: '/history' },
    { key: 'help', href: '/help' },
  ];

  const lhtml = links.map(({ key, href }, idx) => (
    <li key={idx} className="mx-1 lg:mx-3">
      <Link href={href} className="px-2 py-1 inline-block text-gray-800">
        {t(key)}
      </Link>
    </li>
  ));

  return (
    <div className="flex items-center border-b border-solid border-b-gray-200 bg-white px-3 py-3 transition-[padding] lg:px-20">
      <div className={clsx(styles.logoWrapper, 'hidden lg:block', 'flex-none')}>
        <Logo />
      </div>

      <div className="lg:hidden flex-none">
        <LogoSmall />
      </div>

      <div className="flex-auto px-2">
        <nav>
          <ul className="flex justify-center">{lhtml}</ul>
        </nav>
      </div>

      <div className="flex-none">
        <ReportDialogTrigger />
      </div>
    </div>
  );
}
