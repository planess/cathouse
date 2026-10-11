import type { ActiveSession } from './active-session';

/** Props of the active sessions section. */
export interface SessionsSectionProps {
  /** Sessions of the current user, newest first. */
  sessions: ActiveSession[];
}
