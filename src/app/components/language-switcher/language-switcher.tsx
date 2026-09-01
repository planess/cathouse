'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ComponentsLanguageSwitcherLanguageSwitcherIcon01 } from '@app/components/icons/components-language-switcher-language-switcher-icon-01';
import { GlobeIcon } from '@app/components/icons/registry-animal-g-lo-be-ic-on';

const LOCALES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'uk', label: 'Українська', short: 'UA' },
];

const COOKIE_NAME = 'test-locale-cookie';

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  const handleSelect = (localeCode: string) => {
    // Set cookie
    document.cookie = `${COOKIE_NAME}=${localeCode}; path=/; max-age=${
      60 * 60 * 24 * 30
    }; SameSite=Lax`;
    setIsOpen(false);
    router.refresh();
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative text-sm text-neutral-300" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:text-white transition-colors uppercase font-medium"
      >
        <span className="flex-none basis-4">
          <GlobeIcon />
        </span>
        {selected.short}
        <span className="flex-none basis-4">
          <ComponentsLanguageSwitcherLanguageSwitcherIcon01
            className={clsx('w-4 h-4 transition-transform duration-200', {
              'rotate-180': isOpen,
            })}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-32 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-100">
          {LOCALES.map((locale) => (
            <button
              key={locale.code}
              onClick={() => handleSelect(locale.code)}
              className={clsx(
                'w-full text-left px-4 py-2 hover:bg-neutral-700 transition-colors',
                {
                  'text-white font-medium bg-neutral-700/50':
                    currentLocale === locale.code,
                  'text-neutral-300': currentLocale !== locale.code,
                },
              )}
            >
              {locale.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
