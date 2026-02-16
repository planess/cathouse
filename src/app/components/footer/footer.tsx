import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import logodark from '@public/assets/logo3-dark.svg';

import LanguageSwitcher from '@app/components/language-switcher/language-switcher';
import { getUser } from '@app/hooks/get-user';

import { Tooltip } from '../tooltip';

const linkBlock = [
  [
    { href: '/privacy-policy', labelKey: 'links.privacy' },
    { href: '/legal-info', labelKey: 'links.legal' },
    { href: '/work', labelKey: 'links.fundWork' },
  ],
  [
    { href: '/payments', labelKey: 'links.payments' },
    { href: '/offer', labelKey: 'links.offer' },
    { href: '/reports', labelKey: 'links.reports' },
  ],
];

export default async function Footer() {
  const t = await getTranslations('footer');
  const locale = await getLocale();
  const user = await getUser();
  const foundationYear = 2024;
  const org = 'Planess Group';

  return (
    <footer className="bg-neutral-800 text-neutral-300 text-sm px-3 lg:px-20 transition-[padding] border-t-gray-400">
      <div className="flex justify-between py-3 flex-col gap-y-2 md:flex-row gap-x-4">
        <div className="flex flex-col md:flex-row justify-around flex-1 whitespace-nowrap gap-x-4 gap-y-1">
          {linkBlock.map((block, i) => (
            <ul key={i}>
              {block.map((link) => (
                <li key={link.href} className="py-1">
                  <Link
                    href={link.href}
                    className="py-1 inline-block hover:text-neutral-200"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div className="flex flex-col justify-between items-end flex-1 gap-y-8">
          <div className="flex-1 hidden md:block space-y-2">
            <div>
              <Image
                className="mx-auto"
                src={logodark as string}
                alt="logo"
                height={40}
              />
            </div>

            <div className="text-center">{t('slogan')}</div>
          </div>

          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>

      <hr className="border-zinc-500" />

      <div className="flex justify-between gap-x-2 py-3">
        <span>{user?.email}</span>

        <div className="flex flex-wrap justify-end gap-x-2 text-end">
          <span className="sm:whitespace-nowrap">
            {t.rich('tagline', {
              year: `${foundationYear}*`,
              tooltip: (chunks) => {
                const sp = String(chunks).split('|');

                return <Tooltip text={sp[1]}>{sp[0]}</Tooltip>;
              },
            })}
          </span>
          <span className="text-stone-400 whitespace-nowrap">
            {t('attribution', { org })}
          </span>
        </div>
      </div>
    </footer>
  );
}
