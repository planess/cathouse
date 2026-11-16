/** Per-thread counters aggregated across all messages of the thread. */
export type ThreadMessageStats = {
  /** Number of unique attachments referenced by the thread messages. */
  attachmentsCount: number;
  /** Number of messages received by the mailbox. */
  incomingCount: number;
  /** Number of messages sent from the mailbox. */
  outgoingCount: number;
};
