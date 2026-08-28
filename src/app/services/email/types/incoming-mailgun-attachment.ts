export type IncomingMailgunAttachment = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  fieldName: string;
  file?: File;
};
