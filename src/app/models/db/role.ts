import { ObjectId } from 'mongodb';

import { DB } from './db';

export interface Role extends DB {
  name: string;
  description: string;
  permissions: ObjectId[]; // Array of Permission IDs
  inherits: ObjectId[]; // Array of Role IDs this role inherits from
  isActive: boolean;
  createdBy: ObjectId; // User ID who created this role
  updatedAt: Date;
}
