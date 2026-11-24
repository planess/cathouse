import type { EmailMessageSummary } from '@app/services/email.service';

/**
 * Returns the message attachments that belong in the attachment list. Media
 * already shown in the rendered body (inline `cid:` images resolved to their
 * public URL) is left out, so it is only visible in the content and is not
 * offered for download a second time.
 *
 * @param attachments - All attachments of the message.
 * @param renderedHtml - Body HTML as rendered, after `cid:` references were
 * replaced with attachment URLs.
 * @returns Attachments that are not displayed inside the body.
 */
export function getListedAttachments(
  attachments: EmailMessageSummary['attachments'],
  renderedHtml: string,
): EmailMessageSummary['attachments'] {
  return attachments.filter(
    (attachment) =>
      attachment.url === undefined || !renderedHtml.includes(attachment.url),
  );
}
