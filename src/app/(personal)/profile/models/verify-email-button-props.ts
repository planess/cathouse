/** Props of the email verification button. */
export interface VerifyEmailButtonProps {
  /** ISO time when another verification letter can be sent, or `null` when it can be sent now. */
  availableAt: string | null;
}
