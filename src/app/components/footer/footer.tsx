import { getTranslations } from 'next-intl/server';

import { getUser } from '@app/hooks/get-user';

export default async function Footer() {
  const t = await getTranslations('footer');
  const user = await getUser();
  const foundationYear = 2024;
  const org = 'Planess Group';

  return (
    <footer className="bg-neutral-800 text-neutral-100 text-sm px-3 lg:px-20 py-3 flex justify-between gap-x-2 gap-y-1 transition-[padding]">
      {/* <div>
        <Link href="location">Location</Link>
      </div> */}
      <span>{user?.email}</span>

      <div className="flex flex-wrap justify-end gap-x-2">
        <span>{t('tagline', { year: foundationYear })}</span>
        <span>{t('attribution', { org })}</span>
      </div>
    </footer>
  );
}
