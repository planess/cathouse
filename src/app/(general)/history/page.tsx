import { getTranslations } from 'next-intl/server';

import { getUser } from '@app/hooks';

import List from './list/list';
import Panel from './panel/panel';

export default async function History() {
  const t = await getTranslations('historypage');
  const { user, isAuthenticated } = await getUser();

  return (
    <div className="px-6 py-7">
      <div>
        <h1 className="text-3xl text-center font-bold title mb-4">
          {t('title')}
        </h1>

        <Panel>{t('panel1')}</Panel>
      </div>

      {isAuthenticated && (
        <div className="text-center mb-4">
          <p>Welcome, {user?.name}!</p>
        </div>
      )}

      <List list={[]} />
    </div>
  );
}
