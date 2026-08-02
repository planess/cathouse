import type { EmailMessageSummary } from '@app/services/email.service';

export function getMessageBody(message: EmailMessageSummary): string {
  return (
    message.content.text ??
    (message.content.html !== undefined
      ? message.content.html.replaceAll(/<[^>]+>/g, ' ')
      : '')
  );
}
