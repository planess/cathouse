import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import homeComfortImage from '@public/assets/help/home-comfort.png';

import { CheckIcon } from '@app/components/icons/check-icon';
import { HeartIcon } from '@app/components/icons/heart-icon';
import { HomeCareIcon } from '@app/components/icons/registry-animal-h-om-ec-ar-ei-co-n';
import { PetsIcon } from '@app/components/icons/registry-animal-p-et-si-co-n';
import { ShieldCheckIcon } from '@app/components/icons/shield-check-icon';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import styles from '../landing.module.css';

import { DonationCard } from './components/donation-card';

import type { Metadata } from 'next';

const actionKeys = ['report', 'help', 'meet'] as const;
const careKeys = ['response', 'treatment', 'home'] as const;

const actionHrefs = {
  report: '/contacts',
  help: '/help',
  meet: '/volunteers',
} as const;

const actionIcons = {
  report: PetsIcon,
  help: HeartIcon,
  meet: HomeCareIcon,
} as const;

/** Presents the foundation to first-time visitors arriving from a volunteer QR code. */
export default function GotchaPage() {
  const t = useTranslations('gotchapage');
  const titleWords = t('hero.title').split(' ');
  const titleAccent = titleWords.pop();

  return (
    <>
      <section className={styles.hero} id="top">
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              {t('title')}
            </div>
            <h1 className={styles.display}>
              {titleWords.join(' ')} <em>{titleAccent}</em>
            </h1>
            <p className={styles.heroCopy}>{t('hero.description')}</p>

            <p className={styles.trustRow}>
              <ShieldCheckIcon height={16} width={16} />
              {t('hero.note')}
            </p>
          </div>

          <div className={styles.visual}>
            <div className={styles.orbit} />
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span>{t('care.eyebrow')}</span>
                <span className={styles.cardStamp}>
                  <HeartIcon height={18} width={18} />
                </span>
              </div>
              <div className={styles.portrait}>
                <div className={styles.disc}>
                  <div className={styles.photo}>
                    <Image
                      alt={t('hero.imageAlt')}
                      fill
                      priority
                      sizes="160px"
                      src={homeComfortImage}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.cardCaption}>
                <div>
                  <strong className={styles.display}>
                    {t('hero.cardTitle')}
                  </strong>
                  <span>
                    {careKeys.map((key) => t(`care.items.${key}.title`)).join(' · ')}
                  </span>
                </div>
                <HeartIcon className={styles.heart} height={22} width={22} />
              </div>
            </div>

            <div className={`${styles.floatCard} ${styles.one}`}>
              <span className={styles.floatIcon}>
                <PetsIcon />
              </span>
              <div>
                <strong>{t('actions.items.report.title')}</strong>
                <span>{t('actions.items.report.link')}</span>
              </div>
            </div>
            <div className={`${styles.floatCard} ${styles.two}`}>
              <span className={styles.floatIcon}>
                <HomeCareIcon />
              </span>
              <div>
                <strong>{t('care.items.treatment.title')}</strong>
                <span>{t('care.items.home.title')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.help} id="help">
        <div className={styles.shell}>
          <div className={styles.helpHeading}>
            <h2>{t('actions.title')}</h2>
            <p>{t('actions.description')}</p>
          </div>
          <div className={styles.helpGrid}>
            {actionKeys.map((key) => {
              const Icon = actionIcons[key];

              return (
                <Link
                  key={key}
                  className={styles.helpCard}
                  href={actionHrefs[key]}
                >
                  <span className={styles.helpIcon}>
                    <Icon />
                  </span>
                  <span>
                    <strong>{t(`actions.items.${key}.title`)}</strong>
                    <span>{t(`actions.items.${key}.link`)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.give} id="give">
        <div className={`${styles.shell} ${styles.giveInner}`}>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              {t('closing.eyebrow')}
            </div>
            <h2 className={styles.display}>{t('closing.title')}</h2>
            <p className={styles.giveCopy}>{t('closing.description')}</p>
            <div className={styles.giveNote}>
              <CheckIcon height={16} width={16} />
              {t('donation.check')}
            </div>
          </div>

          <DonationCard />
        </div>
      </section>
    </>
  );
}

/** Builds localized metadata for the QR welcome page, which is reachable by direct link only and kept out of search engines. */
export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('gotchapage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
    description: t('description'),
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
  };
}
