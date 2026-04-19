import { ObjectId } from 'mongodb';

export type RoleDocument = {
  _id: ObjectId;
  name: string;
  description?: string;
  permissions?: ObjectId[];
  inherits?: ObjectId[];
  isActive?: boolean;
  createdAt?: Date | string;
};

export type PermissionDocument = {
  _id: ObjectId;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
};
