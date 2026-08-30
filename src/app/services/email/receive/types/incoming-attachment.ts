import type { IncomingMailgunEmailPayload } from '@app/services/email.service';

export type IncomingAttachment =
  IncomingMailgunEmailPayload['attachments'][number];
