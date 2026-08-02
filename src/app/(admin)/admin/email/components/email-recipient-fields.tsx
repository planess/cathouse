import { emptyRecipient } from '../constants/empty-recipient';
import { inputClassName } from '../constants/input-class-name';

import type { RecipientFormValue } from '../types/recipient-form-value';

type RecipientFieldsProps = {
  id: string;
  label: string;
  recipients: RecipientFormValue[];
  required?: boolean;
  onChange: (recipients: RecipientFormValue[]) => void;
};

export function RecipientFields({
  id,
  label,
  recipients,
  required = false,
  onChange,
}: RecipientFieldsProps) {
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
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_2.5rem] gap-2"
            key={`${id}-${index}`}
          >
            <input
              aria-label={`${label} recipient name ${index + 1}`}
              autoComplete="name"
              className={inputClassName}
              onChange={(event) =>
                updateRecipient(index, 'name', event.target.value)
              }
              placeholder="Name (optional)"
              type="text"
              value={recipient.name}
            />
            <input
              aria-label={`${label} recipient email ${index + 1}`}
              autoComplete="email"
              className={inputClassName}
              onChange={(event) =>
                updateRecipient(index, 'email', event.target.value)
              }
              placeholder="Email address"
              required={emailRequired}
              type="email"
              value={recipient.email}
            />
            {index === recipients.length - 1 ? (
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
          </div>
        );
      })}
    </fieldset>
  );
}
