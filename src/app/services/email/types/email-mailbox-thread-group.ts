import type { EmailMailboxSummary } from './email-mailbox-summary';
import type { EmailThreadSummary } from './email-thread-summary';

/** Mailbox with its loaded threads and unread state for the current user. */
export type EmailMailboxThreadGroup = {
  /** Mailbox summary. */
  mailbox: EmailMailboxSummary;
  /** Threads loaded for the mailbox. */
  threads: EmailThreadSummary[];
  /** Number of threads with at least one message unread by the current user. */
  unreadThreadsCount: number;
};
