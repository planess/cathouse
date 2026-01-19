import { createHistoryGranted } from '@app/accessors/create-history-granted';
import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { AnimalDocument } from '@app/models/animal';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import Card from '../card/card';

import Pagination from './pagination';

const PAGE_SIZE = 10;

type ListProps = {
  page?: number;
};

export default async function List({ page = 1 }: ListProps) {
  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const user = await getCurrentUser();
  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection<AnimalDocument>(DbTables.animals);

  const totalItems = await animalsCollection.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const isVolunteer = await createHistoryGranted();
  const isModerator = await hasPermission(
    SYSTEM_PERMISSIONS.HISTORY_UPDATE_ANY,
  );

  const findCondition = {};

  if (isModerator) {
    // regular users cannot see draft animals
  } else if (isVolunteer) {
    // volunteers can see published and their own draft animals
    Object.assign(findCondition, {
      $or: [{ draft: { $ne: true } }, { createdBy: { $eq: user?.id } }],
    });
  } else {
    Object.assign(findCondition, { draft: { $ne: true } });
  }

  // find only non-draft animals for general users
  const animals = await animalsCollection
    .find(findCondition)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .toArray();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4">
        {animals.map((data) => (
          <div key={data._id?.toHexString() ?? data.name}>
            <Card data={data} />
          </div>
        ))}
      </div>

      {totalItems > PAGE_SIZE && (
        <Pagination safePage={safePage} totalPages={totalPages} />
      )}
    </div>
  );
}
