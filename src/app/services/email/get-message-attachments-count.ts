import type { EmailMessageDocument } from './document-types';

export function getMessageAttachmentsCount(
  message?: EmailMessageDocument,
): number {
  return message?.attachments?.length ?? 0;
}
