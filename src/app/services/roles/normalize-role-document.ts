import { ObjectId } from 'mongodb';

export type RawRoleDocument = {
  _id: ObjectId;
  name: string;
  description?: string;
  permissions?: ObjectId[];
  inherits?: ObjectId[];
  isActive?: boolean;
  createdAt?: Date | string;
  createdBy?: ObjectId | string;
};

export type NormalizedRole = {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  inheritsFrom: string[];
  resolvedPermissions?: string[];
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
};

export function normalizeRoleDocument(role: RawRoleDocument): NormalizedRole {
  return {
    _id: role._id.toString(),
    name: role.name,
    description: role.description ?? '',
    permissions: (role.permissions ?? []).map((id) => id.toString()),
    inheritsFrom: (role.inherits ?? []).map((id) => id.toString()),
    isActive: role.isActive ?? false,
    createdAt:
      typeof role.createdAt === 'string'
        ? role.createdAt
        : role.createdAt?.toISOString(),
    createdBy:
      typeof role.createdBy === 'string'
        ? role.createdBy
        : role.createdBy?.toString(),
  };
}
