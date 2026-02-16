import { ObjectId } from 'mongodb';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

export async function editHistoryGranted(authorId: ObjectId) {
  if (await hasPermission(SYSTEM_PERMISSIONS.HISTORY_UPDATE_ANY)) {
    return true;
  } else if (await hasPermission(SYSTEM_PERMISSIONS.HISTORY_CREATE)) {
    const user = await getCurrentUser();

    return user !== null && authorId.equals(user.id);
  }

  return false;
}
