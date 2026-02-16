import Image from 'next/image';
import { useTranslations } from 'next-intl';

import feedForCatImg from '@public/assets/help/delicates_transparent.png';
import catAtHomeImg from '@public/assets/help/home-comfort.png';
import medicineImg from '@public/assets/help/medicine_transparent.png';
import educationImg from '@public/assets/help/teach-me_transparent.png';

import Section from '../../../contacts/components/section/section';

const BENEFITS = [
  { key: 'medical', image: medicineImg },
  { key: 'adoption', image: catAtHomeImg },
  { key: 'volunteers', image: feedForCatImg },
  { key: 'education', image: educationImg },
] as const;

const PARAGRAPHS = ['intro1', 'intro2'] as const;

export default function ProvideHelp() {
  const t = useTranslations('helppage.provide');

  return (
    <Section title={t('title')}>
      {PARAGRAPHS.map((paragraph) => (
        <p key={paragraph} className="py-1">
          {t(`paragraphs.${paragraph}`)}
        </p>
      ))}

      <p className="py-5 text-xl">{t('paragraphs.cta')}</p>

      <div className="flex flex-col gap-4">
        {BENEFITS.map(({ key, image }) => (
          <div key={key} className="flex items-center gap-3">
            <div className="flex-none">
              <Image src={image} alt={t(`benefits.${key}.alt`)} width={100} />
            </div>

            <div>
              <div className="font-bold">{t(`benefits.${key}.title`)}</div>
              <div>{t(`benefits.${key}.description`)}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
