import React from 'react';

import { InfoIcon } from '@app/(general)/history/[animalId]/components/icons';

interface AlertProps {
  text: React.ReactNode | string;
}

export default function Alert({ text }: AlertProps) {
  return (
    <div className="bg-blue-50 dark:bg-gray-700 border border-blue-100 dark:border-stone-600 rounded-lg p-3 text-sm text-gray-700 dark:text-neutral-300 flex gap-3 items-start transition-colors">
      <span className="text-[#00a6f4] basis-6 flex-none">
        <InfoIcon />
      </span>

      <p>{text}</p>
    </div>
  );
}
