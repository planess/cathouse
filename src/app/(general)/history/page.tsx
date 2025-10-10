import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { getUser } from '@app/hooks';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import List from './components/list/list';
import Panel from './components/panel/panel';

export default async function History() {
  const t = await getTranslations('historypage');
  const user = await getUser();
  const isAdmin = await hasPermission(SYSTEM_PERMISSIONS.HISTORY_CREATE);

  return (
    <div className="px-6 py-7">
      <div>
        <h1 className="text-3xl text-center font-bold title mb-4">
          {t('title')}
        </h1>

        <Panel>{t('panel1')}</Panel>
      </div>

      {user && (
        <div className="text-center mb-4">
          <p>Welcome, {user.profile.firstName}!</p>

          {}
        </div>
      )}

      {isAdmin && (
        <div className="text-center mb-4">
          <Link
            href="/history/create"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {t('createHistory')}
          </Link>
        </div>
      )}

      <List list={[]} />
    </div>
  );
}
