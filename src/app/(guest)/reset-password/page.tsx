import { getTranslations } from 'next-intl/server';

import clientPromise from '@app/ins/mongo-client';

import AuthFormWrapper from './components/auth-form-wrapper';
import RestoreForm from './components/restore-form';
import { sendRestoreEmail } from './server/send-restore-email';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const code = (await searchParams).code as string ?? null;

  const t = await getTranslations('authorization');

  let form;

  if (code !== null) {
    const dbClient = await clientPromise;
    const db = dbClient.db();
    const collection = db.collection('users-restore-passwords');
    const codeExists = await collection.findOne({ code });

    if (codeExists === null) {
      form = <div>Невірний код відновлення</div>;
    } else {
      const indexes = await collection.indexes();
      const indexTemp = indexes.find(
        (idx) =>
          (idx.name?.startsWith('createdAt') ?? false) &&
          Number.isInteger(idx.expireAfterSeconds),
      );
      const expSec = indexTemp?.expireAfterSeconds;

      let expiresIn = null;

      if (expSec !== undefined) {
        expiresIn = new Date(codeExists.createdAt);
        expiresIn.setTime(expiresIn.getTime() + expSec * 1000);
      }

      form = <RestoreForm expiresIn={expiresIn} code={code} />;
    }
  } else {
    form = <AuthFormWrapper handler={sendRestoreEmail} />;
  }

  return (
    <div className="px-6 py-7">
      <h1 className="text-3xl text-center mb-5">{t('title.reset-password')}</h1>

      <div className="w-120 mx-auto">{form}</div>
    </div>
  );
}
