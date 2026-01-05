import { useTranslations } from 'next-intl';
import React from 'react';

import styles from './page.module.scss';

export default function UnavailablePage() {
  const t = useTranslations('unavailable');

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>{t('title')}</h1>
        <p className={styles.paragraph}>{t('description')}</p>
      </div>
    </div>
  );
}
