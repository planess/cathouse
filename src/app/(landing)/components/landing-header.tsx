import { useTranslations } from 'next-intl';

import { ArrowRightIcon } from '@app/components/icons/arrow-right-icon';

import styles from '../landing.module.css';

import { LandingBrand } from './landing-brand';

/** Top banner and navigation bar with anchor links and a donation call to action. */
export function LandingHeader() {
  const t = useTranslations('gotchapage');

  return (
    <>
      <div className={styles.topline}>{t('hero.eyebrow')}</div>
      <header className={`${styles.shell} ${styles.nav}`}>
        <LandingBrand />

        <nav aria-label={t('nav.label')} className={styles.navLinks}>
          <a href="#help">{t('nav.ways')}</a>
          <a href="#give">{t('nav.donate')}</a>
        </nav>

        <a className={styles.navCta} href="#give">
          {t('header.donate')}
          <ArrowRightIcon height={15} width={15} />
        </a>
      </header>
    </>
  );
}
