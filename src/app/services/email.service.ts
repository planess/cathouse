import { Singleton } from './singleton';

class EmailService extends Singleton {
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    context = 'info',
  ): Promise<Response> {
    const formData = new FormData();
    formData.append('from', `Perimeter <${context}@perilines.com.ua>`);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', body);

    return fetch('https://api.eu.mailgun.net/v3/perilines.com.ua/messages', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`api:${process.env.MAILGUN_API_KEY}`)}`,
      },
      body: formData,
    });
  }
}

export const emailService = EmailService.getInstance<EmailService>();
