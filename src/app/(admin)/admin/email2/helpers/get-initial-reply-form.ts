import type { EmailMessageSummary } from '@app/services/email.service';

import { createReplyQuoteHtml } from './create-reply-quote-html';
import { formatAddress } from './format-address';

import type { ThreadReplyFormState } from '../types/thread-reply-form-state';

export function getInitialReplyForm(
  messages: EmailMessageSummary[],
): ThreadReplyFormState {
  const lastIncomingMessage = messages
    .toReversed()
    .find((message) => message.direction === 'incoming');
  const recipient =
    lastIncomingMessage?.replyTo[0] ?? lastIncomingMessage?.from;

  return {
    to: recipient === undefined ? '' : formatAddress(recipient),
    cc: '',
    bcc: '',
    bodyHtml: createReplyQuoteHtml(messages),
  };
}
