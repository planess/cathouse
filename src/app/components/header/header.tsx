import clsx from 'clsx';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Logo from './components/logo/logo';
import LogoSmall from './components/logo/Logo-small';
import styles from './header.module.scss';

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
    <div className="flex px-3 lg:px-20 py-3 items-center border-solid border-b border-b-gray-200 bg-white">
      <div className={clsx(styles.logoWrapper, 'hidden lg:block', 'flex-none')}>
        <Logo />
      </div>

      <div className="lg:hidden flex-none">
        <LogoSmall />
      </div>

      <div className="px-2 flex-auto">
        <nav>
          <ul className="flex justify-center">{lhtml}</ul>
        </nav>
      </div>
    </div>
  );
}
