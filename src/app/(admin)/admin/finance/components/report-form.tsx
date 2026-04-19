import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { RadioGroup } from '@app/components/radio-group';

import { validateReportForm } from '../helpers/validate-report-form';
import { ReportFormProps } from '../models/props/report-form-props';
import { ReportDetailFormState } from '../models/report-detail-form-state';
import { ReportFormState } from '../models/report-form-state';
import { TranslationFn } from '../models/transform-fn';

import { IbanInput } from './iban-input';
import IncomingParentTreeSelect from './incoming-parent-tree-select';

export default function ReportForm({
  accounts,
  categories,
  categoryOptions,
  initialState,
  onPendingFilesChange,
  onChange,
  onValidityChange,
}: ReportFormProps) {
  const t = useTranslations('adminFinance');
  const [formState, setFormState] = useState<ReportFormState>(initialState);
  const translate: TranslationFn = (key, values) =>
    t(key, values as Record<string, string | number | Date> | undefined);

  const categoryTree = categories;
  const isDebtType = formState.type === 'debt';
  const showIbanField = formState.type === 'outgoing';
  const showDetails =
    formState.type === 'outgoing' || formState.type === 'debt';
  const showDocuments =
    formState.type === 'outgoing' || formState.type === 'debt';
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'UAH',
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 2,
      }),
    [],
  );

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );

  const getOutgoingMaxAmount = (state: ReportFormState) => {
    if (state.type !== 'outgoing') {
      return;
    }

    const accountBalance = accountById.get(state.accountId)?.balance ?? 0;

    return accountBalance > 0 ? accountBalance : 0;
  };

  const selectedAccountBalance = Math.max(
    0,
    accountById.get(formState.accountId)?.balance ?? 0,
  );
  const enteredAmount = Number(formState.amount);
  const hasEnteredOutgoingAmount =
    Number.isFinite(enteredAmount) && enteredAmount > 0;

  const maxOutgoingAmount = getOutgoingMaxAmount(formState);
  const invalidOutgoingAccount =
    formState.type === 'outgoing' &&
    formState.accountId !== '' &&
    (selectedAccountBalance <= 0 ||
      (hasEnteredOutgoingAmount && selectedAccountBalance < enteredAmount));

  const errors = validateReportForm(formState, translate, {
    maxOutgoingAmount: maxOutgoingAmount ?? undefined,
    invalidOutgoingAccount,
  });
  const descriptionError = errors.description ?? '';
  const amountError = errors.amount ?? '';
  const categoryError = errors.categoryId ?? '';
  const accountError = errors.accountId ?? '';
  const operationDateError = errors.operationDate ?? '';

  const coerceOutgoingAccountSelection = (state: ReportFormState) => {
    if (state.type !== 'outgoing' || state.accountId === '') {
      return state;
    }

    const balance = accountById.get(state.accountId)?.balance ?? 0;
    const nextAmount = Number(state.amount);
    const hasNextAmount = Number.isFinite(nextAmount) && nextAmount > 0;

    if (balance <= 0 || (hasNextAmount && balance < nextAmount)) {
      return {
        ...state,
        accountId: '',
      };
    }

    return state;
  };

  const updateState = (nextState: ReportFormState) => {
    const normalizedState = coerceOutgoingAccountSelection(nextState);

    setFormState(normalizedState);
    onChange(normalizedState);
    onValidityChange(
      Object.keys(
        validateReportForm(normalizedState, translate, {
          maxOutgoingAmount:
            getOutgoingMaxAmount(normalizedState) ?? undefined,
          invalidOutgoingAccount:
            normalizedState.type === 'outgoing' &&
            normalizedState.accountId !== '' &&
            (accountById.get(normalizedState.accountId)?.balance ?? 0) <= 0,
        }),
      ).length === 0,
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
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          {t('forms.report.typeLabel')}
        </label>
        <RadioGroup
          value={formState.type}
          direction="horizontal"
          options={[
            {
              value: 'incoming',
              label: t('forms.report.typeIncoming'),
            },
            {
              value: 'outgoing',
              label: t('forms.report.typeOutgoing'),
            },
            {
              value: 'debt',
              label: t('forms.report.typeDebt'),
            },
          ]}
          onChange={(value) =>
            {
              const nextType = value as ReportFormState['type'];
              const shouldClearFiles = nextType === 'incoming';

              if (shouldClearFiles && pendingFiles.length > 0) {
                setPendingFiles([]);
                onPendingFilesChange([]);
              }

              updateState({
                ...formState,
                type: nextType,
                accountId:
                  nextType === 'outgoing' &&
                  (accountById.get(formState.accountId)?.balance ?? 0) <= 0
                    ? ''
                    : formState.accountId,
                categoryId: '',
                documents: shouldClearFiles ? [] : formState.documents,
              });
            }
          }
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 sm:order-1">
          <label className="text-xs font-semibold text-slate-600">
            {t('forms.report.accountLabel')}
          </label>
          <RadioGroup
            value={formState.accountId}
            direction="vertical"
            className={
              accountError
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }
            options={accounts.map((account) => ({
              value: account.id,
              label: account.name,
              description: account.iban,
              disabled:
                formState.type === 'outgoing' &&
                (account.balance <= 0 ||
                  (hasEnteredOutgoingAmount &&
                    account.balance < enteredAmount)) &&
                account.id !== formState.accountId,
            }))}
            onChange={(value) =>
              updateState({ ...formState, accountId: value })
            }
          />
          {accountError ? (
            <p className="text-xs text-rose-500">{accountError}</p>
          ) : null}
        </div>
        <div className="space-y-2 sm:order-2">
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
            type="number"
            min={0.01}
            max={
              formState.type === 'outgoing'
                ? (maxOutgoingAmount ?? undefined)
                : undefined
            }
            step="0.01"
            placeholder={t('forms.report.amountPlaceholder')}
          />
          {formState.type === 'outgoing' ? (
            <p className="text-xs text-slate-500">
              {formState.accountId !== ''
                ? t('forms.report.amountMaxHint', {
                  max: currency.format(maxOutgoingAmount ?? 0),
                  account: currency.format(selectedAccountBalance),
                })
                : t('forms.report.selectAccountLimitHint')}
            </p>
          ) : null}
          {formState.type === 'outgoing' ? (
            <p className="text-xs text-slate-500">
              {t('forms.report.targetedSpendingHint')}
            </p>
          ) : null}
          {amountError ? (
            <p className="text-xs text-rose-500">{amountError}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">
            {t('forms.report.operationDateLabel')}
          </label>
          <input
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
              operationDateError !== ''
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }`}
            value={String(formState.operationDate)}
            onChange={(event) =>
              updateState({ ...formState, operationDate: event.target.value })
            }
            disabled={isDebtType}
            type="datetime-local"
          />
          {operationDateError !== '' ? (
            <p className="text-xs text-rose-500">{operationDateError}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">
            {t('forms.report.counterpartyLabel')}
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            value={String(
              formState.type === 'incoming'
                ? formState.sender
                : formState.recipient,
            )}
            onChange={(event) =>
              updateState({
                ...formState,
                ...(formState.type === 'incoming'
                  ? { sender: event.target.value }
                  : { recipient: event.target.value }),
              })
            }
            disabled={isDebtType}
            type="text"
            placeholder={
              formState.type === 'incoming'
                ? t('forms.report.senderPlaceholder')
                : t('forms.report.recipientPlaceholder')
            }
          />
        </div>
      </div>

      {showIbanField ? (
        <div className="space-y-2">
          <IbanInput
            label={t('forms.report.ibanLabel')}
            value={String(formState.iban)}
            onChange={(value) => updateState({ ...formState, iban: value })}
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">
            {t('forms.report.categoryLabel')}
          </label>
          <IncomingParentTreeSelect
            categories={categoryTree}
            selectedParentId={formState.categoryId}
            disabled={false}
            emptyLabel={t('forms.report.categoryPlaceholder')}
            onSelect={(categoryId) => updateState({ ...formState, categoryId })}
          />
          {categoryError ? (
            <p className="text-xs text-rose-500">{categoryError}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">
            {t('forms.report.descriptionLabel')}
          </label>
          <textarea
            className={`w-full min-h-11 rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
              descriptionError
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }`}
            value={formState.description}
            onChange={(event) =>
              updateState({ ...formState, description: event.target.value })
            }
            rows={2}
            placeholder={t('forms.report.descriptionPlaceholder')}
          />
          {descriptionError ? (
            <p className="text-xs text-rose-500">{descriptionError}</p>
          ) : null}
        </div>
      </div>

      {showDocuments ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t('forms.report.documentsTitle')}
            </p>
            <label className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600">
              {t('forms.report.documentsUpload')}
              <input
                className="hidden"
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                multiple
                onChange={(event) => {
                  const selectedFiles = [...(event.target.files ?? [])];

                  if (selectedFiles.length === 0) {
                    return;
                  }

                  const nextPendingFiles = [...pendingFiles, ...selectedFiles];

                  setPendingFiles(nextPendingFiles);
                  onPendingFilesChange(nextPendingFiles);
                  event.target.value = '';
                }}
              />
            </label>
          </div>
          {formState.documents.length === 0 && pendingFiles.length === 0 ? (
            <p className="text-xs text-slate-400">
              {t('forms.report.documentsEmpty')}
            </p>
          ) : (
            <div className="space-y-2">
              {formState.documents.map((document, index) => (
                <div
                  key={`${document.key}-${document.uploadedAt}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2"
                >
                  <a
                    className={`max-w-70 truncate text-xs font-medium ${
                      document.isDeleted === true
                        ? 'text-slate-400 line-through'
                        : 'text-sky-600 hover:underline'
                    }`}
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    title={document.originalName}
                  >
                    {document.originalName}
                  </a>
                  <button
                    className={`text-xs font-semibold ${
                      document.isDeleted === true
                        ? 'text-emerald-600'
                        : 'text-rose-500'
                    }`}
                    type="button"
                    onClick={() => {
                      const nextDocuments = formState.documents.map(
                        (item, itemIndex) => {
                          if (itemIndex !== index) {
                            return item;
                          }

                          return {
                            ...item,
                            isDeleted: item.isDeleted !== true,
                          };
                        },
                      );

                      updateState({
                        ...formState,
                        documents: nextDocuments,
                      });
                    }}
                  >
                    {document.isDeleted === true
                      ? t('forms.report.documentsRestore')
                      : t('forms.report.documentsDelete')}
                  </button>
                </div>
              ))}
              {pendingFiles.map((file, index) => (
                <div
                  key={`pending-${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2"
                >
                  <span
                    className="max-w-70 truncate text-xs font-medium text-slate-600"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <button
                    className="text-xs font-semibold text-rose-500"
                    type="button"
                    onClick={() => {
                      const nextPendingFiles = pendingFiles.filter(
                        (_, itemIndex) => itemIndex !== index,
                      );

                      setPendingFiles(nextPendingFiles);
                      onPendingFilesChange(nextPendingFiles);
                    }}
                  >
                    {t('forms.report.documentsDelete')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {showDetails ? (
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
                      placeholder={t(
                        'forms.report.detailDescriptionPlaceholder',
                      )}
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
      ) : null}
    </form>
  );
}
