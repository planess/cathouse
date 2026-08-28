import { normalizeMessageId } from './normalize-message-id';

import type { MessagesSendResult } from 'mailgun.js/definitions';

export function getMailgunMessageId({ id }: MessagesSendResult): string {
  if (id === undefined || id.trim().length === 0) {
    throw new Error('Mailgun did not return a message id.');
  }

  return normalizeMessageId(id);
}
