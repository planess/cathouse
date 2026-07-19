import { getHeaderValue } from './get-header-value';
import { getMailgunField } from './get-mailgun-field';
import { parseAddressList } from './parse-address-list';
import { uniqueEmailAddresses } from './unique-email-addresses';

export function parseIncomingMailboxRecipients(
  fields: Record<string, string>,
  headers: Record<string, string | string[]>,
) {
  const recipientField =
    getMailgunField(fields, 'recipient') ??
    getHeaderValue(headers, 'Delivered-To');
  const recipients =
    recipientField === undefined ? [] : parseAddressList(recipientField);

  if (recipients.length > 0) {
    return uniqueEmailAddresses(recipients);
  }

  const toField =
    getHeaderValue(headers, 'To') ?? getMailgunField(fields, 'To');
  const toRecipients = toField === undefined ? [] : parseAddressList(toField);

  if (toRecipients.length > 0) {
    return uniqueEmailAddresses(toRecipients);
  }

  throw new Error('Invalid recipient email.');
}
