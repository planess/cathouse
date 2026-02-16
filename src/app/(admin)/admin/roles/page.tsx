import { ObjectId } from 'mongodb';
import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import clientPromise from '@app/ins/mongo-client';

import { RolesAdminView } from './components/roles-admin-view';

import type { Metadata } from 'next';

type RoleDocument = {
  _id: ObjectId;
  name: string;
  description?: string;
  permissions?: ObjectId[];
  inherits?: ObjectId[];
  isActive?: boolean;
  createdAt?: Date | string;
};

type PermissionDocument = {
  _id: ObjectId;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
};

const normalizeRoleDocument = (role: RoleDocument) => {
  const createdAt =
    typeof role.createdAt === 'string'
      ? role.createdAt
      : role.createdAt?.toISOString();

  return {
    id: role._id.toString(),
    name: role.name,
    description: role.description ?? '',
    permissions: (role.permissions ?? []).map((id) => id.toString()),
    inheritsFrom: (role.inherits ?? []).map((id) => id.toString()),
    isActive: role.isActive ?? false,
    createdAt,
  };
};

const normalizePermissionDocument = (permission: PermissionDocument) => ({
  id: permission._id.toString(),
  name: permission.name,
  description: permission.description ?? '',
  resource: permission.resource ?? '',
  action: permission.action ?? '',
});

export default async function RolesPage() {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [roles, permissions] = await Promise.all([
    db.collection<RoleDocument>(DbTables.roles).find({}).toArray(),
    db.collection<PermissionDocument>(DbTables.permissions).find({}).toArray(),
  ]);

  const roleRows = roles
    .map(normalizeRoleDocument)
    .sort((a, b) => a.name.localeCompare(b.name));
  const permissionOptions = permissions
    .map(normalizePermissionDocument)
    .sort((a, b) => a.name.localeCompare(b.name));

  return <RolesAdminView roles={roleRows} permissions={permissionOptions} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adminpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('roles.title'), siteTitle),
  };
}
