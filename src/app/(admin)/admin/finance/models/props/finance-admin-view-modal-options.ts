import { AccountFormState } from '../account-form-state';
import { ReportFormState } from '../report-form-state';

export type AccountModalOptions = {
  title: string;
  initialState: AccountFormState;
  submitLabel: string;
  onSubmit: (state: AccountFormState) => Promise<void>;
};

export type ReportModalOptions = {
  title: string;
  initialState: ReportFormState;
  submitLabel: string;
  onSubmit: (state: ReportFormState) => Promise<void>;
};
