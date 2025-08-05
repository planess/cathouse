'use client';

import { ContactFormData } from '../../models/contact-form-data';
import contactFormHandler from '../../server/contact-form-handler';
import ContactForm from '../contact-form/contact-form';

const handler = (data: ContactFormData) => contactFormHandler(data);

export default function ContactFormWrapper() {
  return <ContactForm handler={handler} />;
}
