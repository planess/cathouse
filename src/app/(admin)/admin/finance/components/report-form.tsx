import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { validateReportForm } from '../helpers/validate-report-form';
import { AccountRow } from '../models/account-row';
import { CategoryOption } from '../models/category-option';
import { ReportDetailFormState } from '../models/report-detail-form-state';
import { ReportFormState } from '../models/report-form-state';

export default function ReportForm({
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
  const t = useTranslations('adminFinance');
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

  const errors = validateReportForm(formState, t);
  const descriptionError = touched.description
    ? (errors.description ?? '')
    : '';
  const amountError = touched.amount ? (errors.amount ?? '') : '';
  const categoryError = touched.categoryId ? (errors.categoryId ?? '') : '';
  const accountError = touched.accountId ? (errors.accountId ?? '') : '';

  const updateState = (nextState: ReportFormState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(
      Object.keys(validateReportForm(nextState, t)).length === 0,
    );
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
          <label className="text-xs font-semibold text-slate-600">
            {t('forms.report.typeLabel')}
          </label>
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
            <option value="incoming">{t('forms.report.typeIncoming')}</option>
            <option value="outgoing">{t('forms.report.typeOutgoing')}</option>
            <option value="debt">{t('forms.report.typeDebt')}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">
            {t('forms.report.amountLabel')}
          </label>
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
            placeholder={t('forms.report.amountPlaceholder')}
          />
          {amountError ? (
            <p className="text-xs text-rose-500">{amountError}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          {t('forms.report.descriptionLabel')}
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
          placeholder={t('forms.report.descriptionPlaceholder')}
        />
        {descriptionError ? (
          <p className="text-xs text-rose-500">{descriptionError}</p>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">
            {t('forms.report.categoryLabel')}
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
            <option value="">{t('forms.report.categoryPlaceholder')}</option>
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
            {t('forms.report.accountLabel')}
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
            <option value="">{t('forms.report.accountPlaceholder')}</option>
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
            {t('forms.report.detailsTitle')}
          </p>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
            type="button"
            onClick={addDetail}
          >
            {t('forms.report.addDetail')}
          </button>
        </div>
        {formState.details.length === 0 ? (
          <p className="text-xs text-slate-400">
            {t('forms.report.detailsEmpty')}
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
                    {t('forms.report.detailLabel', { index: index + 1 })}
                  </p>
                  <button
                    className="text-xs font-semibold text-rose-500"
                    type="button"
                    onClick={() => removeDetail(index)}
                  >
                    {t('common.remove')}
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
                    placeholder={t('forms.report.detailDescriptionPlaceholder')}
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
                    placeholder={t('forms.report.detailAmountPlaceholder')}
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
                    <option value="">
                      {t('forms.report.detailCategoryPlaceholder')}
                    </option>
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
