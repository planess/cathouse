import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import clientPromise from '@app/ins/mongo-client';

import AuthFormWrapper from './components/auth-form-wrapper';
import RestoreForm from './components/restore-form';
import { sendRestoreEmail } from './server/send-restore-email';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const code = ((await searchParams).code as string) ?? null;

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

      if (expSec !== undefined) {
        const expiresIn = new Date(codeExists.createdAt);
        expiresIn.setTime(expiresIn.getTime() + expSec * 1000);

        form = <RestoreForm expiresIn={expiresIn} code={code} />;
      } else {
        redirect('/reset-password');
      }
    }
  } else {
    form = <AuthFormWrapper handler={sendRestoreEmail} />;
  }

  return (
    <div className="px-6 py-7">
      <h1 className="text-3xl text-center mb-5">{t('title.reset-password')}</h1>

      <div className="lg:w-120 mx-auto">{form}</div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('authorization'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title.reset-password'), siteTitle),
  };
}
