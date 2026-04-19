import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import clientPromise from '@app/ins/mongo-client';

import { UsersAdminView } from './components/users-admin-view';
import { DbRole, DbUser } from './types/users-page.types';

import type { Metadata } from 'next';

function formatDate(value?: Date): string {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(value);
}

export default async function Page() {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [users, roles] = await Promise.all([
    db
      .collection<DbUser>(DbTables.users)
      .find({})
      .sort({ createdAt: -1 })
      .toArray(),
    db
      .collection<DbRole>(DbTables.roles)
      .find({})
      .project({ name: 1, isActive: 1 })
      .toArray(),
  ]);

  const roleMap = new Map(
    roles.map((role) => [role._id.toString(), role.name]),
  );

  const rows = users.map((user, index) => ({
    id: user._id.toString(),
    name: `Mock: User ${index + 1}`,
    email: user.email,
    emailVerified: user.emailVerified ?? false,
    roles:
      user.roles?.map(
        (roleId) => roleMap.get(roleId.toString()) ?? roleId.toString(),
      ) ?? [],
    roleIds: user.roles?.map((roleId) => roleId.toString()) ?? [],
    isActive: user.isActive ?? false,
    createdAt: formatDate(
      user.createdAt ? new Date(user.createdAt) : undefined,
    ),
  }));

  const roleOptions = roles
    .filter((role) => role.isActive !== false)
    .map((role) => ({ id: role._id.toString(), name: role.name }));

  return <UsersAdminView users={rows} roleOptions={roleOptions} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adminpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('users.title'), siteTitle),
  };
}
