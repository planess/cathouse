import { toIsoString } from './date-helpers';

import type { EmailMessageDocument } from './document-types';

export function getMessageDate(message?: EmailMessageDocument): string {
  if (message === undefined) {
    return '';
  }

  return toIsoString(message.dates.headerDate ?? message.dates.createdAt);
}
