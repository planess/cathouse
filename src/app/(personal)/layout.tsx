import { requireUser } from '@app/services/require-user';

import Footer from '../components/footer/footer';
import Header from '../components/header/header';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PersonalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Personal pages are only for visitors with a session
  await requireUser();

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-none sticky top-0 z-2">
        <Header />
      </div>

      <main className="flex-auto bg-[#f6f8f6] dark:bg-stone-800 text-slate-900 dark:text-stone-50 transition-colors">
        {children}
      </main>

      <div className="flex-none">
        <Footer />
      </div>
    </div>
  );
}
