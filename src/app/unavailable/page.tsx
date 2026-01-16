import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import React from 'react';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import styles from './page.module.scss';

import type { Metadata } from 'next';

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

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('unavailable'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
