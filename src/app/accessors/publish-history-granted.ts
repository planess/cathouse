import { ObjectId } from 'mongodb';

import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

export async function publishHistoryGranted(userId: ObjectId) {
  if (await hasPermission(SYSTEM_PERMISSIONS.HISTORY_PUBLISH_ANY)) {
    return true;
  } else if (await hasPermission(SYSTEM_PERMISSIONS.HISTORY_PUBLISH)) {
    const user = await getCurrentUser();

    return user !== null && userId.equals(user.id);
  }

  return false;
}
