import { ReportFormState } from '../models/report-form-state';
import { TranslationFn } from '../models/transform-fn';

import { validateReportForm } from './validate-report-form';

export function isReportFormValid(state: ReportFormState, t: TranslationFn) {
  return Object.keys(validateReportForm(state, t)).length === 0;
}
