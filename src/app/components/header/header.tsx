import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styles from './header.module.scss';
import clsx from 'clsx';

export default function Header() {
  const t = useTranslations('header');

  const links = [
    { key: 'home', href: '/' },
    { key: 'contacts', href: '/contacts' },
    { key: 'history', href: '/history' },
    { key: 'help', href: '/help' },
  ];

  const lhtml = links.map(({ key, href }, idx) => (
    <li key={idx} className="mx-3">
      <Link href={href} className="px-2 py-1 inline-block">
        {t(key)}
      </Link>
    </li>
  ));

  return (
    <div className="flex px-20 py-3 items-center">
      <div className={clsx(styles.logoWrapper)}>
        <img src="/assets/logo.svg" alt="logo" />
      </div>

      <div className="px-2 flex-auto">
        <nav>
          <ul className="flex justify-center">{lhtml}</ul>
        </nav>
      </div>
    </div>
  );
}
