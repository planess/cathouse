import { ObjectId } from 'mongodb';

export interface EmailReadState {
  _id: ObjectId;

  messageId: ObjectId;
  userId: ObjectId;

  /**
   * The first time the user opened the email.
   */
  firstReadAt?: Date;

  /**
   * The most recent time the user opened the email.
   */
  lastReadAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
