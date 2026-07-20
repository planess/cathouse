import type { EmailMessageSummary } from '@app/services/email.service';

import { escapeHtml } from './escape-html';
import { formatAddress } from './format-address';
import { formatEmailDate } from './format-email-date';
import { getMessageBody } from './get-message-body';

export function createReplyQuoteHtml(
  messages: EmailMessageSummary[],
): string {
  if (messages.length === 0) {
    return '<p></p>';
  }

  const historyHtml = messages
    .toReversed()
    .map((message) => {
      const body = escapeHtml(getMessageBody(message)).replaceAll('\n', '<br>');

      return [
        `<p>On ${escapeHtml(formatEmailDate(message.headerDate))}, `,
        `${escapeHtml(formatAddress(message.from))} wrote:</p>`,
        `<p>${body}</p>`,
      ].join('');
    })
    .join('<p><br></p>');

  return `<p></p><blockquote>${historyHtml}</blockquote>`;
}
