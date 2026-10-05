import { toBase64URL } from '@helpers/to-base64-url';

import type { IbanAccount } from '@app/models/iban-account';

/** Base address of the National Bank of Ukraine payment QR service. */
const paymentUrl = 'https://bank.gov.ua/qr/';

/**
 * Builds a `bank.gov.ua` link that opens a prefilled credit transfer in the payer's bank app.
 *
 * @param account - Foundation account that receives the transfer.
 * @param amount - Transfer amount in hryvnias.
 * @param purpose - Payment purpose shown to the payer.
 * @returns Absolute payment URL.
 */
export function buildBankPaymentUrl(
  account: IbanAccount,
  amount: number,
  purpose: string,
): string {
  const data = [
    'BCD',
    '002',
    '1',
    'UCT',
    '',
    account.recipient,
    account.iban.replaceAll(/\s+/g, '').trim(),
    `UAH${amount.toFixed(2)}`,
    account.edrpou,
    '',
    '',
    purpose,
    '',
    '',
  ].join('\n');

  return paymentUrl + toBase64URL(data);
}
