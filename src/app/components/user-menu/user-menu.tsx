'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { ComponentsLanguageSwitcherLanguageSwitcherIcon01 } from '@app/components/icons/components-language-switcher-language-switcher-icon-01';
import { clearBrowserAuthData } from '@app/helpers/clear-browser-auth-data';
import { triggerAuthChange } from '@app/hooks/authorization-event-target';
import type { UserMenuProps } from '@app/models/user-menu-props.model';

const itemClassName =
  'block w-full text-left px-4 py-2 hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-wait';

/**
 * Footer dropdown for an authenticated user with profile, admin, and logout actions.
 *
 * @param props - Component props.
 * @param props.email - Email shown as the menu trigger.
 * @param props.canAccessAdmin - Whether the admin panel link is shown.
 */
export function UserMenu({ email, canAccessAdmin }: UserMenuProps) {
  const t = useTranslations('footer.userMenu');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    setIsPending(true);

    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' });

      if (!response.ok) {
        throw new Error('Sign out failed');
      }

      clearBrowserAuthData();
      setIsOpen(false);
      triggerAuthChange();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:text-white transition-colors"
      >
        {email}
        <ComponentsLanguageSwitcherLanguageSwitcherIcon01
          className={clsx('w-4 h-4 transition-transform duration-200', {
            'rotate-180': isOpen,
          })}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-0 mb-2 min-w-40 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-100"
        >
          <Link
            href="/profile"
            role="menuitem"
            className={itemClassName}
            onClick={() => setIsOpen(false)}
          >
            {t('profile')}
          </Link>
          {canAccessAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              className={itemClassName}
              onClick={() => setIsOpen(false)}
            >
              {t('admin')}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            onClick={() => void handleLogout()}
            className={clsx(itemClassName, 'border-t border-neutral-700')}
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
