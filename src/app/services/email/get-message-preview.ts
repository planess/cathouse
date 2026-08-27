import { stripHtml } from './strip-html';

import type { EmailMessageDocument } from './document-types';

export function getMessagePreview(message?: EmailMessageDocument): string {
  if (message === undefined) {
    return '';
  }

  return stripHtml(
    message.content['stripped-text'] ??
      message.content['stripped-html'] ??
      message.content.text ??
      message.content.html ??
      '',
  );
}
