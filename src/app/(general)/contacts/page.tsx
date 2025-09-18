import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import ContactFormWrapper from './components/contact-form-wrapper/contact-form-wrapper';
import Map from './components/map/map';
import Section from './components/section/section';

export default function Contacts() {
  const t = useTranslations('contactspage');

  return (
    <div className="px-6 py-7">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1/2 flex flex-col gap-6 grow-0 shrink-0 pr-6">
          <div>
            <h1 className="text-3xl font-bold title mb-4">{t('title')}</h1>

            <div className="text-zinc-800">{t('aboutus')}</div>
          </div>

          <Section title={t('section1_title')}>
            <div className="flex flex-col gap-3 items-start">
              <a
                className="flex gap-2 items-center"
                href="mailto: info@perilines.com.ua"
                target="_blank"
              >
                <span className="text-sky-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 32 32"
                    role="img"
                    aria-label="Email"
                    fill="currentcolor"
                    stroke="#fcfcfc"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="7" width="24" height="18" rx="3" ry="3" />
                    <path d="M6 9l10 8 10-8" />
                  </svg>
                </span>
                <span>info@perilines.com.ua</span>
              </a>

              <a
                className="flex gap-2 items-center"
                href="tel: +380973959022"
                target="_blank"
              >
                <span className="text-sky-300 basis-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 32 32"
                    role="img"
                    aria-label="Phone"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22.8 20.8c-1.2 1.2-2.3 1.7-3.5 1.6-1.9-.2-4.3-1.9-7.1-4.6s-4.4-5.2-4.6-7.1c-.1-1.2.4-2.3 1.6-3.5l1.2-1.2c.6-.6 1.5-.6 2.1 0l2.1 2.1c.6.6.6 1.5 0 2.1l-1 .9c-.4.4-.5 1-.2 1.6.6 1.2 1.7 2.7 3.1 4.1 1.4 1.4 2.9 2.5 4.1 3.1.6.3 1.2.2 1.6-.2l.9-1c.6-.6 1.5-.6 2.1 0l2.1 2.1c.6.6.6 1.5 0 2.1l-1.2 1.2Z" />
                  </svg>
                </span>
                <span>+38(097) 39 59 022</span>
              </a>

              <div className="flex gap-4">
                <a
                  href="https://t.me/perimeter_fund"
                  target="_blank"
                  className="flex flex-none gap-2 align-center text-sky-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    role="img"
                    aria-label="Telegram"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M27.6 6.5 4.2 14.9c-.8.3-.7 1.4.1 1.7l6.5 2.2 2.6 6.7c.3.8 1.4.9 1.7.1l3.1-6.2 6.7-12.9c.4-.8-.4-1.7-1.3-1.3Z" />
                    <path d="M10.8 18.8 22.7 9.7" />
                  </svg>
                </a>

                <a
                  href="https://instagram.com/perimeter.fund"
                  target="_blank"
                  className="flex flex-none gap-2 align-center text-sky-300"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12,2.2c-2.7,0-3.1,0-4.2,0.1c-1.1,0-1.8,0.2-2.4,0.4c-0.6,0.2-1.1,0.5-1.6,1C3.3,4.2,3,4.7,2.7,5.3C2.5,5.9,2.3,6.6,2.3,7.8c-0.1,1.1-0.1,1.5-0.1,4.2s0,3.1,0.1,4.2c0,1.1,0.2,1.8,0.4,2.4c0.2,0.6,0.5,1.1,1,1.6c0.5,0.5,1,0.8,1.6,1c0.6,0.2,1.3,0.4,2.4,0.4c1.1,0.1,1.5,0.1,4.2,0.1s3.1,0,4.2-0.1c1.1,0,1.8-0.2,2.4-0.4c0.6-0.2,1.1-0.5,1.6-1c0.5-0.5,0.8-1,1-1.6c0.2-0.6,0.4-1.3,0.4-2.4c0.1-1.1,0.1-1.5,0.1-4.2s0-3.1-0.1-4.2c0-1.1-0.2-1.8-0.4-2.4c-0.2-0.6-0.5-1.1-1-1.6c-0.5-0.5-1-0.8-1.6-1C18.6,2.5,17.9,2.3,16.8,2.3C15.7,2.2,15.3,2.2,12,2.2z M12,4.4c2.6,0,3,0,4.1,0.1c0.9,0,1.4,0.2,1.7,0.3c0.4,0.1,0.6,0.3,0.9,0.5c0.3,0.3,0.4,0.5,0.5,0.9c0.1,0.3,0.3,0.8,0.3,1.7c0.1,1,0.1,1.4,0.1,4.1s0,3-0.1,4.1c0,0.9-0.2,1.4-0.3,1.7c-0.1,0.4-0.3,0.6-0.5,0.9c-0.3,0.3-0.5,0.4-0.9,0.5c-0.3,0.1-0.8,0.3-1.7,0.3c-1,0.1-1.4,0.1-4.1,0.1s-3,0-4.1-0.1c-0.9,0-1.4-0.2-1.7-0.3c-0.4-0.1-0.6-0.3-0.9-0.5c-0.3-0.3-0.4-0.5-0.5-0.9c-0.1-0.3-0.3-0.8-0.3-1.7c-0.1-1-0.1-1.4-0.1-4.1s0-3,0.1-4.1c0-0.9,0.2,1.4,0.3,1.7c0.1-0.4,0.3-0.6,0.5-0.9c0.3-0.3,0.5-0.4,0.9-0.5c0.3-0.1,0.8-0.3,1.7-0.3C9,4.4,9.4,4.4,12,4.4z M12,7.2c-2.6,0-4.8,2.1-4.8,4.8s2.1,4.8,4.8,4.8s4.8-2.1,4.8-4.8S14.6,7.2,12,7.2z M12,14.6c-1.4,0-2.6-1.2-2.6-2.6s1.2-2.6,2.6-2.6s2.6,1.2,2.6,2.6S13.4,14.6,12,14.6z M16.6,6.2c-0.7,0-1.2,0.5-1.2,1.2s0.5,1.2,1.2,1.2s1.2-0.5,1.2-1.2S17.3,6.2,16.6,6.2z" />
                  </svg>
                </a>
              </div>
            </div>
          </Section>

          <Section title={t('section2_title')}>
            <div className="mb-3">
              Пишіть свої думки а ми постараємось врахувати їх у нашій роботі.
            </div>

            <div>
              <ContactFormWrapper />
            </div>
          </Section>
        </div>

        <div className="flex-1/2 grow-0 shrink-0 md:pl-6">
          <h3 className="text-2xl font-bold mb-5">Зона діяльності</h3>

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

export async function generateMetadata() {
  const t = await getTranslations('contactspage');

  return {
    title: `${t('title')} | Perimeter`,
  };
}
