import { ReportDetailFormState } from './report-detail-form-state';

export type ReportFormState = {
  type: 'incoming' | 'outgoing' | 'debt';
  description: string;
  categoryId: string;
  accountId: string;
  amount: string;
  details: ReportDetailFormState[];
};
