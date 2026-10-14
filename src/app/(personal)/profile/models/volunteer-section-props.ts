import type { ServerAuthState } from '@app/models/server-auth-state';

/** Props of the volunteer information section. */
export interface VolunteerSectionProps {
  /** Profile of a user who is a volunteer (`hiredOn` is set). */
  profile: NonNullable<ServerAuthState>['profile'] & { hiredOn: Date };
  /** Identifier of the user in the `users` collection; used for the public page link. */
  userId: string;
}
