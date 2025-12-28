export interface MediaAsset {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
  uploadedAt: Date;
  checksum?: string;
}
