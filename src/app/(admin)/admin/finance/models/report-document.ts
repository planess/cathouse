export type ReportDocument = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
  uploadedAt: string;
  checksum: string;
  isDeleted?: boolean;
};
