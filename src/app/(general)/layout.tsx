import Footer from '../components/footer/footer';
import Header from '../components/header/header';

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-none sticky top-0 z-1">
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
