import { requireUser } from '@app/services/require-user';

import Footer from '../components/footer/footer';
import Header from '../components/header/header';

import PersonalSidebar from './components/personal-sidebar/personal-sidebar';

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
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-10">
          <aside className="md:w-56 md:flex-none">
            <PersonalSidebar />
          </aside>
          <div className="min-w-0 flex-auto">{children}</div>
        </div>
      </main>

      <div className="flex-none">
        <Footer />
      </div>
    </div>
  );
}
