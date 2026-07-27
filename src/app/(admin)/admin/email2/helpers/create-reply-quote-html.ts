import type { EmailMessageSummary } from '@app/services/email.service';

import { escapeHtml } from './escape-html';
import { formatAddress } from './format-address';
import { formatEmailDate } from './format-email-date';
import { getMessageBody } from './get-message-body';

export function createReplyQuoteHtml(messages: EmailMessageSummary[]): string {
  if (messages.length === 0) {
    return '<p></p>';
  }

  const message = messages.at(-1);

  if (message === undefined) {
    return '<p></p>';
  }

  const body =
    message.content.html ??
    `<p>${escapeHtml(getMessageBody(message)).replaceAll('\n', '<br>')}</p>`;

  return [
    '<p></p>',
    `<p>On ${escapeHtml(formatEmailDate(message.headerDate))}, `,
    `${escapeHtml(formatAddress(message.from))} wrote:</p>`,
    `<blockquote>${body}</blockquote>`,
  ].join('');
}
