import type { EmailMailboxThreadGroup } from '@app/services/email.service';

export type CreateMailboxResponse = {
  success: boolean;
  message: string;
  group?: EmailMailboxThreadGroup;
};
