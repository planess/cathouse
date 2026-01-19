import { ReactNode } from 'react';

interface Props {
  title?: string;
  children: ReactNode;
}

export default function Section({ title, children }: Props) {
  return (
    <div className="bg-stone-50 dark:bg-gray-700 dark:border-gray-500 dark:border rounded-md p-6 shadow-md">
      {Boolean(title) && (
        <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-slate-200">
          {title}
        </h2>
      )}
      <div>{children}</div>
    </div>
  );
}
