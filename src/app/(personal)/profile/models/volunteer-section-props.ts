import type { ServerAuthState } from '@app/models/server-auth-state';

/** Props of the volunteer information section. */
export interface VolunteerSectionProps {
  /** Profile of a user who is a volunteer (`hiredOn` is set). */
  profile: NonNullable<ServerAuthState>['profile'] & { hiredOn: Date };
}
