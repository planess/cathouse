import type { EmailMailboxSummary } from './email-mailbox-summary';
import type { EmailThreadSummary } from './email-thread-summary';

export type EmailMailboxThreadGroup = {
  mailbox: EmailMailboxSummary;
  threads: EmailThreadSummary[];
};
