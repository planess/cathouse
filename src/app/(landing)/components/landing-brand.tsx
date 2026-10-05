import { useTranslations } from 'next-intl';

import { HeartHandshakeIcon } from '@app/components/icons/heart-handshake-icon';

import styles from '../landing.module.css';

/** Foundation logo mark with its name and tagline, linking to the top of the page. */
export function LandingBrand() {
  const t = useTranslations('gotchapage.brand');

  return (
    <a aria-label={t('name')} className={styles.brand} href="#top">
      <span className={styles.brandMark}>
        <HeartHandshakeIcon height={20} width={20} />
      </span>
      <span className={styles.brandName}>
        {t('name')}
        <span>{t('tagline')}</span>
      </span>
    </a>
  );
}
