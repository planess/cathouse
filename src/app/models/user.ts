export interface User {
  id: string;
  email: string;
  name: string;
  scopes: string[];
  createdAt?: Date;
  lastLogin?: Date;
}
