import type { EmailMessageSummary } from '@app/services/email.service';

import { getPlainTextFromHtml } from './get-plain-text-from-html';

export function getMessageBody(message: EmailMessageSummary): string {
  const content = message.content.html ?? message.content.text ?? '';

  return getPlainTextFromHtml(content);
}
