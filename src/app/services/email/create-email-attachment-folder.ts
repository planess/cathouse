import { randomBytes } from 'node:crypto';

export function createEmailAttachmentFolder(emailThreadId: string): string {
  return `email/${emailThreadId}/${randomBytes(8).toString('hex')}`;
}
