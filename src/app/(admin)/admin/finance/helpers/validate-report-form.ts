import { ReportFormState } from '../models/report-form-state';
import { TranslationFn } from '../models/transform-fn';

type ValidateReportFormOptions = {
  maxOutgoingAmount?: number;
  invalidOutgoingAccount?: boolean;
};

export function validateReportForm(
  state: ReportFormState,
  t: TranslationFn,
  options: ValidateReportFormOptions = {},
) {
  const errors: {
    description?: string;
    amount?: string;
    categoryId?: string;
    accountId?: string;
    operationDate?: string;
  } = {};

  const description = state.description.trim();
  const amount = Number(state.amount);

  if (!description) {
    errors.description = t('forms.report.descriptionRequired');
  }

  if (!Number.isFinite(amount) || amount < 0.01) {
    errors.amount = t('forms.report.amountRequired');
  }

  if (
    state.type === 'outgoing' &&
    Number.isFinite(amount) &&
    amount >= 0.01 &&
    typeof options.maxOutgoingAmount === 'number' &&
    amount > options.maxOutgoingAmount
  ) {
    errors.amount = t('forms.report.amountMaxExceeded', {
      max: options.maxOutgoingAmount.toFixed(2),
    });
  }

  if (state.type === 'outgoing' && options.invalidOutgoingAccount === true) {
    errors.accountId = t('forms.report.accountPositiveRequired');
  }

  if (
    (state.type === 'incoming' || state.type === 'outgoing') &&
    !state.accountId
  ) {
    errors.accountId = t('forms.report.accountRequired');
  }

  if (
    (state.type === 'incoming' || state.type === 'outgoing') &&
    !state.operationDate
  ) {
    errors.operationDate = t('forms.report.operationDateRequired');
  }

  return errors;
}
