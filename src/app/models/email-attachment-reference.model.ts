export interface EmailAttachmentReference {
  filename: string;
  contentType: string;
  sizeBytes: number;

  disposition: 'attachment' | 'inline';
  contentId?: string;
  storageKey?: string;
}
