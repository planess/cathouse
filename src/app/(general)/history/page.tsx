import { getTranslations } from 'next-intl/server';

import { getUser } from '@app/hooks';

import List from './components/list/list';
import Panel from './components/panel/panel';

export default async function History() {
  const t = await getTranslations('historypage');
  const user = await getUser();

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
        </div>
      )}

      <List list={[]} />
    </div>
  );
}
