'use client';

import contactFormHandler from '../../server/contact-form-handler';
import ContactForm from '../contact-form/contact-form';

export default function ContactFormWrapper() {
  const e = async (data) => {
    const result = await contactFormHandler(data);

    console.log('-result', result);
  };
  return <ContactForm handler={e} />;
}
