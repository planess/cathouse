import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const foundationYear = 2024;
  const org = 'Planess Group';

  return (
    <footer className="bg-neutral-800 text-neutral-100 text-sm px-3 lg:px-20 py-3 flex flex-wrap justify-end gap-x-2 gap-y-1 transition-[padding]">
      {/* <div>
        <Link href="location">Location</Link>
      </div> */}

      <div>
        <span>{t('tagline', { year: foundationYear })}</span>
        <span>{t('attribution', { org })}</span>
      </div>
    </footer>
  );
}
