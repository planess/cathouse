import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

export async function createClinicGranted() {
  return hasPermission(SYSTEM_PERMISSIONS.CLINIC_CREATE);
}
