import type {
  EmailAddressSummary,
  EmailMessageSummary,
} from '@app/services/email.service';

import { createReplyQuoteHtml } from './create-reply-quote-html';

import type { ThreadReplyFormState } from '../types/thread-reply-form-state';

export function getInitialReplyForm(
  messages: EmailMessageSummary[],
  participants: EmailAddressSummary[],
): ThreadReplyFormState {
  const lastIncomingMessage = messages
    .toReversed()
    .find((message) => message.direction === 'incoming');
  const recipient =
    lastIncomingMessage?.replyTo[0] ?? lastIncomingMessage?.from;

  const recipients =
    participants.length > 0
      ? participants
      : recipient === undefined
        ? []
        : [recipient];

  return {
    to:
      recipients.length === 0
        ? [{ name: '', email: '' }]
        : recipients.map((item) => ({
            name: item.name ?? '',
            email: item.address,
          })),
    cc: [{ name: '', email: '' }],
    bcc: [{ name: '', email: '' }],
    bodyHtml: createReplyQuoteHtml(messages),
  };
}
