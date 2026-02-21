'use client';

import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Fragment, useMemo, useState } from 'react';

import {
  createAccount,
  createReport,
  deactivateAccount,
  deleteReport,
  updateAccount,
  updateReport,
} from '@app/actions/finance.server';
import { useModal } from '@app/hooks/use-modal';

import { isAccountFormValid } from '../helpers/is-account-form-valid';
import { isReportFormValid } from '../helpers/is-report-form-valid';
import { AccountFormState } from '../models/account-form-state';
import { AccountRow } from '../models/account-row';
import { CategoryNode } from '../models/category-node';
import {
  CategoryIncomingOption,
  CategoryOption,
} from '../models/category-option';
import { FinanceSummary } from '../models/finance-summary';
import { ReportFormState } from '../models/report-form-state';
import { ReportRow } from '../models/report-row';
import { TranslationFn } from '../models/transform-fn';

import AccountForm from './account-form';
import CategoriesModal from './categories-modal';
import ReportForm from './report-form';

export type FinanceAdminViewProps = {
  accounts: AccountRow[];
  incomingCategories: CategoryNode[];
  outgoingCategories: CategoryNode[];
  incomingCategoryOptions: CategoryIncomingOption[];
  outgoingCategoryOptions: CategoryOption[];
  reports: ReportRow[];
  summary: FinanceSummary;
  periodLabel: string;
  monthParam: string;
  reportRange: 'month' | 'year';
  currentMonthLabel: string;
};

const defaultAccountForm: AccountFormState = {
  name: '',
  iban: '',
};

const defaultReportForm: ReportFormState = {
  type: 'outgoing',
  description: '',
  categoryId: '',
  accountId: '',
  amount: '',
  details: [],
};

