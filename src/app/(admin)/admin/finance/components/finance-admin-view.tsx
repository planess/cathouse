'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useMemo, useState } from 'react';

import {
  createAccount,
  createCategory,
  createReport,
  deactivateAccount,
  deleteCategory,
  deleteReport,
  updateAccount,
  updateReport,
} from '@app/actions/finance.server';
import { useModal } from '@app/hooks/use-modal';

import { IbanInput, isValidIban } from './iban-input';

type AccountRow = {
  id: string;
  name: string;
  iban: string;
  balance: number;
  thisMonthNet: number;
  debtTotal: number;
};

type CategoryNode = {
  id: string;
  name: string;
  children: CategoryNode[];
};

type CategoryOption = {
  id: string;
  name: string;
  inheritsFrom?: string | null;
};

type ReportDetailRow = {
  description: string;
  amount: number;
  categoryName?: string;
  categoryId?: string;
};

type ReportRow = {
  id: string;
  type: 'incoming' | 'outgoing' | 'debt';
  description: string;
  categoryName: string;
  accountName: string;
  amount: number;
  balance: number;
  details: ReportDetailRow[];
  createdAt: string;
  categoryId?: string;
  accountId?: string;
};

type FinanceSummary = {
  totalBalance: number;
  monthIncoming: number;
  monthOutgoing: number;
  yearIncoming: number;
  yearOutgoing: number;
};

export type FinanceAdminViewProps = {
  accounts: AccountRow[];
  incomingCategories: CategoryNode[];
  outgoingCategories: CategoryNode[];
  incomingCategoryOptions: CategoryOption[];
  outgoingCategoryOptions: CategoryOption[];
  reports: ReportRow[];
  summary: FinanceSummary;
  monthLabel: string;
  monthParam: string;
  currentMonthLabel: string;
};

type AccountFormState = {
  name: string;
  iban: string;
};

type ReportFormState = {
  type: 'incoming' | 'outgoing' | 'debt';
  description: string;
  categoryId: string;
  accountId: string;
  amount: string;
  details: ReportDetailFormState[];
};

