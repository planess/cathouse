/** Encrypted data sent to the change password action. */
export interface ChangePasswordPayload {
  /** New password encrypted with the public key. */
  passHash: string;
  /** Repeated new password encrypted with the public key. */
  confirmationHash: string;
}
