import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { MailgunMessageData } from 'mailgun.js/definitions';

import { Singleton } from './singleton';

interface MessageResult {
  status: number; // 200 for success
}

interface AttachmentFile {
  data: Buffer;
  filename: string;
}

interface InlineFile {
  data: Buffer;
  filename: string;
}

class EmailService extends Singleton {
  mailgun = new Mailgun(FormData);
  client = this.mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY ?? '',
    url: 'https://api.eu.mailgun.net',
  });

  async sendEmail(
    to: string | string[],
    subject: string,
    body: string,
    context = 'info',
    attachments: Array<AttachmentFile> = [],
    inline: Array<InlineFile> = [],
  ): Promise<MessageResult> {
    const messageParameters = {
      from: `Periphery Foundation<${context}@perilines.com.ua>`,
      to,
      subject,
      html: body, // todo: add text version
    } as MailgunMessageData;

    if (attachments.length > 0) {
      messageParameters.attachment = attachments.map((attachment) => ({
        data: attachment.data,
        filename: attachment.filename,
      }));
    }

    if (inline.length > 0) {
      messageParameters.inline = inline.map((inlineFile) => ({
        data: inlineFile.data,
        filename: inlineFile.filename,
      }));
    }

    return this.client.messages.create('perilines.com.ua', messageParameters);
  }
}

export const emailService = EmailService.getInstance<EmailService>();
