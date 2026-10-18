import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';

import { hasPermission } from './access-verification.service';

/**
 * Resolves the user whose profile photo an administrator changes. The caller
 * needs the `ROLE_ASSIGN` permission that guards the admin area.
 *
 * @param id - Id of the user from the route.
 * @returns Id of an existing user, `'forbidden'` without the permission, or `null` when there is no such user.
 */
export async function findAdminPhotoTarget(
  id: string,
): Promise<ObjectId | 'forbidden' | null> {
  if (!(await hasPermission(SYSTEM_PERMISSIONS.ROLE_ASSIGN))) {
    return 'forbidden';
  }

  if (!ObjectId.isValid(id)) {
    return null;
  }

  const userId = new ObjectId(id);
  const dbClient = await clientPromise;
  const user = await dbClient
    .db()
    .collection(DbTables.users)
    .findOne({ _id: userId }, { projection: { _id: 1 } });

  return user ? userId : null;
}
