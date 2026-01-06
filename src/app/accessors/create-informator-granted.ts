import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

export async function createInformatorGranted() {
  return hasPermission(SYSTEM_PERMISSIONS.INFORMATOR_CREATE);
}
