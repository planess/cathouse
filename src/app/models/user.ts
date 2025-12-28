import { SystemPermission } from './system-permissions';

export interface User {
  id: string;
  email: string;
  scopes: SystemPermission[];
  createdAt?: Date;
  lastLogin?: Date;
}
