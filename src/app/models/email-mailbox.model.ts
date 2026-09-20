import { ObjectId } from 'mongodb';

/** Persisted organization-owned email mailbox. */
export interface EmailMailbox {
  /** MongoDB mailbox identifier. */
  _id: ObjectId;

  /**
   * Full email address:
   * support@example.org
   */
  address: string;

  /**
   * Normalized address for search and uniqueness.
   * Always lowercase.
   */
  normalizedAddress: string;

  /**
   * Name displayed to the recipient.
   * For example: "Charity Fund Periphery"
   */
  displayName?: string;

  /** Position of the mailbox in the user-defined mailbox list. */
  order: number;

  /** Date when the mailbox was created. */
  createdAt: Date;

  /** Date when the mailbox was last updated. */
  updatedAt: Date;
}
