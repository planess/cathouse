import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import RegistryMapTracker from './registry-map-tracker';

export default async function List() {
  const user = await getCurrentUser();

  const isVolunteer =
    user?.id !== null && user?.id !== undefined
      ? await hasPermission(
          SYSTEM_PERMISSIONS.HISTORY_CREATE,
          undefined,
          user.id,
        )
      : false;

  return <RegistryMapTracker isVolunteer={isVolunteer} />;
}
