import type { IbanAccount } from '@app/models/iban-account';

/** Bank accounts of the foundation that accept donations; the first one is the default. */
export const ibanAccounts: IbanAccount[] = [
  {
    currency: 'UAH',
    edrpou: '45962629',
    mfo: '322001',
    iban: 'UA88 322001 00000 2600 2700 0084 46',
    bank: 'АТ "УНІВЕРСАЛ БАНК"',
    recipient: 'БО "БФ "Периферія"',
  },
  {
    currency: 'UAH',
    edrpou: '45962629',
    mfo: '307770',
    iban: 'UA63 307770 00000 2600 4111 2409 53',
    bank: 'АТ "А - Банк"',
    recipient: 'БО "БФ "Периферія"',
  },
];
