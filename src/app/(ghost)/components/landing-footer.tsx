import Link from 'next/link';
import { useTranslations } from 'next-intl';

import styles from '../landing.module.css';

import { LandingAnchorLink } from './landing-anchor-link';


/** Dark footer with the foundation tagline, contact link, and back-to-top anchor. */
export function LandingFooter() {
  const t = useTranslations('gotchapage');

  return (
    <footer className={styles.footer}>
      <div className={`${styles.shell} ${styles.footerInner}`}>
        <p>
          {t('brand.name')} · {t('closing.title')}
        </p>
        <div className={styles.footerLinks}>
          <Link href="/contacts">{t('closing.contactAction')}</Link>
          <LandingAnchorLink href="#top">{t('footer.top')}</LandingAnchorLink>
        </div>
      </div>
    </footer>
  );
}
