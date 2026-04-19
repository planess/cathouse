export type AccountPayload = {
  id?: string;
  name: string;
  iban: string;
};

export type BaseCategoryPayload = {
  id?: string;
  name: string;
  inheritsId?: string;
  active?: boolean;
};

export type CategoryPayload = BaseCategoryPayload;

export type ReportDetailPayload = {
  description: string;
  amount: number;
  categoryId?: string;
};

export type ReportDocumentPayload = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
  uploadedAt: string;
  checksum: string;
  isDeleted?: boolean;
};

export type ReportPayload = {
  id?: string;
  type: 'incoming' | 'outgoing' | 'debt';
  description: string;
  categoryId?: string;
  accountId?: string;
  sender?: string;
  recipient?: string;
  iban?: string;
  operationDate?: string;
  amount: number;
  details?: ReportDetailPayload[];
  documents?: ReportDocumentPayload[];
};
