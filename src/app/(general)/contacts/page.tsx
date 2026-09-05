import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { GeneralContactsPageIcon01 } from '@app/components/icons/general-contacts-page-icon-01';
import { InstagramIcon } from '@app/components/icons/registry-animal-i-ns-ta-gr-am-ic-on';
import { PhoneIcon } from '@app/components/icons/registry-animal-p-ho-ne-ic-on';
import { TelegramIcon } from '@app/components/icons/registry-animal-t-el-eg-ra-mi-co-n';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import ContactFormWrapper from './components/contact-form-wrapper/contact-form-wrapper';
import Map from './components/map/map';
import Section from './components/section/section';

import type { Metadata } from 'next';

export default function Contacts() {
  const t = useTranslations('contactspage');

  return (
    <div className="px-6 py-7">
      <div className="flex flex-col lg:flex-row gap-y-6">
        <div className="flex-1/2 flex flex-col gap-6 grow-0 shrink-0 lg:pr-6">
          <div>
            <h1 className="text-3xl font-bold mb-4 dark:text-stone-50 transition-colors">
              {t('title')}
            </h1>

            <div className="text-zinc-800 dark:text-stone-50 transition-colors">
              {t('aboutus')}
            </div>
          </div>

          <Section title={t('section1_title')}>
            <div className="flex flex-col gap-3 items-start">
              <a
                className="flex gap-2 items-center"
                href="mailto: info@perilines.com.ua"
                target="_blank"
              >
                <span className="text-sky-300">
                  <GeneralContactsPageIcon01
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 32 32"
                    role="img"
                    aria-label={t('links.emailAria')}
                    fill="currentcolor"
                    stroke="#fcfcfc"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </span>
                <span>info@perilines.com.ua</span>
              </a>

              <a
                className="flex gap-2 items-center"
                href="tel: +380973959022"
                target="_blank"
              >
                <span className="text-sky-300 basis-5">
                  <PhoneIcon />
                </span>
                <span>+38(097) 39 59 022</span>
              </a>

              <div className="flex gap-4">
                <a
                  href="https://t.me/periphery_foundation"
                  target="_blank"
                  className="flex flex-none gap-2 align-center text-sky-300 size-6"
                >
                  <TelegramIcon />
                </a>

                <a
                  href="https://instagram.com/periphery.foundation"
                  target="_blank"
                  className="flex flex-none gap-2 align-center text-sky-300 size-6"
                >
                  <InstagramIcon />
                </a>
              </div>
            </div>
          </Section>

          <Section title={t('section2_title')}>
            <div className="mb-3">{t('section2_intro')}</div>

            <div>
              <ContactFormWrapper />
            </div>
          </Section>
        </div>

        <div className="flex-1/2 grow-0 shrink-0 lg:pl-6">
          <h3 className="text-2xl font-bold mb-5">{t('map_title')}</h3>

          <div className="flex flex-col gap-3 mb-4">
            <p>{t('map1')}</p>
            <p>{t('map2')}</p>
          </div>

          <Map />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('contactspage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
