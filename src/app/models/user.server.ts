export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
  metadata?: Record<string, any>;
}

export interface UserWithRoles extends User {
  roles: string[]; // Role IDs
  effectivePermissions: string[]; // Computed permissions from all roles
}
