import { ObjectId } from 'mongodb';

import { DB } from './db';

export interface User extends DB {
  email: string;
  emailVerified: boolean;
  emailVerificationCode?: string; // pending email verification code
  emailVerificationSentAt?: Date; // when the last verification letter was sent
  password: string;
  roles: ObjectId[]; // Array of role IDs
  isActive: boolean;
  createdAt: Date;
}
