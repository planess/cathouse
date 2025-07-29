import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import ProvideHelp from './components/section-provide-help/provide-help';
import ReceiveHelp from './components/section-receive-help/receive-help';

export default function Help() {
  const t = useTranslations('helppage');

  return (
    <div className="px-6 py-7">
      <h1 className="text-4xl font-bold text-center title my-6">
        {t('title')}
      </h1>

      <div className="flex flex-col gap-4">
        <ProvideHelp />

        <ReceiveHelp />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<unknown>;
}) {
  console.log('-param', await params);
  const t = await getTranslations('helppage');

  return {
    title: `${t('title')} | Perimeter`,
  };
}
