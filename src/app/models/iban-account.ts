/** Bank account of the foundation that accepts donations by IBAN transfer. */
export interface IbanAccount {
  /** Account currency code, for example `UAH`. */
  currency: string;
  /** Recipient registry code (EDRPOU). */
  edrpou: string;
  /** Bank code (MFO). */
  mfo: string;
  /** Account number in IBAN format. */
  iban: string;
  /** Name of the bank holding the account. */
  bank: string;
  /** Legal name of the payment recipient. */
  recipient: string;
}
