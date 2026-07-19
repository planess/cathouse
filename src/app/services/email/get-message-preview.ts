import { stripHtml } from './strip-html';

import type { EmailMessageDocument } from './document-types';

export function getMessagePreview(message?: EmailMessageDocument): string {
  if (message === undefined) {
    return '';
  }

  return stripHtml(message.content.text ?? message.content.html ?? '');
}
