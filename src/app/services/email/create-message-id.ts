import { randomBytes } from 'node:crypto';

import { EMAIL_MAILBOX_DOMAIN } from './constants';

export function createMessageId() {
  return `<${randomBytes(16).toString('hex')}@${EMAIL_MAILBOX_DOMAIN}>`;
}
