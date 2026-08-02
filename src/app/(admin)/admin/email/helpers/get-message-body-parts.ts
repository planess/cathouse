import type { EmailMessageSummary } from '@app/services/email.service';

import { decodeHtmlEntities } from './decode-html-entities';
import { getMessageBody } from './get-message-body';
import { getPlainTextFromHtml } from './get-plain-text-from-html';

export function getMessageBodyParts(
  message: EmailMessageSummary,
): Array<[isQuote: boolean, body: string]> {
  const html = message.content.html ?? message.content.text;

  if (html === undefined) {
    return [[false, getMessageBody(message)]];
  }

  const decodedHtml = decodeHtmlEntities(html);

  if (!/<blockquote\b/i.test(decodedHtml)) {
    return [[false, getPlainTextFromHtml(decodedHtml)]];
  }

  const parts = decodedHtml.split(
    /(<blockquote\b[^>]*>[\S\s]*?<\/blockquote>)/gi,
  );

  return parts.flatMap((part, index) => {
    const body = getPlainTextFromHtml(part);

    return body.length > 0 ? [[index % 2 === 1, body]] : [];
  });
}
