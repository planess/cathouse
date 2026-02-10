'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  BarChartIcon,
  CalendarIcon,
  ChevronIcon,
  LocationIcon,
  PetsIcon,
  ReceiptIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from '@app/(general)/history/[animalId]/components/icons';

import { ReportsSkeleton } from './reports-skeleton';

type MonthStat = {
  month: number;
  sterilized: number;
  locations: number;
};

type MonthFinance = {
  month: number;
  incoming: number;
  outgoing: number;
  breakdown: { name: string; amount: number }[];
};

type ImpactYearReport = {
  year: number;
  stats: {
    yearSterilized: number;
    yearLocations: number;
    months: MonthStat[];
  };
  hasPrevious: boolean;
};

type FinanceYearReport = {
  year: number;
  finance: {
    yearIncoming: number;
    yearOutgoing: number;
    months: MonthFinance[];
  };
  hasPrevious: boolean;
};

type ReportsSummaryResponse = {
  success: boolean;
  message?: string;
  year: number;
  stats?: ImpactYearReport['stats'];
  finance?: FinanceYearReport['finance'];
  hasPrevious: boolean;
};

function getVisibleMonths<T extends { month: number }>(
  months: T[],
  year: number,
) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const maxMonth = year === currentYear ? currentMonth : 12;

  return months
    .filter((month) => month.month <= maxMonth)
    .slice()
    .sort((a, b) => b.month - a.month);
}

