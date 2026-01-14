'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';

type SidebarLink = {
  key: string;
  href: string;
  label: string;
};

interface MobileSidebarProps {
  links: SidebarLink[];
  title: string;
  openLabel: string;
  closeLabel: string;
}

export default function MobileSidebar({ links, title, openLabel, closeLabel }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen]);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label={openLabel}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-900 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2"
        onClick={() => setIsOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      <div
        className={clsx(
          'fixed inset-0 z-40 bg-gray-900/40 transition-opacity duration-200',
          isOpen ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-0',
        )}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        id={panelId}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-white shadow-xl transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <span id={titleId} className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            {title}
          </span>
          <button
            type="button"
            aria-label={closeLabel}
            className="rounded-md p-2 text-gray-500 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2"
            onClick={closeSidebar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="block rounded-md px-2 py-2 text-base font-medium text-gray-900 transition hover:bg-gray-50"
                  onClick={closeSidebar}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
