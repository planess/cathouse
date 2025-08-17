import Link from 'next/link';
import { useTranslations } from 'next-intl';

import RegisterForm from './components/register-form/register-form';

export default function Signup() {
  const t = useTranslations('authorization');

  return (
    <div className="px-6 py-7">
      <h1 className="text-3xl text-center mb-5">Реєстрація</h1>

      <div className="mb-3">
        <div className="text-center mb-3 -mx-6 p-3 bg-amber-50 border border-amber-100 text-lime-900">
          Обрати напрям своєї участі можна у особистому кабінеті.
        </div>

        <div className="w-120 mx-auto">
          <RegisterForm />
        </div>
      </div>

      <div className="w-120 mx-auto flex justify-end mt-9">
        <Link className="text-sky-600 hover:underline" href="/signin">
          {t('already-have-account-link')}
        </Link>
      </div>
    </div>
  );
}
