import type { IncomingMailgunAttachment } from './incoming-mailgun-attachment';

export type IncomingMailgunEmailPayload = {
  fields: Record<string, string>;
  attachments: IncomingMailgunAttachment[];
  remoteIp?: string;
};
