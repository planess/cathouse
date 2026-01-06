import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

export async function createHistoryGranted() {
  return hasPermission(SYSTEM_PERMISSIONS.HISTORY_CREATE);
}
