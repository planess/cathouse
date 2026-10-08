import type { ReactNode } from 'react';

import type { AuthAlertTone } from './auth-alert-tone';

/** Props of the alert shown inside a guest (auth) form card. */
export interface AuthAlertProps {
  /** Visual tone; errors are announced with `role="alert"`. */
  tone: AuthAlertTone;
  /** Alert content. */
  children: ReactNode;
}
