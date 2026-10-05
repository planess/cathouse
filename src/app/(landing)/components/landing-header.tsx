import { useTranslations } from 'next-intl';

import { ArrowRightIcon } from '@app/components/icons/arrow-right-icon';

import styles from '../landing.module.css';

import { LandingAnchorLink } from './landing-anchor-link';
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
          <LandingAnchorLink href="#help">{t('nav.ways')}</LandingAnchorLink>
          <LandingAnchorLink href="#give">{t('nav.donate')}</LandingAnchorLink>
        </nav>

        <LandingAnchorLink className={styles.navCta} href="#give">
          {t('header.donate')}
          <ArrowRightIcon height={15} width={15} />
        </LandingAnchorLink>
      </header>
    </>
  );
}
