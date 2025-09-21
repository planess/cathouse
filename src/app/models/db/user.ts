import { ObjectId } from 'mongodb';

import { DB } from './db';

export interface User extends DB {
  email: string;
  emailVerified: boolean;
  password: string;
  roles: ObjectId[]; // Array of role IDs
  isActive: boolean;
  createdAt: Date;
}
