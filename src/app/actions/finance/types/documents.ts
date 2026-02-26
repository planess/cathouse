import { Decimal128, ObjectId } from 'mongodb';

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
  account: ObjectId;
  amount: Decimal128;
  balance: Decimal128;
  deposit?: Decimal128;
  linkedTo?: ObjectId;
  sender?: string;
  description?: string;
  operationDate?: Date;
  createdAt?: Date;
};

export type OutgoingReportDocument = {
  _id: ObjectId;
  account: ObjectId;
  amount: Decimal128;
  balance: Decimal128;
  linkedTo?: ObjectId;
  recipient?: string;
  iban?: string;
  description?: string;
  operationDate?: Date;
  details?: Array<{
    category?: ObjectId;
    description: string;
    amount: Decimal128;
  }>;
  withdrawal?: Array<{
    category: ObjectId;
    amount: Decimal128;
    balance: Decimal128;
    previousBalance?: Decimal128;
  }>;
  documents?: ReportDocumentAsset[];
  createdAt?: Date;
};

export type DebtReportDocument = {
  _id: ObjectId;
  amount: Decimal128;
  recipient?: string;
  description?: string;
  linkedTo?: ObjectId;
  documents?: ReportDocumentAsset[];
  createdAt?: Date;
};
