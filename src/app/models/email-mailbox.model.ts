import { ObjectId } from 'mongodb';

export interface EmailMailbox {
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

  createdAt: Date;
  updatedAt: Date;
}
