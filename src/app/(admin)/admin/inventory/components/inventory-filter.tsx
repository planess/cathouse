import { useTranslations } from 'next-intl';

import { FilterSvg } from './filter-svg';
import { MagnifierGlassSvg } from './magnifier-glass-svg';

export default function InventoryFilter() {
  const t = useTranslations('adminInventory');

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-b border-[#e0ebe7]/70 bg-[#f4f8f6]/70 p-4 dark:border-slate-800 dark:bg-slate-900/40 sm:flex-row">
      <div className="relative w-full max-w-sm">
        <MagnifierGlassSvg />
        <input
          placeholder={t('table.searchPlaceholder')}
          className="flex h-9 w-full rounded-md border border-[#dce8e2] bg-white py-1 pl-9 pr-3 text-sm text-[#0d261e] shadow-sm transition-colors placeholder:text-[#527a6d]/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        />
      </div>
      <div className="flex w-full gap-2 sm:w-auto">
        <button
          type="button"
          className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#0d261e] shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 sm:w-auto"
        >
          <FilterSvg />
          {t('table.filterOptions')}
        </button>
      </div>
    </div>
  );
}
