import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CategoryNode } from '../models/category-node';

import IncomingParentTreeSelect from './incoming-parent-tree-select';

type OutgoingCategoryFormState = {
  name: string;
  inheritsId: string;
  linkedToId: string;
  active: boolean;
};

export default function OutgoingCategoryForm({
  outgoingCategories,
  incomingCategories,
  onChange,
  initialState,
  allowActiveEdit,
}: {
  outgoingCategories: CategoryNode[];
  incomingCategories: CategoryNode[];
  onChange: (state: OutgoingCategoryFormState) => void;
  initialState?: OutgoingCategoryFormState;
  allowActiveEdit: boolean;
}) {
  const t = useTranslations('adminFinance');
  const [formState, setFormState] = useState<OutgoingCategoryFormState>(
    initialState ?? {
      name: '',
      inheritsId: '',
      linkedToId: '',
      active: true,
    },
  );

  const updateState = (nextState: OutgoingCategoryFormState) => {
    setFormState(nextState);
    onChange(nextState);
  };

  return (
    <form className="flex flex-col gap-4 lg:flex-row">
      <div className="space-y-4 flex-1">
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
          <IncomingParentTreeSelect
            categories={outgoingCategories}
            selectedParentId={formState.inheritsId}
            disabled={false}
            emptyLabel={t('categories.parentPlaceholder')}
            onSelect={(parentId: string) =>
              updateState({ ...formState, inheritsId: parentId })
            }
          />
        </div>
      </div>
      <div className="space-y-4 flex-1">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <p className="text-xs font-semibold text-slate-700">
                {t('categories.activeLabel')}
              </p>
              <p className="text-[11px] text-slate-500">
                {t('categories.activeHint')}
              </p>
            </span>
            <input
              className="h-4 w-4"
              type="checkbox"
              checked={formState.active}
              disabled={!allowActiveEdit}
              onChange={(event) =>
                updateState({ ...formState, active: event.target.checked })
              }
            />
          </label>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">
            {t('categories.linkedToLabel')}
          </label>
          <IncomingParentTreeSelect
            categories={incomingCategories}
            selectedParentId={formState.linkedToId}
            disabled={false}
            emptyLabel={t('categories.linkedToPlaceholder')}
            onSelect={(linkedToId: string) =>
              updateState({ ...formState, linkedToId })
            }
          />
        </div>
      </div>
    </form>
  );
}
