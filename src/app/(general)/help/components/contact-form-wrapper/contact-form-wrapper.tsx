'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { useGDPRConsent } from '@app/components/gdpr-consent';

import { handler } from '../../server/contact-form-handler';
import ContactForm from '../contact-form/contact-form';

export default function ContactFormWrapper() {
  const requestConsent = useGDPRConsent();
  const t = useTranslations('helppage.modal');

  const wrappedHandler = useCallback(
    async (...args: Parameters<typeof handler>) => {
      try {
        const consent = await requestConsent({
          content: t.rich('gdpr', {
            paragraph: (chunks) => <p className="mb-3">{chunks}</p>,
          }),
          claim: t('checkboxLabel'),
        });

        return consent ? handler(...args) : ({ status: 'declined' } as const);
      } catch {
        return { status: 'error' } as const;
      }
    },
    [requestConsent, t],
  );

  return <ContactForm handler={wrappedHandler} />;
}
