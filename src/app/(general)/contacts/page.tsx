import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ContactForm } from './components/contact-form/contact-form';
import { Map } from './components/map/map';

export default function Contacts() {
  const t = useTranslations('contactspage');

  return (
    <div className="px-6 py-7">
      <h1 className="text-4xl font-bold text-center title my-6">
        {t('title')}
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex">
          <div className="flex-1/2">
            <ContactForm />
          </div>
           
           <div className="flex-1/2">
            <Map />
           </div>
        
        </div>
       

        <div>Постійних локацій немає</div>

        <div>
          <div>
            email:{' '}
            <a href="mailto: info@perilines.com.ua">info@perilines.com.ua</a>
          </div>
          <div>
            phone number: <a href="tel: +380973959022">+38(097) 39 59 022</a>
          </div>
        </div>

        <div>
          <div>telegram: <a href="https://t.me/perimeter_fund" target="_blank">@perimeter_fund</a></div>
          <div>instagram: <a href="https://instagram.com/perimeter.fund" target="_blank">@perimeter.fund</a></div>
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
