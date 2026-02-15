import { ReportFormState } from '../models/report-form-state';
import { TranslationFn } from '../models/transform-fn';

export function validateReportForm(state: ReportFormState, t: TranslationFn) {
  const errors: {
    description?: string;
    amount?: string;
    categoryId?: string;
    accountId?: string;
  } = {};

  const description = state.description.trim();
  const amount = Number(state.amount);

  if (!description) {
    errors.description = t('forms.report.descriptionRequired');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = t('forms.report.amountRequired');
  }

  if (!state.categoryId) {
    errors.categoryId = t('forms.report.categoryRequired');
  }

  if (
    (state.type === 'incoming' || state.type === 'outgoing') &&
    !state.accountId
  ) {
    errors.accountId = t('forms.report.accountRequired');
  }

  return errors;
}
