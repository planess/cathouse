'use client';

import { handler } from '../../server/contact-form-handler';
import ContactForm from '../contact-form/contact-form';

export default function ContactFormWrapper() {
  return <ContactForm handler={handler} />;
}
