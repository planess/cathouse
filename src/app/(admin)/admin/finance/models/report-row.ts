import { ReportDetailRow } from './report-detail-row';
import { ReportDocument } from './report-document';

export type CategoryWithdrawalRow = {
  categoryName: string;
  from: number;
  to: number;
  delta: number;
};

export type ReportRow = {
  id: string;
  type: 'incoming' | 'outgoing' | 'debt';
  description: string;
  categoryName: string;
  categoryBalanceFrom?: number;
  categoryBalanceTo?: number;
  categoryBalanceDelta?: number;
  categoryWithdrawals?: CategoryWithdrawalRow[];
  accountName: string;
  sender?: string;
  recipient?: string;
  iban?: string;
  amount: number;
  balance: number;
  details: ReportDetailRow[];
  documents: ReportDocument[];
  operationDate: string;
  createdAt: string;
  categoryId?: string;
  accountId?: string;
};
