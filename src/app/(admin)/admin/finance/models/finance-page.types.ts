import { Decimal128, ObjectId } from 'mongodb';

export type BankAccountDocument = {
  _id: ObjectId;
  name: string;
  iban: string;
  balance?: Decimal128 | number;
  isActive?: boolean;
  createdAt?: Date;
};

export type CategoryDocument = {
  _id: ObjectId;
  name: string;
  inherits?: ObjectId;
  linkedTo?: ObjectId;
  active?: boolean;
  balance?: Decimal128 | number;
  createdAt: Date;
};

export type OutgoingReportDetailDocument = {
  description: string;
  amount: Decimal128;
  category?: ObjectId;
};

export type ReportDocumentAsset = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
  uploadedAt: Date;
  checksum: string;
  isDeleted?: boolean;
};

export type IncomingReportDocument = {
  _id: ObjectId;
  account?: ObjectId;
  amount: Decimal128;
  balance?: Decimal128;
  deposit?: Decimal128;
  linkedTo?: ObjectId;
  sender?: string;
  description?: string;
  operationDate?: Date;
  createdAt?: Date;
};

export type OutgoingReportDocument = {
  _id: ObjectId;
  account?: ObjectId;
  amount: Decimal128;
  balance?: Decimal128;
  linkedTo?: ObjectId;
  recipient?: string;
  iban?: string;
  description?: string;
  details?: OutgoingReportDetailDocument[];
  withdrawal?: Array<{
    category?: ObjectId;
    amount?: Decimal128;
    balance?: Decimal128;
    previousBalance?: Decimal128;
  }>;
  documents?: ReportDocumentAsset[];
  operationDate?: Date;
  createdAt?: Date;
};

export type DebtReportDocument = {
  _id: ObjectId;
  amount: Decimal128;
  linkedTo?: ObjectId;
  recipient?: string;
  description?: string;
  details?: OutgoingReportDetailDocument[];
  documents?: ReportDocumentAsset[];
  createdAt?: Date;
};

export type SearchParams = {
  month?: string;
  range?: string;
};

export type ReportRange = 'month' | 'year';

export type FinancePageProps = {
  searchParams?: Promise<SearchParams>;
};
