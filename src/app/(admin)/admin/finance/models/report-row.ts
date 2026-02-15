import { ReportDetailRow } from './report-detail-row';

export type ReportRow = {
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
