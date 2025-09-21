import { ObjectId } from 'mongodb';

import { DB } from './db';

export interface Permission extends DB {
  name: string;
  description: string;
  resource: string; // e.g., 'article', 'user'
  action: string; // e.g., 'create', 'read', 'update', 'delete'
  isActive: boolean;
  createdBy: ObjectId; // User ID who created this permission
  createdAt: Date;
}
