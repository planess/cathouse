import { ReportDetailFormState } from './report-detail-form-state';
import { ReportDocument } from './report-document';

export type ReportFormState = {
  type: 'incoming' | 'outgoing' | 'debt';
  description: string;
  categoryId: string;
  accountId: string;
  sender: string;
  recipient: string;
  iban: string;
  operationDate: string;
  amount: string;
  details: ReportDetailFormState[];
  documents: ReportDocument[];
};
