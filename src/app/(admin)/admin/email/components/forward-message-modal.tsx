'use client';

import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';

import { useBodyScrollLock } from '@app/hooks/use-body-scroll-lock';
import type { EmailAddressSummary } from '@app/services/email.service';

import { inputClassName } from '../constants/input-class-name';
import { formatAddress } from '../helpers/format-address';
import { searchEmailContactsRequest } from '../helpers/search-email-contacts-request';

import { StatusMessage } from './status-message';

import type { SendEmailResponse } from '../types/send-email-response';

type ForwardMessageModalProps = {
  recipient: string;
  result: SendEmailResponse | null;
  sending: boolean;
  onClose: () => void;
  onRecipientChange: (recipient: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ForwardMessageModal({
  recipient,
  result,
  sending,
  onClose,
  onRecipientChange,
  onSubmit,
}: ForwardMessageModalProps) {
  const [recipientInput, setRecipientInput] = useState(recipient);
  const [suggestions, setSuggestions] = useState<EmailAddressSummary[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useBodyScrollLock();

  useEffect(() => {
    const query = recipientInput.trim();

    if (!isSearchActive || query.length === 0) {
      setSuggestions([]);

      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void searchEmailContactsRequest(query, controller.signal)
        .then((contacts) => {
          setSuggestions(contacts);
          setActiveSuggestionIndex(0);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setSuggestions([]);
          }
        });
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isSearchActive, recipientInput]);

  const selectContact = (contact: EmailAddressSummary) => {
    setRecipientInput(formatAddress(contact));
    onRecipientChange(contact.address);
    setIsSearchActive(false);
    setSuggestions([]);
  };
  const handleRecipientKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchActive || suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestionIndex(
        (currentIndex) => (currentIndex + 1) % suggestions.length,
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestionIndex(
        (currentIndex) =>
          (currentIndex - 1 + suggestions.length) % suggestions.length,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      selectContact(suggestions[activeSuggestionIndex]);
    } else if (event.key === 'Escape') {
      setIsSearchActive(false);
      setSuggestions([]);
    }
  };
  const handleRecipientBlur = () => {
    window.setTimeout(() => {
      setIsSearchActive(false);
      setSuggestions([]);
    }, 100);
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
    >
      <form
        autoComplete="off"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        data-1p-ignore="true"
        data-form-type="other"
        data-lpignore="true"
        onSubmit={(event) => void onSubmit(event)}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        >
          <input
            autoComplete="username"
            name="username"
            tabIndex={-1}
            type="text"
          />
          <input
            autoComplete="new-password"
            name="password"
            tabIndex={-1}
            type="password"
          />
        </div>

        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Forward message
          </h2>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

        <div className="space-y-4 px-6 py-5">
          <div className="relative">
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              htmlFor="forward-recipient"
            >
              Recipient
            </label>
            <input
              aria-autocomplete="list"
              aria-controls="forward-recipient-suggestions"
              aria-expanded={isSearchActive && suggestions.length > 0}
              autoFocus
              autoComplete="new-password"
              className={inputClassName}
              data-1p-ignore="true"
              data-form-type="other"
              data-lpignore="true"
              id="forward-recipient"
              inputMode="email"
              name="forward-recipient-query"
              onBlur={handleRecipientBlur}
              onChange={(event) => {
                const value = event.target.value;

                setRecipientInput(value);
                onRecipientChange(value);
                setIsSearchActive(true);
              }}
              onFocus={() => setIsSearchActive(true)}
              onKeyDown={handleRecipientKeyDown}
              pattern=".*[^\s@]+@[^\s@]+\.[^\s@]+.*"
              placeholder="Name or email address"
              required
              title="Enter an email address or select a contact"
              type="text"
              value={recipientInput}
            />
            {isSearchActive && suggestions.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                id="forward-recipient-suggestions"
                role="listbox"
              >
                {suggestions.map((contact, suggestionIndex) => (
                  <button
                    aria-selected={suggestionIndex === activeSuggestionIndex}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                      suggestionIndex === activeSuggestionIndex
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                    key={contact.id ?? contact.address}
                    onClick={() => selectContact(contact)}
                    onMouseDown={(event) => event.preventDefault()}
                    onPointerDown={(event) => event.preventDefault()}
                    role="option"
                    type="button"
                  >
                    {contact.name !== undefined && contact.name.length > 0 && (
                      <span className="block truncate font-semibold">
                        {contact.name}
                      </span>
                    )}
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {contact.address}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {result !== null && (
            <StatusMessage message={result.message} success={result.success} />
          )}
        </div>

        <footer className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={sending}
            type="submit"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </footer>
      </form>
    </div>
  );
}
