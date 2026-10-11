import type { ServerAuthState } from '@app/models/server-auth-state';

/** Props of the personal information section. */
export interface PersonalSectionProps {
  /** Authenticated user to display. */
  user: NonNullable<ServerAuthState>;
  /** ISO time when another verification letter can be sent, or `null` when it can be sent now. */
  verificationAvailableAt: string | null;
}
