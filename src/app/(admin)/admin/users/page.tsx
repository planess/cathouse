import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import clientPromise from '@app/ins/mongo-client';

import { UsersAdminView } from './components/users-admin-view';
import { DbProfile, DbRole, DbUser } from './types/users-page.types';

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

function toDate(value?: Date | string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toDateInput(value?: Date | string): string {
  const date = toDate(value);

  if (!date) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

export default async function Page() {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [users, roles, profiles] = await Promise.all([
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
    db.collection<DbProfile>(DbTables.profiles).find({}).toArray(),
  ]);

  const roleMap = new Map(
    roles.map((role) => [role._id.toString(), role.name]),
  );
  const profileMap = new Map(
    profiles.map((profile) => [profile._id.toString(), profile]),
  );

  const rows = users.map((user, index) => {
    const userId = user._id.toString();
    const profile = profileMap.get(userId);

    return {
      id: userId,
      name: `Mock: User ${index + 1}`,
      alias: profile?.alias ?? '',
      email: user.email,
      emailVerified: user.emailVerified ?? false,
      roles:
        user.roles?.map(
          (roleId) => roleMap.get(roleId.toString()) ?? roleId.toString(),
        ) ?? [],
      roleIds: user.roles?.map((roleId) => roleId.toString()) ?? [],
      about: profile?.about ?? '',
      badgeValidUntil: formatDate(toDate(profile?.badgeValidUntil)),
      badgeValidUntilInput: toDateInput(profile?.badgeValidUntil),
      hiredOn: formatDate(toDate(profile?.hiredOn)),
      hiredOnInput: toDateInput(profile?.hiredOn),
      isActive: user.isActive ?? false,
      createdAt: formatDate(
        user.createdAt ? new Date(user.createdAt) : undefined,
      ),
    };
  });

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
