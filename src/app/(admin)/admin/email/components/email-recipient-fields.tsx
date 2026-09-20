import { KeyboardEvent, useEffect, useState } from 'react';

import type { EmailAddressSummary } from '@app/services/email.service';

import { emptyRecipient } from '../constants/empty-recipient';
import { inputClassName } from '../constants/input-class-name';
import { searchEmailContactsRequest } from '../helpers/search-email-contacts-request';

import type { RecipientFormValue } from '../types/recipient-form-value';

type RecipientFieldsProps = {
  id: string;
  label: string;
  recipients: RecipientFormValue[];
  required?: boolean;
  onChange: (recipients: RecipientFormValue[]) => void;
};

type ActiveContactSearch = {
  field: keyof RecipientFormValue;
  index: number;
  query: string;
};

export function RecipientFields({
  id,
  label,
  recipients,
  required = false,
  onChange,
}: RecipientFieldsProps) {
  const [activeSearch, setActiveSearch] = useState<ActiveContactSearch | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<EmailAddressSummary[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  useEffect(() => {
    const query = activeSearch?.query.trim() ?? '';

    if (query.length === 0) {
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
  }, [activeSearch]);

  const updateRecipient = (
    index: number,
    field: keyof RecipientFormValue,
    value: string,
  ) => {
    onChange(
      recipients.map((recipient, recipientIndex) =>
        recipientIndex === index ? { ...recipient, [field]: value } : recipient,
      ),
    );
  };
  const updateRecipientSearch = (
    index: number,
    field: keyof RecipientFormValue,
    value: string,
  ) => {
    updateRecipient(index, field, value);
    setActiveSearch({ field, index, query: value });
  };
  const selectContact = (index: number, contact: EmailAddressSummary) => {
    onChange(
      recipients.map((recipient, recipientIndex) =>
        recipientIndex === index
          ? { name: contact.name ?? '', email: contact.address }
          : recipient,
      ),
    );
    setActiveSearch(null);
    setSuggestions([]);
  };
  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (suggestions.length === 0 || activeSearch?.index !== index) {
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
      selectContact(index, suggestions[activeSuggestionIndex]);
    } else if (event.key === 'Escape') {
      setActiveSearch(null);
      setSuggestions([]);
    }
  };
  const handleSearchBlur = () => {
    window.setTimeout(() => {
      setActiveSearch(null);
      setSuggestions([]);
    }, 100);
  };
  const addRecipient = () => {
    onChange([...recipients, { ...emptyRecipient }]);
  };
  const removeRecipient = (index: number) => {
    onChange(
      recipients.filter(
        (_recipient, recipientIndex) => recipientIndex !== index,
      ),
    );
  };

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </legend>

      {recipients.map((recipient, index) => {
        const emailRequired = required || recipient.name.trim().length > 0;

        return (
          <div
            className="relative grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_2.5rem] gap-2"
            key={`${id}-${index}`}
          >
            <input
              aria-label={`${label} recipient name ${index + 1}`}
              aria-autocomplete="list"
              autoComplete="new-password"
              className={inputClassName}
              data-1p-ignore="true"
              data-form-type="other"
              data-lpignore="true"
              name={`${id}-${index}-contact-name`}
              onBlur={handleSearchBlur}
              onChange={(event) =>
                updateRecipientSearch(index, 'name', event.target.value)
              }
              onFocus={() =>
                setActiveSearch({ field: 'name', index, query: recipient.name })
              }
              onKeyDown={(event) => handleSearchKeyDown(event, index)}
              placeholder="Name (optional)"
              type="text"
              value={recipient.name}
            />
            <input
              aria-label={`${label} recipient email ${index + 1}`}
              aria-autocomplete="list"
              autoComplete="new-password"
              className={inputClassName}
              data-1p-ignore="true"
              data-form-type="other"
              data-lpignore="true"
              inputMode="email"
              name={`${id}-${index}-contact-address`}
              onBlur={handleSearchBlur}
              onChange={(event) =>
                updateRecipientSearch(index, 'email', event.target.value)
              }
              onFocus={() =>
                setActiveSearch({
                  field: 'email',
                  index,
                  query: recipient.email,
                })
              }
              onKeyDown={(event) => handleSearchKeyDown(event, index)}
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              placeholder="Email address"
              required={emailRequired}
              title="Enter a valid email address"
              type="text"
              value={recipient.email}
            />
            {index === 0 ? (
              <button
                aria-label={`Add another ${label} recipient`}
                className="rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                onClick={addRecipient}
                type="button"
              >
                +
              </button>
            ) : (
              <button
                aria-label={`Remove ${label} recipient ${index + 1}`}
                className="rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                onClick={() => removeRecipient(index)}
                type="button"
              >
                −
              </button>
            )}
            {activeSearch?.index === index && suggestions.length > 0 && (
              <div
                className="absolute left-0 right-12 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
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
                    onMouseDown={(event) => event.preventDefault()}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => selectContact(index, contact)}
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
        );
      })}
    </fieldset>
  );
}