export function ReportsContent({ initialYear }: { initialYear: number }) {
  const t = useTranslations('reportsContent');
  const [impactYears, setImpactYears] = useState<ImpactYearReport[]>([]);
  const [financeYears, setFinanceYears] = useState<FinanceYearReport[]>([]);
  const [impactLoading, setImpactLoading] = useState(true);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [impactLoadingMore, setImpactLoadingMore] = useState(false);
  const [financeLoadingMore, setFinanceLoadingMore] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    () => new Set(),
  );

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat('uk-UA', { month: 'long' }),
    [],
  );

  const currency = useMemo(
    () =>
      new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
        maximumFractionDigits: 0,
        currencyDisplay: 'narrowSymbol',
      }),
    [],
  );

  const fetchYear = useCallback(
    async (year: number, section: 'impact' | 'finance') => {
      const response = await fetch(
        `/api/reports/summary?year=${year}&section=${section}`,
        {
          cache: 'no-store',
        },
      );
      const payload =
        (await response.json()) as unknown as ReportsSummaryResponse;

      return payload;
    },
    [],
  );

  const loadImpactYear = useCallback(
    async (year: number, append = false) => {
      if (append) {
        setImpactLoadingMore(true);
      } else {
        setImpactLoading(true);
      }

      try {
        const payload = await fetchYear(year, 'impact');

        if (!payload?.success || !payload.stats) {
          return;
        }

        setImpactYears((current) => {
          if (current.some((item) => item.year === year)) {
            return current;
          }

          const next: ImpactYearReport = {
            year: payload.year,
            stats: payload.stats,
            hasPrevious: payload.hasPrevious,
          };

          return append ? [...current, next] : [next];
        });
      } finally {
        setImpactLoading(false);
        setImpactLoadingMore(false);
      }
    },
    [fetchYear],
  );

  const loadFinanceYear = useCallback(
    async (year: number, append = false) => {
      if (append) {
        setFinanceLoadingMore(true);
      } else {
        setFinanceLoading(true);
      }

      try {
        const payload = await fetchYear(year, 'finance');

        if (!payload?.success || !payload.finance) {
          return;
        }

        setFinanceYears((current) => {
          if (current.some((item) => item.year === year)) {
            return current;
          }

          const next: FinanceYearReport = {
            year: payload.year,
            finance: payload.finance,
            hasPrevious: payload.hasPrevious,
          };

          return append ? [...current, next] : [next];
        });
      } finally {
        setFinanceLoading(false);
        setFinanceLoadingMore(false);
      }
    },
    [fetchYear],
  );

  useEffect(() => {
    void loadImpactYear(initialYear);
    void loadFinanceYear(initialYear);
  }, [initialYear, loadFinanceYear, loadImpactYear]);

  const lastImpactYear = impactYears[impactYears.length - 1];
  const lastFinanceYear = financeYears[financeYears.length - 1];
  const canLoadPreviousImpact = Boolean(lastImpactYear?.hasPrevious);
  const canLoadPreviousFinance = Boolean(lastFinanceYear?.hasPrevious);

  const handleLoadPreviousImpact = () => {
    if (typeof lastImpactYear === 'undefined') {
      return;
    }

    void loadImpactYear(lastImpactYear.year - 1, true);
  };

  const handleLoadPreviousFinance = () => {
    if (typeof lastFinanceYear === 'undefined') {
      return;
    }

    void loadFinanceYear(lastFinanceYear.year - 1, true);
  };

  const formatMonthName = (month: number) => {
    const date = new Date(2024, month - 1, 1);
    return monthFormatter.format(date);
  };

  const toggleMonthDetails = (key: string) => {
    setExpandedMonths((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  return (
    <div className="space-y-16 pb-20">
      <section className="scroll-mt-28" id="impact">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#0d121c] dark:text-zinc-200">
          <span className="size-6 text-[#256af4]">
            <BarChartIcon />
          </span>
          {t('impact.title')}
        </h2>

        {impactLoading ? (
          <ReportsSkeleton />
        ) : (
          <div className="space-y-10">
            {impactYears.map((yearData, index) => (
              <div key={`impact-${yearData.year}`} className="pt-4">
                <div className="border border-[#e7ebf4] bg-white dark:border-[#2d3a52] dark:bg-[#1c2636] rounded-b-2xl">
                  <div
                    className={clsx(
                      'rounded-2xl border border-[#256af4]/20 bg-radial-[at_20%_10%] p-3 shadow-lg -mt-4',
                      {
                        'from-blue-500/80 to-blue-500': index === 0,
                        'from-slate-500/50 to-slate-500/60': index > 0,
                      },
                    )}
                  >
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/80">
                      {t('impact.summary', { year: yearData.year })}
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="flex-1 rounded-xl border border-white/20 to-white/10 bg-linear-to-b from-white/5 px-4 py-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-white/70">
                            {t('impact.sterilized', { count: yearData.stats.yearSterilized })}
                          </span>
                          <span className="text-2xl font-black text-white">
                            {yearData.stats.yearSterilized}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 rounded-xl border border-white/20 to-white/10 bg-linear-to-b from-white/5 px-4 py-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-white/70">
                            {t('impact.locations', { count: yearData.stats.yearLocations })}
                          </span>
                          <span className="text-2xl font-black text-white">
                            {yearData.stats.yearLocations}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a8bb1]">
                      {t('impact.monthsTitle', { year: yearData.year })}
                    </h3>
                    <div className="space-y-4">
                      {getVisibleMonths(
                        yearData.stats.months,
                        yearData.year,
                      ).map((month, index) => (
                        <div
                          key={`impact-${yearData.year}-${month.month}`}
                          className={index === 0 ? '' : ''}
                        >
                          <div className="pl-1 mb-1">
                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-300 font-mono">
                              {formatMonthName(month.month)} {yearData.year}
                            </span>
                          </div>
                          <div className="border-l-2 border-l-blue-300 dark:border-l-[#2d3a52] pl-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center gap-3">
                                <span className="size-5 text-blue-300">
                                  <PetsIcon />
                                </span>
                                <span className="font-bold text-zinc-700 dark:text-zinc-200">
                                  {month.sterilized}
                                </span>
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                {t('impact.sterilized')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center gap-3">
                                <span className="size-5 text-blue-400">
                                  <LocationIcon />
                                </span>
                                <span className="font-bold text-zinc-700 dark:text-zinc-200">
                                  {month.locations}
                                </span>
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                {t('impact.locationsChecked')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {canLoadPreviousImpact ? (
              <button
                className="w-full rounded-full border border-[#256af4] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#256af4] transition-all hover:bg-[#256af4] hover:text-white"
                type="button"
                onClick={handleLoadPreviousImpact}
                disabled={impactLoadingMore}
              >
                {impactLoadingMore
                  ? t('actions.loading')
                  : t('actions.loadPrevious')}
              </button>
            ) : null}
          </div>
        )}
      </section>

      <section className="scroll-mt-28" id="financials">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#0d121c] dark:text-zinc-200">
          <span className="size-6 text-[#256af4]">
            <ReceiptIcon />
          </span>
          {t('finance.title')}
        </h2>

        {financeLoading ? (
          <ReportsSkeleton />
        ) : (
          <div className="space-y-10">
            {financeYears.map((yearData) => (
              <div key={`finance-${yearData.year}`} className="space-y-4">
                <h3 className="border-l-4 border-[#256af4] px-2 text-lg font-bold text-[#0d121c] dark:text-zinc-200">
                  {t('finance.yearLabel', { year: yearData.year })}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {getVisibleMonths(yearData.finance.months, yearData.year).map(
                    (month) => {
                      const monthKey = `${yearData.year}-${month.month}`;
                      const isExpanded = expandedMonths.has(monthKey);
                      const detailsId = `finance-details-${monthKey}`;
                      const hasBreakdown = month.breakdown.length > 0;

                      return (
                        <div
                          key={`finance-${yearData.year}-${month.month}`}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e7ebf4] bg-white p-4 transition-shadow hover:shadow-sm dark:border-[#2d3a52] dark:bg-[#1c2636]"
                        >
                          <div className="flex w-full flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-[#253247]">
                                <span className="size-6 text-[#256af4]">
                                  <CalendarIcon />
                                </span>
                              </div>
                              <div>
                                <div className="flex flex-wrap gap-x-6 items-center">
                                  <p className="text-sm font-bold uppercase tracking-wider">
                                    {formatMonthName(month.month)}{' '}
                                    {yearData.year}
                                  </p>

                                  <div className="flex flex-wrap gap-2 leading-none">
                                    <div className="flex items-center gap-1 rounded bg-green-100/80 px-1.5 py-0.5 text-[9px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      <span className="text-[10px] size-3">
                                        <TrendingUpIcon />
                                      </span>
                                      +{currency.format(month.incoming)}
                                    </div>
                                    <div className="flex items-center gap-1 rounded bg-red-100/80 px-1.5 py-0.5 text-[9px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                      <span className="text-[10px] size-3">
                                        <TrendingDownIcon />
                                      </span>
                                      -{currency.format(month.outgoing)}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[10px] text-[#49659c]">
                                  {t('finance.monthLabel')}
                                </p>
                              </div>
                            </div>
                            {hasBreakdown ? (
                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={detailsId}
                                onClick={() => toggleMonthDetails(monthKey)}
                                className="group inline-flex items-center gap-2 rounded-full border border-[#e7ebf4] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#49659c] transition hover:border-[#256af4] hover:text-[#256af4] dark:border-[#2d3a52]"
                              >
                                {t('finance.breakdownToggle')}
                                <span
                                  className={clsx(
                                    'flex size-6 items-center justify-center rounded-full bg-[#f1f5f9] text-[#256af4] transition-transform dark:bg-[#253247]',
                                    {
                                      'rotate-180': isExpanded,
                                    },
                                  )}
                                >
                                  <ChevronIcon />
                                </span>
                              </button>
                            ) : null}
                          </div>
                          {hasBreakdown && isExpanded ? (
                            <div
                              id={detailsId}
                              className="w-full border-t border-[#e7ebf4] pt-4 text-sm dark:border-[#2d3a52] space-y-2"
                            >
                              {month.breakdown.map((entry) => (
                                <div
                                  key={`${monthKey}-${entry.name}`}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-[#49659c] dark:text-zinc-300">
                                    {entry.name}
                                  </span>
                                  <span className="font-bold text-[#0d121c] dark:text-zinc-200">
                                    {currency.format(entry.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    },
                  )}
                  <div className="flex items-center justify-between rounded-xl border border-[#e7ebf4] bg-white px-4 py-2 text-sm font-bold shadow-sm dark:border-[#2d3a52] dark:bg-[#1c2636]">
                    <span>
                      {t('finance.yearTotal', { year: yearData.year })}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 rounded bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <span className="text-[10px] size-3">
                          <TrendingUpIcon />
                        </span>
                        +{currency.format(yearData.finance.yearIncoming)}
                      </div>
                      <div className="flex items-center gap-1 rounded bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <span className="text-[10px] size-3">
                          <TrendingDownIcon />
                        </span>
                        -{currency.format(yearData.finance.yearOutgoing)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {canLoadPreviousFinance ? (
              <button
                className="w-full rounded-full border border-[#256af4] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#256af4] transition-all hover:bg-[#256af4] hover:text-white"
                type="button"
                onClick={handleLoadPreviousFinance}
                disabled={financeLoadingMore}
              >
                {financeLoadingMore
                  ? t('actions.loading')
                  : t('actions.loadPrevious')}
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
