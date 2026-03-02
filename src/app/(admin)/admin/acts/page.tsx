import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import clientPromise from '@app/ins/mongo-client';
import type { MediaAsset } from '@app/models/media-asset';

import { ActsAdminView } from './components/acts-admin-view';
import { ActRow, VolunteerGroup } from './types/acts-admin-view.types';
import { DbVolunteer } from './types/acts-page.types';

function formatDateTime(value?: Date): string {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

type IdLike = {
  toString(): string;
};

type VolunteerActCategoryRow = {
  _id: IdLike;
  name: string;
};

type AnimalNameRow = {
  _id: IdLike;
  name: string;
};

type EquipmentEntry = {
  itemId: IdLike;
  conditionBefore: import('../inventory/types/inventory-db.types').InventoryItemCondition;
  conditionAfter: import('../inventory/types/inventory-db.types').InventoryItemCondition;
  notes?: string;
  media?: MediaAsset[];
};

type VolunteerActRow = {
  _id: IdLike;
  volunteerId: IdLike;
  types: IdLike;
  status: 'scheduled' | 'pending' | 'approved' | 'rejected';
  animalId?: IdLike[];
  notes?: string;
  managedBy?: IdLike;
  managedAt?: Date;
  equipments?: EquipmentEntry[];
  documents?: MediaAsset[];
  sessionStart: Date;
  sessionEnd: Date;
  createdAt: Date;
};

type InventoryNameRow = {
  name: string;
};

export default async function Page() {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [rawActs, rawUsers, rawCategories, rawAnimals] = await Promise.all([
    db
      .collection<VolunteerActRow>(DbTables.volunteerActs)
      .find({})
      .sort({ sessionStart: -1 })
      .toArray(),
    db
      .collection<DbVolunteer>(DbTables.users)
      .find({})
      .project<Pick<DbVolunteer, '_id' | 'email'>>({ email: 1 })
      .toArray(),
    db
      .collection<VolunteerActCategoryRow>(DbTables.volunteerCategories)
      .find({})
      .project<Pick<VolunteerActCategoryRow, '_id' | 'name'>>({ name: 1 })
      .toArray(),
    db
      .collection<AnimalNameRow>(DbTables.animals)
      .find({})
      .project<Pick<AnimalNameRow, '_id' | 'name'>>({ name: 1 })
      .toArray(),
  ]);

  const acts: VolunteerActRow[] = rawActs;
  const users: Pick<DbVolunteer, '_id' | 'email'>[] = rawUsers;
  const categories: Pick<VolunteerActCategoryRow, '_id' | 'name'>[] =
    rawCategories;
  const animals: Pick<AnimalNameRow, '_id' | 'name'>[] = rawAnimals;

  const userMap = new Map(users.map((u) => [u._id.toString(), u.email]));

  const typeMap = new Map(
    categories.map((category) => [category._id.toString(), category.name]),
  );

  const animalMap = new Map(
    animals.map((animal) => [animal._id.toString(), animal.name]),
  );

  // Collect all unique equipment item IDs referenced in acts
  const equipmentIds = [
    ...new Set(
      acts.flatMap((a) => a.equipments ?? []).map((e) => e.itemId.toString()),
    ),
  ];

  const equipmentMap = new Map<string, string>();

  if (equipmentIds.length > 0) {
    const { ObjectId } = await import('mongodb');
    const items = await db
      .collection<InventoryNameRow>(DbTables.reportsInventory)
      .find(
        { _id: { $in: equipmentIds.map((id) => new ObjectId(id)) as never[] } },
        { projection: { name: 1 } },
      )
      .toArray();

    for (const item of items) {
      equipmentMap.set(item._id.toString(), item.name);
    }
  }

  const rows: ActRow[] = acts.map((act) => ({
    id: act._id.toString(),
    volunteerId: act.volunteerId.toString(),
    volunteerEmail: userMap.get(act.volunteerId.toString()) ?? 'Unknown',
    typeId: act.types.toString(),
    typeName: typeMap.get(act.types.toString()) ?? 'Unknown type',
    status: act.status,
    notes: act.notes ?? '',
    animals: (act.animalId ?? []).map(
      (id) => animalMap.get(id.toString()) ?? 'Unknown animal',
    ),
    documents: act.documents ?? [],
    equipments: (act.equipments ?? []).map((e) => ({
      itemId: e.itemId.toString(),
      itemName: equipmentMap.get(e.itemId.toString()) ?? 'Unknown item',
      conditionBefore: e.conditionBefore,
      conditionAfter: e.conditionAfter,
      notes: e.notes ?? '',
      media: e.media ?? [],
    })),
    sessionStart: formatDateTime(new Date(act.sessionStart)),
    sessionEnd: formatDateTime(new Date(act.sessionEnd)),
    managedByEmail: act.managedBy
      ? (userMap.get(act.managedBy.toString()) ?? 'Unknown')
      : 'N/A',
    managedAt: formatDateTime(
      act.managedAt ? new Date(act.managedAt) : undefined,
    ),
    createdAt: formatDateTime(new Date(act.createdAt)),
  }));

  const groupMap = new Map<string, ActRow[]>();

  for (const row of rows) {
    const existing = groupMap.get(row.volunteerId) ?? [];
    existing.push(row);
    groupMap.set(row.volunteerId, existing);
  }

  const groups: VolunteerGroup[] = [...groupMap.entries()].map(
    ([volunteerId, volunteerActs]) => ({
      volunteerId,
      volunteerEmail: volunteerActs[0].volunteerEmail,
      acts: volunteerActs,
    }),
  );

  return <ActsAdminView groups={groups} />;
}

export async function generateMetadata(): Promise<import('next').Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adminpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('acts.title'), siteTitle),
  };
}
