/** Contact data displayed in the admin email contact manager. */
export interface EmailContactSummary {
  /** MongoDB contact identifier. */
  id: string;

  /** Optional contact display name. */
  name?: string;

  /** Contact email address. */
  address: string;
}
