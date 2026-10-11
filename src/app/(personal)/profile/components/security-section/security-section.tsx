import { useTranslations } from 'next-intl';

import ChangePassword from '../change-password/change-password';

/** Security settings of the current user, starting with the password change. */
export default function SecuritySection() {
  const t = useTranslations('profilepage.security');

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{t('title')}</h2>
      <div className="rounded-xl bg-white px-4 py-4 dark:bg-stone-900">
        <h3 className="mb-2 text-sm font-semibold">{t('password.title')}</h3>
        <ChangePassword />
      </div>
    </section>
  );
}
