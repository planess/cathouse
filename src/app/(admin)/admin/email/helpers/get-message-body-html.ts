import type { EmailMessageSummary } from '@app/services/email.service';

import { decodeHtmlEntities } from './decode-html-entities';

export function getMessageBodyHtml(
  message: EmailMessageSummary,
  showFullMessage = false,
): string {
  const preferredHtml = showFullMessage
    ? message.content.html ?? message.content.text
    : message.content['stripped-html'] ??
      message.content['stripped-text'] ??
      message.content.html ??
      message.content.text;
  const content = decodeHtmlEntities(
    preferredHtml ?? '',
  ).replaceAll(/cid:([^\s"'>]+)/gi, (reference, rawContentId: string) => {
    const contentId = rawContentId.replaceAll(/[<>]/g, '');
    const attachment = message.attachments.find(
      (item) => item.contentId === contentId,
    );

    return attachment?.url ?? reference;
  });

  return content
    .replaceAll(/<\/?(?:script|iframe|object|embed|form)[^>]*>/gi, '')
    .replaceAll(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replaceAll(
      /\s(?:href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi,
      '',
    );
}
