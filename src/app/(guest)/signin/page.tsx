import Link from 'next/link';
import { useTranslations } from 'next-intl';

import AuthForm from './components/auth-form/auth-form';

export default function Signin() {
  const t = useTranslations('authorization');

  return (
    <div className="px-6 py-7">
      <h1 className="text-3xl text-center mb-5">Авторизація</h1>

      <div className="mb-3">
        <div className="w-120 mx-auto">
          <AuthForm />
        </div>
      </div>

      <div className="w-120 mx-auto flex justify-end mt-9">
        <Link className="text-sky-600 hover:underline" href="/signup">
          {t('want-account-link')}
        </Link>
      </div>
    </div>
  );
}
