import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import LanguageSwitcher from '@app/components/language-switcher/language-switcher';
import { getUser } from '@app/hooks/get-user';

export default async function Footer() {
  const t = await getTranslations('footer');
  const locale = await getLocale();
  const user = await getUser();
  const foundationYear = 2024;
  const org = 'Planess Group';

  return (
    <footer className="bg-neutral-800 text-neutral-100 text-sm px-3 lg:px-20 transition-[padding] border-t-gray-400">
      <div className="flex justify-between py-3 ">
        <div className="space-3">
          <ul>
            <li>
              <Link href="/privacy-policy">{t('links.privacy')}</Link>
            </li>
          </ul>
        </div>

        <LanguageSwitcher currentLocale={locale} />
      </div>

      <hr className="border-zinc-500" />

      <div className="flex justify-between gap-x-2 gap-y-1 py-3">
        <span>{user?.email}</span>

        <div className="flex flex-wrap justify-end gap-x-2">
          <span>{t('tagline', { year: `${foundationYear}*` })}</span>
          <span>{t('attribution', { org })}</span>
        </div>
      </div>
    </footer>
  );
}
