import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

import './globals.css';

import { ModalProvider } from './providers/modal';
import { UserProvider } from './providers/user';

import type { Metadata, Viewport } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'layout' });

  return {
    title: t('title'),
    description: t('description'),
    robots: 'noindex, nofollow',
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // minimumScale: 1,
  // maximumScale: 5,
  // userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <UserProvider>
            <ModalProvider>
              <main className="bg-[#f6f8f6] dark:bg-stone-800 text-slate-900 dark:text-stone-50 transition-colors">
                {children}
              </main>
            </ModalProvider>
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
