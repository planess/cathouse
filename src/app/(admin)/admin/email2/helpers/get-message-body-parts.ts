import type { EmailMessageSummary } from '@app/services/email.service';

import { getMessageBody } from './get-message-body';

export function getMessageBodyParts(
  message: EmailMessageSummary,
): Array<[isQuote: boolean, body: string]> {
  const html = message.content.html;

  if (html === undefined || !/<blockquote\b/i.test(html)) {
    return [[false, getMessageBody(message)]];
  }

  const parts = html.split(/(<blockquote\b[^>]*>[\S\s]*?<\/blockquote>)/gi);

  return parts.flatMap((part, index) => {
    const body = part
      .replaceAll(/<[^>]+>/g, ' ')
      .replaceAll(/\s+\n/g, '\n')
      .trim();

    return body.length > 0 ? [[index % 2 === 1, body]] : [];
  });
}
