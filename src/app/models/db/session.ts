import { ObjectId } from 'mongodb';

import { DB } from './db';

export interface Session extends DB {
  userID: ObjectId;
  token: string;
  createdAt: Date;
}
