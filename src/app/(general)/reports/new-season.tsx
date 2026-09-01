import { useTranslations } from 'next-intl';

import { FolderIcon } from '@app/components/icons/registry-animal-f-ol-de-ri-co-n';
import { Search2Icon } from '@app/components/icons/registry-animal-s-ea-rc-h2-ic-on';

import Section from './section';

export default function NewSeasonReport() {
  const t = useTranslations('reportspage.newSeason');

  return (
    <Section className="border-dashed">
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="relative mb-8">
          <span className="absolute -top-4 -right-4 size-16 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 size-8 inline-block">
              <Search2Icon />
            </span>
          </span>
          <span className="size-40 rounded-full bg-slate-50 dark:bg-zinc-800/70 flex items-center justify-center">
            <span className="text-slate-300 dark:text-zinc-600 size-18 inline-block">
              <FolderIcon />
            </span>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 transition-colors">
          {t('title')}
        </h2>
        <p className="text-slate-600 dark:text-slate-200 text-base max-w-md mx-auto leading-relaxed transition-colors">
          {t('description')}
        </p>
        {/* <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  Підписатися на оновлення
                </button>
              </div> */}
      </div>
    </Section>
  );
}
