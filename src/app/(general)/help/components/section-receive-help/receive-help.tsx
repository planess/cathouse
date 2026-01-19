import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

import Section from '../../../contacts/components/section/section';
import ContactFormWrapper from '../contact-form-wrapper/contact-form-wrapper';

const AREAS = [
  { key: 'observation', paragraphKeys: ['p1', 'p2'] },
  { key: 'response', paragraphKeys: ['p1', 'p2', 'p3'] },
  { key: 'medical', paragraphKeys: ['p1', 'p2', 'p3'] },
  {
    key: 'it',
    paragraphKeys: ['p1'],
    rolesIntroKey: 'rolesIntro',
    roles: ['designers', 'analysts', 'developers', 'testers', 'devops'],
  },
  { key: 'care', paragraphKeys: ['p1', 'p2', 'p3', 'p4'] },
] as {key: string; paragraphKeys: string[]; rolesIntroKey?: string; roles?: string[]}[];

export default function ReceiveHelp() {
  const t = useTranslations('helppage.receive');

  return (
    <Section title={t('title')}>
      <p className="py-1">{t('intro')}</p>

      <div className="py-1">
        <p className="py-5 text-xl">{t('callout')}</p>

        <div className="flex flex-col gap-6">
          {AREAS.map(({ key, paragraphKeys, roles, rolesIntroKey }) => (
            <GenerateList key={key} title={t(`areas.${key}.title`)}>
              {paragraphKeys.map((paragraph) => (
                <p key={paragraph}>{t(`areas.${key}.paragraphs.${paragraph}`)}</p>
              ))}

              {rolesIntroKey && (
                <div>
                  <p>{t(`areas.${key}.${rolesIntroKey}`)}</p>

                  <ul className="list-disc list-inside">
                    {roles?.map((role) => (
                      <li key={role}>
                        <em>{t(`areas.${key}.roles.${role}.label`)}</em> {t(`areas.${key}.roles.${role}.description`)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </GenerateList>
          ))}
        </div>
      </div>

      <hr className="my-7 -mx-7 text-slate-300" />

      <p className="py-1">{t('closing')}</p>

      <p className="py-1">{t('contactCta')}</p>

      <ContactFormWrapper />
    </Section>
  );
}

function GenerateList({
  title,
  children,
}: {
  title: string;
  children: ReactNode | string;
}) {
  return (
    <div className="border-l-3 border-slate-200 pl-4">
      <h3 className="font-bold text-lg pb-3">{title}</h3>
      <div className="flex flex-col gap-3">{children} </div>
    </div>
  );
}
