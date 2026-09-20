/** Mailbox data exposed to the admin email interface. */
export type EmailMailboxSummary = {
  /** MongoDB mailbox identifier. */
  id: string;
  /** Full mailbox email address. */
  address: string;
  /** Lowercase address used for comparisons. */
  normalizedAddress: string;
  /** Sender name shown to recipients. */
  displayName: string;
  /** Position in the mailbox list. */
  order: number;
  /** ISO date when the mailbox was created. */
  createdAt: string;
  /** ISO date when the mailbox was last updated. */
  updatedAt: string;
};