export function FinanceAdminView({
  accounts,
  incomingCategories,
  outgoingCategories,
  incomingCategoryOptions,
  outgoingCategoryOptions,
  reports,
  summary,
  periodLabel,
  monthParam,
  reportRange,
  currentMonthLabel,
}: FinanceAdminViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showModal } = useModal();
  const t = useTranslations('adminFinance');
  const translate: TranslationFn = (key, values) =>
    t(key, values as Record<string, string | number | Date> | undefined);
  const [expandedReportIds, setExpandedReportIds] = useState<
    Record<string, boolean>
  >({});

  const currency = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'UAH',
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 0,
      }),
    [],
  );

  const dateTime = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  );

  const handleMonthChange = (direction: -1 | 1) => {
    const [yearText, monthText] = monthParam.split('-');
    const year = Number(yearText);
    const month = Number(monthText) - 1;
    const current = new Date(year, month, 1);
    const next = new Date(current);
    if (reportRange === 'year') {
      next.setFullYear(current.getFullYear() + direction);
    } else {
      next.setMonth(current.getMonth() + direction);
    }

    const nextParam = `${next.getFullYear()}-${String(
      next.getMonth() + 1,
    ).padStart(2, '0')}`;

    const params = new URLSearchParams(searchParams.toString());
    params.set('month', nextParam);

    router.push(`/admin/finance?${params.toString()}`);
  };

  const handleRangeChange = (range: 'month' | 'year') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', range);
    router.push(`/admin/finance?${params.toString()}`);
  };

  const openAccountModal = (options: {
    title: string;
    initialState: AccountFormState;
    submitLabel: string;
    onSubmit: (state: AccountFormState) => Promise<void>;
  }) => {
    const formStateRef = { current: options.initialState };
    const formValidityRef = {
      current: isAccountFormValid(options.initialState, translate),
    };

    const modalHandle = showModal({
      title: options.title,
      content: (
        <AccountForm
          initialState={options.initialState}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
          onValidityChange={(isValid) => {
            formValidityRef.current = isValid;
            modalHandle.setActionEnabled('account-submit', isValid);
          }}
        />
      ),
      actions: [
        {
          label: t('common.cancel'),
          tone: 'ghost',
        },
        {
          id: 'account-submit',
          label: options.submitLabel,
          tone: 'primary',
          disabled: !formValidityRef.current,
          onSelect: async () => {
            if (!formValidityRef.current) {
              return;
            }
            await options.onSubmit(formStateRef.current);
            router.refresh();
          },
        },
      ],
      size: 'sm',
    });
  };

  const handleAddAccount = () => {
    openAccountModal({
      title: t('account.addTitle'),
      initialState: defaultAccountForm,
      submitLabel: t('account.createButton'),
      onSubmit: async (state) => {
        await createAccount(state);
      },
    });
  };

  const handleEditAccount = (account: AccountRow) => {
    openAccountModal({
      title: t('account.editTitle', { name: account.name }),
      initialState: {
        name: account.name,
        iban: account.iban,
      },
      submitLabel: t('common.saveChanges'),
      onSubmit: async (state) => {
        await updateAccount({ id: account.id, ...state });
      },
    });
  };

  const handleDeleteAccount = (account: AccountRow) => {
    void showModal({
      title: t('account.disableTitle'),
      content: (
        <p className="text-sm text-slate-600">
          {t.rich('account.disableBody', {
            name: account.name,
            strong: (children) => (
              <span className="font-semibold">{children}</span>
            ),
          })}
        </p>
      ),
      actions: [
        {
          label: t('common.cancel'),
          tone: 'ghost',
        },
        {
          label: t('common.disable'),
          tone: 'danger',
          onSelect: async () => {
            await deactivateAccount(account.id);
            router.refresh();
          },
        },
      ],
      size: 'sm',
    });
  };

  const handleOpenCategories = () => {
    void showModal({
      title: t('categories.modalTitle'),
      content: (
        <CategoriesModal
          incoming={incomingCategories}
          outgoing={outgoingCategories}
          incomingOptions={incomingCategoryOptions}
          outgoingOptions={outgoingCategoryOptions}
          onRefresh={() => router.refresh()}
        />
      ),
      actions: [
        {
          label: t('common.close'),
          tone: 'primary',
        },
      ],
      size: 'xl',
    });
  };

  const openReportModal = (options: {
    title: string;
    initialState: ReportFormState;
    submitLabel: string;
    onSubmit: (state: ReportFormState) => Promise<void>;
  }) => {
    const formStateRef = { current: options.initialState };
    const formValidityRef = {
      current: isReportFormValid(options.initialState, translate),
    };

    const modalHandle = showModal({
      title: options.title,
      content: (
        <ReportForm
          accounts={accounts}
          incomingCategoryOptions={incomingCategoryOptions}
          outgoingCategoryOptions={outgoingCategoryOptions}
          initialState={options.initialState}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
          onValidityChange={(isValid) => {
            formValidityRef.current = isValid;
            modalHandle.setActionEnabled('report-submit', isValid);
          }}
        />
      ),
      actions: [
        {
          label: t('common.cancel'),
          tone: 'ghost',
        },
        {
          id: 'report-submit',
          label: options.submitLabel,
          tone: 'primary',
          disabled: !formValidityRef.current,
          onSelect: async () => {
            if (!formValidityRef.current) {
              return;
            }
            await options.onSubmit(formStateRef.current);
            router.refresh();
          },
        },
      ],
      size: 'lg',
    });
  };

  const handleAddReport = () => {
    openReportModal({
      title: t('reports.addTitle'),
      initialState: defaultReportForm,
      submitLabel: t('reports.createButton'),
      onSubmit: async (state) => {
        await createReport({
          type: state.type,
          description: state.description,
          categoryId: state.categoryId,
          accountId: state.accountId,
          amount: Number(state.amount),
          details: state.details.map((detail) => ({
            description: detail.description,
            amount: Number(detail.amount),
            categoryId: detail.categoryId,
          })),
        });
      },
    });
  };

  const handleEditReport = (report: ReportRow) => {
    openReportModal({
      title: t('reports.editTitle'),
      initialState: {
        type: report.type,
        description: report.description,
        categoryId: report.categoryId ?? '',
        accountId: report.accountId ?? '',
        amount: String(report.amount),
        details: report.details.map((detail) => ({
          description: detail.description,
          amount: String(detail.amount),
          categoryId: detail.categoryId,
        })),
      },
      submitLabel: t('common.saveChanges'),
      onSubmit: async (state) => {
        await updateReport({
          id: report.id,
          type: state.type,
          description: state.description,
          categoryId: state.categoryId,
          accountId: state.accountId,
          amount: Number(state.amount),
          details: state.details.map((detail) => ({
            description: detail.description,
            amount: Number(detail.amount),
            categoryId: detail.categoryId,
          })),
        });
      },
    });
  };

  const handleDeleteReport = (report: ReportRow) => {
    void showModal({
      title: t('reports.deleteTitle'),
      content: (
        <p className="text-sm text-slate-600">{t('reports.deleteBody')}</p>
      ),
      actions: [
        {
          label: t('common.cancel'),
          tone: 'ghost',
        },
        {
          label: t('common.delete'),
          tone: 'danger',
          onSelect: async () => {
            await deleteReport(report.id);
            router.refresh();
          },
        },
      ],
      size: 'sm',
    });
  };

  const toggleReportDetails = (reportId: string) => {
    setExpandedReportIds((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('account.overviewTitle')}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('account.overviewSubtitle', {
                count: accounts.length,
                month: currentMonthLabel,
              })}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
          {accounts.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              {t('account.noAccounts')}
            </div>
          ) : (
            <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-col gap-4 p-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-900/40 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-500/10">
                      <span className="text-lg font-semibold">$</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {account.name}
                        </h4>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                          {t('account.activeBadge')}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] font-mono text-slate-500">
                        {account.iban}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-6 lg:justify-end">
                    <div className="min-w-30 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t('account.thisMonth')}
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          account.thisMonthNet >= 0
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {account.thisMonthNet >= 0 ? '+' : ''}
                        {currency.format(account.thisMonthNet)}
                      </p>
                    </div>
                    <div className="min-w-35 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t('account.currentBalance')}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {currency.format(account.balance)}
                      </p>
                      {account.debtTotal > 0 && (
                        <div className="mt-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                            {t('account.debt')}
                          </p>
                          <p className="text-xs font-bold text-amber-600">
                            -{currency.format(account.debtTotal)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded-lg p-2 text-slate-400 transition hover:text-sky-500"
                        type="button"
                        onClick={() => handleEditAccount(account)}
                        aria-label={t('account.editAria', {
                          name: account.name,
                        })}
                      >
                        ✎
                      </button>
                      <button
                        className="rounded-lg p-2 text-slate-400 transition hover:text-rose-500"
                        type="button"
                        onClick={() => handleDeleteAccount(account)}
                        aria-label={t('account.disableAria', {
                          name: account.name,
                        })}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-slate-500 transition hover:border-sky-400 hover:text-sky-600"
          type="button"
          onClick={handleAddAccount}
        >
          <span className="text-base">＋</span>
          {t('account.addAccount')}
        </button>

        <div className="rounded-3xl bg-sky-500 p-6 text-white shadow-lg shadow-sky-500/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4 lg:border-r lg:border-white/20 lg:pr-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <span className="text-xl font-bold">$</span>
              </div>
              <div>
                <p className="text-sm text-sky-100">
                  {t('summary.totalBalance')}
                </p>
                <p className="text-3xl font-bold">
                  {currency.format(summary.totalBalance)}
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-start sm:justify-around">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                  {t('summary.monthly')}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sky-100/80">
                      {t('summary.incoming')}
                    </span>
                    <span className="font-bold text-emerald-200">
                      +{currency.format(summary.monthIncoming)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sky-100/80">
                      {t('summary.expenses')}
                    </span>
                    <span className="font-bold text-rose-200">
                      -{currency.format(summary.monthOutgoing)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                  {t('summary.yearly')}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sky-100/80">
                      {t('summary.incoming')}
                    </span>
                    <span className="font-bold text-emerald-200">
                      +{currency.format(summary.yearIncoming)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sky-100/80">
                      {t('summary.expenses')}
                    </span>
                    <span className="font-bold text-rose-200">
                      -{currency.format(summary.yearOutgoing)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 p-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('reports.recentTitle')}
              </h3>

              <div className="flex items-center">
                <button
                  className={clsx(
                    'rounded-xl px-4 py-2 text-xs font-semibold transition border-none bg-transparent',
                    reportRange === 'month'
                      ? 'underline'
                      : 'text-slate-600 hover:text-sky-600 dark:text-slate-200',
                  )}
                  type="button"
                  onClick={() => handleRangeChange('month')}
                  aria-pressed={reportRange === 'month'}
                >
                  {t('reports.rangeMonth')}
                </button>
                <button
                  className={clsx(
                    'rounded-xl px-4 py-2 text-xs font-semibold transition border-none bg-transparent',
                    reportRange === 'year'
                      ? 'underline'
                      : 'text-slate-600 hover:text-sky-600 dark:text-slate-200',
                  )}
                  type="button"
                  onClick={() => handleRangeChange('year')}
                  aria-pressed={reportRange === 'year'}
                >
                  {t('reports.rangeYear')}
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {periodLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              type="button"
              onClick={handleOpenCategories}
            >
              {t('reports.categories')}
            </button>
            <button
              className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600"
              type="button"
              onClick={handleAddReport}
            >
              {t('reports.addRecord')}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">{t('reports.table.description')}</th>
                <th className="px-6 py-4">{t('reports.table.category')}</th>
                <th className="px-6 py-4">{t('reports.table.account')}</th>
                <th className="px-6 py-4">{t('reports.table.date')}</th>
                <th className="px-6 py-4 text-right">
                  {t('reports.table.amount')}
                </th>
                <th className="px-6 py-4 text-right">
                  {t('reports.table.balance')}
                </th>
                <th className="px-6 py-4 text-right">
                  {t('reports.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-6 text-center text-sm text-slate-500"
                  >
                    {t('reports.empty')}
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <Fragment key={report.id}>
                    <tr
                      className={clsx('transition-colors', {
                        'bg-emerald-100/50 hover:bg-emerald-100':
                          report.type === 'incoming',
                        'bg-rose-100/50 hover:bg-rose-100':
                          report.type === 'outgoing',
                        'bg-amber-100/50 border-x border-x-amber-400 hover:bg-amber-100':
                          report.type === 'debt',
                      })}
                    >
                      <td className="px-6 py-4">
                        {report.details.length > 0 ? (
                          <button
                            className="flex items-center gap-2 text-left"
                            type="button"
                            onClick={() => toggleReportDetails(report.id)}
                            aria-expanded={Boolean(
                              expandedReportIds[report.id],
                            )}
                          >
                            <span
                              className={clsx(
                                'text-sm text-slate-500 transition-transform',
                                {
                                  'rotate-90': expandedReportIds[report.id],
                                },
                              )}
                            >
                              ›
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {report.description || '—'}
                            </span>
                          </button>
                        ) : (
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {report.description || '—'}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                          {report.categoryName || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono uppercase text-slate-400">
                        {report.accountName || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {report.type === 'debt' || !report.createdAt
                          ? '—'
                          : dateTime.format(new Date(report.createdAt))}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold">
                        <span
                          className={
                            report.type === 'incoming'
                              ? 'text-emerald-600'
                              : report.type === 'outgoing'
                                ? 'text-rose-600'
                                : 'text-amber-600'
                          }
                        >
                          {report.type === 'outgoing'
                            ? '-'
                            : report.type === 'incoming'
                              ? '+'
                              : '-'}
                          {currency.format(report.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-semibold text-slate-500">
                        {currency.format(report.balance)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-lg p-1.5 text-slate-400 transition hover:text-sky-500"
                            type="button"
                            onClick={() => handleEditReport(report)}
                            aria-label={t('reports.editAria')}
                          >
                            ✎
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-slate-400 transition hover:text-rose-500"
                            type="button"
                            onClick={() => handleDeleteReport(report)}
                            aria-label={t('reports.deleteAria')}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                    {report.details.length > 0 &&
                      expandedReportIds[report.id] && (
                        <tr className="bg-zinc-200/20 border-x border-x-slate-400">
                          <td colSpan={3} className="px-6 py-3">
                            <div className="space-y-2">
                              {report.details.map((detail, index) => {
                                const categoryLabel =
                                  detail.categoryName?.trim() ?? '';

                                return (
                                  <div
                                    key={`${report.id}-detail-label-${index}`}
                                    className="text-xs text-slate-500"
                                  >
                                    <p className="font-semibold text-slate-700">
                                      {detail.description}
                                    </p>
                                    {categoryLabel ? (
                                      <p className="text-[10px] uppercase text-slate-400">
                                        {categoryLabel}
                                      </p>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-3" />
                          <td className="px-6 py-3 text-right">
                            <div className="space-y-2">
                              {report.details.map((detail, index) => {
                                const categoryLabel =
                                  detail.categoryName?.trim() ?? '';

                                return (
                                  <div
                                    key={`${report.id}-detail-value-${index}`}
                                  >
                                    <p
                                      className={clsx(
                                        'font-bold text-rose-500',
                                        {
                                          'mb-[calc(10px/.75)]': categoryLabel,
                                        },
                                      )}
                                    >
                                      -{currency.format(detail.amount)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td colSpan={2} />
                        </tr>
                      )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200/70 px-6 py-4 text-xs text-slate-500 dark:border-slate-800">
          <div>
            <span className="uppercase tracking-widest">{periodLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:text-sky-500"
              type="button"
              onClick={() => handleMonthChange(-1)}
              aria-label={
                reportRange === 'year'
                  ? t('pagination.previousYear')
                  : t('pagination.previousMonth')
              }
            >
              ‹
            </button>
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:text-sky-500"
              type="button"
              onClick={() => handleMonthChange(1)}
              aria-label={
                reportRange === 'year'
                  ? t('pagination.nextYear')
                  : t('pagination.nextMonth')
              }
            >
              ›
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
