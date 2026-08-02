import type { EmailMessageSummary } from '@app/services/email.service';

import { escapeHtml } from './escape-html';
import { formatAddress } from './format-address';
import { formatReplyQuoteDate } from './format-reply-quote-date';
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
    '<p></p>',
    `<p>↪ Відповідь до ${escapeHtml(formatAddress(message.from))} · ${escapeHtml(formatReplyQuoteDate(message.headerDate))}</p>`,
    `<blockquote>${body}</blockquote>`,
  ].join('');
}
