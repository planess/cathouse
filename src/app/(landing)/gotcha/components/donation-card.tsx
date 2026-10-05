'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ArrowRightIcon } from '@app/components/icons/arrow-right-icon';
import { buildBankPaymentUrl } from '@app/helpers/build-bank-payment-url';
import { ibanAccounts } from '@app/services/iban-accounts';

import styles from '../../landing.module.css';

/** Selectable one-time donation amounts. */
const amounts = [200, 500, 1000] as const;

/** Donation panel where visitors pick a gift amount and open a prefilled bank transfer on bank.gov.ua. */
export function DonationCard() {
  const t = useTranslations('gotchapage');
  const tPayments = useTranslations('paymentspage');
  const [amount, setAmount] = useState<number>(amounts[1]);
  const currency = t('donation.currency');
  const paymentHref = buildBankPaymentUrl(
    ibanAccounts[0],
    amount,
    tPayments('financial.ibanNote'),
  );

  return (
    <div className={styles.givePanel}>
      <h3>{t('closing.supportAction')}</h3>
      <p>{t('donation.cardText')}</p>

      <div className={styles.amounts}>
        {amounts.map((value) => (
          <button
            key={value}
            aria-pressed={amount === value}
            className={`${styles.amount} ${amount === value ? styles.selected : ''}`}
            type="button"
            onClick={() => setAmount(value)}
          >
            {currency}
            {value}
          </button>
        ))}
      </div>

      <a
        className={`${styles.primary} ${styles.giveSubmit}`}
        href={paymentHref}
        rel="noopener noreferrer"
        target="_blank"
      >
        {t('donation.action', { amount: `${currency}${amount}` })}
        <ArrowRightIcon height={16} width={16} />
      </a>

      <div className={styles.giveFoot}>{t('donation.note')}</div>
    </div>
  );
}
