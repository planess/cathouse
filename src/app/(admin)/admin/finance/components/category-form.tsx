import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CategoryOption } from '../models/category-option';

export default function CategoryForm({
  options,
  onChange,
}: {
  options: CategoryOption[];
  onChange: (state: { name: string; inheritsId: string }) => void;
}) {
  const t = useTranslations('adminFinance');
  const [formState, setFormState] = useState({ name: '', inheritsId: '' });

  const updateState = (nextState: { name: string; inheritsId: string }) => {
    setFormState(nextState);
    onChange(nextState);
  };

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          {t('categories.nameLabel')}
        </label>
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          value={formState.name}
          onChange={(event) =>
            updateState({ ...formState, name: event.target.value })
          }
          type="text"
          placeholder={t('categories.namePlaceholder')}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          {t('categories.parentLabel')}
        </label>
        <select
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          value={formState.inheritsId}
          onChange={(event) =>
            updateState({ ...formState, inheritsId: event.target.value })
          }
        >
          <option value="">{t('categories.parentPlaceholder')}</option>
          {options.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
