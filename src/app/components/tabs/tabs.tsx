'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';

import { ComponentsTabsTabsIcon01 } from '@app/components/icons/components-tabs-tabs-icon-01';
import type { TabItem } from '@app/models/tab-item.model';

type TabsProps = {
  items: TabItem[];
  ariaLabel: string;
  className?: string;
  activeId?: string;
  defaultActiveId?: string;
  onActiveIdChange?: (id: string) => void;
};

export function Tabs({
  items,
  ariaLabel,
  className,
  activeId,
  defaultActiveId,
  onActiveIdChange,
}: TabsProps) {
  const firstItemId = items[0]?.id ?? '';
  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId ?? firstItemId,
  );
  const selectedId = activeId ?? internalActiveId;
  const activeItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [selectedId, items],
  );

  const handleActiveIdChange = (id: string) => {
    setInternalActiveId(id);
    onActiveIdChange?.(id);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={clsx(className)}>
      <div
        aria-label={ariaLabel}
        className="flex gap-3 overflow-x-auto border-b border-slate-200 dark:border-slate-800"
        role="tablist"
      >
        {items.map((item) => {
          const isActive = item.id === activeItem?.id;
          const tabPanelId = `${item.id}-panel`;
          const tabId = `${item.id}-tab`;

          return (
            <button
              aria-controls={tabPanelId}
              aria-selected={isActive}
              className={clsx(
                'flex shrink-0 items-center gap-2 border-b-2 px-6 py-4 text-sm font-semibold transition',
                isActive
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-200'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-emerald-200',
              )}
              id={tabId}
              key={item.id}
              onClick={() => handleActiveIdChange(item.id)}
              role="tab"
              type="button"
            >
              {item.id !== 'create-mailbox' && (
                <ComponentsTabsTabsIcon01
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                />
              )}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`${activeItem.id}-tab`}
        className="min-h-48"
        id={`${activeItem.id}-panel`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeItem.content}
      </div>
    </div>
  );
}
