import { getTranslations } from 'next-intl/server';

import { ActsPageView } from '@app/(general)/acts/components/acts-page-view';
import type {
  AnimalOption,
  EquipmentOption,
  VolunteerActDocument,
  VolunteerActRow,
  VolunteerCategoryOption,
} from '@app/(general)/acts/types/acts-page.types';
import { DbTables } from '@app/enum/db-tables';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import {
  hasPermission,
  requirePermission,
} from '@app/services/access-verification.service';

import { formatDateTime, toDateTimeLocalValue } from './helpers/date-time';

export default async function ActsPage() {
  await requirePermission(SYSTEM_PERMISSIONS.ACT_READ);

  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return null;
  }

  const [canCreate, canUpdate, canDelete] = await Promise.all([
    hasPermission(SYSTEM_PERMISSIONS.ACT_CREATE),
    hasPermission(SYSTEM_PERMISSIONS.ACT_UPDATE),
    hasPermission(SYSTEM_PERMISSIONS.ACT_DELETE),
  ]);

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [actsRaw, categoriesRaw, animalsRaw, equipmentsRaw] = await Promise.all(
    [
      db
        .collection<VolunteerActDocument>(DbTables.volunteerActs)
        .find({ volunteerId: currentUser.id })
        .sort({ sessionStart: -1 })
        .toArray(),
      db
        .collection(DbTables.volunteerCategories)
        .find({}, { projection: { name: 1 } })
        .toArray(),
      db
        .collection(DbTables.animals)
        .find(
          {
            $or: [
              { draft: { $ne: true } },
              { createdBy: { $eq: currentUser.id } },
            ],
          },
          { projection: { name: 1 } },
        )
        .toArray(),
      db
        .collection(DbTables.reportsInventory)
        .find({}, { projection: { name: 1 } })
        .sort({ name: 1 })
        .toArray(),
    ],
  );

  const categories: VolunteerCategoryOption[] = categoriesRaw.map(
    (category) => ({
      id: category._id.toString(),
      name: String(category.name ?? 'Unknown category'),
    }),
  );

  const animals: AnimalOption[] = animalsRaw.map((animal) => ({
    id: animal._id.toString(),
    name: String(animal.name ?? 'Unnamed'),
  }));

  const equipmentOptions: EquipmentOption[] = equipmentsRaw.map(
    (equipment) => ({
      id: equipment._id.toString(),
      name: String(equipment.name ?? 'Unnamed equipment'),
    }),
  );

  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const animalMap = new Map(animals.map((animal) => [animal.id, animal.name]));

  const acts: VolunteerActRow[] = actsRaw.map((act) => {
    const animalIds = (act.animalId ?? []).map((animalId) =>
      animalId.toString(),
    );

    return {
      id: act._id.toString(),
      typeId: act.types.toString(),
      typeName: categoryMap.get(act.types.toString()) ?? 'Unknown type',
      status: act.status,
      animalIds,
      animalNames: animalIds.map((id) => animalMap.get(id) ?? 'Unknown animal'),
      notes: act.notes ?? '',
      sessionStart: toDateTimeLocalValue(new Date(act.sessionStart)),
      sessionEnd: toDateTimeLocalValue(new Date(act.sessionEnd)),
      createdAt: formatDateTime(new Date(act.createdAt)),
      equipments: (act.equipments ?? []).map((equipment) => ({
        itemId: equipment.itemId.toString(),
        conditionBefore: equipment.conditionBefore,
        conditionAfter: equipment.conditionAfter,
        notes: equipment.notes ?? '',
        media: equipment.media ?? [],
      })),
      documentsCount: (act.documents ?? []).length,
    };
  });

  return (
    <ActsPageView
      acts={acts}
      categories={categories}
      animals={animals}
      equipmentOptions={equipmentOptions}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  );
}

export async function generateMetadata(): Promise<import('next').Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('header'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('acts'), siteTitle),
  };
}
