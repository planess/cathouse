'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type RedirectPlaceholderProps = {
  href: string;
};

export function RedirectPlaceholder({ href }: RedirectPlaceholderProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <div className="px-4 py-14 text-center text-base text-slate-600 sm:px-6 lg:px-8 lg:py-20 dark:text-slate-300">
      Loading...
    </div>
  );
}
