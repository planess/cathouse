import React from 'react';

import { InfoIcon } from '@app/(general)/history/[animalId]/components/icons';

interface AlertProps {
  text: React.ReactNode | string;
}

export default async function Alert({ text }: AlertProps) {
  // render svg
  // render svg nativelly
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 flex gap-3 items-start">
      <span className="text-[#00a6f4] basis-[24px] flex-none">
        <InfoIcon />
      </span>

      <p>{text}</p>
    </div>
  );
}