type ReportDetailFormState = {
  description: string;
  amount: string;
  categoryId?: string;
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
  monthLabel,
  monthParam,
  currentMonthLabel,
}: FinanceAdminViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showModal } = useModal();

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

  const handleMonthChange = (direction: -1 | 1) => {
    const [yearText, monthText] = monthParam.split('-');
    const year = Number(yearText);
    const month = Number(monthText) - 1;
    const current = new Date(year, month, 1);
    const next = new Date(current);
    next.setMonth(current.getMonth() + direction);

    const nextParam = `${next.getFullYear()}-${String(
      next.getMonth() + 1,
    ).padStart(2, '0')}`;

    const params = new URLSearchParams(searchParams.toString());
    params.set('month', nextParam);

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
      current: isAccountFormValid(options.initialState),
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
          label: 'Cancel',
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
      title: 'Add new account',
      initialState: defaultAccountForm,
      submitLabel: 'Create account',
      onSubmit: async (state) => {
        await createAccount(state);
      },
    });
  };

  const handleEditAccount = (account: AccountRow) => {
    openAccountModal({
      title: `Edit ${account.name}`,
      initialState: {
        name: account.name,
        iban: account.iban,
      },
      submitLabel: 'Save changes',
      onSubmit: async (state) => {
        await updateAccount({ id: account.id, ...state });
      },
    });
  };

  const handleDeleteAccount = (account: AccountRow) => {
    void showModal({
      title: 'Disable account?',
      content: (
        <p className="text-sm text-slate-600">
          This will set <span className="font-semibold">{account.name}</span> as
          inactive.
        </p>
      ),
      actions: [
        {
          label: 'Cancel',
          tone: 'ghost',
        },
        {
          label: 'Disable',
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
      title: 'Categories',
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
          label: 'Close',
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
      current: isReportFormValid(options.initialState),
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
          label: 'Cancel',
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
      title: 'Add report item',
      initialState: defaultReportForm,
      submitLabel: 'Create report',
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
      title: 'Edit report item',
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
      submitLabel: 'Save changes',
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
      title: 'Delete report item?',
      content: (
        <p className="text-sm text-slate-600">
          This will permanently remove the report.
        </p>
      ),
      actions: [
        {
          label: 'Cancel',
          tone: 'ghost',
        },
        {
          label: 'Delete',
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

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Account Overview
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {accounts.length} active accounts · This month:{' '}
              {currentMonthLabel}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
          {accounts.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No active accounts yet. Add your first bank account to start
              tracking balances.
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
                          Active
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
                        This Month
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
                        Current Balance
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {currency.format(account.balance)}
                      </p>
                      {account.debtTotal > 0 && (
                        <div className="mt-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                            Debt
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
                        aria-label={`Edit ${account.name}`}
                      >
                        ✎
                      </button>
                      <button
                        className="rounded-lg p-2 text-slate-400 transition hover:text-rose-500"
                        type="button"
                        onClick={() => handleDeleteAccount(account)}
                        aria-label={`Disable ${account.name}`}
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
          Add New Account
        </button>

        <div className="rounded-3xl bg-sky-500 p-6 text-white shadow-lg shadow-sky-500/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4 lg:border-r lg:border-white/20 lg:pr-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <span className="text-xl font-bold">$</span>
              </div>
              <div>
                <p className="text-sm text-sky-100">Total Fund Balance</p>
                <p className="text-3xl font-bold">
                  {currency.format(summary.totalBalance)}
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                  Monthly Statistics
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sky-100/80">Incoming</span>
                    <span className="font-bold text-emerald-200">
                      +{currency.format(summary.monthIncoming)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sky-100/80">Expenses</span>
                    <span className="font-bold text-rose-200">
                      -{currency.format(summary.monthOutgoing)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                  Yearly Statistics
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sky-100/80">Incoming</span>
                    <span className="font-bold text-emerald-200">
                      +{currency.format(summary.yearIncoming)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sky-100/80">Expenses</span>
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {monthLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              type="button"
              onClick={handleOpenCategories}
            >
              Categories
            </button>
            <button
              className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600"
              type="button"
              onClick={handleAddReport}
            >
              Add New Record
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-sm text-slate-500"
                  >
                    No reports for this month yet.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <Fragment key={report.id}>
                    <tr
                      className={`transition hover:bg-slate-50/70 dark:hover:bg-slate-900/60 ${
                        report.type === 'incoming'
                          ? 'bg-emerald-50/30'
                          : report.type === 'outgoing'
                            ? 'bg-rose-50/30'
                            : 'bg-amber-50/30'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {report.description || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                          {report.categoryName || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono uppercase text-slate-400">
                        {report.accountName || '—'}
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
                            aria-label="Edit report"
                          >
                            ✎
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-slate-400 transition hover:text-rose-500"
                            type="button"
                            onClick={() => handleDeleteReport(report)}
                            aria-label="Delete report"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                    {report.details.length > 0 && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="space-y-2">
                            {report.details.map((detail, index) => {
                              const categoryLabel =
                                detail.categoryName?.trim() ?? '';

                              return (
                                <div
                                  key={`${report.id}-detail-${index}`}
                                  className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-700">
                                      {detail.description}
                                    </p>
                                    {categoryLabel ? (
                                      <p className="text-[10px] uppercase text-slate-400">
                                        {categoryLabel}
                                      </p>
                                    ) : null}
                                  </div>
                                  <span className="font-bold text-rose-500">
                                    -{currency.format(detail.amount)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200/70 px-6 py-4 text-xs text-slate-500 dark:border-slate-800">
          <span className="uppercase tracking-widest">{monthLabel}</span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:text-sky-500"
              type="button"
              onClick={() => handleMonthChange(-1)}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:text-sky-500"
              type="button"
              onClick={() => handleMonthChange(1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AccountForm({
  initialState,
  onChange,
  onValidityChange,
}: {
  initialState: AccountFormState;
  onChange: (state: AccountFormState) => void;
  onValidityChange: (isValid: boolean) => void;
}) {
  const [formState, setFormState] = useState<AccountFormState>(initialState);
  const [touched, setTouched] = useState({ name: false, iban: false });

  const errors = validateAccountForm(formState);
  const isValid = Object.keys(errors).length === 0;
  const nameError = touched.name ? (errors.name ?? '') : '';
  const ibanError = touched.iban ? (errors.iban ?? '') : '';

  const updateState = (nextState: AccountFormState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(Object.keys(validateAccountForm(nextState)).length === 0);
  };

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Name</label>
        <input
          className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
            nameError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
          }`}
          value={formState.name}
          onChange={(event) =>
            updateState({ ...formState, name: event.target.value })
          }
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          type="text"
          placeholder="Main shelter account"
        />
        {nameError ? (
          <p className="text-xs text-rose-500">{nameError}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <IbanInput
          label="IBAN"
          value={formState.iban}
          onChange={(value) => updateState({ ...formState, iban: value })}
          onBlur={() => setTouched((current) => ({ ...current, iban: true }))}
          isInvalid={Boolean(ibanError)}
        />
        {ibanError ? (
          <p className="text-xs text-rose-500">{ibanError}</p>
        ) : null}
      </div>
      {!isValid && (touched.name || touched.iban) ? (
        <p className="text-xs text-slate-500">
          Please complete required fields before saving.
        </p>
      ) : null}
    </form>
  );
}

function ReportForm({
  accounts,
  incomingCategoryOptions,
  outgoingCategoryOptions,
  initialState,
  onChange,
  onValidityChange,
}: {
  accounts: AccountRow[];
  incomingCategoryOptions: CategoryOption[];
  outgoingCategoryOptions: CategoryOption[];
  initialState: ReportFormState;
  onChange: (state: ReportFormState) => void;
  onValidityChange: (isValid: boolean) => void;
}) {
  const [formState, setFormState] = useState<ReportFormState>(initialState);
  const [touched, setTouched] = useState({
    description: false,
    amount: false,
    categoryId: false,
    accountId: false,
  });

  const categoryOptions =
    formState.type === 'incoming'
      ? incomingCategoryOptions
      : outgoingCategoryOptions;

  const errors = validateReportForm(formState);
  const descriptionError = touched.description
    ? (errors.description ?? '')
    : '';
  const amountError = touched.amount ? (errors.amount ?? '') : '';
  const categoryError = touched.categoryId ? (errors.categoryId ?? '') : '';
  const accountError = touched.accountId ? (errors.accountId ?? '') : '';

  const updateState = (nextState: ReportFormState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(Object.keys(validateReportForm(nextState)).length === 0);
  };

  useEffect(() => {
    onValidityChange(Object.keys(errors).length === 0);
  }, [errors, onValidityChange]);

  const updateDetail = (index: number, detail: ReportDetailFormState) => {
    const nextDetails = [...formState.details];
    nextDetails[index] = detail;
    updateState({ ...formState, details: nextDetails });
  };

  const addDetail = () => {
    updateState({
      ...formState,
      details: [...formState.details, { description: '', amount: '' }],
    });
  };

  const removeDetail = (index: number) => {
    const nextDetails = formState.details.filter((_, idx) => idx !== index);
    updateState({ ...formState, details: nextDetails });
  };

  return (
    <form className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Type</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            value={formState.type}
            onChange={(event) =>
              updateState({
                ...formState,
                type: event.target.value as ReportFormState['type'],
                categoryId: '',
              })
            }
          >
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
            <option value="debt">Debt</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Amount</label>
          <input
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
              amountError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
            }`}
            value={formState.amount}
            onChange={(event) =>
              updateState({ ...formState, amount: event.target.value })
            }
            onBlur={() =>
              setTouched((current) => ({ ...current, amount: true }))
            }
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
          />
          {amountError ? (
            <p className="text-xs text-rose-500">{amountError}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          Description
        </label>
        <input
          className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
            descriptionError
              ? 'border-rose-300 bg-rose-50/40'
              : 'border-slate-200'
          }`}
          value={formState.description}
          onChange={(event) =>
            updateState({ ...formState, description: event.target.value })
          }
          onBlur={() =>
            setTouched((current) => ({ ...current, description: true }))
          }
          type="text"
          placeholder="Monthly shelter expenses"
        />
        {descriptionError ? (
          <p className="text-xs text-rose-500">{descriptionError}</p>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">
            Category
          </label>
          <select
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
              categoryError
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }`}
            value={formState.categoryId}
            onChange={(event) =>
              updateState({ ...formState, categoryId: event.target.value })
            }
            onBlur={() =>
              setTouched((current) => ({ ...current, categoryId: true }))
            }
          >
            <option value="">Select category</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categoryError ? (
            <p className="text-xs text-rose-500">{categoryError}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">
            Account
          </label>
          <select
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
              accountError
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }`}
            value={formState.accountId}
            onChange={(event) =>
              updateState({ ...formState, accountId: event.target.value })
            }
            onBlur={() =>
              setTouched((current) => ({ ...current, accountId: true }))
            }
          >
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {accountError ? (
            <p className="text-xs text-rose-500">{accountError}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Details
          </p>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
            type="button"
            onClick={addDetail}
          >
            Add detail
          </button>
        </div>
        {formState.details.length === 0 ? (
          <p className="text-xs text-slate-400">
            Add detail rows to break down the report amount.
          </p>
        ) : (
          <div className="space-y-3">
            {formState.details.map((detail, index) => (
              <div
                key={`detail-${index}`}
                className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    Detail {index + 1}
                  </p>
                  <button
                    className="text-xs font-semibold text-rose-500"
                    type="button"
                    onClick={() => removeDetail(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
                    value={detail.description}
                    onChange={(event) =>
                      updateDetail(index, {
                        ...detail,
                        description: event.target.value,
                      })
                    }
                    type="text"
                    placeholder="Extra note"
                  />
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
                    value={detail.amount}
                    onChange={(event) =>
                      updateDetail(index, {
                        ...detail,
                        amount: event.target.value,
                      })
                    }
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                  />
                </div>
                <div className="mt-3">
                  <select
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
                    value={detail.categoryId ?? ''}
                    onChange={(event) =>
                      updateDetail(index, {
                        ...detail,
                        categoryId: event.target.value,
                      })
                    }
                  >
                    <option value="">Optional subcategory</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}

function CategoriesModal({
  incoming,
  outgoing,
  incomingOptions,
  outgoingOptions,
  onRefresh,
}: {
  incoming: CategoryNode[];
  outgoing: CategoryNode[];
  incomingOptions: CategoryOption[];
  outgoingOptions: CategoryOption[];
  onRefresh: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CategoryPanel
        title="Incoming"
        categories={incoming}
        options={incomingOptions}
        type="incoming"
        onRefresh={onRefresh}
      />
      <CategoryPanel
        title="Outgoing"
        categories={outgoing}
        options={outgoingOptions}
        type="outgoing"
        onRefresh={onRefresh}
      />
    </div>
  );
}

function CategoryPanel({
  title,
  categories,
  options,
  type,
  onRefresh,
}: {
  title: string;
  categories: CategoryNode[];
  options: CategoryOption[];
  type: 'incoming' | 'outgoing';
  onRefresh: () => void;
}) {
  const { showModal } = useModal();

  const handleAddCategory = () => {
    const formStateRef = { current: { name: '', inheritsId: '' } };

    void showModal({
      title: `Add ${title} category`,
      content: (
        <CategoryForm
          options={options}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
        />
      ),
      actions: [
        { label: 'Cancel', tone: 'ghost' },
        {
          label: 'Create',
          tone: 'primary',
          onSelect: async () => {
            await createCategory({
              name: formStateRef.current.name,
              inheritsId: formStateRef.current.inheritsId,
              type,
            });
            onRefresh();
          },
        },
      ],
      size: 'sm',
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {title} categories
        </h3>
        <button
          className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
          type="button"
          onClick={handleAddCategory}
        >
          Add category
        </button>
      </div>
      <div className="mt-4">
        {categories.length === 0 ? (
          <p className="text-xs text-slate-400">No categories yet.</p>
        ) : (
          <CategoryTree
            nodes={categories}
            onDelete={(categoryId) =>
              void handleDeleteCategory({
                categoryId,
                type,
                onRefresh,
                showModal,
              })
            }
          />
        )}
      </div>
    </div>
  );
}

function CategoryForm({
  options,
  onChange,
}: {
  options: CategoryOption[];
  onChange: (state: { name: string; inheritsId: string }) => void;
}) {
  const [formState, setFormState] = useState({ name: '', inheritsId: '' });

  const updateState = (nextState: { name: string; inheritsId: string }) => {
    setFormState(nextState);
    onChange(nextState);
  };

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Name</label>
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          value={formState.name}
          onChange={(event) =>
            updateState({ ...formState, name: event.target.value })
          }
          type="text"
          placeholder="Donations"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">Parent</label>
        <select
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          value={formState.inheritsId}
          onChange={(event) =>
            updateState({ ...formState, inheritsId: event.target.value })
          }
        >
          <option value="">No parent</option>
          {options.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}

function CategoryTree({
  nodes,
  onDelete,
}: {
  nodes: CategoryNode[];
  onDelete: (categoryId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <CategoryTreeNode key={node.id} node={node} onDelete={onDelete} />
      ))}
    </div>
  );
}

function CategoryTreeNode({
  node,
  onDelete,
}: {
  node: CategoryNode;
  onDelete: (categoryId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-sm text-slate-700">
        <button
          className="flex items-center gap-2"
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span className="text-xs font-semibold text-slate-600">
            {expanded ? '−' : '+'}
          </span>
          <span className="font-semibold">{node.name}</span>
        </button>
        <button
          className="text-xs font-semibold text-rose-500"
          type="button"
          onClick={() => onDelete(node.id)}
        >
          Delete
        </button>
      </div>
      {expanded && node.children.length > 0 && (
        <div className="mt-2 space-y-2 pl-4">
          {node.children.map((child) => (
            <CategoryTreeNode key={child.id} node={child} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

async function handleDeleteCategory({
  categoryId,
  type,
  onRefresh,
  showModal,
}: {
  categoryId: string;
  type: 'incoming' | 'outgoing';
  onRefresh: () => void;
  showModal: ReturnType<typeof useModal>['showModal'];
}) {
  const result = await deleteCategory({ id: categoryId, name: '', type });

  if (!result.success) {
    void showModal({
      title: 'Unable to delete category',
      description: result.message,
      actions: [
        {
          label: 'Close',
          tone: 'primary',
        },
      ],
      size: 'sm',
    });
    return;
  }

  onRefresh();
}

function validateAccountForm(state: AccountFormState) {
  const errors: { name?: string; iban?: string } = {};
  const name = state.name.trim();
  const iban = state.iban.trim();

  if (!name) {
    errors.name = 'Name is required.';
  }

  if (!iban) {
    errors.iban = 'IBAN is required.';
  } else if (!isValidIban(iban)) {
    errors.iban = 'IBAN must match the required format.';
  }

  return errors;
}

function isAccountFormValid(state: AccountFormState) {
  return Object.keys(validateAccountForm(state)).length === 0;
}

function validateReportForm(state: ReportFormState) {
  const errors: {
    description?: string;
    amount?: string;
    categoryId?: string;
    accountId?: string;
  } = {};

  const description = state.description.trim();
  const amount = Number(state.amount);

  if (!description) {
    errors.description = 'Description is required.';
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than zero.';
  }

  if (!state.categoryId) {
    errors.categoryId = 'Category is required.';
  }

  if (
    (state.type === 'incoming' || state.type === 'outgoing') &&
    !state.accountId
  ) {
    errors.accountId = 'Account is required.';
  }

  return errors;
}

function isReportFormValid(state: ReportFormState) {
  return Object.keys(validateReportForm(state)).length === 0;
}
