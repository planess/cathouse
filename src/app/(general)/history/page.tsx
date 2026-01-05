import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import List from './components/list/list';
import Panel from './components/panel/panel';

type HistoryPageProps = {
  searchParams?: {
    page?: string | string[];
  };
};

export default async function History({ searchParams }: HistoryPageProps) {
  const t = await getTranslations('historypage');
  const canCreate = await hasPermission(SYSTEM_PERMISSIONS.HISTORY_CREATE);
  const rawPage = Array.isArray(searchParams?.page)
    ? searchParams?.page?.[0]
    : searchParams?.page;
  const parsedPage = Number(rawPage ?? 1);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;

  return (
    <div className="px-6 py-7">
      <div>
        <h1 className="text-3xl text-center font-bold title mb-4">
          {t('title')}
        </h1>

        <Panel>{t('panel1')}</Panel>
      </div>

      {canCreate && (
        <div className="text-center flex py-4">
          <Link
            href="/history/create"
            className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition w-full"
          >
            {t('createHistory')}
          </Link>
        </div>
      )}

      <List page={currentPage} />
    </div>
  );
}
