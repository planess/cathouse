import { ObjectId } from 'mongodb';

export type DbUser = {
  _id: ObjectId;
  email: string;
  emailVerified?: boolean;
  roles?: ObjectId[];
  isActive?: boolean;
  createdAt?: Date;
};

export type DbRole = {
  _id: ObjectId;
  name: string;
  isActive?: boolean;
};

export type DbProfile = {
  _id: ObjectId;
  alias?: string;
  about?: string;
  badgeValidUntil?: Date | string;
  hiredOn?: Date | string;
};
