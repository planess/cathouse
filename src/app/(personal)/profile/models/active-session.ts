/** Serializable view of a user's session for the profile sessions list. */
export interface ActiveSession {
  /** Session record identifier. */
  id: string;
  /** Session creation time as an ISO string. */
  createdAt: string;
  /** Whether this is the session of the current request. */
  isCurrent: boolean;
}
